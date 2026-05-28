const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const emptyLessons = await prisma.lesson.findMany({
    include: { words: true }
  });
  
  for (const lesson of emptyLessons) {
    if (lesson.words.length === 0) {
      console.log('Deleting empty lesson ' + lesson.id + ' and its module ' + lesson.moduleId);
      await prisma.lesson.delete({ where: { id: lesson.id } });
      await prisma.module.delete({ where: { id: lesson.moduleId } });
    }
  }
}

main().then(() => console.log('Done')).catch(console.error);
