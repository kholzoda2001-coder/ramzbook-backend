// RU · A1 — ИВАЗИ як мисоли грамматика бо аудиои нав (14.10.2026).
//
// «У них есть трое детей.» (M2 «У меня есть») — «трое» (шумораи ҷамъӣ) аз сатҳи A1 берун аст
// ва «У них трое детей» мегӯянд. Ба ҷояш: «У них есть большая семья.» — ҳамон сохт,
// калимаҳои аз M2 маълум.
//
// Овоз = Chirp3-HD-Kore (ҳамон овози мисолҳои грамматикаи русӣ, 34 kbps), хомӯшии сар
// бурида (`_ar-trim.py`), санҷиш бо `tools/audio_check.py`. Файл → клони `ramz-audio`
// (Desktop/RAMZ/ramz-audio) → push → md5-и CDN → база.
//
//   node prisma/_ru-a1-example-audio.mjs            # dry-run
//   node prisma/_ru-a1-example-audio.mjs --apply
import { readFileSync, writeFileSync, mkdirSync, copyFileSync, existsSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 — мисоли грамматика бо аудиои нав');
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const REPO = 'C:/Users/ASUS1/Desktop/RAMZ/ramz-audio';
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const WORK = 'tmp/ru-a1-example-audio';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };

const OLD = 'У них есть трое детей.';
const NEW = { sentence: 'У них есть большая семья.', translation: 'Онҳо оилаи калон доранд.' };

const rows = await sql`SELECT x.id,x.sentence,x.translation,x."audioUrl",x.highlight FROM "GrammarExample" x
  JOIN "GrammarTopic" t ON t.id=x."topicId" WHERE t."courseId"=${COURSE_RU_A1} AND x.sentence IN (${OLD}, ${NEW.sentence})`;
if (rows.length !== 1) throw new Error(`1 сатр интизор буд, ${rows.length}`);
const row = rows[0];
if (row.sentence === NEW.sentence) { done(0, 'аллакай нав'); process.exit(0); }
console.log(`  «${row.sentence}» → «${NEW.sentence}» (${NEW.translation})`);
if (!APPLY) { done(1); process.exit(0); }

mkdirSync(`${WORK}/raw`, { recursive: true });
mkdirSync(`${WORK}/trim`, { recursive: true });
let ok = false;
for (let a = 0; a < 5 && !ok; a++) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input: { text: NEW.sentence }, voice: { languageCode: 'ru-RU', name: 'ru-RU-Chirp3-HD-Kore' }, audioConfig: { audioEncoding: 'MP3' } }),
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok || !d.audioContent) { await new Promise((r) => setTimeout(r, 2000)); continue; }
  writeFileSync(`${WORK}/raw/${row.id}.mp3`, Buffer.from(d.audioContent, 'base64'));
  execFileSync('py', ['prisma/_ar-trim.py', `${WORK}/raw`, `${WORK}/trim`], PY);
  const r = spawnSync('py', ['../tools/audio_check.py', `${WORK}/trim/${row.id}.mp3`], PY);
  const m = Object.values(JSON.parse(r.stdout))[0];
  const letters = (NEW.sentence.match(/\p{L}/gu) ?? []).length;
  const perLetter = m.speech / letters;
  console.log(`  кӯшиши ${a + 1}: ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak} (${perLetter.toFixed(3)} с/ҳарф)`);
  ok = m.peak >= 0.3 && m.peak < 0.99 && m.lead <= 0.3 && m.speech >= 0.8 && perLetter > 0.035 && perLetter < 0.12;
}
if (!ok) { console.error('⛔ клипи хуб нашуд — ҳеҷ чиз бор нашуд'); process.exit(1); }

const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
git(['pull', '-q', '--ff-only', 'origin', 'main']);
const rel = `audio/ru-a1/gex-${row.id}.mp3`;
mkdirSync(`${REPO}/audio/ru-a1`, { recursive: true });
copyFileSync(`${WORK}/trim/${row.id}.mp3`, `${REPO}/${rel}`);
git(['add', rel]);
git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-q', '-m', 'RU A1: example audio «У них есть большая семья.»']);
git(['push', '-q', 'origin', 'HEAD:main']);
const sha = git(['rev-parse', 'HEAD']);
const url = `${CDN}@${sha}/${rel}`;
console.log(`  commit ${sha.slice(0, 8)} → ${url}`);

const want = execFileSync('py', ['../tools/audio_check.py', `${WORK}/trim/${row.id}.mp3`], PY);
const md5 = Object.values(JSON.parse(want))[0].md5;
let seen = false;
for (let a = 1; a <= 8 && !seen; a++) {
  const r = spawnSync('py', ['../tools/audio_check.py', url], PY);
  try { seen = Object.values(JSON.parse(r.stdout))[0].md5 === md5; } catch { seen = false; }
  if (!seen) { console.log(`  CDN кӯшиши ${a}: ҳанӯз нест…`); await new Promise((r) => setTimeout(r, 15000)); }
}
if (!seen) { console.error('⛔ CDN md5 надод — база даст нахӯрд'); process.exit(1); }

await sql`UPDATE "GrammarExample" SET sentence=${NEW.sentence}, translation=${NEW.translation}, "audioUrl"=${url} WHERE id=${row.id}`;
const [chk] = await sql`SELECT sentence,"audioUrl" u FROM "GrammarExample" WHERE id=${row.id}`;
if (chk.sentence !== NEW.sentence || chk.u !== url) throw new Error('ТАСДИҚ НАШУД');
const [t] = await sql`SELECT l."moduleId" mid FROM "GrammarExample" x JOIN "Lesson" l ON l."grammarTopicId"=x."topicId" WHERE x.id=${row.id}`;
if (t) await sql`UPDATE "Module" SET "contentVersion"="contentVersion"+1 WHERE id=${t.mid}`;
done(1, `аудио: ${url}`);
