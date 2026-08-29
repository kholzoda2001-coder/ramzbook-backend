import { connect } from './_ru-fix-lib.mjs';
const sql = connect();
const r = await sql`SELECT w.word,w.translation t,w."exampleTrans" e FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
  WHERE l."moduleId"='cmqan16rf00c6s2t1e277g7we'
  AND w.word IN ('Понедельник','Вторник','Среда','Четверг','Пятница','Суббота','Воскресенье') ORDER BY w."order"`;
for(const x of r) console.log(`  ${x.word.padEnd(13)} → ${String(x.t).padEnd(12)} | ${x.e}`);
