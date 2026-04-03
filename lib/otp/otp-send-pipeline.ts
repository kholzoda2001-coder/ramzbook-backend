/**
 * Shared entry: validate identifier, cooldown, generate + hash OTP, persist, dispatch via adapters.
 */

import type { PrismaClient } from '@prisma/client';
import {
  cooldownRemainingSeconds,
  generateOtp,
  hashOtp,
  invalidateOpenChallenges,
  isValidEmail,
  isValidPhone,
  normalizeIdentifier,
  storeOtpChallenge,
  type OtpChannel,
} from '@/lib/otp/otp-core';
import { loadAuthProvidersConfig } from '@/lib/otp/auth-provider-settings';
import { deliverEmailOtp } from '@/lib/providers/email-delivery-router';
import { deliverPhoneOtp } from '@/lib/providers/phone-delivery-router';

export type SendOtpResult =
  | { ok: true }
  | { ok: false; status: number; error: string; retryAfterSec?: number };

export async function runSendOtpPipeline(
  prisma: PrismaClient,
  params: { rawIdentifier: string; type: 'email' | 'phone' },
): Promise<SendOtpResult> {
  const channel: OtpChannel = params.type === 'phone' ? 'phone' : 'email';
  const identifier = normalizeIdentifier(channel, params.rawIdentifier);

  if (channel === 'email' && !isValidEmail(identifier)) {
    return { ok: false, status: 400, error: 'Почтаи электронии дуруст ворид кунед.' };
  }
  if (channel === 'phone' && !isValidPhone(identifier)) {
    return { ok: false, status: 400, error: 'Рақами телефони дуруст ворид кунед.' };
  }

  const wait = await cooldownRemainingSeconds(prisma, identifier);
  if (wait > 0) {
    return {
      ok: false,
      status: 429,
      error: 'Лутфан пас аз чанд сония такрор кунед.',
      retryAfterSec: wait,
    };
  }

  await invalidateOpenChallenges(prisma, identifier);
  const plain = generateOtp();
  const otpHash = hashOtp(plain);
  await storeOtpChallenge(prisma, { identifier, channel, otpHash });

  const cfg = await loadAuthProvidersConfig(prisma);

  if (channel === 'email') {
    await deliverEmailOtp({ cfg, identifier, otp: plain });
  } else {
    await deliverPhoneOtp({ cfg, identifier, otp: plain });
  }

  return { ok: true };
}
