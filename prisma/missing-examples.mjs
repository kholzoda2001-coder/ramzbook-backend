import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  const missing = await prisma.word.findMany({
    where: { 
      lesson: { module: { courseId: course.id } },
      example: null
    }
  });

  console.log("Words missing examples:");
  missing.forEach(w => console.log(w.word));
}

main().finally(() => prisma.$disconnect());
