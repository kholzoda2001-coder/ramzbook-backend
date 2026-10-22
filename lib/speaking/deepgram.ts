/**
 * Гуфтори РЕАЛТАЙМ бо Deepgram — ҷойгузини Azure (22.10.2026).
 *
 * ── Чаро ────────────────────────────────────────────────────────────────────
 * Azure ~200$ гирифт ва фоидаи дилхоҳ надод. Deepgram (Nova-3) стримингро бо
 * нархи ~0.005–0.008$/дақиқа медиҳад ва ҳар шаш забони мо дар он ҳаст
 * (ru, en, de, tr, ko, ar). Хонанда мегӯяд — калимаҳо ҳамон лаҳза сабз мешаванд.
 *
 * ── Чӣ тавр ─────────────────────────────────────────────────────────────────
 * Ҳамон намунаи Azure: калид ҲЕҶ ГОҲ ба барнома намеояд. Сервер токени
 * кӯтоҳмуддат (JWT, `/v1/auth/grant`) мебарорад, барнома рост ба Deepgram
 * пайваст мешавад (WebSocket аз Vercel гузашта наметавонад).
 *
 * ── Пул ─────────────────────────────────────────────────────────────────────
 * Стриминг аз рӯи сонияҳои МИКРОФОНИ кушода ҳисоб мешавад. Барои ҳамин:
 *  • токен кӯтоҳ зинда аст ([DEEPGRAM_TOKEN_TTL_SECONDS]);
 *  • ҳар корбар дар як рӯз ҳадди токен дорад ([DEEPGRAM_DAILY_GRANTS]);
 *  • хомӯш кардан бе deploy: `speech_engine` → `{"deepgram":"off"}`.
 *
 * Функсияҳои ТОЗА — бе Prisma ва бе шабака (ғайр аз [mintDeepgramToken]).
 */

export const DEEPGRAM_AUTH_URL = 'https://api.deepgram.com/v1/auth/grant';
export const DEEPGRAM_LISTEN_URL = 'wss://api.deepgram.com/v1/listen';
export const DEEPGRAM_MODEL = 'nova-3';

/**
 * Токен ин қадар зинда аст. Барнома онро пеш аз мурдан нав мекунад; ҳар
 * нав кардан як «грант» аст ва ба ҳадди рӯзона ҳисоб мешавад.
 */
export const DEEPGRAM_TOKEN_TTL_SECONDS = 90;

/** Ҳадди токени рӯзона барои як корбар (~1 токен ≈ 1 дақиқаи кори воқеӣ). */
export const DEEPGRAM_DAILY_GRANTS = 150;

export type DeepgramMode = 'auto' | 'on' | 'off';

/** `speech_engine`-и AppSetting: `{"deepgram": "off"}`. Пешфарз — `auto` (калид ҳаст = кор мекунад). */
export function parseDeepgramMode(valueJson: string | null | undefined): DeepgramMode {
  if (!valueJson) return 'auto';
  try {
    const v = (JSON.parse(valueJson) as { deepgram?: unknown }).deepgram;
    return v === 'off' || v === 'on' ? v : 'auto';
  } catch {
    return 'auto';
  }
}

/** Рӯзи Душанбе (UTC+5) ҳамчун `YYYY-MM-DD`. */
export function dushanbeDay(now: number): string {
  return new Date(now + 5 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** Ҳадди рӯзона: аз муҳит (`DEEPGRAM_DAILY_GRANTS`) ё пешфарз. Қимати ғалат → пешфарз. */
export function dailyGrantCap(env: string | undefined): number {
  const n = Number(env);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : DEEPGRAM_DAILY_GRANTS;
}

/** Забони барнома (`ru-RU`, `en-US`, `ar`…) → код барои Deepgram Nova-3. `null` = дастгирӣ нест. */
export function deepgramLanguage(locale: string | undefined): string | null {
  const base = (locale ?? '').split(/[-_]/)[0].toLowerCase();
  return ['ru', 'en', 'de', 'tr', 'ko', 'ar'].includes(base) ? base : null;
}

export type MintResult =
  | { ok: true; token: string; expiresIn: number }
  | { ok: false; dead: boolean; status: number };

/**
 * Токени муваққатӣ мебарорад. `dead` — калид/ҳисоб мурда (401/402/403): барнома
 * бояд то охири ҷаласа ба муҳаррики телефон гузарад, на такроран пурсад.
 */
export async function mintDeepgramToken(
  apiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<MintResult> {
  const res = await fetchImpl(DEEPGRAM_AUTH_URL, {
    method: 'POST',
    headers: { Authorization: `Token ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ttl_seconds: DEEPGRAM_TOKEN_TTL_SECONDS }),
  });
  if (!res.ok) return { ok: false, dead: [401, 402, 403].includes(res.status), status: res.status };
  const j = (await res.json().catch(() => ({}))) as { access_token?: unknown; expires_in?: unknown };
  const token = typeof j.access_token === 'string' ? j.access_token : '';
  if (!token) return { ok: false, dead: false, status: res.status };
  const exp = typeof j.expires_in === 'number' ? j.expires_in : DEEPGRAM_TOKEN_TTL_SECONDS;
  return { ok: true, token, expiresIn: exp };
}
