// «Нутқи воқеӣ» — аудиои сатрҳои ҲАМСӮҲБАТ бо суръати аслӣ (27.09.2026).
//
// Курс ҳамсӯҳбатро бо овози тозаи студия (Chirp3-Kore, зан) медиҳад. Дар
// ҳаёт прораб мард аст, тез гап мезанад ва дар атроф садо ҳаст. Қадами
// `real` (ev 4) маҳз ҳамин фарқро меомӯзонад, пас овози он бояд ДИГАР бошад:
//   • гӯяндаи мард (`ru-RU-Chirp3-HD-Orus`, эҳтиётӣ Fenrir) — на овози курс;
//   • суръат 1.12× — нутқи муқаррарӣ, на нутқи «барои хориҷӣ»;
//   • садои мулоими атроф (brown noise, ~17 дБ пасттар аз овоз) ва 0.35 с
//     садо пеш аз гап — мисли занги воқеӣ ё кӯча.
//
// Танҳо навбатҳои (`turn`) нишастҳои МУКОЛАМА аз нишасти 4 (индекс ≥ 3, ниг.
// `REAL_FROM_POSITION` дар engine.ts) — дигар ҷо қадами `real` сохта намешавад.
// Матни шахсӣ ({name}, {job}) сабт намешавад.
//
//   node --dns-result-order=ipv4first prisma/_ru-speaking-real-audio.mjs <ramz-audio dir> [--dry]
//
// Идемпотент: танҳо воҳидҳои бе `cueRealAudioUrl`. Ҳамчунин сатри видоъи
// «Озод гап занед» (`freetalk_close_ru.mp3`, овози курс) агар набошад.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { execFileSync, execSync, spawnSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const REPO = process.argv[2];
if (!REPO || REPO.startsWith('--')) throw new Error('Истифода: node prisma/_ru-speaking-real-audio.mjs <ramz-audio dir> [--dry]');
const DRY = process.argv.includes('--dry');
const RU = 'cmpqk40yz00009rhl1uazdfi3';
const REAL_FROM_POSITION = 3;
const VOICES = ['ru-RU-Chirp3-HD-Orus', 'ru-RU-Chirp3-HD-Fenrir'];
const RATE = 1.12;
const COURSE_VOICE = 'ru-RU-Chirp3-HD-Kore';
const CLOSING = { key: 'freetalk_close_ru', text: 'Хорошо, спасибо! До встречи!' };
const CDN_DIR = `${REPO}/audio/ru`;
const WORK = 'tmp/ru-speaking-real';
// ⚠️ `python`-и оддӣ дар ин мошин баъзан ба «WindowsApps» (stub) меравад —
// роҳи пурра афзалтар, агар бошад.
const PYTHON = existsSync('C:/Users/ASUS1/AppData/Local/Python/pythoncore-3.14-64/python.exe')
  ? 'C:/Users/ASUS1/AppData/Local/Python/pythoncore-3.14-64/python.exe'
  : 'python';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split(/\r?\n/).filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const measure = (paths) => {
  const out = {};
  for (let i = 0; i < paths.length; i += 60) {
    const r = spawnSync(PYTHON, ['../tools/audio_check.py', ...paths.slice(i, i + 60)], PY);
    if (r.status !== 0) throw new Error(r.stderr);
    Object.assign(out, JSON.parse(r.stdout));
  }
  return out;
};
const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
// Ҳадди нутқ аз скрипти курс, вале барои суръати ТЕЗ (1.12×) кӯтоҳтар: «В час.»-и
// солим (peak 0.6) ҳамагӣ 0.12–0.14 с нутқ дорад ва ҳадди 0.18 онро рад мекард.
const minSpeech = (t) => (letters(t) <= 3 ? 0.12 : letters(t) <= 6 ? 0.18 : 0.25) * 0.65;
const personal = (t) => t.includes('{') || t.includes('___');

// ── Кадом навбатҳо ──────────────────────────────────────────────────────────
const rows = await sql.query(
  `SELECT i.id, i.cue AS text, i."cueRealAudioUrl" AS real, l.id AS lesson, l."categoryId" AS cat, l.stage,
          c."titleTranslated" AS title
     FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
    WHERE c."targetLanguageId" = $1 AND i.kind = 'turn' AND coalesce(trim(i.cue), '') <> ''
      AND coalesce(trim(i."cueTranslation"), '') <> ''
    ORDER BY c."order", l."order", i."order"`, [RU]);
// Рақами дарс дар вазъият — ҳамон `position`-и роут (дарсҳои фаъол бо `order`).
const lessonsByCat = {};
for (const l of await sql.query(
  `SELECT l.id, l."categoryId" AS cat FROM "SpeakingLesson" l JOIN "SpeakingCategory" c ON c.id = l."categoryId"
    WHERE c."targetLanguageId" = $1 AND l."isActive" ORDER BY l."order"`, [RU])) {
  (lessonsByCat[l.cat] ??= []).push(l.id);
}
const items = rows
  .filter((r) => r.stage === 'dialogue' && (lessonsByCat[r.cat] ?? []).indexOf(r.lesson) >= REAL_FROM_POSITION)
  .filter((r) => !personal(r.text) && !(r.real ?? '').trim())
  .map((r) => ({ ...r, key: `${r.id}_real` }));
console.log(`Навбатҳо барои «Нутқи воқеӣ»: ${items.length}`);
const cdnHas = existsSync(`${CDN_DIR}/${CLOSING.key}.mp3`);
if (DRY) {
  items.forEach((i) => console.log(`  ${i.title} · «${i.text}»`));
  console.log(`видоъ: ${cdnHas ? 'ҳаст' : 'сохта мешавад'}\n--dry: чизе сохта нашуд.`);
  process.exit(0);
}

async function synth(input, voice, rate = 1) {
  for (let a = 0; a < 4; a++) {
    const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, voice: { languageCode: 'ru-RU', name: voice }, audioConfig: { audioEncoding: 'MP3', speakingRate: rate } }),
    });
    const d = await res.json().catch(() => ({}));
    if (res.ok && d.audioContent) return Buffer.from(d.audioContent, 'base64');
    if (a === 3) return null;
    await new Promise((r) => setTimeout(r, 1500 * (a + 1)));
  }
  return null;
}

const FFMPEG = execFileSync(PYTHON, ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], PY).trim();
mkdirSync(WORK, { recursive: true });

/** Овози тоза + садои атроф: 0.35 с садо пеш, 0.3 с баъд, овоз −1 дБ. */
function addRoom(src, dst, seed) {
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', src,
    '-f', 'lavfi', '-i', `anoisesrc=color=brown:amplitude=1:seed=${seed}:sample_rate=24000`,
    '-filter_complex',
    '[0]aresample=24000,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.05,adelay=350|350,apad=pad_dur=0.3,volume=0.89[v];'
    + '[1]highpass=f=120,lowpass=f=3200,volume=0.07[n];'
    + '[v][n]amix=inputs=2:duration=first:normalize=0,alimiter=limit=0.95[o]',
    '-map', '[o]', '-ac', '1', '-ar', '24000', '-b:a', '64k', dst]);
}

// ── 1. Тавлид ───────────────────────────────────────────────────────────────
const made = [];
let seed = 7;
for (const it of items) {
  const clean = `${WORK}/${it.key}.clean.mp3`;
  const out = `${WORK}/${it.key}.mp3`;
  let ok = false;
  for (const voice of [...VOICES, ...VOICES]) {
    const buf = await synth({ text: it.text }, voice, RATE);
    if (!buf) continue;
    writeFileSync(clean, buf);
    const m = measure([clean])[clean];
    if (m.error || m.peak < 0.3 || m.speech < minSpeech(it.text)) {
      console.log(`  ↻ «${it.text}» ${voice}: peak=${m.peak} нутқ=${m.speech}s`);
      continue;
    }
    addRoom(clean, out, seed++);
    it.voice = voice;
    ok = true;
    break;
  }
  if (!ok) { console.error(`⛔ «${it.text}»: овоз нашуд — ҳеҷ чиз бор нашуд`); process.exit(1); }
  made.push(it);
}

// Видоъи «Озод гап занед» — овози КУРС (ҳамон ҳамсӯҳбати суҳбат), бе садо.
const closing = [];
if (!cdnHas) {
  const buf = await synth({ text: CLOSING.text }, COURSE_VOICE, 1);
  if (!buf) { console.error('⛔ видоъ нашуд'); process.exit(1); }
  writeFileSync(`${WORK}/${CLOSING.key}.mp3`, buf);
  closing.push(CLOSING);
}

// ── 2. Ченак ────────────────────────────────────────────────────────────────
const all = [...made.map((i) => ({ key: i.key, text: i.text, label: `${i.title} [${i.voice}]` })),
  ...closing.map((c) => ({ key: c.key, text: c.text, label: 'видоъ' }))];
const final = measure(all.map((i) => `${WORK}/${i.key}.mp3`));
let bad = 0;
for (const it of all) {
  const m = final[`${WORK}/${it.key}.mp3`];
  // Садо пеш аз гап ҚАСДАН аст, пас `lead` то 0.9 с иҷозат.
  const ok = !m.error && m.peak >= 0.3 && m.peak < 0.99 && m.speech >= minSpeech(it.text) && m.lead <= 0.9;
  console.log(`  ${ok ? '✓' : '✗'} ${it.label} «${it.text}»: ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`);
  if (!ok) bad++;
}
if (bad) { console.error(`⛔ ${bad} файли бад — ҳеҷ чиз бор нашуд`); process.exit(1); }
if (!all.length) { console.log('Ҳама тайёр.'); process.exit(0); }

// ── 3. Ба репо → push → навиштан ────────────────────────────────────────────
for (const it of all) copyFileSync(`${WORK}/${it.key}.mp3`, `${CDN_DIR}/${it.key}.mp3`);
execSync('git add audio/ru', { cwd: REPO, stdio: 'inherit' });
execSync(
  'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
  + '-c user.name="kholzoda2001-coder" commit -m "Speaking RU: real-speech partner lines and free-talk closing"',
  { cwd: REPO, stdio: 'inherit' });
execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
const cdn = (k) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/ru/${k}.mp3`;
console.log('SHA:', sha);

for (const it of made) {
  await sql.query(
    `UPDATE "SpeakingItem" SET "cueRealAudioUrl" = $1 WHERE id = $2 AND coalesce("cueRealAudioUrl", '') = ''`,
    [cdn(it.key), it.id]);
}
if (closing.length) console.log(`\n⚠️ Видоъ: ин URL-ро ба CLOSING_LINES.ru.audioUrl гузоред:\n  ${cdn(CLOSING.key)}`);
console.log(`\nсабт шуд: ${made.length} навбат`);
