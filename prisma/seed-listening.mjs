import { PrismaClient } from '@prisma/client';
import { LISTENINGS } from './listening-data.mjs';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
  });
  if (!course) throw new Error('A1 en→tg course not found');

  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    orderBy: { order: 'asc' },
    include: { lessons: { orderBy: { order: 'asc' } } },
  });

  let created = 0, skipped = 0;

  for (const item of LISTENINGS) {
    const mod = modules.find(m => m.order === item.moduleOrder);
    if (!mod) { console.log(`⚠️ Модул order=${item.moduleOrder} ёфт нашуд`); continue; }

    // idempotency: skip if a listening lesson with this title already exists in the module
    const exists = mod.lessons.find(l => l.title === item.lessonTitle);
    if (exists) { console.log(`↷ гузашт (мавҷуд): M${mod.order} ${item.lessonTitle}`); skipped++; continue; }

    // 1. comprehension exercise (kind=listening) + questions
    const comp = await prisma.comprehensionExercise.create({
      data: {
        courseId: course.id,
        cefrLevel: 'A1',
        kind: 'listening',
        title: item.lessonTitle,
        titleTranslated: item.lessonTitleTg,
        passage: item.passage,
        passageTranslated: item.passageTg,
        emoji: item.compEmoji,
        order: 60,
        questions: {
          create: item.questions.map((q, i) => ({
            question: q.q,
            questionTranslated: q.qTg,
            options: q.options,
            correctIndex: q.correct,
            explanation: q.exp,
            order: i,
          })),
        },
      },
    });

    // 2. placement: insert before the speaking lesson; shift later lessons +1
    const speaking = mod.lessons.find(l => l.skillType === 'speaking');
    const insertOrder = speaking ? speaking.order : mod.lessons.length;
    await prisma.lesson.updateMany({
      where: { moduleId: mod.id, order: { gte: insertOrder } },
      data: { order: { increment: 1 } },
    });

    // 3. the listening lesson
    await prisma.lesson.create({
      data: {
        moduleId: mod.id,
        title: item.lessonTitle,
        titleTranslated: item.lessonTitleTg,
        type: 'quiz',
        skillType: 'listening',
        cefrLevel: 'A1',
        emoji: '🎧',
        xpReward: 20,
        duration: 5,
        order: insertOrder,
        isPremium: false,
        comprehensionId: comp.id,
      },
    });

    console.log(`✅ сохта шуд: M${mod.order} [${insertOrder}] ${item.lessonTitle}  (comp=${comp.id})`);
    created++;
  }

  console.log(`\n=== ХУЛОСА: ${created} сохта, ${skipped} гузашт ===`);
  const totalListening = await prisma.comprehensionExercise.count({ where: { courseId: course.id, kind: 'listening' } });
  console.log(`Ҳоло машқҳои listening дар курс: ${totalListening}`);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
