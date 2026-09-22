import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function resetZh() {
  const zhCourse = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'zh' } }
  });

  if (!zhCourse) return console.log('No zh course');

  const deleted = await prisma.module.deleteMany({
    where: { courseId: zhCourse.id }
  });
  console.log(`Deleted ${deleted.count} modules from the zh course.`);
}

resetZh().finally(() => prisma.$disconnect());
