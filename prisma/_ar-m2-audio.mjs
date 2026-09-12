// Аудио барои он чизе, ки дар Модули 2 НАВ ё ИВАЗ шуд.
//
//   1. 7 калимаи нав (4 рақам + مِصْر + رُوسِيَا + لَنْدَن) — аудио надоранд.
//   2. 4 матн, ки калимаашон иваз шуд — аудиои кӯҳна дигар рост намеояд.
//
// ⚠️ Муколама ва мисолҳои грамматика ин ҷо НЕСТАНД: онҳо танҳо ҲАРАКАТ
// гирифтанд, талаффуз ҳамон монд, пас аудиои мавҷуда дуруст аст.
//
//   node prisma/_ar-m2-audio.mjs --dry
//   node prisma/_ar-m2-audio.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const VOICE = 'ar-SA-ZariyahNeural';
const WORK = 'tmp/ar-m2-audio';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';

const [course] = await q(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await q(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=1`, [course.id]);
const lessons = await q(`SELECT id, "comprehensionId" FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
const lids = lessons.map((l) => l.id);
const compIds = lessons.map((l) => l.comprehensionId).filter(Boolean);

const words = await q(
  `SELECT id, word AS txt FROM "Word"
    WHERE "lessonId"=ANY($1) AND (("audioUrl" IS NULL) OR "audioUrl"='')`, [lids]);
// Ҳамаи чор матни ин модул аз нав навишта шуданд.
const passages = await q(
  `SELECT id, passage AS txt, "titleTranslated" AS t FROM "ComprehensionExercise"
    WHERE id=ANY($1)`, [compIds]);

const items = [
  ...words.map((r) => ({ ...r, table: 'Word' })),
  ...passages.map((r) => ({ ...r, table: 'ComprehensionExercise' })),
];
console.log(`калимаи бе аудио: ${words.length} · матни ивазшуда: ${passages.length}`);
for (const it of items) console.log(`  ${it.table === 'Word' ? 'калима' : 'матн  '} ${it.txt.slice(0, 60)}`);
if (!items.length) { console.log('\nҲама чиз аудио дорад.'); process.exit(0); }
if (DRY) { console.log(`\n[dry] ${items.length} файл.`); process.exit(0); }

mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.txt })), null, 1));
console.log(`\n== Тавлид (edge-tts, ${VOICE}) ==`);
const out = execFileSync('python', ['prisma/_ar-tts.py', WORK, `${WORK}/items.json`, VOICE],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-3).join('\n'));

console.log('\n== Репои аудио ==');
const git = (args, cwd = REPO) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
// ⚠️ Клони муваққатӣ метавонад вайрон бошад (`.git` бе HEAD/config).
// Онро санҷида, зарур бошад аз нав месозем — вагарна «not a git repository».
let ok = existsSync(`${REPO}/.git/HEAD`) && existsSync(`${REPO}/.git/config`);
if (ok) { try { git(['rev-parse', '--is-inside-work-tree']); } catch { ok = false; } }
if (!ok) {
  if (existsSync(REPO)) execFileSync('cmd', ['/c', 'rmdir', '/s', '/q', REPO.replace(/\//g, '\\')]);
  execFileSync('git', ['clone', '--depth', '1', '--filter=blob:none', '--no-checkout',
    'https://github.com/kholzoda2001-coder/ramz-audio', REPO], { encoding: 'utf8' });
  git(['sparse-checkout', 'set', 'audio/ar']);
  git(['checkout', 'main']);
} else {
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
}
for (const it of items) copyFileSync(`${WORK}/${it.id}.mp3`, `${REPO}/audio/ar/${it.id}.mp3`);
git(['add', 'audio/ar']);
if (!git(['status', '--porcelain']).trim()) console.log('файли нав нест');
else {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj',
    'commit', '-m', 'Arabic A1 Module 2: audio for 7 new words and 4 rewritten passages']);
  git(['push', 'origin', 'main']);
  console.log('push шуд');
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);

console.log('\n== Сабт ==');
for (const it of items) {
  await q(`UPDATE "${it.table}" SET "audioUrl"=$1 WHERE id=$2`,
    [`${CDN}@${sha}/audio/ar/${it.id}.mp3`, it.id]);
}
console.log(`✓ ${items.length} истинод сабт шуд`);
