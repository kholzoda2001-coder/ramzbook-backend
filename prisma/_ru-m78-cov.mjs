import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M7='cmqan1jlx00fps2t1lbpwlqxw', M8='cmqan1m8y00gls2t1wsthkb9k';
for(const r of await sql`SELECT l."moduleId" mid,l."order" lo,l."skillType" st,ce."titleTranslated" ct,
  count(*)::int t, count(*) FILTER (WHERE q.explanation IS NOT NULL AND btrim(q.explanation)<>'')::int f
  FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
  JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId" IN (${M7},${M8})
  GROUP BY l."moduleId",l."order",l."skillType",ce."titleTranslated" ORDER BY l."moduleId",l."order"`)
  console.log(`  ${r.mid===M7?'M7':'M8'} #${String(r.lo).padStart(2)} ${r.st.padEnd(9)} ${String(r.f).padStart(2)}/${r.t}  ${r.f===r.t?'✅':(r.f===0?'❌ ХОМӮШ':'⚠️')}  «${r.ct}»`);
const tm = await sql`SELECT l."moduleId" mid,l."order" lo,l."titleTranslated" lt,g."titleTranslated" gt FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M7},${M8}) ORDER BY l."moduleId",l."order"`;
console.log('\n### Унвон корт ↔ экран ###');
for(const r of tm) console.log(`  ${r.lt===r.gt?'✅':'🔴'} [${r.mid===M7?'M7':'M8'} #${r.lo}] корт «${r.lt}»  ↔  экран «${r.gt}»`);
