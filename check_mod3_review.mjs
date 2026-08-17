import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' }, include: { words: true } } }
      }
    }
  });
  const mod3 = course.modules[2];
  console.log('MODULE 3:', mod3.title, mod3.titleTranslated, mod3.id);
  for (const l of mod3.lessons) {
    console.log(`\nLesson order ${l.order}: ${l.title} / ${l.titleTranslated} (type=${l.type}, skillType=${l.skillType}, comprehensionId=${l.comprehensionId})`);
    for (const w of l.words) {
      console.log(`  - ${w.word} = ${w.translation}`);
    }
  }
  const reviewLesson = mod3.lessons.find(l => l.skillType === 'review');
  if (reviewLesson && reviewLesson.comprehensionId) {
    const comp = await prisma.comprehensionExercise.findUnique({
      where: { id: reviewLesson.comprehensionId },
      include: { questions: { orderBy: { order: 'asc' } } }
    });
    console.log('\nREVIEW COMPREHENSION:', comp.id, comp.title);
    console.log('Passage:', comp.passageTranslated);
    for (const q of comp.questions) {
      console.log('Q:', q.question, '| options:', q.options, '| correct:', q.correctIndex);
    }
  }
}
main().catch(e=>console.error(e)).finally(()=>prisma.$disconnect());
