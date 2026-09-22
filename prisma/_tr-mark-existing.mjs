// Ҳар калимаи файли мазмун, ки аллакай дар база ҳаст, `existing: true` мегирад.
//
// Чаро лозим аст: `_tr-module-build.mjs` калимаи «нав»-ро, ки аллакай вуҷуд
// дорад, рад мекунад ва бо хато меистад. Файлҳои модул вақте навишта шуда
// буданд, ки калимаҳо ҳанӯз набуданд — барои ҳар билди ТАКРОРӢ ин парчам лозим.
//
//   node prisma/_tr-mark-existing.mjs [--dry]
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const COURSE = 'cmqdgwx740002c7nfgyzaaj8v';
const DRY = process.argv.includes('--dry');

const rows = await sql.query(
  `SELECT DISTINCT w.word FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
   JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}'`);
const have = new Set(rows.map(r => r.word));
console.log(`дар база: ${have.size} калимаи ягона`);

const RE = new RegExp("\\{ word: '([^']*)',", 'g');
for (let n = 1; n <= 15; n++) {
  const p = new URL(`./_tr-m${n}-content.mjs`, import.meta.url);
  let s;
  try { s = readFileSync(p, 'utf8'); } catch { continue; }
  let hits = 0;
  const out = s.replace(RE, (m, w) => {
    if (!have.has(w) || m.includes('existing')) return m;
    hits++;
    return `{ word: '${w}', existing: true,`;
  }).split('existing: true, existing: true,').join('existing: true,');
  if (hits && !DRY) writeFileSync(p, out);
  console.log(`  m${n}: ${hits} калима`);
}
