const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAlphabet() {
  const course = await prisma.course.findFirst({
    where: { level: 'A1' },
    include: { modules: true }
  });

  if (!course) {
    console.log("Course A1 not found");
    return;
  }

  for (const mod of course.modules) {
    if (mod.title.toLowerCase().includes('alphabet') || mod.titleTranslated.includes('Алифбо')) {
      console.log(`Deleting module: ${mod.title} (${mod.titleTranslated})`);
      
      const lessons = await prisma.lesson.findMany({ where: { moduleId: mod.id } });
      for (const lesson of lessons) {
        // Delete words associated with the lesson
        const words = await prisma.word.findMany({ where: { lessonId: lesson.id } });
        for (const w of words) {
          // Delete user word progress (SrsCard)
          await prisma.srsCard.deleteMany({ where: { itemId: w.id } });
          await prisma.word.delete({ where: { id: w.id } });
        }
        // Delete user lesson progress
        await prisma.userProgress.deleteMany({ where: { lessonId: lesson.id } });
        await prisma.lesson.delete({ where: { id: lesson.id } });
      }
      
      await prisma.module.delete({ where: { id: mod.id } });
    }
  }

  console.log("Alphabet modules deleted successfully.");
}

deleteAlphabet()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
