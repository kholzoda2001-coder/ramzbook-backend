import { neon } from '@neondatabase/serverless';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split('\n').filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
sql`SELECT id, "order", title, "skillType" FROM "Lesson" WHERE "moduleId" IN (SELECT id FROM "Module" WHERE "courseId"='cmqdhwb5q00021z597df2767m' AND "order"=10) ORDER BY "order"`.then(console.log);
