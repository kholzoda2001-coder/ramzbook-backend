import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { _count: { select: { lessons: true } } }
      }
    }
  });

  if (!course) {
    console.log("Course not found");
    return;
  }

  console.log(`Total Modules for English A1 (Tajik native): ${course.modules.length}`);
  console.log("--------------------------------------------------");
  course.modules.forEach(m => {
    console.log(`[Order: ${m.order}] ${m.emoji} ${m.title} | Lessons: ${m._count.lessons} | ID: ${m.id}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
