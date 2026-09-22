// `Word.example` + `Word.exampleTrans` аз файлҳои мазмун ба база.
//
// Чаро скрипти ҷудогона: `_tr-module-build.mjs` ин ду майдонро ТАНҲО ҳангоми
// СОХТАНИ калимаи нав мегузорад. Калимае, ки аллакай дар база ҳаст, `existing`
// ҳисоб мешавад ва танҳо кӯчонида мешавад — мисоли нав ба он намерасад.
//
// Мисол барои машқ ҳатмист: бе он муҳаррик `cloze` (ҷои холӣ дар ҷумла) сохта
// наметавонад ва калима танҳо машқи «интихоб» мегирад.
//
//   node prisma/_tr-examples.mjs [--apply]
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
    .filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = neon(env.DATABASE_URL);
const q = (t, p) => (p ? sql.query(t, p) : sql.query(t));
const COURSE = 'cmqdgwx740002c7nfgyzaaj8v';
const APPLY = process.argv.includes('--apply');

// ── Он чи файлҳои мазмун мегӯянд ────────────────────────────────────────────
const want = new Map();   // калима → { example, exampleTrans }
for (let n = 1; n <= 15; n++) {
  let mod;
  try { mod = await import(`./_tr-m${n}-content.mjs`); } catch { continue; }
  for (const l of mod.VOCAB ?? []) {
    for (const w of l.words) {
      if (w.example && w.exampleTrans) want.set(w.word, { ex: w.example, tr: w.exampleTrans });
    }
  }
}
console.log(`дар файлҳои мазмун мисол доранд: ${want.size}`);

const rows = await q(
  `SELECT w.id, w.word, w.example, w."exampleTrans" et, l."skillType" st FROM "Word" w
   JOIN "Lesson" l ON w."lessonId"=l.id JOIN "Module" m ON l."moduleId"=m.id
   WHERE m."courseId"=$1`, [COURSE]);

const plan = [];
for (const r of rows) {
  const w = want.get(r.word);
  if (!w) continue;
  if (r.example === w.ex && r.et === w.tr) continue;
  plan.push({ id: r.id, word: r.word, ex: w.ex, tr: w.tr });
}
const without = rows.filter(r => !r.example || !r.et).length;
console.log(`калимаҳо: ${rows.length} · ҳоло бе мисол: ${without} · навсозӣ лозим: ${plan.length}`);
plan.slice(0, 8).forEach(p => console.log(`  ${p.word.padEnd(20)} ${p.ex}`));

if (!APPLY) { console.log('\n(нақша) --apply'); process.exit(0); }
if (!plan.length) process.exit(0);

for (let i = 0; i < plan.length; i += 100) {
  const chunk = plan.slice(i, i + 100);
  const values = chunk.map((_, k) => `($${k * 3 + 1}, $${k * 3 + 2}, $${k * 3 + 3})`).join(',');
  await q(`UPDATE "Word" t SET example = v.ex, "exampleTrans" = v.tr FROM (VALUES ${values}) AS v(id, ex, tr) WHERE t.id = v.id`,
    chunk.flatMap(p => [p.id, p.ex, p.tr]));
}
await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE "courseId"=$1`, [COURSE]);
await q(`UPDATE "AppSetting" SET "updatedAt" = NOW() WHERE key='content_version'`);
console.log(`✓ ${plan.length} калима мисол гирифт`);
