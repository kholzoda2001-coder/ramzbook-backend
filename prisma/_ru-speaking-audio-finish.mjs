// Анҷоми `_ru-speaking-audio.mjs`, вақте тавлид ГУЗАШТ, вале ЯК-ДУ файл дар
// санҷиши ниҳоӣ афтод (26.09.2026: «Сколько» — нусхаи бурида хомӯш, хом бо
// 0.92 с сукут дар аввал). Тавлиди 460+ файлро такрор намекунад:
//   1. ҳамон рӯйхати калидҳоро аз база мегирад;
//   2. файлҳои бад: сукути аввалро бо ffmpeg `silenceremove`-и мулоим мебурад;
//   3. ҳамаро аз нав чен мекунад — як файли бад ҳам бошад, ҳеҷ чиз бор намешавад;
//   4. ба репо → commit → push → URL ба база (танҳо майдонҳои холӣ).
//
//   node prisma/_ru-speaking-audio-finish.mjs <ramz-audio dir> [--dry]
import { readFileSync, writeFileSync, copyFileSync, existsSync } from 'fs';
import { execFileSync, execSync, spawnSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const REPO = process.argv[2];
if (!REPO || REPO.startsWith('--')) throw new Error('Истифода: node prisma/_ru-speaking-audio-finish.mjs <ramz-audio dir> [--dry]');
const DRY = process.argv.includes('--dry');
const RU = 'cmpqk40yz00009rhl1uazdfi3';
const WORK = 'tmp/ru-speaking-audio';
const TRIM = `${WORK}-trim`;
const CDN_DIR = `${REPO}/audio/ru`;
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
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
const minSpeech = (t) => (letters(t) <= 3 ? 0.12 : letters(t) <= 6 ? 0.18 : 0.25);
const ok = (m, t) => m && !m.error && m.peak >= 0.3 && m.peak < 0.99 && m.speech >= minSpeech(t) && m.lead <= 0.5;

// Ҳамон рӯйхати `_ru-speaking-audio.mjs`.
const personal = (t) => t.includes('{') || t.includes('___');
const items = [
  ...(await sql.query(
    `SELECT i.id, i.text FROM "SpeakingItem" i JOIN "SpeakingLesson" l ON i."lessonId" = l.id
       JOIN "SpeakingCategory" c ON l."categoryId" = c.id
      WHERE c."targetLanguageId" = $1 AND coalesce(i."audioUrl", '') = ''`, [RU]))
    .map((r) => ({ ...r, key: r.id, col: 'audioUrl' })),
  ...(await sql.query(
    `SELECT i.id, i.cue AS text FROM "SpeakingItem" i JOIN "SpeakingLesson" l ON i."lessonId" = l.id
       JOIN "SpeakingCategory" c ON l."categoryId" = c.id
      WHERE c."targetLanguageId" = $1 AND coalesce(trim(i.cue), '') <> '' AND coalesce(i."cueAudioUrl", '') = ''`, [RU]))
    .map((r) => ({ ...r, key: `${r.id}_cue`, col: 'cueAudioUrl' })),
].filter((i) => !personal(i.text));
console.log(`калидҳо: ${items.length}`);
const missing = items.filter((i) => !existsSync(`${TRIM}/${i.key}.mp3`));
if (missing.length) { console.error('⛔ файл нест:', missing.map((i) => i.text).join(', ')); process.exit(1); }

const FFMPEG = execFileSync('python', ['-c', 'import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())'], PY).trim();
let m = measure(items.map((i) => `${TRIM}/${i.key}.mp3`));
for (const it of items) {
  const p = `${TRIM}/${it.key}.mp3`;
  if (ok(m[p], it.text)) continue;
  // Сукути аввал: ҳадди мулоими −50 dB, 0.08 с пеш аз нутқ мемонад.
  const raw = `${WORK}/${it.key}.mp3`;
  const tmp = `${TRIM}/${it.key}.fix.mp3`;
  execFileSync(FFMPEG, ['-y', '-loglevel', 'error', '-i', raw, '-af',
    'silenceremove=start_periods=1:start_threshold=-50dB:start_silence=0.08,volume=0.9',
    '-ar', '24000', '-ac', '1', '-b:a', '64k', tmp]);
  writeFileSync(p, readFileSync(tmp));
  console.log(`  ✂ «${it.text}»: сукути аввал бурида шуд`);
}
m = measure(items.map((i) => `${TRIM}/${i.key}.mp3`));
const bad = items.filter((i) => !ok(m[`${TRIM}/${i.key}.mp3`], i.text));
for (const b of bad) console.error(`  ✗ «${b.text}»`, JSON.stringify(m[`${TRIM}/${b.key}.mp3`]));
if (bad.length) { console.error(`⛔ ${bad.length} файли бад — ҳеҷ чиз бор нашуд`); process.exit(1); }
console.log(`ҳама ${items.length} файл солим`);
if (DRY) process.exit(0);

for (const it of items) copyFileSync(`${TRIM}/${it.key}.mp3`, `${CDN_DIR}/${it.key}.mp3`);
execSync('git add audio/ru', { cwd: REPO, stdio: 'inherit' });
execSync('git -c user.email="255218020+kholzoda2001-coder@users.noreply.github.com" -c user.name="kholzoda2001-coder" '
  + 'commit -m "Speaking RU: audio for niche 1 (construction A1) phrases and partner lines"', { cwd: REPO, stdio: 'inherit' });
execSync('git pull --rebase origin main', { cwd: REPO, stdio: 'inherit' });
execSync('git push origin HEAD', { cwd: REPO, stdio: 'inherit' });
const sha = execSync('git rev-parse HEAD', { cwd: REPO }).toString().trim();
const cdn = (key) => `https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio@${sha}/audio/ru/${key}.mp3`;
const probe = await fetch(cdn(items[0].key), { method: 'HEAD' });
if (!probe.ok) throw new Error(`CDN ${probe.status} — база навишта нашуд`);
let done = 0;
for (const it of items) {
  await sql.query(`UPDATE "SpeakingItem" SET "${it.col}" = $1 WHERE id = $2 AND coalesce("${it.col}", '') = ''`,
    [cdn(it.key), it.id]);
  done++;
}
await sql.query(`INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version', '"1"', NOW())
   ON CONFLICT (key) DO UPDATE SET "updatedAt" = NOW()`);
console.log(`SHA ${sha} · сабт шуд: ${done} · content_version ламс шуд`);
