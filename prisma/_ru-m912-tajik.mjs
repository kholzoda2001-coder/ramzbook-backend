import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const IDS = await sql`SELECT id,"order" o FROM "Module" WHERE "courseId"=${C} AND "order" IN (8,9,10,11) ORDER BY "order"`;
const N=Object.fromEntries(IDS.map(m=>[m.id,`M${m.o+1}`])); const mids=IDS.map(m=>m.id);

// Ҳамаи сатрҳои тоҷикӣ ҷамъ мешаванд
const TG=[];
for(const r of await sql`SELECT w.translation v,w."exampleTrans" v2,w.word ru,l."moduleId" mid,l."order" lo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId"=ANY(${mids})`) { TG.push({s:`Word «${r.ru}»`,mid:r.mid,lo:r.lo,v:r.v}); TG.push({s:`Word «${r.ru}» мисол`,mid:r.mid,lo:r.lo,v:r.v2}); }
for(const r of await sql`SELECT ce."passageTranslated" v,ce."titleTranslated" t,l."moduleId" mid,l."order" lo FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id WHERE l."moduleId"=ANY(${mids})`) TG.push({s:`Passage «${r.t}»`,mid:r.mid,lo:r.lo,v:r.v});
for(const r of await sql`SELECT dl.translation v,dl.text ru,l."moduleId" mid,l."order" lo FROM "DialogueLine" dl JOIN "Dialogue" dg ON dl."dialogueId"=dg.id JOIN "Lesson" l ON l."dialogueId"=dg.id WHERE l."moduleId"=ANY(${mids})`) TG.push({s:`Dialogue «${r.ru}»`,mid:r.mid,lo:r.lo,v:r.v});

console.log('### КАЛИМАИ РУСӢ ДАР МАТНИ ТОҶИКӢ ###');
// калимаҳои соф русӣ, ки тоҷикӣ муодили худро дорад
const RU_ONLY=['рубашка','платье','брюки','юбка','обувь','голова','живот','горло','спина','зуб','лекарство','аптека','больница','поезд','автобус','налево','направо','прямо','дерево','цветок','река','гора','снег','дождь','ветер','школа','урок','учитель','счастлив','грустн'];
let n=0;
for(const t of TG){ if(!t.v) continue;
  for(const w of RU_ONLY){ const re=new RegExp(`(^|[^А-Яа-яЁёӣӯқғҳҷ])${w}[а-яё]*($|[^А-Яа-яЁёӣӯқғҳҷ])`,'i');
    if(re.test(t.v)){ console.log(`  🟠 ${N[t.mid]} #${t.lo} ${t.s}: «${w}» → ${t.v.slice(0,110)}`); n++; break; } } }
console.log(`  ҳамагӣ: ${n}`);

console.log('\n### ЯК КАЛИМАИ РУСӢ → ЧАНД ТАРҶУМАИ ГУНОГУН (дар як модул) ###');
const byWord={};
for(const r of await sql`SELECT w.word,w.translation t,l."moduleId" mid FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId"=ANY(${mids})`){
  const k=`${N[r.mid]}|${r.word}`; (byWord[k]||=new Set()).add(r.t); }
for(const [k,v] of Object.entries(byWord)) if(v.size>1) console.log(`  🟠 ${k}: ${[...v].map(x=>`«${x}»`).join(' vs ')}`);

console.log('\n### ЛОТИНӢ ДАР МАТНИ ТОҶИКӢ (берун аз грамматика) ###');
for(const t of TG){ if(!t.v) continue;
  const h=[...new Set((t.v.replace(/\b[ABC][12]\b/g,'').match(/[A-Za-z][A-Za-z'’]{1,}/g)||[]))];
  if(h.length) console.log(`  🟠 ${N[t.mid]} #${t.lo} ${t.s}: ${JSON.stringify(h)} → ${t.v.slice(0,100)}`); }
