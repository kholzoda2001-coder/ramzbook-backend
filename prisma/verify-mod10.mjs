import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  const mod10 = await prisma.module.findFirst({
    where: { courseId: course.id, order: 10 }
  });

  const allWordsMod10 = await prisma.word.findMany({
    where: { lesson: { moduleId: mod10.id } }
  });
  
  const uniqueWordsMod10 = new Set(allWordsMod10.map(w => w.word.toLowerCase()));

  // Grammar & Dialogues
  const gt = await prisma.grammarTopic.findMany({ where: { courseId: course.id } });
  const dialogues = await prisma.dialogue.findMany({ where: { courseId: course.id } });
  const comprehensions = await prisma.comprehensionExercise.findMany({ where: { courseId: course.id } });

  // Total course words
  const allWordsCourse = await prisma.word.findMany({
    where: { lesson: { module: { courseId: course.id } } }
  });
  const uniqueWordsCourse = new Set(allWordsCourse.map(w => w.word.toLowerCase()));

  console.log("--- MODULE 10 STATS ---");
  console.log("Module Vocabulary Count:", allWordsMod10.length);
  console.log("Unique Vocabulary in Module:", uniqueWordsMod10.size);
  
  console.log("\n--- COURSE STATS (Modules 1-10) ---");
  console.log("Total Course Vocabulary (Raw):", allWordsCourse.length);
  console.log("Total Course Vocabulary (Unique):", uniqueWordsCourse.size);
  console.log("Total Course Grammar Topics:", gt.length);
  console.log("Total Course Dialogues:", dialogues.length);
  console.log("Total Course Comprehensions:", comprehensions.length);
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
