// Ҷадвали `UserReport`-ро ба Neon мегузорад.
//
// Prisma аз ин мошин ба Neon намерасад (порти 5432 баста), пас драйвери
// HTTP истифода мешавад — ниг. [[ramz-db-scripts-local]].
//
// ⚠️ Ду доми драйвер:
//   1. дар як дархост ТАНҲО ЯК амр — файли SQL ба амрҳо тақсим мешавад;
//   2. `sql(...)` акнун ТАНҲО tagged-template аст. Барои сатри тайёр
//      `sql.query(text)` лозим — вагарна ҳар ҳашт амр як хел меафтад.
//
// Ҳамаи амрҳо идемпотентанд (`IF NOT EXISTS` / `DROP … IF EXISTS`), пас
// такрори иҷро бехатар аст.
//
//   node prisma/_apply-user-reports.mjs --dry
//   node prisma/_apply-user-reports.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const DRY = process.argv.includes('--dry');

const raw = readFileSync(
  new URL('./sql/2026-09-07-user-reports.sql', import.meta.url),
  'utf8',
);

// Тавзеҳҳоро мебарорем ва аз рӯи «;» мебурем.
const statements = raw
  .split('\n')
  .filter((l) => !l.trim().startsWith('--'))
  .join('\n')
  .split(';')
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

console.log(`${DRY ? 'НАМОИШ' : 'ТАТБИҚ'}: ${statements.length} амр\n`);

for (const [i, st] of statements.entries()) {
  const head = st.split('\n')[0].slice(0, 78);
  if (DRY) {
    console.log(`${i + 1}. ${head}`);
    continue;
  }
  try {
    await sql.query(st);
    console.log(`  OK  ${i + 1}. ${head}`);
  } catch (e) {
    console.log(`  XX  ${i + 1}. ${head}\n      ${e.message}`);
    process.exitCode = 1;
  }
}

if (!DRY) {
  const [{ n }] = await sql.query(
    `SELECT count(*)::int AS n FROM information_schema.tables WHERE table_name = 'UserReport'`,
  );
  console.log(`\nҷадвали UserReport дар база: ${n === 1 ? 'ҲАСТ' : 'НЕСТ'}`);
  const cols = await sql.query(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'UserReport' ORDER BY ordinal_position`,
  );
  console.log(`сутунҳо (${cols.length}): ${cols.map((c) => c.column_name).join(', ')}`);
}
