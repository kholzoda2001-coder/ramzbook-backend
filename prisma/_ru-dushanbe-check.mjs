import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
console.log('### ШАҲРИ «Душанбе» (бояд бо ҳарфи КАЛОН монад) ###');
const city = await sql`
 SELECT m."order" mo,ce."titleTranslated" t,ce."passageTranslated" v FROM "ComprehensionExercise" ce
 JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId"
 WHERE m."courseId"=${C} AND ce."passageTranslated" ~ 'Душанбе' ORDER BY m."order"`;
for(const r of city) console.log(`  M${r.mo+1} «${r.t}»: ${r.v.match(/[^.]*Душанбе[^.]*\./)?.[0]?.trim()}`);
const w = await sql`
 SELECT m."order" mo,w.word,w.translation t,w."exampleTrans" e FROM "Word" w
 JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON m.id=l."moduleId"
 WHERE m."courseId"=${C} AND (w.translation ~ 'Душанбе' OR w."exampleTrans" ~ 'Душанбе') ORDER BY m."order"`;
for(const r of w) console.log(`  M${r.mo+1} калима «${r.word}» → «${r.t}» | ${r.e}`);
const d = await sql`
 SELECT m."order" mo,dl.text tx,dl.translation tr FROM "DialogueLine" dl
 JOIN "Dialogue" dg ON dl."dialogueId"=dg.id JOIN "Lesson" l ON l."dialogueId"=dg.id
 JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND dl.translation ~ 'Душанбе' ORDER BY m."order"`;
for(const r of d) console.log(`  M${r.mo+1} муколама: «${r.tx}» → «${r.tr}»`);

console.log('\n### РӮЗИ ҲАФТА бо ҳарфи калон (набояд бошад) ###');
const bad = await sql`
 SELECT 'CE' src,m."order" mo,ce."passageTranslated" v FROM "ComprehensionExercise" ce
 JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId"
 WHERE m."courseId"=${C} AND ce."passageTranslated" ~ '(Имрӯз|рӯзи|Дирӯз|Пагоҳ) +Душанбе'
 UNION ALL SELECT 'W',m."order",w."exampleTrans" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
 JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND w."exampleTrans" ~ '(Имрӯз|рӯзи|Дирӯз) +Душанбе'
 UNION ALL SELECT 'DL',m."order",dl.translation FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id
 JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "Module" m ON m.id=l."moduleId"
 WHERE m."courseId"=${C} AND dl.translation ~ '(Имрӯз|рӯзи|Дирӯз) +Душанбе'`;
if(bad.length) bad.forEach(r=>console.log(`  🔴 ${r.src} M${r.mo+1}: ${r.v}`));
else console.log('  ✅ 0 — дар тамоми курс');
