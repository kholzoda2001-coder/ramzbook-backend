import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkChineseModules() {
  const zhCourse = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'zh' } },
    include: { modules: { orderBy: { order: 'asc' } } }
  });

  if (!zhCourse) return console.log('No zh course');
  
  console.log("Chinese Modules:");
  zhCourse.modules.forEach(m => {
    console.log(`- Modul ${m.order + 1}: ${m.title} (${m.titleTranslated})`);
  });
}

checkChineseModules().finally(() => prisma.$disconnect());
