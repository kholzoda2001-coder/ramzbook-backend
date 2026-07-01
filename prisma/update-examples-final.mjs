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

  const updates = [
    // Module 1
    { word: "Hello", example: "Hello, My Name Is Ali.", exampleTrans: "Салом, Номи Ман Алӣ Аст." },
    { word: "Hi", example: "Hi, How Are You?", exampleTrans: "Салом, Шумо Чӣ Хел?" },
    { word: "Good Morning", example: "Good Morning!", exampleTrans: "Субҳ Ба Хайр!" },
    { word: "Goodbye", example: "Goodbye!", exampleTrans: "Хайр!" },
    { word: "Yes", example: "Yes, Please.", exampleTrans: "Бале, Лутфан." },
    { word: "No", example: "No, Thank You.", exampleTrans: "Не, Ташаккур." },

    // Module 2
    { word: "Age", example: "How Old Are You?", exampleTrans: "Шумо Чандсолаед?" },
    { word: "Country", example: "I Am From Tajikistan.", exampleTrans: "Ман Аз Тоҷикистон Ҳастам." },
    { word: "City", example: "I Live In Dushanbe.", exampleTrans: "Ман Дар Душанбе Зиндагӣ Мекунам." },
    { word: "Language", example: "I Speak Tajik.", exampleTrans: "Ман Бо Тоҷикӣ Гап Мезанам." },

    // Module 3
    { word: "Father", example: "This Is My Father.", exampleTrans: "Ин Падари Ман Аст." },
    { word: "Mother", example: "This Is My Mother.", exampleTrans: "Ин Модари Ман Аст." },
    { word: "Brother", example: "He Is My Brother.", exampleTrans: "Ӯ Бародари Ман Аст." },
    { word: "Sister", example: "She Is My Sister.", exampleTrans: "Ӯ Хоҳари Ман Аст." },
    { word: "Man", example: "He Is A Man.", exampleTrans: "Ӯ Мард Аст." },
    { word: "Woman", example: "She Is A Woman.", exampleTrans: "Ӯ Зан Аст." },
    { word: "Tall", example: "He Is Tall.", exampleTrans: "Ӯ Қадбаланд Аст." },
    { word: "Happy", example: "My Friend Is Happy.", exampleTrans: "Дӯсти Ман Хушбахт Аст." },
    { word: "Young", example: "She Is Young.", exampleTrans: "Ӯ Ҷавон Аст." },
    { word: "Birthday", example: "Today Is My Birthday.", exampleTrans: "Имрӯз Зодрӯзи Ман Аст." },

    // Module 4
    { word: "Five", example: "I Am Five Years Old.", exampleTrans: "Ман Панҷсола Ҳастам." },
    { word: "Twenty", example: "I Am Twenty Years Old.", exampleTrans: "Ман Бистсола Ҳастам." },
    { word: "Monday", example: "Today Is Monday.", exampleTrans: "Имрӯз Душанбе Аст." },
    { word: "June", example: "My Birthday Is In June.", exampleTrans: "Зодрӯзи Ман Дар Моҳи Июн Аст." },
    { word: "Time", example: "What Time Is It?", exampleTrans: "Соат Чанд Аст?" },
    { word: "O'Clock", example: "It Is Three O'Clock.", exampleTrans: "Соат Се Аст." }
  ];

  let updateCount = 0;

  for (const update of updates) {
    const res = await prisma.word.updateMany({
      where: {
        word: update.word,
        lesson: {
          module: {
            courseId: course.id
          }
        }
      },
      data: {
        example: update.example,
        exampleTrans: update.exampleTrans
      }
    });
    updateCount += res.count;
    if (res.count > 0) {
      console.log(`Updated word: ${update.word} (Count: ${res.count})`);
    } else {
      console.log(`WARNING: Word not found: ${update.word}`);
    }
  }

  console.log(`Total examples updated: ${updateCount}`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
