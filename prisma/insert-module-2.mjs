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

  const moduleData = {
    module_title_en: "Family & People",
    module_title_tg: "Оила ва Одамон",
    lessons: [
      {
        lesson_title_tg: "Аъзоёни оила",
        lesson_title_en: "Family Members",
        vocabulary: [
          { word: "Mother", translation: "Модар", ipa: "Мазер", example: "She is my mother.", exampleTrans: "Ӯ модари ман аст." },
          { word: "Father", translation: "Падар", ipa: "Фазер", example: "He is my father.", exampleTrans: "Ӯ падари ман аст." },
          { word: "Brother", translation: "Бародар", ipa: "Бразер", example: "He is a good brother.", exampleTrans: "Ӯ бародари хуб аст." },
          { word: "Sister", translation: "Хоҳар", ipa: "Систер", example: "She is my sister.", exampleTrans: "Ӯ хоҳари ман аст." },
          { word: "Family", translation: "Оила", ipa: "Фемилӣ", example: "I love my family.", exampleTrans: "Ман оилаамро дӯст медорам." },
          { word: "Friend", translation: "Дӯст", ipa: "Френд", example: "You are my friend.", exampleTrans: "Ту дӯсти ман ҳастӣ." }
        ]
      },
      {
        lesson_title_tg: "Одамон ва Синну сол",
        lesson_title_en: "People and Age",
        vocabulary: [
          { word: "Boy", translation: "Писарбача", ipa: "Бой", example: "He is a boy.", exampleTrans: "Ӯ писарбача аст." },
          { word: "Girl", translation: "Духтар", ipa: "Гёрл", example: "She is a good girl.", exampleTrans: "Ӯ духтари хуб аст." },
          { word: "Man", translation: "Мард", ipa: "Мэн", example: "He is a man.", exampleTrans: "Ӯ мард аст." },
          { word: "Woman", translation: "Зан", ipa: "Вумен", example: "She is a beautiful woman.", exampleTrans: "Ӯ зани зебо аст." },
          { word: "Old", translation: "Кӯҳна / Пир", ipa: "Олд", example: "He is an old man.", exampleTrans: "Ӯ марди пир аст." },
          { word: "Young", translation: "Ҷавон", ipa: "Янг", example: "She is very young.", exampleTrans: "Ӯ хеле ҷавон аст." }
        ]
      },
      {
        lesson_title_tg: "Эҳсосот ва Ҳолат",
        lesson_title_en: "Emotions and States",
        vocabulary: [
          { word: "Happy", translation: "Хушбахт / Хурсанд", ipa: "Ҳеппӣ", example: "I am happy today.", exampleTrans: "Ман имрӯз хурсандам." },
          { word: "Sad", translation: "Ғамгин / Зиқ", ipa: "Сэд", example: "She is sad.", exampleTrans: "Ӯ ғамгин аст." },
          { word: "Angry", translation: "Бадқаҳр / Асабонӣ", ipa: "Энгрӣ", example: "My brother is angry.", exampleTrans: "Бародари ман асабонӣ аст." },
          { word: "Tired", translation: "Хаста / Монда", ipa: "Тайерд", example: "He is tired.", exampleTrans: "Ӯ хаста аст." },
          { word: "Good", translation: "Хуб", ipa: "Гуд", example: "It is a good day.", exampleTrans: "Ин рӯзи хуб аст." },
          { word: "Bad", translation: "Бад", ipa: "Бэд", example: "This is bad.", exampleTrans: "Ин бад аст." }
        ]
      },
      {
        lesson_title_tg: "Рақамҳои 11-20",
        lesson_title_en: "Numbers 11-20",
        vocabulary: [
          { word: "Eleven", translation: "Ёздаҳ", ipa: "Илевен", example: "Eleven apples.", exampleTrans: "Ёздаҳ себ." },
          { word: "Twelve", translation: "Дувоздаҳ", ipa: "Твелв", example: "Twelve months.", exampleTrans: "Дувоздаҳ моҳ." },
          { word: "Thirteen", translation: "Сенздаҳ", ipa: "Сёртин", example: "Thirteen boys.", exampleTrans: "Сенздаҳ писар." },
          { word: "Fourteen", translation: "Чордаҳ", ipa: "Фортин", example: "Fourteen days.", exampleTrans: "Чордаҳ рӯз." },
          { word: "Fifteen", translation: "Понздаҳ", ipa: "Фифтин", example: "Fifteen girls.", exampleTrans: "Понздаҳ духтар." },
          { word: "Sixteen", translation: "Шонздаҳ", ipa: "Сикстин", example: "Sixteen years old.", exampleTrans: "Шонздаҳсола." },
          { word: "Seventeen", translation: "Ҳафтдаҳ", ipa: "Севентин", example: "Seventeen books.", exampleTrans: "Ҳафтдаҳ китоб." },
          { word: "Eighteen", translation: "Ҳаждаҳ", ipa: "Эйтин", example: "Eighteen cars.", exampleTrans: "Ҳаждаҳ мошин." },
          { word: "Nineteen", translation: "Нӯздаҳ", ipa: "Найнтин", example: "Nineteen friends.", exampleTrans: "Нӯздаҳ дӯст." },
          { word: "Twenty", translation: "Бист", ipa: "Твенти", example: "Twenty men.", exampleTrans: "Бист мард." }
        ]
      }
    ]
  };

  const newModule = await prisma.module.create({
    data: {
      courseId: course.id,
      title: moduleData.module_title_en,
      titleTranslated: moduleData.module_title_tg,
      emoji: '👨‍👩‍👧',
      color: '#F43F5E', // Rose
      order: 4, // fifth module
      isPremium: false,
      isActive: true,
      lessons: {
        create: moduleData.lessons.map((lesson, idx) => ({
          title: lesson.lesson_title_en,
          titleTranslated: lesson.lesson_title_tg,
          type: 'vocab',
          cefrLevel: 'A1',
          skillType: 'vocab',
          emoji: '👨‍👩‍👦',
          xpReward: 65,
          duration: 5,
          order: idx,
          words: {
            create: lesson.vocabulary.map(word => ({
              word: word.word,
              translation: word.translation,
              emoji: '💬',
              audioUrl: `/audio/en/${word.word.toLowerCase()}.mp3`,
              ipaTajik: word.ipa,
              example: word.example,
              exampleTrans: word.exampleTrans
            }))
          }
        }))
      }
    }
  });

  console.log("Module 2 added to the database!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
