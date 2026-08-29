import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M3='cmqan13cx00b5s2t1zft7vpq2', M4='cmqan16rf00c6s2t1e277g7we';
const ces = await sql`
 SELECT ce.id,l."moduleId" mid,l."order" lo,l."skillType" st,ce."titleTranslated" ct,ce.kind,
        ce.passage p,ce."passageTranslated" pt,ce."audioUrl" au
 FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
 WHERE l."moduleId" IN (${M3},${M4}) ORDER BY l."moduleId",l."order"`;
for(const e of ces){
  console.log(`\n╔═ [${e.mid===M3?'M3':'M4'} #${e.lo} ${e.st}/${e.kind}] «${e.ct}» audio=${e.au?1:0}`);
  console.log(`   RU: ${e.p}`);
  console.log(`   TG: ${e.pt||'(НЕСТ)'}`);
  const qs = await sql`SELECT question q,"questionTranslated" qt,options o,"correctIndex" ci,explanation ex FROM "ComprehensionQuestion" WHERE "exerciseId"=${e.id} ORDER BY "order"`;
  for(const q of qs){
    const o = Array.isArray(q.o)?q.o:JSON.parse(q.o);
    console.log(`   Q ${q.q} | ${q.qt||'—'}`);
    console.log(`     ${JSON.stringify(o)} → "${o[q.ci]}"   EXPL: ${q.ex&&q.ex.trim()?q.ex:'❌ НЕСТ'}`);
  }
}
console.log('\n\n##### МУКОЛАМАҲО #####');
const dls = await sql`
 SELECT dl.*,d."titleTranslated" dt,l."moduleId" mid,l."order" lo
 FROM "Dialogue" d JOIN "Lesson" l ON l."dialogueId"=d.id JOIN "DialogueLine" dl ON dl."dialogueId"=d.id
 WHERE l."moduleId" IN (${M3},${M4}) ORDER BY l."moduleId",dl."order"`;
for(const d of dls) console.log(`[${d.mid===M3?'M3':'M4'} #${d.lo}] ${String(d.order).padStart(2)} ${d.isUser?'USER':'BOT '} au=${d.audioUrl?1:0} | ${d.text}  ||  ${d.translation}`);
