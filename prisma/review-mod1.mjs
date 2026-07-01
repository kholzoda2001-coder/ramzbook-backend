import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) {
    console.log("Course not found");
    return;
  }

  const mod1 = await prisma.module.findFirst({
    where: { courseId: course.id, order: 1 },
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

  if (!mod1) {
    console.log("Module 1 not found");
    return;
  }

  fs.writeFileSync('mod1-review.json', JSON.stringify(mod1, null, 2));
  console.log("Module 1 exported to mod1-review.json");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
