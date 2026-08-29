import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();

console.log('### КАДОМ ПАДЕЖҲО ДАР ТАМОМИ КУРС ТАЪЛИМ ДОДА МЕШАВАНД? ###');
const all = await sql`
 SELECT m."order" mo,l."order" lo,g.title,g."titleTranslated" tt,g.explanation ex
 FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "Module" m ON m.id=l."moduleId"
 WHERE m."courseId"=${C} ORDER BY m."order",l."order"`;
const CASES=['именительн','родительн','дательн','винительн','творительн','предложн'];
console.log('\n-- Мавзӯъҳое, ки падеж ТАЪЛИМ медиҳанд (дар унвон) --');
for(const g of all) if(CASES.some(c=>new RegExp(c,'i').test(g.title)||new RegExp(c,'i').test(g.tt)))
  console.log(`  M${g.mo+1} #${g.lo}  ${g.title} | ${g.tt}`);
console.log('\n-- Мавзӯъҳое, ки падежро танҳо ЗИКР мекунанд (дар матн) --');
for(const g of all){
  const hit = CASES.filter(c=>new RegExp(c,'i').test(g.ex));
  const inTitle = CASES.some(c=>new RegExp(c,'i').test(g.title)||new RegExp(c,'i').test(g.tt));
  if(hit.length && !inTitle) console.log(`  M${g.mo+1} #${g.lo}  ${g.tt}  → зикр: ${hit.join(', ')}`);
}

console.log('\n### НАМУДИ ФЕЪЛ (aspect) — совершенный/несовершенный ###');
let asp=0;
for(const g of all) if(/совершенн|несовершенн|намуди феъл|вид глагол/i.test(g.ex+g.title+g.tt)){ console.log(`  M${g.mo+1} #${g.lo} ${g.tt}`); asp++; }
console.log(asp?'':'  ✅ дар тамоми курс таълим ДОДА НАМЕШАВАД (барои A1 дуруст)');

console.log('\n### ГРАММАТИКА АЗ РӮИ МОДУЛ (зичӣ) ###');
const dens = await sql`
 SELECT m."order" mo,m."titleTranslated" mt,
   count(*) FILTER (WHERE l."skillType"='grammar')::int g,
   count(*) FILTER (WHERE l."skillType"='vocab')::int v, count(*)::int tot
 FROM "Module" m JOIN "Lesson" l ON l."moduleId"=m.id WHERE m."courseId"=${C}
 GROUP BY m."order",m."titleTranslated" ORDER BY m."order"`;
for(const r of dens) console.log(`  M${r.mo+1}  грамматика=${r.g}  луғат=${r.v}  ҳамагӣ=${r.tot}   ${r.mt}`);
