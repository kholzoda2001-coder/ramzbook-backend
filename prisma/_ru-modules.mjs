import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const mods = await sql`SELECT id,title,"titleTranslated" tt,"order" FROM "Module" WHERE "courseId"=${C} ORDER BY "order"`;
for(const m of mods){
  const n = await sql`SELECT count(*)::int c FROM "Lesson" WHERE "moduleId"=${m.id}`;
  console.log(`order=${m.order}  lessons=${n[0].c}  ${m.id}  ${m.title} | ${m.tt}`);
}
