/**
 * Овози табиӣ барои ҷумлаҳои НАВИШТАШУДАИ AI («Сӯҳбат бо AI»).
 *
 * Google Cloud TTS, овоз Chirp3-HD — ҳамон овози курс (ниг.
 * `prisma/_ru-speaking-audio.mjs`), то Рамз мисли дарсҳо садо диҳад.
 * Натиҷа MP3-и base64 (~20–40 КБ) — дар ҷавоб бевосита меравад: ҷумлаҳо
 * ягонаанд, кэш маъно надорад.
 *
 * Калид (`GOOGLE_TTS_KEY`) нест ё хато → `''`, ва барнома бо овози телефон
 * мехонад. ⚠️ Автомат: баъди 403/400 — 10 дақиқа хомӯш.
 */

const VOICES: Record<string, string> = {
  ru: 'ru-RU-Chirp3-HD-Kore',
  en: 'en-US-Chirp3-HD-Kore',
  de: 'de-DE-Chirp3-HD-Kore',
  tr: 'tr-TR-Chirp3-HD-Kore',
  ko: 'ko-KR-Chirp3-HD-Kore',
  ar: 'ar-XA-Chirp3-HD-Kore',
};

let disabledUntil = 0;

export async function synthesizeMp3(text: string, langCode: string): Promise<string> {
  const key = process.env.GOOGLE_TTS_KEY;
  const code = langCode.split('-')[0].toLowerCase();
  const voice = VOICES[code];
  const t = text.trim();
  if (!key || !voice || !t || Date.now() < disabledUntil) return '';
  try {
    const res = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text: t.slice(0, 400) },
          voice: { languageCode: voice.slice(0, 5), name: voice },
          audioConfig: { audioEncoding: 'MP3' },
        }),
        signal: AbortSignal.timeout(4000),
      },
    );
    if (!res.ok) {
      if (res.status === 403 || res.status === 400) disabledUntil = Date.now() + 10 * 60 * 1000;
      return '';
    }
    const j = (await res.json()) as { audioContent?: string };
    return j.audioContent ?? '';
  } catch {
    return '';
  }
}
