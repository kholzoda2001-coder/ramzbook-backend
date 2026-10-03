// ⚙️ ВЕРСИЯИ УМУМӢ (`--lang=ru|en`) — аз `_ru-speaking-audio.mjs` сохта шуд (28.09.2026).
//    Ҳамон санҷишҳо; ҳар забон овоз ва ҷузвдони CDN-и худро дорад.
//    node prisma/_speaking-audio-lang.mjs <ramz-audio dir> --lang=en [--dry] [--reuse]
// Аудиои бахши ГУФТОР — РУСӢ (боби «Знакомство / Шиносоӣ»).
//
// Мисли `_ko-speaking-audio.mjs`: овози гуфтор = овози КУРС. Барои тамоми русӣ
// қарори доимӣ `ru-RU-Chirp3-HD-Kore` аст (ниг. `_grammar-ex-audio.mjs`), бо
// буриши хомӯшии сар (`_ar-trim.py`).
//
// 🔴 20.09.2026: боркунӣ ба Vercel Blob БАРОВАРДА ШУД — анбор баста аст
// («This store has been suspended», ҳар URL 403). Ҳоло файлҳо ба репои
// `ramz-audio` мераванд ва URL ба SHA-и коммит баста мешавад (jsDelivr).
//
// 🔴 Доми ёфташуда (13.09.2026): Chirp3-Kore ҳиҷои ЯККА-ро («Да») 5 бор пай дар пай
// ХОМӮШ дод (peak 0.0003–0.035) — ҳамон доми «Да.»-и хомӯш дар муколамаҳои М6/М8.
// Пас ҳар клип чен мешавад ва зинаҳои эҳтиётӣ пай дар пай санҷида мешаванд:
//   1. Chirp3-Kore, матни оддӣ (×2)
//   2. Chirp3-Kore, `markup` бо таваққуфи кӯтоҳ (×2) — мисли муҳофизи кореягӣ
//   3. клипи ҲАМОН калима аз дарсҳои курси русӣ (хонанда ҳамон овозро мешунавад)
//   4. `ru-RU-Wavenet-C` — овози алифбои русӣ (×2)
// Ягон клипи хомӯш ба база намеравад.
//
//   node prisma/_ru-speaking-audio.mjs <ramz-audio dir> [--dry]
//
// Идемпотент: танҳо воҳидҳои бе `audioUrl`.
//
// 26.09.2026: сатрҳои ҲАМСӮҲБАТ низ (`cue` → `cueAudioUrl`, файл `<id>_cue.mp3`).
// Матн бо ҷойгузор ({name}, {job}) ё ҷои холӣ («___») САБТ НАМЕШАВАД: онро
// барнома барои ҳар хонанда иваз мекунад ва бо TTS мехонад.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { execFileSync, execSync, spawnSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const REPO = process.argv[2];
if (!REPO || REPO.startsWith('--')) throw new Error('Истифода: node prisma/_speaking-audio-lang.mjs <ramz-audio dir> --lang=en [--dry] [--reuse]');
const DRY = process.argv.includes('--dry');
// Файлҳои аллакай сохташуда (ва солим) дар `WORK` аз нав тавлид намешаванд —
// барои такрори скрипт баъди нокомӣ дар қадамҳои баъдӣ (28.09.2026).
const REUSE = process.argv.includes('--reuse');
// Ҳар забон ҶУДО: овоз, ҷузвдони CDN ва ҷузвдони корӣ — ба ҳам намеомезанд.
const LANGS = {
  ru: { voice: 'ru-RU-Chirp3-HD-Kore', fallback: 'ru-RU-Wavenet-C', code: 'ru-RU' },
  // Англисӣ: ҳамон оилаи Chirp3 (санҷишҳо барои он калибр шудаанд); эҳтиётӣ —
  // овози курси англисӣ (`en-US-Neural2-F`, ниг. `gen-all-audio-google.mjs`).
  en: { voice: 'en-US-Chirp3-HD-Kore', fallback: 'en-US-Neural2-F', code: 'en-US' },
  // Арабӣ (28.09.2026): ОВОЗИ КУРС — edge-tts Zariyah (интихоби корбар баъди гӯш кардани
  // Chirp3-Kore ва Zariyah). Эҳтиётӣ — Google Wavenet-A. `edge:` = edge-tts, на Google.
  // ⚠️ Матн БО ҳаракат фиристода мешавад — TTS маҳз ҳамон ҳаракотро мехонад.
  ar: { voice: 'edge:ar-SA-ZariyahNeural', fallback: 'ar-XA-Wavenet-A', code: 'ar-SA' },
  // Кореягӣ: овози КУРС (`_ko-tts-google.mjs`) — Despina; эҳтиётӣ Neural2-B (ҳиҷои якка:
  // Neural2-B 100%, Despina 33% — хотираи ramz-ko-alphabet-voice).
  ko: { voice: 'ko-KR-Chirp3-HD-Despina', fallback: 'ko-KR-Neural2-B', code: 'ko-KR' },
  // Туркӣ (28.09.2026): ОВОЗИ КУРС — edge-tts Emel (`_tr-audio.mjs`), то хонанда як овозро
  // дар дарс ва гуфтор шунавад. Эҳтиётӣ — Google Wavenet-A (зан).
  tr: { voice: 'edge:tr-TR-EmelNeural', fallback: 'tr-TR-Wavenet-A', code: 'tr-TR' },
  // Олмонӣ (29.09.2026): ОВОЗИ КУРС — edge-tts Katja (`_de-tts.py`, тамоми курси олмонӣ).
  de: { voice: 'edge:de-DE-KatjaNeural', fallback: 'de-DE-Wavenet-F', code: 'de-DE' },
};
const LANG = (process.argv.find((a) => a.startsWith('--lang=')) ?? '').slice(7);
if (!LANGS[LANG]) throw new Error(`--lang=${Object.keys(LANGS).join('|')} лозим`);
const CFG = LANGS[LANG];
const VOICE = CFG.voice;
const FALLBACK_VOICE = CFG.fallback;
const CDN_DIR = `${REPO}/audio/${LANG}`;
const WORK = `tmp/${LANG}-speaking-audio`;
const TRIM = `${WORK}-trim`;
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const RU = (await sql.query(`SELECT id FROM "Language" WHERE code = $1`, [LANG]))[0]?.id;
if (!RU) throw new Error(`забони «${LANG}» дар база нест`);
// ⚠️ Дар як фармон на бештар аз 60 файл: 183 роҳ аз ҳадди дарозии фармони
// Windows мегузарад ва `spawnSync` бо exit 126 бармегардад.
const measure = (paths) => {
  const out = {};
  for (let i = 0; i < paths.length; i += 60) {
    const r = spawnSync('python', ['../tools/audio_check.py', ...paths.slice(i, i + 60)], PY);
    if (r.status !== 0) throw new Error(r.stderr);
    Object.assign(out, JSON.parse(r.stdout));
  }
  return out;
};
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
// Калимаи кӯтоҳ табиатан кам садои баланд дорад: «Пока» 0.24 с, «Тоже» 0.22 с — клипҳои
// СОЛИМ, ки ҳадди 0.25-и ҷумла онҳоро бефоида рад мекард (13.09.2026).
// ⚠️ Ҳад барои РУСӢ калибр шуд (садонокҳо дароз). Англисӣ: калимаи кӯтоҳ бо
// ҳамсадоҳои беҷаранг («Sick» — 0.16 с нутқ, peak 0.55, солим) ҳадди 0.18-ро
// намегузашт ва ТАМОМИ борро манъ мекард (28.09.2026) → 20% пасттар. Баъд «Test»:
// шаш муҳаррик (Chirp3/markup/Wavenet) ҳамеша 0.14 с — хосияти калима (t-s-t), на вайронӣ → 25%.
// Арабӣ (28.09.2026): «قِفْ» 0.10 с ва «افْحَصْه» 0.16 с дар ҳар 4 кӯшиш айнан ҳамон —
// ҳамсадоҳои беҷаранг (қ-ф, ҳ-с), ҳамон ҳолати «Test»-и англисӣ → ҳамон 25%.
const SPEECH_K = { ru: 0.6, en: 0.75, ar: 0.75, tr: 0.75, de: 0.5 }[LANG] ?? 1; // tr: «Çekiç» 0.16 с; de: «Stock» 0.12, «Dach» 0.10 с (Katja, peak ~0.58 — солим); ru (03.10): «В парк» 0.12–0.16, «Суп» 0.08–0.10 с (peak 0.4–0.98) — ҳамаи зинаҳо рад мешуданд
const minSpeech = (t) => (letters(t) <= 3 ? 0.12 : letters(t) <= 6 ? 0.18 : 0.25) * SPEECH_K;
const normKey = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

const personal = (t) => t.includes('{') || t.includes('___');
const items = [
  ...(await sql.query(
    `SELECT i.id, i.text, l."order" AS lesson
       FROM "SpeakingItem" i
       JOIN "SpeakingLesson" l ON i."lessonId" = l.id
       JOIN "SpeakingCategory" c ON l."categoryId" = c.id
      WHERE c."targetLanguageId" = $1 AND (i."audioUrl" IS NULL OR i."audioUrl" = '')
      ORDER BY l."order", i."order"`, [RU]))
    .map((r) => ({ ...r, key: r.id, col: 'audioUrl' })),
  ...(await sql.query(
    `SELECT i.id, i.cue AS text, l."order" AS lesson
       FROM "SpeakingItem" i
       JOIN "SpeakingLesson" l ON i."lessonId" = l.id
       JOIN "SpeakingCategory" c ON l."categoryId" = c.id
      WHERE c."targetLanguageId" = $1 AND coalesce(trim(i.cue), '') <> ''
        AND coalesce(i."cueAudioUrl", '') = ''
      ORDER BY l."order", i."order"`, [RU]))
    .map((r) => ({ ...r, key: `${r.id}_cue`, col: 'cueAudioUrl' })),
].filter((i) => !personal(i.text));
console.log(`Воҳидҳои гуфтори «${LANG}» бе аудио: ${items.length}`);
if (!items.length) { console.log('Ҳама аудио доранд.'); process.exit(0); }
if (DRY) { items.forEach((i) => console.log(`  L${i.lesson + 1} ${i.text}`)); console.log('--dry: чизе сохта нашуд.'); process.exit(0); }

// Клипҳои калимаҳои курси русӣ — зинаи 3.
const wordClip = {};
for (const w of await sql.query(
  `SELECT w.word, w."audioUrl" au FROM "Word" w JOIN "Lesson" l ON l.id = w."lessonId" JOIN "Module" m ON m.id = l."moduleId"
     JOIN "Course" c ON c.id = m."courseId" WHERE c."targetLanguageId" = $1 AND coalesce(w."audioUrl", '') <> ''`, [RU])) {
  wordClip[normKey(w.word)] ??= w.au;
}

// edge-tts (ройгон, бе калид): `edge:<овоз>`. `markup`-и Google надорад — матни оддӣ.
const PYTHON = existsSync('C:/Users/ASUS1/AppData/Local/Python/pythoncore-3.14-64/python.exe')
  ? 'C:/Users/ASUS1/AppData/Local/Python/pythoncore-3.14-64/python.exe'
  : 'python';
function edgeSynth(text, voice) {
  const out = `${WORK}/_edge.mp3`;
  for (let a = 0; a < 3; a++) {
    // ⏱ 30 с: 29.09.2026 як дархости edge-tts дар шабака овезон монд ва тамоми
    // тавлиди туркиро 8 соат дар 1101/1120 нигоҳ дошт (spawnSync бе ҳад интизор буд).
    const r = spawnSync(PYTHON, ['-m', 'edge_tts', '--voice', voice, '--text', text, '--write-media', out], { ...PY, timeout: 30000 });
    if (r.status === 0 && existsSync(out)) return readFileSync(out);
  }
  throw new Error(`edge-tts ${voice}: «${text}» нашуд`);
}
async function synth(input, voice) {
  if (voice.startsWith('edge:')) return edgeSynth(input.text ?? input.markup.replace(/\[pause short\]/g, '').trim(), voice.slice(5));
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, voice: { languageCode: CFG.code, name: voice }, audioConfig: { audioEncoding: 'MP3' } }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.audioContent) return Buffer.from(d.audioContent, 'base64');
    if (a === 3) throw new Error(`TTS ${voice} ${res.status}: ${JSON.stringify(d).slice(0, 160)}`);
    await new Promise((r) => setTimeout(r, 1500 * (a + 1)));
  }
}
const STAGES = [
  { name: 'chirp3', make: (t) => synth({ text: t }, VOICE) },
  { name: 'chirp3', make: (t) => synth({ text: t }, VOICE) },
  { name: 'chirp3-markup', make: (t) => synth({ markup: `[pause short] ${t} [pause short]` }, VOICE) },
  { name: 'chirp3-markup', make: (t) => synth({ markup: `[pause short] ${t} [pause short]` }, VOICE) },
  { name: 'course-clip', make: async (t) => {
    const u = wordClip[normKey(t)];
    if (!u) return null;
    // 🔴 28.09.2026: ECONNABORTED дар ин ҷо ТАМОМИ скриптро (1198 клип) мекушт.
    // Зинаи эҳтиётӣ аст — шабака нашуд, зинаи баъдӣ.
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(15000) });
      return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
    } catch {
      return null;
    }
  } },
  { name: 'wavenet', make: (t) => synth({ text: t }, FALLBACK_VOICE) },
  { name: 'wavenet', make: (t) => synth({ text: t }, FALLBACK_VOICE) },
];

// Кореягӣ: ҲИҶОИ ЯККА («네.», «예?») — Despina онро гоҳ хомӯш ва гоҳ бо садоноки ДИГАР
// мегӯяд (форманта: «ㅏ» → «у/о», хотираи ramz-korean); санҷиши энергия инро намебинад.
// Пас барои ҳиҷои якка: клипи курс (ислоҳшуда ва санҷидашуда) → Neural2-B (ченак 100%).
const oneSyllable = (t) => LANG === 'ko' && (t.match(/[가-힣]/g) ?? []).length === 1;
const stagesFor = (t) => (oneSyllable(t) ? STAGES.slice(4) : STAGES);

// ── 1. Тавлид бо муҳофиз ────────────────────────────────────────────────────
console.log(`\n== Тавлид (${VOICE}) ==`);
mkdirSync(WORK, { recursive: true });
const used = {};
const reusable = REUSE
  ? measure(items.map((i) => `${WORK}/${i.key}.mp3`).filter((p) => existsSync(p)))
  : {};
// Ҳадди ТАВЛИД пасттар аз ҳадди ниҳоӣ (0.30): клипи ОҲИСТА, вале бо нутқи солим (кореягии «일»
// бо Neural2-B — peak 0.287, нутқ 0.28 с) дар қадами баландкунӣ то ~0.8 мерасад ва санҷиши
// ниҳоӣ онро боз месанҷад. Хомӯш (peak 0.01–0.05) ҳамчунон рад мешавад (28.09.2026).
const GEN_MIN_PEAK = 0.2;
for (const it of items) {
  const path = `${WORK}/${it.key}.mp3`;
  const prev = reusable[path];
  if (prev && !prev.error && prev.peak >= GEN_MIN_PEAK && prev.speech >= minSpeech(it.text)) {
    it.stage = 'reuse';
    used.reuse = (used.reuse ?? 0) + 1;
    continue;
  }
  let ok = false;
  for (const [n, st] of stagesFor(it.text).entries()) {
    const buf = await st.make(it.text);
    if (!buf) continue;
    writeFileSync(path, buf);
    const m = measure([path])[path];
    ok = !m.error && m.peak >= GEN_MIN_PEAK && m.speech >= minSpeech(it.text);
    if (ok) {
      it.stage = st.name;
      used[st.name] = (used[st.name] ?? 0) + 1;
      if (n > 0) console.log(`  ✓ «${it.text}» → ${st.name} (кӯшиши ${n + 1})`);
      break;
    }
    console.log(`  ↻ «${it.text}» ${st.name}: peak=${m.peak} нутқ=${m.speech}s`);
  }
  if (!ok) { console.error(`⛔ «${it.text}»: ҳеҷ зина садо надод — ҳеҷ чиз бор нашуд`); process.exit(1); }
}
console.log('зинаҳо:', JSON.stringify(used));

// ── 2. Буриши хомӯшӣ ────────────────────────────────────────────────────────
// ffmpeg дар PATH нест — бинарӣ аз бастаи Python `imageio_ffmpeg` меояд (ниг. хотираи ramz-audio-audit).
const FFMPEG = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], PY).trim();
console.log(execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM], PY).trim());
// ⚠️ `useTrimOrRaw`-и кореягӣ ҳадди худро дорад (садои воқеӣ < 0.20 с = хомӯш) — «Я» ва «Да»-и
// СОЛИМ ~0.12–0.19 с садо доранд ва онҳоро рад мекард (13.09.2026). Ин ҷо ҳамон ҳадди `minSpeech`:
// нусхаи бурида нагузарад, вале хом гузарад → хом (~0.2 с хомӯшии иловагӣ беҳтар аз хомӯшии пурра).
{
  const raw = measure(items.map((i) => `${WORK}/${i.key}.mp3`));
  const cut = measure(items.map((i) => `${TRIM}/${i.key}.mp3`));
  // Ҳамон ҳадди тавлид: клипи оҳиста баъд баланд карда мешавад; санҷиши ниҳоӣ — 0.30.
  const passes = (v, t) => v && !v.error && v.peak >= GEN_MIN_PEAK && v.speech >= minSpeech(t);
  let usedRaw = 0;
  const still = [];
  for (const it of items) {
    if (passes(cut[`${TRIM}/${it.key}.mp3`], it.text)) continue;
    const r = raw[`${WORK}/${it.key}.mp3`];
    if (passes(r, it.text)) {
      // 🔴 28.09.2026: «Пять», «Шесть», «Кончился.» — буриш клипро хомӯш кард, хом
      // бошад 0.54–0.76 с хомӯшӣ пеш аз садо дошт (ҳадди санҷиши ниҳоӣ 0.5 с) ва
      // ТАМОМИ бор (454 файл) манъ шуд. Акнун хомӯшии сар бо андозаи ЧЕНШУДА
      // бурида мешавад (0.12 с захира мемонад), на бо буридани худкор.
      if (r.lead > 0.35) {
        const ss = Math.max(0, r.lead - 0.12).toFixed(2);
        execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', ss, '-i', `${WORK}/${it.key}.mp3`,
          '-ar', '24000', '-ac', '1', '-b:a', '64k', `${TRIM}/${it.key}.mp3`]);
        console.log(`  ✂️ «${it.text}»: буриш хомӯш шуд → хом, хомӯшии сар ${r.lead}s → −${ss}s`);
      } else {
        writeFileSync(`${TRIM}/${it.key}.mp3`, readFileSync(`${WORK}/${it.key}.mp3`));
        console.log(`  ↩ «${it.text}»: нусхаи бурида хомӯш шуд → хом`);
      }
      usedRaw++;
    } else still.push(it.text);
  }
  if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд`);
  if (still.length) { console.error('⛔ файли хомӯш баъди буриш:', still.join(', ')); process.exit(1); }
}

// Хомӯшии САР пас аз буриш ҳанӯз дароз: кореягии Despina 115 клип бо 0.52–0.70 с хомӯшӣ пеш
// аз садо дошт (ҳадди санҷиши ниҳоӣ 0.5 с) — `_ar-trim.py` ҳамсадои оҳистаи аввалро садо
// намешуморад (28.09.2026). Ҳамон буриши ЧЕНШУДА, ки дар роҳи эҳтиётӣ: 0.12 с захира мемонад.
{
  const pre = measure(items.map((i) => `${TRIM}/${i.key}.mp3`));
  let cut = 0;
  for (const it of items) {
    const p = `${TRIM}/${it.key}.mp3`;
    const m = pre[p];
    if (!m || m.error || m.lead <= 0.4) continue;
    const tmp = `${TRIM}/${it.key}.lead.mp3`;
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-ss', Math.max(0, m.lead - 0.12).toFixed(2), '-i', p,
      '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp]);
    writeFileSync(p, readFileSync(tmp));
    cut++;
  }
  if (cut) console.log(`  ✂️ ${cut} клип: хомӯшии сари > 0.4 с бурида шуд (0.12 с мемонад)`);
}

// Буриш клипро аз нав рамзгузорӣ мекунад ва peak-и Chirp3 (~0.98) баъзан ба 0.99+ мерасад
// («Здравствуйте», «Как» — 13.09.2026). Чунин клип 15% оромтар карда мешавад.
{
  const pre = measure(items.map((i) => `${TRIM}/${i.key}.mp3`));
  for (const it of items) {
    const p = `${TRIM}/${it.key}.mp3`;
    if (pre[p].peak < 0.97) continue;
    const tmp = `${TRIM}/${it.key}.vol.mp3`;
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', p, '-af', 'volume=0.85', '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp]);
    writeFileSync(p, readFileSync(tmp));
    console.log(`  🔉 «${it.text}»: peak ${pre[p].peak} → оромтар`);
  }
}
// Клипи ПАСТ (peak < 0.35, вале нутқаш солим) баланд карда мешавад то ~0.8:
// «Do you live with your family?» баъди буриши ченшуда peak 0.28 дошт ва ТАМОМИ
// бор (1192 файл) манъ шуд (28.09.2026).
{
  const pre = measure(items.map((i) => `${TRIM}/${i.key}.mp3`));
  for (const it of items) {
    const p = `${TRIM}/${it.key}.mp3`;
    const m = pre[p];
    if (!m || m.error || m.peak >= 0.35 || m.peak <= 0.05 || m.speech < minSpeech(it.text)) continue;
    const gain = Math.min(4, 0.8 / m.peak).toFixed(2);
    const tmp = `${TRIM}/${it.key}.loud.mp3`;
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', p, '-af', `volume=${gain}`, '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp]);
    writeFileSync(p, readFileSync(tmp));
    console.log(`  🔊 «${it.text}»: peak ${m.peak} → ×${gain}`);
  }
}
const final = measure(items.map((i) => `${TRIM}/${i.key}.mp3`));
let bad = 0;
for (const it of items) {
  const m = final[`${TRIM}/${it.key}.mp3`];
  const ok = m.peak >= 0.3 && m.peak < 0.99 && m.speech >= minSpeech(it.text) && m.lead <= 0.5;
  console.log(`  ${ok ? '✓' : '✗'} L${it.lesson + 1} «${it.text}» [${it.stage}]: ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`);
  if (!ok) bad++;
}
if (bad) { console.error(`⛔ ${bad} файли бад — ҳеҷ чиз бор нашуд`); process.exit(1); }

// ── 3. Ба репои CDN → push → навиштани audioUrl ─────────────────────────────
for (const it of items) copyFileSync(`${TRIM}/${it.key}.mp3`, `${CDN_DIR}/${it.key}.mp3`);
console.log(`
== Ба репо: ${items.length} файл ==`);
const dirty = execSync(`git status --porcelain audio/${LANG}`, { cwd: REPO }).toString().trim();
if (dirty) {
  execSync(`git add audio/${LANG}`, { cwd: REPO, stdio: 'inherit' });
  execSync(
    'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
    + '-c user.name="kholzoda2001-coder" commit -m "Speaking ' + LANG.toUpperCase() + ': audio for new phrases and partner lines"',
    { cwd: REPO, stdio: 'inherit' });
  execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
} else {
  console.log('  тағйирот нест — коммити ҷорӣ истифода мешавад');
}
const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
const cdn = (id) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/${LANG}/${id}.mp3`;
console.log('SHA:', sha);

let done = 0;
for (const it of items) {
  await sql.query(
    `UPDATE "SpeakingItem" SET "${it.col}" = $1 WHERE id = $2 AND coalesce("${it.col}", '') = ''`,
    [cdn(it.key), it.id]);
  if (++done % 50 === 0) console.log(`  ...${done}/${items.length}`);
}
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log(`
сабт шуд: ${done}/${items.length} · content_version ламс шуд`);
