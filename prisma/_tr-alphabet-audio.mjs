import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';

const raw = readFileSync(new URL('../.env', import.meta.url), 'utf8');
const env = Object.fromEntries(
  raw.split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const WORK = 'tmp/tr-alphabet-audio';

const NAME = {
  'A': 'a', 'B': 'be', 'C': 'ce', 'Ç': 'çe', 'D': 'de', 'E': 'e', 'F': 'fe', 'G': 'ge', 'Ğ': 'yumuşak ge',
  'H': 'he', 'I': 'ı', 'İ': 'i', 'J': 'je', 'K': 'ke', 'L': 'le', 'M': 'me', 'N': 'ne', 'O': 'o', 'Ö': 'ö',
  'P': 'pe', 'R': 're', 'S': 'se', 'Ş': 'şe', 'T': 'te', 'U': 'u', 'Ü': 'ü', 'V': 've', 'Y': 'ye', 'Z': 'ze'
};

async function run() {
  const trLang = await sql`SELECT id FROM "Language" WHERE code='tr'`;
  const tgLang = await sql`SELECT id FROM "Language" WHERE code='tg'`;
  if (!trLang.length || !tgLang.length) throw new Error("Languages not found");
  
  const TR = trLang[0].id;
  const TG = tgLang[0].id;

  const letters = await sql`SELECT id, uppercase, lowercase, "audioUrl" FROM "AlphabetLetter" WHERE "targetLanguageId"=${TR} AND "nativeLanguageId"=${TG} ORDER BY "uppercase"`;
  console.log(`Letters to process: ${letters.length}`);

  const missing = letters.filter(l => !NAME[l.uppercase]);
  if (missing.length) { console.error('Missing pronunciation for:', missing.map(m => m.uppercase).join(' ')); process.exit(1); }

  mkdirSync(WORK, { recursive: true });
  writeFileSync(`${WORK}/items.json`, JSON.stringify(letters.map(l => ({ id: l.id, text: NAME[l.uppercase] })), null, 1));
  
  console.log('\n== Generating Audio (edge-tts) ==');
  const out = execFileSync('python', ['prisma/_tr-tts.py', WORK, `${WORK}/items.json`], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
  console.log(out);
  
  console.log("Audio generation complete. Note: skipping upload to Vercel due to suspension.");
}

run().catch(console.error);
