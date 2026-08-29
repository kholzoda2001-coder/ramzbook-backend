import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M1='cmqan0wp90097s2t1slvquxj7', M2='cmqan0zr4009qs2t1j4w7u49q';

const ces = await sql`
 SELECT ce.id, l."moduleId" mid, l."order" lo, l."skillType" st, l."titleTranslated" lt,
        ce.title, ce."titleTranslated" ctt, ce.kind, ce.passage, ce."passageTranslated" pt, ce."audioUrl"
 FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
 WHERE l."moduleId" IN (${M1},${M2}) ORDER BY l."moduleId", l."order"`;
let totQ=0, withExp=0;
for(const ce of ces){
  console.log(`\n╔══ [${ce.mid===M1?'M1':'M2'} #${ce.lo} ${ce.st}] ${ce.lt} → "${ce.title}" | "${ce.ctt}" (type=${ce.kind}, audio=${ce.audioUrl?1:0})`);
  if(ce.passage) console.log('  PASSAGE: '+ce.passage.replace(/\n/g,' / '));
  if(ce.pt) console.log('  PASS_TG: '+ce.pt.replace(/\n/g,' / '));
  const qs = await sql`SELECT question,"questionTranslated" qt,options,"correctIndex" ci,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${ce.id} ORDER BY "order"`;
  for(const q of qs){
    totQ++; if(q.explanation && q.explanation.trim()) withExp++;
    const opts = Array.isArray(q.options)?q.options:JSON.parse(q.options);
    console.log(`  Q: ${q.question} | ${q.qt||'—'}`);
    console.log(`     opts=${JSON.stringify(opts)} ci=${q.ci} -> "${opts[q.ci]}"`);
    console.log(`     EXPL: ${q.explanation && q.explanation.trim() ? q.explanation : '❌ НЕСТ'}`);
  }
}
console.log(`\n#### COMPREHENSION QUESTIONS: ${withExp}/${totQ} have explanation`);
