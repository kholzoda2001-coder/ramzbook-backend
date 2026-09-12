// Он чи ки ХОНДАНИ БО ЧАШМ дар сохти нав ёфт. Ҳеҷ детектор инҳоро надид.
//
// E1 · Мисоли `الأَخ` буд: «لَدَيَّ أخ وَاحِد.» — СЕ айб дар ЯК ҷумла:
//        a) `لَدَيَّ` сохти ДИГАРИ соҳибист; худи ҳамин модул `عِنْدَ`-ро
//           меомӯзонад (дарси 6). Хонанда ду сохтро мебинад, яктояш шарҳ
//           нашуда.
//        b) `أخ` БЕ ҲАРАКАТ аст, дар ҳоле ки ҳама ҷои дигар ҳаракат дорад.
//           `D3` танҳо матн/муколама/грамматикаро месанҷад, мисоли калимаро не.
//        c) Тарҷумааш «Ман як бародар дорам.» — АЙНАН ҳамон тарҷумаи мисоли
//           `وَاحِد` дар дарси «Рақамҳо». Ду ҷумлаи арабӣ, як тарҷумаи тоҷикӣ →
//           дар машқи сохтани ҷумла ду ҷавоби дуруст мешавад (ниг. доми
//           «бархӯрди тарҷума»).
//
// E2 · `زَوْجَة` = «Ҳамсар» буд. Дар тоҷикӣ «ҳамсар» БЕТАРАФ аст (ҳам мард,
//        ҳам зан), вале `زوجة` маҳз ЗАН аст ва ҷуфташ `زَوْج` = «Шавҳар»
//        гендерӣ навишта шудааст. Hasan («тарҷумаи як ба як») маҳз дар ҳамин
//        печида мешавад.
//
// E3 · Тарҷумаи мисоли `بِنْتُ الأَخ` қавс дар дохили ҷумла дошт —
//        «Ин ҷиян (духтари бародар) аст.» Худи корт аллакай инро мегӯяд.
//
// ⚠️ Аудио: `Word.audioUrl` танҳо ба ХУДИ калима тааллуқ дорад — сутуни
// алоҳида барои мисол нест (санҷида шуд). Мисолро иваз кардан бехатар аст.
//
//   node prisma/_ar-m3-fix6.mjs --dry
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" nn ON nn.id=c."nativeLanguageId"
 WHERE t.code='ar' AND nn.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=2`, [course.id]);
const lids = (await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [mod.id])).map((x) => x.id);

let n = 0;
const run = async (label, text, params) => {
  if (DRY) { console.log(`  [dry] ${label}`); n++; return; }
  const r = await sql.query(text + ' RETURNING 1 AS x', params);
  console.log(`  ${r.length ? '✓' : '·'} ${label}${r.length ? '' : '  ЁФТ НАШУД'}`);
  n += r.length;
};

console.log(DRY ? '── DRY RUN ──' : '── E1–E3 ──');

console.log('\nE1 · мисоли الأَخ (لدي → сохти модул, ҳаракат, тарҷумаи беназир)');
await run('«لَدَيَّ أخ وَاحِد.» → «أَخِي فِي المَدْرَسَة.»',
  `UPDATE "Word" SET example=$2, "exampleTrans"=$3
    WHERE "lessonId"=ANY($1) AND word='الأَخ' AND example LIKE '%لَدَيَّ%'`,
  [lids, 'أَخِي فِي المَدْرَسَة.', 'Бародарам дар мактаб аст.']);

console.log('\nE2 · زَوْجَة гендерӣ');
await run('زَوْجَة → «Зан (ҳамсар)»',
  `UPDATE "Word" SET translation=$2 WHERE "lessonId"=ANY($1) AND word='زَوْجَة'`,
  [lids, 'Зан (ҳамсар)']);
await run('мисоли زَوْجَة → «Ӯ зани ман аст.»',
  `UPDATE "Word" SET "exampleTrans"=$2 WHERE "lessonId"=ANY($1) AND word='زَوْجَة'`,
  [lids, 'Ӯ зани ман аст.']);

console.log('\nE3 · қавс дар дохили ҷумла');
await run('мисоли بِنْتُ الأَخ → «Ин ҷиян аст.»',
  `UPDATE "Word" SET "exampleTrans"=$2 WHERE "lessonId"=ANY($1) AND word='بِنْتُ الأَخ'`,
  [lids, 'Ин ҷиян аст.']);

console.log(`\n${DRY ? '[dry] ' : ''}${n} амал.`);
