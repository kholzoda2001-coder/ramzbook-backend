import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const M7='cmqan1jlx00fps2t1lbpwlqxw', M8='cmqan1m8y00gls2t1wsthkb9k';
console.log('### T1 · Фоссилҳои англисӣ ###');
for(const r of await sql`SELECT g.id,g."titleTranslated" tt,g.explanation ex,m."order" mo,l."order" lo FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND g.explanation ~ '[A-Za-z]{3,}' ORDER BY m."order"`){
  const clean=r.ex.replace(/\b[ABC][12]\b/g,'');
  const hits=[...new Set((clean.match(/[A-Za-z][A-Za-z'’]*/g)||[]).filter(w=>!/^(I{1,3}|IV|V|VI{0,3}|IX|X|SMS|TV|OK)$/.test(w)))];
  if(!hits.length) continue;
  console.log(`\n${r.id}  [M${r.mo+1}#${r.lo}] «${r.tt}»  ${JSON.stringify(hits)}`);
  for(const s of r.ex.split('\n')) if(/[A-Za-z]{3,}/.test(s)) console.log(`   LINE: ${JSON.stringify(s)}`);
}
console.log('\n### T2a · «Пожалуйста» → «Меарзад» ###');
for(const r of await sql`SELECT dl.id,dl.text tx,dl.translation tr,m."order" mo,l."order" lo FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND dl.translation ~ 'Меарзад' ORDER BY m."order"`)
  console.log(`  ${r.id}  M${r.mo+1}#${r.lo}  «${r.tx}» → «${r.tr}»`);
for(const r of await sql`SELECT w.id,w.word,w.translation t,m."order" mo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C} AND w.translation ~ 'Меарзад'`)
  console.log(`  WORD ${r.id}  M${r.mo+1}  «${r.word}» → «${r.t}»`);
console.log('\n### T2b · Унвонҳо ###');
for(const r of await sql`SELECT g.id gid,l.id lid,l."moduleId" mid,l."order" lo,l."titleTranslated" lt,g."titleTranslated" gt FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M7},${M8}) ORDER BY l."moduleId",l."order"`)
  console.log(`[${r.mid===M7?'M7':'M8'}#${r.lo}] lesson ${r.lid} «${r.lt}»\n           topic  ${r.gid} «${r.gt}»`);
console.log('\n### T3 · Тавзеҳи холӣ ###');
for(const q of await sql`SELECT q.id,q.question qq,q.options o,q."correctIndex" ci,ce."titleTranslated" ct,ce.passage p,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId" IN (${M7},${M8}) AND (q.explanation IS NULL OR btrim(q.explanation)='') ORDER BY l."moduleId",l."order",q."order"`){
  const o=Array.isArray(q.o)?q.o:JSON.parse(q.o);
  console.log(`${q.id} [${q.mid===M7?'M7':'M8'}#${q.lo}] ${q.qq}  → "${o[q.ci]}"`);
}
