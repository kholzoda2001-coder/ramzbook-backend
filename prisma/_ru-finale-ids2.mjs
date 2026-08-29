import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
console.log('### Ду машқи «Соро» — кадом курс? ###');
for(const r of await sql`SELECT ce.id,c.title ct,c.level lv,m."order" mo,l."order" lo,ce."titleTranslated" tt FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId" JOIN "Course" c ON c.id=m."courseId" WHERE ce.id IN ('cmqqm4ibr0053wtt8fgol5xap','cmsrf4ar100e3otn57veur2x3')`)
  console.log(`  ${r.id}  «${r.ct}» (${r.lv})  M${r.mo+1}#${r.lo}  «${r.tt}»`);
console.log('\n### «Жаркий» такрорӣ дар M12 ###');
for(const r of await sql`SELECT w.id,w.word,w.translation t,l."order" lo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND m."order"=11 AND w.word IN ('Жаркий','Тёплый','Холодный') ORDER BY l."order"`)
  console.log(`  ${r.id} #${r.lo} «${r.word}» → «${r.t}»`);
