import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } }
  });

  const mod = await prisma.module.findFirst({
    where: { courseId: course.id, order: 1 },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true, order: true, title: true, titleTranslated: true,
          skillType: true, type: true,
          grammarTopicId: true, comprehensionId: true, dialogueId: true,
          words: { select: { id: true, word: true, translation: true }, orderBy: { order: 'asc' } }
        }
      }
    }
  });

  const result = { moduleId: mod.id, title: mod.title, lessons: [] };

  for (const lesson of mod.lessons) {
    const info = {
      id: lesson.id,
      order: lesson.order,
      title: lesson.title,
      titleTranslated: lesson.titleTranslated,
      skillType: lesson.skillType,
      wordsCount: lesson.words.length,
      words: lesson.words.map(w => ({ id: w.id, word: w.word, translation: w.translation })),
    };

    if (lesson.grammarTopicId) {
      const gt = await prisma.grammarTopic.findUnique({
        where: { id: lesson.grammarTopicId },
        include: { examples: true, exercises: true, rules: true }
      });
      info.grammar = {
        id: gt.id,
        title: gt.title,
        exCount: gt.examples?.length || 0,
        exerCount: gt.exercises?.length || 0,
        rulesCount: gt.rules?.length || 0
      };
    }

    if (lesson.comprehensionId) {
      const comp = await prisma.comprehensionExercise.findUnique({
        where: { id: lesson.comprehensionId },
        include: { questions: true }
      });
      if (comp) {
        info.comprehension = {
          id: comp.id,
          qCount: comp.questions?.length || 0,
          questions: comp.questions?.map(q => ({
            id: q.id,
            question: q.question,
            questionTranslated: q.questionTranslated
          }))
        };
      }
    }

    result.lessons.push(info);
  }

  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

run();
