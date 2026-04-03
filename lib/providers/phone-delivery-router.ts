/**
 * Routes phone OTP delivery to mock / Twilio / RabbitMQ (SMS gate, e.g. smsgate.tj worker).
 */

import type { AuthProvidersConfig } from '@/lib/otp/auth-provider-settings';
import type { OtpChannel } from '@/lib/otp/otp-core';
import { deliverOtpMock } from '@/lib/providers/mock-otp-delivery';
import { publishOtpViaRabbitMq } from '@/lib/providers/rabbitmq-adapter';
import { sendOtpViaTwilio } from '@/lib/providers/twilio-adapter';

export async function deliverPhoneOtp(params: {
  cfg: AuthProvidersConfig;
  identifier: string;
  otp: string;
}): Promise<void> {
  const id = params.cfg.activePhoneProvider;

  if (id === 'mock') {
    await deliverOtpMock({
      channel: 'phone',
      identifier: params.identifier,
      otp: params.otp,
    });
    return;
  }

  if (id === 'twilio') {
    await sendOtpViaTwilio({
      cfg: params.cfg.twilio,
      toE164: params.identifier,
      otp: params.otp,
    });
    return;
  }

  if (id === 'rabbitmq') {
    await publishOtpViaRabbitMq({
      cfg: params.cfg.rabbitmq,
      channel: 'phone' as OtpChannel,
      identifier: params.identifier,
      otp: params.otp,
    });
    return;
  }

  await deliverOtpMock({
    channel: 'phone',
    identifier: params.identifier,
    otp: params.otp,
  });
}
