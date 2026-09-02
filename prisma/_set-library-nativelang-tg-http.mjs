// Ҳамаи воҳидҳои МАВҶУДАИ китобхона ба забони модарии ТОҶИКӢ баста мешаванд.
//
// Сабаб: ҳар шаш сарлавҳа ва тамоми мазмуни онҳо тоҷикист («Оила — 100 калимаи
// зарурии англисӣ»), пас ба хонандаи русзабон онҳо ҳеҷ фоида надоранд.
//
// ⚠️ ОҚИБАТ: баъди ин корбари бо забони модарии `ru`/`en` дар Китобхона
// ХОЛӢ мебинад, то он даме ки барои ӯ мавод илова шавад. Маҳз ҳамин рафтори
// талабшуда аст (ниг. `app/api/mobile/library/route.ts`).
//
// Танҳо сатрҳои `NULL` даст мехӯранд — воҳиде, ки админ аллакай ба забони
// дигар бастааст, бетағйир мемонад. Такрор кардан бехатар.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const before = await sql.query(
  `SELECT COUNT(*)::int AS n FROM "LibraryItem" WHERE "nativeLang" IS NULL`);
console.log('before: NULL =', before[0].n);

// ⚠️ `sql.query()` барои UPDATE массиви ХОЛӢ бармегардонад — `rowCount` нест.
// Натиҷа ҷудогона санҷида мешавад (доми хотираи `ramz-db-scripts-local`).
await sql.query(`UPDATE "LibraryItem" SET "nativeLang" = 'tg' WHERE "nativeLang" IS NULL`);

const after = await sql.query(
  `SELECT "nativeLang", COUNT(*)::int AS n FROM "LibraryItem" GROUP BY "nativeLang"`);
console.log('after:');
for (const r of after) console.log('  %s -> %d', r.nativeLang ?? 'NULL', r.n);
