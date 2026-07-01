import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const updates = [
    { word: "Bye", example: "Bye, see you later.", exampleTrans: "Хайр, то дидор." },
    { word: "You're welcome", example: "Thank you! You're welcome.", exampleTrans: "Раҳмат! Меарзад." },
    { word: "OK", example: "OK, let's go.", exampleTrans: "Хуб, биёед равем." },
    { word: "My", example: "This is my book.", exampleTrans: "Ин китоби ман аст." },
    { word: "Your", example: "What is your name?", exampleTrans: "Номи ту чист?" },
    { word: "Question", example: "I have a question.", exampleTrans: "Ман як савол дорам." },
    { word: "Years", example: "I am ten years old.", exampleTrans: "Ман даҳсола ҳастам." },
    { word: "Today", example: "Today is a good day.", exampleTrans: "Имрӯз рӯзи хуб аст." },
    { word: "Ten", example: "I have ten books.", exampleTrans: "Ман даҳ китоб дорам." }
  ];

  for (const u of updates) {
    // Find the word that has no example sentence yet
    const w = await prisma.word.findFirst({
      where: {
        word: u.word,
        OR: [
          { example: null },
          { example: "" }
        ]
      }
    });

    if (w) {
      await prisma.word.update({
        where: { id: w.id },
        data: { example: u.example, exampleTrans: u.exampleTrans }
      });
      console.log(`Updated: ${u.word}`);
    } else {
      console.log(`Not found or already has example: ${u.word}`);
    }
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
