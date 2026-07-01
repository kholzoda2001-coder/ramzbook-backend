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

  // Delete overlapping Module 3 if it exists
  await prisma.module.deleteMany({
    where: { 
      courseId: course.id,
      title: { in: ["Module 3: Family And People", "Family And People", "Оила ва Одамон", "Family & People"] }
    }
  });

  console.log("Deleted old overlapping Module 3...");

  const moduleData = {
    title: "Module 3: Family And People",
    titleTranslated: "Оила ва Одамон",
    emoji: "👨‍👩‍👧",
    color: "#F59E0B", // Amber color for variety
    order: 2, // Module 2 was 1
    lessons: [
      {
        title: "Lesson 1: My Family", titleTranslated: "Оилаи Ман", emoji: "👨‍👩‍👦", xpReward: 20, order: 0,
        words: [
          { emoji: "👨", word: "Father", ipa: "/ˈFɑː.ðər/", tajik_pronunciation: "Фазэр", tajik_translation: "Падар" },
          { emoji: "👩", word: "Mother", ipa: "/ˈMʌð.ər/", tajik_pronunciation: "Мазэр", tajik_translation: "Модар" },
          { emoji: "👦", word: "Son", ipa: "/Sʌn/", tajik_pronunciation: "Сан", tajik_translation: "Писар" },
          { emoji: "👧", word: "Daughter", ipa: "/ˈDɔː.tər/", tajik_pronunciation: "Дотер", tajik_translation: "Духтар" },
          { emoji: "👶", word: "Baby", ipa: "/ˈBeɪ.bi/", tajik_pronunciation: "Бэйби", tajik_translation: "Кӯдак" },
          { emoji: "👪", word: "Family", ipa: "/ˈFæm.əl.i/", tajik_pronunciation: "Фамили", tajik_translation: "Оила" }
        ]
      },
      {
        title: "Lesson 2: Relatives", titleTranslated: "Хешовандон", emoji: "👴", xpReward: 20, order: 1,
        words: [
          { emoji: "👦", word: "Brother", ipa: "/ˈBrʌð.ər/", tajik_pronunciation: "Бразэр", tajik_translation: "Бародар" },
          { emoji: "👧", word: "Sister", ipa: "/ˈSɪs.tər/", tajik_pronunciation: "Систер", tajik_translation: "Хоҳар" },
          { emoji: "👴", word: "Grandfather", ipa: "/ˈGræn.fɑː.ðər/", tajik_pronunciation: "Грандфазэр", tajik_translation: "Бобо" },
          { emoji: "👵", word: "Grandmother", ipa: "/ˈGræn.mʌð.ər/", tajik_pronunciation: "Грандмазэр", tajik_translation: "Бибӣ" },
          { emoji: "👨", word: "Uncle", ipa: "/ˈʌŋ.kəl/", tajik_pronunciation: "Анкл", tajik_translation: "Амак / Тағо" },
          { emoji: "👩", word: "Aunt", ipa: "/Aːnt/", tajik_pronunciation: "Ант", tajik_translation: "Хола / Амма" }
        ]
      },
      {
        title: "Lesson 3: People Around Me", titleTranslated: "Одамони Атрофи Ман", emoji: "👥", xpReward: 20, order: 2,
        words: [
          { emoji: "👨", word: "Man", ipa: "/Mæn/", tajik_pronunciation: "Мэн", tajik_translation: "Мард" },
          { emoji: "👩", word: "Woman", ipa: "/ˈWʊm.ən/", tajik_pronunciation: "Вумен", tajik_translation: "Зан" },
          { emoji: "👦", word: "Boy", ipa: "/Bɔɪ/", tajik_pronunciation: "Бой", tajik_translation: "Писарбача" },
          { emoji: "👧", word: "Girl", ipa: "/Gɜːl/", tajik_pronunciation: "Гёрл", tajik_translation: "Духтарбача" },
          { emoji: "🤝", word: "Friend", ipa: "/Frend/", tajik_pronunciation: "Френд", tajik_translation: "Дӯст" },
          { emoji: "👤", word: "Person", ipa: "/ˈPɜː.sən/", tajik_pronunciation: "Пёрсн", tajik_translation: "Шахс" }
        ]
      },
      {
        title: "Lesson 4: Describing People", titleTranslated: "Тасвири Одамон", emoji: "📏", xpReward: 20, order: 3,
        words: [
          { emoji: "📏", word: "Tall", ipa: "/Tɔːl/", tajik_pronunciation: "Тол", tajik_translation: "Қадбаланд" },
          { emoji: "📏", word: "Short", ipa: "/Ʃɔːt/", tajik_pronunciation: "Шорт", tajik_translation: "Қадпаст" },
          { emoji: "💪", word: "Strong", ipa: "/Strɒŋ/", tajik_pronunciation: "Стронг", tajik_translation: "Қувватманд" },
          { emoji: "😊", word: "Happy", ipa: "/ˈHæp.i/", tajik_pronunciation: "Ҳапи", tajik_translation: "Хушбахт" },
          { emoji: "😢", word: "Sad", ipa: "/Sæd/", tajik_pronunciation: "Сэд", tajik_translation: "Ғамгин" },
          { emoji: "😎", word: "Nice", ipa: "/Naɪs/", tajik_pronunciation: "Найс", tajik_translation: "Нағз" }
        ]
      },
      {
        title: "Lesson 5: Age And Family", titleTranslated: "Синну Сол ва Оила", emoji: "🎂", xpReward: 20, order: 4,
        words: [
          { emoji: "🎂", word: "Young", ipa: "/Jʌŋ/", tajik_pronunciation: "Янг", tajik_translation: "Ҷавон" },
          { emoji: "👴", word: "Old", ipa: "/Əʊld/", tajik_pronunciation: "Оулд", tajik_translation: "Пир" },
          { emoji: "👦", word: "Child", ipa: "/Tʃaɪld/", tajik_pronunciation: "Чайлд", tajik_translation: "Кӯдак" },
          { emoji: "👨", word: "Adult", ipa: "/ˈÆd.ʌlt/", tajik_pronunciation: "Адалт", tajik_translation: "Калонсол" },
          { emoji: "👵", word: "Elderly", ipa: "/ˈEl.dəl.i/", tajik_pronunciation: "Элдерли", tajik_translation: "Куҳансол" },
          { emoji: "🎉", word: "Birthday", ipa: "/ˈBɜːθ.deɪ/", tajik_pronunciation: "Бёрсдэй", tajik_translation: "Зодрӯз" }
        ]
      },
      {
        title: "Lesson 6: Family Builder", titleTranslated: "Сохтани Ҷумлаҳои Оилавӣ", emoji: "🏗️", xpReward: 25, order: 5,
        words: []
      },
      {
        title: "Lesson 7: Conversation Practice", titleTranslated: "Муколама ва Амалия", emoji: "🗣️", xpReward: 25, order: 6,
        words: []
      },
      {
        title: "Lesson 8: Module Review", titleTranslated: "Такрори Модул", emoji: "🔄", xpReward: 30, order: 7,
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

  console.log("Module 3 created successfully!", newModule.id);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
