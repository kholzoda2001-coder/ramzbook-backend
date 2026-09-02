// МИГРАТСИЯ: `LibraryItem.nativeLang` — забони МОДАРИИ хонанда, ки мавод
// барояш аст ("tg", "ru"…). `null` = барои ҳама.
//
// ЧАРО скрипт, на `prisma db push`: аз ин мошин TCP 5432 ба Neon баста аст
// (ниг. хотираи `ramz-db-scripts-local`), пас драйвери HTTP-и `@neondatabase/
// serverless` истифода мешавад.
//
// ИДЕМПОТЕНТ: `IF NOT EXISTS` — такрор кардан бехатар аст. Сатрҳои мавҷуда
// `NULL` мегиранд, яъне рафтори имрӯза БЕТАҒЙИР мемонад: ҳама мавод ба ҳама
// хонанда намоён.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

await sql.query('ALTER TABLE "LibraryItem" ADD COLUMN IF NOT EXISTS "nativeLang" TEXT');
// Номи индекс АЙНАН ҳамон аст, ки Prisma месозад — вагарна `db push`-и оянда
// онро дубора месозад.
await sql.query('CREATE INDEX IF NOT EXISTS "LibraryItem_nativeLang_idx" ON "LibraryItem"("nativeLang")');

const cols = await sql.query(
  `SELECT column_name FROM information_schema.columns
    WHERE table_name = 'LibraryItem' AND column_name = 'nativeLang'`);
const rows = await sql.query(
  `SELECT "nativeLang", COUNT(*)::int AS n FROM "LibraryItem" GROUP BY "nativeLang"`);

console.log('сутун:', cols.length ? 'ҳаст ✅' : 'НЕСТ ❌');
console.log('тақсимоти nativeLang:');
for (const r of rows) console.log('  %s → %d', r.nativeLang ?? 'NULL (ҳама)', r.n);
