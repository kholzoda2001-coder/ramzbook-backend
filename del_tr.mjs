import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

async function wipe() {
  const sql = neon(env.DATABASE_URL);
  await sql`DELETE FROM "Module" WHERE "courseId" = 'cmqdgwx740002c7nfgyzaaj8v'`;
  console.log("Wiped all modules from Turkish course.");
}
wipe().catch(console.error);
