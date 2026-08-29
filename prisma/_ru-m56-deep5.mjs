import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const M5='cmqan1dwx00e5s2t1f345mm6i', M6='cmqan1hbm00f5s2t11fvlnrp8';
console.log('### МУКОЛАМАҲО ###');
for(const d of await sql`SELECT dl.*,dg."titleTranslated" dt,l."moduleId" mid,l."order" lo FROM "Dialogue" dg JOIN "Lesson" l ON l."dialogueId"=dg.id JOIN "DialogueLine" dl ON dl."dialogueId"=dg.id WHERE l."moduleId" IN (${M5},${M6}) ORDER BY l."moduleId",dl."order"`)
  console.log(`[${d.mid===M5?'M5':'M6'} #${d.lo} «${d.dt}»] ${d.order} ${d.isUser?'USER':'BOT '} | ${d.text}  ||  ${d.translation}`);

console.log('\n### ЛУҒАТ — M5 (феълҳо: масдар ё тасрифшуда?) ###');
for(const w of await sql`SELECT w.word,w.translation t,w."partOfSpeech" p,l."order" lo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId"=${M5} ORDER BY l."order",w."order"`)
  console.log(`  #${String(w.lo).padStart(2)} ${w.word.padEnd(18)} ${String(w.t).padEnd(24)} ${w.p}`);
console.log('\n### ЛУҒАТ — M6 ###');
for(const w of await sql`SELECT w.word,w.translation t,w."partOfSpeech" p,l."order" lo FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id WHERE l."moduleId"=${M6} ORDER BY l."order",w."order"`)
  console.log(`  #${String(w.lo).padStart(2)} ${w.word.padEnd(18)} ${String(w.t).padEnd(24)} ${w.p}`);
