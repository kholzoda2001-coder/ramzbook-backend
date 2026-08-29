import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
console.log('### «содда» vs «оддӣ» дар тамоми курс ###');
for(const t of ['содда','оддӣ']){
  const g = await sql`SELECT count(*)::int c FROM "GrammarTopic" WHERE "courseId"=${C} AND ("titleTranslated" ILIKE ${'%'+t+'%'} OR explanation ILIKE ${'%'+t+'%'})`;
  const l = await sql`SELECT count(*)::int c FROM "Lesson" l WHERE l."moduleId" IN (SELECT id FROM "Module" WHERE "courseId"=${C}) AND l."titleTranslated" ILIKE ${'%'+t+'%'}`;
  console.log(`  «${t}»: GrammarTopic=${g[0].c}  Lesson=${l[0].c}`);
}
console.log('\n### Шакли префикс дар унвонҳои грамматикӣ (тамоми курс) ###');
const rows = await sql`SELECT g."titleTranslated" tt FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} ORDER BY m."order",l."order"`;
let colon=0, dash=0, none=0;
for(const r of rows){ if(/^Грамматика:/.test(r.tt)) colon++; else if(/^Грамматика\s*[—-]/.test(r.tt)) dash++; else none++; }
console.log(`  «Грамматика:» = ${colon}   «Грамматика —» = ${dash}   бе префикс = ${none}`);
