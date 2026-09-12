// D2 — `يَوْماً` дар матни имтиҳон. Решаи он `يَوْم` («рӯз») аст, ки дар
// МОДУЛИ ВАҚТ ҳеҷ гоҳ корт нашудааст — гарчанде дар мисол, грамматика ва
// ҳар матн истифода мешавад. Ин камбудии воқеӣ аст, на хатои детектор.
//
// Ҷои дурусташ «Рӯзҳои ҳафта» аст ва маҳз ПЕШ аз худи рӯзҳо.
// Ғайр аз ин ҷумлаи имтиҳон ба шакли бе танвин навишта мешавад.
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
const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=3`,[c.id]);
const [d] = await sql.query(
  `SELECT id FROM "Lesson" WHERE "moduleId"=$1 AND "titleTranslated"='Рӯзҳои ҳафта'`,[m.id]);

const [dup] = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 AND word='يَوْم'`,[d.id]);
if (dup) console.log('· يَوْم аллакай ҳаст');
else {
  await sql.query(`UPDATE "Word" SET "order"="order"+1 WHERE "lessonId"=$1`,[d.id]);
  await sql.query(
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,"ipaTajik",example,"exampleTrans","order",difficulty)
     VALUES (gen_random_uuid()::text,$1,'يَوْم','Рӯз','📆','явм','اليَوْمُ الاِثْنَيْن.','Имрӯз душанбе аст.',1,1)`,[d.id]);
  // Мисоли `الاِثْنَيْن` ҳамин ҷумларо дошт — ду корт як мисол намешавад (D10).
  await sql.query(
    `UPDATE "Word" SET example='عِنْدَنَا مُوسِيقَى يَوْمَ الاِثْنَيْن.', "exampleTrans"='Рӯзи душанбе мо мусиқӣ дорем.'
      WHERE "lessonId"=$1 AND word='الاِثْنَيْن'`,[d.id]);
  console.log('✓ 📆 يَوْم = «Рӯз» ба сари «Рӯзҳои ҳафта»');
}

const ks = (await sql.query(`SELECT "comprehensionId" k FROM "Lesson" WHERE "moduleId"=$1 AND "comprehensionId" IS NOT NULL`,[m.id])).map(x=>x.k);
const r = await sql.query(
  `UPDATE "ComprehensionExercise" SET passage=REPLACE(passage,'كَانَ يَوْماً سَعِيداً.','كَانَ يَوْمُ الأَحَدِ سَعِيداً.'),
     "passageTranslated"=REPLACE("passageTranslated",'Рӯзи хуше буд.','Рӯзи якшанбе хуш буд.')
    WHERE id=ANY($1) AND passage LIKE '%يَوْماً%' RETURNING 1 x`,[ks]);
console.log(`${r.length?'✓':'·'} матни имтиҳон: «يَوْماً» → «يَوْمُ الأَحَدِ»`);
