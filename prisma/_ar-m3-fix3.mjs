// Ислоҳи он чи ки 20 хонандаи диҷиталӣ ёфтанд ва аудити мошинӣ надид.
//
// ⚠️ Ҳеҷ як МАТНИ арабии садодор тағйир намеёбад — танҳо тарҷумаи тоҷикӣ,
// тартиби кортҳо, унвони дарс ва матни САВОЛ. Савол аудио надорад
// (аудио танҳо ба Word, ComprehensionExercise.passage ва DialogueLine
// баста аст), пас клипҳо ҳамон мемонанд.
//
//   node prisma/_ar-m3-fix3.mjs --dry
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');
let n = 0;
const run = async (label, text, params = []) => {
  if (DRY) { console.log(`  [dry] ${label}`); n++; return; }
  const r = await sql.query(text + ' RETURNING 1 AS x', params);
  console.log(`  ${r.length ? '✓' : '·'} ${label}${r.length ? '' : '  ЁФТ НАШУД'}`);
  n += r.length;
};

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" nn ON nn.id=c."nativeLanguageId"
 WHERE t.code='ar' AND nn.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=2`, [course.id]);
const lessons = await sql.query(
  `SELECT id, "order", "grammarTopicId" g, "comprehensionId" k
     FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [mod.id]);
const L = (o) => lessons.find((l) => l.order === o).id;
const lids = lessons.map((l) => l.id);
const gids = lessons.map((l) => l.g).filter(Boolean);
const kids = lessons.map((l) => l.k).filter(Boolean);

console.log(DRY ? '── DRY RUN ──' : '── ИСЛОҲИ B1–B4 + B7 ──');

// ═══ B4 · «Хола» ғалат аст ═════════════════════════════════════════════
// العمة = хоҳари ПАДАР = амма. «Хола» хоҳари МОДАР аст (الخالة) — калимаи
// тамоман дигар. Худи ҳамон дарс العم-ро дуруст «аз тарафи падар» менависад,
// пас модул бо худаш зид буд. Ҳар ду ҳоло як хел шарҳ мегиранд.
//
// B7 · «Ҷиян (Писар)»/«Ҷиян (Духтар)» дар бозии мач қариб як хел менамуданд —
// акнун худи муносибат навишта мешавад.
console.log('\nB4/B7 · истилоҳи хешовандӣ');
for (const [w, tr] of [
  ['العَمّ', 'Амак (бародари падар)'],
  ['العَمَّة', 'Амма (хоҳари падар)'],
  ['اِبْنُ العَم', 'Амакбача'],
  ['اِبْنُ الأَخ', 'Ҷиян (писари бародар)'],
  ['بِنْتُ الأَخ', 'Ҷиян (духтари бародар)'],
]) {
  await run(`${w} → «${tr}»`,
    `UPDATE "Word" SET translation=$2 WHERE "lessonId"=ANY($1) AND word=$3`, [lids, tr, w]);
}
// Мисоли ин кортҳо ҳам ҳамон истилоҳро гӯяд.
for (const [w, tr] of [
  ['العَمَّة', 'Ӯ амма аст.'],
  ['اِبْنُ العَم', 'Ӯ амакбача аст.'],
  ['بِنْتُ الأَخ', 'Ҷиян меҳрубон аст.'],
  ['اِبْنُ الأَخ', 'Ҷиян хурд аст.'],
]) {
  await run(`мисоли ${w} → «${tr}»`,
    `UPDATE "Word" SET "exampleTrans"=$2 WHERE "lessonId"=ANY($1) AND word=$3`, [lids, tr, w]);
}

// ═══ B3 · Тарҷумаи ҷумла бо тарҷумаи корт мувофиқ нест ═════════════════
// Корт «Меҳрубон»-ро меомӯзонад, ҷумла «нағз» мегӯяд — хонанда фикр мекунад
// ду калимаи гуногун аст. Матни арабӣ даст нарасид, пас аудио бехатар.
console.log('\nB3 · тарҷумаи ҷумла ↔ тарҷумаи корт');
await run('المُعَلِّمَاتُ لَطِيفَاتٌ → «меҳрубонанд»',
  `UPDATE "GrammarExample" SET translation=$2 WHERE "topicId"=ANY($1) AND sentence=$3`,
  [gids, 'Муаллимаҳо меҳрубонанд.', 'المُعَلِّمَاتُ لَطِيفَاتٌ.']);
await run('هُوَ شَخْصٌ لَطِيفٌ → «шахси меҳрубон»',
  `UPDATE "Word" SET "exampleTrans"=$2 WHERE "lessonId"=ANY($1) AND example=$3`,
  [lids, 'Ӯ шахси меҳрубон аст.', 'هُوَ شَخْصٌ لَطِيفٌ.']);
await run('الرَّجُل المُسِنّ هُنَا → «марди солхӯрда»',
  `UPDATE "Word" SET "exampleTrans"=$2 WHERE "lessonId"=ANY($1) AND example=$3`,
  [lids, 'Марди солхӯрда дар ин ҷост.', 'الرَّجُل المُسِنّ هُنَا.']);

// ═══ B2 · Савол «ӯ» мепурсад, матн «ман» мегӯяд ════════════════════════
// Матн: `عِنْدِي أَخٌ وَاحِد` (МАН дорам). Савол: `كَمْ أَخٌ عِنْدَهُ؟` (Ӯ дорад).
// Дар матн ҳеҷ «ӯ» нест. Ҳал: савол дар бораи ОИЛА пурсида шавад — ҳам
// бетараф, ҳам ҳар ду калима (`فِي`, `الأُسْرَة`) аллакай омӯхта шудаанд.
// Д12 даст нарасид: он ҷо матн `عِنْدَهَا` ва савол `عِنْدَهَا` — дуруст аст.
console.log('\nB2 · шахси савол ↔ шахси матн');
await run('كَمْ أَخٌ عِنْدَهُ؟ → كَمْ أَخٌ فِي الأُسْرَة؟ (Д10/Д14/Д15)',
  `UPDATE "ComprehensionQuestion" SET question=$2, "questionTranslated"=$3
    WHERE "exerciseId"=ANY($1) AND question=$4`,
  [kids, 'كَمْ أَخٌ فِي الأُسْرَة؟', 'Дар оила чанд бародар ҳаст?', 'كَمْ أَخٌ عِنْدَهُ؟']);

// ═══ B1 · Рақамҳо дар тартиби «Ду, Се, Як» истода буданд ═══════════════
console.log('\nB1 · тартиби кортҳои Д2');
const ORDER2 = ['الأَخ', 'الأُخْت', 'الجَدّ', 'الجَدَّة', 'العَمّ', 'وَاحِد', 'اِثْنَان', 'ثَلَاثَة'];
if (!DRY) {
  for (let i = 0; i < ORDER2.length; i++) {
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE "lessonId"=$1 AND word=$3`,
      [L(2), i + 1, ORDER2[i]]);
  }
}
console.log(`  ${DRY ? '[dry] ' : '✓ '}Д2: Бародар, Хоҳар, Бобо, Бибӣ, Амак, Як, Ду, Се`);
n++;

// ═══ Sabina · Дарс «Хешовандон» ном дорад, вале рақам ҳам меомӯзонад ═══
console.log('\nSabina · унвони Д2');
await run('Д2 → «Хешовандон ва рақамҳо»',
  `UPDATE "Lesson" SET title=$2, "titleTranslated"=$3 WHERE id=$1`,
  [L(2), 'الأقارب والأرقام', 'Хешовандон ва рақамҳо']);

console.log(`\n${DRY ? '[dry] ' : ''}${n} амал.`);
