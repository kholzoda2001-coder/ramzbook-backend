import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('./.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

async function run() {
  const trLang = await sql`SELECT id FROM "Language" WHERE code='tr'`;
  const TR = trLang[0].id;
  
  const m1 = await sql`SELECT id FROM "Module" WHERE "targetLanguageId"=${TR} AND "order"=0`;
  if (!m1.length) return console.log("M1 not found");
  
  const words = await sql`
    SELECT w.word, w.translation 
    FROM "Word" w 
    JOIN "Lesson" l ON w."lessonId" = l.id 
    WHERE l."moduleId"=${m1[0].id}
  `;
  console.log(`Total words in M1: ${words.length}`);
  console.log(words.map(w => w.word).join(', '));
}
run().catch(console.error);
