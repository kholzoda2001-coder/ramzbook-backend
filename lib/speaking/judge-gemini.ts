/**
 * lib/speaking/judge-gemini.ts — довари «Гуфтор» (`/api/ai/speaking/judge`) аввал
 * аз Gemini мепурсад, ва агар нашуд — аз провайдери пештара (Groq).
 *
 * ЧАРО (30.09.2026): довар ба Groq-и ройгон вобаста буд (8000 токен дар дақиқа барои
 * ҲАМА: чат, ёрӣ, довар). Дар логҳо `429` дида шуд; хатои довар = «ҷавоб нодуруст»,
 * яъне ҷавоби ДУРУСТ ҳам рад мешуд ва то 4 сония интизорӣ буд. Gemini Flash-Lite:
 * медианаи ~0.7 с; дар санҷиши 12 ҳолат ҳама дуруст (маъно, тартиби калимаҳо, забони дигар).
 * Ду провайдери ҶУДО (ду ҳадди мустақил) хаторо хеле кам мекунад.
 *
 * СОФ (бе шабака): конфигу «қатъкунак» дар ин ҷо, тест онро мегирад.
 */

export const GEMINI_OPENAI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';
export const DEFAULT_GEMINI_JUDGE_MODEL = 'gemini-3.5-flash-lite';

/** Гемини барои довар ин қадар вақт дорад; баъд — захира (Groq). */
export const GEMINI_JUDGE_TIMEOUT_MS = 2500;

export type GeminiJudgeConfig = { enabled: boolean; apiKey: string; model: string };

/**
 * Фаъол: калид (`GEMINI_API_KEY`, ҳамон ки «Сӯҳбат бо AI» дорад) ҳаст ва
 * `GEMINI_JUDGE_ENABLED` ба `false`/`0` нест. Модел: `GEMINI_JUDGE_MODEL`.
 */
export function geminiJudgeConfig(env: Record<string, string | undefined>): GeminiJudgeConfig {
  const apiKey = (env.GEMINI_API_KEY ?? '').trim();
  const flag = (env.GEMINI_JUDGE_ENABLED ?? '').trim().toLowerCase();
  return {
    enabled: !!apiKey && flag !== 'false' && flag !== '0',
    apiKey,
    model: (env.GEMINI_JUDGE_MODEL ?? '').trim() || DEFAULT_GEMINI_JUDGE_MODEL,
  };
}

// ── «Қатъкунак»: агар Gemini ноком шуд, чанд вақт мустақим ба захира мераем ─────
let skipUntil = 0;

/** Хатогии конфигуратсия (калид/модел) — дер меояд; 429/5xx/таймаут — зуд мегузарад. */
export function skipMsFor(status: number | undefined): number {
  if (status === 401 || status === 403 || status === 404) return 10 * 60_000;
  if (status === 429) return 30_000;
  return 15_000;
}

export function geminiSkipped(now: number): boolean {
  return now < skipUntil;
}

export function noteGeminiFailure(status: number | undefined, now: number): void {
  skipUntil = Math.max(skipUntil, now + skipMsFor(status));
}

export function resetGeminiBreaker(): void {
  skipUntil = 0;
}

/**
 * Ҷавоби Gemini ба довар кор мекунад? Бе JSON-и хонда мешаванда `parseJudgeReply`
 * «рад» мекард — яъне ҷавоби дурустро бе сабаб рад мекард. Дар ин ҳол захира кор мекунад.
 */
export function usableJudgeReply(reply: string | undefined): boolean {
  if (!reply) return false;
  const m = reply.match(/\{[\s\S]*\}/);
  if (!m) return false;
  try {
    const j = JSON.parse(m[0]) as { ok?: unknown };
    return j.ok === true || j.ok === false || j.ok === 'true' || j.ok === 'false';
  } catch {
    return false;
  }
}
