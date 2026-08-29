import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M5='cmqan1dwx00e5s2t1f345mm6i', M6='cmqan1hbm00f5s2t11fvlnrp8';
const N=m=>m===M5?'M5':'M6';
console.log('### GRAMMAR TOPICS (id, ⚡?, titles) ###');
for(const g of await sql`SELECT g.id gid,l.id lid,l."moduleId" mid,l."order" lo,l."titleTranslated" lt,g."titleTranslated" gt,g.explanation ex FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M5},${M6}) ORDER BY l."moduleId",l."order"`)
  console.log(`[${N(g.mid)}#${g.lo}] zap=${g.ex.includes('⚡')?(g.ex.includes('⚡ **')?'BOLD':'plain'):'NO'}\n   topic  ${g.gid} «${g.gt}»\n   lesson ${g.lid} «${g.lt}»`);
console.log('\n### SILENT EXPLANATIONS ###');
for(const q of await sql`SELECT q.id,q.question qq,q.options o,q."correctIndex" ci,ce."titleTranslated" ct,ce.passage p,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId" IN (${M5},${M6}) AND (q.explanation IS NULL OR btrim(q.explanation)='') ORDER BY l."moduleId",l."order",q."order"`){
  const o=Array.isArray(q.o)?q.o:JSON.parse(q.o);
  console.log(`${q.id} [${N(q.mid)}#${q.lo}] ${q.qq}\n     → "${o[q.ci]}"   P: ${q.p.slice(0,150)}`);
}
console.log('\n### M6#16 Q8 + M5#10 passage ###');
for(const q of await sql`SELECT id,question,options,"correctIndex" ci,explanation FROM "ComprehensionQuestion" WHERE question LIKE '%У меня ___ яблок%'`) console.log(`Q8 ${q.id} ${JSON.stringify(q.options)} ci=${q.ci} ex=${JSON.stringify(q.explanation)}`);
for(const r of await sql`SELECT ce.id,ce."passageTranslated" pt FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId"=${M5} AND ce."passageTranslated" LIKE '%Англис%'`) console.log(`M5#10 ${r.id}\n   ${r.pt}`);
