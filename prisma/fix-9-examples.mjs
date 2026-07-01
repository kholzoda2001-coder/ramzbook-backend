import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updates = [
    { word: "Bye", example: "Bye, See You Later.", exampleTrans: "Хайр, То Дидор." },
    { word: "You're welcome", example: "You're Welcome.", exampleTrans: "Саломат Бошед / Не Арзад." },
    { word: "OK", example: "OK, Let's Go.", exampleTrans: "Хуб, Биёед Равем." },
    { word: "My", example: "This Is My Book.", exampleTrans: "Ин Китоби Ман Аст." },
    { word: "Your", example: "Is This Your Car?", exampleTrans: "Оё Ин Мошини Шумо Аст?" },
    { word: "Question", example: "I Have A Question.", exampleTrans: "Ман Як Савол Дорам." },
    { word: "Years", example: "I Am 20 Years Old.", exampleTrans: "Ман Бистсола Ҳастам." },
    { word: "Today", example: "Today Is Monday.", exampleTrans: "Имрӯз Душанбе Аст." },
    { word: "Ten", example: "I Have Ten Apples.", exampleTrans: "Ман Даҳ Себ Дорам." }
  ];

  for (const update of updates) {
    await prisma.word.updateMany({
      where: { word: update.word },
      data: { example: update.example, exampleTrans: update.exampleTrans }
    });
  }
  console.log("Fixed 9 missing examples.");
}

main().finally(() => prisma.$disconnect());
