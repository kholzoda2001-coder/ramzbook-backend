import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const c = await p.course.findFirst({
  where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } }
});

const m = await p.module.findFirst({
  where: { courseId: c.id, order: 1 },
  include: {
    lessons: {
      orderBy: { order: 'asc' },
      select: { id: true, order: true, title: true, dialogueId: true, comprehensionId: true }
    }
  }
});

for (const l of m.lessons) {
  const wc = await p.word.count({ where: { lessonId: l.id } });
  console.log(`Order ${l.order}: ${l.title} | ID: ${l.id} | Words: ${wc} | Dialog: ${l.dialogueId || '-'} | Comp: ${l.comprehensionId || '-'}`);
}

await p.$disconnect();
