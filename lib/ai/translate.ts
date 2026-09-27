/**
 * Тарҷума ба забони МОДАРИИ хонанда (одатан тоҷикӣ) — Google Cloud Translation (v2).
 *
 * Чаро на худи модели AI: санҷиши зинда (27.09.2026) — gpt-oss ва qwen
 * тоҷикиро ғалат тарҷума мекунанд («Где бетон?» → «Кӯдак дар куҷост?»,
 * «молоток» → «чаккум»). Google Translate тоҷикиро хеле беҳтар медонад.
 *
 * Калид: `GOOGLE_TRANSLATE_KEY`, вагарна `GOOGLE_TTS_KEY` (ҳамон лоиҳаи
 * Google Cloud — Translation API бояд барои калид фаъол бошад). Калид нест
 * ё API баста аст → `null`, ва даъваткунанда тарҷумаи моделро ҳамчун
 * «тахминӣ» нишон медиҳад.
 *
 * ⚠️ «Автомат»: баъди хатои 403/400 тарҷума 10 дақиқа ХОМӮШ мешавад — вагарна
 * ҳар навбати суҳбат ~300 мс-ро ба дархости ноком сарф мекард.
 */

let disabledUntil = 0;

export async function translateTexts(
  texts: string[],
  target = 'tg',
  source?: string,
): Promise<string[] | null> {
  const key = process.env.GOOGLE_TRANSLATE_KEY || process.env.GOOGLE_TTS_KEY;
  // Сатрҳои холӣ ба Google намераванд — дар ҷойи худ холӣ мемонанд.
  const all = texts.map((t) => t.trim());
  const idx = all.map((t, i) => (t ? i : -1)).filter((i) => i >= 0);
  const items = idx.map((i) => all[i]);
  if (!key || items.length === 0 || Date.now() < disabledUntil) return null;
  try {
    const res = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          q: items,
          target: target.split('-')[0],
          format: 'text',
          ...(source ? { source: source.split('-')[0] } : {}),
        }),
        signal: AbortSignal.timeout(2500),
      },
    );
    if (!res.ok) {
      if (res.status === 403 || res.status === 400) disabledUntil = Date.now() + 10 * 60 * 1000;
      return null;
    }
    const j = (await res.json()) as { data?: { translations?: { translatedText?: string }[] } };
    const got = j.data?.translations?.map((t) => (t.translatedText ?? '').trim()) ?? [];
    if (got.length !== items.length) return null;
    const out = all.map(() => '');
    idx.forEach((i, k) => (out[i] = got[k]));
    return out;
  } catch {
    return null;
  }
}
