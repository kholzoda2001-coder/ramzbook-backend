import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  // Find Module 1
  const module1 = await prisma.module.findFirst({
    where: { courseId: course.id, title: "Hello and Basic Communication" },
    include: { lessons: true }
  });

  if (!module1) {
    console.log("Module 1 not found!");
    return;
  }

  const lesson3 = module1.lessons.find(l => l.order === 2);
  const lesson4 = module1.lessons.find(l => l.order === 3);

  // 1. Create Grammar Topic for Lesson 3
  if (lesson3) {
    const grammarTopic1 = await prisma.grammarTopic.create({
      data: {
        courseId: course.id,
        cefrLevel: 'A1',
        title: "Introducing Yourself",
        titleTranslated: "Муаррифии худ",
        explanation: "Барои гуфтани номи худ дар забони англисӣ ду роҳи асосӣ вуҷуд дорад:\n1. Истифодаи 'My name is...'\n2. Истифодаи 'I am...'",
        emoji: "📖",
        order: 1,
        examples: {
          create: [
            { sentence: "My name is Ali.", translation: "Номи ман Алӣ аст.", highlight: "My name is" },
            { sentence: "I am Ali.", translation: "Ман Алӣ ҳастам.", highlight: "I am" }
          ]
        }
      }
    });

    // Link GrammarTopic to Lesson 3
    await prisma.lesson.update({
      where: { id: lesson3.id },
      data: { grammarTopicId: grammarTopic1.id }
    });
    console.log("Grammar Topic 1 added and linked to Lesson 3.");
  }

  // 2. Create Grammar Topic for Lesson 4
  if (lesson4) {
    const grammarTopic2 = await prisma.grammarTopic.create({
      data: {
        courseId: course.id,
        cefrLevel: 'A1',
        title: "Asking Names",
        titleTranslated: "Пурсидани Номи дигарон",
        explanation: "Барои пурсидани номи шахси муқобил дар забони англисӣ аз саволи 'What is your name?' истифода мебарем.",
        emoji: "❓",
        order: 2,
        examples: {
          create: [
            { sentence: "What is your name?", translation: "Номи шумо чист?", highlight: "What is" }
          ]
        }
      }
    });

    // Link GrammarTopic to Lesson 4
    await prisma.lesson.update({
      where: { id: lesson4.id },
      data: { grammarTopicId: grammarTopic2.id }
    });
    console.log("Grammar Topic 2 added and linked to Lesson 4.");
  }

  console.log("Grammar data successfully inserted into Grammar sections and attached to Module 1!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
