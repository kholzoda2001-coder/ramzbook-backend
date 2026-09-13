// Аудиои бахши ГУФТОР — РУСӢ (боби «Знакомство / Шиносоӣ»).
//
// Мисли `_ko-speaking-audio.mjs`: овози гуфтор = овози КУРС. Барои тамоми русӣ
// қарори доимӣ `ru-RU-Chirp3-HD-Kore` аст (ниг. `_grammar-ex-audio.mjs`), бо
// буриши хомӯшии сар (`_ar-trim.py`) ва боркунӣ ба Vercel Blob.
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
//   node prisma/_ru-speaking-audio.mjs [--dry]
//
// Идемпотент: танҳо воҳидҳои бе `audioUrl`.
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';

const DRY = process.argv.includes('--dry');
const RU = 'cmpqk40yz00009rhl1uazdfi3';
const VOICE = 'ru-RU-Chirp3-HD-Kore';
const FALLBACK_VOICE = 'ru-RU-Wavenet-C';
const BASE = 'https://admin.ramz.tj';
const WORK = 'tmp/ru-speaking-audio';
const TRIM = `${WORK}-trim`;
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const measure = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths], PY);
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout);
};
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
// Калимаи кӯтоҳ табиатан кам садои баланд дорад: «Пока» 0.24 с, «Тоже» 0.22 с — клипҳои
// СОЛИМ, ки ҳадди 0.25-и ҷумла онҳоро бефоида рад мекард (13.09.2026).
const minSpeech = (t) => (letters(t) <= 3 ? 0.12 : letters(t) <= 6 ? 0.18 : 0.25);
const normKey = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

const items = await sql.query(
  `SELECT i.id, i.text, l."order" AS lesson
     FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
    WHERE c."targetLanguageId" = $1 AND (i."audioUrl" IS NULL OR i."audioUrl" = '')
    ORDER BY l."order", i."order"`, [RU]);
console.log(`Воҳидҳои гуфтори русӣ бе аудио: ${items.length}`);
if (!items.length) { console.log('Ҳама аудио доранд.'); process.exit(0); }
if (DRY) { items.forEach((i) => console.log(`  L${i.lesson + 1} ${i.text}`)); console.log('--dry: чизе сохта нашуд.'); process.exit(0); }

// Клипҳои калимаҳои курси русӣ — зинаи 3.
const wordClip = {};
for (const w of await sql.query(
  `SELECT w.word, w."audioUrl" au FROM "Word" w JOIN "Lesson" l ON l.id = w."lessonId" JOIN "Module" m ON m.id = l."moduleId"
     JOIN "Course" c ON c.id = m."courseId" WHERE c."targetLanguageId" = $1 AND coalesce(w."audioUrl", '') <> ''`, [RU])) {
  wordClip[normKey(w.word)] ??= w.au;
}

async function synth(input, voice) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, voice: { languageCode: 'ru-RU', name: voice }, audioConfig: { audioEncoding: 'MP3' } }),
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
    const r = await fetch(u);
    return r.ok ? Buffer.from(await r.arrayBuffer()) : null;
  } },
  { name: 'wavenet', make: (t) => synth({ text: t }, FALLBACK_VOICE) },
  { name: 'wavenet', make: (t) => synth({ text: t }, FALLBACK_VOICE) },
];

// ── 1. Тавлид бо муҳофиз ────────────────────────────────────────────────────
console.log(`\n== Тавлид (${VOICE}) ==`);
mkdirSync(WORK, { recursive: true });
const used = {};
for (const it of items) {
  const path = `${WORK}/${it.id}.mp3`;
  let ok = false;
  for (const [n, st] of STAGES.entries()) {
    const buf = await st.make(it.text);
    if (!buf) continue;
    writeFileSync(path, buf);
    const m = measure([path])[path];
    ok = !m.error && m.peak >= 0.3 && m.speech >= minSpeech(it.text);
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
console.log(execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM], PY).trim());
// ⚠️ `useTrimOrRaw`-и кореягӣ ҳадди худро дорад (садои воқеӣ < 0.20 с = хомӯш) — «Я» ва «Да»-и
// СОЛИМ ~0.12–0.19 с садо доранд ва онҳоро рад мекард (13.09.2026). Ин ҷо ҳамон ҳадди `minSpeech`:
// нусхаи бурида нагузарад, вале хом гузарад → хом (~0.2 с хомӯшии иловагӣ беҳтар аз хомӯшии пурра).
{
  const raw = measure(items.map((i) => `${WORK}/${i.id}.mp3`));
  const cut = measure(items.map((i) => `${TRIM}/${i.id}.mp3`));
  const passes = (v, t) => v && !v.error && v.peak >= 0.3 && v.speech >= minSpeech(t);
  let usedRaw = 0;
  const still = [];
  for (const it of items) {
    if (passes(cut[`${TRIM}/${it.id}.mp3`], it.text)) continue;
    if (passes(raw[`${WORK}/${it.id}.mp3`], it.text)) {
      writeFileSync(`${TRIM}/${it.id}.mp3`, readFileSync(`${WORK}/${it.id}.mp3`));
      usedRaw++;
      console.log(`  ↩ «${it.text}»: нусхаи бурида хомӯш шуд → хом`);
    } else still.push(it.text);
  }
  if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд`);
  if (still.length) { console.error('⛔ файли хомӯш баъди буриш:', still.join(', ')); process.exit(1); }
}

// Буриш клипро аз нав рамзгузорӣ мекунад ва peak-и Chirp3 (~0.98) баъзан ба 0.99+ мерасад
// («Здравствуйте», «Как» — 13.09.2026). Чунин клип 15% оромтар карда мешавад.
// ffmpeg дар PATH нест — бинарӣ аз бастаи Python `imageio_ffmpeg` меояд (ниг. хотираи ramz-audio-audit).
const FFMPEG = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], PY).trim();
{
  const pre = measure(items.map((i) => `${TRIM}/${i.id}.mp3`));
  for (const it of items) {
    const p = `${TRIM}/${it.id}.mp3`;
    if (pre[p].peak < 0.97) continue;
    const tmp = `${TRIM}/${it.id}.vol.mp3`;
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', p, '-af', 'volume=0.85', '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp]);
    writeFileSync(p, readFileSync(tmp));
    console.log(`  🔉 «${it.text}»: peak ${pre[p].peak} → оромтар`);
  }
}
const final = measure(items.map((i) => `${TRIM}/${i.id}.mp3`));
let bad = 0;
for (const it of items) {
  const m = final[`${TRIM}/${it.id}.mp3`];
  const ok = m.peak >= 0.3 && m.peak < 0.99 && m.speech >= minSpeech(it.text) && m.lead <= 0.5;
  console.log(`  ${ok ? '✓' : '✗'} L${it.lesson + 1} «${it.text}» [${it.stage}]: ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`);
  if (!ok) bad++;
}
if (bad) { console.error(`⛔ ${bad} файли бад — ҳеҷ чиз бор нашуд`); process.exit(1); }

// ── 3. Боркунӣ → санҷиши md5 → сабт ─────────────────────────────────────────
const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('4h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
let done = 0;
for (const it of items) {
  const buf = readFileSync(`${TRIM}/${it.id}.mp3`);
  const fd = new FormData();
  fd.append('file', new File([buf], `ru_speak_${it.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd });
  const body = await up.json().catch(() => ({}));
  if (!up.ok || !body.url) { console.log(`  ✗ «${it.text}»: upload ${up.status}`); continue; }
  const back = Buffer.from(await (await fetch(body.url)).arrayBuffer());
  if (createHash('md5').update(back).digest('hex') !== createHash('md5').update(buf).digest('hex')) {
    console.log(`  ✗ «${it.text}»: файли боршуда бо нусхаи маҳаллӣ баробар нест`);
    continue;
  }
  await sql.query(`UPDATE "SpeakingItem" SET "audioUrl" = $1 WHERE id = $2 AND ("audioUrl" IS NULL OR "audioUrl" = '')`, [body.url, it.id]);
  done++;
}
console.log(`\nсабт шуд: ${done}/${items.length}`);
if (done !== items.length) process.exit(1);
