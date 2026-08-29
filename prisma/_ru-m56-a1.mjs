import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M5='cmqan1dwx00e5s2t1f345mm6i', M6='cmqan1hbm00f5s2t11fvlnrp8';
// ⚠️ ДОМ: дар JS `\b` бо кириллӣ КОР НАМЕКУНАД (`\w` танҳо ASCII аст), пас
// `\bбы\b` ҳеҷ гоҳ намеёбад. Ба ҷои он марзи фосила/аломат истифода мешавад.
const B = '(^|[^А-Яа-яЁёӣӯқғҳҷ])';
const E = '($|[^А-Яа-яЁёӣӯқғҳҷ])';
const ADV = [
  ['шарти «бы» (B1)',            new RegExp(B+'бы'+E)],
  ['падежи родительнӣ',          /родительн/i],
  ['феъли бозгашта -ся (A2)',    /умываю|умывае|просыпаю|ложус|ложит|возвратн/i],
  ['инкори дукарата',            /никогда не/i],
  ['ҷамъи родительнӣ бе бандак', /несколько яблок|нет яблок|нет воды|нет мяса|нет молока/i],
  ['«можно + масдар»',           new RegExp(B+'[Мм]ожно'+E)],
];
const src = [];
for(const r of await sql`SELECT 'grammar' k,g."titleTranslated" t,g.explanation v,l."moduleId" m,l."order" o FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M5},${M6})`) src.push(r);
for(const r of await sql`SELECT 'passage' k,ce."titleTranslated" t,ce.passage v,l."moduleId" m,l."order" o FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId" IN (${M5},${M6})`) src.push(r);
for(const r of await sql`SELECT 'dialogue' k,dg."titleTranslated" t,dl.text v,l."moduleId" m,l."order" o FROM "Dialogue" dg JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "DialogueLine" dl ON dl."dialogueId"=dg.id WHERE l."moduleId" IN (${M5},${M6})`) src.push(r);
for(const r of await sql`SELECT 'grEx' k,g."titleTranslated" t,ge.prompt||' '||ge.answer v,l."moduleId" m,l."order" o FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id JOIN "GrammarExercise" ge ON ge."topicId"=g.id WHERE l."moduleId" IN (${M5},${M6})`) src.push(r);
console.log('### СОХТҲОИ БОЛОИ A1 дар M5/M6 ###');
for(const [name,re] of ADV){
  const hits = src.filter(s=>re.test(s.v));
  console.log(`\n  ▸ ${name} — ${hits.length}`);
  for(const h of hits.slice(0,4)) console.log(`      [${h.m===M5?'M5':'M6'} #${h.o} ${h.k}] «${h.t}»  →  ${h.v.replace(/\n/g,' ').slice(0,95)}`);
}
