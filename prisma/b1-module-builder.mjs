import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';

const prisma = new PrismaClient();
export const W = (word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos = 'noun') =>
  ({ word, ipa, ipaTajik, translation, emoji, example, exampleTrans, pos });

const XP = { vocabulary: 15, grammar: 20, listening: 20, speaking: 20, review: 30, test: 50 };

/// Builds ONE full B1 module.
export async function buildModule(M) {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const course = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'B1' } });
  if (!course) throw new Error('B1 course missing');

  // dup-check vs existing
  let existingWords = [];
  try {
    const data = JSON.parse(readFileSync('tmp/existing-words.json', 'utf8'));
    existingWords = data.words || [];
  } catch(e) { /* ignore */ }
  const exSet = new Set(existingWords);
  const seen = new Set(); const dupEx = []; const dupSelf = [];
  for (const ls of M.vocab) for (const w of ls.words) {
    const k = w.word.toLowerCase().trim();
    if (exSet.has(k)) dupEx.push(w.word);
    if (seen.has(k)) dupSelf.push(w.word); seen.add(k);
  }
  if (dupEx.length) console.log(`  ⚠️ M${M.order} такрор бо мавҷуда:`, dupEx.join(', '));
  if (dupSelf.length) console.log(`  ⚠️ M${M.order} такрори дохилӣ:`, dupSelf.join(', '));

  // wipe & recreate module
  let mod = await prisma.module.findFirst({ where: { courseId: course.id, title: M.title } });
  if (mod) {
    const ls = await prisma.lesson.findMany({ where: { moduleId: mod.id }, select: { id: true, grammarTopicId: true, dialogueId: true, comprehensionId: true } });
    for (const l of ls) {
      if (l.grammarTopicId) await prisma.grammarTopic.delete({ where: { id: l.grammarTopicId } }).catch(() => {});
      if (l.dialogueId) await prisma.dialogue.delete({ where: { id: l.dialogueId } }).catch(() => {});
      if (l.comprehensionId) await prisma.comprehensionExercise.delete({ where: { id: l.comprehensionId } }).catch(() => {});
    }
    await prisma.lesson.deleteMany({ where: { moduleId: mod.id } });
    await prisma.module.update({ where: { id: mod.id }, data: { titleTranslated: M.titleTranslated, emoji: M.emoji, color: M.color, order: M.order } });
  } else {
    mod = await prisma.module.create({ data: { courseId: course.id, title: M.title, titleTranslated: M.titleTranslated, emoji: M.emoji, color: M.color, order: M.order, isActive: true } });
  }

  let order = 0, wordsCreated = 0, rank = 5000 + M.order * 100;

  for (const data of M.vocab) {
    const lesson = await prisma.lesson.create({ data: { moduleId: mod.id, title: data.title, titleTranslated: data.tt, type: 'vocab', skillType: 'vocabulary', cefrLevel: 'B1', emoji: data.emoji, xpReward: XP.vocabulary, duration: 5, order: order++ } });
    let wo = 0;
    for (const w of data.words) {
      await prisma.word.create({ data: { lessonId: lesson.id, word: w.word, translation: w.translation, emoji: w.emoji, ipa: w.ipa, ipaTajik: w.ipaTajik, example: w.example, exampleTrans: w.exampleTrans, partOfSpeech: w.pos, frequencyRank: rank++, order: wo++ } });
      wordsCreated++;
    }
  }

  for (const g of M.grammar) {
    const topic = await prisma.grammarTopic.create({ data: { courseId: course.id, cefrLevel: 'B1', title: g.title, titleTranslated: g.titleTranslated, explanation: g.explanation, emoji: g.emoji, order: 100 + M.order * 10 + order } });
    let go = 0; for (const r of g.rules) await prisma.grammarRule.create({ data: { topicId: topic.id, pattern: r.pattern, note: r.note, order: go++ } });
    go = 0; for (const e of g.examples) await prisma.grammarExample.create({ data: { topicId: topic.id, sentence: e.sentence, translation: e.translation, highlight: e.highlight, order: go++ } });
    go = 0; for (const x of g.exercises) await prisma.grammarExercise.create({ data: { topicId: topic.id, type: x.type, prompt: x.prompt, promptTranslated: x.promptTranslated, answer: x.answer, options: x.options ?? undefined, explanation: x.explanation, order: go++ } });
    await prisma.lesson.create({ data: { moduleId: mod.id, title: g.lessonTitle, titleTranslated: g.lessonTitleTg, type: 'grammar', skillType: 'grammar', cefrLevel: 'B1', emoji: g.emoji, xpReward: XP.grammar, duration: 5, order: order++, grammarTopicId: topic.id } });
  }

  const comp = async (data, kind, ord) => {
    const cx = await prisma.comprehensionExercise.create({ data: { courseId: course.id, cefrLevel: 'B1', kind, title: data.title, titleTranslated: data.titleTranslated, passage: data.passage, passageTranslated: data.passageTranslated, emoji: data.emoji, order: ord } });
    let qo = 0; for (const q of data.questions) await prisma.comprehensionQuestion.create({ data: { exerciseId: cx.id, question: q.question, questionTranslated: q.questionTranslated, options: q.options, correctIndex: q.correctIndex, explanation: q.explanation, order: qo++ } });
    return cx;
  };

  const listen = await comp(M.listening, 'listening', 60);
  await prisma.lesson.create({ data: { moduleId: mod.id, title: M.listening.lessonTitle, titleTranslated: M.listening.lessonTitleTg, type: 'quiz', skillType: 'listening', cefrLevel: 'B1', emoji: '🎧', xpReward: XP.listening, duration: 5, order: order++, comprehensionId: listen.id } });

  const dlg = await prisma.dialogue.create({ data: { courseId: course.id, cefrLevel: 'B1', title: M.dialogue.title, titleTranslated: M.dialogue.titleTranslated, scenario: M.dialogue.scenario, emoji: M.dialogue.emoji, order: 60 } });
  let lo = 0; for (const ln of M.dialogue.lines) await prisma.dialogueLine.create({ data: { dialogueId: dlg.id, speaker: ln.speaker, text: ln.text, translation: ln.translation, isUser: ln.isUser, order: lo++ } });
  await prisma.lesson.create({ data: { moduleId: mod.id, title: M.dialogue.lessonTitle, titleTranslated: M.dialogue.lessonTitleTg, type: 'vocab', skillType: 'speaking', cefrLevel: 'B1', emoji: '🗣️', xpReward: XP.speaking, duration: 5, order: order++, dialogueId: dlg.id } });

  const read = await comp(M.reading, 'reading', 61);
  await prisma.lesson.create({ data: { moduleId: mod.id, title: M.reading.lessonTitle, titleTranslated: M.reading.lessonTitleTg, type: 'quiz', skillType: 'reading', cefrLevel: 'B1', emoji: '📖', xpReward: XP.review, duration: 5, order: order++, comprehensionId: read.id } });

  const rev = await comp({ ...M.review, title: 'Module Review', titleTranslated: 'Такрори модул', emoji: '📖' }, 'reading', 62);
  await prisma.lesson.create({ data: { moduleId: mod.id, title: 'Lesson 11: Module Review', titleTranslated: 'Дарси 11: Такрори модул', type: 'quiz', skillType: 'review', cefrLevel: 'B1', emoji: '📖', xpReward: XP.review, duration: 5, order: order++, comprehensionId: rev.id } });

  const exam = await comp({ ...M.exam, title: 'Final Exam', titleTranslated: 'Имтиҳони ниҳоӣ', emoji: '🏆' }, 'reading', 63);
  await prisma.lesson.create({ data: { moduleId: mod.id, title: 'Lesson 12: Final Exam', titleTranslated: 'Дарси 12: Имтиҳони ниҳоӣ', type: 'quiz', skillType: 'test', cefrLevel: 'B1', emoji: '🏆', xpReward: XP.test, duration: 5, order: order++, comprehensionId: exam.id } });

  console.log(`  ✅ M${M.order} "${M.titleTranslated}": ${order} дарс, ${wordsCreated} калима${dupEx.length ? ' ⚠️' : ''}`);
  return { newWords: [...seen] };
}

export async function refreshExisting() {
  const en = await prisma.language.findFirst({ where: { code: 'en' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const a1 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A1' } });
  const a2 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'A2' } });
  const b1 = await prisma.course.findFirst({ where: { targetLanguageId: en.id, nativeLanguageId: tg.id, level: 'B1' } });
  const words = await prisma.word.findMany({ 
    where: { 
      OR: [
        { lesson: { module: { courseId: a1.id } } }, 
        { lesson: { module: { courseId: a2.id } } },
        { lesson: { module: { courseId: b1.id } } }
      ] 
    }, 
    select: { word: true } 
  });
  const set = [...new Set(words.map(w => w.word.toLowerCase().trim()))].sort();
  const { writeFileSync } = await import('fs');
  writeFileSync('tmp/existing-words.json', JSON.stringify({ words: set }));
}

export async function bumpVersion() {
  await prisma.appSetting.update({ where: { key: 'content_version' }, data: { valueJson: '"1"' } });
}
export async function done() { await prisma.$disconnect(); }
