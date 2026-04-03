/**
 * Safe mock delivery — never logs full OTP in production.
 */

import type { OtpChannel } from '@/lib/otp/otp-core';

export async function deliverOtpMock(params: {
  channel: OtpChannel;
  identifier: string;
  otp: string;
}): Promise<void> {
  if (process.env.NODE_ENV === 'development') {
    // Dev convenience only — do not enable verbose OTP logging in production builds.
    // eslint-disable-next-line no-console
    console.log(`[MockOTP][${params.channel}] destination=${params.identifier} code=${params.otp}`);
    return;
  }
  // Production: acknowledge without leaking the secret.
  // eslint-disable-next-line no-console
  console.log(`[MockOTP] OTP dispatched (channel=${params.channel})`);
}
