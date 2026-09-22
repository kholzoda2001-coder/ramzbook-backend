import { neon } from '@neondatabase/serverless';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('./.env', 'utf8').split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
async function run() {
  const mods = await sql.query(`SELECT "order", title FROM "Module" WHERE "courseId"='cmqdhwb5q00021z597df2767m' ORDER BY "order"`);
  console.log(mods);
}
run();
