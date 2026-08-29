import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M5='cmqan1dwx00e5s2t1f345mm6i', M6='cmqan1hbm00f5s2t11fvlnrp8';
const ces = await sql`
 SELECT ce.id,l."moduleId" mid,l."order" lo,l."skillType" st,ce."titleTranslated" ct,ce.kind,ce.passage p,ce."passageTranslated" pt,ce."audioUrl" au
 FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
 WHERE l."moduleId" IN (${M5},${M6}) ORDER BY l."moduleId",l."order"`;
for(const e of ces){
  console.log(`\n╔═ [${e.mid===M5?'M5':'M6'} #${e.lo} ${e.st}/${e.kind}] «${e.ct}» au=${e.au?1:0}`);
  console.log(`   RU: ${e.p}`);
  console.log(`   TG: ${e.pt||'(НЕСТ)'}`);
  const qs = await sql`SELECT question q,"questionTranslated" qt,options o,"correctIndex" ci,explanation ex FROM "ComprehensionQuestion" WHERE "exerciseId"=${e.id} ORDER BY "order"`;
  for(const q of qs){ const o=Array.isArray(q.o)?q.o:JSON.parse(q.o);
    console.log(`   Q ${q.q} | ${q.qt||'—'}`);
    console.log(`     ${JSON.stringify(o)} → "${o[q.ci]}"  EX: ${q.ex&&q.ex.trim()?q.ex:'❌ НЕСТ'}`); }
}
console.log('\n\n##### МУКОЛАМАҲО #####');
for(const d of await sql`SELECT dl.*,l."moduleId" mid,l."order" lo FROM "Dialogue" dg JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "DialogueLine" dl ON dl."dialogueId"=dg.id WHERE l."moduleId" IN (${M5},${M6}) ORDER BY l."moduleId",dl."order"`)
  console.log(`[${d.mid===M5?'M5':'M6'} #${d.lo}] ${d.order} ${d.isUser?'USER':'BOT '} | ${d.text}  ||  ${d.translation}`);
