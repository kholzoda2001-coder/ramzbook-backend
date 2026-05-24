/**
 * After OTP hash verification succeeds: ensure user exists, issue JWT + refresh.
 */

import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { PrismaClient } from '@prisma/client';
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessTokenForUser,
} from '@/lib/auth';
import { verifyOtpInDb, normalizeIdentifier, type OtpChannel } from '@/lib/otp/otp-core';

const REFRESH_TTL_DAYS = 30;

export type VerifyOtpSessionResult =
  | {
      ok: true;
      accessToken: string;
      refreshToken: string;
      user: { id: string; name: string; email: string; phone: string | null };
      isNewUser: boolean;
    }
  | { ok: false; status: number; error: string };

export async function runVerifyOtpSession(
  prisma: PrismaClient,
  params: { rawIdentifier: string; type: 'email' | 'phone'; code: string },
): Promise<VerifyOtpSessionResult> {
  const channel: OtpChannel = params.type === 'phone' ? 'phone' : 'email';
  const identifier = normalizeIdentifier(channel, params.rawIdentifier);
  const code = params.code.trim();

  if (!code || code.length !== 6) {
    return { ok: false, status: 400, error: 'Коди 6-рақама лозим аст.' };
  }

  const v = await verifyOtpInDb(prisma, identifier, code);
  if (!v.ok) {
    if (v.reason === 'too_many_attempts') {
      return { ok: false, status: 429, error: 'Такрори зиёд. Коди нав дархост кунед.' };
    }
    return { ok: false, status: 401, error: 'Коди нодуруст ё мӯҳлаташ гузашт.' };
  }

  let isNewUser = false;
  let user =
    channel === 'email'
      ? await prisma.user.findUnique({ where: { email: identifier } })
      : await prisma.user.findFirst({
          where: {
            OR: [{ phone: identifier }, { email: syntheticEmailForPhone(identifier) }],
          },
        });

  if (!user) {
    isNewUser = true;
    const passwordHash = await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10);
    if (channel === 'email') {
      user = await prisma.user.create({
        data: {
          email: identifier,
          name: identifier.split('@')[0] ?? 'User',
          passwordHash,
          isActive: true,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email: syntheticEmailForPhone(identifier),
          phone: identifier,
          name: identifier,
          passwordHash,
          isActive: true,
        },
      });
    }
  }

  const accessToken = signAccessTokenForUser(user.id);
  const rawRefresh = generateRefreshToken();
  const hashedRefresh = hashRefreshToken(rawRefresh);
  const refreshExpires = new Date(Date.now() + REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashedRefresh,
      expiresAt: refreshExpires,
    },
  });

  return {
    ok: true,
    accessToken,
    refreshToken: rawRefresh,
    user: {
      id: user.id,
      name: user.name,
      email: user.email ?? '',
      phone: user.phone,
    },
    isNewUser,
  };
}

function syntheticEmailForPhone(normalizedPhone: string): string {
  const slug = normalizedPhone.replace(/[^\d+]/g, '').replace(/\+/g, 'p');
  return `phone_${slug}@internal.ramzbook.tj`;
}
