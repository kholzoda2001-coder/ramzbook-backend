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

  // Delete all modules that overlap with "Module 1"
  await prisma.module.deleteMany({
    where: { 
      courseId: course.id,
      title: { in: ["Hello and Basic Communication", "Greetings & Basics", "Салом ва Муоширати Ибтидоӣ", "Start from Zero"] }
    }
  });

  console.log("Deleted old overlapping Module 1s...");

  const moduleData = {
    title: "Hello and Basic Communication",
    titleTranslated: "Салом ва Муоширати Ибтидоӣ",
    emoji: "👋",
    color: "#10B981",
    order: 0,
    lessons: [
      {
        title: "Greetings", titleTranslated: "Салом ва Хайрбод", emoji: "🤝", xpReward: 60, order: 0,
        words: [
          { emoji: "👋", word: "Hello", ipa: "/həˈləʊ/", tajik_pronunciation: "ҳэлоу", tajik_translation: "Салом" },
          { emoji: "👋", word: "Hi", ipa: "/haɪ/", tajik_pronunciation: "ҳай", tajik_translation: "Салом (кӯтоҳ)" },
          { emoji: "👋", word: "Goodbye", ipa: "/ɡʊdˈbaɪ/", tajik_pronunciation: "гудбай", tajik_translation: "Хайр" },
          { emoji: "👋", word: "Bye", ipa: "/baɪ/", tajik_pronunciation: "бай", tajik_translation: "Хайр (кӯтоҳ)" },
          { emoji: "👍", word: "Yes", ipa: "/jes/", tajik_pronunciation: "йес", tajik_translation: "Бале" },
          { emoji: "👎", word: "No", ipa: "/nəʊ/", tajik_pronunciation: "ноу", tajik_translation: "Не" }
        ]
      },
      {
        title: "Polite Words", titleTranslated: "Муомилаи Хуб", emoji: "🙏", xpReward: 60, order: 1,
        words: [
          { emoji: "🙏", word: "Please", ipa: "/pliːz/", tajik_pronunciation: "плиз", tajik_translation: "Лутфан / Илтимос" },
          { emoji: "🙏", word: "Thank you", ipa: "/ˈθæŋk juː/", tajik_pronunciation: "сэнк ю", tajik_translation: "Ташаккур" },
          { emoji: "😔", word: "Sorry", ipa: "/ˈsɒri/", tajik_pronunciation: "сори", tajik_translation: "Бубахшед" },
          { emoji: "😊", word: "You're welcome", ipa: "/jɔː ˈwelkəm/", tajik_pronunciation: "йор велкам", tajik_translation: "Меарзад / Саломат бошед" },
          { emoji: "👌", word: "OK", ipa: "/ˌəʊˈkeɪ/", tajik_pronunciation: "оу-кэй", tajik_translation: "Хуб / Майлаш" }
        ]
      },
      {
        title: "Introducing Yourself", titleTranslated: "Муаррифӣ", emoji: "🙋", xpReward: 60, order: 2,
        words: [
          { emoji: "👤", word: "I", ipa: "/aɪ/", tajik_pronunciation: "ай", tajik_translation: "Ман" },
          { emoji: "👤", word: "You", ipa: "/juː/", tajik_pronunciation: "ю", tajik_translation: "Шумо / Ту" },
          { emoji: "👤", word: "My", ipa: "/maɪ/", tajik_pronunciation: "май", tajik_translation: "Ман (аз они ман)" },
          { emoji: "📛", word: "Name", ipa: "/neɪm/", tajik_pronunciation: "нэйм", tajik_translation: "Ном" },
          { emoji: "🟰", word: "Is", ipa: "/ɪz/", tajik_pronunciation: "из", tajik_translation: "Аст" }
        ]
      },
      {
        title: "Asking Names", titleTranslated: "Пурсидани Ном", emoji: "❓", xpReward: 65, order: 3,
        words: [
          { emoji: "❓", word: "What", ipa: "/wɒt/", tajik_pronunciation: "уот", tajik_translation: "Чӣ" },
          { emoji: "👤", word: "Your", ipa: "/jɔːr/", tajik_pronunciation: "йор", tajik_translation: "Шумо (аз они шумо)" },
          { emoji: "📛", word: "Name", ipa: "/neɪm/", tajik_pronunciation: "нэйм", tajik_translation: "Ном" },
          { emoji: "❔", word: "Who", ipa: "/huː/", tajik_pronunciation: "ҳу", tajik_translation: "Кӣ" },
          { emoji: "📝", word: "Question", ipa: "/ˈkwes.tʃən/", tajik_pronunciation: "квесчен", tajik_translation: "Савол" }
        ]
      },
      {
        title: "People", titleTranslated: "Одамон", emoji: "👥", xpReward: 65, order: 4,
        words: [
          { emoji: "👨", word: "Man", ipa: "/mæn/", tajik_pronunciation: "мэн", tajik_translation: "Мард" },
          { emoji: "👩", word: "Woman", ipa: "/ˈwʊm.ən/", tajik_pronunciation: "вумен", tajik_translation: "Зан" },
          { emoji: "👦", word: "Boy", ipa: "/bɔɪ/", tajik_pronunciation: "бой", tajik_translation: "Писар" },
          { emoji: "👧", word: "Girl", ipa: "/ɡɜːl/", tajik_pronunciation: "гёрл", tajik_translation: "Духтар" },
          { emoji: "🤝", word: "Friend", ipa: "/frend/", tajik_pronunciation: "френд", tajik_translation: "Дӯст" }
        ]
      },
      {
        title: "Time Greetings", titleTranslated: "Вақтҳои Рӯз", emoji: "🌅", xpReward: 65, order: 5,
        words: [
          { emoji: "🌅", word: "Good morning", ipa: "/ɡʊd ˈmɔː.nɪŋ/", tajik_pronunciation: "гуд морнинг", tajik_translation: "Субҳ ба хайр" },
          { emoji: "☀️", word: "Good afternoon", ipa: "/ɡʊd ˌɑːf.təˈnuːn/", tajik_pronunciation: "гуд афтернун", tajik_translation: "Рӯз ба хайр" },
          { emoji: "🌆", word: "Good evening", ipa: "/ɡʊd ˈiːv.nɪŋ/", tajik_pronunciation: "гуд ивнинг", tajik_translation: "Шом ба хайр" },
          { emoji: "🌙", word: "Good night", ipa: "/ɡʊd naɪt/", tajik_pronunciation: "гуд найт", tajik_translation: "Шаб ба хайр" }
        ]
      },
      {
        title: "Conversation Practice", titleTranslated: "Муколама ва Амалия", emoji: "🗣️", xpReward: 70, order: 6,
        words: []
      },
      {
        title: "Module Review + Exam", titleTranslated: "Такрор ва Имтиҳони Модул", emoji: "✅", xpReward: 100, order: 7,
        words: []
      }
    ]
  };

  await prisma.module.create({
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
        create: moduleData.lessons.map(lesson => ({
          title: lesson.title,
          titleTranslated: lesson.titleTranslated,
          type: 'vocab',
          cefrLevel: 'A1',
          skillType: 'vocab',
          emoji: lesson.emoji,
          xpReward: lesson.xpReward,
          duration: 5,
          order: lesson.order,
          words: {
            create: lesson.words.map(w => ({
              word: w.word,
              translation: w.tajik_translation,
              emoji: w.emoji,
              audioUrl: `/audio/en/${w.word.replace(/[^a-zA-Z]/g, '').toLowerCase()}.mp3`,
              ipa: w.ipa,
              ipaTajik: w.tajik_pronunciation
            }))
          }
        }))
      }
    }
  });

  console.log("Module 1 perfectly rebuilt according to the final structure!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
