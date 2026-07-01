import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  // 1. Create Module 6
  const mod6 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 6: Food And Drinks",
      titleTranslated: "Модули 6: Хӯрок ва Нӯшокиҳо",
      emoji: "🍔",
      order: 6,
      isPremium: false,
    }
  });

  // 2. Create Lessons
  const lessonData = [
    { title: "Lesson 1: Fruits", titleTranslated: "Дарси 1: Меваҳо", emoji: "🍎", type: "vocab", skillType: "vocabulary", order: 1 },
    { title: "Lesson 2: Vegetables", titleTranslated: "Дарси 2: Сабзавот", emoji: "🥕", type: "vocab", skillType: "vocabulary", order: 2 },
    { title: "Lesson 3: Drinks", titleTranslated: "Дарси 3: Нӯшокиҳо", emoji: "💧", type: "vocab", skillType: "vocabulary", order: 3 },
    { title: "Lesson 4: Food", titleTranslated: "Дарси 4: Хӯрок", emoji: "🍞", type: "vocab", skillType: "vocabulary", order: 4 },
    { title: "Lesson 5: Meals", titleTranslated: "Дарси 5: Вақтҳои хӯрок", emoji: "🍽", type: "vocab", skillType: "vocabulary", order: 5 },
    { title: "Lesson 6: Food Builder", titleTranslated: "Дарси 6: Сохтмони ҷумлаҳо", emoji: "🏗️", type: "grammar", skillType: "grammar", order: 6 },
    { title: "Lesson 7: Restaurant Conversation", titleTranslated: "Дарси 7: Муколама дар тарабхона", emoji: "🗣️", type: "dialogue", skillType: "speaking", order: 7 },
    { title: "Lesson 8: Module Review", titleTranslated: "Дарси 8: Такрор", emoji: "🔄", type: "review", skillType: "review", order: 8 },
    { title: "Lesson 9: Final Exam", titleTranslated: "Дарси 9: Имтиҳони ниҳоӣ", emoji: "🏆", type: "test", skillType: "test", order: 9 },
  ];

  const lessons = [];
  for (const ld of lessonData) {
    const l = await prisma.lesson.create({
      data: { moduleId: mod6.id, ...ld }
    });
    lessons.push(l);
  }

  // 3. Insert Vocabulary
  const vocabLists = [
    // L1: Fruits (10)
    [
      { word: "Apple", ipa: "/ˈæp.əl/", ipaTajik: "Эпл", translation: "Себ", emoji: "🍎", example: "I like apples.", exampleTrans: "Ман себро нағз мебинам." },
      { word: "Banana", ipa: "/bəˈnɑː.nə/", ipaTajik: "Банана", translation: "Банан", emoji: "🍌", example: "Do you like bananas?", exampleTrans: "Оё ту бананро нағз мебинӣ?" },
      { word: "Orange", ipa: "/ˈɒr.ɪndʒ/", ipaTajik: "Оринҷ", translation: "Афлесун", emoji: "🍊", example: "I eat an orange.", exampleTrans: "Ман як афлесун мехӯрам." },
      { word: "Grapes", ipa: "/ɡreɪps/", ipaTajik: "Грейпс", translation: "Ангур", emoji: "🍇", example: "I want grapes.", exampleTrans: "Ман ангур мехоҳам." },
      { word: "Watermelon", ipa: "/ˈwɔː.təˌmel.ən/", ipaTajik: "Вотермелон", translation: "Тарбуз", emoji: "🍉", example: "Watermelon is sweet.", exampleTrans: "Тарбуз ширин аст." },
      { word: "Strawberry", ipa: "/ˈstrɔː.bər.i/", ipaTajik: "Стробери", translation: "Қулфинай", emoji: "🍓", example: "I love strawberry.", exampleTrans: "Ман қулфинайро дӯст медорам." },
      { word: "Mango", ipa: "/ˈmæŋ.ɡəʊ/", ipaTajik: "Манго", translation: "Манго", emoji: "🥭", example: "This is a mango.", exampleTrans: "Ин манго аст." },
      { word: "Pineapple", ipa: "/ˈpaɪnˌæp.əl/", ipaTajik: "Пайнэпл", translation: "Ананас", emoji: "🍍", example: "I eat pineapple.", exampleTrans: "Ман ананас мехӯрам." },
      { word: "Peach", ipa: "/piːtʃ/", ipaTajik: "Пич", translation: "Шафтолу", emoji: "🍑", example: "Do you like peaches?", exampleTrans: "Оё шафтолу ба ту писанд аст?" },
      { word: "Lemon", ipa: "/ˈlem.ən/", ipaTajik: "Лемон", translation: "Лимӯ", emoji: "🍋", example: "Lemon is sour.", exampleTrans: "Лимӯ турш аст." }
    ],
    // L2: Vegetables (10)
    [
      { word: "Potato", ipa: "/pəˈteɪ.təʊ/", ipaTajik: "Потейто", translation: "Картошка", emoji: "🥔", example: "I eat potatoes.", exampleTrans: "Ман картошка мехӯрам." },
      { word: "Tomato", ipa: "/təˈmɑː.təʊ/", ipaTajik: "Томато", translation: "Помидор", emoji: "🍅", example: "I like tomatoes.", exampleTrans: "Ман помидорро нағз мебинам." },
      { word: "Carrot", ipa: "/ˈkær.ət/", ipaTajik: "Кэрот", translation: "Сабзӣ", emoji: "🥕", example: "I eat a carrot.", exampleTrans: "Ман сабзӣ мехӯрам." },
      { word: "Onion", ipa: "/ˈʌn.jən/", ipaTajik: "Анян", translation: "Пиёз", emoji: "🧅", example: "I don't like onions.", exampleTrans: "Ман пиёзро нағз намебинам." },
      { word: "Cucumber", ipa: "/ˈkjuː.kʌm.bər/", ipaTajik: "Кюкамбер", translation: "Бодиринг", emoji: "🥒", example: "I have a cucumber.", exampleTrans: "Ман бодиринг дорам." },
      { word: "Lettuce", ipa: "/ˈlet.ɪs/", ipaTajik: "Летис", translation: "Коҳу", emoji: "🥬", example: "I eat lettuce.", exampleTrans: "Ман коҳу мехӯрам." },
      { word: "Corn", ipa: "/kɔːn/", ipaTajik: "Корн", translation: "Ҷуворимакка", emoji: "🌽", example: "Do you like corn?", exampleTrans: "Ту ҷуворимаккаро дӯст медорӣ?" },
      { word: "Pepper", ipa: "/ˈpep.ər/", ipaTajik: "Пепер", translation: "Қаламфур", emoji: "🫑", example: "I want pepper.", exampleTrans: "Ман қаламфур мехоҳам." },
      { word: "Garlic", ipa: "/ˈɡɑː.lɪk/", ipaTajik: "Гарлик", translation: "Сирпиёз", emoji: "🧄", example: "I like garlic.", exampleTrans: "Ман сирпиёзро нағз мебинам." },
      { word: "Cabbage", ipa: "/ˈkæb.ɪdʒ/", ipaTajik: "Кэбиҷ", translation: "Карам", emoji: "🥦", example: "I cook cabbage.", exampleTrans: "Ман карам мепазам." }
    ],
    // L3: Drinks (10)
    [
      { word: "Water", ipa: "/ˈwɔː.tər/", ipaTajik: "Вотер", translation: "Об", emoji: "💧", example: "I drink water.", exampleTrans: "Ман об менӯшам." },
      { word: "Milk", ipa: "/mɪlk/", ipaTajik: "Милк", translation: "Шир", emoji: "🥛", example: "I want milk.", exampleTrans: "Ман шир мехоҳам." },
      { word: "Coffee", ipa: "/ˈkɒf.i/", ipaTajik: "Кофи", translation: "Қаҳва", emoji: "☕", example: "Do you drink coffee?", exampleTrans: "Ту қаҳва менӯшӣ?" },
      { word: "Tea", ipa: "/tiː/", ipaTajik: "Тии", translation: "Чой", emoji: "🍵", example: "I drink tea.", exampleTrans: "Ман чой менӯшам." },
      { word: "Juice", ipa: "/dʒuːs/", ipaTajik: "Ҷус", translation: "Афшура", emoji: "🧃", example: "I want juice.", exampleTrans: "Ман афшура мехоҳам." },
      { word: "Soda", ipa: "/ˈsəʊ.də/", ipaTajik: "Сода", translation: "Оби газдор", emoji: "🥤", example: "I don't drink soda.", exampleTrans: "Ман оби газдор наменӯшам." },
      { word: "Lemonade", ipa: "/ˌlem.əˈneɪd/", ipaTajik: "Лемонейд", translation: "Лимонад", emoji: "🍋", example: "Lemonade is good.", exampleTrans: "Лимонад нағз аст." },
      { word: "Drink", ipa: "/drɪŋk/", ipaTajik: "Дринк", translation: "Нӯшидан / Нӯшокӣ", emoji: "🧋", example: "I drink everyday.", exampleTrans: "Ман ҳар рӯз менӯшам." },
      { word: "Ice", ipa: "/aɪs/", ipaTajik: "Айс", translation: "Ях", emoji: "🧊", example: "I want ice.", exampleTrans: "Ман ях мехоҳам." },
      { word: "Hot Chocolate", ipa: "/hɒt ˈtʃɒk.lət/", ipaTajik: "Ҳот чоклет", translation: "Шоколади гарм", emoji: "☕", example: "I like hot chocolate.", exampleTrans: "Шоколади гарм ба ман писанд аст." }
    ],
    // L4: Food (10)
    [
      { word: "Bread", ipa: "/bred/", ipaTajik: "Бред", translation: "Нон", emoji: "🍞", example: "I eat bread.", exampleTrans: "Ман нон мехӯрам." },
      { word: "Rice", ipa: "/raɪs/", ipaTajik: "Райс", translation: "Биринҷ", emoji: "🍚", example: "I like rice.", exampleTrans: "Биринҷ ба ман писанд аст." },
      { word: "Chicken", ipa: "/ˈtʃɪk.ɪn/", ipaTajik: "Чикин", translation: "Гӯшти мурғ", emoji: "🍗", example: "I cook chicken.", exampleTrans: "Ман гӯшти мурғ мепазам." },
      { word: "Egg", ipa: "/eɡ/", ipaTajik: "Эг", translation: "Тухм", emoji: "🥚", example: "I eat an egg.", exampleTrans: "Ман тухм мехӯрам." },
      { word: "Cheese", ipa: "/tʃiːz/", ipaTajik: "Чиз", translation: "Панир", emoji: "🧀", example: "Do you like cheese?", exampleTrans: "Ту панирро нағз мебинӣ?" },
      { word: "Meat", ipa: "/miːt/", ipaTajik: "Мит", translation: "Гӯшт", emoji: "🍖", example: "I don't eat meat.", exampleTrans: "Ман гӯшт намехӯрам." },
      { word: "Fish", ipa: "/fɪʃ/", ipaTajik: "Фиш", translation: "Моҳӣ", emoji: "🐟", example: "I want fish.", exampleTrans: "Ман моҳӣ мехоҳам." },
      { word: "Soup", ipa: "/suːp/", ipaTajik: "Суп", translation: "Шӯрбо", emoji: "🍜", example: "I drink soup.", exampleTrans: "Ман шӯрбо менӯшам." },
      { word: "Butter", ipa: "/ˈbʌt.ər/", ipaTajik: "Батер", translation: "Равғани маска", emoji: "🧈", example: "I like butter.", exampleTrans: "Маска ба ман писанд аст." },
      { word: "Pasta", ipa: "/ˈpæs.tə/", ipaTajik: "Паста", translation: "Макарон", emoji: "🍝", example: "I cook pasta.", exampleTrans: "Ман макарон мепазам." }
    ],
    // L5: Meals (8)
    [
      { word: "Breakfast", ipa: "/ˈbrek.fəst/", ipaTajik: "Брекфаст", translation: "Наҳорӣ", emoji: "🍳", example: "I eat breakfast.", exampleTrans: "Ман наҳорӣ мехӯрам." },
      { word: "Lunch", ipa: "/lʌntʃ/", ipaTajik: "Ланч", translation: "Хӯроки нисфирӯзӣ", emoji: "🍽", example: "I eat lunch.", exampleTrans: "Ман хӯроки нисфирӯзӣ мехӯрам." },
      { word: "Dinner", ipa: "/ˈdɪn.ər/", ipaTajik: "Динэр", translation: "Хӯроки шом", emoji: "🌙", example: "I cook dinner.", exampleTrans: "Ман хӯроки шом мепазам." },
      { word: "Meal", ipa: "/mɪəl/", ipaTajik: "Мил", translation: "Хӯрок", emoji: "🍴", example: "A big meal.", exampleTrans: "Хӯроки калон." },
      { word: "Hungry", ipa: "/ˈhʌŋ.ɡri/", ipaTajik: "Ҳангри", translation: "Гурусна", emoji: "😋", example: "I am hungry.", exampleTrans: "Ман гуруснаам." },
      { word: "Full", ipa: "/fʊl/", ipaTajik: "Фул", translation: "Сер", emoji: "😊", example: "I am full.", exampleTrans: "Ман серам." },
      { word: "Thirsty", ipa: "/ˈθɜː.sti/", ipaTajik: "Тёрсти", translation: "Ташна", emoji: "🥵", example: "I am thirsty.", exampleTrans: "Ман ташнаам." },
      { word: "Snack", ipa: "/snæk/", ipaTajik: "Снэк", translation: "Ғизои сабук", emoji: "🥨", example: "I want a snack.", exampleTrans: "Ман ғизои сабук мехоҳам." }
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
      title: "Countable, Uncountable, Some & Any",
      titleTranslated: "Шуморидашаванда, Some ва Any",
      explanation: "Барои чизҳои шумориданашаванда ё номаълум мо Some (барои ҷумлаи тасдиқӣ) ва Any (барои саволӣ ва инкорӣ) истифода мебарем.\nI have some bread. (Ман каме нон дорам.)\nDo you have any water? (Оё ягон об доред?)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { grammarTopicId: g1.id } });

  // 5. Comprehension for L6 (Food Builder)
  const comp1 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Food Builder", titleTranslated: "Сохтани ҷумлаҳо", cefrLevel: "A1",
      passage: "I am hungry. I have some bread and cheese. Do you have any water? No, I don't have any water, but I have some juice.",
      passageTranslated: "Ман гуруснаам. Ман каме нон ва панир дорам. Оё ту ягон об дорӣ? Не, ман ягон об надорам, аммо ман каме афшура дорам.",
      questions: {
        create: [
          { question: "Fill the blank: I have ___ bread.", correctIndex: 1, options: ["any", "some", "a"], order: 0 },
          { question: "Fill the blank: Do you have ___ water?", correctIndex: 2, options: ["some", "a", "any"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { comprehensionId: comp1.id } });

  // 6. Dialogue for L7
  const d1 = await prisma.dialogue.create({
    data: {
      courseId: course.id, title: "At the Restaurant", titleTranslated: "Дар тарабхона", cefrLevel: "A1",
      lines: {
        create: [
          { speaker: "Customer", text: "Hello.", translation: "Салом.", audioUrl: "", order: 0 },
          { speaker: "Waiter", text: "Hello.", translation: "Салом.", audioUrl: "", order: 1 },
          { speaker: "Customer", text: "Can I have some water please?", translation: "Метавонам каме об гирам, лутфан?", audioUrl: "", order: 2 },
          { speaker: "Waiter", text: "Yes.", translation: "Бале.", audioUrl: "", order: 3 },
          { speaker: "Customer", text: "I would like rice and chicken.", translation: "Ман биринҷ ва гӯшти мурғ мехостам.", audioUrl: "", order: 4 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[6].id }, data: { dialogueId: d1.id } });

  // 7. Comprehension for L8 (Review)
  const comp2 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Module Review", titleTranslated: "Такрори Модул", cefrLevel: "A1",
      passage: "Let's review Food and Drinks! I eat breakfast in the morning. I like fruit and milk. For lunch, I eat chicken and rice.",
      passageTranslated: "Биёед Хӯрок ва Нӯшокиҳоро такрор кунем! Ман саҳар наҳорӣ мехӯрам. Ман мева ва ширро нағз мебинам. Барои хӯроки нисфирӯзӣ ман гӯшти мурғ ва биринҷ мехӯрам.",
      questions: {
        create: [
          { question: "What do I eat in the morning?", correctIndex: 0, options: ["Breakfast", "Dinner", "Snack"], order: 0 },
          { question: "What do I eat for lunch?", correctIndex: 1, options: ["Water and bread", "Chicken and rice", "Soup"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[7].id }, data: { comprehensionId: comp2.id } });

  // 8. Comprehension for L9 (Final Exam)
  const comp3 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", cefrLevel: "A1",
      passage: "Module 6 Final Exam. Test your knowledge on food, drinks, and Some/Any.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 6. Дониши худро оид ба хӯрок, нӯшокиҳо ва Some/Any санҷед.",
      questions: {
        create: [
          { question: "Translate 'Ман об менӯшам':", correctIndex: 2, options: ["I eat water.", "I want water.", "I drink water."], order: 0 },
          { question: "Translate 'Оё ту себро нағз мебинӣ?':", correctIndex: 0, options: ["Do you like apples?", "Are you like apples?", "I like apples."], order: 1 },
          { question: "Choose correct: Do you have ___ milk?", correctIndex: 1, options: ["some", "any", "a"], order: 2 },
          { question: "What is 'Гӯшти мурғ' in English?", correctIndex: 2, options: ["Meat", "Beef", "Chicken"], order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[8].id }, data: { comprehensionId: comp3.id } });

  console.log("Module 6 successfully created!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
