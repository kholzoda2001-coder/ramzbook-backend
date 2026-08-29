import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M1='cmqan0wp90097s2t1slvquxj7', M2='cmqan0zr4009qs2t1j4w7u49q';

// Collect EVERY user-visible text row in M1/M2 with its source
const rows=[];
const push=(src,tg,ru='')=>rows.push({src,tg:tg||'',ru:ru||''});

for(const r of await sql`SELECT l."moduleId" mid,l."order" lo,w.word,w.translation t,w.example e,w."exampleTrans" et FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId" IN (${M1},${M2})`)
  push(`Word ${r.mid===M1?'M1':'M2'}#${r.lo} "${r.word}"`, r.t+' || '+r.et, r.word+' '+r.e);
for(const r of await sql`SELECT g."titleTranslated" tt,g.explanation ex FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M1},${M2})`)
  push(`GrammarTopic "${r.tt}"`, r.ex);
for(const r of await sql`SELECT g."titleTranslated" tt,ge.prompt p,ge."promptTranslated" pt,ge.explanation ex FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "GrammarExercise" ge ON ge."topicId"=g.id WHERE l."moduleId" IN (${M1},${M2})`)
  push(`GrEx "${r.tt}"`, [r.pt,r.ex].join(' || '), r.p);
for(const r of await sql`SELECT ce."titleTranslated" tt,ce."passageTranslated" pt,ce.passage p FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId" IN (${M1},${M2})`)
  push(`Passage "${r.tt}"`, r.pt, r.p);
for(const r of await sql`SELECT ce."titleTranslated" tt,q.question q,q."questionTranslated" qt,q.explanation ex,q.options o FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId" IN (${M1},${M2})`)
  push(`CompQ "${r.tt}"`, [r.qt,r.ex].join(' || '), r.q+' '+JSON.stringify(r.o));
for(const r of await sql`SELECT d."titleTranslated" tt,dl.text t,dl.translation tr FROM "Dialogue" d JOIN "Lesson" l ON l."dialogueId"=d.id JOIN "DialogueLine" dl ON dl."dialogueId"=d.id WHERE l."moduleId" IN (${M1},${M2})`)
  push(`Dlg "${r.tt}"`, r.tr, r.t);
for(const r of await sql`SELECT g."titleTranslated" tt,ge.sentence s,ge.translation tr FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "GrammarExample" ge ON ge."topicId"=g.id WHERE l."moduleId" IN (${M1},${M2})`)
  push(`GrExample "${r.tt}"`, r.tr, r.s);

console.log('TOTAL TEXT ROWS SCANNED:', rows.length);

const CHECKS = [
  ['ФОИЛӢ residual',      /фоилӣ/i,                    r=>r.tg],
  ['ТУ+ШУМО same row',    null,                        null],
  ['English reference',   /англис/i,                   r=>r.tg],
  ['артикл mention',      /артикл/i,                   r=>r.tg],
  ['мой друг (fem ctx)',  /мой друг/i,                 r=>r.ru+' '+r.tg],
  ['Latin letters in TG', /[A-Za-z]{2,}/,              r=>r.tg],
  ['double space',        /  +/,                       r=>r.tg],
  ['space before punct',  / [.,!?:;]/,                 r=>r.tg],
  ['ru "ё"→"е" in Шумо',  /Шумо/,                      r=>r.tg],
];
for(const [name,re,get] of CHECKS){
  if(!re) continue;
  const hits = rows.filter(r=>re.test(get(r)));
  console.log(`\n--- ${name}: ${hits.length}`);
  hits.slice(0,12).forEach(h=>console.log(`    [${h.src}] ${h.tg.slice(0,180).replace(/\n/g,' ⏎ ')}`));
}

// Ту/Шумо in the SAME visible row
console.log('\n--- ТУ and ШУМО in SAME row:');
const both = rows.filter(r=>{
  const s=r.tg+' '+r.ru;
  return /(^|[^а-яёӣӯқғҳҷА-ЯЁ])[Тт]у($|[^а-яёӣӯқғҳҷA-Za-z])/.test(s) && /[Шш]умо/.test(s);
});
both.forEach(h=>console.log(`    [${h.src}]\n        RU: ${h.ru.slice(0,150)}\n        TG: ${h.tg.slice(0,220).replace(/\n/g,' ⏎ ')}`));
console.log('  count =',both.length);

// Russian-side register clash: Здравствуйте (formal) + ты (informal) in one dialogue
console.log('\n--- RUSSIAN REGISTER CLASH (Здравствуйте + ты in one dialogue):');
for(const [name,mid] of [['M1',M1],['M2',M2]]){
  const dl = await sql`SELECT dl.text t FROM "Dialogue" d JOIN "Lesson" l ON l."dialogueId"=d.id JOIN "DialogueLine" dl ON dl."dialogueId"=d.id WHERE l."moduleId"=${mid} ORDER BY dl."order"`;
  const all = dl.map(x=>x.t).join(' ');
  const formal = /Здравствуйте|\bвы\b|\bвас\b|\bвам\b/i.test(all);
  const informal = /(^|[^а-яё])(ты|тебя|тебе)($|[^а-яё])/i.test(all);
  console.log(`  ${name}: formal=${formal} informal=${informal} ${formal&&informal?'<<< CLASH':'ok'}`);
}
