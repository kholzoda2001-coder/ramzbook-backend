// МОДУЛИ 9-и РУСӢ (A1) — Фазаи 3: он чи санҷиши зинда (`_ru-m9-live.mjs`) ёфт.
//
//   C13  Д17 Q7: тавзеҳи «Дорухона = аптека. (нонвойхона = пекарня, бонк = банк.)» танҳо аз
//        баробарӣ иборат буд — хонанда намедонад кадом тараф русӣ аст. Ҷумлаи пурраи тоҷикӣ.
//
//   node prisma/_ru-m9-fix2.mjs           # dry-run
//   node prisma/_ru-m9-fix2.mjs --apply
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const [l] = await sql`SELECT "comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${mods[8].id} AND "order"=16`;
const qs = await sql`SELECT id,question,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.cid} ORDER BY "order", id`;
const q7 = qs[6];
if (q7?.question !== 'Переведите «Дорухона»:') throw new Error(`Д17 Q7: «${q7?.question}»`);
const OLD = 'Дорухона = аптека. (нонвойхона = пекарня, бонк = банк.)';
const NEW = 'Дорухона бо русӣ — аптека. (Нонвойхона — пекарня, бонк — банк.)';
if (q7.explanation === NEW) { console.log('Д17 Q7: аллакай нав'); process.exit(0); }
if (q7.explanation !== OLD) throw new Error(`Д17 Q7 тавзеҳ: «${q7.explanation}»`);
console.log(`Д17 Q7 тавзеҳ:\n  «${OLD}»\n→ «${NEW}»`);
if (!APPLY) { console.log('--dry: ҳеҷ чиз сабт нашуд.'); process.exit(0); }
await sql`UPDATE "ComprehensionQuestion" SET explanation=${NEW} WHERE id=${q7.id} AND explanation=${OLD}`;
const [a] = await sql`SELECT explanation FROM "ComprehensionQuestion" WHERE id=${q7.id}`;
if (a.explanation !== NEW) throw new Error('ТАСДИҚ НАШУД: Д17 Q7');
console.log('✅ Д17 Q7 тавзеҳ');
