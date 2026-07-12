import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Adds ONE writing-practice lesson to every A2 module (idempotent). The learner
// types + handwrites 8 key words drawn from that module's own vocabulary — pure
// review, so no NEW unique vocabulary is introduced. Fills the CEFR "writing"
// skill gap (A2 had 0). Frontend renders skillType 'writing' via
// WritingPracticeScreen using the lesson's own `words`.

async function run() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const a2 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A2' } });
  if (!a2) throw new Error('A2 course missing');

  const modules = await prisma.module.findMany({ where: { courseId: a2.id }, orderBy: { order: 'asc' } });
  let done = 0;
  for (const mod of modules) {
    const lessons = await prisma.lesson.findMany({ where: { moduleId: mod.id }, orderBy: { order: 'asc' } });

    // idempotent: remove any existing writing lesson + its words
    for (const l of lessons.filter(l => l.skillType === 'writing')) {
      await prisma.word.deleteMany({ where: { lessonId: l.id } });
      await prisma.lesson.delete({ where: { id: l.id } });
    }

    // gather this module's vocabulary words (from vocab lessons), spread-pick 8
    const vocabLessons = lessons.filter(l => l.skillType === 'vocabulary');
    const allWords = [];
    for (const vl of vocabLessons) {
      const ws = await prisma.word.findMany({ where: { lessonId: vl.id }, orderBy: { order: 'asc' } });
      allWords.push(...ws);
    }
    if (allWords.length === 0) { console.log(`  ⚠️ ${mod.title}: калима нест, гузашт`); continue; }
    const pick = [];
    const step = Math.max(1, Math.floor(allWords.length / 8));
    for (let i = 0; i < allWords.length && pick.length < 8; i += step) pick.push(allWords[i]);
    while (pick.length < 8 && pick.length < allWords.length) pick.push(allWords[pick.length]);

    const maxOrder = lessons.reduce((m, l) => Math.max(m, l.order), -1);
    const wl = await prisma.lesson.create({ data: {
      moduleId: mod.id, title: 'Writing Practice', titleTranslated: 'Машқи навиштан',
      type: 'vocab', skillType: 'writing', cefrLevel: 'A2', emoji: '✍️', xpReward: 20, duration: 5,
      order: maxOrder + 1,
    }});
    let wo = 0;
    for (const w of pick) {
      await prisma.word.create({ data: {
        lessonId: wl.id, word: w.word, translation: w.translation, emoji: w.emoji,
        ipa: w.ipa, ipaTajik: w.ipaTajik, example: w.example, exampleTrans: w.exampleTrans,
        partOfSpeech: w.partOfSpeech, frequencyRank: w.frequencyRank, order: wo++,
      }});
    }
    done++;
    console.log(`  ✅ ${mod.titleTranslated}: дарси writing (${pick.length} калима)`);
  }

  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });
  console.log(`✍️ ТАМОМ: ${done} модул writing гирифт, content_version bump шуд.`);
}

let ok = false;
for (let i = 1; i <= 60 && !ok; i++) {
  try { await run(); ok = true; }
  catch (e) { if (i === 60) { console.log('❌ ноком:', (e.message||'').split('\n')[0]); } else { await new Promise(r => setTimeout(r, 10000)); } }
}
await prisma.$disconnect();
if (!ok) process.exit(1);
