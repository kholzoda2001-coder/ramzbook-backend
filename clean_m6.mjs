import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync('./.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
async function clean() {
  const mods = await sql.query(`SELECT id FROM "Module" WHERE "courseId"='cmqdhwb5q00021z597df2767m' AND "order"=6`);
  if (!mods.length) return;
  const modId = mods[0].id;
  const lessons = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [modId]);
  for (const l of lessons) {
    await sql.query(`DELETE FROM "Word" WHERE "lessonId"=$1`, [l.id]);
    await sql.query(`DELETE FROM "Lesson" WHERE id=$1`, [l.id]);
  }
  console.log('Cleaned lessons and words');
}
clean();
