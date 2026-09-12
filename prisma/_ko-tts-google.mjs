// Аудиои кореягии БОЭЪТИМОД бо Google TTS + санҷиши садои воқеӣ.
//
// ЧАРО: 2026-09-11 дар алифбо 6 ҳарф (아 야 이 에 예 와) ва калимаҳои 네, 씨 ХОМӮШ
// баромаданд. Озмоиш нишон дод: Google `ko-KR-Chirp3-HD-Despina` барои ҳиҷои ЯККА
// аксар вақт файли қариб холӣ медиҳад (128 кӯшиш — 20 бо садо; 이 ва 예 — 0 аз 16).
// Скриптҳо такрори «миёна аз рӯи ДАРОЗӢ»-ро мегирифтанд ва садоро намесанҷиданд —
// маҳз нусхаи хомӯш интихоб мешуд.
//
// Акнун: ҳар нусха бо `_audio-energy.py` санҷида мешавад ва АВВАЛИН нусхаи бо садо
// қабул мегардад. Тартиби кӯшиш (аз озмоиш): оддӣ → бо таваққуф (`markup`, 22/32)
// → оҳиста (와: 3/4) → бо аломати хитоб. Ҳеҷ яке нашавад — `ko-KR-Neural2-B`
// (ҳар бор якхела, 28/32) ҳамчун роҳи охирин, ва ин дар натиҷа ошкоро гуфта мешавад.
import { writeFileSync, mkdirSync, unlinkSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

export const VOICE = 'ko-KR-Chirp3-HD-Despina';
const FALLBACK_VOICE = 'ko-KR-Neural2-B';
const ENERGY = fileURLToPath(new URL('./_audio-energy.py', import.meta.url));
const VOWEL = fileURLToPath(new URL('./_ko-vowel-check.py', import.meta.url));

const VARIANTS = [
  { name: 'plain', input: (t) => ({ text: t }) },
  { name: 'markup', input: (t) => ({ markup: `[pause short] ${t} [pause short]` }) },
  { name: 'slow', input: (t) => ({ text: t + '.' }), rate: 0.9 },
  { name: 'excl', input: (t) => ({ text: t + '!' }) },
];

/** Файлҳое, ки санҷиши садоро НАМЕГУЗАРАНД (peak < 0.30 ё садои воқеӣ < 0.20 с). */
export function checkEnergy(files) {
  if (!files.length) return [];
  let out;
  try {
    out = execFileSync('python', [ENERGY, ...files], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }, maxBuffer: 1 << 24 });
  } catch (e) {
    out = e.stdout?.toString() ?? ''; // коди баромади 1 = ягон файл нагузашт
  }
  const rows = out.trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  if (rows.length !== files.length) throw new Error(`_audio-energy.py: ${rows.length} натиҷа барои ${files.length} файл`);
  return rows.filter((r) => !r.ok).map((r) => r.file);
}

async function synth(apiKey, input, voice, rate = 1.0) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, voice: { languageCode: 'ko-KR', name: voice }, audioConfig: { audioEncoding: 'MP3', speakingRate: rate } }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.audioContent) return Buffer.from(d.audioContent, 'base64');
    if (a === 3) throw new Error(`TTS ${res.status}: ${JSON.stringify(d).slice(0, 160)}`);
    await new Promise((r) => setTimeout(r, 1500 * (a + 1)));
  }
}

/**
 * Пас аз буриши хомӯшӣ (`_ar-trim.py`): агар нусхаи БУРИДА хомӯш шавад, вале нусхаи
 * ХОМ садо дорад — хом ба ҷои он гузошта мешавад. Буриш клипро аз нав рамзгузорӣ
 * мекунад, ва дар клипи хеле кӯтоҳ (네, ~0.2 с садо) таъхири рамзгузор садоро «мехӯрад»
 * (2026-09-11). Хом ~0.2 с хомӯшии иловагӣ дорад — беҳтар аз хомӯшии пурра.
 * @param pairs [[rawPath, trimPath], ...]
 * @returns {{still: string[], usedRaw: number}} `still` — файлҳое, ки ҳатто хом хомӯш аст.
 */
export function useTrimOrRaw(pairs) {
  const badTrim = new Set(checkEnergy(pairs.map((p) => p[1])));
  const fallback = pairs.filter((p) => badTrim.has(p[1]));
  const rawBad = new Set(checkEnergy(fallback.map((p) => p[0])));
  const still = [];
  for (const [raw, trim] of fallback) {
    if (rawBad.has(raw)) still.push(trim);
    else copyFileSync(raw, trim);
  }
  return { still, usedRaw: fallback.length - still.length };
}

/**
 * Матнро ба аудиои бо САДО табдил медиҳад.
 * @returns {{buf: Buffer, variant: string, attempts: number}}
 */
export async function speakReliable(text, { apiKey, workDir, triesPerVariant = 4 }) {
  mkdirSync(workDir, { recursive: true });
  const probe = `${workDir}/_probe_${process.pid}_${Math.random().toString(36).slice(2)}.mp3`;
  let attempts = 0;
  // Ҳиҷои ЯККА: садо ҳаст — ҳанӯз кофӣ нест. Chirp3 гоҳ садоноки ДИГАР мегӯяд
  // (ㅏ → «у/о», 2026-09-11) → `_ko-vowel-check.py` форматаҳоро месанҷад.
  const single = [...text.replace(/[^가-힣]/g, '')];
  const passes = (buf) => {
    writeFileSync(probe, buf);
    try {
      if (checkEnergy([probe]).length !== 0) return false;
      if (single.length !== 1) return true;
      try {
        execFileSync('python', [VOWEL, probe, single[0]], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
        return true;
      } catch { return false; } // коди 1 = садоноки нодуруст
    } finally { try { unlinkSync(probe); } catch {} }
  };
  for (const v of VARIANTS) {
    for (let k = 0; k < triesPerVariant; k++) {
      attempts++;
      const buf = await synth(apiKey, v.input(text), VOICE, v.rate ?? 1.0);
      if (passes(buf)) return { buf, variant: v.name, attempts };
    }
  }
  attempts++;
  const buf = await synth(apiKey, { text }, FALLBACK_VOICE, 1.0);
  if (passes(buf)) return { buf, variant: 'neural2-fallback', attempts };
  throw new Error(`«${text}»: пас аз ${attempts} кӯшиш ягон нусхаи бо садо нест`);
}
