// ─────────────────────────────────────────────────────────────────────────────
// Backfill emoji for A1 English (target=en, native=tg) vocabulary.
// Same safe pattern as backfill-a1-ipa.mjs:
//   • Only fills words whose `emoji` is null/empty — never overwrites.
//   • Touches nothing but the `emoji` field.
//   • Scoped to the A1 en/tg course. DRY_RUN=1 writes nothing.
//
// Single-word items map directly via the emoji lexicon. Sentence items get the
// emoji of their most salient content word (function words / common verbs are
// skipped so we land on the noun, e.g. "I go to school" → 🏫).
//
// Run:  cd backend
//       DRY_RUN=1 node prisma/backfill-a1-emoji.mjs   # preview
//       node prisma/backfill-a1-emoji.mjs             # apply
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
        const line = raw.trim();
        if (!line || line.startsWith('#')) continue;
        const eq = line.indexOf('='); if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        let val = line.slice(eq + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) val = val.slice(1, -1);
        if (!(key in process.env)) process.env[key] = val;
      }
      break;
    } catch { /* next */ }
  }
}
loadDotEnv();

const prisma = new PrismaClient();
const FALLBACK = '💬';
const emoji = JSON.parse(readFileSync(join(__dirname, '..', 'content', 'a1', 'emoji-lexicon.json'), 'utf8')).lexicon;

// Words skipped when scanning a sentence, so we reach the meaningful noun.
const STOP = new Set([
  'i','you','he','she','it','we','they','the','a','an','my','your','his','her','our','their',
  'is','are','am','was','were','be','to','in','on','at','of','for','and','or','with','from','here','there',
  'do','does','did','have','has','had','like','want','need','get','gets','take','takes','wear','wears',
  'feel','feels','can','cannot','could','would','will','go','goes','study','studies','works','work','live','lives',
  'this','that','much','how','not','very','me','up','out','little','one','speak','starts','start','sing','swim','cook',
]);

const isEmpty = (v) => v == null || String(v).trim() === '';
const tokenize = (s) => String(s).replace(/[?.,!]/g, ' ').split(/\s+/).map((t) => t.trim()).filter(Boolean);

function pickEmoji(text) {
  const toks = tokenize(text);
  if (toks.length === 1) {
    return emoji[toks[0].toLowerCase()] ?? FALLBACK; // single word
  }
  // sentence: first salient content word that has an emoji
  for (const t of toks) { const k = t.toLowerCase(); if (!STOP.has(k) && emoji[k]) return emoji[k]; }
  // fallback: any token with an emoji (even if "stop"), else FALLBACK
  for (const t of toks) { const k = t.toLowerCase(); if (emoji[k]) return emoji[k]; }
  return FALLBACK;
}

async function main() {
  const course = await prisma.course.findFirst({
    where: { level: 'A1', targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } },
    include: { modules: { include: { lessons: { include: { words: true } } } } },
  });
  if (!course) throw new Error('A1 en/tg course not found');

  const words = [];
  for (const m of course.modules) for (const l of m.lessons) for (const w of l.words) words.push(w);
  const missing = words.filter((w) => isEmpty(w.emoji));
  console.log(`A1 words total: ${words.length} | missing emoji: ${missing.length}`);

  const planned = missing.map((w) => ({ id: w.id, word: w.word, emoji: pickEmoji(w.word) }));
  const fb = planned.filter((p) => p.emoji === FALLBACK).length;
  console.log(`Planned: ${planned.length} | fallback(${FALLBACK}) used: ${fb}`);
  console.log('Samples:');
  planned.slice(0, 10).forEach((p) => console.log(`   ${p.emoji}  ${p.word}`));
  console.log('Sentence samples:');
  planned.filter((p) => /\s/.test(p.word)).slice(0, 8).forEach((p) => console.log(`   ${p.emoji}  ${p.word}`));

  if (DRY_RUN) { console.log('\nDRY_RUN=1 → nothing written.'); return; }

  let ok = 0, fail = 0;
  for (const p of planned) {
    try { await prisma.word.update({ where: { id: p.id }, data: { emoji: p.emoji } }); ok++; if (ok % 50 === 0) console.log(`  ...${ok}/${planned.length}`); }
    catch (e) { fail++; console.error(`  FAIL ${p.id} (${p.word}): ${e?.message ?? e}`); }
  }
  const after = await prisma.word.count({ where: { lesson: { module: { courseId: course.id } }, OR: [{ emoji: null }, { emoji: '' }] } });
  console.log(`\nDONE. updated=${ok} failed=${fail} | A1 words still missing emoji: ${after}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
