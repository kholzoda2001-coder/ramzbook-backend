import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  // 1. Create Module 7
  const mod7 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 7: Home And Objects",
      titleTranslated: "Модули 7: Хона ва Ашёҳо",
      emoji: "🏠",
      order: 7,
      isPremium: false,
    }
  });

  // 2. Create Lessons
  const lessonData = [
    { title: "Lesson 1: Rooms In A House", titleTranslated: "Дарси 1: Ҳуҷраҳои хона", emoji: "🚪", type: "vocab", skillType: "vocabulary", order: 1 },
    { title: "Lesson 2: Furniture", titleTranslated: "Дарси 2: Мебел", emoji: "🛋", type: "vocab", skillType: "vocabulary", order: 2 },
    { title: "Lesson 3: Household Objects", titleTranslated: "Дарси 3: Ашёҳои рӯзмарра", emoji: "📱", type: "vocab", skillType: "vocabulary", order: 3 },
    { title: "Lesson 4: Places And Positions", titleTranslated: "Дарси 4: Ҷойҳо ва Мавқеъҳо", emoji: "📍", type: "vocab", skillType: "vocabulary", order: 4 },
    { title: "Lesson 5: My Home", titleTranslated: "Дарси 5: Хонаи ман", emoji: "🏡", type: "vocab", skillType: "vocabulary", order: 5 },
    { title: "Lesson 6: Home Builder", titleTranslated: "Дарси 6: Сохтмони хона", emoji: "🏗️", type: "grammar", skillType: "grammar", order: 6 },
    { title: "Lesson 7: Home Conversation", titleTranslated: "Дарси 7: Муколамаи хона", emoji: "🗣️", type: "dialogue", skillType: "speaking", order: 7 },
    { title: "Lesson 8: Module Review", titleTranslated: "Дарси 8: Такрор", emoji: "🔄", type: "review", skillType: "review", order: 8 },
    { title: "Lesson 9: Final Exam", titleTranslated: "Дарси 9: Имтиҳони ниҳоӣ", emoji: "🏆", type: "test", skillType: "test", order: 9 },
  ];

  const lessons = [];
  for (const ld of lessonData) {
    const l = await prisma.lesson.create({
      data: { moduleId: mod7.id, ...ld }
    });
    lessons.push(l);
  }

  // 3. Insert Vocabulary
  const vocabLists = [
    // L1: Rooms In A House (10)
    [
      { word: "House", ipa: "/haʊs/", ipaTajik: "Ҳаус", translation: "Хона", emoji: "🏠", example: "This is my house.", exampleTrans: "Ин хонаи ман аст." },
      { word: "Room", ipa: "/ruːm/", ipaTajik: "Рум", translation: "Ҳуҷра", emoji: "🚪", example: "This is my room.", exampleTrans: "Ин ҳуҷраи ман аст." },
      { word: "Bedroom", ipa: "/ˈbed.ruːm/", ipaTajik: "Бедрум", translation: "Ҳуҷраи хоб", emoji: "🛏", example: "My bedroom is big.", exampleTrans: "Ҳуҷраи хоби ман калон аст." },
      { word: "Kitchen", ipa: "/ˈkɪtʃ.ən/", ipaTajik: "Китчен", translation: "Ошхона", emoji: "🍳", example: "I cook in the kitchen.", exampleTrans: "Ман дар ошхона хӯрок мепазам." },
      { word: "Living Room", ipa: "/ˈlɪv.ɪŋ ˌruːm/", ipaTajik: "Ливинг рум", translation: "Меҳмонхона", emoji: "🛋", example: "We watch TV in the living room.", exampleTrans: "Мо дар меҳмонхона телевизор тамошо мекунем." },
      { word: "Bathroom", ipa: "/ˈbɑːθ.ruːm/", ipaTajik: "Басрум", translation: "Ҳаммом", emoji: "🚿", example: "The bathroom is clean.", exampleTrans: "Ҳаммом тоза аст." },
      { word: "Apartment", ipa: "/əˈpɑːt.mənt/", ipaTajik: "Апартмент", translation: "Квартира", emoji: "🏢", example: "I live in an apartment.", exampleTrans: "Ман дар квартира зиндагӣ мекунам." },
      { word: "Home", ipa: "/həʊm/", ipaTajik: "Ҳоум", translation: "Хона / Ватан", emoji: "🏡", example: "I go home.", exampleTrans: "Ман ба хона меравам." },
      { word: "Dining Room", ipa: "/ˈdaɪ.nɪŋ ˌruːm/", ipaTajik: "Дайнинг рум", translation: "Ошхонаи хӯрокхӯрӣ", emoji: "🍽", example: "We eat in the dining room.", exampleTrans: "Мо дар ошхонаи хӯрокхӯрӣ хӯрок мехӯрем." },
      { word: "Hallway", ipa: "/ˈhɔːl.weɪ/", ipaTajik: "Ҳолвей", translation: "Роҳрав", emoji: "🚶", example: "The hallway is long.", exampleTrans: "Роҳрав дароз аст." }
    ],
    // L2: Furniture (10)
    [
      { word: "Bed", ipa: "/bed/", ipaTajik: "Бед", translation: "Бистар / Кат", emoji: "🛏", example: "There is a bed in my room.", exampleTrans: "Дар ҳуҷраи ман як бистар ҳаст." },
      { word: "Chair", ipa: "/tʃeər/", ipaTajik: "Чейр", translation: "Курсӣ", emoji: "🪑", example: "I sit on a chair.", exampleTrans: "Ман дар болои курсӣ мешинам." },
      { word: "Sofa", ipa: "/ˈsəʊ.fə/", ipaTajik: "Софа", translation: "Диван", emoji: "🛋", example: "The sofa is soft.", exampleTrans: "Диван мулоим аст." },
      { word: "Television", ipa: "/ˈtel.ɪ.vɪʒ.ən/", ipaTajik: "Телевижн", translation: "Телевизор", emoji: "📺", example: "I turn on the television.", exampleTrans: "Ман телевизорро дармегиронам." },
      { word: "Window", ipa: "/ˈwɪn.dəʊ/", ipaTajik: "Виндоу", translation: "Тиреза", emoji: "🪟", example: "Open the window.", exampleTrans: "Тирезаро кушо." },
      { word: "Door", ipa: "/dɔːr/", ipaTajik: "Дор", translation: "Дар", emoji: "🚪", example: "Close the door.", exampleTrans: "Дарро пӯш." },
      { word: "Mirror", ipa: "/ˈmɪr.ər/", ipaTajik: "Мирор", translation: "Оина", emoji: "🪞", example: "I look in the mirror.", exampleTrans: "Ман ба оина нигоҳ мекунам." },
      { word: "Shelf", ipa: "/ʃelf/", ipaTajik: "Шелф", translation: "Раф", emoji: "🧸", example: "The book is on the shelf.", exampleTrans: "Китоб дар болои раф аст." },
      { word: "Table", ipa: "/ˈteɪ.bəl/", ipaTajik: "Тейбл", translation: "Миз", emoji: "🪵", example: "The food is on the table.", exampleTrans: "Хӯрок дар болои миз аст." },
      { word: "Wardrobe", ipa: "/ˈwɔː.drəʊb/", ipaTajik: "Вордроуб", translation: "Ҷевони либос", emoji: "🗄", example: "My clothes are in the wardrobe.", exampleTrans: "Либосҳои ман дар ҷевон ҳастанд." }
    ],
    // L3: Household Objects (10)
    [
      { word: "Book", ipa: "/bʊk/", ipaTajik: "Бук", translation: "Китоб", emoji: "📚", example: "There is a book on the table.", exampleTrans: "Дар болои миз як китоб ҳаст." },
      { word: "Lamp", ipa: "/læmp/", ipaTajik: "Лэмп", translation: "Чароғ", emoji: "💡", example: "Turn on the lamp.", exampleTrans: "Чароғро даргирон." },
      { word: "Computer", ipa: "/kəmˈpjuː.tər/", ipaTajik: "Компютер", translation: "Компютер", emoji: "🖥", example: "I use a computer.", exampleTrans: "Ман компютер истифода мебарам." },
      { word: "Phone", ipa: "/fəʊn/", ipaTajik: "Фоун", translation: "Телефон", emoji: "📱", example: "This is my phone.", exampleTrans: "Ин телефони ман аст." },
      { word: "Clock", ipa: "/klɒk/", ipaTajik: "Клок", translation: "Соат", emoji: "⌚", example: "The clock is on the wall.", exampleTrans: "Соат дар девор аст." },
      { word: "Bag", ipa: "/bæɡ/", ipaTajik: "Бэг", translation: "Халта / Ҷузвдон", emoji: "🎒", example: "My bag is heavy.", exampleTrans: "Халтаи ман вазнин аст." },
      { word: "Pen", ipa: "/pen/", ipaTajik: "Пен", translation: "Қалам / Ручка", emoji: "🖊", example: "I have a pen.", exampleTrans: "Ман як қалам дорам." },
      { word: "Notebook", ipa: "/ˈnəʊt.bʊk/", ipaTajik: "Ноутбук", translation: "Дафтар", emoji: "📖", example: "I write in my notebook.", exampleTrans: "Ман дар дафтарам менависам." },
      { word: "Pencil", ipa: "/ˈpen.səl/", ipaTajik: "Пенсил", translation: "Қалами сиёҳ", emoji: "✏", example: "I need a pencil.", exampleTrans: "Ба ман қалами сиёҳ лозим аст." },
      { word: "Desk", ipa: "/desk/", ipaTajik: "Деск", translation: "Мизи корӣ", emoji: "🪑", example: "I sit at my desk.", exampleTrans: "Ман дар назди мизи кориям мешинам." }
    ],
    // L4: Places And Positions (10)
    [
      { word: "On", ipa: "/ɒn/", ipaTajik: "Он", translation: "Дар болои", emoji: "⬆", example: "The book is on the table.", exampleTrans: "Китоб дар болои миз аст." },
      { word: "Under", ipa: "/ˈʌn.dər/", ipaTajik: "Андер", translation: "Дар зери", emoji: "⬇", example: "The bag is under the chair.", exampleTrans: "Халта дар зери курсӣ аст." },
      { word: "In", ipa: "/ɪn/", ipaTajik: "Ин", translation: "Дар дохили", emoji: "📍", example: "The pen is in the bag.", exampleTrans: "Қалам дар дохили халта аст." },
      { word: "Next To", ipa: "/nekst tuː/", ipaTajik: "Некст ту", translation: "Дар паҳлӯи", emoji: "➡", example: "The chair is next to the table.", exampleTrans: "Курсӣ дар паҳлӯи миз аст." },
      { word: "Between", ipa: "/bɪˈtwiːn/", ipaTajik: "Битвин", translation: "Дар байни", emoji: "↔", example: "I sit between Ali and Umar.", exampleTrans: "Ман дар байни Алӣ ва Умар мешинам." },
      { word: "Above", ipa: "/əˈbʌv/", ipaTajik: "Абав", translation: "Дар болои / баландтар аз", emoji: "🔝", example: "The picture is above the sofa.", exampleTrans: "Расм дар болои диван аст." },
      { word: "Below", ipa: "/bɪˈləʊ/", ipaTajik: "Билоу", translation: "Дар поёни / пасттар аз", emoji: "🔽", example: "The box is below the window.", exampleTrans: "Қуттӣ дар поёни тиреза аст." },
      { word: "Near", ipa: "/nɪər/", ipaTajik: "Ниэр", translation: "Дар наздикии", emoji: "📌", example: "The house is near the school.", exampleTrans: "Хона дар наздикии мактаб аст." },
      { word: "Behind", ipa: "/bɪˈhaɪnd/", ipaTajik: "Биҳайнд", translation: "Дар паси", emoji: "🔙", example: "The cat is behind the door.", exampleTrans: "Гурба дар паси дар аст." },
      { word: "In front of", ipa: "/ɪn frʌnt əv/", ipaTajik: "Ин франт ов", translation: "Дар пеши", emoji: "🔜", example: "The car is in front of the house.", exampleTrans: "Мошин дар пеши хона аст." }
    ],
    // L5: My Home (8)
    [
      { word: "Clean", ipa: "/kliːn/", ipaTajik: "Клин", translation: "Тоза", emoji: "🧹", example: "My home is clean.", exampleTrans: "Хонаи ман тоза аст." },
      { word: "Dirty", ipa: "/ˈdɜː.ti/", ipaTajik: "Дёти", translation: "Ифлос", emoji: "🗑", example: "The shoes are dirty.", exampleTrans: "Пойафзолҳо ифлос ҳастанд." },
      { word: "Key", ipa: "/kiː/", ipaTajik: "Кии", translation: "Калид", emoji: "🔑", example: "I have a key.", exampleTrans: "Ман як калид дорам." },
      { word: "Closet", ipa: "/ˈklɒz.ɪt/", ipaTajik: "Клозит", translation: "Ҷевон", emoji: "🛒", example: "My clothes are in the closet.", exampleTrans: "Либосҳои ман дар ҷевон ҳастанд." },
      { word: "Picture", ipa: "/ˈpɪk.tʃər/", ipaTajik: "Пикчер", translation: "Расм", emoji: "🖼", example: "This is a beautiful picture.", exampleTrans: "Ин расми зебо аст." },
      { word: "Plant", ipa: "/plɑːnt/", ipaTajik: "Плэнт", translation: "Растанӣ", emoji: "🌼", example: "There are plants in my home.", exampleTrans: "Дар хонаи ман растаниҳо ҳастанд." },
      { word: "Garden", ipa: "/ˈɡɑː.dən/", ipaTajik: "Гарден", translation: "Боғ", emoji: "🌳", example: "We have a big garden.", exampleTrans: "Мо як боғи калон дорем." },
      { word: "Garage", ipa: "/ˈɡær.ɑːʒ/", ipaTajik: "Гараж", translation: "Гараж", emoji: "🚗", example: "The car is in the garage.", exampleTrans: "Мошин дар дохили гараж аст." }
    ]
  ];

  for (let i = 0; i < 5; i++) {
    const list = vocabLists[i];
    const lesson = lessons[i];
    for (let j = 0; j < list.length; j++) {
      await prisma.word.create({
        data: {
          lessonId: lesson.id,
          order: j + 1,
          ...list[j]
        }
      });
    }
  }

  // 4. Grammar Topic for L6
  const g1 = await prisma.grammarTopic.create({
    data: {
      courseId: course.id,
      title: "There Is / There Are",
      titleTranslated: "Ҳаст / Вуҷуд дорад",
      explanation: "Барои нишон додани мавҷудияти чизе дар ҷое мо There is (барои танҳо) ва There are (барои ҷамъ) истифода мебарем.\nThere is a bed in my room. (Дар ҳуҷраи ман як бистар ҳаст.)\nThere are two chairs in the kitchen. (Дар ошхона ду курсӣ ҳаст.)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { grammarTopicId: g1.id } });

  // 5. Comprehension for L6 (Home Builder)
  const comp1 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Home Builder", titleTranslated: "Сохтани хона", cefrLevel: "A1",
      passage: "My house is big. There is a living room, a kitchen, and a bathroom. There are two bedrooms. In my bedroom, there is a bed and a desk.",
      passageTranslated: "Хонаи ман калон аст. Як меҳмонхона, як ошхона ва як ҳаммом ҳаст. Ду ҳуҷраи хоб ҳаст. Дар ҳуҷраи хоби ман, як бистар ва як мизи корӣ ҳаст.",
      questions: {
        create: [
          { question: "How many bedrooms are there?", correctIndex: 1, options: ["One", "Two", "Three"], order: 0 },
          { question: "Fill the blank: ___ a bed in my room.", correctIndex: 0, options: ["There is", "There are", "This is"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { comprehensionId: comp1.id } });

  // 6. Dialogue for L7
  const d1 = await prisma.dialogue.create({
    data: {
      courseId: course.id, title: "Home Conversation", titleTranslated: "Муколамаи хона", cefrLevel: "A1",
      lines: {
        create: [
          { speaker: "A", text: "Where is the book?", translation: "Китоб дар куҷост?", audioUrl: "", order: 0 },
          { speaker: "B", text: "It is on the table.", translation: "Он дар болои миз аст.", audioUrl: "", order: 1 },
          { speaker: "A", text: "Is there a television in the living room?", translation: "Оё дар меҳмонхона телевизор ҳаст?", audioUrl: "", order: 2 },
          { speaker: "B", text: "Yes, there is.", translation: "Бале, ҳаст.", audioUrl: "", order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[6].id }, data: { dialogueId: d1.id } });

  // 7. Comprehension for L8 (Review)
  const comp2 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Module Review", titleTranslated: "Такрори Модул", cefrLevel: "A1",
      passage: "Let's review Home and Objects! The book is on the table. The bag is under the chair. There is a television in the living room.",
      passageTranslated: "Биёед Хона ва Ашёҳоро такрор кунем! Китоб дар болои миз аст. Халта дар зери курсӣ аст. Дар меҳмонхона як телевизор ҳаст.",
      questions: {
        create: [
          { question: "Where is the book?", correctIndex: 2, options: ["Under the chair", "In the bag", "On the table"], order: 0 },
          { question: "Where is the bag?", correctIndex: 1, options: ["On the table", "Under the chair", "Next to the door"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[7].id }, data: { comprehensionId: comp2.id } });

  // 8. Comprehension for L9 (Final Exam)
  const comp3 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", cefrLevel: "A1",
      passage: "Module 7 Final Exam. Test your knowledge on rooms, objects, and There Is / There Are.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 7. Дониши худро оид ба ҳуҷраҳо, ашёҳо ва There Is / There Are санҷед.",
      questions: {
        create: [
          { question: "Translate 'Хонаи ман тоза аст':", correctIndex: 0, options: ["My home is clean.", "My home is dirty.", "This is my home."], order: 0 },
          { question: "Choose correct: ___ two chairs in the kitchen.", correctIndex: 1, options: ["There is", "There are", "They are"], order: 1 },
          { question: "Translate 'Дар болои миз':", correctIndex: 2, options: ["Under the table", "In the table", "On the table"], order: 2 },
          { question: "What is 'Ошхона' in English?", correctIndex: 2, options: ["Bathroom", "Bedroom", "Kitchen"], order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[8].id }, data: { comprehensionId: comp3.id } });

  console.log("Module 7 successfully created!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
