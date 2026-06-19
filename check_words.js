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
    console.log('Lesson 1 ID:', lesson.id);
    console.log('Lesson 1 words count:', lesson.words.length);
    console.log('Lesson 1 Title:', lesson.title);
    console.log('Words:', lesson.words.map(w => w.word).join(', '));
  } else {
    console.log('Not found');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
