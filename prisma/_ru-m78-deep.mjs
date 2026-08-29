import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const M7='cmqan1jlx00fps2t1lbpwlqxw', M8='cmqan1m8y00gls2t1wsthkb9k';
console.log('### ipa АЗ РӮИ МОДУЛ (тамоми курс) ###');
for(const r of await sql`SELECT m."order" mo,m."titleTranslated" mt,count(*)::int t,count(*) FILTER (WHERE w.ipa IS NOT NULL AND btrim(w.ipa)<>'')::int f FROM "Module" m JOIN "Lesson" l ON l."moduleId"=m.id JOIN "Word" w ON w."lessonId"=l.id WHERE m."courseId"=${C} GROUP BY m."order",m."titleTranslated" ORDER BY m."order"`)
  console.log(`  M${r.mo+1}  ipa ${String(r.f).padStart(3)}/${String(r.t).padEnd(3)} ${r.f===r.t?'✅':'🔴'}  ${r.mt}`);
console.log('\n### ipa НЕСТ — аз рӯи дарс (M7/M8) ###');
for(const r of await sql`SELECT l."moduleId" mid,l."order" lo,l."titleTranslated" lt,count(*)::int n FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId" IN (${M7},${M8}) AND (w.ipa IS NULL OR btrim(w.ipa)='') GROUP BY l."moduleId",l."order",l."titleTranslated" ORDER BY l."moduleId",l."order"`)
  console.log(`  ${r.mid===M7?'M7':'M8'} #${String(r.lo).padStart(2)}  ${r.n} калима бе ipa   ${r.lt}`);
console.log('\n### GRAMMAR ПУРРА ###');
for(const g of await sql`SELECT g.title,g."titleTranslated" gt,g.explanation ex,l."moduleId" mid,l."order" lo,l."titleTranslated" lt FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M7},${M8}) ORDER BY l."moduleId",l."order"`){
  console.log(`\n═══ [${g.mid===M7?'M7':'M8'} #${g.lo}] ${g.title}\n    topic «${g.gt}»  card «${g.lt}»  ${g.gt===g.lt?'✅':'🔴 НОМУВОФИҚ'}\n`);
  console.log(g.ex);
}
