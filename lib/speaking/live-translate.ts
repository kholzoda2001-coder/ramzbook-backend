/**
 * Тарҷумаи паёми Рамз дар «Суҳбат бо Рамз» (Gemini Live) — бо зарба (22.10.2026).
 *
 * Live худаш тарҷума намедиҳад. Барномаи бо зарба як паёмро мефиристад, сервер онро бо
 * Google Cloud Translation (`lib/ai/translate.ts`) ба забони модарии хонанда мегардонад.
 * Худкор НЕСТ: бо ҳар паём пул ва таъхир намеафзояд.
 *
 * Функсияҳои ТОЗА (бе шабака) — роут ва тест инро мехонанд.
 */

/** Дарозии ҳадди паём (ҳарф): паёми Рамз кӯтоҳ аст; ҳади дароз — роҳи сӯиистифода. */
export const TRANSLATE_MAX_CHARS = 500;

const LANG_RE = /^[a-z]{2,3}(-[A-Za-z]{2,4})?$/;

const clean = (v: unknown): string => {
  const s = typeof v === 'string' ? v.trim() : '';
  return LANG_RE.test(s) ? s.toLowerCase() : '';
};

export type TranslateRequest =
  | { ok: true; text: string; target: string; source?: string }
  | { ok: false; reason: 'empty' | 'too_long' };

/**
 * Дархостро тоза мекунад. `target` аз барнома (забони модарии ҲОЗИРА), вагарна аз ҳисоб,
 * вагарна `tg`. `source` — забони омӯзиш (ихтиёрӣ).
 */
export function cleanTranslateRequest(
  body: { text?: unknown; target?: unknown; source?: unknown },
  accountNative: string | null | undefined,
): TranslateRequest {
  const text = typeof body.text === 'string' ? body.text.trim() : '';
  if (!text) return { ok: false, reason: 'empty' };
  if (text.length > TRANSLATE_MAX_CHARS) return { ok: false, reason: 'too_long' };
  const target = clean(body.target) || clean(accountNative) || 'tg';
  const source = clean(body.source);
  return { ok: true, text, target, ...(source ? { source } : {}) };
}
