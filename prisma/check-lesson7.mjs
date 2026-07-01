import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { words: true }
          }
        }
      }
    }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  const mod1 = course.modules[0]; // Module 1: Hello and Basic Communication
  console.log(`Module 1: ${mod1.title}`);
  const lesson7 = mod1.lessons[6]; // Order 6 is Lesson 7 (0-indexed)
  console.log(`Lesson 7 Title: ${lesson7.title}`);
  console.log(`Lesson 7 Words Count: ${lesson7.words.length}`);
  console.log(lesson7.words.map(w => w.word));
  
  const lesson8 = mod1.lessons[7]; // Order 7 is Lesson 8
  if (lesson8) {
    console.log(`Lesson 8 Title: ${lesson8.title}`);
    console.log(`Lesson 8 Words Count: ${lesson8.words.length}`);
  }
}

main().finally(() => prisma.$disconnect());
