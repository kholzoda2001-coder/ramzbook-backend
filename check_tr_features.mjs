import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function checkFeatures() {
  const sql = neon(env.DATABASE_URL);
  
  // Find tr language ID
  const trLang = await sql`SELECT id FROM "Language" WHERE code='tr'`;
  const tgLang = await sql`SELECT id FROM "Language" WHERE code='tg'`;
  
  if (!trLang.length || !tgLang.length) {
    console.log("Languages not found!");
    return;
  }
  
  const targetId = trLang[0].id;
  const nativeId = tgLang[0].id;
  
  const alphabets = await sql`SELECT COUNT(*) as count FROM "AlphabetLetter" WHERE "targetLanguageId"=${targetId} AND "nativeLanguageId"=${nativeId}`;
  const onboarding = await sql`SELECT COUNT(*) as count FROM "OnboardingWord" WHERE "targetLanguageId"=${targetId} AND "nativeLanguageId"=${nativeId}`;
  const placement = await sql`SELECT COUNT(*) as count FROM "PlacementQuestion" WHERE "targetLanguageId"=${targetId} AND "nativeLanguageId"=${nativeId}`;
  
  console.log(`Alphabet letters: ${alphabets[0].count}`);
  console.log(`Onboarding (Shinosoi): ${onboarding[0].count}`);
  console.log(`Placement Test (Sathsanji): ${placement[0].count}`);
}

checkFeatures().catch(console.error);
