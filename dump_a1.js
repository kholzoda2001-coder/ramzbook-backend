const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const a1 = await prisma.course.findFirst({
    where: { level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { words: { orderBy: { order: 'asc' } } }
          }
        }
      }
    }
  });

  if (!a1) return console.log("A1 not found");
  
  for (const mod of a1.modules) {
    console.log(`\nMODULE: ${mod.title}`);
    for (const lesson of mod.lessons) {
      console.log(`  LESSON: ${lesson.title} (${lesson.words.length} words)`);
      for (const w of lesson.words) {
        console.log(`    - ${w.word} | IPA: ${w.ipa || 'none'} | Tajik: ${w.ipaTajik || 'none'} | Trans: ${w.translation}`);
      }
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
