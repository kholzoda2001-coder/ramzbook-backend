// Модули 3-и русӣ — 2 тавзеҳи имтиҳон кӯтоҳ буданд ва «чаро»-ро намегуфтанд. Идемпотент.
//   node prisma/_ru-m3-fix2.mjs [--apply]
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';
const sql = connect();
const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const [ex] = await sql`SELECT "comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${mods[2].id} AND "order"=16`;
const q = await sql`SELECT id,question,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${ex.cid} ORDER BY "order", id`;
const PLAN = [
  [6, 'Дополните: Это ___ книга. (аз они ман)', 'книга=муаннас → моя.', '«Книга» бо -а тамом мешавад → ҷинси муаннас → «моя».'],
  [7, 'Дополните: Это мои ___.', 'Истисно: брат → братья.', '«Мои» ҷамъ аст, пас исм ҳам ҷамъ: брат → «братья» (истисно, на «браты»).'],
];
let n = 0;
for (const [i, question, oldE, newE] of PLAN) {
  if (q[i].question !== question) throw new Error(`Q${i + 1}: «${q[i].question}»`);
  if (q[i].explanation === newE) continue;
  if (q[i].explanation !== oldE) throw new Error(`Q${i + 1}: тавзеҳи ғайричашмдошт «${q[i].explanation}»`);
  console.log(`Д17 Q${i + 1}\n  буд: ${oldE}\n  шуд: ${newE}`);
  n++;
  if (!APPLY) continue;
  await sql`UPDATE "ComprehensionQuestion" SET explanation=${newE} WHERE id=${q[i].id}`;
  const [a] = await sql`SELECT explanation FROM "ComprehensionQuestion" WHERE id=${q[i].id}`;
  if (a.explanation !== newE) throw new Error('ТАСДИҚ НАШУД');
}
console.log(APPLY ? `✅ ${n} тавзеҳ сабт шуд` : `DRY-RUN: ${n} тағйир`);
