// Ба `ContentReport` чор сутуни КОНТЕКСТ илова мекунад.
//
// Чаро дастӣ: аз ин мошин Prisma ба Neon намерасад (TCP 5432 баста) —
// `db push` кор намекунад. Ниг. [[ramz-db-scripts-local]].
//
//   node prisma/_add-report-context-http.mjs --dry
//   node prisma/_add-report-context-http.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const COLS = ['promptShown', 'userAnswer', 'correctAnswer', 'optionsShown'];

const have = (await q(
  `SELECT column_name FROM information_schema.columns WHERE table_name='ContentReport'`
)).map(r => r.column_name);

const missing = COLS.filter(c => have.indexOf(c) < 0);
console.log(`сутунҳои мавҷуд: ${have.length} · намерасад: ${missing.length ? missing.join(', ') : '—'}`);

if (!missing.length) { console.log('Ҳама ҳастанд, коре нест.'); process.exit(0); }
if (DRY) { console.log(`[--dry] ${missing.length} сутун илова МЕШУД.`); process.exit(0); }

// `IF NOT EXISTS` идемпотентӣ мекунад — скриптро ду бор давондан бехатар аст.
for (const c of missing) {
  await q(`ALTER TABLE "ContentReport" ADD COLUMN IF NOT EXISTS "${c}" TEXT`);
  console.log(`  + ${c}`);
}

const after = (await q(
  `SELECT column_name FROM information_schema.columns WHERE table_name='ContentReport'`
)).map(r => r.column_name);
const left = COLS.filter(c => after.indexOf(c) < 0);
console.log(left.length ? `⚠️ ҳанӯз намерасад: ${left.join(', ')}` : '✅ ҳар чор сутун дар ҷояш.');
