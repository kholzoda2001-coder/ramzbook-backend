// Аудиои бахши ГУФТОР — АРАБӢ (боби «التَّعَارُف / Шиносоӣ»).
//
// Мисли `_ru-speaking-audio.mjs`: овози гуфтор = овози КУРС. Курси арабӣ бо
// edge-tts `ar-SA-ZariyahNeural` сохта шудааст (`_ar-tts.py`), бо буриши
// хомӯшии сар (`_ar-trim.py`) ва боркунӣ ба Vercel Blob.
//
// Ҳар клип чен мешавад; зинаҳо пай дар пай:
//   1. Zariyah (×2)
//   2. клипи ҲАМОН калима аз дарсҳои курси арабӣ (хонанда ҳамон овозро мешунавад)
//   3. Zariyah (×1, охирин)
// Ягон клипи хомӯш ба база намеравад.
//
//   node prisma/_ar-speaking-audio.mjs [--dry]
//
// Идемпотент: танҳо воҳидҳои бе `audioUrl`.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { createHash } from 'crypto';
import { neon } from '@neondatabase/serverless';
import { SignJWT } from 'jose';

const DRY = process.argv.includes('--dry');
const AR = 'cmqdqfuxi00001rcsseeq42fi';
const VOICE = 'ar-SA-ZariyahNeural';
const BASE = 'https://admin.ramz.tj';
const WORK = 'tmp/ar-speaking-audio';
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
// `\p{L}` ҳаракатҳоро (Mn) намешуморад — танҳо ҳарфҳои асосӣ.
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
// ⚠️ «فِي» (2 ҳарф) табиатан ~0.10 с садо дорад — ҳам edge, ҳам клипи курс (13.09.2026).
const minSpeech = (t) => (letters(t) <= 2 ? 0.08 : letters(t) <= 3 ? 0.12 : letters(t) <= 6 ? 0.18 : 0.25);
// Калиди муқоиса бо калимаҳои курс: бе ҳаракат, бе аломат, алифҳо як хел.
const normKey = (s) => s.replace(/[ً-ْٰ]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/[^\p{L}]/gu, '');

const items = await sql.query(
  `SELECT i.id, i.text, l."order" AS lesson
     FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
    WHERE c."targetLanguageId" = $1 AND (i."audioUrl" IS NULL OR i."audioUrl" = '')
    ORDER BY l."order", i."order"`, [AR]);
console.log(`Воҳидҳои гуфтори арабӣ бе аудио: ${items.length}`);
if (!items.length) { console.log('Ҳама аудио доранд.'); process.exit(0); }
if (DRY) { items.forEach((i) => console.log(`  L${i.lesson + 1} ${i.text}`)); console.log('--dry: чизе сохта нашуд.'); process.exit(0); }

const wordClip = {};
for (const w of await sql.query(
  `SELECT w.word, w."audioUrl" au FROM "Word" w JOIN "Lesson" l ON l.id = w."lessonId" JOIN "Module" m ON m.id = l."moduleId"
     JOIN "Course" c ON c.id = m."courseId" WHERE c."targetLanguageId" = $1 AND coalesce(w."audioUrl", '') <> ''`, [AR])) {
  wordClip[normKey(w.word)] ??= w.au;
}

/** edge-tts барои як гурӯҳ: `_ar-tts.py` файлҳоро ба WORK менависад. */
function edgeBatch(list) {
  const job = `${WORK}/_job.json`;
  writeFileSync(job, JSON.stringify(list.map((i) => ({ id: i.id, text: i.text }))));
  for (const i of list) if (existsSync(`${WORK}/${i.id}.mp3`)) rmSync(`${WORK}/${i.id}.mp3`);
  spawnSync('python', ['prisma/_ar-tts.py', WORK, job, VOICE], PY);
}
const passes = (m, t) => m && !m.error && m.peak >= 0.3 && m.speech >= minSpeech(t);

// ── 1. Тавлид бо муҳофиз ────────────────────────────────────────────────────
console.log(`\n== Тавлид (${VOICE}) ==`);
mkdirSync(WORK, { recursive: true });
let pending = items;
const STAGES = ['edge', 'edge', 'course-clip', 'edge'];
for (const stage of STAGES) {
  if (!pending.length) break;
  if (stage === 'edge') edgeBatch(pending);
  else {
    for (const it of pending) {
      const u = wordClip[normKey(it.text)];
      if (!u) continue;
      const r = await fetch(u);
      if (r.ok) writeFileSync(`${WORK}/${it.id}.mp3`, Buffer.from(await r.arrayBuffer()));
    }
  }
  const have = pending.filter((i) => existsSync(`${WORK}/${i.id}.mp3`));
  const m = have.length ? measure(have.map((i) => `${WORK}/${i.id}.mp3`)) : {};
  const next = [];
  for (const it of pending) {
    const v = m[`${WORK}/${it.id}.mp3`];
    if (passes(v, it.text)) it.stage = stage;
    else {
      if (v) console.log(`  ↻ «${it.text}» ${stage}: peak=${v.peak} нутқ=${v.speech}s`);
      next.push(it);
    }
  }
  pending = next;
}
if (pending.length) { console.error(`⛔ ҳеҷ зина садо надод: ${pending.map((i) => i.text).join(', ')}`); process.exit(1); }

// ── 2. Буриши хомӯшӣ ────────────────────────────────────────────────────────
console.log(execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM], PY).trim());
{
  const raw = measure(items.map((i) => `${WORK}/${i.id}.mp3`));
  const cut = measure(items.map((i) => `${TRIM}/${i.id}.mp3`));
  for (const it of items) {
    if (passes(cut[`${TRIM}/${it.id}.mp3`], it.text)) continue;
    if (passes(raw[`${WORK}/${it.id}.mp3`], it.text)) {
      writeFileSync(`${TRIM}/${it.id}.mp3`, readFileSync(`${WORK}/${it.id}.mp3`));
      console.log(`  ↩ «${it.text}»: нусхаи бурида хомӯш шуд → хом`);
    } else { console.error(`⛔ файли хомӯш баъди буриш: «${it.text}»`); process.exit(1); }
  }
}

// peak ≥0.97 → 15% оромтар (ниг. `_ru-speaking-audio.mjs`).
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
  console.log(`  ${ok ? '✓' : '✗'} L${it.lesson + 1} [${it.stage}] ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`);
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
  fd.append('file', new File([buf], `ar_speak_${it.id}.mp3`, { type: 'audio/mpeg' }));
  const up = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd });
  const body = await up.json().catch(() => ({}));
  if (!up.ok || !body.url) { console.log(`  ✗ ${it.id}: upload ${up.status}`); continue; }
  const back = Buffer.from(await (await fetch(body.url)).arrayBuffer());
  if (createHash('md5').update(back).digest('hex') !== createHash('md5').update(buf).digest('hex')) {
    console.log(`  ✗ ${it.id}: файли боршуда бо нусхаи маҳаллӣ баробар нест`);
    continue;
  }
  await sql.query(`UPDATE "SpeakingItem" SET "audioUrl" = $1 WHERE id = $2 AND ("audioUrl" IS NULL OR "audioUrl" = '')`, [body.url, it.id]);
  done++;
}
console.log(`\nсабт шуд: ${done}/${items.length}`);
if (done !== items.length) process.exit(1);
