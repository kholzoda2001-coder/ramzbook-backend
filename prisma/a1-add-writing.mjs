import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Adds a writing-practice lesson to A1 modules that DON'T already have one
// (preserves the 2 existing hand-made writing lessons). Same review approach as
// A2: 8 words drawn from the module's own vocabulary, no new unique vocab.
// Raises A1 writing coverage toward the CEFR target.

async function run() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const a1 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A1' } });
  if (!a1) throw new Error('A1 course missing');

  const modules = await prisma.module.findMany({ where: { courseId: a1.id }, orderBy: { order: 'asc' } });
  let added = 0, kept = 0;
  for (const mod of modules) {
    const lessons = await prisma.lesson.findMany({ where: { moduleId: mod.id }, orderBy: { order: 'asc' } });
    if (lessons.some(l => l.skillType === 'writing')) { kept++; continue; } // preserve existing

    const vocabLessons = lessons.filter(l => l.skillType === 'vocabulary' || l.type === 'vocab');
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
      type: 'vocab', skillType: 'writing', cefrLevel: 'A1', emoji: '✍️', xpReward: 15, duration: 5,
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
    added++;
    console.log(`  ✅ ${mod.titleTranslated || mod.title}: дарси writing (${pick.length} калима)`);
  }

  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });
  console.log(`✍️ A1 ТАМОМ: ${added} модул writing гирифт, ${kept} аллакай дошт. content_version bump.`);
}

let ok = false;
for (let i = 1; i <= 60 && !ok; i++) {
  try { await run(); ok = true; }
  catch (e) { if (i === 60) { console.log('❌ ноком:', (e.message||'').split('\n')[0]); } else { await new Promise(r => setTimeout(r, 10000)); } }
}
await prisma.$disconnect();
if (!ok) process.exit(1);
