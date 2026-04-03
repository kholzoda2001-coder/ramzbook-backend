/**
 * Shared OTP business logic — single place for generation, hashing, storage rules,
 * expiry, cooldown, and verification attempts.
 *
 * Security: never log raw OTP codes or the pepper. Hash before persistence.
 */

import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60 * 1000;
const SEND_COOLDOWN_MS = 60 * 1000;
const MAX_VERIFY_ATTEMPTS = 5;

function getOtpPepper(): string {
  const p = process.env.OTP_PEPPER;
  if (p && p.length >= 16) return p;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('OTP_PEPPER must be set (min 16 chars) in production');
  }
  // Dev-only fallback — replace in .env for staging that mirrors prod.
  return 'dev-otp-pepper-min16chars!';
}

/** Generate a 6-digit numeric OTP string. */
export function generateOtp(): string {
  return String(Math.floor(10 ** (OTP_LENGTH - 1) + Math.random() * 9 * 10 ** (OTP_LENGTH - 1)));
}

/** HMAC-SHA256 hex digest of the OTP (constant-time compare in verify). */
export function hashOtp(plain: string): string {
  return crypto.createHmac('sha256', getOtpPepper()).update(plain).digest('hex');
}

export function verifyOtpAgainstHash(plain: string, storedHash: string): boolean {
  const a = hashOtp(plain);
  try {
    return crypto.timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

export type OtpChannel = 'email' | 'phone';

export function normalizeIdentifier(channel: OtpChannel, raw: string): string {
  const t = raw.trim();
  if (channel === 'email') return t.toLowerCase();
  const digits = t.replace(/[^\d+]/g, '');
  if (digits.startsWith('+')) return digits;
  return `+${digits.replace(/^\+/, '')}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(normalized: string): boolean {
  const d = normalized.replace(/\D/g, '');
  return d.length >= 8 && d.length <= 15;
}

/** Seconds until a new OTP may be sent for this identifier. 0 = allowed. */
export async function cooldownRemainingSeconds(
  prisma: PrismaClient,
  identifier: string,
): Promise<number> {
  const last = await prisma.otpCode.findFirst({
    where: { identifier },
    orderBy: { createdAt: 'desc' },
    select: { createdAt: true },
  });
  if (!last) return 0;
  const elapsed = Date.now() - last.createdAt.getTime();
  const left = SEND_COOLDOWN_MS - elapsed;
  return left > 0 ? Math.ceil(left / 1000) : 0;
}

/** Invalidate outstanding challenges for this identifier. */
export async function invalidateOpenChallenges(
  prisma: PrismaClient,
  identifier: string,
): Promise<void> {
  await prisma.otpCode.updateMany({
    where: { identifier, used: false },
    data: { used: true },
  });
}

/** Persist a new challenge (plain OTP is NOT stored — only hash). */
export async function storeOtpChallenge(
  prisma: PrismaClient,
  params: { identifier: string; channel: OtpChannel; otpHash: string },
): Promise<void> {
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);
  await prisma.otpCode.create({
    data: {
      identifier: params.identifier,
      channel: params.channel,
      otpHash: params.otpHash,
      expiresAt,
      used: false,
      verifyAttempts: 0,
    },
  });
}

export type VerifyOtpDbResult =
  | { ok: true; recordId: string }
  | { ok: false; reason: 'not_found' | 'expired' | 'too_many_attempts' | 'mismatch' };

/**
 * Verify OTP against the latest unused non-expired row; enforce attempt limit.
 * On mismatch, increments verifyAttempts (does not log the code).
 */
export async function verifyOtpInDb(
  prisma: PrismaClient,
  identifier: string,
  plainCode: string,
): Promise<VerifyOtpDbResult> {
  const record = await prisma.otpCode.findFirst({
    where: {
      identifier,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!record) {
    return { ok: false, reason: 'not_found' };
  }

  if (record.verifyAttempts >= MAX_VERIFY_ATTEMPTS) {
    return { ok: false, reason: 'too_many_attempts' };
  }

  if (!verifyOtpAgainstHash(plainCode, record.otpHash)) {
    await prisma.otpCode.update({
      where: { id: record.id },
      data: { verifyAttempts: { increment: 1 } },
    });
    return { ok: false, reason: 'mismatch' };
  }

  await prisma.otpCode.update({
    where: { id: record.id },
    data: { used: true },
  });

  return { ok: true, recordId: record.id };
}

export { OTP_TTL_MS, SEND_COOLDOWN_MS, MAX_VERIFY_ATTEMPTS };
