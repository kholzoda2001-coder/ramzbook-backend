import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function checkAudio() {
  const sql = neon(env.DATABASE_URL);
  
  const wordsWithAudio = await sql`SELECT COUNT(*) as count FROM "Word" WHERE "audioUrl" IS NOT NULL AND "audioUrl" != ''`;
  const wordsWithoutAudio = await sql`SELECT COUNT(*) as count FROM "Word" WHERE "audioUrl" IS NULL OR "audioUrl" = ''`;
  
  const sentencesWithAudio = await sql`SELECT COUNT(*) as count FROM "GrammarExample" WHERE "audioUrl" IS NOT NULL AND "audioUrl" != ''`;
  const sentencesWithoutAudio = await sql`SELECT COUNT(*) as count FROM "GrammarExample" WHERE "audioUrl" IS NULL OR "audioUrl" = ''`;
  
  console.log(`Words WITH audio: ${wordsWithAudio[0].count}`);
  console.log(`Words WITHOUT audio: ${wordsWithoutAudio[0].count}`);
  console.log(`Grammar Examples WITH audio: ${sentencesWithAudio[0].count}`);
  console.log(`Grammar Examples WITHOUT audio: ${sentencesWithoutAudio[0].count}`);
  
  const sample = await sql`SELECT "audioUrl" FROM "Word" WHERE "audioUrl" IS NOT NULL LIMIT 1`;
  if (sample.length > 0) {
    console.log(`Sample audio URL: ${sample[0].audioUrl}`);
  }
}

checkAudio().catch(console.error);
