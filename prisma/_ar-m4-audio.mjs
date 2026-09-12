// Аудиои Модули 4.
//
// ҲАМАИ кортҳо аз нав сабт мешаванд, на танҳо навҳо. Чаро:
//   • 33 корт матнашон иваз шуд (`اِثْنَان ٢` → `اِثْنَان`) — клипи кӯҳна
//     рақамро ДУ бор мехонд.
//   • 15 корт нав аст (соатҳо, `مَتَى`, `يَوْم`).
//   • Кортҳои дарси навиштан нусхаанд ва URL-и корти аслиро доштанд.
// Ҷудо кардани «кадомаш иваз шуд» дар ин ҳолат ҳисоббарорист, ки хато
// шуданаш мумкин; аз нав сабти ҳама кафолат медиҳад, ки ҳар клип ба
// матни худаш мувофиқ аст.
//
// Чор МАТН низ аз нав навишта шуд → онҳо ҳам сабт мешаванд.
//
// ⚠️ МУКОЛАМА ин ҷо НЕСТ: он танҳо ҲАРАКАТ гирифт, талаффуз ҳамон монд,
// пас клипҳои мавҷуда дурустанд (қоидаи модулҳои 1–3).
//
//   node prisma/_ar-m4-audio.mjs --dry
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');
const VOICE = 'ar-SA-ZariyahNeural';
const WORK = 'tmp/ar-m4-audio';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.split('\\').join('/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=3`, [course.id]);
const ls = await sql.query(
  `SELECT id, "comprehensionId" k FROM "Lesson" WHERE "moduleId"=$1 AND "isActive"`, [mod.id]);

const words = await sql.query(
  `SELECT id, word AS txt FROM "Word" WHERE "lessonId"=ANY($1)`, [ls.map((x) => x.id)]);
const passages = await sql.query(
  `SELECT id, passage AS txt FROM "ComprehensionExercise" WHERE id=ANY($1)`,
  [ls.map((x) => x.k).filter(Boolean)]);

const items = [
  ...words.map((r) => ({ ...r, table: 'Word' })),
  ...passages.map((r) => ({ ...r, table: 'ComprehensionExercise' })),
];
console.log(`корт: ${words.length} · матн: ${passages.length} · ҳамагӣ ${items.length}`);
if (DRY) {
  for (const it of items.slice(0, 8)) console.log(`  ${it.txt.slice(0, 50)}`);
  console.log(`  …\n[dry] ${items.length} файл.`);
  process.exit(0);
}

mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.txt })), null, 1));
console.log(`\n== Тавлид (edge-tts, ${VOICE}) ==`);
const out = execFileSync('python', ['prisma/_ar-tts.py', WORK, `${WORK}/items.json`, VOICE],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
console.log(out.trim().split('\n').slice(-3).join('\n'));

console.log('\n== Репои аудио ==');
const git = (args, cwd = REPO) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
let ok = existsSync(`${REPO}/.git/HEAD`) && existsSync(`${REPO}/.git/config`);
if (ok) { try { git(['rev-parse', '--is-inside-work-tree']); } catch { ok = false; } }
if (!ok) {
  if (existsSync(REPO)) execFileSync('cmd', ['/c', 'rmdir', '/s', '/q', REPO.split('/').join('\\')]);
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
    'commit', '-m', 'Arabic A1 Module 4: re-record numbers without digits, add clock hours, new passages']);
  git(['push', 'origin', 'main']);
  console.log('push шуд');
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);

console.log('\n== Сабт ==');
for (const it of items) {
  await sql.query(`UPDATE "${it.table}" SET "audioUrl"=$1 WHERE id=$2`,
    [`${CDN}@${sha}/audio/ar/${it.id}.mp3`, it.id]);
}
console.log(`✓ ${items.length} истинод сабт шуд`);
