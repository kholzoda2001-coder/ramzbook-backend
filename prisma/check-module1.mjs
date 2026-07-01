import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  const module1 = await prisma.module.findFirst({
    where: { courseId: course.id, order: 0 },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          words: true,
          grammarTopic: {
            include: { examples: true }
          }
        }
      }
    }
  });

  if (!module1) {
    console.log("Module 1 not found.");
    return;
  }

  console.log(`\n=== МОДУЛИ 1: ${module1.emoji} ${module1.titleTranslated} (${module1.title}) ===\n`);

  for (const les of module1.lessons) {
    console.log(`Дарси ${les.order + 1}: ${les.emoji} ${les.titleTranslated}`);
    
    // Words
    if (les.words.length > 0) {
      console.log(`  Калимаҳо (${les.words.length}):`);
      for (const w of les.words) {
        console.log(`    - ${w.emoji} ${w.word} [${w.ipa}] (${w.ipaTajik}) - ${w.translation}`);
      }
    } else {
      console.log(`  Калимаҳои нав: 0`);
    }

    // Grammar
    if (les.grammarTopic) {
      console.log(`  Грамматика: ${les.grammarTopic.emoji} ${les.grammarTopic.titleTranslated}`);
      for (const ex of les.grammarTopic.examples) {
        console.log(`    Мисол: ${ex.sentence} -> ${ex.translation}`);
      }
    }

    console.log("");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
