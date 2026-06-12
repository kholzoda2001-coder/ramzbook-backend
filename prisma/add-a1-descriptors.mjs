// ─────────────────────────────────────────────────────────────────────────────
// Add CEFR A1 "can-do" descriptors for the en->tg pair (Tajik text).
// SAFETY: adds only; idempotent (skips a descriptor whose canDo already exists
// for this pair+level). DRY_RUN=1 writes nothing.
//
// Run:  cd backend
//       DRY_RUN=1 node prisma/add-a1-descriptors.mjs
//       node prisma/add-a1-descriptors.mjs
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
const LEVEL = 'A1';
const list = JSON.parse(readFileSync(join(__dirname, '..', 'content', 'a1', 'cefr-descriptors.json'), 'utf8')).descriptors;

async function main() {
  const [tgt, nat] = await Promise.all([
    prisma.language.findUnique({ where: { code: 'en' }, select: { id: true } }),
    prisma.language.findUnique({ where: { code: 'tg' }, select: { id: true } }),
  ]);
  if (!tgt || !nat) throw new Error('en or tg language not found');

  const existing = await prisma.cefrDescriptor.findMany({
    where: { targetLanguageId: tgt.id, nativeLanguageId: nat.id, cefrLevel: LEVEL },
    select: { canDo: true },
  });
  const have = new Set(existing.map((d) => d.canDo.trim()));
  console.log(`Existing A1 descriptors: ${existing.length}`);

  const toCreate = list.filter((d) => !have.has(d.canDo.trim()));
  console.log(`To create: ${toCreate.length} (skipped existing: ${list.length - toCreate.length})`);
  const bySkill = {};
  for (const d of list) bySkill[d.skill] = (bySkill[d.skill] || 0) + 1;
  console.log('By skill:', JSON.stringify(bySkill));

  if (DRY_RUN) { console.log('\nDRY_RUN=1 → nothing written.'); toCreate.slice(0,3).forEach(d=>console.log('  ['+d.skill+'] '+d.canDo)); return; }

  let ok = 0;
  for (let i = 0; i < toCreate.length; i++) {
    const d = toCreate[i];
    await prisma.cefrDescriptor.create({
      data: {
        targetLanguageId: tgt.id, nativeLanguageId: nat.id,
        cefrLevel: LEVEL, skill: d.skill, canDo: d.canDo.trim(), order: i,
      },
    });
    ok++;
  }
  const total = await prisma.cefrDescriptor.count({ where: { targetLanguageId: tgt.id, nativeLanguageId: nat.id, cefrLevel: LEVEL } });
  console.log(`\nDONE. created=${ok} | A1 descriptors now: ${total}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
