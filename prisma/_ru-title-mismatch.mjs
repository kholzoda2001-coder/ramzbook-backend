import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M5='cmqan1dwx00e5s2t1f345mm6i', M6='cmqan1hbm00f5s2t11fvlnrp8';
for(const r of await sql`SELECT g.id gid,l.id lid,l."moduleId" mid,l."order" lo,l."titleTranslated" lt,g."titleTranslated" gt,g.title ru FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M5},${M6}) ORDER BY l."moduleId",l."order"`){
  const same = r.lt===r.gt;
  console.log(`${same?'✅':'🔴'} [${r.mid===M5?'M5':'M6'}#${r.lo}] ru=«${r.ru}»`);
  if(!same){ console.log(`     lesson ${r.lid}  «${r.lt}»`); console.log(`     topic  ${r.gid}  «${r.gt}»`); }
}
