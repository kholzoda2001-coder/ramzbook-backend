import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) {
    console.log("Course not found");
    return;
  }

  // Find all lessons for this course
  const modules = await prisma.module.findMany({
    where: { courseId: course.id },
    include: {
      lessons: true
    }
  });

  const lessonIds = modules.flatMap(m => m.lessons.map(l => l.id));

  // Find all words in these lessons
  const totalWords = await prisma.word.count({
    where: { lessonId: { in: lessonIds } }
  });

  // Find words missing example or exampleTrans
  const missingSentences = await prisma.word.findMany({
    where: {
      lessonId: { in: lessonIds },
      OR: [
        { example: { equals: "" } },
        { example: null },
        { exampleTrans: { equals: "" } },
        { exampleTrans: null }
      ]
    },
    include: {
      lesson: {
        include: {
          module: true
        }
      }
    }
  });

  console.log(`Total words in course: ${totalWords}`);
  console.log(`Words missing sentences: ${missingSentences.length}`);
  
  if (missingSentences.length > 0) {
    console.log("List of words missing sentences:");
    missingSentences.forEach(w => {
      console.log(`- ${w.word} (Module ${w.lesson.module.order}, Lesson ${w.lesson.order})`);
    });
  } else {
    console.log("All words have example sentences and translations!");
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
