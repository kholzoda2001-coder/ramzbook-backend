import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
console.log('### «курра» (курраи/колт) vs «курта» (пироҳан) — тамоми курс ###');
for(const r of await sql`SELECT m."order" mo,l."order" lo,ce."titleTranslated" t,ce."passageTranslated" v FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND ce."passageTranslated" ~ 'курра'`)
  console.log(`  🔴 M${r.mo+1}#${r.lo} «${r.t}»: ${r.v.match(/[^.]*курра[^.]*\./)?.[0]?.trim()}`);
for(const r of await sql`SELECT m."order" mo,w.word,w.translation t FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND w.word IN ('Рубашка','Платье')`)
  console.log(`     луғат: M${r.mo+1} «${r.word}» → «${r.t}»`);

console.log('\n### «Сара» ↔ «Соро» — як шахс, ду ном ###');
for(const r of await sql`SELECT m."order" mo,l."order" lo,ce."titleTranslated" t,ce.passage p,ce."passageTranslated" v FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND (ce."passageTranslated" ~ 'Соро' OR ce."titleTranslated" ~ '[Сс]оро')`){
  console.log(`  🔴 M${r.mo+1}#${r.lo} унвон: «${r.t}»`);
  console.log(`     RU: ${r.p}`);
  console.log(`     TG: ${r.v}`);
  console.log(`     → «Соро» ${(r.v.match(/Соро/g)||[]).length} бор, «Сара» ${(r.v.match(/Сара/g)||[]).length} бор`);
}

console.log('\n### Феъли амрӣ: «Выздоравливай» ва дигар ###');
for(const r of await sql`SELECT m."order" mo,l."order" lo,ce.passage p,ce."passageTranslated" v FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND ce.passage ~ 'Выздоравливай|Принимай'`){
  const ru=r.p.match(/[^.!?]*(Выздоравливай|Принимай)[^.!?]*[.!?]/)?.[0]?.trim();
  console.log(`  M${r.mo+1}#${r.lo} RU: ${ru}`);
  console.log(`             TG: ${r.v.match(/[^.!?»]*(ёбед|гир|кун)[^.!?»]*[.!?»]/)?.[0]?.trim()}`);
}
