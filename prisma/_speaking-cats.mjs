// Рӯйхати категорияҳои «Гуфтор» барои як забон (танҳо хондан).
//   node prisma/_speaking-cats.mjs tr
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const rows = await sql.query(
  `SELECT c."order", c."titleTranslated", c.title, c."isActive", c.goals,
          (SELECT count(*) FROM "SpeakingLesson" l WHERE l."categoryId" = c.id) AS lessons
     FROM "SpeakingCategory" c JOIN "Language" t ON t.id = c."targetLanguageId"
    WHERE t.code = $1 ORDER BY c."order"`, [process.argv[2] ?? 'tr']);
for (const r of rows) console.log(r.order, r.isActive ? '✓' : '✗', r.titleTranslated, '|', r.title, '|', r.lessons, 'дарс', JSON.stringify(r.goals));
console.log(`ҳамагӣ: ${rows.length}`);
