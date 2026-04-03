/**
 * Facade for OTP + provider delivery (single import surface for routes and jobs).
 *
 * Core hashing / cooldown / attempts live in `otp-core.ts` and `otp-send-pipeline.ts`.
 */

import type { PrismaClient } from '@prisma/client';
import {
  loadAuthProvidersConfig,
  type AuthProvidersConfig,
  type EmailOtpProviderId,
  type PhoneOtpProviderId,
} from '@/lib/otp/auth-provider-settings';
import { verifyOtpInDb, type VerifyOtpDbResult } from '@/lib/otp/otp-core';
import { runSendOtpPipeline, type SendOtpResult } from '@/lib/otp/otp-send-pipeline';
import { runVerifyOtpSession, type VerifyOtpSessionResult } from '@/lib/otp/otp-verify-session';
import { deliverEmailOtp } from '@/lib/providers/email-delivery-router';
import { deliverPhoneOtp } from '@/lib/providers/phone-delivery-router';

export type { SendOtpResult, VerifyOtpSessionResult, VerifyOtpDbResult };

export async function getOtpSettings(prisma: PrismaClient): Promise<AuthProvidersConfig> {
  return loadAuthProvidersConfig(prisma);
}

export async function getActiveEmailProvider(
  prisma: PrismaClient,
): Promise<EmailOtpProviderId> {
  return (await loadAuthProvidersConfig(prisma)).activeEmailProvider;
}

export async function getActivePhoneProvider(
  prisma: PrismaClient,
): Promise<PhoneOtpProviderId> {
  return (await loadAuthProvidersConfig(prisma)).activePhoneProvider;
}

/** Send email OTP using the configured active email provider (already-generated plain code). */
export async function sendEmailOtp(
  prisma: PrismaClient,
  identifier: string,
  plainOtp: string,
): Promise<void> {
  const cfg = await loadAuthProvidersConfig(prisma);
  await deliverEmailOtp({ cfg, identifier, otp: plainOtp });
}

/** Send phone/SMS OTP using the configured active phone provider. */
export async function sendPhoneOtp(
  prisma: PrismaClient,
  identifier: string,
  plainOtp: string,
): Promise<void> {
  const cfg = await loadAuthProvidersConfig(prisma);
  await deliverPhoneOtp({ cfg, identifier, otp: plainOtp });
}

/**
 * Verify a 6-digit code against the latest active challenge (updates attempt count).
 * For full login + JWT, use `verifyOtpAndCreateSession`.
 */
export async function verifyOtp(
  prisma: PrismaClient,
  identifier: string,
  plainCode: string,
): Promise<VerifyOtpDbResult> {
  return verifyOtpInDb(prisma, identifier, plainCode);
}

/** Request path: validate, cooldown, hash, store, dispatch. */
export const sendOtpRequestPipeline = runSendOtpPipeline;

/** Verify path: hash check, user upsert, JWT + refresh. */
export const verifyOtpAndCreateSession = runVerifyOtpSession;
