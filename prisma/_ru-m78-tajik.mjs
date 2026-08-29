import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
console.log('### «Пожалуйста» дар тамоми курс ###');
for(const r of await sql`SELECT m."order" mo,l."order" lo,w.word,w.translation t FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND w.word IN ('Пожалуйста','Не за что') ORDER BY m."order"`)
  console.log(`  M${r.mo+1}#${r.lo}  «${r.word}» → «${r.t}»`);
for(const r of await sql`SELECT m."order" mo,dl.text tx,dl.translation tr FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND dl.text ILIKE '%пожалуйста%' ORDER BY m."order"`)
  console.log(`  M${r.mo+1} муколама: «${r.tx}» → «${r.tr}»`);

console.log('\n### НОМУВОФИҚАТИИ ИСТИЛОҲ дар M7/M8 ###');
const M7='cmqan1jlx00fps2t1lbpwlqxw', M8='cmqan1m8y00gls2t1wsthkb9k';
const PAIRS=[['Спальня',/ҳуҷраи хоб|хобгоҳ/g],['Сумка',/халта|сумка/gi],['Кровать',/бистар|кат\b/gi]];
for(const [ru,re] of PAIRS){
  const w = await sql`SELECT w.word,w.translation t FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId" IN (${M7},${M8}) AND w.word=${ru}`;
  console.log(`\n  «${ru}» дар луғат → ${w.map(x=>`«${x.t}»`).join(', ')||'(нест)'}`);
  for(const p of await sql`SELECT l."order" lo,ce."titleTranslated" ct,ce."passageTranslated" pt FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId" IN (${M7},${M8})`){
    const h=[...new Set((p.pt||'').match(re)||[])];
    if(h.length) console.log(`      #${p.lo} «${p.ct}»: ${JSON.stringify(h)}`);
  }
}
