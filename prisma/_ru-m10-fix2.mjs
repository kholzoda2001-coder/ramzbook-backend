// МОДУЛИ 10-и РУСӢ (A1) — Фазаи 3: он чи санҷиши зинда (`_ru-m10-live.mjs`) ёфт.
//
//   C12  Д18 Q6: тавзеҳ «Курта = рубашка (на куртка!), нав = новый…» — баробариҳои хушк; хонанда
//        намедонад кадом тараф русӣ аст. Ҷумлаи пурраи тоҷикӣ, мисли тавзеҳҳои дигари имтиҳон.
//
//   node prisma/_ru-m10-fix2.mjs           # dry-run
//   node prisma/_ru-m10-fix2.mjs --apply
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const [l] = await sql`SELECT "comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${mods[9].id} AND "order"=17`;
const qs = await sql`SELECT id,question,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.cid} ORDER BY "order", id`;
const q6 = qs[5];
if (q6?.question !== 'Переведите «Куртаи нав»:') throw new Error(`Д18 Q6: «${q6?.question}»`);
const OLD = 'Курта = рубашка (на куртка!), нав = новый. Пас: «Новая рубашка».';
const NEW = 'Курта бо русӣ — рубашка (на куртка!), нав — новый. Пас: «Новая рубашка».';
if (q6.explanation === NEW) { console.log('Д18 Q6: аллакай нав'); process.exit(0); }
if (q6.explanation !== OLD) throw new Error(`Д18 Q6 тавзеҳ: «${q6.explanation}»`);
console.log(`Д18 Q6 тавзеҳ:\n  «${OLD}»\n→ «${NEW}»`);
if (!APPLY) { console.log('--dry: ҳеҷ чиз сабт нашуд.'); process.exit(0); }
await sql`UPDATE "ComprehensionQuestion" SET explanation=${NEW} WHERE id=${q6.id} AND explanation=${OLD}`;
const [a] = await sql`SELECT explanation FROM "ComprehensionQuestion" WHERE id=${q6.id}`;
if (a.explanation !== NEW) throw new Error('ТАСДИҚ НАШУД: Д18 Q6');
console.log('✅ Д18 Q6 тавзеҳ');
