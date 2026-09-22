import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const courses = await prisma.course.findMany({ include: { targetLanguage: true, modules: true } });
  for (const c of courses) {
    console.log(`${c.targetLanguage.code}: ${c.modules.length} modules`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
