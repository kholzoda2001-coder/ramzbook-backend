// Аудио барои он чизе, ки дар Модули 1-и арабӣ НАВ ё ИВАЗ шуд.
//
// Ду гурӯҳ:
//   1. 5 калимаи нав (كَيْفَ حَالُكَ، تَشَرَّفْنَا، أَيْضاً، مُعَلِّم، طَالِب) — аудио надоранд.
//   2. 2 матн, ки калимаашон иваз шуд (шунавоӣ ва такрор) — аудиои кӯҳна
//      дигар ба матн рост намеояд, пас аз нав сохта мешавад.
//
// ⚠️ Матнҳое ки танҳо ҲАРАКАТ гирифтанд ин ҷо НЕСТАНД: талаффуз иваз
// нашудааст, пас аудиои мавҷуда дуруст мемонад ва даст расондан ба он
// хатари беҳуда мебуд.
//
//   node prisma/_ar-m1-audio.mjs --dry
//   node prisma/_ar-m1-audio.mjs
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
const VOICE = 'ar-SA-ZariyahNeural';     // ҳамон овози тамоми курси арабӣ
const WORK = 'tmp/ar-m1-audio';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';

const [course] = await q(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await q(`SELECT id FROM "Module" WHERE "courseId"=$1 ORDER BY "order" LIMIT 1`, [course.id]);
const lessons = await q(`SELECT id, "comprehensionId" FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
const lids = lessons.map((l) => l.id);
const compIds = lessons.map((l) => l.comprehensionId).filter(Boolean);

// ── 1. Матнҳое ки калимаашон иваз мешавад ──────────────────────────────
const REWRITE = [
  ['Шунавоӣ: Шиносоӣ',
    'مَرْحَباً! اِسْمِي سَارَة. أَنَا مُعَلِّمَةٌ. صَبَاحُ الخَيْر! هَذَا صَدِيقِي عُمَر. هُوَ طَالِبٌ. تَشَرَّفْنَا. مَعَ السَّلَامَة، إِلَى اللِّقَاء!',
    'Салом! Номи ман Сара аст. Ман муаллима ҳастам. Субҳ ба хайр! Ин дӯсти ман Умар аст. Ӯ донишҷӯ аст. Аз шиносоӣ шодам. Хайр, то дидор!'],
  ['Такрори модул: Саломпурсӣ',
    'صَبَاحُ الخَيْر! اِسْمِي أَحْمَد. أَنَا طَالِبٌ. هَذَا صَدِيقِي كَرِيم. هُوَ مُعَلِّمٌ. شُكْراً وَمَعَ السَّلَامَة!',
    'Субҳ ба хайр! Номи ман Аҳмад аст. Ман донишҷӯ ҳастам. Ин дӯсти ман Карим аст. Ӯ муаллим аст. Ташаккур ва хайр!'],
];
for (const [title, txt, tr] of REWRITE) {
  if (DRY) { console.log(`[dry] матни «${title}» иваз мешавад`); continue; }
  await q(`UPDATE "ComprehensionExercise" SET passage=$2, "passageTranslated"=$3
            WHERE id=ANY($1) AND "titleTranslated"=$4`, [compIds, txt, tr, title]);
  console.log(`✓ матни «${title}» иваз шуд`);
}

// ── 2. Чӣ аудио лозим дорад ────────────────────────────────────────────
const words = await q(
  `SELECT id, word AS txt FROM "Word"
    WHERE "lessonId"=ANY($1) AND (("audioUrl" IS NULL) OR "audioUrl"='')`, [lids]);
const passages = await q(
  `SELECT id, passage AS txt, "titleTranslated" AS t FROM "ComprehensionExercise"
    WHERE id=ANY($1) AND "titleTranslated"=ANY($2)`, [compIds, REWRITE.map((r) => r[0])]);

const items = [
  ...words.map((r) => ({ ...r, table: 'Word' })),
  ...passages.map((r) => ({ ...r, table: 'ComprehensionExercise' })),
];
console.log(`\nкалимаи бе аудио: ${words.length} · матни ивазшуда: ${passages.length}`);
for (const it of items) console.log(`  ${it.table === 'Word' ? 'калима' : 'матн  '} ${it.txt.slice(0, 50)}`);
if (!items.length) { console.log('\nҲама чиз аудио дорад.'); process.exit(0); }
if (DRY) { console.log(`\n[dry] ${items.length} файл сохта мешуд.`); process.exit(0); }

// ── 3. Тавлид ──────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.txt })), null, 1));
console.log(`\n== Тавлид (edge-tts, ${VOICE}) ==`);
const out = execFileSync('python', ['prisma/_ar-tts.py', WORK, `${WORK}/items.json`, VOICE],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-3).join('\n'));

// ── 4. Push ба репои аудио ─────────────────────────────────────────────
console.log('\n== Репои аудио ==');
const git = (args, cwd = REPO) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
if (!existsSync(REPO)) {
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
    'commit', '-m', `Arabic A1 Module 1: audio for 5 new words and 2 rewritten passages`]);
  git(['push', 'origin', 'main']);
  console.log('push шуд');
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);

// ── 5. Сабт ────────────────────────────────────────────────────────────
console.log('\n== Сабт ==');
for (const it of items) {
  await q(`UPDATE "${it.table}" SET "audioUrl"=$1 WHERE id=$2`,
    [`${CDN}@${sha}/audio/ar/${it.id}.mp3`, it.id]);
}
console.log(`✓ ${items.length} истинод сабт шуд`);
