// `سيء` («Бад») ягона калимаест, ки ТАНҲО дар дарси ХОМӮШИ Модули 4 буд —
// дар ҳеҷ ҷои фаъоли курс таълим намешуд. Ҷои табиии он Модули 10
// «Либос ва Рангҳо», дарси «Тасвири либосҳо» аст, ки جَدِيد/قَدِيم/جَمِيل/
// قَبِيح-ро меомӯзонад.
//
// Ду чиз ҳангоми кӯчонидан дуруст карда мешавад:
//   • Матни аслӣ БЕ ҲАРАКАТ буд (`سيء`) — дарси мақсад ҳама ҷо ҳаракат
//     дорад. Навишти дурусти он `سَيِّئ` аст.
//   • `ipaTajik` НАДОШТ (аз ҳамон ду дарси нотамом).
//   • Мисолаш дар бораи обу ҳаво буд — дарс дар бораи ЛИБОС аст.
//
// Тартиби кортҳои он дарс 0..6 буд (D8) — ҳамзамон 1..8 мешавад.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url),'utf8')
  .split('\n').filter((l)=>l.includes('=')&&!l.trim().startsWith('#'))
  .map((l)=>{const i=l.indexOf('=');return [l.slice(0,i).trim(),l.slice(i+1).trim().replace(/^["']|["']$/g,'')];}));
const sql = neon(env.DATABASE_URL);
const [c] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [m9] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=9`,[c.id]);
const [dst] = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1 AND "order"=7`,[m9.id]);

const [ex] = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 AND word='سَيِّئ'`,[dst.id]);
if (ex) console.log('· سَيِّئ аллакай дар дарси мақсад ҳаст');
else {
  await sql.query(
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,"ipaTajik",example,"exampleTrans","order",difficulty)
     VALUES (gen_random_uuid()::text,$1,'سَيِّئ','Бад','👎','сайиъ','هَذَا الحِذَاءُ سَيِّئٌ.','Ин пойафзол бад аст.',999,1)`,
    [dst.id]);
  console.log('✓ 👎 سَيِّئ = «Бад» ба «Тасвири либосҳо»');
}
// D8 — тартиби ҳамон дарс 0..6 буд.
const ws = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 ORDER BY "order", id`,[dst.id]);
for (let i=0;i<ws.length;i++) await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`,[ws[i].id,i+1]);
console.log(`✓ тартиби дарс: ${ws.length} корт → 1..${ws.length}`);

// Манбаъ аз дарси хомӯши Модули 4 бароварда мешавад — «кӯчонидан», на «нусха».
const del = await sql.query(
  `DELETE FROM "Word" w USING "Lesson" l, "Module" m
    WHERE w."lessonId"=l.id AND l."moduleId"=m.id AND m."courseId"=$1
      AND m."order"=3 AND w.word='سيء' RETURNING 1 AS x`,[c.id]);
console.log(`${del.length?'✓':'·'} манбаъ аз дарси хомӯши Модули 4 бароварда шуд`);
