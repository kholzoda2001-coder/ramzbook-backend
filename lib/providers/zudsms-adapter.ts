/** ZudSMS HTTP API adapter for RamzBook's own 6-digit OTP codes. */

import crypto from 'crypto';

const ZUDSMS_SEND_URL = 'https://api.zudsms.tj/api/v1/send';

function getConfig() {
  const login = process.env.ZUDSMS_LOGIN?.trim();
  const passSaltHash = process.env.ZUDSMS_PASS_SALT_HASH?.trim();
  const from = process.env.ZUDSMS_SENDER_ID?.trim();
  if (!login || !passSaltHash || !from) {
    throw new Error('ZudSMS is not configured (login, pass_salt_hash, sender ID required).');
  }
  return { login, passSaltHash, from };
}

export async function sendOtpViaZudSms(params: {
  toE164: string;
  otp: string;
}): Promise<void> {
  if (!/^(\d{4}|\d{6})$/.test(params.otp)) throw new Error('OTP must contain exactly 4 or 6 digits.');
  await sendSmsViaZudSms({
    toE164: params.toE164,
    msg: `RamzGo: коди тасдиқи шумо ${params.otp}. Муҳлати амал 5 дақиқа.`,
  });
}

/** Generic ZudSMS send (the OTP sender above uses this too). */
export async function sendSmsViaZudSms(params: { toE164: string; msg: string }): Promise<void> {
  const { login, passSaltHash, from } = getConfig();
  const phoneNumber = params.toE164.replace(/\D/g, '');
  if (phoneNumber.length < 8 || phoneNumber.length > 15) {
    throw new Error('Invalid recipient phone number.');
  }

  // ZudSMS requires txn_id to be a positive integer (a UUID is rejected with code 106).
  // Millisecond timestamp * 1000 + 3 random digits stays unique and safely below 2^53.
  const txnId = String(Date.now() * 1000 + crypto.randomInt(0, 1000));
  const strHash = crypto
    .createHash('sha256')
    .update(`${txnId};${login};${from};${phoneNumber};${passSaltHash}`)
    .digest('hex');

  const response = await fetch(ZUDSMS_SEND_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from,
      phone_number: phoneNumber,
      msg: params.msg,
      login,
      str_hash: strHash,
      txn_id: txnId,
    }),
    signal: AbortSignal.timeout(15000),
    cache: 'no-store',
  });

  const result = (await response.json().catch(() => null)) as
    | { status?: unknown; msg?: unknown; error?: unknown; code?: unknown }
    | null;
  if (!response.ok) {
    const providerCode = Number(result?.code);
    console.error('[ZudSMS] request failed with HTTP status and provider code', response.status, providerCode || 'unknown');
    if (providerCode === 106) {
      throw new Error(
        `ZudSMS rejected the request (code 106): ${String(result?.msg ?? 'invalid txn_id or signature')}. Check txn_id, the ZudSMS login and Security Hash.`,
      );
    }
    if (providerCode === 107) {
      throw new Error('ZudSMS rejected the Sender ID (code 107). Check the approved sender nickname.');
    }
    if (providerCode === 105) {
      throw new Error('ZudSMS reports that the account is inactive (code 105).');
    }
    throw new Error('SMS provider rejected the request. Check ZudSMS credentials and sender ID.');
  }

  const providerStatus = typeof result?.status === 'string' ? result.status.toLowerCase() : '';
  if (['error', 'failed', 'fail', 'rejected'].includes(providerStatus) || result?.error) {
    console.error('[ZudSMS] provider returned an error status');
    throw new Error('SMS provider could not send the OTP. Check the ZudSMS balance and API settings.');
  }
}
