const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const c = await prisma.course.findFirst({
    where: { level: 'A1', targetLanguage: { code: 'en' } },
    include: { modules: true }
  });
  if (!c) {
    console.log("English A1 Course NOT FOUND!");
  } else {
    console.log(`Found English A1 Course: ${c.title}`);
    console.log(`Modules count: ${c.modules.length}`);
    for (const m of c.modules.slice(0, 5)) {
      console.log(`- ${m.titleTranslated}`);
    }
  }
}

check().catch(console.error).finally(() => prisma.$disconnect());
