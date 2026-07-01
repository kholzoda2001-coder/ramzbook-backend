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

  // Delete overlapping Module 2 if it exists
  await prisma.module.deleteMany({
    where: { 
      courseId: course.id,
      title: { in: ["Module 2: About Me", "About Me", "Дар бораи Ман"] }
    }
  });

  console.log("Deleted old overlapping Module 2...");

  const moduleData = {
    title: "Module 2: About Me",
    titleTranslated: "Дар бораи Ман",
    emoji: "👤",
    color: "#3B82F6", // Blue color for variety
    order: 1, // Module 1 was 0
    lessons: [
      {
        title: "Lesson 1: Age Basics", titleTranslated: "Асосҳои Синну Сол", emoji: "🎂", xpReward: 60, order: 0,
        words: [
          { emoji: "🎂", word: "Age", ipa: "/Eɪdʒ/", tajik_pronunciation: "Эйҷ", tajik_translation: "Синну Сол" },
          { emoji: "🔢", word: "Years", ipa: "/Jɪəz/", tajik_pronunciation: "Йерз", tajik_translation: "Солҳо" },
          { emoji: "👦", word: "Young", ipa: "/Jʌŋ/", tajik_pronunciation: "Янг", tajik_translation: "Ҷавон" },
          { emoji: "👴", word: "Old", ipa: "/Əʊld/", tajik_pronunciation: "Оулд", tajik_translation: "Пир" },
          { emoji: "📅", word: "Birthday", ipa: "/ˈBɜːθ.deɪ/", tajik_pronunciation: "Бёрсдэй", tajik_translation: "Зодрӯз" },
          { emoji: "🎉", word: "Today", ipa: "/Təˈdeɪ/", tajik_pronunciation: "Тудэй", tajik_translation: "Имрӯз" }
        ]
      },
      {
        title: "Lesson 2: Numbers 1-20 Review and Usage", titleTranslated: "Рақамҳои 1-20 ва Истифода", emoji: "🔢", xpReward: 60, order: 1,
        words: [
          { emoji: "1️⃣", word: "One", ipa: "/Wʌn/", tajik_pronunciation: "Ван", tajik_translation: "Як" },
          { emoji: "2️⃣", word: "Two", ipa: "/Tuː/", tajik_pronunciation: "Ту", tajik_translation: "Ду" },
          { emoji: "3️⃣", word: "Three", ipa: "/Θriː/", tajik_pronunciation: "Сри", tajik_translation: "Се" },
          { emoji: "🔟", word: "Ten", ipa: "/Ten/", tajik_pronunciation: "Тен", tajik_translation: "Даҳ" },
          { emoji: "🔢", word: "Twenty", ipa: "/ˈTwen.ti/", tajik_pronunciation: "Твенти", tajik_translation: "Бист" }
        ]
      },
      {
        title: "Lesson 3: Countries", titleTranslated: "Кишварҳо", emoji: "🌍", xpReward: 60, order: 2,
        words: [
          { emoji: "🌍", word: "Country", ipa: "/ˈKʌn.tri/", tajik_pronunciation: "Кантри", tajik_translation: "Кишвар" },
          { emoji: "🇹🇯", word: "Tajikistan", ipa: "/Tɑːˌdʒiː.kɪˈstɑːn/", tajik_pronunciation: "Тоҷикистон", tajik_translation: "Тоҷикистон" },
          { emoji: "🇦🇪", word: "Uae", ipa: "/ˌJuː.eɪˈiː/", tajik_pronunciation: "Ю-Эй-И", tajik_translation: "Амороти Муттаҳидаи Араб" },
          { emoji: "🇺🇸", word: "America", ipa: "/Əˈmer.ɪ.kə/", tajik_pronunciation: "Америка", tajik_translation: "Амрико" },
          { emoji: "🇬🇧", word: "England", ipa: "/ˈꞮŋ.ɡlənd/", tajik_pronunciation: "Ингланд", tajik_translation: "Англия" },
          { emoji: "🏠", word: "From", ipa: "/Frɒm/", tajik_pronunciation: "Фром", tajik_translation: "Аз" }
        ]
      },
      {
        title: "Lesson 4: Cities", titleTranslated: "Шаҳрҳо", emoji: "🏙", xpReward: 65, order: 3,
        words: [
          { emoji: "🏙", word: "City", ipa: "/ˈSɪt.i/", tajik_pronunciation: "Сити", tajik_translation: "Шаҳр" },
          { emoji: "🏠", word: "Live", ipa: "/Lɪv/", tajik_pronunciation: "Лив", tajik_translation: "Зиндагӣ Кардан" },
          { emoji: "📍", word: "Here", ipa: "/Hɪər/", tajik_pronunciation: "Ҳиер", tajik_translation: "Ин Ҷо" },
          { emoji: "🌆", word: "Dushanbe", ipa: "/Duˈʃæmbeɪ/", tajik_pronunciation: "Душанбе", tajik_translation: "Душанбе" },
          { emoji: "🌇", word: "Dubai", ipa: "/Duːˈbaɪ/", tajik_pronunciation: "Дубай", tajik_translation: "Дубай" },
          { emoji: "🗺", word: "Place", ipa: "/Pleɪs/", tajik_pronunciation: "Плэйс", tajik_translation: "Ҷой" }
        ]
      },
      {
        title: "Lesson 5: Languages", titleTranslated: "Забонҳо", emoji: "🗣", xpReward: 65, order: 4,
        words: [
          { emoji: "🗣", word: "Language", ipa: "/ˈLæŋ.ɡwɪdʒ/", tajik_pronunciation: "Лангвиҷ", tajik_translation: "Забон" },
          { emoji: "🇬🇧", word: "English", ipa: "/ˈꞮŋ.ɡlɪʃ/", tajik_pronunciation: "Инглиш", tajik_translation: "Англисӣ" },
          { emoji: "🇹🇯", word: "Tajik", ipa: "/ˈTɑː.dʒɪk/", tajik_pronunciation: "Тоҷик", tajik_translation: "Тоҷикӣ" },
          { emoji: "🇷🇺", word: "Russian", ipa: "/ˈRʌʃ.ən/", tajik_pronunciation: "Рашен", tajik_translation: "Русӣ" },
          { emoji: "💬", word: "Speak", ipa: "/Spiːk/", tajik_pronunciation: "Спик", tajik_translation: "Гап Задан" },
          { emoji: "📚", word: "Learn", ipa: "/Lɜːn/", tajik_pronunciation: "Лерн", tajik_translation: "Омӯхтан" }
        ]
      },
      {
        title: "Lesson 6: Personal Information Builder", titleTranslated: "Маълумоти Шахсӣ", emoji: "📋", xpReward: 65, order: 5,
        words: []
      },
      {
        title: "Lesson 7: Conversation Practice", titleTranslated: "Муколама ва Амалия", emoji: "🗣️", xpReward: 70, order: 6,
        words: []
      },
      {
        title: "Lesson 8: Module Review", titleTranslated: "Такрори Модул", emoji: "🔄", xpReward: 70, order: 7,
        words: []
      },
      {
        title: "Lesson 9: Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", emoji: "✅", xpReward: 100, order: 8,
        words: []
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
          isActive: true,
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

  console.log("Module 2 created successfully!", newModule.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
