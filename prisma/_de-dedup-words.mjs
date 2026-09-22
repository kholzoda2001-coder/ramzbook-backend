// Калимаҳои АЙНАН такрорӣ дар ЯК дарс — як сатр мемонад, боқӣ ҳазф мешавад.
//
// Чаро ин марговар аст: бозии «ҷуфт кардан» ду тарҷумаи якхеларо қабул карда
// наметавонад — хонанда дуруст мезанад, барнома «ғалат» мегӯяд ва дарс қулф
// мешавад (ниг. хотираи ramz-translation-collision).
//
//   node prisma/_de-dedup-words.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const COURSE = 'cmqdhwb5q00021z597df2767m';
const APPLY = process.argv.includes('--apply');

const ws = await q(
  `SELECT w.id, w.word, w.translation, w."audioUrl", w."order", w."lessonId",
          l.title AS lesson, m."order" AS mo
   FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"=$1 ORDER BY m."order", l."order", w."order"`, [COURSE]);

const groups = new Map();
for (const w of ws) {
  const k = `${w.lessonId}|${w.word}`;
  if (!groups.has(k)) groups.set(k, []);
  groups.get(k).push(w);
}

const doomed = [];
for (const list of groups.values()) {
  if (list.length < 2) continue;
  // Мемонад: сатри аудиодор бо хурдтарин `order` — он дар дарс аввал меистад.
  const keep = list.filter(w => w.audioUrl).sort((a, b) => a.order - b.order)[0] ?? list[0];
  for (const w of list) if (w.id !== keep.id) doomed.push(w);
}

console.log(`калимаҳо: ${ws.length} · такрорӣ: ${doomed.length}`);
for (const d of doomed) console.log(`  M${d.mo} «${d.lesson}»: ${d.word} (order ${d.order})`);

if (!doomed.length) { console.log('✓ такрор нест'); process.exit(0); }

const [srs] = await q(`SELECT count(*)::int n FROM "SrsCard" WHERE "itemId" = ANY($1)`, [doomed.map(d => d.id)]);
console.log(`карти SRS, ки ба инҳо вобастаанд: ${srs.n}`);

if (!APPLY) { console.log('\n(нақша) --apply барои ҳазф'); process.exit(0); }

await q(`DELETE FROM "SrsCard" WHERE "itemId" = ANY($1)`, [doomed.map(d => d.id)]);
await q(`DELETE FROM "Word" WHERE id = ANY($1)`, [doomed.map(d => d.id)]);
await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`✓ ${doomed.length} калимаи такрорӣ ҳазф шуд`);
