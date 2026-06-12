// ─────────────────────────────────────────────────────────────────────────────
// Add new CEFR-A1 vocabulary to the en->tg A1 course.
//
// SAFETY:
//   • Adds only — never deletes or edits existing lessons/words.
//   • Skips any new word whose text already exists anywhere in A1 (no duplicates).
//   • New words go into NEW vocab lessons (≤8 words each), appended after the
//     module's existing lessons. Idempotent: re-running skips everything already
//     inserted.
//   • DRY_RUN=1 prints the plan and writes nothing.
//
// Run:  cd backend
//       DRY_RUN=1 node prisma/add-a1-words.mjs   # preview
//       node prisma/add-a1-words.mjs             # apply
// ─────────────────────────────────────────────────────────────────────────────
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.env.DRY_RUN === '1';
const CHUNK = 8;

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
const data = JSON.parse(readFileSync(join(__dirname, '..', 'content', 'a1', 'new-words.json'), 'utf8')).modules;

async function main() {
  const course = await prisma.course.findFirst({
    where: { level: 'A1', targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } },
    include: { modules: { orderBy: { order: 'asc' }, include: { lessons: { include: { words: true } } } } },
  });
  if (!course) throw new Error('A1 en/tg course not found');

  // Existing word set (lowercased) across the whole A1 course → dedup.
  const existing = new Set();
  let totalWordsBefore = 0;
  for (const m of course.modules) for (const l of m.lessons) for (const w of l.words) { existing.add(w.word.trim().toLowerCase()); totalWordsBefore++; }

  const modByTitle = new Map(course.modules.map((m) => [m.title, m]));

  let plannedWords = 0, plannedLessons = 0, skipped = 0;
  const ops = []; // { module, lessonsToCreate: [ {title, titleTranslated, order, words:[...] } ] }

  for (const [title, words] of Object.entries(data)) {
    const m = modByTitle.get(title);
    if (!m) { console.warn(`⚠️  module not found, skipping: "${title}"`); continue; }

    // dedup within this batch + against existing
    const fresh = [];
    const seen = new Set();
    for (const w of words) {
      const key = w.w.trim().toLowerCase();
      if (existing.has(key) || seen.has(key)) { skipped++; continue; }
      seen.add(key); fresh.push(w);
    }
    if (fresh.length === 0) continue;

    const maxOrd = m.lessons.length ? Math.max(...m.lessons.map((l) => l.order)) : -1;
    const partBase = m.lessons.length; // continue part numbering
    const lessons = [];
    for (let i = 0; i < fresh.length; i += CHUNK) {
      const chunk = fresh.slice(i, i + CHUNK);
      const partNum = partBase + lessons.length + 1;
      lessons.push({
        title: `${m.title} · Part ${partNum}`,
        titleTranslated: `${m.titleTranslated} · Қисми ${partNum}`,
        order: maxOrd + 1 + lessons.length,
        emoji: m.emoji || '📚',
        words: chunk,
      });
    }
    plannedLessons += lessons.length;
    plannedWords += fresh.length;
    ops.push({ module: m, lessons });
  }

  console.log(`A1 words before: ${totalWordsBefore}`);
  console.log(`Planned new words: ${plannedWords} | new lessons: ${plannedLessons} | skipped (dupes): ${skipped}`);
  console.log(`Projected A1 total after: ${totalWordsBefore + plannedWords}`);
  console.log('Per-module plan:');
  for (const op of ops) console.log(`   ${op.module.title.padEnd(30)} +${op.lessons.reduce((a, l) => a + l.words.length, 0)} words in ${op.lessons.length} lesson(s)`);

  if (DRY_RUN) { console.log('\nDRY_RUN=1 → nothing written.'); return; }

  let createdLessons = 0, createdWords = 0;
  for (const op of ops) {
    for (const L of op.lessons) {
      const lesson = await prisma.lesson.create({
        data: {
          moduleId: op.module.id,
          title: L.title, titleTranslated: L.titleTranslated,
          type: 'vocab', skillType: 'vocab', cefrLevel: 'A1',
          emoji: L.emoji, xpReward: 60, duration: 5, order: L.order,
          isPremium: false, isActive: true,
        },
      });
      createdLessons++;
      await prisma.word.createMany({
        data: L.words.map((w, i) => ({
          lessonId: lesson.id,
          word: w.w.trim(),
          translation: w.t.trim(),
          ipa: (w.ipa ?? '').trim() || null,
          emoji: (w.e ?? '').trim() || null,
          example: (w.ex ?? '').trim() || null,
          exampleTrans: (w.exT ?? '').trim() || null,
          difficulty: 1,
          order: i,
        })),
      });
      createdWords += L.words.length;
    }
  }

  const after = await prisma.word.count({ where: { lesson: { module: { courseId: course.id } } } });
  console.log(`\nDONE. created lessons=${createdLessons} words=${createdWords} | A1 total words now: ${after}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
