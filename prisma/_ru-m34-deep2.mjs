import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();

console.log('##### ipaTajik ФАРОГИРӢ АЗ РӮИ МОДУЛ #####');
const rows = await sql`
 SELECT m."order" mo, m."titleTranslated" mt, count(*)::int total,
        count(*) FILTER (WHERE w."ipaTajik" IS NOT NULL AND btrim(w."ipaTajik")<>'')::int filled
 FROM "Module" m JOIN "Lesson" l ON l."moduleId"=m.id JOIN "Word" w ON w."lessonId"=l.id
 WHERE m."courseId"=${C} GROUP BY m."order",m."titleTranslated" ORDER BY m."order"`;
for(const r of rows) console.log(`  M${r.mo+1}  ${String(r.filled).padStart(3)}/${String(r.total).padEnd(3)}  ${r.mt}`);

console.log('\n##### ФОССИЛИ АНГЛИСӢ ДАР УНВОНҲО (тамоми курс) #####');
const LAT=/[A-Za-z]{2,}/;
for(const [tbl,cols] of [['GrammarTopic',['title','titleTranslated']],['Lesson',['title','titleTranslated']],['ComprehensionExercise',['title','titleTranslated']],['Dialogue',['title','titleTranslated']],['Module',['title','titleTranslated']]]){
  const q = await sql`SELECT id, title, "titleTranslated" tt FROM ${sql.unsafe(`"${tbl}"`)} WHERE ${tbl==='Lesson'?sql.unsafe(`"moduleId" IN (SELECT id FROM "Module" WHERE "courseId"='${C}')`):sql.unsafe(`"courseId"='${C}'`)}`;
  for(const r of q){
    if(LAT.test(r.tt)) console.log(`  🔴 ${tbl}.titleTranslated  «${r.tt}»   (русӣ: «${r.title}») ${r.id}`);
  }
}

console.log('\n##### НОМУВОФИҚАТИИ УНВОН: Lesson ↔ GrammarTopic (M3/M4) #####');
const M3='cmqan13cx00b5s2t1zft7vpq2', M4='cmqan16rf00c6s2t1e277g7we';
const g = await sql`
 SELECT l."order" lo,l."moduleId" mid,l."titleTranslated" lt,g."titleTranslated" gt
 FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
 WHERE l."moduleId" IN (${M3},${M4}) ORDER BY l."moduleId",l."order"`;
const norm=s=>s.replace(/^Грамматика\s*[—:-]\s*/i,'').trim().toLowerCase();
for(const r of g){
  const same = norm(r.lt)===norm(r.gt);
  console.log(`  ${same?'✅':'🔴'} [${r.mid===M3?'M3':'M4'} #${r.lo}]  корт: «${r.lt}»   ↔   экран: «${r.gt}»`);
}

console.log('\n##### НОХУНАКИ ASCII дар матни тоҷикӣ (M3/M4 grammar) #####');
const ex = await sql`
 SELECT l."moduleId" mid,l."order" lo,g."titleTranslated" gt,g.explanation e
 FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
 WHERE l."moduleId" IN (${M3},${M4})`;
for(const r of ex){
  const m = r.e.match(/"[^"]{1,40}"/g);
  if(m) console.log(`  🟠 [${r.mid===M3?'M3':'M4'} #${r.lo}] ${r.gt}: ${m.join(' , ')}`);
}
