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
            include: {
              words: true
            }
          }
        }
      }
    }
  });

  if (!course) {
    console.log("A1 Course not found!");
    return;
  }

  console.log(`\n=== КУРСИ А1: ${course.title} ===`);
  console.log(`Шумораи умумии модулҳо: ${course.modules.length}\n`);

  for (const mod of course.modules) {
    console.log(`Модули ${mod.order}: ${mod.emoji} ${mod.titleTranslated} (${mod.title}) - ${mod.lessons.length} дарс`);
    for (const les of mod.lessons) {
      console.log(`  └─ Дарси ${les.order}: ${les.emoji} ${les.titleTranslated} - ${les.words.length} калима`);
    }
    console.log("");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
