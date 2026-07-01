import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  const moduleCount = await prisma.module.count({ where: { courseId: course.id } });
  
  const lessonCount = await prisma.lesson.count({
    where: { module: { courseId: course.id } }
  });
  
  const wordCount = await prisma.word.count({
    where: { lesson: { module: { courseId: course.id } } }
  });
  
  const wordsWithExamples = await prisma.word.count({
    where: { 
      lesson: { module: { courseId: course.id } },
      example: { not: null }
    }
  });

  const grammarCount = await prisma.grammarTopic.count({ where: { courseId: course.id } });
  
  const dialogueCount = await prisma.dialogue.count({ where: { courseId: course.id } });

  console.log(`Modules: ${moduleCount}`);
  console.log(`Lessons: ${lessonCount}`);
  console.log(`Words: ${wordCount}`);
  console.log(`Words with Examples: ${wordsWithExamples}`);
  console.log(`Grammar Topics: ${grammarCount}`);
  console.log(`Dialogues: ${dialogueCount}`);
}

main().finally(() => prisma.$disconnect());
