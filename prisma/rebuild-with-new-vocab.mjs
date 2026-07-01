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

  // Delete current Module 1 and Module 2 to replace them
  await prisma.module.deleteMany({
    where: { 
      courseId: course.id,
      title: { in: ["Hello and Basic Communication", "Family & People"] }
    }
  });

  console.log("Deleted old modules...");

  const modulesData = [
    {
      title: "Hello and Basic Communication",
      titleTranslated: "Салом ва Муоширати Ибтидоӣ",
      emoji: "👋",
      color: "#10B981",
      order: 0,
      lessons: [
        {
          title: "Lesson 1: Greetings", titleTranslated: "Дарси 1: Салом ва Хайрбод", emoji: "🤝", xpReward: 60, order: 0,
          words: [
            { emoji: "👋", word: "Hello", ipa: "/həˈləʊ/", tajik_pronunciation: "ҳэлоу", tajik_translation: "Салом" },
            { emoji: "🙋‍♂️", word: "Hi", ipa: "/haɪ/", tajik_pronunciation: "ҳай", tajik_translation: "Салом (кӯтоҳ)" },
            { emoji: "🚶‍♂️", word: "Goodbye", ipa: "/ɡʊdˈbaɪ/", tajik_pronunciation: "гудбай", tajik_translation: "Хайр" },
            { emoji: "👋", word: "Bye", ipa: "/baɪ/", tajik_pronunciation: "бай", tajik_translation: "Хайр (кӯтоҳ)" },
            { emoji: "👍", word: "Yes", ipa: "/jes/", tajik_pronunciation: "йес", tajik_translation: "Бале" },
            { emoji: "👎", word: "No", ipa: "/nəʊ/", tajik_pronunciation: "ноу", tajik_translation: "Не" }
          ]
        },
        {
          title: "Lesson 2: Being Polite", titleTranslated: "Дарси 2: Муомилаи Хуб", emoji: "🙏", xpReward: 60, order: 1,
          words: [
            { emoji: "🥺", word: "Please", ipa: "/pliːz/", tajik_pronunciation: "плиз", tajik_translation: "Лутфан / Илтимос" },
            { emoji: "🙏", word: "Thank you", ipa: "/ˈθæŋk juː/", tajik_pronunciation: "сэнк ю", tajik_translation: "Ташаккур" },
            { emoji: "😔", word: "Sorry", ipa: "/ˈsɒri/", tajik_pronunciation: "сори", tajik_translation: "Бубахшед" },
            { emoji: "🙌", word: "You're welcome", ipa: "/jɔː ˈwelkəm/", tajik_pronunciation: "йор велкам", tajik_translation: "Меарзад / Саломат бошед" },
            { emoji: "👌", word: "OK", ipa: "/ˌəʊˈkeɪ/", tajik_pronunciation: "оу-кэй", tajik_translation: "Хуб / Майлаш" }
          ]
        },
        {
          title: "Lesson 3: Introduction", titleTranslated: "Дарси 3: Муаррифӣ", emoji: "🙋", xpReward: 60, order: 2,
          words: [
            { emoji: "🙋", word: "I", ipa: "/aɪ/", tajik_pronunciation: "ай", tajik_translation: "Ман" },
            { emoji: "🫵", word: "You", ipa: "/juː/", tajik_pronunciation: "ю", tajik_translation: "Шумо / Ту" },
            { emoji: "💼", word: "My", ipa: "/maɪ/", tajik_pronunciation: "май", tajik_translation: "Ман (аз они ман)" },
            { emoji: "📛", word: "Name", ipa: "/neɪm/", tajik_pronunciation: "нэйм", tajik_translation: "Ном" },
            { emoji: "👉", word: "Is", ipa: "/ɪz/", tajik_pronunciation: "из", tajik_translation: "Аст" }
          ]
        },
        {
          title: "Lesson 4: Asking Names", titleTranslated: "Дарси 4: Пурсидани Ном", emoji: "❓", xpReward: 65, order: 3,
          words: [
            { emoji: "❓", word: "What", ipa: "/wɒt/", tajik_pronunciation: "уот", tajik_translation: "Чӣ" },
            { emoji: "🫵", word: "Your", ipa: "/jɔːr/", tajik_pronunciation: "йор", tajik_translation: "Шумо (аз они шумо)" },
            { emoji: "📛", word: "Name", ipa: "/neɪm/", tajik_pronunciation: "нэйм", tajik_translation: "Ном" }
          ]
        },
        {
          title: "Lesson 5: People", titleTranslated: "Дарси 5: Одамон", emoji: "👥", xpReward: 65, order: 4,
          words: [
            { emoji: "👨", word: "Man", ipa: "/mæn/", tajik_pronunciation: "мэн", tajik_translation: "Мард" },
            { emoji: "👩", word: "Woman", ipa: "/ˈwʊm.ən/", tajik_pronunciation: "вумен", tajik_translation: "Зан" },
            { emoji: "👦", word: "Boy", ipa: "/bɔɪ/", tajik_pronunciation: "бой", tajik_translation: "Писар" },
            { emoji: "👧", word: "Girl", ipa: "/ɡɜːl/", tajik_pronunciation: "гёрл", tajik_translation: "Духтар" },
            { emoji: "🤝", word: "Friend", ipa: "/frend/", tajik_pronunciation: "френд", tajik_translation: "Дӯст" }
          ]
        },
        {
          title: "Lesson 6: Times of Day", titleTranslated: "Дарси 6: Вақтҳои Рӯз", emoji: "🌅", xpReward: 65, order: 5,
          words: [
            { emoji: "🌅", word: "Good morning", ipa: "/ɡʊd ˈmɔː.nɪŋ/", tajik_pronunciation: "гуд морнинг", tajik_translation: "Субҳ ба хайр" },
            { emoji: "☀️", word: "Good afternoon", ipa: "/ɡʊd ˌɑːf.təˈnuːn/", tajik_pronunciation: "гуд афтернун", tajik_translation: "Рӯз ба хайр" },
            { emoji: "🌆", word: "Good evening", ipa: "/ɡʊd ˈiːv.nɪŋ/", tajik_pronunciation: "гуд ивнинг", tajik_translation: "Шом ба хайр" },
            { emoji: "🌙", word: "Good night", ipa: "/ɡʊd naɪt/", tajik_pronunciation: "гуд найт", tajik_translation: "Шаб ба хайр" }
          ]
        },
        {
          title: "Lesson 7: Full Conversation", titleTranslated: "Дарси 7: Муколама", emoji: "🗣️", xpReward: 70, order: 6,
          words: [
            { emoji: "🗣️", word: "Conversation", ipa: "/ˌkɒn.vəˈseɪ.ʃən/", tajik_pronunciation: "конверсэйшн", tajik_translation: "Муколама / Сӯҳбат" }
          ]
        }
      ]
    },
    {
      title: "Family & People",
      titleTranslated: "Оила ва Одамон",
      emoji: "👨‍👩‍👧",
      color: "#F43F5E",
      order: 1,
      lessons: [
        {
          title: "Family Members", titleTranslated: "Аъзоёни оила", emoji: "👨‍👩‍👦", xpReward: 65, order: 0,
          words: [
            { emoji: "👩", word: "Mother", ipa: "/ˈmʌð.ər/", tajik_pronunciation: "мазэр", tajik_translation: "Модар" },
            { emoji: "👨", word: "Father", ipa: "/ˈfɑː.ðər/", tajik_pronunciation: "фазэр", tajik_translation: "Падар" },
            { emoji: "👦", word: "Brother", ipa: "/ˈbrʌð.ər/", tajik_pronunciation: "бразэр", tajik_translation: "Бародар" },
            { emoji: "👧", word: "Sister", ipa: "/ˈsɪs.tər/", tajik_pronunciation: "систэр", tajik_translation: "Хоҳар" },
            { emoji: "👨‍👩‍👧‍👦", word: "Family", ipa: "/ˈfæm.əl.i/", tajik_pronunciation: "фэмилӣ", tajik_translation: "Оила" },
            { emoji: "🤝", word: "Friend", ipa: "/frend/", tajik_pronunciation: "френд", tajik_translation: "Дӯст" }
          ]
        },
        {
          title: "People and Age", titleTranslated: "Одамон ва Синну сол", emoji: "👴", xpReward: 65, order: 1,
          words: [
            { emoji: "👦", word: "Boy", ipa: "/bɔɪ/", tajik_pronunciation: "бой", tajik_translation: "Писарбача" },
            { emoji: "👧", word: "Girl", ipa: "/ɡɜːl/", tajik_pronunciation: "гёрл", tajik_translation: "Духтар" },
            { emoji: "👨", word: "Man", ipa: "/mæn/", tajik_pronunciation: "мэн", tajik_translation: "Мард" },
            { emoji: "👩", word: "Woman", ipa: "/ˈwʊm.ən/", tajik_pronunciation: "вумен", tajik_translation: "Зан" },
            { emoji: "👴", word: "Old", ipa: "/əʊld/", tajik_pronunciation: "оулд", tajik_translation: "Кӯҳна / Пир" },
            { emoji: "👶", word: "Young", ipa: "/jʌŋ/", tajik_pronunciation: "янг", tajik_translation: "Ҷавон" }
          ]
        },
        {
          title: "Emotions and States", titleTranslated: "Эҳсосот ва Ҳолат", emoji: "😊", xpReward: 65, order: 2,
          words: [
            { emoji: "😊", word: "Happy", ipa: "/ˈhæp.i/", tajik_pronunciation: "ҳэппӣ", tajik_translation: "Хушбахт / Хурсанд" },
            { emoji: "😢", word: "Sad", ipa: "/sæd/", tajik_pronunciation: "сэд", tajik_translation: "Ғамгин / Зиқ" },
            { emoji: "😡", word: "Angry", ipa: "/ˈæŋ.ɡri/", tajik_pronunciation: "энгрӣ", tajik_translation: "Бадқаҳр / Асабонӣ" },
            { emoji: "😫", word: "Tired", ipa: "/taɪəd/", tajik_pronunciation: "тайерд", tajik_translation: "Хаста / Монда" },
            { emoji: "👍", word: "Good", ipa: "/ɡʊd/", tajik_pronunciation: "гуд", tajik_translation: "Хуб" },
            { emoji: "👎", word: "Bad", ipa: "/bæd/", tajik_pronunciation: "бэд", tajik_translation: "Бад" }
          ]
        },
        {
          title: "Numbers 11-20", titleTranslated: "Рақамҳои 11-20", emoji: "🔢", xpReward: 65, order: 3,
          words: [
            { emoji: "1️⃣1️⃣", word: "Eleven", ipa: "/ɪˈlev.ən/", tajik_pronunciation: "илевен", tajik_translation: "Ёздаҳ" },
            { emoji: "1️⃣2️⃣", word: "Twelve", ipa: "/twelv/", tajik_pronunciation: "твелв", tajik_translation: "Дувоздаҳ" },
            { emoji: "1️⃣3️⃣", word: "Thirteen", ipa: "/θɜːˈtiːn/", tajik_pronunciation: "сётин", tajik_translation: "Сенздаҳ" },
            { emoji: "1️⃣4️⃣", word: "Fourteen", ipa: "/ˌfɔːˈtiːn/", tajik_pronunciation: "фотин", tajik_translation: "Чордаҳ" },
            { emoji: "1️⃣5️⃣", word: "Fifteen", ipa: "/ˌfɪfˈtiːn/", tajik_pronunciation: "фифтин", tajik_translation: "Понздаҳ" },
            { emoji: "1️⃣6️⃣", word: "Sixteen", ipa: "/ˌsɪkˈstiːn/", tajik_pronunciation: "сикстин", tajik_translation: "Шонздаҳ" },
            { emoji: "1️⃣7️⃣", word: "Seventeen", ipa: "/ˌsev.ənˈtiːn/", tajik_pronunciation: "севентин", tajik_translation: "Ҳафтдаҳ" },
            { emoji: "1️⃣8️⃣", word: "Eighteen", ipa: "/ˌeɪˈtiːn/", tajik_pronunciation: "эйтин", tajik_translation: "Ҳаждаҳ" },
            { emoji: "1️⃣9️⃣", word: "Nineteen", ipa: "/ˌnaɪnˈtiːn/", tajik_pronunciation: "найнтин", tajik_translation: "Нӯздаҳ" },
            { emoji: "2️⃣0️⃣", word: "Twenty", ipa: "/ˈtwen.ti/", tajik_pronunciation: "твенти", tajik_translation: "Бист" }
          ]
        }
      ]
    }
  ];

  for (const moduleData of modulesData) {
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
  }

  console.log("Modules 1 and 2 rebuilt with the new rules!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
