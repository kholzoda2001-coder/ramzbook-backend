import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const IDS = await sql`SELECT id,"order" o FROM "Module" WHERE "courseId"=${C} AND "order" IN (8,9,10,11) ORDER BY "order"`;
const N=Object.fromEntries(IDS.map(m=>[m.id,`M${m.o+1}`])); const mids=IDS.map(m=>m.id);
let cur='';
for(const q of await sql`SELECT q.id,q.question qq,q.options o,q."correctIndex" ci,ce.passage p,ce."titleTranslated" ct,l."moduleId" mid,l."order" lo,l."skillType" st FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId"=ANY(${mids}) AND (q.explanation IS NULL OR btrim(q.explanation)='') ORDER BY l."moduleId",l."order",q."order"`){
  const k=`${N[q.mid]}#${q.lo}`;
  if(k!==cur){ cur=k; console.log(`\n━━━ ${k} ${q.st} «${q.ct}»\n    P: ${q.p}`); }
  const o=Array.isArray(q.o)?q.o:JSON.parse(q.o);
  console.log(`  ${q.id}  ${q.qq}  →  "${o[q.ci]}"`);
}
