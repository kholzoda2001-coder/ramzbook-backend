import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
// Решаи калима, на шакли пурра — тоҷикӣ ҳам сарф мешавад («русӣ» → «русии»).
const L = [
  { key:'ru', ru:/рус(ск|ь)|по-русски/i, tg:/рус[иӣ]/i },
  { key:'en', ru:/англи[йи]ск|по-английски/i, tg:/англис/i },
  { key:'tg', ru:/таджикск|по-таджикски/i, tg:/тоҷик/i },
];
const rows = await sql`
 SELECT m."order" mo,l."order" lo,ce."titleTranslated" ct,ce.passage p,ce."passageTranslated" pt
 FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId"
 WHERE m."courseId"=${C} AND ce."passageTranslated" IS NOT NULL ORDER BY m."order",l."order"`;
let n=0;
for(const r of rows){
  const inRu = L.filter(x=>x.ru.test(r.p)).map(x=>x.key);
  const inTg = L.filter(x=>x.tg.test(r.pt)).map(x=>x.key);
  const missing = inRu.filter(k=>!inTg.includes(k));
  const extra   = inTg.filter(k=>!inRu.includes(k));
  if(missing.length||extra.length){
    n++;
    console.log(`  🔴 M${r.mo+1} #${r.lo} «${r.ct}»`);
    console.log(`       РУСӢ забонҳо : ${inRu.join(',')||'—'}`);
    console.log(`       ТОҶИКӢ забонҳо: ${inTg.join(',')||'—'}`);
    console.log(`       RU: ${r.p}`);
    console.log(`       TG: ${r.pt}`);
  }
}
console.log(`\n  Номувофиқатии забон дар тамоми курс: ${n}`);
