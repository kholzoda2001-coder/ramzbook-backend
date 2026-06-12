// ─────────────────────────────────────────────────────────────────────────────
// Backfill example sentences (English + Tajik) for A1 en->tg words that have none.
// Same safe pattern: only fills empty `example`/`exampleTrans`, touches nothing
// else, scoped to A1 en/tg. DRY_RUN=1 writes nothing and reports unmapped words.
//
// Run:  cd backend
//       DRY_RUN=1 node prisma/backfill-a1-examples.mjs
//       node prisma/backfill-a1-examples.mjs
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === '1';

function loadDotEnv() {
  for (const p of [join(__dirname, '..', '.env'), join(process.cwd(), '.env')]) {
    try {
      for (const raw of readFileSync(p, 'utf8').split(/\r?\n/)) {
        const line = raw.trim(); if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('='); if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        if (!(key in process.env)) process.env[key] = val;
      } break;
    } catch { /* next */ }
  }
}
loadDotEnv();

const prisma = new PrismaClient();
const examples = JSON.parse(readFileSync(join(__dirname, '..', 'content', 'a1', 'example-lexicon.json'), 'utf8')).examples;
const isEmpty = (v) => v == null || String(v).trim() === '';
const norm = (s) => String(s).trim().toLowerCase().replace(/[?.,!]+$/, '');

async function main() {
  const course = await prisma.course.findFirst({
    where: { level: 'A1', targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } },
    include: { modules: { include: { lessons: { include: { words: true } } } } },
  });
  if (!course) throw new Error('A1 en/tg course not found');

  const words = [];
  for (const m of course.modules) for (const l of m.lessons) for (const w of l.words) words.push(w);
  const missing = words.filter((w) => isEmpty(w.example));
  console.log(`A1 words: ${words.length} | missing example: ${missing.length}`);

  const planned = [];
  const unmapped = new Set();
  for (const w of missing) {
    const ex = examples[norm(w.word)];
    if (!ex) { unmapped.add(w.word); continue; }
    planned.push({ id: w.id, word: w.word, ex: ex.ex, exT: ex.exT });
  }

  if (unmapped.size > 0) {
    console.error(`\n❌ UNMAPPED (${unmapped.size}) — add to example-lexicon.json and re-run:`);
    console.error('   ' + [...unmapped].sort().join(' | '));
    console.error('Aborting: no partial writes.');
    return;
  }

  console.log(`Composed examples for ${planned.length} rows. 0 unmapped.`);
  planned.slice(0, 8).forEach((p) => console.log(`   ${p.word.padEnd(14)} → ${p.ex}  |  ${p.exT}`));

  if (DRY_RUN) { console.log('\nDRY_RUN=1 → nothing written.'); return; }

  let ok = 0, fail = 0;
  for (const p of planned) {
    try { await prisma.word.update({ where: { id: p.id }, data: { example: p.ex, exampleTrans: p.exT } }); ok++; if (ok % 50 === 0) console.log(`  ...${ok}/${planned.length}`); }
    catch (e) { fail++; console.error(`  FAIL ${p.id} (${p.word}): ${e?.message ?? e}`); }
  }
  const after = await prisma.word.count({ where: { lesson: { module: { courseId: course.id } }, OR: [{ example: null }, { example: '' }] } });
  console.log(`\nDONE. updated=${ok} failed=${fail} | A1 words still missing example: ${after}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
