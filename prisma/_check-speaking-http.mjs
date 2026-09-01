import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);

const cats = await sql.query(
  `SELECT c.id, c."titleTranslated", c.emoji, c."isActive",
          (SELECT COUNT(*) FROM "SpeakingLesson" l WHERE l."categoryId"=c.id) AS lessons,
          (SELECT COUNT(*) FROM "SpeakingItem" i
             JOIN "SpeakingLesson" l2 ON l2.id=i."lessonId" WHERE l2."categoryId"=c.id) AS items
     FROM "SpeakingCategory" c ORDER BY c."order"`);
console.log('BOBHO:');
for (const c of cats) {
  console.log('  %s %s  dars=%s vohid=%s active=%s',
    c.emoji, String(c.titleTranslated).padEnd(24), c.lessons, c.items, c.isActive);
}
const p = await sql.query(`SELECT COUNT(*) n, COUNT(DISTINCT "userId") u FROM "SpeakingProgress"`);
console.log('\nPROGRESSI XONANDAGON: %s satr, %s xonanda', p[0].n, p[0].u);
