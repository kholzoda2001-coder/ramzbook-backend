import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getStats() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });
  if (!course) return console.log('Course not found');

  const modulesCount = await prisma.module.count({ where: { courseId: course.id } });
  const lessonsCount = await prisma.lesson.count({ where: { module: { courseId: course.id } } });
  const words = await prisma.word.findMany({ where: { lesson: { module: { courseId: course.id } } } });
  const uniqueWords = new Set(words.map(w => w.word.toLowerCase().trim())).size;
  const grammarCount = await prisma.grammarTopic.count({ where: { courseId: course.id } });
  const dialogueCount = await prisma.dialogue.count({ where: { courseId: course.id } });

  console.log(`Modules: ${modulesCount}`);
  console.log(`Lessons: ${lessonsCount}`);
  console.log(`Total Words: ${words.length}`);
  console.log(`Unique Words: ${uniqueWords}`);
  console.log(`Grammar: ${grammarCount}`);
  console.log(`Dialogues: ${dialogueCount}`);
}

getStats().catch(e => console.error(e)).finally(() => prisma.$disconnect());
