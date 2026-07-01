import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  const mod1 = await prisma.module.findFirst({
    where: { courseId: course.id, order: 0 },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          words: { orderBy: { order: 'asc' } },
          grammarTopic: true,
          dialogue: { include: { lines: { orderBy: { order: 'asc' } } } },
          comprehension: { include: { questions: { orderBy: { order: 'asc' } } } }
        }
      }
    }
  });

  fs.writeFileSync('mod1-actual.json', JSON.stringify(mod1, null, 2));
  console.log("Module 1 (order 0) exported");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
