import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const CONTENT = process.argv[2];
if (!CONTENT) { console.error('Error: specify content file'); process.exit(1); }
const { MODULE, VOCAB, GRAMMAR, COMPREHENSIONS, DIALOGUE, WRITING, ORDER } = await import(CONTENT);

async function main() {
  const zh = await prisma.language.findFirst({ where: { code: 'zh' } });
  const tg = await prisma.language.findFirst({ where: { code: 'tg' } });
  const course = await prisma.course.findFirst({ where: { targetLanguageId: zh.id, nativeLanguageId: tg.id, level: 'A1' } });

  const old = await prisma.module.findFirst({ where: { courseId: course.id, order: MODULE.order } });
  if (old) {
    const lessons = await prisma.lesson.findMany({ where: { moduleId: old.id } });
    for (const l of lessons) await prisma.userProgress.deleteMany({ where: { lessonId: l.id } });
    await prisma.module.delete({ where: { id: old.id } });
    console.log('Deleted old module and progress.');
  }

  console.log(`Creating Module ${MODULE.order + 1}...`);
  const mod = await prisma.module.create({
    data: {
      courseId: course.id, order: MODULE.order, title: MODULE.title, titleTranslated: MODULE.titleTranslated, emoji: MODULE.emoji, color: '#DC2626'
    }
  });

  const allWords = [];
  
  for (const [i, tag] of ORDER.entries()) {
    const [kind, ref] = tag.split(':');
    if (kind === 'vocab') {
      const v = VOCAB.find(x => x.title === ref);
      const lesson = await prisma.lesson.create({
        data: {
          moduleId: mod.id, order: i, type: 'vocab', skillType: 'vocab', title: v.title, titleTranslated: v.titleTranslated, emoji: v.emoji,
          words: {
            create: v.words.map((w, wi) => ({
              word: w.word, translation: w.translation, emoji: w.emoji, ipa: w.ipa, ipaTajik: w.ipa, order: wi, example: w.example, exampleTrans: w.exampleTrans
            }))
          }
        },
        include: { words: true }
      });
      allWords.push(...lesson.words);
    } else if (kind === 'grammar') {
      const g = GRAMMAR[parseInt(ref)];
      const topic = await prisma.grammarTopic.create({
        data: {
          courseId: course.id, order: MODULE.order * 10 + parseInt(ref), title: g.title, titleTranslated: g.titleTranslated, explanation: g.explanation, emoji: g.emoji,
          rules: { create: g.rules.map((r, ri) => ({ ...r, order: ri })) },
          examples: { create: g.examples.map((e, ei) => ({ ...e, order: ei })) },
          exercises: { create: g.exercises.map((e, ei) => ({ ...e, type: 'choose', order: ei })) }
        }
      });
      await prisma.lesson.create({
        data: { moduleId: mod.id, grammarTopicId: topic.id, order: i, type: 'grammar', skillType: 'grammar', title: g.lessonTitle, titleTranslated: g.lessonTitleTranslated, emoji: g.emoji, xpReward: g.xpReward || 40 }
      });
    } else if (kind === 'comprehension') {
      const c = COMPREHENSIONS.find(x => x.slot === ref);
      const ex = await prisma.comprehensionExercise.create({
        data: {
          courseId: course.id, order: MODULE.order * 10 + (ref === 'reading' ? 1 : 2), title: c.title, titleTranslated: c.titleTranslated, passage: c.passage, passageTranslated: c.passageTranslated, kind: c.kind,
          questions: { create: c.questions.map((q, qi) => ({ ...q, order: qi })) }
        }
      });
      await prisma.lesson.create({
        data: { moduleId: mod.id, comprehensionId: ex.id, order: i, type: c.kind, skillType: c.skillType, title: c.lessonTitle, titleTranslated: c.lessonTitleTranslated, emoji: c.emoji, xpReward: c.xpReward || 40 }
      });
    } else if (kind === 'dialogue') {
      const dlg = await prisma.dialogue.create({
        data: {
          courseId: course.id, order: MODULE.order, title: DIALOGUE.title, titleTranslated: DIALOGUE.titleTranslated, scenario: DIALOGUE.scenario, emoji: DIALOGUE.emoji,
          lines: { create: DIALOGUE.lines.map((l, li) => ({ ...l, order: li })) }
        }
      });
      await prisma.lesson.create({
        data: { moduleId: mod.id, dialogueId: dlg.id, order: i, type: 'dialogue', skillType: 'listening', title: DIALOGUE.lessonTitle, titleTranslated: DIALOGUE.lessonTitleTranslated, emoji: DIALOGUE.emoji, xpReward: 50 }
      });
    } else if (kind === 'writing') {
      await prisma.lesson.create({
        data: {
          moduleId: mod.id, order: i, type: 'vocab', skillType: 'writing', title: WRITING.title, titleTranslated: WRITING.titleTranslated, emoji: WRITING.emoji,
          words: {
            create: WRITING.copyOf.map((wordText, wi) => {
              const src = allWords.find(w => w.word === wordText);
              return { word: src.word, translation: 'COPY', emoji: src.emoji, order: wi };
            })
          }
        }
      });
    }
  }
  
  console.log(`✅ Module 1 Done!`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
