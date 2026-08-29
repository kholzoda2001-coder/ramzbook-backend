import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
const M5='cmqan1dwx00e5s2t1f345mm6i', M6='cmqan1hbm00f5s2t11fvlnrp8';

// Забон дар матни РУСӢ ↔ забон дар тарҷумаи ТОҶИКӢ бояд ЯКХЕЛА бошад.
const LANGS = [
  ['русск|по-русски', 'русӣ|Русӣ',   'русӣ'],
  ['англи',           'англис|Англис','англисӣ'],
  ['таджикск|по-таджикски','тоҷик|Тоҷик','тоҷикӣ'],
];
console.log('### ЗАБОН ДАР РУСӢ ↔ ТОҶИКӢ (тамоми курс) ###');
const pass = await sql`
 SELECT m."order" mo,l."order" lo,ce."titleTranslated" ct,ce.passage p,ce."passageTranslated" pt
 FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId"
 WHERE m."courseId"=${C} ORDER BY m."order",l."order"`;
let n=0;
for(const r of pass){
  if(!r.pt) continue;
  for(const [ru,tg,name] of LANGS){
    const inRu = new RegExp(ru).test(r.p), inTg = new RegExp(tg).test(r.pt);
    if(inRu && !inTg){
      const other = LANGS.find(([r2,t2])=>t2!==tg && new RegExp(t2).test(r.pt));
      console.log(`  🔴 M${r.mo+1} #${r.lo} «${r.ct}»`);
      console.log(`       RU: ${r.p.match(new RegExp('[^.]*(' + ru + ')[^.]*\.'))?.[0]?.trim()}`);
      console.log(`       TG: ${r.pt.match(new RegExp('[^.]*(' + tg.split('|')[0] + '|' + (other?other[1].split('|')[0]:'zzz') + ')[^.]*\.'))?.[0]?.trim() || r.pt}`);
      console.log(`       → русӣ «${name}» мегӯяд, тоҷикӣ ${other?'«'+other[2]+'»':'чизи дигар'} мегӯяд`);
      n++;
    }
  }
}
console.log(`  ҳамагӣ: ${n}`);

console.log('\n### КАЛИМАИ РУСӢ ДАР МАТНИ ТОҶИКӢ (M5/M6) ###');
const RUONLY = ['рис','суп','телевизор','футбол','банан','картошка'];
const TGFOR = {рис:'биринҷ', суп:'шӯрбо', телевизор:'телевизор (қабул)', футбол:'футбол (қабул)', банан:'банан (қабул)', картошка:'картошка (қабул)'};
for(const r of pass){
  if(!r.pt) continue;
  for(const w of ['рис']) {
    if(new RegExp(`(^|[^а-яёӣӯқғҳҷ])${w}([^а-яёӣӯқғҳҷ]|$)`,'i').test(r.pt))
      console.log(`  🟠 M${r.mo+1} #${r.lo} «${r.ct}»: «${w}» — тоҷикӣ «${TGFOR[w]}» аст\n       ${r.pt}`);
  }
}

console.log('\n### САВОЛҲОИ БИСЁРҶАВОБА (эҳтимолӣ) ###');
const q = await sql`
 SELECT m."order" mo,l."order" lo,ce."titleTranslated" ct,q.question qq,q.options o,q."correctIndex" ci
 FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id JOIN "Module" m ON m.id=l."moduleId"
 JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id
 WHERE l."moduleId" IN (${M5},${M6}) ORDER BY m."order",l."order",q."order"`;
for(const r of q){
  const o=Array.isArray(r.o)?r.o:JSON.parse(r.o);
  if(/У меня ___ яблок|есть ___ молока|___ хлеба/.test(r.qq))
    console.log(`  ⚠️  M${r.mo+1} #${r.lo}: «${r.qq}»  ${JSON.stringify(o)} → танҳо «${o[r.ci]}» қабул мешавад`);
}

console.log('\n### ШУМОРАИ ВАРИАНТҲО дар як машқ ###');
const byEx={};
for(const r of q){ const k=`M${r.mo+1} #${r.lo} ${r.ct}`; (byEx[k]||=[]).push((Array.isArray(r.o)?r.o:JSON.parse(r.o)).length); }
for(const [k,v] of Object.entries(byEx)){ const u=[...new Set(v)]; if(u.length>1) console.log(`  🟠 ${k}: ${JSON.stringify(v)}`); }
