/**
 * Twilio SMS adapter (programmatic OTP body).
 *
 * Optional Verify API: `startTwilioVerifyOnly` can be used by a future dedicated
 * flow — it does NOT share state with the hashed OTP pipeline (Twilio issues its own code).
 * Keep `useVerifyApi=false` until `/api/mobile/auth/otp/verify-twilio` is implemented.
 */

import twilio from 'twilio';
import type { TwilioSmsConfig } from '@/lib/providers/twilio-types';
import { deliverOtpMock } from '@/lib/providers/mock-otp-delivery';

function isConfigured(cfg: TwilioSmsConfig): boolean {
  return Boolean(cfg.accountSid && cfg.authToken);
}

/** LIVE: starts a Twilio Verify SMS — separate from Ramz hashed OTP. TODO: wire verify-check route. */
export async function startTwilioVerifyOnly(cfg: TwilioSmsConfig, toE164: string): Promise<void> {
  if (!isConfigured(cfg) || !cfg.verifyServiceSid) {
    await deliverOtpMock({ channel: 'phone', identifier: toE164, otp: '------' });
    return;
  }
  const client = twilio(cfg.accountSid, cfg.authToken);
  await client.verify.v2.services(cfg.verifyServiceSid).verifications.create({
    to: toE164,
    channel: 'sms',
  });
}

export async function sendOtpViaTwilio(params: {
  cfg: TwilioSmsConfig;
  toE164: string;
  otp: string;
}): Promise<void> {
  if (!isConfigured(params.cfg)) {
    await deliverOtpMock({ channel: 'phone', identifier: params.toE164, otp: params.otp });
    return;
  }

  if (params.cfg.useVerifyApi && params.cfg.verifyServiceSid) {
    // LIVE INTEGRATION POINT: Twilio Verify uses its own OTP — do not mix with Ramz hash store.
    // For now, fall through to standard SMS with our OTP so verify-otp route keeps working.
    console.warn(
      '[Twilio] useVerifyApi=true but unified verify expects Ramz-hashed OTP; sending body SMS instead. ' +
        'Implement /api/mobile/auth/otp/verify-twilio for full Verify mode.',
    );
  }

  try {
    const client = twilio(params.cfg.accountSid, params.cfg.authToken);
    const body = `RamzBook: коди тасдиқи шумо ${params.otp}. 5 дақиқа эътибор дорад.`;

    if (params.cfg.messagingServiceSid) {
      await client.messages.create({
        messagingServiceSid: params.cfg.messagingServiceSid,
        to: params.toE164,
        body,
      });
    } else if (params.cfg.fromNumber) {
      await client.messages.create({
        from: params.cfg.fromNumber,
        to: params.toE164,
        body,
      });
    } else {
      throw new Error('Twilio: set messagingServiceSid or fromNumber');
    }
  } catch {
    console.error('[Twilio] SMS send failed');
    await deliverOtpMock({ channel: 'phone', identifier: params.toE164, otp: params.otp });
  }
}
