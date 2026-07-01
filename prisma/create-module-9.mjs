import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  // 1. Create Module 9
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

  // 2. Create Lessons
  const lessonData = [
    { title: "Lesson 1: Places In Town", titleTranslated: "Дарси 1: Ҷойҳо дар шаҳр", emoji: "🏦", type: "vocab", skillType: "vocabulary", order: 1 },
    { title: "Lesson 2: Transportation", titleTranslated: "Дарси 2: Нақлиёт", emoji: "🚌", type: "vocab", skillType: "vocabulary", order: 2 },
    { title: "Lesson 3: Direction Words", titleTranslated: "Дарси 3: Калимаҳои самт", emoji: "➡", type: "vocab", skillType: "vocabulary", order: 3 },
    { title: "Lesson 4: City Locations", titleTranslated: "Дарси 4: Ҷойҳои шаҳр", emoji: "🏢", type: "vocab", skillType: "vocabulary", order: 4 },
    { title: "Lesson 5: Travel Actions", titleTranslated: "Дарси 5: Амалҳои сафар", emoji: "🚶", type: "vocab", skillType: "vocabulary", order: 5 },
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

  // 3. Insert Vocabulary
  const vocabLists = [
    // L1: Places In Town (12)
    [
      { word: "Bank", ipa: "/bæŋk/", ipaTajik: "Бэнк", translation: "Бонк", emoji: "🏦", example: "I go to the bank.", exampleTrans: "Ман ба бонк меравам." },
      { word: "Hospital", ipa: "/ˈhɒs.pɪ.təl/", ipaTajik: "Ҳоспител", translation: "Беморхона", emoji: "🏥", example: "The hospital is big.", exampleTrans: "Беморхона калон аст." },
      { word: "School", ipa: "/skuːl/", ipaTajik: "Скул", translation: "Мактаб", emoji: "🏫", example: "I go to school.", exampleTrans: "Ман ба мактаб меравам." },
      { word: "Store", ipa: "/stɔːr/", ipaTajik: "Стор", translation: "Мағоза", emoji: "🏪", example: "The store is open.", exampleTrans: "Мағоза кушода аст." },
      { word: "Hotel", ipa: "/həʊˈtel/", ipaTajik: "Ҳоутел", translation: "Меҳмонхона", emoji: "🏨", example: "This is a nice hotel.", exampleTrans: "Ин меҳмонхонаи хуб аст." },
      { word: "Restaurant", ipa: "/ˈres.trɒnt/", ipaTajik: "Рестронт", translation: "Тарабхона", emoji: "🍽", example: "We eat at the restaurant.", exampleTrans: "Мо дар тарабхона хӯрок мехӯрем." },
      { word: "Post Office", ipa: "/ˈpəʊst ˌɒf.ɪs/", ipaTajik: "Поуст офис", translation: "Идораи почта", emoji: "📮", example: "The post office is near.", exampleTrans: "Идораи почта наздик аст." },
      { word: "Gas Station", ipa: "/ˈɡæs ˌsteɪ.ʃən/", ipaTajik: "Гэс стейшн", translation: "Нуқтаи фурӯши сӯзишворӣ", emoji: "⛽", example: "I need a gas station.", exampleTrans: "Ба ман нуқтаи фурӯши сӯзишворӣ лозим аст." },
      { word: "Pharmacy", ipa: "/ˈfɑː.mə.si/", ipaTajik: "Фармеси", translation: "Дорухона", emoji: "💊", example: "The pharmacy is on the left.", exampleTrans: "Дорухона дар тарафи чап аст." },
      { word: "Bakery", ipa: "/ˈbeɪ.kər.i/", ipaTajik: "Бейкери", translation: "Нонвойхона", emoji: "🥖", example: "I buy bread at the bakery.", exampleTrans: "Ман аз нонвойхона нон мехарам." },
      { word: "Police Station", ipa: "/pəˈliːs ˌsteɪ.ʃən/", ipaTajik: "Полис стейшн", translation: "Идораи полис", emoji: "🚓", example: "Where is the police station?", exampleTrans: "Идораи полис дар куҷост?" },
      { word: "Supermarket", ipa: "/ˈsuː.pəˌmɑː.kɪt/", ipaTajik: "Супермаркет", translation: "Супермаркет", emoji: "🛒", example: "I am at the supermarket.", exampleTrans: "Ман дар супермаркет ҳастам." }
    ],
    // L2: Transportation (12)
    [
      { word: "Bus", ipa: "/bʌs/", ipaTajik: "Бас", translation: "Автобус", emoji: "🚌", example: "I take the bus.", exampleTrans: "Ман ба автобус савор мешавам." },
      { word: "Taxi", ipa: "/ˈtæk.si/", ipaTajik: "Тэкси", translation: "Такси", emoji: "🚕", example: "We need a taxi.", exampleTrans: "Ба мо такси лозим аст." },
      { word: "Car", ipa: "/kɑːr/", ipaTajik: "Кар", translation: "Мошин", emoji: "🚗", example: "My car is fast.", exampleTrans: "Мошини ман тез аст." },
      { word: "Bicycle", ipa: "/ˈbaɪ.sɪ.kəl/", ipaTajik: "Байсикл", translation: "Дучарха", emoji: "🚲", example: "I ride a bicycle.", exampleTrans: "Ман дучарха меронам." },
      { word: "Train", ipa: "/treɪn/", ipaTajik: "Трейн", translation: "Поезд", emoji: "🚆", example: "The train is late.", exampleTrans: "Поезд дер кард." },
      { word: "Airport", ipa: "/ˈeə.pɔːt/", ipaTajik: "Эрпорт", translation: "Фурудгоҳ", emoji: "✈", example: "I go to the airport.", exampleTrans: "Ман ба фурудгоҳ меравам." },
      { word: "Bus Stop", ipa: "/ˈbʌs ˌstɒp/", ipaTajik: "Бас стоп", translation: "Истгоҳи автобус", emoji: "🚏", example: "Wait at the bus stop.", exampleTrans: "Дар истгоҳи автобус интизор шав." },
      { word: "Station", ipa: "/ˈsteɪ.ʃən/", ipaTajik: "Стейшн", translation: "Истгоҳ / Вокзал", emoji: "🚉", example: "The train station is big.", exampleTrans: "Истгоҳи поезд калон аст." },
      { word: "Plane", ipa: "/pleɪn/", ipaTajik: "Плейн", translation: "Ҳавопаймо", emoji: "🛫", example: "The plane is in the sky.", exampleTrans: "Ҳавопаймо дар осмон аст." },
      { word: "Boat", ipa: "/bəʊt/", ipaTajik: "Боут", translation: "Қаиқ", emoji: "⛵", example: "The boat is on the water.", exampleTrans: "Қаиқ дар болои об аст." },
      { word: "Ticket", ipa: "/ˈtɪk.ɪt/", ipaTajik: "Тикит", translation: "Чипта", emoji: "🎫", example: "I need a ticket.", exampleTrans: "Ба ман чипта лозим аст." },
      { word: "Subway", ipa: "/ˈsʌb.weɪ/", ipaTajik: "Сабвей", translation: "Метро", emoji: "🚇", example: "We take the subway.", exampleTrans: "Мо бо метро меравем." }
    ],
    // L3: Direction Words (12)
    [
      { word: "Left", ipa: "/left/", ipaTajik: "Лефт", translation: "Чап", emoji: "⬅", example: "Turn left.", exampleTrans: "Ба тарафи чап гард." },
      { word: "Right", ipa: "/raɪt/", ipaTajik: "Райт", translation: "Рост", emoji: "➡", example: "Turn right.", exampleTrans: "Ба тарафи рост гард." },
      { word: "Straight", ipa: "/streɪt/", ipaTajik: "Стрейт", translation: "Рост / Мустақим", emoji: "⬆", example: "Go straight.", exampleTrans: "Рост рав." },
      { word: "Turn", ipa: "/tɜːn/", ipaTajik: "Тёрн", translation: "Гаштан", emoji: "🔄", example: "Turn here.", exampleTrans: "Дар ин ҷо гард." },
      { word: "Near", ipa: "/nɪər/", ipaTajik: "Ниэр", translation: "Дар наздикии", emoji: "📍", example: "It is near the bank.", exampleTrans: "Ин дар наздикии бонк аст." },
      { word: "Next To", ipa: "/nekst tuː/", ipaTajik: "Некст ту", translation: "Дар паҳлӯи", emoji: "📌", example: "Next to the store.", exampleTrans: "Дар паҳлӯи мағоза." },
      { word: "Between", ipa: "/bɪˈtwiːn/", ipaTajik: "Битвин", translation: "Дар байни", emoji: "↔", example: "Between the park and school.", exampleTrans: "Дар байни боғ ва мактаб." },
      { word: "Across From", ipa: "/əˈkrɒs frɒm/", ipaTajik: "Акрос фром", translation: "Дар рӯ ба рӯи", emoji: "🏠", example: "Across from the hospital.", exampleTrans: "Дар рӯ ба рӯи беморхона." },
      { word: "Corner", ipa: "/ˈkɔː.nər/", ipaTajik: "Корнер", translation: "Гӯша / Кунҷ", emoji: "📐", example: "It is on the corner.", exampleTrans: "Вай дар гӯша қарор дорад." },
      { word: "Street", ipa: "/striːt/", ipaTajik: "Стрит", translation: "Кӯча", emoji: "🛣", example: "This is a long street.", exampleTrans: "Ин кӯчаи дароз аст." },
      { word: "Road", ipa: "/rəʊd/", ipaTajik: "Роуд", translation: "Роҳ", emoji: "🛣", example: "The road is good.", exampleTrans: "Роҳ нағз аст." },
      { word: "Intersection", ipa: "/ˌɪn.təˈsek.ʃən/", ipaTajik: "Интерсекшн", translation: "Чорроҳа", emoji: "🚦", example: "Stop at the intersection.", exampleTrans: "Дар чорроҳа истод кунед." }
    ],
    // L4: City Locations (12)
    [
      { word: "Park", ipa: "/pɑːk/", ipaTajik: "Парк", translation: "Боғ / Парк", emoji: "🌳", example: "We walk in the park.", exampleTrans: "Мо дар боғ пиёда мегардем." },
      { word: "Stadium", ipa: "/ˈsteɪ.di.əm/", ipaTajik: "Стейдием", translation: "Варзишгоҳ", emoji: "🏟", example: "The stadium is full.", exampleTrans: "Варзишгоҳ пур аст." },
      { word: "Library", ipa: "/ˈlaɪ.brər.i/", ipaTajik: "Лайбрери", translation: "Китобхона", emoji: "📚", example: "I read at the library.", exampleTrans: "Ман дар китобхона мехонам." },
      { word: "Office", ipa: "/ˈɒf.ɪs/", ipaTajik: "Офис", translation: "Идора", emoji: "🏢", example: "I work in an office.", exampleTrans: "Ман дар идора кор мекунам." },
      { word: "Mall", ipa: "/mɔːl/", ipaTajik: "Мол", translation: "Маркази савдо", emoji: "🏦", example: "We shop at the mall.", exampleTrans: "Мо дар маркази савдо харид мекунем." },
      { word: "Cinema", ipa: "/ˈsɪn.ə.mə/", ipaTajik: "Синема", translation: "Кинотеатр", emoji: "🎬", example: "We go to the cinema.", exampleTrans: "Мо ба кинотеатр меравем." },
      { word: "Cafe", ipa: "/ˈkæf.eɪ/", ipaTajik: "Кэфей", translation: "Қаҳвахона", emoji: "☕", example: "I drink coffee at the cafe.", exampleTrans: "Ман дар қаҳвахона қаҳва менӯшам." },
      { word: "Museum", ipa: "/mjuːˈziː.əm/", ipaTajik: "Мюзием", translation: "Осорхона", emoji: "🏛", example: "This museum is old.", exampleTrans: "Ин осорхона кӯҳна аст." },
      { word: "Zoo", ipa: "/zuː/", ipaTajik: "Зу", translation: "Боғи ҳайвонот", emoji: "🦓", example: "Animals are in the zoo.", exampleTrans: "Ҳайвонот дар боғи ҳайвонот мебошанд." },
      { word: "Gym", ipa: "/dʒɪm/", ipaTajik: "Ҷим", translation: "Толори варзишӣ", emoji: "🏋️", example: "I exercise at the gym.", exampleTrans: "Ман дар толори варзишӣ машқ мекунам." },
      { word: "Bridge", ipa: "/brɪdʒ/", ipaTajik: "Бриҷ", translation: "Пул / Кӯпрук", emoji: "🌉", example: "We cross the bridge.", exampleTrans: "Мо аз болои пул мегузарем." },
      { word: "City", ipa: "/ˈsɪt.i/", ipaTajik: "Сити", translation: "Шаҳри калон", emoji: "🏙", example: "I live in the city.", exampleTrans: "Ман дар шаҳри калон зиндагӣ мекунам." }
    ],
    // L5: Travel Actions (12)
    [
      { word: "Walk", ipa: "/wɔːk/", ipaTajik: "Вок", translation: "Пиёда рафтан", emoji: "🚶", example: "I walk to the park.", exampleTrans: "Ман то боғ пиёда меравам." },
      { word: "Run", ipa: "/rʌn/", ipaTajik: "Ран", translation: "Давидан", emoji: "🏃", example: "I run fast.", exampleTrans: "Ман тез медавам." },
      { word: "Drive", ipa: "/draɪv/", ipaTajik: "Драйв", translation: "Мошин рондан", emoji: "🚗", example: "I drive a car.", exampleTrans: "Ман мошин меронам." },
      { word: "Ride", ipa: "/raɪd/", ipaTajik: "Райд", translation: "Савор шудан", emoji: "🚌", example: "I ride a bus.", exampleTrans: "Ман ба автобус савор мешавам." },
      { word: "Find", ipa: "/faɪnd/", ipaTajik: "Файнд", translation: "Ёфтан / Пайдо кардан", emoji: "🧭", example: "I can find it.", exampleTrans: "Ман метавонам онро ёбам." },
      { word: "Look For", ipa: "/lʊk fɔːr/", ipaTajik: "Лук фор", translation: "Ҷустуҷӯ кардан", emoji: "🔍", example: "I look for the bank.", exampleTrans: "Ман бонкро ҷустуҷӯ мекунам." },
      { word: "Map", ipa: "/mæp/", ipaTajik: "Мэп", translation: "Харита", emoji: "🗺", example: "I need a map.", exampleTrans: "Ба ман харита лозим аст." },
      { word: "Location", ipa: "/ləʊˈkeɪ.ʃən/", ipaTajik: "Локейшн", translation: "Мавқеъ / Ҷойгиршавӣ", emoji: "📍", example: "Send your location.", exampleTrans: "Мавқеи худро равон кунед." },
      { word: "Go", ipa: "/ɡəʊ/", ipaTajik: "Гоу", translation: "Рафтан", emoji: "🚶", example: "I go to school.", exampleTrans: "Ман ба мактаб меравам." },
      { word: "Stop", ipa: "/stɒp/", ipaTajik: "Стоп", translation: "Ист", emoji: "🛑", example: "Stop here.", exampleTrans: "Дар ин ҷо истод кунед." },
      { word: "Arrive", ipa: "/əˈraɪv/", ipaTajik: "Эрайв", translation: "Расидан", emoji: "🏁", example: "I arrive at the hotel.", exampleTrans: "Ман ба меҳмонхона мерасам." },
      { word: "Leave", ipa: "/liːv/", ipaTajik: "Лив", translation: "Тарк кардан / Рафтан аз", emoji: "🚪", example: "I leave the house.", exampleTrans: "Ман аз хона мебароям." }
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
      title: "Where is...? & Giving Directions",
      titleTranslated: "Дар куҷост...? ва Нишон додани роҳ",
      explanation: "Барои пурсидани роҳ 'Where is...?' (Дар куҷост...?)-ро истифода баред. Барои ҷавоб 'Go straight' (Рост рав), 'Turn left' (Ба чап гард) ва 'Turn right' (Ба рост гард)-ро истифода баред.\nWhere is the bank? (Бонк дар куҷост?)\nGo straight and turn left. (Рост рав ва ба тарафи чап гард.)\nIt is across from the park. (Он дар рӯ ба рӯи боғ аст.)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { grammarTopicId: g1.id } });

  // 5. Comprehension for L6 (Directions Builder)
  const comp1 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Directions Builder", titleTranslated: "Сохтани самтҳо", cefrLevel: "A1",
      passage: "Excuse me, where is the hospital? Go straight. Then turn left at the corner. The hospital is next to the post office.",
      passageTranslated: "Мебахшед, беморхона дар куҷост? Рост равед. Баъд дар гӯша ба тарафи чап гардед. Беморхона дар паҳлӯи идораи почта аст.",
      questions: {
        create: [
          { question: "Where is the hospital?", correctIndex: 2, options: ["Next to the bank", "Near the park", "Next to the post office"], order: 0 },
          { question: "What is the first direction?", correctIndex: 0, options: ["Go straight", "Turn left", "Turn right"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { comprehensionId: comp1.id } });

  // 6. Dialogue for L7
  const d1 = await prisma.dialogue.create({
    data: {
      courseId: course.id, title: "Asking For Directions", titleTranslated: "Пурсидани роҳ", cefrLevel: "A1",
      lines: {
        create: [
          { speaker: "A", text: "Excuse me, where is the hospital?", translation: "Мебахшед, беморхона дар куҷост?", audioUrl: "", order: 0 },
          { speaker: "B", text: "Go straight.", translation: "Мустақим равед.", audioUrl: "", order: 1 },
          { speaker: "A", text: "Then?", translation: "Баъд чӣ?", audioUrl: "", order: 2 },
          { speaker: "B", text: "Turn left.", translation: "Ба чап гардед.", audioUrl: "", order: 3 },
          { speaker: "A", text: "Is it near the bank?", translation: "Оё он дар наздикии бонк аст?", audioUrl: "", order: 4 },
          { speaker: "B", text: "Yes, it is next to the bank.", translation: "Бале, он дар паҳлӯи бонк аст.", audioUrl: "", order: 5 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[6].id }, data: { dialogueId: d1.id } });

  // 7. Comprehension for L8 (Review)
  const comp2 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Module Review", titleTranslated: "Такрори Модул", cefrLevel: "A1",
      passage: "Let's review directions! I walk to the city. I look for the museum. I go straight and turn right. It is between the cafe and the library.",
      passageTranslated: "Биёед самтҳоро такрор кунем! Ман пиёда ба шаҳр меравам. Ман осорхонаро ҷустуҷӯ мекунам. Ман рост меравам ва ба рост мегардам. Он дар байни қаҳвахона ва китобхона аст.",
      questions: {
        create: [
          { question: "What am I looking for?", correctIndex: 1, options: ["The hospital", "The museum", "The bank"], order: 0 },
          { question: "Where is it?", correctIndex: 1, options: ["Next to the park", "Between the cafe and library", "Across from the store"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[7].id }, data: { comprehensionId: comp2.id } });

  // 8. Comprehension for L9 (Final Exam)
  const comp3 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", cefrLevel: "A1",
      passage: "Module 9 Final Exam. Test your knowledge on places, transportation, and directions.",
      passageTranslated: "Имтиҳони Ниҳоӣ барои Модули 9. Дониши худро оид ба ҷойҳо, нақлиёт ва самтҳо санҷед.",
      questions: {
        create: [
          { question: "Translate 'Беморхона дар куҷост?':", correctIndex: 0, options: ["Where is the hospital?", "Is this a hospital?", "Go to the hospital."], order: 0 },
          { question: "Choose correct: ___ right at the corner.", correctIndex: 1, options: ["Go", "Turn", "Walk"], order: 1 },
          { question: "Translate 'Ман ба автобус савор мешавам':", correctIndex: 2, options: ["I drive a bus.", "I see a bus.", "I ride a bus."], order: 2 },
          { question: "What is 'Дорухона' in English?", correctIndex: 0, options: ["Pharmacy", "Bakery", "Bank"], order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[8].id }, data: { comprehensionId: comp3.id } });

  console.log("Module 9 successfully created!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
