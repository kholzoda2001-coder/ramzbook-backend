// ТАНҲО ХОНИШ: тамоми бахши спикингро ба JSON мерезад (нусхаи эҳтиётӣ).
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const out = {
  takenAt: new Date().toISOString(),
  categories: await sql.query(`SELECT * FROM "SpeakingCategory"`),
  lessons:    await sql.query(`SELECT * FROM "SpeakingLesson"`),
  items:      await sql.query(`SELECT * FROM "SpeakingItem"`),
  progress:   await sql.query(`SELECT * FROM "SpeakingProgress"`),
};
writeFileSync(process.argv[2], JSON.stringify(out, null, 2), 'utf8');
console.log('bob=%d dars=%d vohid=%d progress=%d -> %s',
  out.categories.length, out.lessons.length, out.items.length,
  out.progress.length, process.argv[2]);
