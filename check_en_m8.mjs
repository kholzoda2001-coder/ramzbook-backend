import { neon } from '@neondatabase/serverless';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('./.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
async function run() {
  const modIdRes = await sql.query(`SELECT m.id FROM "Module" m JOIN "Course" c ON m."courseId"=c.id WHERE m."order"=8 AND c.title='Англисӣ — A1'`);
  const lessons = await sql.query(`SELECT title, type FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [modIdRes[0].id]);
  console.log(lessons);
}
run();
