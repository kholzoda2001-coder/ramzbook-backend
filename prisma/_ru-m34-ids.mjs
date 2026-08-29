import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M3='cmqan13cx00b5s2t1zft7vpq2', M4='cmqan16rf00c6s2t1e277g7we';
const N=m=>m===M3?'M3':'M4';

console.log('### T1 · Душанбе ###');
for(const r of await sql`SELECT ce.id,ce."passageTranslated" pt,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId" IN (${M3},${M4})`)
  if(/Душанбе аст/.test(r.pt||'')) console.log(`CE  ${r.id}  [${N(r.mid)}#${r.lo}]  ${JSON.stringify(r.pt)}`);
for(const r of await sql`SELECT dl.id,dl.translation tr,l."moduleId" mid,l."order" lo FROM "Dialogue" d JOIN "Lesson" l ON l."dialogueId"=d.id JOIN "DialogueLine" dl ON dl."dialogueId"=d.id WHERE l."moduleId" IN (${M3},${M4})`)
  if(/Душанбе аст/.test(r.tr)) console.log(`DL  ${r.id}  [${N(r.mid)}#${r.lo}]  ${JSON.stringify(r.tr)}`);
for(const r of await sql`SELECT w.id,w.word,w."exampleTrans" et,l."moduleId" mid,l."order" lo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId" IN (${M3},${M4})`)
  if(/Душанбе аст/.test(r.et||'')) console.log(`W   ${r.id}  [${N(r.mid)}#${r.lo}] «${r.word}»  ${JSON.stringify(r.et)}`);

console.log('\n### T2 · Унвонҳо ###');
for(const r of await sql`SELECT g.id gid,l.id lid,l."moduleId" mid,l."order" lo,l."titleTranslated" lt,g."titleTranslated" gt,g.title gtitle FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M3},${M4}) ORDER BY l."moduleId",l."order"`)
  console.log(`[${N(r.mid)}#${r.lo}]\n   topic ${r.gid}  gt=${JSON.stringify(r.gt)}  (ru: ${JSON.stringify(r.gtitle)})\n   lesson ${r.lid}  lt=${JSON.stringify(r.lt)}`);

console.log('\n### T3 · Тавзеҳи холӣ + дурӯғгӯ ###');
for(const r of await sql`SELECT q.id,q.question qq,q.options o,q."correctIndex" ci,q.explanation ex,ce."titleTranslated" ct,ce.passage p,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId" IN (${M3},${M4}) ORDER BY l."moduleId",l."order",q."order"`){
  const blank=!r.ex||!r.ex.trim();
  if(!blank && !/английского/.test(r.ex)) continue;
  const o=Array.isArray(r.o)?r.o:JSON.parse(r.o);
  console.log(`${r.id}  [${N(r.mid)}#${r.lo}] «${r.ct}»\n   Q: ${r.qq}\n   → "${o[r.ci]}"   ex=${blank?'(EMPTY)':JSON.stringify(r.ex)}\n   P: ${r.p}`);
}
