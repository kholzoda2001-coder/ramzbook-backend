import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } }
  });

  if (!course) {
    console.log("Course not found");
    return;
  }

  const mod2 = await prisma.module.findFirst({
    where: { courseId: course.id, order: 1 },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          words: { orderBy: { order: 'asc' } },
          grammarTopic: {
            include: {
              examples: { orderBy: { order: 'asc' } },
              rules: { orderBy: { order: 'asc' } },
              exercises: { orderBy: { order: 'asc' } }
            }
          },
          phraseCollection: {
            include: { phrases: { orderBy: { order: 'asc' } } }
          },
          dialogue: {
            include: { lines: { orderBy: { order: 'asc' } } }
          },
          comprehension: {
            include: { questions: { orderBy: { order: 'asc' } } }
          }
        }
      }
    }
  });

  fs.writeFileSync('mod2-review.json', JSON.stringify(mod2, null, 2));
  console.log("Extracted Module 2 to mod2-review.json");
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
