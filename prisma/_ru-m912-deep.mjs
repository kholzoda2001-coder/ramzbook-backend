import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const M=['cmsreihlc0001otn5bj0n0umz','cmsrf3pdy007notn5j5tp762o','cmsrfoeav0003q8j7qcps8pg8'];
const IDS = await sql`SELECT id,"order" o FROM "Module" WHERE "courseId"=${C} AND "order" IN (8,9,10,11) ORDER BY "order"`;
const N=Object.fromEntries(IDS.map(m=>[m.id,`M${m.o+1}`]));
const mids=IDS.map(m=>m.id);
for(const g of await sql`SELECT g.id,g.title,g."titleTranslated" gt,g.explanation ex,l."moduleId" mid,l."order" lo,l."titleTranslated" lt FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId"=ANY(${mids}) ORDER BY l."moduleId",l."order"`){
  console.log(`\n═══ [${N[g.mid]} #${g.lo}] ${g.title}`);
  console.log(`    topic «${g.gt}»`);
  console.log(`    card  «${g.lt}»   ${g.gt===g.lt?'✅':'🔴 НОМУВОФИҚ'}`);
  console.log(`    ${g.id}\n`);
  console.log(g.ex);
}
