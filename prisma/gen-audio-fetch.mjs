import { PrismaClient } from '@prisma/client';
import { writeFileSync } from 'fs';

// Step 1 of audio generation: gather every A1+A2 item still missing audio and
// dump it to tmp/audio-items.json. Small & quick when a Neon window is open;
// retries very persistently so it survives long offline stretches. Once the
// json exists, gen-all-audio.mjs does the long TTS work with NO database.

const prisma = new PrismaClient();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function gatherOnce() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const courses = await prisma.course.findMany({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: { in: ['A1', 'A2'] } }, select: { id: true } });
  const cids = courses.map((c) => c.id);
  const items = [];
  (await prisma.word.findMany({ where: { audioUrl: null, lesson: { module: { courseId: { in: cids } } } }, select: { id: true, word: true } }))
    .forEach((w) => items.push({ id: w.id, text: w.word, model: 'word' }));
  (await prisma.grammarExample.findMany({ where: { audioUrl: null, topic: { courseId: { in: cids } } }, select: { id: true, sentence: true } }))
    .forEach((g) => items.push({ id: g.id, text: g.sentence, model: 'grammarExample' }));
  (await prisma.dialogueLine.findMany({ where: { audioUrl: null, dialogue: { courseId: { in: cids } } }, select: { id: true, text: true } }))
    .forEach((d) => items.push({ id: d.id, text: d.text, model: 'dialogueLine' }));
  (await prisma.comprehensionExercise.findMany({ where: { audioUrl: null, courseId: { in: cids } }, select: { id: true, passage: true } }))
    .forEach((c) => items.push({ id: c.id, text: c.passage, model: 'comprehensionExercise' }));
  return items.filter((it) => (it.text || '').trim().length > 0);
}

let items = null;
for (let i = 1; i <= 200 && !items; i++) {
  try { items = await gatherOnce(); }
  catch (e) { if (i % 10 === 0) console.log(`...кӯшиши ${i} (DB интизор)`); await sleep(8000); }
}
await prisma.$disconnect().catch(() => {});
if (!items) { console.log('❌ DB дар ~27 дақиқа дастнорас'); process.exit(1); }
const byModel = items.reduce((a, it) => ((a[it.model] = (a[it.model] || 0) + 1), a), {});
writeFileSync('tmp/audio-items.json', JSON.stringify(items));
console.log(`✅ ${items.length} айтем → tmp/audio-items.json ${JSON.stringify(byModel)}`);
