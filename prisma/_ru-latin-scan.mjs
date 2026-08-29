import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
// Ҳар калимаи ЛОТИНӢ дар матни тоҷикии грамматика. Аз рӯйхати ибораҳои муайян
// (`to be`, `article`…) ФАРҚ мекунад: он рӯйхат «How many books?»-ро НАМЕБИНАД,
// чунки ибораи нав аст. Ин ҷо баръакс — ҳар чизи лотинӣ дода мешавад.
//
// ⚠️ Аввал сатҳҳои CEFR (A1/B2) бурида мешаванд, вагарна «A» аз «A1» ҳамчун
// калимаи алоҳида дида мешуд ва бардурӯғ медод.
const ALLOW = /^(I{1,3}|IV|V|VI{0,3}|IX|X|SMS|TV|OK)$/;
const rows = await sql`
  SELECT m."order" mo,l."order" lo,g."titleTranslated" gt,g.explanation ex
  FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${C} ORDER BY m."order",l."order"`;
let n=0, words=0;
for(const r of rows){
  const clean = r.ex.replace(/\b[ABC][12]\b/g,'');   // A1, B2, … нест мекунем
  const hits=[...new Set((clean.match(/[A-Za-z][A-Za-z'’]*/g)||[]).filter(w=>!ALLOW.test(w)))];
  if(!hits.length) continue;
  n++; words+=hits.length;
  console.log(`  🔴 M${r.mo+1} #${r.lo} «${r.gt}»  → ${JSON.stringify(hits)}`);
  for(const s of clean.split('\n')) if(/[A-Za-z]{2,}/.test(s)) console.log(`       › ${s.trim().slice(0,130)}`);
}
console.log(`\n  Мавзӯъҳо бо матни лотинӣ: ${n}/${rows.length}  ·  калимаҳои ягона: ${words}`);
