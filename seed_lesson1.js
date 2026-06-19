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
    console.log("LESSON ID:", lesson.id);
    
    // We will update the 5 words (A, B, C, D, E) to have ipa and ipaTajik.
    // Wait, let's actually just delete existing words and create real "Lesson 1" words like 
    // Hello, Hi, Good morning, Bye, Please. Or the alphabet words.
    // The user says "Дарси 1 ро аз нав бо хама транскрипсияҳояш илова кун"
    // Let's create an introductory greetings lesson with 5 words.
    
    const newWords = [
      {
        word: 'Hello',
        translation: 'Салом',
        ipa: '/həˈləʊ/',
        ipaTajik: 'Ҳеллоу',
        emoji: '👋',
        example: 'Hello, how are you?',
        exampleTrans: 'Салом, шумо чӣ хел?',
        difficulty: 1,
        order: 0,
      },
      {
        word: 'Hi',
        translation: 'Салом (оддӣ)',
        ipa: '/haɪ/',
        ipaTajik: 'Ҳай',
        emoji: '🙋‍♂️',
        example: 'Hi there!',
        exampleTrans: 'Салом ба ҳама!',
        difficulty: 1,
        order: 1,
      },
      {
        word: 'Good morning',
        translation: 'Субҳ ба хайр',
        ipa: '/ɡʊd ˈmɔːnɪŋ/',
        ipaTajik: 'Гуд монинг',
        emoji: '🌅',
        example: 'Good morning, friend.',
        exampleTrans: 'Субҳ ба хайр, дӯст.',
        difficulty: 1,
        order: 2,
      },
      {
        word: 'Bye',
        translation: 'Хайр',
        ipa: '/baɪ/',
        ipaTajik: 'Бай',
        emoji: '👋',
        example: 'Bye, see you later.',
        exampleTrans: 'Хайр, то дидор.',
        difficulty: 1,
        order: 3,
      },
      {
        word: 'Please',
        translation: 'Лутфан',
        ipa: '/pliːz/',
        ipaTajik: 'Плиз',
        emoji: '🙏',
        example: 'Please, help me.',
        exampleTrans: 'Лутфан, ба ман кумак кун.',
        difficulty: 1,
        order: 4,
      }
    ];

    await prisma.word.deleteMany({ where: { lessonId: lesson.id } });
    
    for (const w of newWords) {
      await prisma.word.create({
        data: {
          lessonId: lesson.id,
          ...w
        }
      });
    }

    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        title: 'Basic Greetings',
        titleTranslated: 'Салом ва Хайрбод'
      }
    });

    console.log("Updated Lesson 1 with 5 new words with IPA and Tajik Transcriptions.");
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
