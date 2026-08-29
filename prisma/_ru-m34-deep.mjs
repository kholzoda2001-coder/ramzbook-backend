import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const M3='cmqan13cx00b5s2t1zft7vpq2', M4='cmqan16rf00c6s2t1e277g7we';

console.log('##### GRAMMAR TOPICS — ПУРРА #####');
const gts = await sql`
 SELECT g.id,g.title,g."titleTranslated" tt,g.explanation ex,l."moduleId" mid,l."order" lo,
        l.title lt, l."titleTranslated" ltt
 FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
 WHERE l."moduleId" IN (${M3},${M4}) ORDER BY l."moduleId",l."order"`;
for(const g of gts){
  console.log(`\n===== [${g.mid===M3?'M3':'M4'} #${g.lo}] =====`);
  console.log(`  Lesson : ${g.lt} | ${g.ltt}`);
  console.log(`  Topic  : ${g.title} | ${g.tt}`);
  console.log(`  ---`);
  console.log(g.ex);
}
