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

  // Delete overlapping Module 4 if it exists
  await prisma.module.deleteMany({
    where: { 
      courseId: course.id,
      title: { in: ["Module 4: Numbers And Time", "Numbers And Time", "Рақамҳо ва Вақт", "Numbers & Time"] }
    }
  });

  console.log("Deleted old overlapping Module 4...");

  const moduleData = {
    title: "Module 4: Numbers And Time",
    titleTranslated: "Рақамҳо ва Вақт",
    emoji: "🔢",
    color: "#8B5CF6", // Purple color for variety
    order: 3, // Module 3 was 2
    lessons: [
      {
        title: "Lesson 1: Numbers 1-10", titleTranslated: "Рақамҳои 1-10", emoji: "1️⃣", xpReward: 20, order: 0,
        words: [
          { emoji: "1️⃣", word: "One", ipa: "/Wʌn/", tajik_pronunciation: "Ван", tajik_translation: "Як" },
          { emoji: "2️⃣", word: "Two", ipa: "/Tuː/", tajik_pronunciation: "Ту", tajik_translation: "Ду" },
          { emoji: "3️⃣", word: "Three", ipa: "/Θriː/", tajik_pronunciation: "Сри", tajik_translation: "Се" },
          { emoji: "4️⃣", word: "Four", ipa: "/Fɔːr/", tajik_pronunciation: "Фор", tajik_translation: "Чор" },
          { emoji: "5️⃣", word: "Five", ipa: "/Faɪv/", tajik_pronunciation: "Файв", tajik_translation: "Панҷ" },
          { emoji: "6️⃣", word: "Six", ipa: "/Sɪks/", tajik_pronunciation: "Сикс", tajik_translation: "Шаш" }
        ]
      },
      {
        title: "Lesson 2: Numbers 11-20", titleTranslated: "Рақамҳои 11-20", emoji: "2️⃣", xpReward: 20, order: 1,
        words: [
          { emoji: "1️⃣1️⃣", word: "Eleven", ipa: "/Ɪˈlev.ən/", tajik_pronunciation: "Илевен", tajik_translation: "Ёздаҳ" },
          { emoji: "1️⃣2️⃣", word: "Twelve", ipa: "/Twelv/", tajik_pronunciation: "Твелв", tajik_translation: "Дувоздаҳ" },
          { emoji: "1️⃣3️⃣", word: "Thirteen", ipa: "/Θɜːˈtiːn/", tajik_pronunciation: "Сёртин", tajik_translation: "Сездаҳ" },
          { emoji: "1️⃣4️⃣", word: "Fourteen", ipa: "/Fɔːˈtiːn/", tajik_pronunciation: "Фортин", tajik_translation: "Чордаҳ" },
          { emoji: "1️⃣5️⃣", word: "Fifteen", ipa: "/Fɪfˈtiːn/", tajik_pronunciation: "Фифтин", tajik_translation: "Понздаҳ" },
          { emoji: "2️⃣0️⃣", word: "Twenty", ipa: "/ˈTwen.ti/", tajik_pronunciation: "Твенти", tajik_translation: "Бист" }
        ]
      },
      {
        title: "Lesson 3: Numbers 21-100", titleTranslated: "Рақамҳои 21-100", emoji: "💯", xpReward: 20, order: 2,
        words: [
          { emoji: "🔢", word: "Thirty", ipa: "/ˈΘɜː.ti/", tajik_pronunciation: "Сёрти", tajik_translation: "Сӣ" },
          { emoji: "🔢", word: "Forty", ipa: "/ˈFɔː.ti/", tajik_pronunciation: "Форти", tajik_translation: "Чил" },
          { emoji: "🔢", word: "Fifty", ipa: "/ˈFɪf.ti/", tajik_pronunciation: "Фифти", tajik_translation: "Панҷоҳ" },
          { emoji: "🔢", word: "Sixty", ipa: "/ˈSɪk.sti/", tajik_pronunciation: "Сиксти", tajik_translation: "Шаст" },
          { emoji: "🔢", word: "Seventy", ipa: "/ˈSev.ən.ti/", tajik_pronunciation: "Севенти", tajik_translation: "Ҳафтод" },
          { emoji: "🔢", word: "One Hundred", ipa: "/Wʌn ˈHʌn.drəd/", tajik_pronunciation: "Ван Ҳандред", tajik_translation: "Як Сад" }
        ]
      },
      {
        title: "Lesson 4: Days Of The Week", titleTranslated: "Рӯзҳои Ҳафта", emoji: "📅", xpReward: 20, order: 3,
        words: [
          { emoji: "📅", word: "Monday", ipa: "/ˈMʌn.deɪ/", tajik_pronunciation: "Мандэй", tajik_translation: "Душанбе" },
          { emoji: "📅", word: "Tuesday", ipa: "/ˈTjuːz.deɪ/", tajik_pronunciation: "Тюздэй", tajik_translation: "Сешанбе" },
          { emoji: "📅", word: "Wednesday", ipa: "/ˈWenz.deɪ/", tajik_pronunciation: "Венздэй", tajik_translation: "Чоршанбе" },
          { emoji: "📅", word: "Thursday", ipa: "/ˈΘɜːz.deɪ/", tajik_pronunciation: "Сёрздэй", tajik_translation: "Панҷшанбе" },
          { emoji: "📅", word: "Friday", ipa: "/ˈFraɪ.deɪ/", tajik_pronunciation: "Фрайдэй", tajik_translation: "Ҷумъа" },
          { emoji: "📅", word: "Saturday", ipa: "/ˈSæt.ə.deɪ/", tajik_pronunciation: "Сатердэй", tajik_translation: "Шанбе" },
          { emoji: "📅", word: "Sunday", ipa: "/ˈSʌn.deɪ/", tajik_pronunciation: "Сандэй", tajik_translation: "Якшанбе" }
        ]
      },
      {
        title: "Lesson 5: Months Of The Year", titleTranslated: "Моҳҳои Сол", emoji: "🗓", xpReward: 20, order: 4,
        words: [
          { emoji: "🗓", word: "January", ipa: "/ˈDʒæn.ju.ə.ri/", tajik_pronunciation: "Ҷанюэри", tajik_translation: "Январ" },
          { emoji: "🗓", word: "February", ipa: "/ˈFeb.ru.ə.ri/", tajik_pronunciation: "Фебруэри", tajik_translation: "Феврал" },
          { emoji: "🗓", word: "March", ipa: "/Mɑːtʃ/", tajik_pronunciation: "Марч", tajik_translation: "Март" },
          { emoji: "🗓", word: "April", ipa: "/ˈEɪ.prəl/", tajik_pronunciation: "Эйприл", tajik_translation: "Апрел" },
          { emoji: "🗓", word: "May", ipa: "/Meɪ/", tajik_pronunciation: "Мэй", tajik_translation: "Май" },
          { emoji: "🗓", word: "June", ipa: "/Dʒuːn/", tajik_pronunciation: "Ҷун", tajik_translation: "Июн" }
        ]
      },
      {
        title: "Lesson 6: Telling Time", titleTranslated: "Гуфтани Вақт", emoji: "⏰", xpReward: 25, order: 5,
        words: [
          { emoji: "🕐", word: "O'Clock", ipa: "/Əˈklɒk/", tajik_pronunciation: "Оклок", tajik_translation: "Соат" },
          { emoji: "⏰", word: "Time", ipa: "/Taɪm/", tajik_pronunciation: "Тайм", tajik_translation: "Вақт" },
          { emoji: "🌅", word: "Morning", ipa: "/ˈMɔː.nɪŋ/", tajik_pronunciation: "Морнинг", tajik_translation: "Субҳ" },
          { emoji: "☀️", word: "Afternoon", ipa: "/ˌAːf.təˈnuːn/", tajik_pronunciation: "Афтернун", tajik_translation: "Баъд Аз Зӯҳр" },
          { emoji: "🌆", word: "Evening", ipa: "/ˈIːv.nɪŋ/", tajik_pronunciation: "Ивнинг", tajik_translation: "Шом" },
          { emoji: "🌙", word: "Night", ipa: "/Naɪt/", tajik_pronunciation: "Найт", tajik_translation: "Шаб" }
        ]
      },
      {
        title: "Lesson 7: Time Builder", titleTranslated: "Сохтани Ҷумлаҳои Вақт", emoji: "🏗️", xpReward: 25, order: 6,
        words: []
      },
      {
        title: "Lesson 8: Conversation Practice", titleTranslated: "Муколама ва Амалия", emoji: "🗣️", xpReward: 30, order: 7,
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
            create: lesson.words.length > 0 ? lesson.words.map((w, index) => ({
              word: w.word,
              translation: w.tajik_translation,
              emoji: w.emoji,
              audioUrl: `/audio/en/${w.word.replace(/[^a-zA-Z]/g, '').toLowerCase()}.mp3`,
              ipa: w.ipa,
              ipaTajik: w.tajik_pronunciation
            })) : undefined
          }
        }))
      }
    }
  });

  console.log("Module 4 created successfully!", newModule.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
