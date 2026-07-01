import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: { lessons: { orderBy: { order: 'asc' } } }
      }
    }
  });

  if (!course) return;

  const mod3 = course.modules[2]; // Family And People
  const mod4 = course.modules[3]; // Numbers And Time

  const wordsToAdd = [
    // Module 3 Lesson 1
    {
      lessonId: mod3.lessons[0].id, // My Family
      word: "Husband", ipa: "/ˈhʌz.bənd/", ipaTajik: "Ҳазбэнд", translation: "Шавҳар", emoji: "👨", example: "He Is My Husband.", exampleTrans: "Ӯ Шавҳари Ман Аст.", order: 10
    },
    {
      lessonId: mod3.lessons[0].id,
      word: "Wife", ipa: "/waɪf/", ipaTajik: "Вайф", translation: "Ҳамсар", emoji: "👩", example: "She Is My Wife.", exampleTrans: "Ӯ Ҳамсари Ман Аст.", order: 11
    },
    {
      lessonId: mod3.lessons[0].id,
      word: "Parents", ipa: "/ˈpeə.rənts/", ipaTajik: "Пеэрентс", translation: "Волидон", emoji: "👪", example: "I Love My Parents.", exampleTrans: "Ман Волидонамро Дӯст Медорам.", order: 12
    },
    
    // Module 3 Lesson 2
    {
      lessonId: mod3.lessons[1].id, // Relatives
      word: "Cousin", ipa: "/ˈkʌz.ən/", ipaTajik: "Казн", translation: "Амакбача / Холабача", emoji: "👦", example: "He Is My Cousin.", exampleTrans: "Ӯ Амакбачаи Ман Аст.", order: 10
    },
    {
      lessonId: mod3.lessons[1].id,
      word: "Nephew", ipa: "/ˈnef.juː/", ipaTajik: "Нефю", translation: "Ҷиян (Писар)", emoji: "👦", example: "My Nephew Is Young.", exampleTrans: "Ҷияни Ман Ҷавон Аст.", order: 11
    },
    {
      lessonId: mod3.lessons[1].id,
      word: "Niece", ipa: "/niːs/", ipaTajik: "Нис", translation: "Ҷиян (Духтар)", emoji: "👧", example: "My Niece Is Nice.", exampleTrans: "Ҷияни Ман Нағз Аст.", order: 12
    },

    // Module 4 Lesson 1 (Numbers 1-10)
    {
      lessonId: mod4.lessons[0].id,
      word: "Seven", ipa: "/ˈsev.ən/", ipaTajik: "Севн", translation: "Ҳафт", emoji: "7️⃣", example: "I Have Seven Books.", exampleTrans: "Ман Ҳафт Китоб Дорам.", order: 10
    },
    {
      lessonId: mod4.lessons[0].id,
      word: "Eight", ipa: "/eɪt/", ipaTajik: "Эйт", translation: "Ҳашт", emoji: "8️⃣", example: "It Is Eight O'Clock.", exampleTrans: "Соат Ҳашт Аст.", order: 11
    },
    {
      lessonId: mod4.lessons[0].id,
      word: "Nine", ipa: "/naɪn/", ipaTajik: "Найн", translation: "Нуҳ", emoji: "9️⃣", example: "I Am Nine Years Old.", exampleTrans: "Ман Нуҳсола Ҳастам.", order: 12
    },
    {
      lessonId: mod4.lessons[0].id,
      word: "Ten", ipa: "/ten/", ipaTajik: "Тен", translation: "Даҳ", emoji: "🔟", example: "I Have Ten Apples.", exampleTrans: "Ман Даҳ Себ Дорам.", order: 13
    },

    // Module 4 Lesson 2 (Numbers 11-20)
    {
      lessonId: mod4.lessons[1].id,
      word: "Sixteen", ipa: "/ˌsɪkˈstiːn/", ipaTajik: "Сикстин", translation: "Шонздаҳ", emoji: "🔢", example: "He Is Sixteen.", exampleTrans: "Ӯ Шонздаҳсола Аст.", order: 10
    },
    {
      lessonId: mod4.lessons[1].id,
      word: "Seventeen", ipa: "/ˌsev.ənˈtiːn/", ipaTajik: "Севнтин", translation: "Ҳафтдаҳ", emoji: "🔢", example: "She Is Seventeen.", exampleTrans: "Ӯ Ҳафтдаҳсола Аст.", order: 11
    },
    {
      lessonId: mod4.lessons[1].id,
      word: "Eighteen", ipa: "/ˌeɪˈtiːn/", ipaTajik: "Эйтин", translation: "Ҳаждаҳ", emoji: "🔢", example: "I Am Eighteen Years Old.", exampleTrans: "Ман Ҳаждаҳсола Ҳастам.", order: 12
    },
    {
      lessonId: mod4.lessons[1].id,
      word: "Nineteen", ipa: "/ˌnaɪnˈtiːn/", ipaTajik: "Найнтин", translation: "Нуздаҳ", emoji: "🔢", example: "He Is Nineteen.", exampleTrans: "Ӯ Нуздаҳсола Аст.", order: 13
    },

    // Module 4 Lesson 3 (Numbers 21-100)
    {
      lessonId: mod4.lessons[2].id,
      word: "Eighty", ipa: "/ˈeɪ.ti/", ipaTajik: "Эйти", translation: "Ҳаштод", emoji: "🔢", example: "My Grandfather Is Eighty.", exampleTrans: "Бобои Ман Ҳаштодсола Аст.", order: 10
    },
    {
      lessonId: mod4.lessons[2].id,
      word: "Ninety", ipa: "/ˈnaɪn.ti/", ipaTajik: "Найнти", translation: "Навад", emoji: "🔢", example: "It Costs Ninety Somoni.", exampleTrans: "Он Навад Сомонӣ Арзиш Дорад.", order: 11
    },

    // Module 4 Lesson 5 (Months)
    {
      lessonId: mod4.lessons[4].id,
      word: "July", ipa: "/dʒuˈlaɪ/", ipaTajik: "Ҷулай", translation: "Июл", emoji: "📅", example: "July Is Hot.", exampleTrans: "Июл Гарм Аст.", order: 10
    },
    {
      lessonId: mod4.lessons[4].id,
      word: "August", ipa: "/ˈɔː.ɡəst/", ipaTajik: "Огост", translation: "Август", emoji: "📅", example: "My Birthday Is In August.", exampleTrans: "Зодрӯзи Ман Дар Август Аст.", order: 11
    },
    {
      lessonId: mod4.lessons[4].id,
      word: "September", ipa: "/sepˈtem.bər/", ipaTajik: "Септембэр", translation: "Сентябр", emoji: "📅", example: "School Starts In September.", exampleTrans: "Мактаб Дар Сентябр Сар Мешавад.", order: 12
    },
    {
      lessonId: mod4.lessons[4].id,
      word: "October", ipa: "/ɒkˈtəʊ.bər/", ipaTajik: "Октоубэр", translation: "Октябр", emoji: "📅", example: "October Is Nice.", exampleTrans: "Октябр Нағз Аст.", order: 13
    },
    {
      lessonId: mod4.lessons[4].id,
      word: "November", ipa: "/nəʊˈvem.bər/", ipaTajik: "Ноувембэр", translation: "Ноябр", emoji: "📅", example: "November Is Cold.", exampleTrans: "Ноябр Хунук Аст.", order: 14
    },
    {
      lessonId: mod4.lessons[4].id,
      word: "December", ipa: "/dɪˈsem.bər/", ipaTajik: "Дисембэр", translation: "Декабр", emoji: "📅", example: "December Is Very Cold.", exampleTrans: "Декабр Хеле Хунук Аст.", order: 15
    }
  ];

  let addedCount = 0;
  for (const item of wordsToAdd) {
    const existing = await prisma.word.findFirst({
      where: { lessonId: item.lessonId, word: item.word }
    });
    if (!existing) {
      await prisma.word.create({ data: item });
      addedCount++;
      console.log(`Added missing word: ${item.word}`);
    }
  }

  console.log(`Successfully added ${addedCount} missing words.`);
}

main().finally(() => prisma.$disconnect());
