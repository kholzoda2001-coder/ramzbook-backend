import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const J = (x)=>JSON.stringify(x);

const mods = await sql`SELECT id,title,"titleTranslated" tt,"order" FROM "Module" WHERE "courseId"=${C} AND "order" IN (0,1) ORDER BY "order"`;
console.log('MODULES', J(mods));
const mids = mods.map(m=>m.id);
const lessons = await sql`SELECT id,title,"titleTranslated" tt,type,"skillType","order","moduleId","grammarTopicId","dialogueId","comprehensionId" FROM "Lesson" WHERE "moduleId"=ANY(${mids}) ORDER BY "moduleId","order"`;
console.log('LESSONS_COUNT', lessons.length);
for(const l of lessons){
  const m = mods.findIndex(x=>x.id===l.moduleId)+1;
  console.log(`M${m} #${l.order} [${l.skillType}] ${l.title} | ${l.tt} | g=${l.grammarTopicId?1:0} d=${l.dialogueId?1:0} c=${l.comprehensionId?1:0} | ${l.id}`);
}
