import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: {
      targetLanguage: { code: 'en' },
      nativeLanguage: { code: 'tg' },
      level: 'A1'
    }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  // Delete the old Module 1 (order: 0)
  const oldModule1 = await prisma.module.findFirst({
    where: { courseId: course.id, order: 0 }
  });

  if (oldModule1) {
    await prisma.module.delete({ where: { id: oldModule1.id } });
    console.log(`Deleted old Module 1: ${oldModule1.title}`);
  }

  // Shift other modules order if needed, but we'll just insert this as order: 0
  
  const moduleData = {
    title: "Hello and Basic Communication",
    titleTranslated: "Салом ва Муоширати Ибтидоӣ",
    emoji: "👋",
    color: "#10B981", // Emerald
    order: 0,
    lessons: [
      {
        title: "Lesson 1: Greetings",
        titleTranslated: "Дарси 1: Салом ва Хайрбод",
        emoji: "🤝",
        xpReward: 60,
        words: [
          { word: "Hello", translation: "Салом", ipa: "Ҳеллоу", example: "Hello! I am here.", exampleTrans: "Салом! Ман ин ҷо ҳастам." },
          { word: "Hi", translation: "Салом (кӯтоҳ)", ipa: "Ҳай", example: "Hi! Yes, I am here.", exampleTrans: "Салом! Бале, ман ин ҷо ҳастам." },
          { word: "Goodbye", translation: "Хайр", ipa: "Гудбай", example: "Goodbye! No, I go.", exampleTrans: "Хайр! Не, ман меравам." },
          { word: "Bye", translation: "Хайр (кӯтоҳ)", ipa: "Бай", example: "Bye! See you.", exampleTrans: "Хайр! То дидор." },
          { word: "Yes", translation: "Бале", ipa: "Йес", example: "Yes, hello!", exampleTrans: "Бале, салом!" },
          { word: "No", translation: "Не", ipa: "Ноу", example: "No, goodbye.", exampleTrans: "Не, хайр." }
        ]
      },
      {
        title: "Lesson 2: Being Polite",
        titleTranslated: "Дарси 2: Муомилаи Хуб",
        emoji: "🙏",
        xpReward: 60,
        words: [
          { word: "Please", translation: "Лутфан / Илтимос", ipa: "Плиз", example: "Yes, please.", exampleTrans: "Бале, илтимос." },
          { word: "Thank you", translation: "Ташаккур", ipa: "Сенк ю", example: "Thank you! Goodbye.", exampleTrans: "Ташаккур! Хайр." },
          { word: "Sorry", translation: "Бубахшед", ipa: "Сорри", example: "Sorry, no.", exampleTrans: "Бубахшед, не." },
          { word: "You're welcome", translation: "Меарзад / Саломат бошед", ipa: "Юр велкам", example: "You're welcome! Hi!", exampleTrans: "Меарзад! Салом!" },
          { word: "OK", translation: "Хуб / Майлаш", ipa: "Окей", example: "OK, yes, thank you.", exampleTrans: "Хуб, бале, ташаккур." }
        ]
      },
      {
        title: "Lesson 3: Introduction",
        titleTranslated: "Дарси 3: Муаррифӣ",
        emoji: "🙋‍♂️",
        xpReward: 60,
        words: [
          { word: "I", translation: "Ман", ipa: "Ай", example: "I say hello.", exampleTrans: "Ман салом мегӯям." },
          { word: "You", translation: "Шумо / Ту", ipa: "Ю", example: "You say please.", exampleTrans: "Шумо лутфан мегӯед." },
          { word: "My", translation: "Ман (аз они ман)", ipa: "Май", example: "My name.", exampleTrans: "Номи ман." },
          { word: "Name", translation: "Ном", ipa: "Нейм", example: "My name.", exampleTrans: "Номи ман." },
          { word: "Is", translation: "Аст", ipa: "Из", example: "My name is...", exampleTrans: "Номи ман ... аст." }
        ]
      },
      {
        title: "Lesson 4: Asking Names",
        titleTranslated: "Дарси 4: Пурсидани Ном",
        emoji: "❓",
        xpReward: 65,
        words: [
          { word: "What", translation: "Чӣ", ipa: "Уот", example: "What is my name?", exampleTrans: "Номи ман чист?" },
          { word: "Your", translation: "Шумо (аз они шумо)", ipa: "Йор", example: "Your name.", exampleTrans: "Номи шумо." },
          { word: "Name", translation: "Ном", ipa: "Нейм", example: "What is your name?", exampleTrans: "Номи шумо чист?" }
        ]
      },
      {
        title: "Lesson 5: People",
        titleTranslated: "Дарси 5: Одамон",
        emoji: "👥",
        xpReward: 65,
        words: [
          { word: "Man", translation: "Мард", ipa: "Мэн", example: "Hello, man.", exampleTrans: "Салом, мард." },
          { word: "Woman", translation: "Зан", ipa: "Вумен", example: "Yes, you are a woman.", exampleTrans: "Бале, шумо зан ҳастед." },
          { word: "Boy", translation: "Писар", ipa: "Бой", example: "Hi, boy.", exampleTrans: "Салом, писар." },
          { word: "Girl", translation: "Духтар", ipa: "Гёрл", example: "My name is girl.", exampleTrans: "Номи ман духтар аст." },
          { word: "Friend", translation: "Дӯст", ipa: "Френд", example: "You are my friend.", exampleTrans: "Ту дӯсти ман ҳастӣ." }
        ]
      },
      {
        title: "Lesson 6: Times of Day",
        titleTranslated: "Дарси 6: Вақтҳои Рӯз",
        emoji: "🌅",
        xpReward: 65,
        words: [
          { word: "Good morning", translation: "Субҳ ба хайр", ipa: "Гуд морнинг", example: "Good morning, friend.", exampleTrans: "Субҳ ба хайр, дӯстам." },
          { word: "Good afternoon", translation: "Рӯз ба хайр", ipa: "Гуд афтернун", example: "Good afternoon, please.", exampleTrans: "Рӯз ба хайр, лутфан." },
          { word: "Good evening", translation: "Шом ба хайр", ipa: "Гуд ивнинг", example: "Good evening! How are you?", exampleTrans: "Шом ба хайр! Шумо чӣ хел?" },
          { word: "Good night", translation: "Шаб ба хайр", ipa: "Гуд найт", example: "Good night! Bye.", exampleTrans: "Шаб ба хайр! Хайр." }
        ]
      },
      {
        title: "Lesson 7: Conversation",
        titleTranslated: "Дарси 7: Муколама",
        emoji: "🗣️",
        xpReward: 70,
        words: [
          { word: "Hello", translation: "Салом", ipa: "Ҳеллоу", example: "Hello, good morning.", exampleTrans: "Салом, субҳ ба хайр." },
          { word: "What is your name?", translation: "Номи шумо чист?", ipa: "Уот из йор нейм?", example: "What is your name, friend?", exampleTrans: "Номи шумо чист, дӯстам?" },
          { word: "My name is", translation: "Номи ман ... аст", ipa: "Май нейм из", example: "My name is John.", exampleTrans: "Номи ман Ҷон аст." },
          { word: "Thank you", translation: "Ташаккур", ipa: "Сенк ю", example: "Thank you, goodbye.", exampleTrans: "Ташаккур, хайр." }
        ]
      },
      {
        title: "Lesson 8: Review",
        titleTranslated: "Дарси 8: Такрор",
        emoji: "✅",
        xpReward: 100,
        words: [
          { word: "Review", translation: "Такроркунӣ", ipa: "Ривю", example: "Review time.", exampleTrans: "Вақти такрор." }
        ]
      }
    ]
  };

  const newModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: moduleData.title,
      titleTranslated: moduleData.titleTranslated,
      emoji: moduleData.emoji,
      color: moduleData.color,
      order: moduleData.order,
      isPremium: false,
      isActive: true,
      lessons: {
        create: moduleData.lessons.map((lesson, idx) => ({
          title: lesson.title,
          titleTranslated: lesson.titleTranslated,
          type: 'vocab',
          cefrLevel: 'A1',
          skillType: 'vocab',
          emoji: lesson.emoji,
          xpReward: lesson.xpReward,
          duration: 5,
          order: idx,
          words: {
            create: lesson.words.map(word => ({
              word: word.word,
              translation: word.translation,
              emoji: '💬',
              audioUrl: `/audio/en/${word.word.replace(/[^a-zA-Z]/g, '').toLowerCase()}.mp3`,
              ipaTajik: word.ipa,
              example: word.example,
              exampleTrans: word.exampleTrans
            }))
          }
        }))
      }
    }
  });

  console.log("Module 1 fully rebuilt from scratch!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
