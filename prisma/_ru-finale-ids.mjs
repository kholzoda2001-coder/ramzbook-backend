import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const IDS = await sql`SELECT id,"order" o FROM "Module" WHERE "courseId"=${C} AND "order" IN (8,9,10,11) ORDER BY "order"`;
const N=Object.fromEntries(IDS.map(m=>[m.id,`M${m.o+1}`])); const mids=IDS.map(m=>m.id);

console.log('### T1a · курра ###');
for(const r of await sql`SELECT ce.id,ce."passageTranslated" v,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE ce."passageTranslated" ~ 'курра'`) console.log(`${r.id} #${r.lo}\n  ${r.v}`);
console.log('\n### T1b · феъли амрӣ ###');
for(const r of await sql`SELECT dl.id,dl.text tx,dl.translation tr,l."moduleId" mid,l."order" lo FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id JOIN "Lesson" l ON l."dialogueId"=dg.id WHERE l."moduleId"=ANY(${mids}) AND dl.translation ~ 'равед|гардед'`) console.log(`${r.id} ${N[r.mid]}#${r.lo}  «${r.tx}» → «${r.tr}»`);
for(const r of await sql`SELECT ce.id,ce."passageTranslated" v,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId"=ANY(${mids}) AND ce."passageTranslated" ~ 'шифо ёбед'`) console.log(`${r.id} ${N[r.mid]}#${r.lo} PASSAGE\n  ${r.v}`);
console.log('\n### T1c · Соро ###');
for(const r of await sql`SELECT ce.id,ce.title t,ce."titleTranslated" tt,ce."passageTranslated" v,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE ce."passageTranslated" ~ 'Соро' OR ce."titleTranslated" ~ '[Сс]оро'`) console.log(`${r.id} #${r.lo}\n  title «${r.tt}»\n  ${r.v}`);
console.log('\n### T2a · унвонҳои placeholder + номувофиқ ###');
for(const r of await sql`SELECT g.id gid,l.id lid,l."moduleId" mid,l."order" lo,g.title ru,l."titleTranslated" lt,g."titleTranslated" gt FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId"=ANY(${mids}) ORDER BY l."moduleId",l."order"`)
  console.log(`${N[r.mid]}#${r.lo} ru=«${r.ru}»\n   L ${r.lid} «${r.lt}»\n   G ${r.gid} «${r.gt}»  ${r.lt===r.gt?'✅':'🔴'}`);
console.log('\n### T2b · бархӯрди луғат ###');
for(const r of await sql`SELECT w.id,w.word,w.translation t,w."exampleTrans" et,m."order" mo,l."order" lo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND ((w.word IN ('Платье','Рубашка') AND m."order"=9) OR (w.word IN ('Банка','Коробка') AND m."order"=7) OR (w.word IN ('Жаркий','Тёплый') AND m."order"=11)) ORDER BY m."order",w.word`)
  console.log(`${r.id} M${r.mo+1}#${r.lo} «${r.word}» → «${r.t}»  | ${r.et}`);
