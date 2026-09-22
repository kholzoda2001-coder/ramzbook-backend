import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkChinese() {
  const zhCourse = await prisma.course.findFirst({
    where: {
      targetLanguage: { code: { startsWith: 'zh' } }
    },
    include: {
      targetLanguage: true,
      modules: true,
      words: true
    }
  });

  if (!zhCourse) {
    console.log("No Chinese course found in the database.");
    return;
  }

  console.log(`Course Found: ${zhCourse.title} (${zhCourse.targetLanguage.code})`);
  console.log(`Number of modules: ${zhCourse.modules.length}`);
  console.log(`Number of words: ${zhCourse.words.length}`);
  
  if (zhCourse.modules.length > 0) {
    console.log("Modules:");
    zhCourse.modules.forEach(m => console.log(` - ${m.order}: ${m.title}`));
  }
}

checkChinese()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
