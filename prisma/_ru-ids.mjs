import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M1='cmqan0wp90097s2t1slvquxj7', M2='cmqan0zr4009qs2t1j4w7u49q';
const rows = await sql`
 SELECT q.id, l."moduleId" mid, l."order" lo, ce."titleTranslated" ct, q.question qq,
        q."questionTranslated" qt, q.options o, q."correctIndex" ci, q.explanation ex
 FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
 JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id
 WHERE l."moduleId" IN (${M1},${M2}) ORDER BY l."moduleId", l."order", q."order"`;
for(const r of rows){
  const blank = !r.ex || !r.ex.trim();
  const tgt = blank
    || (r.lo===10 && r.mid===M2 && /языках/.test(r.qq))
    || (r.lo===13 && r.mid===M1 && /Сара/.test(r.qq))
    || (r.lo===13 && r.mid===M2 && /спросить/.test(r.qq));
  if(!tgt) continue;
  console.log(`${r.id}  [${r.mid===M1?'M1':'M2'} #${r.lo}] ${r.ct}`);
  console.log(`   q  : ${r.qq}`);
  console.log(`   qt : ${r.qt}`);
  console.log(`   ans: ${JSON.stringify(r.o)} ci=${r.ci}`);
  console.log(`   ex : ${blank?'(EMPTY)':JSON.stringify(r.ex)}\n`);
}
