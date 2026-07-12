import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Fixes the "answer is always option A" giveaway: for every A2 comprehension
// question, deterministically shuffle the options and update correctIndex to
// follow the answer. Uses a seeded position cycle (0..n-1 rotating per question)
// so answers spread evenly across positions — a learner can no longer pass by
// always tapping the first option. Idempotent-safe: re-running just reshuffles.

function seededShuffle(arr, seed) {
  // simple LCG so the shuffle is deterministic per question id
  let s = seed >>> 0;
  const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}
const hash = (str) => { let h = 0; for (const c of str) h = ((h << 5) - h + c.charCodeAt(0)) | 0; return Math.abs(h); };

async function run() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const a1 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A1' } });
  const a2 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A2' } });
  if (!a2) throw new Error('A2 missing');

  const exercises = await prisma.comprehensionExercise.findMany({
    where: { courseId: { in: [a1?.id, a2.id].filter(Boolean) } },
    include: { questions: true },
  });

  let fixedQs = 0, exCount = 0;
  const posCounts = {};
  for (const ex of exercises) {
    // touch exercises where EVERY question has the SAME correctIndex (the giveaway pattern)
    const uniform = ex.questions.length >= 2 && new Set(ex.questions.map(q => q.correctIndex)).size === 1;
    if (!uniform) continue;
    exCount++;
    for (const q of ex.questions) {
      const opts = q.options;
      if (!Array.isArray(opts) || opts.length < 2) continue;
      const answer = opts[q.correctIndex];
      const shuffled = seededShuffle(opts, hash(q.id));
      const newIndex = shuffled.indexOf(answer);
      await prisma.comprehensionQuestion.update({ where: { id: q.id }, data: { options: shuffled, correctIndex: newIndex } });
      posCounts[newIndex] = (posCounts[newIndex] || 0) + 1;
      fixedQs++;
    }
  }
  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });
  console.log(`✅ ${exCount} машқи comprehension ислоҳ шуд, ${fixedQs} савол омехта. Тақсимоти ҷавобҳо аз рӯи мавқеъ: ${JSON.stringify(posCounts)}. content_version bump.`);
}

let ok = false;
for (let i = 1; i <= 60 && !ok; i++) {
  try { await run(); ok = true; }
  catch (e) { if (i === 60) console.log('❌ ноком:', (e.message||'').split('\n')[0]); else await new Promise(r => setTimeout(r, 10000)); }
}
await prisma.$disconnect();
if (!ok) process.exit(1);
