// Аудиои бахши ГУФТОР — ОЛМОНӢ (боби «Kennenlernen / Шиносоӣ»).
//
// Овози гуфтор = овози КУРС: тамоми курси олмонӣ бо edge-tts
// `de-DE-KatjaNeural` сохта шудааст (ниг. [[ramz-german]]), пас боби гуфтор
// низ ҳамон овозро мегирад — вагарна дар як барнома ду овоз ба гӯш мезанад.
//
// Роҳ: edge-tts → ченак → буриши хомӯшӣ (`_ar-trim.py`) → репои `ramz-audio`
// → commit/push → `audioUrl` бо SHA-и коммит (jsDelivr).
//
// 🔴 Чаро jsDelivr, на Vercel Blob: анбори Blob 20.09.2026 баста шуд ва ҳар
// URL-и он 403 медиҳад (ниг. `_speaking-rehost-blob.mjs`).
//
//   node prisma/_de-speaking-audio.mjs <ramz-audio dir> [--dry]
//
// Идемпотент: танҳо воҳидҳои бе `audioUrl`.
import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync, copyFileSync } from 'fs';
import { execFileSync, execSync, spawnSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const REPO = process.argv[2];
if (!REPO || REPO.startsWith('--')) throw new Error('Истифода: node prisma/_de-speaking-audio.mjs <ramz-audio dir> [--dry]');
const DRY = process.argv.includes('--dry');

const DE = 'cmqdhvfj200001z591mfrnj4z';
const VOICE = 'de-DE-KatjaNeural';
const CDN_DIR = `${REPO}/audio/de`;
const WORK = 'tmp/de-speaking-audio';
const TRIM = `${WORK}-trim`;
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

// ⚠️ Дар як фармон на бештар аз 60 роҳ — вагарна дарозии фармони Windows
// мегузарад ва `spawnSync` бо exit 126 бармегардад.
const measure = (paths) => {
  const out = {};
  for (let i = 0; i < paths.length; i += 60) {
    const r = spawnSync('python', ['../tools/audio_check.py', ...paths.slice(i, i + 60)], PY);
    if (r.status !== 0) throw new Error(r.stderr);
    Object.assign(out, JSON.parse(r.stdout));
  }
  return out;
};
/**
 * Клипи солим? Меъёри «нутқ» НИСБӢ аст (мисли скрипти англисӣ): ҳуштаки
 * оғози калимаҳои олмонӣ («Straße», «Tschüss») энергияи паст дорад ва
 * ҳадди СОБИТ клипи солимро рад мекунад.
 */
const passes = (m) => m && !m.error && m.peak >= 0.25 && m.speech >= 0.1 && m.dur >= 0.25;
const keptSpeech = (cut, raw) => passes(cut) && cut.speech >= (raw?.speech ?? 0) * 0.8;

mkdirSync(WORK, { recursive: true });
mkdirSync(TRIM, { recursive: true });
mkdirSync(CDN_DIR, { recursive: true });

// ── 1. Воҳидҳо ──────────────────────────────────────────────────────────────
const items = await sql.query(
  `SELECT i.id, i.text, l."order" AS lesson
     FROM "SpeakingItem" i
     JOIN "SpeakingLesson" l ON i."lessonId" = l.id
     JOIN "SpeakingCategory" c ON l."categoryId" = c.id
    WHERE c."targetLanguageId" = $1 AND (i."audioUrl" IS NULL OR i."audioUrl" = '')
    ORDER BY l."order", i."order"`, [DE]);
console.log(`Воҳидҳои гуфтори олмонӣ бе аудио: ${items.length}`);
if (!items.length) { console.log('Ҳама аудио доранд.'); process.exit(0); }
if (DRY) { items.slice(0, 10).forEach((i) => console.log(`  L${i.lesson + 1} ${i.text}`)); console.log('--dry'); process.exit(0); }

// ── 2. Тавлид (edge-tts, овози курс) ────────────────────────────────────────
console.log(`\n== Тавлид (${VOICE}) ==`);
const job = `${WORK}/_job.json`;
let pending = items;
for (let attempt = 0; attempt < 3 && pending.length; attempt++) {
  writeFileSync(job, JSON.stringify(pending.map((i) => ({ id: i.id, text: i.text }))));
  for (const i of pending) if (existsSync(`${WORK}/${i.id}.mp3`)) rmSync(`${WORK}/${i.id}.mp3`);
  spawnSync('python', ['prisma/_ar-tts.py', WORK, job, VOICE], { ...PY, stdio: 'inherit' });
  const have = pending.filter((i) => existsSync(`${WORK}/${i.id}.mp3`));
  const m = measure(have.map((i) => `${WORK}/${i.id}.mp3`));
  pending = pending.filter((i) => {
    const v = m[`${WORK}/${i.id}.mp3`];
    if (passes(v)) return false;
    if (v) console.log(`  ↻ «${i.text}» peak=${v.peak} нутқ=${v.speech}`);
    return true;
  });
}
if (pending.length) { console.error(`⛔ садо надод: ${pending.map((i) => i.text).join(', ')}`); process.exit(1); }

// ── 3. Буриши хомӯшӣ ва муҳофиз ─────────────────────────────────────────────
const before = measure(items.map((i) => `${WORK}/${i.id}.mp3`));
for (const i of items) if (existsSync(`${TRIM}/${i.id}.mp3`)) rmSync(`${TRIM}/${i.id}.mp3`);
console.log(execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM], PY).trim());
{
  const cut = measure(items.map((i) => `${TRIM}/${i.id}.mp3`));
  for (const it of items) {
    if (keptSpeech(cut[`${TRIM}/${it.id}.mp3`], before[`${WORK}/${it.id}.mp3`])) continue;
    if (passes(before[`${WORK}/${it.id}.mp3`])) {
      copyFileSync(`${WORK}/${it.id}.mp3`, `${TRIM}/${it.id}.mp3`);
      console.log(`  ↩ «${it.text}»: нусхаи бурида хомӯш шуд → хом`);
    } else { console.error(`⛔ файли хомӯш баъди буриш: «${it.text}»`); process.exit(1); }
  }
}
// peak ≥0.97 → 15% оромтар.
const FFMPEG = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], PY).trim();
{
  const pre = measure(items.map((i) => `${TRIM}/${i.id}.mp3`));
  for (const it of items) {
    const p = `${TRIM}/${it.id}.mp3`;
    if (pre[p].peak < 0.97) continue;
    const tmp = `${TRIM}/${it.id}.vol.mp3`;
    execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', p, '-af', 'volume=0.85', '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp]);
    copyFileSync(tmp, p);
    rmSync(tmp);
    console.log(`  🔉 «${it.text}»: peak ${pre[p].peak} → оромтар`);
  }
}
{
  const final = measure(items.map((i) => `${TRIM}/${i.id}.mp3`));
  let bad = 0;
  const lead = [];
  const dur = [];
  for (const it of items) {
    const m = final[`${TRIM}/${it.id}.mp3`];
    lead.push(m.lead); dur.push(m.dur);
    const ok = m.peak < 0.995 && keptSpeech(m, before[`${WORK}/${it.id}.mp3`]);
    if (!ok) { console.log(`  ✗ L${it.lesson + 1} «${it.text}» ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`); bad++; }
  }
  lead.sort((a, b) => a - b); dur.sort((a, b) => a - b);
  console.log(`Баъди буриш: median пеш ${lead[Math.floor(lead.length / 2)]}s · дарозӣ ${dur[Math.floor(dur.length / 2)]}s · бад ${bad}`);
  if (bad) { console.error('⛔ файли бад ҳаст — ҳеҷ чиз ба CDN нарафт'); process.exit(1); }
}

// ── 4. Ба репои CDN → push → навиштани audioUrl ─────────────────────────────
for (const it of items) copyFileSync(`${TRIM}/${it.id}.mp3`, `${CDN_DIR}/${it.id}.mp3`);
console.log(`\n== Ба репо: ${items.length} файл ==`);
const dirty = execSync('git status --porcelain audio/de', { cwd: REPO }).toString().trim();
if (dirty) {
  execSync('git add audio/de', { cwd: REPO, stdio: 'inherit' });
  execSync(
    'git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" '
    + '-c user.name="kholzoda2001-coder" commit -m "Speaking DE: audio for the Kennenlernen chapter"',
    { cwd: REPO, stdio: 'inherit' });
  // ⚠️ Репо аз сессияҳои дигар ҳам коммит мегирад — push метавонад рад шавад;
  // дар он ҳолат `fetch && rebase && push` дастӣ, сипас ҳамин скриптро аз нав.
  execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
} else {
  console.log('  тағйирот нест — коммити ҷорӣ истифода мешавад');
}
const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
const cdn = (id) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/de/${id}.mp3`;
console.log('SHA:', sha);

let done = 0;
for (const it of items) {
  await sql.query(
    `UPDATE "SpeakingItem" SET "audioUrl" = $1 WHERE id = $2 AND ("audioUrl" IS NULL OR "audioUrl" = '')`,
    [cdn(it.id), it.id]);
  if (++done % 50 === 0) console.log(`  ...${done}/${items.length}`);
}
await sql.query(
  `INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log(`\nсабт шуд: ${done}/${items.length} · content_version ламс шуд`);
