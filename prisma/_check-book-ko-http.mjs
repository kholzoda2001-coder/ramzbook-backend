import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const rows = await sql.query(
  `SELECT i.id, i.title, i."targetLang", i."mediaUrl",
          (SELECT COUNT(*) FROM "LibraryPage" p WHERE p."itemId" = i.id) AS pages
     FROM "LibraryItem" i WHERE i."targetLang" = 'ko'`);
for (const r of rows) {
  console.log('%s\n  lang=%s  pages=%s\n  media=%s\n',
    r.title, r.targetLang, r.pages, r.mediaUrl ?? '(NEST)');
}
