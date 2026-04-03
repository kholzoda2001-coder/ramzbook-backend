/**
 * Routes email OTP delivery to mock / SMTP / RabbitMQ based on admin settings.
 */

import type { AuthProvidersConfig } from '@/lib/otp/auth-provider-settings';
import type { OtpChannel } from '@/lib/otp/otp-core';
import { deliverOtpMock } from '@/lib/providers/mock-otp-delivery';
import { publishOtpViaRabbitMq } from '@/lib/providers/rabbitmq-adapter';
import { sendOtpEmail } from '@/lib/mailer';

export async function deliverEmailOtp(params: {
  cfg: AuthProvidersConfig;
  identifier: string;
  otp: string;
}): Promise<void> {
  const id = params.cfg.activeEmailProvider;

  if (id === 'mock') {
    await deliverOtpMock({
      channel: 'email',
      identifier: params.identifier,
      otp: params.otp,
    });
    return;
  }

  if (id === 'smtp') {
    try {
      await sendOtpEmail(params.identifier, params.otp, params.cfg.smtp);
    } catch (e) {
      console.error('[SMTP] Failed to send OTP email', e);
      if (process.env.NODE_ENV === 'production') {
        throw e;
      }
      await deliverOtpMock({
        channel: 'email',
        identifier: params.identifier,
        otp: params.otp,
      });
    }
    return;
  }

  if (id === 'rabbitmq') {
    await publishOtpViaRabbitMq({
      cfg: params.cfg.rabbitmq,
      channel: 'email' as OtpChannel,
      identifier: params.identifier,
      otp: params.otp,
    });
    return;
  }

  await deliverOtpMock({
    channel: 'email',
    identifier: params.identifier,
    otp: params.otp,
  });
}
