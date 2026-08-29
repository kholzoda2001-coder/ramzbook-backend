import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M7='cmqan1jlx00fps2t1lbpwlqxw', M8='cmqan1m8y00gls2t1wsthkb9k';
const B='(^|[^А-Яа-яЁё])', E='($|[^А-Яа-яЁё])';
const ADV=[
 ['падежи ПРЕДЛОЖНЫЙ (номаълум)', /предложн|в комнате|на столе|в магазине|в спальне|на кухне/i],
 ['падежи ТВОРИТЕЛЬНЫЙ (номаълум)', /творительн|под столом|рядом с окном|под стулом|картой|с мамой|с деньгами|с семьёй/i],
 ['падежи РОДИТЕЛЬНЫЙ (номаълум)', /родительн|нет телевизора|нет ламп|сколько книг|сколько воды|десять долларов/i],
 ['мувофиқати СИФАТ дар падеж (A2)', /красную рубашку|чёрные брюки|те туфли|эти туфли|синюю рубашку|новая одежда/i],
 ['«нужен/нужна/нужны» (A2)', new RegExp(B+'нуж(ен|на|но|ны)'+E,'i')],
 ['«Мне нужна…» дательный (A2)', /мне нужна|нам нужны/i],
];
const src=[];
for(const r of await sql`SELECT 'grammar' k,g."titleTranslated" t,g.explanation v,l."moduleId" m,l."order" o FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M7},${M8})`) src.push(r);
for(const r of await sql`SELECT 'passage' k,ce."titleTranslated" t,ce.passage v,l."moduleId" m,l."order" o FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId" IN (${M7},${M8})`) src.push(r);
for(const r of await sql`SELECT 'dialogue' k,dg."titleTranslated" t,dl.text v,l."moduleId" m,l."order" o FROM "Dialogue" dg JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "DialogueLine" dl ON dl."dialogueId"=dg.id WHERE l."moduleId" IN (${M7},${M8})`) src.push(r);
console.log('### СОХТҲОИ БОЛОИ A1 / ПАДЕЖҲОИ НОМАЪЛУМ ###');
for(const [n,re] of ADV){
  const h=src.filter(s=>re.test(s.v));
  console.log(`\n  ▸ ${n} — ${h.length}`);
  for(const x of h.slice(0,4)) console.log(`      [${x.m===M7?'M7':'M8'} #${x.o} ${x.k}] «${x.t}» → ${(x.v.match(re)||[''])[0]}`);
}
console.log('\n### МУКОЛАМАҲО ###');
for(const d of await sql`SELECT dl.*,dg."titleTranslated" dt,l."moduleId" mid,l."order" lo FROM "Dialogue" dg JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "DialogueLine" dl ON dl."dialogueId"=dg.id WHERE l."moduleId" IN (${M7},${M8}) ORDER BY l."moduleId",dl."order"`)
  console.log(`[${d.mid===M7?'M7':'M8'} #${d.lo} «${d.dt}»] ${d.order} ${d.isUser?'USER':'BOT '} | ${d.text}  ||  ${d.translation}`);
