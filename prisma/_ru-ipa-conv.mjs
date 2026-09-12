import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();
const rows = await sql`SELECT w.word, w."ipaTajik" t FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} AND w."ipaTajik" IS NOT NULL AND w."ipaTajik"<>'' AND (w.word ILIKE '%ы%' OR w.word ~* '^[а-яё]{2,3}$') LIMIT 40`;
for (const r of rows) console.log(r.word, '→', r.t);
