// Сканери матни ТОҶИКИИ Модули 1-и курси русӣ — барои Фарзона (персонаи 11).
import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M1='cmqan0wp90097s2t1slvquxj7';
// Алифбои тоҷикӣ (35 ҳарф). Ҳарфҳои русӣ, ки дар тоҷикӣ НЕСТАНД: ц щ ы ь ъ(ҳаст) …
const TJ = 'абвгғдеёжзиӣйкқлмнопрстуӯфхҳчҷшъэюя';
const FOREIGN = /[цщыь]/g;           // дар алифбои тоҷикӣ нестанд
const LATIN = /[A-Za-z]/g;
const rows = [];
function push(where, field, text){ if(text && String(text).trim()) rows.push({where, field, text:String(text)}); }

const ls = await sql`SELECT id,"order",title,"titleTranslated" tt,"skillType" st,"grammarTopicId" g,"dialogueId" d,"comprehensionId" c
  FROM "Lesson" WHERE "moduleId"=${M1} ORDER BY "order"`;
for(const l of ls){
  const W=`L${l.order}`;
  push(W,'lesson.titleTranslated',l.tt);
  const ws = await sql`SELECT word,translation,"ipaTajik" ipt,"exampleTrans" ext,"order" o FROM "Word" WHERE "lessonId"=${l.id} ORDER BY "order"`;
  for(const w of ws){ push(`${W}/w${w.o} «${w.word}»`,'translation',w.translation); push(`${W}/w${w.o} «${w.word}»`,'ipaTajik',w.ipt); push(`${W}/w${w.o} «${w.word}»`,'exampleTrans',w.ext); }
  if(l.g){ const [g]=await sql`SELECT "titleTranslated" tt,explanation e FROM "GrammarTopic" WHERE id=${l.g}`;
    push(W,'grammar.titleTranslated',g.tt); push(W,'grammar.explanation',g.e);
    const rs=await sql`SELECT note FROM "GrammarRule" WHERE "topicId"=${l.g}`; rs.forEach((r,i)=>push(`${W}/rule${i}`,'note',r.note));
    const es=await sql`SELECT translation FROM "GrammarExample" WHERE "topicId"=${l.g}`; es.forEach((e,i)=>push(`${W}/ex${i}`,'translation',e.translation));
    const xs=await sql`SELECT "promptTranslated" pt,explanation ex,"order" o FROM "GrammarExercise" WHERE "topicId"=${l.g} ORDER BY "order"`;
    xs.forEach(x=>{push(`${W}/gx${x.o}`,'promptTranslated',x.pt); push(`${W}/gx${x.o}`,'explanation',x.ex);});
  }
  if(l.d){ const ln=await sql`SELECT speaker,translation,"order" o FROM "DialogueLine" WHERE "dialogueId"=${l.d} ORDER BY "order"`;
    ln.forEach(x=>push(`${W}/dlg${x.o} ${x.speaker}`,'translation',x.translation)); }
  if(l.c){ const [c]=await sql`SELECT "titleTranslated" tt,"passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${l.c}`;
    push(W,'comp.titleTranslated',c.tt); push(W,'comp.passageTranslated',c.pt);
    const qs=await sql`SELECT "questionTranslated" qt,explanation e,"order" o FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.c} ORDER BY "order"`;
    qs.forEach(q=>{push(`${W}/q${q.o}`,'questionTranslated',q.qt); push(`${W}/q${q.o}`,'explanation',q.e);});
  }
}
console.log(`Сатрҳои тоҷикӣ: ${rows.length}\n`);
const hit=(re,label,skipIpa=false)=>{
  console.log(`\n### ${label}`);
  let n=0;
  for(const r of rows){ if(skipIpa&&r.field==='ipaTajik') continue; const m=r.text.match(re); if(m){n++;console.log(`  [${r.where}] ${r.field}: «${r.text.slice(0,110)}» → ${[...new Set(m)].join(' ')}`);} }
  if(!n) console.log('  — тоза');
};
hit(FOREIGN,'Ҳарфҳои ғайритоҷикӣ (ц/щ/ы/ь) дар матни тоҷикӣ');
hit(LATIN,'Ҳарфҳои лотинӣ');
hit(/\s{2,}/g,'Ду фосилаи паиҳам');
hit(/\bту\b|\bТу\b|\bтуро\b|\bТуро\b|\bҳастӣ\b|\bхелӣ\b/g,'Муроҷиати «ТУ» (ғайрирасмӣ)');
hit(/\bшумо\b|\bШумо\b|\bед\b/gi,'Муроҷиати «ШУМО» (расмӣ)');
hit(/ ,|,,|\.\./g,'Аломати китобатии шубҳанок');
hit(/ташаккур/gi,'«Ташаккур»');
hit(/раҳмат/gi,'«Раҳмат» (ҳамон маъно, калимаи дигар)');
hit(/\//g,'Тарҷумаи ду-вариантӣ бо «/»');
