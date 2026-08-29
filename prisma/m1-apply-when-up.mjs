// Waits for the database to become reachable, then runs m1-fixes.mjs --apply
// exactly once. Bounded: gives up after ~40 minutes rather than retrying
// forever. The fix script is idempotent, so a partial network blip mid-run is
// recoverable by simply running it again.
import { readFileSync } from 'fs';
import { spawn } from 'child_process';
import { neon } from '@neondatabase/serverless';
import { Agent, setGlobalDispatcher } from 'undici';
setGlobalDispatcher(new Agent({ connect: { timeout: 20000 } }));

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);

const DEADLINE = Date.now() + 40 * 60 * 1000;
let attempt = 0;
while (Date.now() < DEADLINE) {
  attempt++;
  try {
    await sql`SELECT 1`;
    console.log(`\n✅ database reachable on attempt ${attempt} — running the fix with --apply\n`);
    const child = spawn(process.execPath, ['--dns-result-order=ipv4first',
      new URL('./m1-fixes.mjs', import.meta.url).pathname.replace(/^\//, ''), '--apply', '--sql'],
      { stdio: 'inherit' });
    process.exit(await new Promise((r) => child.on('exit', r)));
  } catch {
    if (attempt % 10 === 0) console.log(`still unreachable after ${attempt} attempts (${Math.round((DEADLINE - Date.now()) / 60000)} min left)`);
    await new Promise((r) => setTimeout(r, 20000));
  }
}
console.log('\n❌ gave up: the database stayed unreachable for 40 minutes. Nothing was written.');
process.exit(1);
