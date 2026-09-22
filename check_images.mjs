import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('./.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

async function run() {
  const deLang = await sql`SELECT id FROM "Language" WHERE code='de'`;
  const DE = deLang[0].id;
  
  const m1 = await sql`SELECT "Module".id FROM "Module" JOIN "Course" c ON "Module"."courseId" = c.id WHERE c."targetLanguageId"=${DE} AND "Module"."order"=0`;
  
  const words = await sql`
    SELECT w.word, w."imageUrl" 
    FROM "Word" w 
    JOIN "Lesson" l ON w."lessonId" = l.id 
    WHERE l."moduleId"=${m1[0].id}
    LIMIT 10
  `;
  console.log(words);
}
run().catch(console.error);
