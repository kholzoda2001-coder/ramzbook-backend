import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  // 1. Create Module 8
  const mod8 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 8: Shopping",
      titleTranslated: "Модули 8: Харид",
      emoji: "🛍",
      order: 8,
      isPremium: false,
    }
  });

  // 2. Create Lessons
  const lessonData = [
    { title: "Lesson 1: Money", titleTranslated: "Дарси 1: Пул", emoji: "💵", type: "vocab", skillType: "vocabulary", order: 1 },
    { title: "Lesson 2: In The Store", titleTranslated: "Дарси 2: Дар мағоза", emoji: "🏪", type: "vocab", skillType: "vocabulary", order: 2 },
    { title: "Lesson 3: Clothes Shopping", titleTranslated: "Дарси 3: Хариди либос", emoji: "👕", type: "vocab", skillType: "vocabulary", order: 3 },
    { title: "Lesson 4: Buying Food", titleTranslated: "Дарси 4: Хариди хӯрокворӣ", emoji: "🍎", type: "vocab", skillType: "vocabulary", order: 4 },
    { title: "Lesson 5: Shopping Language", titleTranslated: "Дарси 5: Забони харид", emoji: "💬", type: "vocab", skillType: "vocabulary", order: 5 },
    { title: "Lesson 6: Shopping Builder", titleTranslated: "Дарси 6: Сохтмони ҷумлаҳо", emoji: "🏗️", type: "grammar", skillType: "grammar", order: 6 },
    { title: "Lesson 7: Store Conversation", titleTranslated: "Дарси 7: Муколама дар мағоза", emoji: "🗣️", type: "dialogue", skillType: "speaking", order: 7 },
    { title: "Lesson 8: Module Review", titleTranslated: "Дарси 8: Такрор", emoji: "🔄", type: "review", skillType: "review", order: 8 },
    { title: "Lesson 9: Final Exam", titleTranslated: "Дарси 9: Имтиҳони ниҳоӣ", emoji: "🏆", type: "test", skillType: "test", order: 9 },
  ];

  const lessons = [];
  for (const ld of lessonData) {
    const l = await prisma.lesson.create({
      data: { moduleId: mod8.id, ...ld }
    });
    lessons.push(l);
  }

  // 3. Insert Vocabulary
  const vocabLists = [
    // L1: Money (12)
    [
      { word: "Money", ipa: "/ˈmʌn.i/", ipaTajik: "Мани", translation: "Пул", emoji: "💵", example: "I have money.", exampleTrans: "Ман пул дорам." },
      { word: "Cash", ipa: "/kæʃ/", ipaTajik: "Кэш", translation: "Пули нақд", emoji: "💰", example: "Do you have cash?", exampleTrans: "Ту пули нақд дорӣ?" },
      { word: "Coin", ipa: "/kɔɪn/", ipaTajik: "Коин", translation: "Танга", emoji: "🪙", example: "This is a coin.", exampleTrans: "Ин танга аст." },
      { word: "Card", ipa: "/kɑːd/", ipaTajik: "Кард", translation: "Корт", emoji: "💳", example: "I pay by card.", exampleTrans: "Ман бо корт пардохт мекунам." },
      { word: "Dollar", ipa: "/ˈdɒl.ər/", ipaTajik: "Долэр", translation: "Доллар", emoji: "💲", example: "It is one dollar.", exampleTrans: "Ин як доллар аст." },
      { word: "Price", ipa: "/praɪs/", ipaTajik: "Прайс", translation: "Нарх", emoji: "🏷", example: "What is the price?", exampleTrans: "Нарх чанд аст?" },
      { word: "Receipt", ipa: "/rɪˈsiːt/", ipaTajik: "Рисит", translation: "Расид / Чек", emoji: "🧾", example: "Here is your receipt.", exampleTrans: "Инак расиди шумо." },
      { word: "Pay", ipa: "/peɪ/", ipaTajik: "Пей", translation: "Пардохт кардан", emoji: "💸", example: "I want to pay.", exampleTrans: "Ман мехоҳам пардохт кунам." },
      { word: "Wallet", ipa: "/ˈwɒl.ɪt/", ipaTajik: "Волит", translation: "Ҳамён", emoji: "👛", example: "My wallet is black.", exampleTrans: "Ҳамёни ман сиёҳ аст." },
      { word: "Change", ipa: "/tʃeɪndʒ/", ipaTajik: "Чейнҷ", translation: "Бақияи пул", emoji: "🪙", example: "Keep the change.", exampleTrans: "Бақияро нигоҳ доред." },
      { word: "Credit Card", ipa: "/ˈkred.ɪt ˌkɑːd/", ipaTajik: "Кредит кард", translation: "Корти кредитӣ", emoji: "💳", example: "Do you take credit cards?", exampleTrans: "Шумо корти кредитӣ қабул мекунед?" },
      { word: "Bank", ipa: "/bæŋk/", ipaTajik: "Бэнк", translation: "Бонк", emoji: "🏦", example: "I go to the bank.", exampleTrans: "Ман ба бонк меравам." }
    ],
    // L2: In The Store (12)
    [
      { word: "Store", ipa: "/stɔːr/", ipaTajik: "Стор", translation: "Мағоза", emoji: "🏪", example: "I am in the store.", exampleTrans: "Ман дар мағоза ҳастам." },
      { word: "Shopping Cart", ipa: "/ˈʃɒp.ɪŋ ˌkɑːt/", ipaTajik: "Шопинг карт", translation: "Аробачаи харид", emoji: "🛒", example: "I need a shopping cart.", exampleTrans: "Ба ман аробачаи харид лозим аст." },
      { word: "Bag", ipa: "/bæɡ/", ipaTajik: "Бэг", translation: "Халта", emoji: "🛍", example: "I have a bag.", exampleTrans: "Ман як халта дорам." },
      { word: "Cashier", ipa: "/kæʃˈɪər/", ipaTajik: "Кэшиэр", translation: "Хазинадор", emoji: "👨‍💻", example: "The cashier is fast.", exampleTrans: "Хазинадор тез кор мекунад." },
      { word: "Product", ipa: "/ˈprɒd.ʌkt/", ipaTajik: "Продакт", translation: "Маҳсулот", emoji: "📦", example: "This is a good product.", exampleTrans: "Ин маҳсулоти хуб аст." },
      { word: "Sale", ipa: "/seɪl/", ipaTajik: "Сейл", translation: "Фурӯш / Тахфиф", emoji: "🏷", example: "The store has a sale.", exampleTrans: "Мағоза тахфиф дорад." },
      { word: "List", ipa: "/lɪst/", ipaTajik: "Лист", translation: "Рӯйхат", emoji: "📋", example: "I have a shopping list.", exampleTrans: "Ман рӯйхати харид дорам." },
      { word: "Entrance", ipa: "/ˈen.trəns/", ipaTajik: "Энтранс", translation: "Даромадгоҳ", emoji: "🚪", example: "Where is the entrance?", exampleTrans: "Даромадгоҳ дар куҷост?" },
      { word: "Exit", ipa: "/ˈek.sɪt/", ipaTajik: "Эксит", translation: "Баромадгоҳ", emoji: "🚪", example: "The exit is there.", exampleTrans: "Баромадгоҳ дар он ҷо аст." },
      { word: "Basket", ipa: "/ˈbɑː.skɪt/", ipaTajik: "Баскит", translation: "Сабад", emoji: "🧺", example: "I carry a basket.", exampleTrans: "Ман сабад мебардорам." },
      { word: "Customer", ipa: "/ˈkʌs.tə.mər/", ipaTajik: "Кастэмер", translation: "Мизоҷ", emoji: "🚶", example: "The customer is waiting.", exampleTrans: "Мизоҷ интизор аст." },
      { word: "Shop Assistant", ipa: "/ˈʃɒp əˌsɪs.tənt/", ipaTajik: "Шоп асистент", translation: "Фурӯшанда", emoji: "💁", example: "The shop assistant helps me.", exampleTrans: "Фурӯшанда ба ман кӯмак мекунад." }
    ],
    // L3: Clothes Shopping (12)
    [
      { word: "T-Shirt", ipa: "/ˈtiː.ʃɜːt/", ipaTajik: "Ти шёрт", translation: "Футболка", emoji: "👕", example: "I want to buy a T-shirt.", exampleTrans: "Ман футболка харидан мехоҳам." },
      { word: "Pants", ipa: "/pænts/", ipaTajik: "Пэнтс", translation: "Шим", emoji: "👖", example: "These pants are nice.", exampleTrans: "Ин шим хуб аст." },
      { word: "Shoes", ipa: "/ʃuːz/", ipaTajik: "Шуз", translation: "Пойафзол", emoji: "👟", example: "I need new shoes.", exampleTrans: "Ман ба пойафзоли нав ниёз дорам." },
      { word: "Jacket", ipa: "/ˈdʒæk.ɪt/", ipaTajik: "Ҷэкит", translation: "Куртаи гарм / Куртка", emoji: "🧥", example: "This jacket is warm.", exampleTrans: "Ин куртка гарм аст." },
      { word: "Socks", ipa: "/sɒks/", ipaTajik: "Сокс", translation: "Ҷӯроб", emoji: "🧦", example: "I buy socks.", exampleTrans: "Ман ҷӯроб мехарам." },
      { word: "Cap", ipa: "/kæp/", ipaTajik: "Кэп", translation: "Кепка", emoji: "🧢", example: "The cap is red.", exampleTrans: "Кепка сурх аст." },
      { word: "Dress", ipa: "/dres/", ipaTajik: "Дрес", translation: "Куртаи занона", emoji: "👗", example: "That dress is beautiful.", exampleTrans: "Он курта зебост." },
      { word: "Backpack", ipa: "/ˈbæk.pæk/", ipaTajik: "Бэкпэк", translation: "Ҷузвдони пушт", emoji: "🎒", example: "My backpack is heavy.", exampleTrans: "Ҷузвдони ман вазнин аст." },
      { word: "Hat", ipa: "/hæt/", ipaTajik: "Ҳэт", translation: "Кулоҳ", emoji: "👒", example: "She wears a hat.", exampleTrans: "Ӯ кулоҳ мепӯшад." },
      { word: "Shirt", ipa: "/ʃɜːt/", ipaTajik: "Шёрт", translation: "Куртаи мардона", emoji: "👔", example: "The shirt is white.", exampleTrans: "Курта сафед аст." },
      { word: "Skirt", ipa: "/skɜːt/", ipaTajik: "Скёрт", translation: "Доман", emoji: "👗", example: "I like this skirt.", exampleTrans: "Ин доман ба ман писанд аст." },
      { word: "Coat", ipa: "/kəʊt/", ipaTajik: "Коут", translation: "Палто", emoji: "🧥", example: "I put on my coat.", exampleTrans: "Ман палтоямро мепӯшам." }
    ],
    // L4: Buying Food (12)
    [
      { word: "Apple", ipa: "/ˈæp.əl/", ipaTajik: "Эпл", translation: "Себ", emoji: "🍎", example: "How many apples?", exampleTrans: "Чанд себ?" },
      { word: "Bread", ipa: "/bred/", ipaTajik: "Бред", translation: "Нон", emoji: "🍞", example: "How much bread?", exampleTrans: "Чӣ қадар нон?" },
      { word: "Milk", ipa: "/mɪlk/", ipaTajik: "Милк", translation: "Шир", emoji: "🥛", example: "I buy milk.", exampleTrans: "Ман шир мехарам." },
      { word: "Egg", ipa: "/eɡ/", ipaTajik: "Эг", translation: "Тухм", emoji: "🥚", example: "Can I have an egg?", exampleTrans: "Метавонам як тухм гирам?" },
      { word: "Chicken", ipa: "/ˈtʃɪk.ɪn/", ipaTajik: "Чикин", translation: "Гӯшти мурғ", emoji: "🍗", example: "I want chicken.", exampleTrans: "Ман гӯшти мурғ мехоҳам." },
      { word: "Juice", ipa: "/dʒuːs/", ipaTajik: "Ҷус", translation: "Афшура", emoji: "🧃", example: "I drink juice.", exampleTrans: "Ман афшура менӯшам." },
      { word: "Quantity", ipa: "/ˈkwɒn.tə.ti/", ipaTajik: "Квонтити", translation: "Миқдор", emoji: "🛒", example: "A large quantity.", exampleTrans: "Миқдори калон." },
      { word: "Package", ipa: "/ˈpæk.ɪdʒ/", ipaTajik: "Пэкиҷ", translation: "Борпеч", emoji: "📦", example: "A package of rice.", exampleTrans: "Як борпеч биринҷ." },
      { word: "Bottle", ipa: "/ˈbɒt.əl/", ipaTajik: "Ботел", translation: "Шиша", emoji: "🍾", example: "A bottle of water.", exampleTrans: "Як шиша об." },
      { word: "Kilo", ipa: "/ˈkiː.ləʊ/", ipaTajik: "Килоу", translation: "Килограмм", emoji: "⚖", example: "Two kilos of meat.", exampleTrans: "Ду кило гӯшт." },
      { word: "Box", ipa: "/bɒks/", ipaTajik: "Бокс", translation: "Қуттӣ", emoji: "🗃", example: "A box of eggs.", exampleTrans: "Як қуттӣ тухм." },
      { word: "Can", ipa: "/kæn/", ipaTajik: "Кэн", translation: "Қуттии тунукагӣ", emoji: "🥫", example: "A can of soda.", exampleTrans: "Як қуттӣ оби газдор." }
    ],
    // L5: Shopping Language (12)
    [
      { word: "Buy", ipa: "/baɪ/", ipaTajik: "Бай", translation: "Харидан", emoji: "🛍", example: "I want to buy this.", exampleTrans: "Ман инро харидан мехоҳам." },
      { word: "Cost", ipa: "/kɒst/", ipaTajik: "Кост", translation: "Арзиш доштан", emoji: "💸", example: "How much does it cost?", exampleTrans: "Ин чанд пул меистад?" },
      { word: "Cheap", ipa: "/tʃiːp/", ipaTajik: "Чип", translation: "Арзон", emoji: "🏷", example: "This is very cheap.", exampleTrans: "Ин хеле арзон аст." },
      { word: "Expensive", ipa: "/ɪkˈspen.sɪv/", ipaTajik: "Икспенсив", translation: "Қимат", emoji: "💎", example: "That phone is expensive.", exampleTrans: "Он телефон қимат аст." },
      { word: "Good", ipa: "/ɡʊd/", ipaTajik: "Гуд", translation: "Хуб", emoji: "👍", example: "This is a good book.", exampleTrans: "Ин китоби хуб аст." },
      { word: "Quality", ipa: "/ˈkwɒl.ə.ti/", ipaTajik: "Кволити", translation: "Сифат", emoji: "⭐", example: "The quality is high.", exampleTrans: "Сифат баланд аст." },
      { word: "Need", ipa: "/niːd/", ipaTajik: "Нид", translation: "Ниёз доштан", emoji: "🎯", example: "I need new shoes.", exampleTrans: "Ман ба пойафзоли нав ниёз дорам." },
      { word: "Want", ipa: "/wɒnt/", ipaTajik: "Вонт", translation: "Хостан", emoji: "❤️", example: "I want to buy a shirt.", exampleTrans: "Ман мехоҳам як курта харам." },
      { word: "Size", ipa: "/saɪz/", ipaTajik: "Сайз", translation: "Андоза", emoji: "📏", example: "What is your size?", exampleTrans: "Андозаи шумо чист?" },
      { word: "Color", ipa: "/ˈkʌl.ər/", ipaTajik: "Калер", translation: "Ранг", emoji: "🎨", example: "I like this color.", exampleTrans: "Ин ранг ба ман писанд аст." },
      { word: "Try on", ipa: "/traɪ ɒn/", ipaTajik: "Трай он", translation: "Пӯшида дидан", emoji: "👕", example: "Can I try this on?", exampleTrans: "Метавонам инро пӯшида бинам?" },
      { word: "Return", ipa: "/rɪˈtɜːn/", ipaTajik: "Ритёрн", translation: "Бозгардонидан", emoji: "🔄", example: "I want to return this.", exampleTrans: "Ман мехоҳам инро бозгардонам." }
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
      title: "This, That, These, Those & How Much/Many",
      titleTranslated: "Ин, Он, Инҳо, Онҳо ва Чанд/Чӣ қадар",
      explanation: "Барои чизҳои наздик This (танҳо) ва These (ҷамъ)-ро истифода баред. Барои чизҳои дур That ва Those.\nHow much is this shirt? (Ин курта чанд пул аст?)\nThese shoes are nice. (Ин пойафзолҳо нағзанд.)\nHow many apples? (Чанд себ?)\nCan I have two apples? (Метавонам ду себ гирам?)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { grammarTopicId: g1.id } });

  // 5. Comprehension for L6 (Shopping Builder)
  const comp1 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Shopping Builder", titleTranslated: "Сохтани ҷумлаҳо", cefrLevel: "A1",
      passage: "I am in the store. This shirt is cheap, but that jacket is expensive. How much is the shirt? It is ten dollars. I want to buy these shoes.",
      passageTranslated: "Ман дар мағоза ҳастам. Ин курта арзон аст, аммо он куртка қимат аст. Курта чанд пул аст? Вай даҳ доллар аст. Ман мехоҳам ин пойафзолҳоро харам.",
      questions: {
        create: [
          { question: "Fill the blank: ___ shirt is cheap.", correctIndex: 0, options: ["This", "These", "Those"], order: 0 },
          { question: "How much is the shirt?", correctIndex: 1, options: ["Five dollars", "Ten dollars", "Twenty dollars"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { comprehensionId: comp1.id } });

  // 6. Dialogue for L7
  const d1 = await prisma.dialogue.create({
    data: {
      courseId: course.id, title: "Store Conversation", titleTranslated: "Муколама дар мағоза", cefrLevel: "A1",
      lines: {
        create: [
          { speaker: "Customer", text: "Hello.", translation: "Салом.", audioUrl: "", order: 0 },
          { speaker: "Cashier", text: "Hello.", translation: "Салом.", audioUrl: "", order: 1 },
          { speaker: "Customer", text: "How much is this shirt?", translation: "Ин курта чанд пул аст?", audioUrl: "", order: 2 },
          { speaker: "Cashier", text: "It is twenty dollars.", translation: "Вай бист доллар аст.", audioUrl: "", order: 3 },
          { speaker: "Customer", text: "Can I buy it?", translation: "Метавонам онро харам?", audioUrl: "", order: 4 },
          { speaker: "Cashier", text: "Yes.", translation: "Бале.", audioUrl: "", order: 5 },
          { speaker: "Customer", text: "Thank you.", translation: "Раҳмат.", audioUrl: "", order: 6 },
          { speaker: "Cashier", text: "You're welcome.", translation: "Меарзад.", audioUrl: "", order: 7 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[6].id }, data: { dialogueId: d1.id } });

  // 7. Comprehension for L8 (Review)
  const comp2 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Module Review", titleTranslated: "Такрори Модул", cefrLevel: "A1",
      passage: "Let's review shopping! I need new clothes. I go to the store with money. I want to buy a red shirt and black pants. I pay the cashier.",
      passageTranslated: "Биёед харидро такрор кунем! Ба ман либосҳои нав лозим аст. Ман бо пул ба мағоза меравам. Ман мехоҳам куртаи сурх ва шими сиёҳ харам. Ман ба хазинадор пулро пардохт мекунам.",
      questions: {
        create: [
          { question: "Where do I go?", correctIndex: 2, options: ["To the bank", "To the hospital", "To the store"], order: 0 },
          { question: "What do I want to buy?", correctIndex: 1, options: ["A blue hat", "A red shirt", "Green shoes"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[7].id }, data: { comprehensionId: comp2.id } });

  // 8. Comprehension for L9 (Final Exam)
  const comp3 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", cefrLevel: "A1",
      passage: "Module 8 Final Exam. Test your knowledge on shopping, prices, and clothes.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 8. Дониши худро оид ба харид, нархҳо ва либосҳо санҷед.",
      questions: {
        create: [
          { question: "Translate 'Ин чанд пул меистад?':", correctIndex: 0, options: ["How much does it cost?", "How many is it?", "Can I buy it?"], order: 0 },
          { question: "Choose correct: I want to buy ___ shoes.", correctIndex: 2, options: ["this", "that", "these"], order: 1 },
          { question: "Translate 'Ман бо корт пардохт мекунам':", correctIndex: 1, options: ["I pay by cash.", "I pay by card.", "I want money."], order: 2 },
          { question: "What is 'Хазинадор' in English?", correctIndex: 0, options: ["Cashier", "Customer", "Manager"], order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[8].id }, data: { comprehensionId: comp3.id } });

  console.log("Module 8 successfully created!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
