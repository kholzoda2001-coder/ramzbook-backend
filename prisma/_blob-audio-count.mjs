// Чанд аудио ҳанӯз ба Vercel Blob (403 — баста) ишора мекунад, аз рӯи ҷадвал ва забони курс. Танҳо хондан.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const cols = await sql.query(`SELECT table_name, column_name FROM information_schema.columns
  WHERE table_schema='public' AND column_name ILIKE '%audio%' AND data_type IN ('text','character varying')`);
for (const { table_name: t, column_name: c } of cols) {
  const [r] = await sql.query(`SELECT count(*)::int n FROM "${t}" WHERE "${c}" LIKE '%blob.vercel-storage.com%'`);
  if (r.n) console.log(`${t}.${c}: ${r.n}`);
}
const byLang = await sql.query(`SELECT l.code, count(*)::int n FROM "Word" w JOIN "Lesson" le ON le.id=w."lessonId"
  JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId" JOIN "Language" l ON l.id=c."targetLanguageId"
  WHERE w."audioUrl" LIKE '%blob.vercel-storage.com%' GROUP BY l.code`);
console.log('Word аз рӯи забон:', JSON.stringify(byLang));
