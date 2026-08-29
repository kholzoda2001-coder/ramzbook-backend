import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M5='cmqan1dwx00e5s2t1f345mm6i', M6='cmqan1hbm00f5s2t11fvlnrp8';
const gts = await sql`
 SELECT g.id,g.title,g."titleTranslated" tt,g.explanation ex,l."moduleId" mid,l."order" lo,l."titleTranslated" lt
 FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
 WHERE l."moduleId" IN (${M5},${M6}) ORDER BY l."moduleId",l."order"`;
for(const g of gts){
  console.log(`\n═══ [${g.mid===M5?'M5':'M6'} #${g.lo}] ${g.title} | topic:«${g.tt}» | card:«${g.lt}» ═══`);
  console.log(g.ex);
}
