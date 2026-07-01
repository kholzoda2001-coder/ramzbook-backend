import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  // 1. Create Module 10
  const mod10 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: "Module 10: Clothes And Colors",
      titleTranslated: "Модули 10: Либосҳо Ва Рангҳо",
      emoji: "👕",
      order: 10,
      isPremium: false,
    }
  });

  // 2. Create Lessons
  const lessonData = [
    { title: "Lesson 1: Basic Colors", titleTranslated: "Дарси 1: Рангҳои Асосӣ", emoji: "🎨", type: "vocab", skillType: "vocabulary", order: 1 },
    { title: "Lesson 2: More Colors", titleTranslated: "Дарси 2: Рангҳои Бештар", emoji: "🌈", type: "vocab", skillType: "vocabulary", order: 2 },
    { title: "Lesson 3: Clothes", titleTranslated: "Дарси 3: Либосҳо", emoji: "👗", type: "vocab", skillType: "vocabulary", order: 3 },
    { title: "Lesson 4: Accessories", titleTranslated: "Дарси 4: Лавозимот", emoji: "⌚", type: "vocab", skillType: "vocabulary", order: 4 },
    { title: "Lesson 5: Describing Clothes", titleTranslated: "Дарси 5: Тасвири Либосҳо", emoji: "✨", type: "vocab", skillType: "vocabulary", order: 5 },
    { title: "Lesson 6: Clothes Builder", titleTranslated: "Дарси 6: Сохтмони Либосҳо", emoji: "🏗️", type: "grammar", skillType: "grammar", order: 6 },
    { title: "Lesson 7: Clothes Shopping Conversation", titleTranslated: "Дарси 7: Муколамаи Хариди Либос", emoji: "🗣️", type: "dialogue", skillType: "speaking", order: 7 },
    { title: "Lesson 8: Module Review", titleTranslated: "Дарси 8: Такрор", emoji: "🔄", type: "review", skillType: "review", order: 8 },
    { title: "Lesson 9: Final Exam", titleTranslated: "Дарси 9: Имтиҳони Ниҳоӣ", emoji: "🏆", type: "test", skillType: "test", order: 9 },
  ];

  const lessons = [];
  for (const ld of lessonData) {
    const l = await prisma.lesson.create({
      data: { moduleId: mod10.id, ...ld }
    });
    lessons.push(l);
  }

  // 3. Insert Vocabulary (All Capitalized as requested)
  const vocabLists = [
    // L1: Basic Colors (12)
    [
      { word: "Red", ipa: "/Red/", ipaTajik: "Ред", translation: "Сурх", emoji: "🔴", example: "The Apple Is Red.", exampleTrans: "Себ Сурх Аст." },
      { word: "Blue", ipa: "/Bluː/", ipaTajik: "Блу", translation: "Кабуд", emoji: "🔵", example: "The Sky Is Blue.", exampleTrans: "Осмон Кабуд Аст." },
      { word: "Green", ipa: "/Ɡriːn/", ipaTajik: "Грин", translation: "Сабз", emoji: "🟢", example: "The Tree Is Green.", exampleTrans: "Дарахт Сабз Аст." },
      { word: "Yellow", ipa: "/ˈJel.Əʊ/", ipaTajik: "Елоу", translation: "Зард", emoji: "🟡", example: "The Sun Is Yellow.", exampleTrans: "Офтоб Зард Аст." },
      { word: "Black", ipa: "/Blæk/", ipaTajik: "Блэк", translation: "Сиёҳ", emoji: "⚫", example: "My Cat Is Black.", exampleTrans: "Гурбаи Ман Сиёҳ Аст." },
      { word: "White", ipa: "/Waɪt/", ipaTajik: "Вайт", translation: "Сафед", emoji: "⚪", example: "The Milk Is White.", exampleTrans: "Шир Сафед Аст." },
      { word: "Orange", ipa: "/ˈɒr.ɪndʒ/", ipaTajik: "Оринҷ", translation: "Норанҷӣ", emoji: "🟠", example: "The Flower Is Orange.", exampleTrans: "Гул Норанҷӣ Аст." },
      { word: "Purple", ipa: "/ˈPɜː.Pəl/", ipaTajik: "Пёрпл", translation: "Бунафш", emoji: "🟣", example: "I Like Purple.", exampleTrans: "Ба Ман Бунафш Писанд Аст." },
      { word: "Pink", ipa: "/Pɪŋk/", ipaTajik: "Пинк", translation: "Гулобӣ", emoji: "🌸", example: "She Wears A Pink Dress.", exampleTrans: "Ӯ Куртаи Гулобӣ Мепӯшад." },
      { word: "Brown", ipa: "/Braʊn/", ipaTajik: "Браун", translation: "Қаҳваранг", emoji: "🟤", example: "The Dog Is Brown.", exampleTrans: "Саг Қаҳваранг Аст." },
      { word: "Gray", ipa: "/Ɡreɪ/", ipaTajik: "Грей", translation: "Хокистарранг", emoji: "🌫", example: "The Cloud Is Gray.", exampleTrans: "Абр Хокистарранг Аст." },
      { word: "Silver", ipa: "/ˈSɪl.Vər/", ipaTajik: "Силвер", translation: "Нуқрагӣ", emoji: "💎", example: "This Car Is Silver.", exampleTrans: "Ин Мошин Нуқрагӣ Аст." }
    ],
    // L2: More Colors (10)
    [
      { word: "Gold", ipa: "/Ɡəʊld/", ipaTajik: "Гоулд", translation: "Тиллоӣ", emoji: "✨", example: "The Ring Is Gold.", exampleTrans: "Ангуштарин Тиллоӣ Аст." },
      { word: "Dark Blue", ipa: "/Dɑːk Bluː/", ipaTajik: "Дарк Блу", translation: "Кабуди Тира", emoji: "🔵", example: "His Shirt Is Dark Blue.", exampleTrans: "Куртаи Ӯ Кабуди Тира Аст." },
      { word: "Light Green", ipa: "/Laɪt Ɡriːn/", ipaTajik: "Лайт Грин", translation: "Сабзи Равшан", emoji: "💚", example: "The Leaf Is Light Green.", exampleTrans: "Барг Сабзи Равшан Аст." },
      { word: "Maroon", ipa: "/MəˈRuːn/", ipaTajik: "Марун", translation: "Сурхи Тира", emoji: "🟥", example: "She Likes Maroon.", exampleTrans: "Ӯ Сурхи Тираро Дӯст Медорад." },
      { word: "Navy", ipa: "/ˈNeɪ.Vi/", ipaTajik: "Нейви", translation: "Кабуди Тӯқ", emoji: "🌌", example: "The Jacket Is Navy.", exampleTrans: "Куртка Кабуди Тӯқ Аст." },
      { word: "Beige", ipa: "/Beɪʒ/", ipaTajik: "Беж", translation: "Ранги Беж", emoji: "🟤", example: "The Wall Is Beige.", exampleTrans: "Девор Ранги Беж Аст." },
      { word: "Bright", ipa: "/Braɪt/", ipaTajik: "Брайт", translation: "Равшан", emoji: "☀️", example: "It Is A Bright Color.", exampleTrans: "Ин Ранги Равшан Аст." },
      { word: "Dark", ipa: "/Dɑːk/", ipaTajik: "Дарк", translation: "Торик", emoji: "🌙", example: "The Room Is Dark.", exampleTrans: "Ҳуҷра Торик Аст." },
      { word: "Colorful", ipa: "/ˈKʌl.Ə.Fəl/", ipaTajik: "Калерфул", translation: "Рангоранг", emoji: "🌈", example: "The Bird Is Colorful.", exampleTrans: "Парранда Рангоранг Аст." },
      { word: "Pale", ipa: "/Peɪl/", ipaTajik: "Пейл", translation: "Хира", emoji: "🌫", example: "The Blue Is Pale.", exampleTrans: "Кабуд Хира Аст." }
    ],
    // L3: Clothes (16)
    [
      { word: "Shirt", ipa: "/Ʃɜːt/", ipaTajik: "Шёрт", translation: "Курта", emoji: "👕", example: "This Shirt Is Blue.", exampleTrans: "Ин Курта Кабуд Аст." },
      { word: "Pants", ipa: "/Pænts/", ipaTajik: "Пэнтс", translation: "Шим", emoji: "👖", example: "The Pants Are Black.", exampleTrans: "Шим Сиёҳ Аст." },
      { word: "Shoes", ipa: "/Ʃuːz/", ipaTajik: "Шуз", translation: "Пойафзол", emoji: "👟", example: "These Shoes Are Nice.", exampleTrans: "Ин Пойафзол Хуб Аст." },
      { word: "Jacket", ipa: "/ˈDʒæk.ɪt/", ipaTajik: "Ҷэкит", translation: "Куртка", emoji: "🧥", example: "I Need A Jacket.", exampleTrans: "Ба Ман Куртка Лозим Аст." },
      { word: "Dress", ipa: "/Dres/", ipaTajik: "Дрес", translation: "Куртаи Занона", emoji: "👗", example: "She Is Wearing A Red Dress.", exampleTrans: "Ӯ Куртаи Сурх Пӯшидааст." },
      { word: "Socks", ipa: "/Sɒks/", ipaTajik: "Сокс", translation: "Ҷӯроб", emoji: "🧦", example: "My Socks Are White.", exampleTrans: "Ҷӯробҳои Ман Сафед Ҳастанд." },
      { word: "Cap", ipa: "/Kæp/", ipaTajik: "Кэп", translation: "Кепка", emoji: "🧢", example: "He Has A Green Cap.", exampleTrans: "Ӯ Кепкаи Сабз Дорад." },
      { word: "Gloves", ipa: "/Ɡlʌvz/", ipaTajik: "Главз", translation: "Дастпӯшак", emoji: "🧤", example: "I Wear Gloves In Winter.", exampleTrans: "Ман Дар Зимистон Дастпӯшак Мепӯшам." },
      { word: "Tie", ipa: "/Taɪ/", ipaTajik: "Тай", translation: "Галстук", emoji: "👔", example: "The Tie Is Yellow.", exampleTrans: "Галстук Зард Аст." },
      { word: "Shorts", ipa: "/Ʃɔːts/", ipaTajik: "Шортс", translation: "Шорт", emoji: "🩳", example: "He Wears Shorts.", exampleTrans: "Ӯ Шорт Мепӯшад." },
      { word: "Sweater", ipa: "/ˈSwet.Ər/", ipaTajik: "Светер", translation: "Свитер", emoji: "🧥", example: "The Sweater Is Warm.", exampleTrans: "Свитер Гарм Аст." },
      { word: "Jeans", ipa: "/Dʒiːnz/", ipaTajik: "Ҷинз", translation: "Ҷинс", emoji: "👖", example: "I Like Blue Jeans.", exampleTrans: "Ман Ҷинси Кабудро Дӯст Медорам." },
      { word: "Boots", ipa: "/Buːts/", ipaTajik: "Бутс", translation: "Мӯза", emoji: "👢", example: "These Boots Are Big.", exampleTrans: "Ин Мӯзаҳо Калон Ҳастанд." },
      { word: "Suit", ipa: "/Suːt/", ipaTajik: "Сут", translation: "Костюм", emoji: "🕴", example: "He Wears A Black Suit.", exampleTrans: "Ӯ Костюми Сиёҳ Мепӯшад." },
      { word: "Belt", ipa: "/Belt/", ipaTajik: "Белт", translation: "Камарбанд", emoji: "🥋", example: "The Belt Is Brown.", exampleTrans: "Камарбанд Қаҳваранг Аст." },
      { word: "Sneakers", ipa: "/ˈSniː.Kəz/", ipaTajik: "Сникерз", translation: "Кроссовка", emoji: "👟", example: "I Run In Sneakers.", exampleTrans: "Ман Бо Кроссовка Медавам." }
    ],
    // L4: Accessories (12)
    [
      { word: "Watch", ipa: "/Wɒtʃ/", ipaTajik: "Вотч", translation: "Соат", emoji: "⌚", example: "My Watch Is Silver.", exampleTrans: "Соати Ман Нуқрагӣ Аст." },
      { word: "Bag", ipa: "/Bæɡ/", ipaTajik: "Бэг", translation: "Халта", emoji: "👜", example: "The Bag Is Heavy.", exampleTrans: "Халта Вазнин Аст." },
      { word: "Backpack", ipa: "/ˈBæk.Pæk/", ipaTajik: "Бэкпэк", translation: "Ҷузвдон", emoji: "🎒", example: "I Put Books In The Backpack.", exampleTrans: "Ман Ба Ҷузвдон Китоб Мегузорам." },
      { word: "Glasses", ipa: "/ˈꞬlɑː.Sɪz/", ipaTajik: "Гласиз", translation: "Айнак", emoji: "🕶", example: "I Wear Glasses.", exampleTrans: "Ман Айнак Мепӯшам." },
      { word: "Ring", ipa: "/Rɪŋ/", ipaTajik: "Ринг", translation: "Ангуштарин", emoji: "💍", example: "The Ring Is Gold.", exampleTrans: "Ангуштарин Тиллоӣ Аст." },
      { word: "Hat", ipa: "/Hæt/", ipaTajik: "Ҳэт", translation: "Кулоҳ", emoji: "👑", example: "The Hat Is Big.", exampleTrans: "Кулоҳ Калон Аст." },
      { word: "Scarf", ipa: "/Skɑːf/", ipaTajik: "Скарф", translation: "Гарданбанд / Шарф", emoji: "🧣", example: "She Is Wearing A Scarf.", exampleTrans: "Ӯ Шарф Пӯшидааст." },
      { word: "Wallet", ipa: "/ˈWɒl.ɪt/", ipaTajik: "Волит", translation: "Ҳамён", emoji: "👛", example: "I Have Money In My Wallet.", exampleTrans: "Ман Дар Ҳамёнам Пул Дорам." },
      { word: "Umbrella", ipa: "/ʌmˈBrel.Ə/", ipaTajik: "Амбрела", translation: "Чатр", emoji: "☂", example: "I Need An Umbrella.", exampleTrans: "Ба Ман Чатр Лозим Аст." },
      { word: "Necklace", ipa: "/ˈNek.Ləs/", ipaTajik: "Неклес", translation: "Гарданбанд", emoji: "📿", example: "The Necklace Is Beautiful.", exampleTrans: "Гарданбанд Зебо Аст." },
      { word: "Earrings", ipa: "/ˈɪə.Rɪŋz/", ipaTajik: "Иэрингз", translation: "Гӯшвор", emoji: "👂", example: "She Wears Silver Earrings.", exampleTrans: "Ӯ Гӯшвори Нуқрагӣ Мепӯшад." },
      { word: "Sunglasses", ipa: "/ˈSʌnˌꞬlɑː.Sɪz/", ipaTajik: "Сангласиз", translation: "Айнаки Офтобӣ", emoji: "🕶", example: "I Wear Sunglasses In Summer.", exampleTrans: "Ман Дар Тобистон Айнаки Офтобӣ Мепӯшам." }
    ],
    // L5: Describing Clothes (14)
    [
      { word: "Big", ipa: "/Bɪɡ/", ipaTajik: "Биг", translation: "Калон", emoji: "📏", example: "This Shirt Is Big.", exampleTrans: "Ин Курта Калон Аст." },
      { word: "Small", ipa: "/Smɔːl/", ipaTajik: "Смол", translation: "Хурд", emoji: "📐", example: "The Hat Is Small.", exampleTrans: "Кулоҳ Хурд Аст." },
      { word: "New", ipa: "/Njuː/", ipaTajik: "Ню", translation: "Нав", emoji: "✨", example: "The Jacket Is New.", exampleTrans: "Куртка Нав Аст." },
      { word: "Old", ipa: "/Əʊld/", ipaTajik: "Оулд", translation: "Кӯҳна", emoji: "📦", example: "These Shoes Are Old.", exampleTrans: "Ин Пойафзолҳо Кӯҳна Ҳастанд." },
      { word: "Beautiful", ipa: "/ˈBjuː.Tɪ.Fəl/", ipaTajik: "Бютифул", translation: "Зебо", emoji: "😊", example: "The Dress Is Beautiful.", exampleTrans: "Курта Зебо Аст." },
      { word: "Nice", ipa: "/Naɪs/", ipaTajik: "Найс", translation: "Хуб", emoji: "👍", example: "You Have Nice Shoes.", exampleTrans: "Шумо Пойафзоли Хуб Доред." },
      { word: "Clean", ipa: "/Kliːn/", ipaTajik: "Клин", translation: "Тоза", emoji: "🧼", example: "My Shirt Is Clean.", exampleTrans: "Куртаи Ман Тоза Аст." },
      { word: "Comfortable", ipa: "/ˈKʌm.Fə.Tə.Bəl/", ipaTajik: "Камфтебел", translation: "Бароҳат", emoji: "🧵", example: "The Shoes Are Comfortable.", exampleTrans: "Пойафзолҳо Бароҳат Ҳастанд." },
      { word: "Dirty", ipa: "/ˈDɜː.Ti/", ipaTajik: "Дёти", translation: "Ифлос", emoji: "🗑", example: "The Pants Are Dirty.", exampleTrans: "Шим Ифлос Аст." },
      { word: "Ugly", ipa: "/ˈʌɡ.Li/", ipaTajik: "Агли", translation: "Хунукрӯй", emoji: "👺", example: "That Hat Is Ugly.", exampleTrans: "Он Кулоҳ Хунукрӯй Аст." },
      { word: "Long", ipa: "/Lɒŋ/", ipaTajik: "Лонг", translation: "Дароз", emoji: "📏", example: "The Skirt Is Long.", exampleTrans: "Доман Дароз Аст." },
      { word: "Short", ipa: "/Ʃɔːt/", ipaTajik: "Шорт", translation: "Кӯтоҳ", emoji: "📏", example: "The Sleeves Are Short.", exampleTrans: "Остинҳо Кӯтоҳ Ҳастанд." },
      { word: "Tight", ipa: "/Taɪt/", ipaTajik: "Тайт", translation: "Танг", emoji: "👕", example: "The Shirt Is Tight.", exampleTrans: "Курта Танг Аст." },
      { word: "Loose", ipa: "/Luːs/", ipaTajik: "Лус", translation: "Кушод", emoji: "👕", example: "The Pants Are Loose.", exampleTrans: "Шим Кушод Аст." }
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
      title: "Clothes And Colors",
      titleTranslated: "Либосҳо Ва Рангҳо",
      explanation: "What Color Is It? (Он Чӣ Ранг Аст?)\nIt Is Red. (Он Сурх Аст.)\nI Am Wearing Black Shoes. (Ман Пойафзоли Сиёҳ Пӯшидаам.)\nHe Is Wearing A Blue Shirt. (Ӯ Куртаи Кабуд Пӯшидааст.)\nShe Is Wearing A Red Dress. (Ӯ Куртаи Сурх Пӯшидааст.)\nThis Shirt Is Blue. (Ин Курта Кабуд Аст.)\nThese Shoes Are Black. (Ин Пойафзолҳо Сиёҳ Ҳастанд.)"
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { grammarTopicId: g1.id } });

  // 5. Comprehension for L6 (Clothes Builder)
  const comp1 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Clothes Builder", titleTranslated: "Сохтмони Либосҳо", cefrLevel: "A1",
      passage: "I Am Wearing A White Shirt And Blue Jeans. My Friend Is Wearing A Red Dress. Her Shoes Are Black.",
      passageTranslated: "Ман Куртаи Сафед Ва Ҷинси Кабуд Пӯшидаам. Дӯсти Ман Куртаи Сурх Пӯшидааст. Пойафзолҳои Ӯ Сиёҳ Ҳастанд.",
      questions: {
        create: [
          { question: "What Color Is My Shirt?", correctIndex: 1, options: ["Blue", "White", "Red"], order: 0 },
          { question: "What Is My Friend Wearing?", correctIndex: 2, options: ["Black Pants", "A White Shirt", "A Red Dress"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[5].id }, data: { comprehensionId: comp1.id } });

  // 6. Dialogue for L7
  const d1 = await prisma.dialogue.create({
    data: {
      courseId: course.id, title: "Clothes Shopping Conversation", titleTranslated: "Муколамаи Хариди Либос", cefrLevel: "A1",
      lines: {
        create: [
          { speaker: "Customer", text: "Hello.", translation: "Салом.", audioUrl: "", order: 0 },
          { speaker: "Shop Assistant", text: "Hello.", translation: "Салом.", audioUrl: "", order: 1 },
          { speaker: "Customer", text: "I Like This Shirt.", translation: "Ин Курта Ба Ман Писанд Аст.", audioUrl: "", order: 2 },
          { speaker: "Shop Assistant", text: "What Color?", translation: "Чӣ Ранг?", audioUrl: "", order: 3 },
          { speaker: "Customer", text: "Blue.", translation: "Кабуд.", audioUrl: "", order: 4 },
          { speaker: "Shop Assistant", text: "Here You Are.", translation: "Марҳамат.", audioUrl: "", order: 5 },
          { speaker: "Customer", text: "Thank You.", translation: "Раҳмат.", audioUrl: "", order: 6 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[6].id }, data: { dialogueId: d1.id } });

  // 7. Comprehension for L8 (Review)
  const comp2 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Module Review", titleTranslated: "Такрори Модул", cefrLevel: "A1",
      passage: "Let's Review Clothes! The Man Is Wearing A Black Suit And A White Shirt. The Woman Is Wearing A Beautiful Yellow Dress And Silver Earrings.",
      passageTranslated: "Биёед Либосҳоро Такрор Кунем! Мард Костюми Сиёҳ Ва Куртаи Сафед Пӯшидааст. Зан Куртаи Зебои Зард Ва Гӯшвори Нуқрагӣ Пӯшидааст.",
      questions: {
        create: [
          { question: "What Is The Man Wearing?", correctIndex: 0, options: ["A Black Suit", "A Yellow Dress", "Silver Earrings"], order: 0 },
          { question: "What Color Is The Dress?", correctIndex: 1, options: ["White", "Yellow", "Black"], order: 1 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[7].id }, data: { comprehensionId: comp2.id } });

  // 8. Comprehension for L9 (Final Exam)
  const comp3 = await prisma.comprehensionExercise.create({
    data: {
      courseId: course.id, title: "Final Exam", titleTranslated: "Имтиҳони Ниҳоӣ", cefrLevel: "A1",
      passage: "Module 10 Final Exam. Test Your Knowledge On Clothes, Colors, And Descriptions.",
      passageTranslated: "Имтиҳони Ниҳоӣ Барои Модули 10. Дониши Худро Оид Ба Либосҳо, Рангҳо Ва Тасвирҳо Санҷед.",
      questions: {
        create: [
          { question: "Translate 'Ман Куртаи Кабуд Пӯшидаам':", correctIndex: 2, options: ["He Is Wearing A Blue Shirt.", "I Have A Blue Shirt.", "I Am Wearing A Blue Shirt."], order: 0 },
          { question: "Choose Correct: These Shoes ___ Black.", correctIndex: 1, options: ["Is", "Are", "Am"], order: 1 },
          { question: "Translate 'Куртаи Нав':", correctIndex: 0, options: ["New Shirt", "Old Shirt", "Big Shirt"], order: 2 },
          { question: "What Is 'Чатр' In English?", correctIndex: 0, options: ["Umbrella", "Wallet", "Scarf"], order: 3 }
        ]
      }
    }
  });
  await prisma.lesson.update({ where: { id: lessons[8].id }, data: { comprehensionId: comp3.id } });

  console.log("Module 10 successfully created!");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
