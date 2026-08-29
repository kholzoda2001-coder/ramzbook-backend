import { connect, COURSE_RU_A1 as C } from './_ru-fix-lib.mjs';
const sql = connect();
// ДУ калимаи гуногуни русӣ → ЯК тарҷумаи тоҷикӣ (триггери Hasan).
const rows = await sql`SELECT m."order" mo,l."order" lo,w.word,w.translation t FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON m.id=l."moduleId" WHERE m."courseId"=${C}`;
const byT={};
for(const r of rows){ const k=r.t.trim().toLowerCase(); (byT[k]||=new Map()).set(r.word,`M${r.mo+1}#${r.lo}`); }
const bad=Object.entries(byT).filter(([k,v])=>v.size>1).sort((a,b)=>b[1].size-a[1].size);
console.log(`### ЯК тарҷума ← ЧАНД калимаи русӣ: ${bad.length} ҳолат ###`);
for(const [t,v] of bad.slice(0,18)) console.log(`  «${t}»  ←  ${[...v.entries()].map(([w,m])=>`${w} (${m})`).join('  ·  ')}`);
