import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M7='cmqan1jlx00fps2t1lbpwlqxw', M8='cmqan1m8y00gls2t1wsthkb9k';
for(const e of await sql`SELECT ce.id,l."moduleId" mid,l."order" lo,l."skillType" st,ce."titleTranslated" ct,ce.kind,ce.passage p,ce."passageTranslated" pt,ce."audioUrl" au FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId" IN (${M7},${M8}) ORDER BY l."moduleId",l."order"`){
  console.log(`\n╔═ [${e.mid===M7?'M7':'M8'} #${e.lo} ${e.st}/${e.kind}] «${e.ct}» au=${e.au?1:0}`);
  console.log(`   RU: ${e.p}`);
  console.log(`   TG: ${e.pt||'(НЕСТ)'}`);
  for(const q of await sql`SELECT question q,"questionTranslated" qt,options o,"correctIndex" ci,explanation ex FROM "ComprehensionQuestion" WHERE "exerciseId"=${e.id} ORDER BY "order"`){
    const o=Array.isArray(q.o)?q.o:JSON.parse(q.o);
    console.log(`   Q ${q.q} | ${q.qt||'—'}`);
    console.log(`     ${JSON.stringify(o)} → "${o[q.ci]}"  EX: ${q.ex&&q.ex.trim()?q.ex:'❌ НЕСТ'}`);
  }
}
console.log('\n##### МУКОЛАМАҲО #####');
for(const d of await sql`SELECT dl.*,dg."titleTranslated" dt,l."moduleId" mid,l."order" lo FROM "Dialogue" dg JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "DialogueLine" dl ON dl."dialogueId"=dg.id WHERE l."moduleId" IN (${M7},${M8}) ORDER BY l."moduleId",dl."order"`)
  console.log(`[${d.mid===M7?'M7':'M8'} #${d.lo}] ${d.order} ${d.isUser?'USER':'BOT '} | ${d.text}  ||  ${d.translation}`);
