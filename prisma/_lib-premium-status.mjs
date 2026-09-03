// Ҳолати ҶОРИИ парчами isPremium дар китобхона — танҳо ХОНИШ.
import { readFileSync } from 'node:fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync('.env', 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => {
      const i = l.indexOf('=');
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^"|"$/g, '')];
    }),
);
const sql = neon(env.DATABASE_URL);

const rows = await sql`
  SELECT type, "isPremium", "isActive", COUNT(*)::int AS n
  FROM "LibraryItem"
  GROUP BY type, "isPremium", "isActive"
  ORDER BY type, "isPremium"`;
console.table(rows);

const all = await sql`
  SELECT title, type, "isPremium", "isActive", "targetLang", "nativeLang"
  FROM "LibraryItem" ORDER BY type, "order"`;
console.log(`\nҲамагӣ: ${all.length} воҳид`);
for (const r of all) {
  console.log(
    `${r.isPremium ? '🔒 PRO ' : '   free'} · ${r.type.padEnd(9)} · ` +
    `${r.isActive ? 'фаъол' : 'ХОМӮШ'} · ${String(r.title).slice(0, 40)}`,
  );
}
