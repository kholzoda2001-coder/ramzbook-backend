// Пасди сеюми Модули 2 — он чи танҳо ҳангоми ХОНДАН дида мешавад.
//
//   1. Мисоли ибораи дукалима худи ибораро НАДОРАД:
//      корт `اِسْمُ العَائِلَة`, мисол `اسْم عَائِلَتِي…` — барои навомӯз ду
//      чизи гуногун. (D13 инро намебинад, чунки ибора дар мисол умуман нест.)
//   2. Рақамҳо бо тартиби ғалат: Нуздаҳ, Понздаҳ, Даҳ, Бист.
//   3. Ду корти Д0 як тарҷумаи мисол доштанд («Ман даҳсола ҳастам»).
//   4. Мисолҳо калимаҳои ОИЛА-ро истифода мебаранд (амак, бародар, бобо),
//      ки ба Модули 3 тааллуқ доранд — ба шакли «Ӯ … аст» иваз шуданд.
//
// Ҳама тағйир танҳо дар МИСОЛ ва ТАРТИБ аст — аудиои калима даст нахӯрд.
//
//   node prisma/_ar-m2-fix3.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

const [c] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=1`, [c.id]);
const ls = await sql.query(`SELECT id, "order" FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [m.id]);
const lids = ls.map((x) => x.id);

// ── 1. Мисол бояд худи калимаро дошта бошад ────────────────────────────
console.log('1 · мисол ва калима як шакл');
const EX = [
  ['سَنَة', 'هَذِهِ سَنَةٌ جَمِيلَةٌ.', 'Ин соли зебост.'],
  ['اِسْمُ العَائِلَة', 'اِسْمُ العَائِلَة كَرِيمُوف.', 'Насаб Каримов аст.'],
  ['العُنْوَان', 'هَذَا هُوَ العُنْوَان.', 'Ин суроға аст.'],
  ['جَوَازُ السَّفَر', 'هَذَا جَوَازُ السَّفَر.', 'Ин шиноснома аст.'],
  ['البَرِيدُ الإِلِكْتْرُونِي', 'هَذَا هُوَ البَرِيدُ الإِلِكْتْرُونِي.', 'Ин почтаи электронӣ аст.'],
  ['زَمِيلُ الصَّف', 'هُوَ زَمِيلُ الصَّف.', 'Ӯ ҳамсинф аст.'],
  // Калимаҳои оила ба Модули 3 тааллуқ доранд.
  ['سَائِق', 'هُوَ سَائِقٌ.', 'Ӯ ронанда аст.'],
  ['بَنَّاء', 'هُوَ بَنَّاءٌ.', 'Ӯ бинокор аст.'],
  ['فَلَّاح', 'هُوَ فَلَّاحٌ.', 'Ӯ деҳқон аст.'],
  ['مُتَزَوِّج', 'هُوَ مُتَزَوِّجٌ.', 'Ӯ оиладор аст.'],
];
for (const [w, ex, tr] of EX) {
  const r = await sql.query(
    `UPDATE "Word" SET example=$2, "exampleTrans"=$3 WHERE "lessonId"=ANY($1) AND word=$4 RETURNING id`,
    [lids, ex, tr, w]);
  console.log(`  ${r.length ? '✓' : '·'} ${w} → «${ex}»`);
}

// ── 2. Рақамҳо бо тартиби ададӣ ────────────────────────────────────────
// Дар Д0 аввал шаш калимаи мавзӯӣ, баъд чор рақам аз хурд ба калон.
console.log('\n2 · тартиби рақамҳо');
const NUM = ['عَشَرَة', 'خَمْسَةَ عَشَرَ', 'تِسْعَةَ عَشَرَ', 'عِشْرُونَ'];
const l0 = ls.find((x) => x.order === 0).id;
for (let i = 0; i < NUM.length; i++) {
  const r = await sql.query(
    `UPDATE "Word" SET "order"=$2 WHERE "lessonId"=$1 AND word=$3 RETURNING id`,
    [l0, 7 + i, NUM[i]]);
  console.log(`  ${r.length ? '✓' : '·'} ${NUM[i]} → ${7 + i}`);
}
