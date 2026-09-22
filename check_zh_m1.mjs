import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkZhMod1() {
  const mod1 = await prisma.module.findFirst({
    where: { 
      course: { targetLanguage: { code: 'zh' } },
      order: 1 // Modul 2 is order 1
    },
    include: {
      lessons: {
        include: {
          words: true,
          grammarTopic: true,
          phraseCollection: true,
          dialogue: true,
          comprehension: true
        }
      }
    }
  });

  if (!mod1) return console.log('Modul 1 not found');

  console.log(`Module: ${mod1.title} (${mod1.titleTranslated})`);
  for (const l of mod1.lessons) {
    console.log(`\nLesson: ${l.title} (Type: ${l.skillType})`);
    if (l.words.length > 0) {
      console.log(` Words: ${l.words.map(w => w.word).join(', ')}`);
    }
    if (l.grammarTopic) {
      console.log(` Grammar: ${l.grammarTopic.title}`);
    }
    if (l.dialogue) {
      console.log(` Dialogue: ${l.dialogue.title}`);
    }
    if (l.comprehension) {
      console.log(` Comprehension: ${l.comprehension.title}`);
    }
  }
}

checkZhMod1().finally(() => prisma.$disconnect());
