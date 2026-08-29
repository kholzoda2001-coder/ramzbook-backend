import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M3='cmqan13cx00b5s2t1zft7vpq2', M4='cmqan16rf00c6s2t1e277g7we';

console.log('##### «Душанбе» ҳамчун ШАҲР дар ҷои РӮЗИ ҲАФТА #####');
for(const [t,cols,j] of [
  ['ComprehensionExercise',['passageTranslated'],`"courseId"='cmq95o7ic0001qsy5l76202bw'`],
]){}
const hits = [];
const pass = await sql`SELECT ce."titleTranslated" ct,ce."passageTranslated" pt,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId" IN (${M3},${M4})`;
for(const r of pass) if(/Имрӯз\s+Душанбе|рӯзи\s+Душанбе|\bДушанбе\s+аст/.test(r.pt||'')) hits.push(`Passage [${r.mid===M3?'M3':'M4'}#${r.lo}] «${r.ct}»: ${r.pt}`);
const dl = await sql`SELECT dl.translation tr,dl.text tx,l."moduleId" mid,l."order" lo FROM "Dialogue" d JOIN "Lesson" l ON l."dialogueId"=d.id JOIN "DialogueLine" dl ON dl."dialogueId"=d.id WHERE l."moduleId" IN (${M3},${M4})`;
for(const r of dl) if(/Имрӯз\s+Душанбе|\bДушанбе\s+аст/.test(r.tr)) hits.push(`Dialogue [${r.mid===M3?'M3':'M4'}#${r.lo}]: «${r.tx}» → «${r.tr}»`);
const wd = await sql`SELECT w.word,w.translation t,w."exampleTrans" et,l."moduleId" mid,l."order" lo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId" IN (${M3},${M4})`;
for(const r of wd) if(/Имрӯз\s+Душанбе|\bДушанбе\s+аст/.test(r.et||'')||/^Душанбе$/.test(r.t)) hits.push(`Word [${r.mid===M3?'M3':'M4'}#${r.lo}] «${r.word}» → «${r.t}» / «${r.et}»`);
hits.forEach(h=>console.log('  🔴 '+h));
console.log(`  ҳамагӣ: ${hits.length}`);

console.log('\n##### Моҳ бо ҳарфи КАЛОН дар мобайн #####');
const MONTHS=/\b(Январ|Феврал|Март|Апрел|Май|Июн|Июл|Август|Сентябр|Октябр|Ноябр|Декабр)\w*/g;
for(const r of pass){ const m=(r.pt||'').match(/[^.!?]\s(Январ|Феврал|Апрел|Июн|Июл|Август|Сентябр|Октябр|Ноябр|Декабр)\w*/g); if(m) console.log(`  🟠 [${r.mid===M3?'M3':'M4'}#${r.lo}] «${r.ct}»: ${m.join(', ')} — ${r.pt}`); }

console.log('\n##### КАЛИМА ДАР ҲАР ДАРС (Zero: >3 = воҳима) #####');
const per = await sql`SELECT l."moduleId" mid,l."order" lo,l."titleTranslated" lt,l."skillType" st,count(w.id)::int c FROM "Lesson" l LEFT JOIN "Word" w ON w."lessonId"=l.id WHERE l."moduleId" IN (${M3},${M4}) GROUP BY l.id,l."moduleId",l."order",l."titleTranslated",l."skillType" ORDER BY l."moduleId",l."order"`;
for(const r of per) if(r.c>0) console.log(`  ${r.mid===M3?'M3':'M4'} #${String(r.lo).padStart(2)} ${String(r.c).padStart(2)} калима  ${r.lt}`);

console.log('\n##### ВАРИАНТҲОИ НОБАРОБАР (3 ↔ 4) дар як машқ #####');
const q = await sql`SELECT ce."titleTranslated" ct,q.question qq,q.options o,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId" IN (${M3},${M4}) ORDER BY l."moduleId",l."order",q."order"`;
const byEx={};
for(const r of q){ const k=`${r.mid===M3?'M3':'M4'}#${r.lo} ${r.ct}`; (byEx[k]||=[]).push((Array.isArray(r.o)?r.o:JSON.parse(r.o)).length); }
for(const [k,v] of Object.entries(byEx)){ const u=[...new Set(v)]; if(u.length>1) console.log(`  🟠 ${k}: ${JSON.stringify(v)}`); }
