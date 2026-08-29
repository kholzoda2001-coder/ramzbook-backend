import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const IDS = await sql`SELECT id,"order" o FROM "Module" WHERE "courseId"=${C} AND "order" IN (9,10,11) ORDER BY "order"`;
const N=Object.fromEntries(IDS.map(m=>[m.id,`M${m.o+1}`])); const mids=IDS.map(m=>m.id);
for(const e of await sql`SELECT ce.id,l."moduleId" mid,l."order" lo,l."skillType" st,ce."titleTranslated" ct,ce.passage p,ce."passageTranslated" pt FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId"=ANY(${mids}) ORDER BY l."moduleId",l."order"`){
  console.log(`\n╔═ [${N[e.mid]} #${e.lo} ${e.st}] «${e.ct}»`);
  console.log(`   RU: ${e.p}`);
  console.log(`   TG: ${e.pt}`);
}
console.log('\n##### МУКОЛАМАҲО M9–M12 #####');
const ALL = await sql`SELECT id,"order" o FROM "Module" WHERE "courseId"=${C} AND "order" IN (8,9,10,11)`;
const N2=Object.fromEntries(ALL.map(m=>[m.id,`M${m.o+1}`]));
for(const d of await sql`SELECT dl.*,l."moduleId" mid,l."order" lo FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id JOIN "Lesson" l ON l."dialogueId"=dg.id WHERE l."moduleId"=ANY(${ALL.map(m=>m.id)}) ORDER BY l."moduleId",dl."order"`)
  console.log(`[${N2[d.mid]} #${d.lo}] ${d.order} ${d.isUser?'USER':'BOT '} | ${d.text}  ||  ${d.translation}`);
