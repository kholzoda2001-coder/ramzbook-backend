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
            include: { words: true }
          }
        }
      }
    }
  });

  if (a1 && a1.modules[0] && a1.modules[0].lessons[0]) {
    const lesson = a1.modules[0].lessons[0];
    const words = lesson.words.sort((a, b) => a.order - b.order); // Or just slice
    
    // Keep first 5 words, delete the rest
    if (words.length > 5) {
      const toDelete = words.slice(5).map(w => w.id);
      await prisma.word.deleteMany({
        where: { id: { in: toDelete } }
      });
      
      // Update title to reflect
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { title: 'The Alphabet A–E', titleTranslated: 'Алифбои А-Е' }
      });
      console.log(`Deleted ${toDelete.length} words. Lesson 1 now has 5 words.`);
    } else {
      console.log('Lesson already has 5 or less words.');
    }
  } else {
    console.log('Not found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
