// Ҷуфтҳои курс (ҳадаф ← модарӣ) ва шумораи дарсҳояшонро нишон медиҳад.
//   node prisma/_check-courses.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const rows = await sql.query(
  `SELECT c.id, t.code AS target, n.code AS native, c.level, c."isActive",
          (SELECT count(*)::int FROM "Lesson" le JOIN "Module" m ON le."moduleId" = m.id WHERE m."courseId" = c.id) AS lessons
     FROM "Course" c
     JOIN "Language" t ON t.id = c."targetLanguageId"
     JOIN "Language" n ON n.id = c."nativeLanguageId"
    ORDER BY n.code, t.code, c.level`);

for (const r of rows) {
  console.log(`${r.native} → ${r.target}  ${String(r.level).padEnd(3)} published=${r.isActive ? 'Y' : 'n'} lessons=${r.lessons}  ${r.id}`);
}
console.log(`\nҳамагӣ ${rows.length} курс`);
