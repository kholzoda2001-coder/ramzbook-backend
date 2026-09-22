// Калимаи «кӯҳна»-и дарс: дар база ҳаст, вале дар файли мазмун дигар нест.
//
// `_de-module-build.mjs` танҳо илова ва кӯчонида метавонад — вай ҳеҷ гоҳ
// калимаро аз дарс намебарорад. Пас вақте калимае аз файли мазмун бароварда
// мешавад (мас. ба модули дигар мегузарад), сатри кӯҳна дар дарси аввал
// мемонад ва хонанда онро ду бор мебинад.
//
//   node prisma/_de-prune-stale.mjs [--apply]
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

// ── Он чи файлҳои мазмун мегӯянд ────────────────────────────────────────────
const want = new Map();      // «M<order>|<сарлавҳаи дарс>» → Set(калима)
for (let n = 1; n <= 15; n++) {
  let mod;
  try { mod = await import(`./_de-m${n}-content.mjs`); } catch { continue; }
  for (const l of mod.VOCAB ?? []) {
    want.set(`M${mod.MODULE.order}|${l.title}`, new Set(l.words.map(w => w.word)));
  }
  const wr = mod.WRITING;
  if (wr) want.set(`M${mod.MODULE.order}|${wr.title ?? wr.lessonTitle}`, new Set(wr.copyOf));
}

// ── Он чи дар база аст ──────────────────────────────────────────────────────
const rows = await q(
  `SELECT w.id, w.word, m."order" mo, l.title, l."skillType" st
   FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"=$1 AND l."skillType" IN ('vocab','writing')
   ORDER BY m."order", l."order", w."order"`, [COURSE]);

const stale = [];
for (const r of rows) {
  const set = want.get(`M${r.mo}|${r.title}`);
  if (!set) continue;                 // дарсе, ки файли мазмун надорад — даст намерасем
  if (!set.has(r.word)) stale.push(r);
}

console.log(`калимаҳо дар дарсҳои луғат/навиштан: ${rows.length} · кӯҳна: ${stale.length}`);
for (const s of stale) console.log(`  M${s.mo} [${s.st}] «${s.title}»: ${s.word}`);
if (!stale.length) { console.log('✓ калимаи кӯҳна нест'); process.exit(0); }
if (!APPLY) { console.log('\n(нақша) --apply барои ҳазф'); process.exit(0); }

await q(`DELETE FROM "SrsCard" WHERE "itemId" = ANY($1)`, [stale.map(s => s.id)]);
await q(`DELETE FROM "Word" WHERE id = ANY($1)`, [stale.map(s => s.id)]);
await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`✓ ${stale.length} калимаи кӯҳна ҳазф шуд`);
