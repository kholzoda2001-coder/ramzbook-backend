// Пасди сеюм — вариантҳои ДУПАҲЛӮ ва номувофиқии тарҷума.
//
// Аудити мошинӣ инҳоро дида наметавонад, чунки ҳар ду ҷавоб ГРАММАТИКӢ
// дурустанд — фарқ дар МАЪНОСТ:
//   • «Сара кист?» вариантҳо: муаллима / зан — матн ҳарду мегӯяд.
//   • «Аҳмад кист?» вариантҳо: донишҷӯ / мард — ҳарду дуруст.
// Хонандаи диққатнок ҷавоби «нодуруст»-и худро дуруст мешуморад ва
// боварии худро гум мекунад. Дистрактор бояд ЯКБОРА нодуруст бошад.
//
//   node prisma/_ar-m1-fix3.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 ORDER BY "order" LIMIT 1`, [course.id]);
const lessons = await sql.query(`SELECT "comprehensionId" c FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
const compIds = lessons.map((l) => l.c).filter(Boolean);

// 1. «Сара кист?» — «зан» ҳам дуруст буд; ба «писарбача» иваз шуд.
{
  const r = await sql.query(
    `UPDATE "ComprehensionQuestion" SET options='["بِنْتٌ","مُعَلِّمَةٌ","وَلَدٌ"]'::jsonb
      WHERE "exerciseId"=ANY($1) AND question='مَنْ هِيَ سَارَة؟'
        AND options::text LIKE '%اِمْرَأَةٌ%' RETURNING id`, [compIds]);
  console.log(`${r.length ? '✓' : '·'} Д9 «Сара кист?»: اِمْرَأَةٌ → وَلَدٌ (${r.length})`);
}

// 2. «Аҳмад кист?» — «мард» ҳам дуруст буд; ба «духтарбача» иваз шуд.
{
  const r = await sql.query(
    `UPDATE "ComprehensionQuestion" SET options='["مُعَلِّمٌ","طَالِبٌ","بِنْتٌ"]'::jsonb
      WHERE "exerciseId"=ANY($1) AND question='مَنْ هُوَ أَحْمَد؟' RETURNING id`, [compIds]);
  console.log(`${r.length ? '✓' : '·'} Д11 «Аҳмад кист?»: رَجُلٌ → بِنْتٌ (${r.length})`);
}

// 3. Тарҷумаи имтиҳон бо луғати дарс мувофиқ карда шуд
//    (وَلَد = «писарбача», بِنْت = «духтарбача» — ҳамон тавре ки Д4 меомӯзонад).
{
  const r = await sql.query(
    `UPDATE "ComprehensionExercise"
        SET "passageTranslated"='Салом! Номи ман Аҳмад аст. Ман писарбача ҳастам. Ин дӯсти ман Сара аст. Ӯ духтарбача аст. Сара дӯсти ман аст. Субҳ ба хайр, муаллим!'
      WHERE id=ANY($1) AND "titleTranslated"='Имтиҳони ниҳоӣ' RETURNING id`, [compIds]);
  console.log(`${r.length ? '✓' : '·'} Д13 тарҷума бо луғати Д4 мувофиқ шуд (${r.length})`);
}
