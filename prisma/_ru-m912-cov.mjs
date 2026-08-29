import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const IDS = await sql`SELECT id,"order" o FROM "Module" WHERE "courseId"=${C} AND "order" IN (8,9,10,11) ORDER BY "order"`;
const N=Object.fromEntries(IDS.map(m=>[m.id,`M${m.o+1}`])); const mids=IDS.map(m=>m.id);
console.log('### ФАРОГИРИИ ТАВЗЕҲ ###');
for(const r of await sql`SELECT l."moduleId" mid,l."order" lo,l."skillType" st,ce."titleTranslated" ct,
  count(*)::int t,count(*) FILTER (WHERE q.explanation IS NOT NULL AND btrim(q.explanation)<>'')::int f
  FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
  JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId"=ANY(${mids})
  GROUP BY l."moduleId",l."order",l."skillType",ce."titleTranslated" ORDER BY l."moduleId",l."order"`)
  console.log(`  ${N[r.mid]} #${String(r.lo).padStart(2)} ${r.st.padEnd(9)} ${String(r.f).padStart(2)}/${r.t}  ${r.f===r.t?'✅':(r.f===0?'❌ ПУРРА ХОМӮШ':'⚠️')}  «${r.ct}»`);

console.log('\n### ВАРАҚАИ ⚡: навъи воқеӣ ###');
for(const g of await sql`SELECT g."titleTranslated" gt,g.explanation ex,l."moduleId" mid,l."order" lo FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId"=ANY(${mids}) ORDER BY l."moduleId",l."order"`){
  const i=g.ex.indexOf('⚡');
  const kind = i<0 ? '— НЕСТ' : (/Фарқ аз тоҷикӣ|Монанди тоҷикӣ/.test(g.ex) ? '✅ МУҚОИСА БО ТОҶИКӢ' : `⚠️ ⚡ ҳаст, вале муқоиса НЕСТ → «${g.ex.slice(i,i+70).split('\n')[0].replace(/⚡\s*\**/,'').split(':')[0]}»`);
  console.log(`  ${N[g.mid]} #${g.lo}  ${kind}   «${g.gt}»`);
}

console.log('\n### correctIndex аз рӯи МОДУЛ ###');
for(const m of IDS){
  const q=await sql`SELECT q."correctIndex" ci,jsonb_array_length(q.options) n FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId"=${m.id}`;
  const d={}; for(const x of q) d[x.ci]=(d[x.ci]||0)+1;
  const tot=q.length, z=(d[0]||0);
  console.log(`  M${m.o+1}: ${JSON.stringify(d)}  index0=${z}/${tot} (${Math.round(100*z/tot)}%) ${z/tot>0.5?'⚠️':''}`);
}
