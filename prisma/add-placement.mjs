// ─────────────────────────────────────────────────────────────────────────────
// Add placement-test questions for en->tg (A1..B2). Appends only; idempotent
// (skips a question whose prompt already exists for the pair). Validates that
// the answer is one of the options. DRY_RUN=1 writes nothing.
//
// Run:  cd backend
//       DRY_RUN=1 node prisma/add-placement.mjs
//       node prisma/add-placement.mjs
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
const items = JSON.parse(readFileSync(join(__dirname, '..', 'content', 'placement', 'en-tg.json'), 'utf8')).questions;

async function main() {
  const [tgt, nat] = await Promise.all([
    prisma.language.findUnique({ where: { code: 'en' }, select: { id: true } }),
    prisma.language.findUnique({ where: { code: 'tg' }, select: { id: true } }),
  ]);
  if (!tgt || !nat) throw new Error('en or tg language not found');
  const where = { targetLanguageId: tgt.id, nativeLanguageId: nat.id };

  const existing = await prisma.placementQuestion.findMany({ where, select: { prompt: true, order: true, cefrLevel: true } });
  const havePrompt = new Set(existing.map((q) => q.prompt.trim().toLowerCase()));
  let order = existing.length ? Math.max(...existing.map((q) => q.order)) + 1 : 0;
  console.log(`Existing placement questions: ${existing.length}`);

  // Validate + dedup
  const valid = [];
  const problems = [];
  for (const it of items) {
    const opts = Array.isArray(it.options) ? it.options.map((o) => String(o).trim()).filter(Boolean) : [];
    const ans = String(it.answer ?? '').trim();
    if (havePrompt.has(it.prompt.trim().toLowerCase())) continue; // skip dupe
    if (!it.cefrLevel || !it.prompt || opts.length < 2 || !ans || !opts.includes(ans)) {
      problems.push(it.prompt); continue;
    }
    valid.push({ ...it, options: opts, answer: ans });
  }

  if (problems.length) {
    console.error(`❌ Invalid rows (answer must match an option, ≥2 options):`);
    problems.forEach((p) => console.error('   ' + p));
    console.error('Aborting: no writes.');
    return;
  }

  const byLevel = {};
  for (const q of [...existing, ...valid]) byLevel[q.cefrLevel] = (byLevel[q.cefrLevel] || 0) + 1;
  console.log(`To add: ${valid.length} | projected total: ${existing.length + valid.length}`);
  console.log('Projected per level:', JSON.stringify(byLevel));

  if (DRY_RUN) { console.log('\nDRY_RUN=1 → nothing written.'); return; }

  let ok = 0;
  for (const q of valid) {
    await prisma.placementQuestion.create({
      data: {
        targetLanguageId: tgt.id, nativeLanguageId: nat.id,
        cefrLevel: q.cefrLevel, skill: q.skill || 'grammar',
        prompt: q.prompt.trim(), promptTranslated: q.promptTranslated?.trim() || null,
        options: q.options, answer: q.answer,
        explanation: q.explanation?.trim() || null,
        order: order++, isActive: true,
      },
    });
    ok++;
  }
  const total = await prisma.placementQuestion.count({ where });
  console.log(`\nDONE. created=${ok} | total placement questions: ${total}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
