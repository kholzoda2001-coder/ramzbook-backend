import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  // 1. Delete existing Module 9 if it exists
  const existingMod9 = await prisma.module.findFirst({
    where: { courseId: course.id, order: 9 }
  });

  if (existingMod9) {
    console.log("Deleting existing Module 9...");
    await prisma.module.delete({ where: { id: existingMod9.id } });
  }

  console.log("Creating new Module 9...");

  // 2. Create Module 9
  const mod9 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 9: Places In Town And Directions",
      titleTranslated: "Модули 9: Ҷойҳо ва Самтҳо",
      emoji: "🏙",
      order: 9,
      isPremium: false,
    }
  });

  // 3. Create Lessons
  const lessonData = [
    { title: "Lesson 1: Places In Town", titleTranslated: "Дарси 1: Ҷойҳо дар шаҳр", emoji: "🏦", type: "vocab", skillType: "vocabulary", order: 1 },
    { title: "Lesson 2: Public Places", titleTranslated: "Дарси 2: Ҷойҳои ҷамъиятӣ", emoji: "🏛", type: "vocab", skillType: "vocabulary", order: 2 },
    { title: "Lesson 3: Transportation", titleTranslated: "Дарси 3: Нақлиёт", emoji: "🚌", type: "vocab", skillType: "vocabulary", order: 3 },
    { title: "Lesson 4: Direction Words", titleTranslated: "Дарси 4: Калимаҳои самт", emoji: "➡", type: "vocab", skillType: "vocabulary", order: 4 },
    { title: "Lesson 5: Travel And Navigation", titleTranslated: "Дарси 5: Сафар ва паймоиш", emoji: "🗺", type: "vocab", skillType: "vocabulary", order: 5 },
    { title: "Lesson 6: Directions Builder", titleTranslated: "Дарси 6: Сохтмони самтҳо", emoji: "🏗️", type: "grammar", skillType: "grammar", order: 6 },
    { title: "Lesson 7: Asking For Directions", titleTranslated: "Дарси 7: Пурсидани роҳ", emoji: "🗣️", type: "dialogue", skillType: "speaking", order: 7 },
    { title: "Lesson 8: Module Review", titleTranslated: "Дарси 8: Такрор", emoji: "🔄", type: "review", skillType: "review", order: 8 },
    { title: "Lesson 9: Final Exam", titleTranslated: "Дарси 9: Имтиҳони ниҳоӣ", emoji: "🏆", type: "test", skillType: "test", order: 9 },
  ];

  const lessons = [];
  for (const ld of lessonData) {
    const l = await prisma.lesson.create({
      data: { moduleId: mod9.id, ...ld }
    });
    lessons.push(l);
  }

  // 4. Insert Vocabulary (All Capitalized as requested)
  const vocabLists = [
    // L1: Places In Town (10)
    [
      { word: "Bank", ipa: "/Bæŋk/", ipaTajik: "Бэнк", translation: "Бонк", emoji: "🏦", example: "Where Is The Bank?", exampleTrans: "Бонк Дар Куҷост?" },
      { word: "Hospital", ipa: "/ˈHɒs.Pɪ.Təl/", ipaTajik: "Ҳоспител", translation: "Беморхона", emoji: "🏥", example: "The Hospital Is Big.", exampleTrans: "Беморхона Калон Аст." },
      { word: "School", ipa: "/Skuːl/", ipaTajik: "Скул", translation: "Мактаб", emoji: "🏫", example: "I Go To School.", exampleTrans: "Ман Ба Мактаб Меравам." },
      { word: "Hotel", ipa: "/HəʊˈTel/", ipaTajik: "Ҳоутел", translation: "Меҳмонхона", emoji: "🏨", example: "The Bank Is Near The Hotel.", exampleTrans: "Бонк Дар Наздикии Меҳмонхона Аст." },
      { word: "Restaurant", ipa: "/ˈRes.Trɒnt/", ipaTajik: "Рестронт", translation: "Тарабхона", emoji: "🍽", example: "We Eat At The Restaurant.", exampleTrans: "Мо Дар Тарабхона Хӯрок Мехӯрем." },
      { word: "Mosque", ipa: "/Mɒsk/", ipaTajik: "Моск", translation: "Масҷид", emoji: "🕌", example: "The Mosque Is Beautiful.", exampleTrans: "Масҷид Зебо Аст." },
      { word: "Library", ipa: "/ˈLaɪ.Brər.I/", ipaTajik: "Лайбрери", translation: "Китобхона", emoji: "📚", example: "I Read In The Library.", exampleTrans: "Ман Дар Китобхона Мехонам." },
      { word: "Supermarket", ipa: "/ˈSuː.PəˌMɑː.Kɪt/", ipaTajik: "Супермаркет", translation: "Супермаркет", emoji: "🏪", example: "I Buy Food At The Supermarket.", exampleTrans: "Ман Аз Супермаркет Хӯрок Мехарам." },
      { word: "Pharmacy", ipa: "/ˈFɑː.Mə.Si/", ipaTajik: "Фармеси", translation: "Дорухона", emoji: "💊", example: "Where Is The Pharmacy?", exampleTrans: "Дорухона Дар Куҷост?" },
      { word: "Bakery", ipa: "/ˈBeɪ.Kər.I/", ipaTajik: "Бейкери", translation: "Нонвойхона", emoji: "🥖", example: "The Bakery Is Next To The Bank.", exampleTrans: "Нонвойхона Дар Паҳлӯи Бонк Аст." }
    ],
    // L2: Public Places (10)
    [
      { word: "Museum", ipa: "/MjuːˈZiː.Əm/", ipaTajik: "Мюзием", translation: "Осорхона", emoji: "🏛", example: "We Visit The Museum.", exampleTrans: "Мо Ба Осорхона Меравем." },
      { word: "Cinema", ipa: "/ˈSɪn.Ə.Mə/", ipaTajik: "Синема", translation: "Кинотеатр", emoji: "🎬", example: "I Watch Movies At The Cinema.", exampleTrans: "Ман Дар Кинотеатр Филм Мебинам." },
      { word: "Cafe", ipa: "/ˈKæf.Eɪ/", ipaTajik: "Кэфей", translation: "Қаҳвахона", emoji: "☕", example: "The Cafe Is Next To The Park.", exampleTrans: "Қаҳвахона Дар Паҳлӯи Боғ Аст." },
      { word: "Park", ipa: "/Pɑːk/", ipaTajik: "Парк", translation: "Боғ / Парк", emoji: "🌳", example: "Children Play In The Park.", exampleTrans: "Кӯдакон Дар Боғ Бозӣ Мекунанд." },
      { word: "Stadium", ipa: "/ˈSteɪ.Di.Əm/", ipaTajik: "Стейдием", translation: "Варзишгоҳ", emoji: "🏟", example: "The Stadium Is Very Large.", exampleTrans: "Варзишгоҳ Хеле Калон Аст." },
      { word: "Office", ipa: "/ˈɒf.ɪs/", ipaTajik: "Офис", translation: "Идора", emoji: "🏢", example: "I Work In An Office.", exampleTrans: "Ман Дар Идора Кор Мекунам." },
      { word: "Post Office", ipa: "/ˈPəʊst ˌɒf.ɪs/", ipaTajik: "Поуст Офис", translation: "Идораи Почта", emoji: "📮", example: "I Send A Letter At The Post Office.", exampleTrans: "Ман Дар Идораи Почта Нома Мефиристам." },
      { word: "Police Station", ipa: "/PəˈLiːs ˌSteɪ.Ʃən/", ipaTajik: "Полис Стейшн", translation: "Идораи Полис", emoji: "👮", example: "The Police Station Is Near.", exampleTrans: "Идораи Полис Наздик Аст." },
      { word: "Zoo", ipa: "/Zuː/", ipaTajik: "Зу", translation: "Боғи Ҳайвонот", emoji: "🦓", example: "We Go To The Zoo.", exampleTrans: "Мо Ба Боғи Ҳайвонот Меравем." },
      { word: "Mall", ipa: "/Mɔːl/", ipaTajik: "Мол", translation: "Маркази Савдо", emoji: "🛍", example: "The Mall Is Across From The Park.", exampleTrans: "Маркази Савдо Дар Рӯ Ба Рӯи Боғ Аст." }
    ],
    // L3: Transportation (10)
    [
      { word: "Bus", ipa: "/Bʌs/", ipaTajik: "Бас", translation: "Автобус", emoji: "🚌", example: "I Go To School By Bus.", exampleTrans: "Ман Бо Автобус Ба Мактаб Меравам." },
      { word: "Taxi", ipa: "/ˈTæk.Si/", ipaTajik: "Тэкси", translation: "Такси", emoji: "🚕", example: "We Take A Taxi.", exampleTrans: "Мо Ба Такси Савор Мешавем." },
      { word: "Car", ipa: "/Kɑːr/", ipaTajik: "Кар", translation: "Мошин", emoji: "🚗", example: "I Drive A Car.", exampleTrans: "Ман Мошин Меронам." },
      { word: "Bicycle", ipa: "/ˈBaɪ.Sɪ.Kəl/", ipaTajik: "Байсикл", translation: "Дучарха", emoji: "🚲", example: "I Ride A Bicycle.", exampleTrans: "Ман Дучарха Меронам." },
      { word: "Train", ipa: "/Treɪn/", ipaTajik: "Трейн", translation: "Поезд", emoji: "🚆", example: "The Train Is Fast.", exampleTrans: "Поезд Тез Аст." },
      { word: "Airplane", ipa: "/ˈEə.Pleɪn/", ipaTajik: "Эрплейн", translation: "Ҳавопаймо", emoji: "✈", example: "I Travel By Airplane.", exampleTrans: "Ман Бо Ҳавопаймо Сафар Мекунам." },
      { word: "Bus Stop", ipa: "/ˈBʌs ˌStɒp/", ipaTajik: "Бас Стоп", translation: "Истгоҳи Автобус", emoji: "🚏", example: "I Wait At The Bus Stop.", exampleTrans: "Ман Дар Истгоҳи Автобус Интизор Мешавам." },
      { word: "Train Station", ipa: "/ˈTreɪn ˌSteɪ.Ʃən/", ipaTajik: "Трейн Стейшн", translation: "Истгоҳи Поезд", emoji: "🚉", example: "Where Is The Train Station?", exampleTrans: "Истгоҳи Поезд Дар Куҷост?" },
      { word: "Subway", ipa: "/ˈSʌb.Weɪ/", ipaTajik: "Сабвей", translation: "Метро", emoji: "🚇", example: "We Go By Subway.", exampleTrans: "Мо Бо Метро Меравем." },
      { word: "Boat", ipa: "/Bəʊt/", ipaTajik: "Боут", translation: "Қаиқ", emoji: "⛵", example: "The Boat Is On The Water.", exampleTrans: "Қаиқ Дар Болои Об Аст." }
    ],
    // L4: Direction Words (10)
    [
      { word: "Left", ipa: "/Left/", ipaTajik: "Лефт", translation: "Чап", emoji: "⬅", example: "Turn Left.", exampleTrans: "Ба Чап Гардед." },
      { word: "Right", ipa: "/Raɪt/", ipaTajik: "Райт", translation: "Рост", emoji: "➡", example: "Turn Right.", exampleTrans: "Ба Рост Гардед." },
      { word: "Straight", ipa: "/Streɪt/", ipaTajik: "Стрейт", translation: "Рост / Мустақим", emoji: "⬆", example: "Go Straight.", exampleTrans: "Рост Равед." },
      { word: "Turn", ipa: "/Tɜːn/", ipaTajik: "Тёрн", translation: "Гаштан", emoji: "🔄", example: "Turn At The Corner.", exampleTrans: "Дар Гӯша Гардед." },
      { word: "Near", ipa: "/Nɪər/", ipaTajik: "Ниэр", translation: "Дар Наздикии", emoji: "📍", example: "The Bank Is Near.", exampleTrans: "Бонк Дар Наздикии Ин Ҷо Аст." },
      { word: "Next To", ipa: "/Nekst Tuː/", ipaTajik: "Некст Ту", translation: "Дар Паҳлӯи", emoji: "📌", example: "It Is Next To The Hospital.", exampleTrans: "Он Дар Паҳлӯи Беморхона Аст." },
      { word: "Between", ipa: "/BɪˈTwiːn/", ipaTajik: "Битвин", translation: "Дар Байни", emoji: "↔", example: "The Cafe Is Between The Bank And School.", exampleTrans: "Қаҳвахона Дар Байни Бонк Ва Мактаб Аст." },
      { word: "Across From", ipa: "/ƏˈKrɒs Frɒm/", ipaTajik: "Акрос Фром", translation: "Дар Рӯ Ба Рӯи", emoji: "🏠", example: "The Park Is Across From The Mall.", exampleTrans: "Боғ Дар Рӯ Ба Рӯи Маркази Савдо Аст." },
      { word: "Far", ipa: "/Fɑːr/", ipaTajik: "Фар", translation: "Дур", emoji: "🔭", example: "The Airport Is Far.", exampleTrans: "Фурудгоҳ Дур Аст." },
      { word: "Corner", ipa: "/ˈKɔː.Nər/", ipaTajik: "Корнер", translation: "Гӯша / Кунҷ", emoji: "📐", example: "The Store Is On The Corner.", exampleTrans: "Мағоза Дар Гӯша Аст." }
    ],
    // L5: Travel And Navigation (10)
    [
      { word: "Walk", ipa: "/Wɔːk/", ipaTajik: "Вок", translation: "Пиёда Рафтан", emoji: "🚶", example: "I Walk To The Park.", exampleTrans: "Ман То Боғ Пиёда Меравам." },
      { word: "Run", ipa: "/Rʌn/", ipaTajik: "Ран", translation: "Давидан", emoji: "🏃", example: "I Run To School.", exampleTrans: "Ман То Мактаб Медавам." },
      { word: "Drive", ipa: "/Draɪv/", ipaTajik: "Драйв", translation: "Мошин Рондан", emoji: "🚗", example: "I Drive To Work.", exampleTrans: "Ман Бо Мошин Ба Кор Меравам." },
      { word: "Map", ipa: "/Mæp/", ipaTajik: "Мэп", translation: "Харита", emoji: "🗺", example: "I Need A Map.", exampleTrans: "Ба Ман Харита Лозим Аст." },
      { word: "Direction", ipa: "/DɪˈRek.Ʃən/", ipaTajik: "Дирекшн", translation: "Самт", emoji: "🧭", example: "What Is The Direction?", exampleTrans: "Самт Кадом Аст?" },
      { word: "Location", ipa: "/LəʊˈKeɪ.Ʃən/", ipaTajik: "Локейшн", translation: "Мавқеъ", emoji: "📍", example: "This Is A Good Location.", exampleTrans: "Ин Мавқеи Хуб Аст." },
      { word: "Find", ipa: "/Faɪnd/", ipaTajik: "Файнд", translation: "Ёфтан", emoji: "🔍", example: "I Cannot Find The Bank.", exampleTrans: "Ман Бонкро Ёфта Наметавонам." },
      { word: "Ticket", ipa: "/ˈTɪk.ɪt/", ipaTajik: "Тикит", translation: "Чипта", emoji: "🎫", example: "I Buy A Bus Ticket.", exampleTrans: "Ман Чиптаи Автобус Мехарам." },
      { word: "Go", ipa: "/Ɡəʊ/", ipaTajik: "Гоу", translation: "Рафтан", emoji: "🚶", example: "I Go To The Supermarket.", exampleTrans: "Ман Ба Супермаркет Меравам." },
      { word: "Arrive", ipa: "/ƏˈRaɪv/", ipaTajik: "Эрайв", translation: "Расидан", emoji: "🏁", example: "I Arrive At The Hotel.", exampleTrans: "Ман Ба Меҳмонхона Мерасам." }
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

  // 5. Grammar Topic for L6
  const g1 = await prisma.grammarTopic.create({
    data: {
      courseId: course.id,
      title: "Where Is...? & Giving Directions",
      titleTranslated: "Дар Куҷост...? Ва Нишон Додани Роҳ",
      explanation: "Where Is The Hospital? (Беморхона Дар Куҷост?) \nHow Do I Get To The Bank? (Ман Ба Бонк Чӣ Гуна Мерасам?)\nGo Straight And Turn Left. (Мустақим Равед Ва Ба Чап Гардед.)\nThe Bank Is Next To The Hotel. (Бонк Дар Паҳлӯи Меҳмонхона Аст.)\nIt Is Between The Park And School. (Он Дар Байни Боғ Ва Мактаб Аст.)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { grammarTopicId: g1.id } });

  // 6. Comprehension for L6 (Directions Builder)
  const comp1 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Directions Builder", titleTranslated: "Сохтани Самтҳо", cefrLevel: "A1",
      passage: "Excuse Me, Where Is The Hospital? Go Straight. Then Turn Left At The Corner. The Hospital Is Next To The Post Office.",
      passageTranslated: "Мебахшед, Беморхона Дар Куҷост? Мустақим Равед. Баъд Дар Гӯша Ба Тарафи Чап Гардед. Беморхона Дар Паҳлӯи Идораи Почта Аст.",
      questions: {
        create: [
          { question: "Where Is The Hospital?", correctIndex: 2, options: ["Next To The Bank", "Near The Park", "Next To The Post Office"], order: 0 },
          { question: "What Is The First Direction?", correctIndex: 0, options: ["Go Straight", "Turn Left", "Turn Right"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { comprehensionId: comp1.id } });

  // 7. Dialogue for L7
  const d1 = await prisma.dialogue.create({
    data: {
      courseId: course.id, title: "Asking For Directions", titleTranslated: "Пурсидани Роҳ", cefrLevel: "A1",
      lines: {
        create: [
          { speaker: "Tourist", text: "Excuse Me. Where Is The Hospital?", translation: "Мебахшед. Беморхона Дар Куҷост?", audioUrl: "", order: 0 },
          { speaker: "Local Person", text: "Go Straight.", translation: "Мустақим Равед.", audioUrl: "", order: 1 },
          { speaker: "Tourist", text: "Then What?", translation: "Баъд Чӣ?", audioUrl: "", order: 2 },
          { speaker: "Local Person", text: "Turn Right.", translation: "Ба Тарафи Рост Гардед.", audioUrl: "", order: 3 },
          { speaker: "Tourist", text: "Is It Near The Bank?", translation: "Оё Он Дар Наздикии Бонк Аст?", audioUrl: "", order: 4 },
          { speaker: "Local Person", text: "Yes. It Is Next To The Bank.", translation: "Бале. Он Дар Паҳлӯи Бонк Аст.", audioUrl: "", order: 5 },
          { speaker: "Tourist", text: "Thank You.", translation: "Раҳмат.", audioUrl: "", order: 6 },
          { speaker: "Local Person", text: "You're Welcome.", translation: "Меарзад.", audioUrl: "", order: 7 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[6].id }, data: { dialogueId: d1.id } });

  // 8. Comprehension for L8 (Review)
  const comp2 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Module Review", titleTranslated: "Такрори Модул", cefrLevel: "A1",
      passage: "Let's Review Directions! I Walk To The City. I Look For The Museum. I Go Straight And Turn Right. It Is Between The Cafe And The Library.",
      passageTranslated: "Биёед Самтҳоро Такрор Кунем! Ман Пиёда Ба Шаҳр Меравам. Ман Осорхонаро Ҷустуҷӯ Мекунам. Ман Рост Меравам Ва Ба Рост Мегардам. Он Дар Байни Қаҳвахона Ва Китобхона Аст.",
      questions: {
        create: [
          { question: "What Am I Looking For?", correctIndex: 1, options: ["The Hospital", "The Museum", "The Bank"], order: 0 },
          { question: "Where Is It?", correctIndex: 1, options: ["Next To The Park", "Between The Cafe And Library", "Across From The Store"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[7].id }, data: { comprehensionId: comp2.id } });

  // 9. Comprehension for L9 (Final Exam)
  const comp3 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", cefrLevel: "A1",
      passage: "Module 9 Final Exam. Test Your Knowledge On Places, Transportation, And Directions.",
      passageTranslated: "Имтиҳони Ниҳоӣ Барои Модули 9. Дониши Худро Оид Ба Ҷойҳо, Нақлиёт Ва Самтҳо Санҷед.",
      questions: {
        create: [
          { question: "Translate 'Беморхона Дар Куҷост?':", correctIndex: 0, options: ["Where Is The Hospital?", "Is This A Hospital?", "Go To The Hospital."], order: 0 },
          { question: "Choose Correct: ___ Right At The Corner.", correctIndex: 1, options: ["Go", "Turn", "Walk"], order: 1 },
          { question: "Translate 'Ман Ба Автобус Савор Мешавам':", correctIndex: 2, options: ["I Drive A Bus.", "I See A Bus.", "I Ride A Bus."], order: 2 },
          { question: "What Is 'Дорухона' In English?", correctIndex: 0, options: ["Pharmacy", "Bakery", "Bank"], order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[8].id }, data: { comprehensionId: comp3.id } });

  console.log("Module 9 successfully RE-CREATED with strict capitalization rules!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
