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
  const words = await sql`SELECT word, translation FROM "OnboardingWord" WHERE "targetLanguageId"=${TR}`;
  console.log(words);
}
run().catch(console.error);
