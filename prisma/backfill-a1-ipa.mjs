// ─────────────────────────────────────────────────────────────────────────────
// Backfill IPA for A1 English (target=en, native=tg) vocabulary.
//
// WHY a direct Prisma script (not the HTTP admin API): the production DB is a
// shared Hostinger MySQL with a small max-connections budget. Firing hundreds of
// per-row PUTs through Vercel serverless spins up many instances that each grab
// pool connections and exhaust it (P2024 "Timed out fetching a connection").
// One local Node process with ONE PrismaClient updates rows sequentially over a
// single pooled connection — safe and fast.
//
// SAFETY:
//   • Only fills words whose `ipa` is null/empty — never overwrites existing IPA.
//   • Never touches `word`, `translation`, `order`, or any other field.
//   • Scoped strictly to the A1 en/tg course.
//   • DRY_RUN=1 prints what WOULD change and writes nothing.
//
// Run:
//   cd backend
//   DRY_RUN=1 node prisma/backfill-a1-ipa.mjs    # preview
//   node prisma/backfill-a1-ipa.mjs              # apply
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === '1';

// Prisma only auto-loads .env via its CLI; when run with plain `node` we load it
// ourselves (minimal parser — no external dependency).
function loadDotEnv() {
  for (const p of [join(__dirname, '..', '.env'), join(process.cwd(), '.env')]) {
    try {
      const txt = readFileSync(p, 'utf8');
      for (const raw of txt.split(/\r?\n/)) {
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!(key in process.env)) process.env[key] = val;
      }
      break;
    } catch { /* try next path */ }
  }
}
loadDotEnv();

const prisma = new PrismaClient();

// ── Load the General-American IPA lexicon (word-token → IPA, no slashes) ──
const lexPath = join(__dirname, '..', 'content', 'a1', 'ipa-lexicon.json');
const lexicon = JSON.parse(readFileSync(lexPath, 'utf8')).lexicon;

/** Compose an IPA transcription for a word OR a multi-word phrase/sentence by
 *  joining per-token transcriptions. Returns { ipa, unmapped[] }. */
function composeIpa(text) {
  const cleaned = String(text).replace(/[?.,!]/g, ' ');
  const tokens = cleaned.split(/\s+/).map((t) => t.trim()).filter((t) => t && t !== '...' && t !== '-');
  const parts = [];
  const unmapped = [];
  for (const tok of tokens) {
    const key = tok.toLowerCase();
    const val = lexicon[key];
    if (val == null) unmapped.push(key);
    else parts.push(val);
  }
  return { ipa: `/${parts.join(' ')}/`, unmapped };
}

const isEmpty = (v) => v == null || String(v).trim() === '';

async function main() {
  // Resolve the A1 en/tg course.
  const course = await prisma.course.findFirst({
    where: { level: 'A1', targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } },
    include: { modules: { include: { lessons: { include: { words: true } } } } },
  });
  if (!course) throw new Error('A1 en/tg course not found');

  // Flatten all words under A1.
  const words = [];
  for (const m of course.modules) for (const l of m.lessons) for (const w of l.words) words.push(w);

  const missing = words.filter((w) => isEmpty(w.ipa));
  console.log(`A1 words total: ${words.length} | missing IPA: ${missing.length}`);

  // Compose + validate first (fail fast if the lexicon has a gap).
  const planned = [];
  const unmappedSet = new Set();
  for (const w of missing) {
    const { ipa, unmapped } = composeIpa(w.word);
    unmapped.forEach((u) => unmappedSet.add(u));
    if (unmapped.length === 0 && ipa !== '//') planned.push({ id: w.id, word: w.word, ipa });
  }

  if (unmappedSet.size > 0) {
    console.error(`\n❌ UNMAPPED TOKENS (${unmappedSet.size}) — add these to the lexicon and re-run:`);
    console.error('   ' + [...unmappedSet].sort().join(', '));
    console.error('Aborting: no partial writes.');
    return;
  }

  console.log(`Composed OK for ${planned.length} words. 0 unmapped tokens.`);
  console.log('Samples:');
  planned.slice(0, 8).forEach((p) => console.log(`   ${p.word.padEnd(34)} ${p.ipa}`));

  if (DRY_RUN) {
    console.log('\nDRY_RUN=1 → nothing written.');
    return;
  }

  // Apply sequentially (single pooled connection — gentle on shared MySQL).
  let ok = 0, fail = 0;
  for (const p of planned) {
    try {
      await prisma.word.update({ where: { id: p.id }, data: { ipa: p.ipa } });
      ok++;
      if (ok % 50 === 0) console.log(`  ...${ok}/${planned.length}`);
    } catch (e) {
      fail++;
      console.error(`  FAIL ${p.id} (${p.word}): ${e?.message ?? e}`);
    }
  }

  // Verify.
  const after = await prisma.word.count({
    where: {
      lesson: { module: { courseId: course.id } },
      OR: [{ ipa: null }, { ipa: '' }],
    },
  });
  console.log(`\nDONE. updated=${ok} failed=${fail} | A1 words still missing IPA: ${after}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
