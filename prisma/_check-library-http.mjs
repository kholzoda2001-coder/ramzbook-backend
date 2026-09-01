// ТАНҲО ХОНИШ: ҳамаи воҳидҳои Китобхона.
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const rows = await sql.query(
  `SELECT id, type, title, author, "targetLang", "isActive", "isPremium", "order"
     FROM "LibraryItem" ORDER BY type, "order", title`);
console.log('jami:', rows.length, '\n');
console.log('type      lang  active  title');
for (const r of rows) {
  console.log('%s %s %s  %s  (%s)',
    String(r.type).padEnd(9),
    String(r.targetLang ?? 'ALL').padEnd(5),
    String(r.isActive).padEnd(6),
    r.title,
    r.id.slice(0, 8));
}
