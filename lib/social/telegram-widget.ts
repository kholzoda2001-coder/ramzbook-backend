/**
 * Telegram Login Widget callback verification.
 * @see https://core.telegram.org/widgets/login#checking-authorization
 *
 * Client must POST idToken as a JSON string of the auth fields (including `hash`).
 * Never log TELEGRAM_BOT_TOKEN or the raw hash.
 */

import crypto from 'crypto';

/** Returns true when `data.hash` matches Telegram's HMAC for the remaining fields. */
export function verifyTelegramLoginWidget(
  data: Record<string, string>,
  botToken: string,
): boolean {
  const hash = data.hash;
  if (!hash || !botToken) return false;

  const pairs = Object.entries(data)
    .filter(([k]) => k !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b));
  const checkString = pairs.map(([k, v]) => `${k}=${v}`).join('\n');

  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hmac = crypto.createHmac('sha256', secretKey).update(checkString).digest('hex');

  try {
    return crypto.timingSafeEqual(Buffer.from(hmac, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return hmac === hash;
  }
}
