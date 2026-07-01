import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
  console.log('=== ИСЛОҲИ МОДУЛИ 2 ВА МОДУЛИ 1 ===\n');

  // ══════════════════════════════════════════════
  // ҚАДАМИ 1: Илова кардани рақамҳои 4-9, 11-19
  // ══════════════════════════════════════════════
  const numbersLessonId = 'cmqnoasbl0009m91panjsngcj';

  const newNumbers = [
    { word: 'Four',      ipa: '/fɔːr/',          ipaTajik: 'фор',       translation: 'Чор',       example: 'I have four friends.',       exampleTrans: 'Ман чор дӯст дорам.',        order: 3,  emoji: '4️⃣' },
    { word: 'Five',      ipa: '/faɪv/',          ipaTajik: 'файв',      translation: 'Панҷ',      example: 'It is five o\'clock.',        exampleTrans: 'Соат панҷ аст.',             order: 4,  emoji: '5️⃣' },
    { word: 'Six',       ipa: '/sɪks/',          ipaTajik: 'сикс',      translation: 'Шаш',       example: 'I have six books.',           exampleTrans: 'Ман шаш китоб дорам.',       order: 5,  emoji: '6️⃣' },
    { word: 'Seven',     ipa: '/ˈsev.ən/',       ipaTajik: 'севн',      translation: 'Ҳафт',      example: 'There are seven days.',       exampleTrans: 'Ҳафт рӯз ҳаст.',            order: 6,  emoji: '7️⃣' },
    { word: 'Eight',     ipa: '/eɪt/',           ipaTajik: 'эйт',       translation: 'Ҳашт',      example: 'I am eight years old.',       exampleTrans: 'Ман ҳаштсола ҳастам.',       order: 7,  emoji: '8️⃣' },
    { word: 'Nine',      ipa: '/naɪn/',          ipaTajik: 'найн',      translation: 'Нӯҳ',       example: 'I have nine pencils.',        exampleTrans: 'Ман нӯҳ қалам дорам.',       order: 8,  emoji: '9️⃣' },
    { word: 'Eleven',    ipa: '/ɪˈlev.ən/',      ipaTajik: 'илевн',     translation: 'Ёздаҳ',     example: 'He is eleven years old.',     exampleTrans: 'Ӯ ёздаҳсола аст.',          order: 10, emoji: '1️⃣1️⃣' },
    { word: 'Twelve',    ipa: '/twelv/',          ipaTajik: 'твелв',     translation: 'Дувоздаҳ',  example: 'There are twelve months.',    exampleTrans: 'Дувоздаҳ моҳ ҳаст.',         order: 11, emoji: '1️⃣2️⃣' },
    { word: 'Thirteen',  ipa: '/θɜːˈtiːn/',      ipaTajik: 'сёртийн',   translation: 'Сездаҳ',    example: 'She is thirteen years old.',  exampleTrans: 'Ӯ сездаҳсола аст.',          order: 12, emoji: '1️⃣3️⃣' },
    { word: 'Fourteen',  ipa: '/ˌfɔːˈtiːn/',     ipaTajik: 'фортийн',   translation: 'Чордаҳ',    example: 'I have fourteen books.',      exampleTrans: 'Ман чордаҳ китоб дорам.',    order: 13, emoji: '1️⃣4️⃣' },
    { word: 'Fifteen',   ipa: '/ˌfɪfˈtiːn/',     ipaTajik: 'фифтийн',   translation: 'Понздаҳ',   example: 'He is fifteen years old.',    exampleTrans: 'Ӯ понздаҳсола аст.',         order: 14, emoji: '1️⃣5️⃣' },
    { word: 'Sixteen',   ipa: '/ˌsɪksˈtiːn/',    ipaTajik: 'сикстийн',  translation: 'Шонздаҳ',   example: 'She is sixteen years old.',   exampleTrans: 'Ӯ шонздаҳсола аст.',         order: 15, emoji: '1️⃣6️⃣' },
    { word: 'Seventeen', ipa: '/ˌsev.ənˈtiːn/',  ipaTajik: 'севнтийн',  translation: 'Ҳабдаҳ',    example: 'I am seventeen years old.',   exampleTrans: 'Ман ҳабдаҳсола ҳастам.',     order: 16, emoji: '1️⃣7️⃣' },
    { word: 'Eighteen',  ipa: '/ˌeɪˈtiːn/',      ipaTajik: 'эйтийн',   translation: 'Ҳаждаҳ',    example: 'He is eighteen years old.',   exampleTrans: 'Ӯ ҳаждаҳсола аст.',          order: 17, emoji: '1️⃣8️⃣' },
    { word: 'Nineteen',  ipa: '/ˌnaɪnˈtiːn/',    ipaTajik: 'найнтийн',  translation: 'Нуздаҳ',    example: 'She is nineteen years old.',  exampleTrans: 'Ӯ нуздаҳсола аст.',          order: 18, emoji: '1️⃣9️⃣' },
  ];

  for (const num of newNumbers) {
    await prisma.word.create({
      data: {
        lessonId: numbersLessonId,
        word: num.word,
        ipa: num.ipa,
        ipaTajik: num.ipaTajik,
        translation: num.translation,
        example: num.example,
        exampleTrans: num.exampleTrans,
        order: num.order,
        emoji: num.emoji,
        difficulty: 1,
        partOfSpeech: 'noun',
      }
    });
  }
  console.log('✅ Қадами 1: 15 рақами нав (4-9, 11-19) илова шуд');

  // ══════════════════════════════════════════════
  // ҚАДАМИ 2: Ислоҳи «Uae» → «UAE»
  // ══════════════════════════════════════════════
  const uaeWord = await prisma.word.findFirst({
    where: { lessonId: 'cmqnoasbm000fm91pfvj27qgq', word: 'Uae' }
  });
  if (uaeWord) {
    await prisma.word.update({
      where: { id: uaeWord.id },
      data: {
        word: 'UAE',
        translation: 'Имороти Муттаҳидаи Араб',
        example: 'I work in the UAE.',
        exampleTrans: 'Ман дар Имороти Муттаҳидаи Араб кор мекунам.',
      }
    });
    console.log('✅ Қадами 2: UAE ислоҳ шуд');
  }

  // ══════════════════════════════════════════════
  // ҚАДАМИ 3: Ислоҳи капитализатсияи тарҷумаҳо
  // ══════════════════════════════════════════════
  const capsFixMap = [
    { lessonId: 'cmqnoasbm000mm91pxts5nvdx', word: 'Live',  newTrans: 'зиндагӣ кардан' },
    { lessonId: 'cmqnoasbm000mm91pxts5nvdx', word: 'Here',  newTrans: 'ин ҷо' },
    { lessonId: 'cmqnoasbm000tm91pvxmxprrs', word: 'Speak', newTrans: 'гап задан' },
  ];
  for (const fix of capsFixMap) {
    const w = await prisma.word.findFirst({ where: { lessonId: fix.lessonId, word: fix.word } });
    if (w) {
      await prisma.word.update({ where: { id: w.id }, data: { translation: fix.newTrans } });
    }
  }
  console.log('✅ Қадами 3: Капитализатсия ислоҳ шуд (3 калима)');

  // ══════════════════════════════════════════════
  // ҚАДАМИ 4: Ислоҳи тарҷумаи «Old»
  // ══════════════════════════════════════════════
  const oldWord = await prisma.word.findFirst({
    where: { lessonId: 'cmqnoasbl0002m91ptvoq6yqm', word: 'Old' }
  });
  if (oldWord) {
    await prisma.word.update({
      where: { id: oldWord.id },
      data: { translation: 'Калонсол / Пир' }
    });
    console.log('✅ Қадами 4: Old = «Калонсол / Пир» ислоҳ шуд');
  }

  // ══════════════════════════════════════════════
  // ҚАДАМИ 5: Илова кардани саволҳо ба Module Review
  // ══════════════════════════════════════════════
  const reviewCompId = 'cmqpfwaqz000apxxb5rpaj3x7';

  const newReviewQuestions = [
    {
      exerciseId: reviewCompId,
      question: "How do you say 'Зодрӯз' in English?",
      questionTranslated: "«Зодрӯз» ба англисӣ чӣ мешавад?",
      options: JSON.stringify(['Holiday', 'Birthday', 'Today']),
      correctIndex: 1,
      explanation: 'Зодрӯз = Birthday.',
      order: 2,
    },
    {
      exerciseId: reviewCompId,
      question: "Complete: I ___ from Tajikistan.",
      questionTranslated: "Пур кунед: I ___ from Tajikistan.",
      options: JSON.stringify(['is', 'am', 'are']),
      correctIndex: 1,
      explanation: 'Бо I ҳамеша am. → I am from Tajikistan.',
      order: 3,
    },
    {
      exerciseId: reviewCompId,
      question: "What does 'Language' mean?",
      questionTranslated: "«Language» чӣ маъно дорад?",
      options: JSON.stringify(['Кишвар', 'Забон', 'Шаҳр']),
      correctIndex: 1,
      explanation: 'Language = Забон.',
      order: 4,
    },
    {
      exerciseId: reviewCompId,
      question: "Translate: 'Ман даҳсола ҳастам.'",
      questionTranslated: "Тарҷума кунед: «Ман даҳсола ҳастам.»",
      options: JSON.stringify(['I am ten years old.', 'I am twenty years old.', 'I have ten years.']),
      correctIndex: 0,
      explanation: 'Синну сол: I am ... years old. Даҳ = Ten.',
      order: 5,
    },
  ];

  for (const q of newReviewQuestions) {
    await prisma.comprehensionQuestion.create({ data: q });
  }
  console.log('✅ Қадами 5: 4 саволи нав ба Module Review илова шуд');

  // ══════════════════════════════════════════════
  // ҚАДАМИ 6a: Ислоҳи муколамаи Conversation Practice
  // ══════════════════════════════════════════════
  const dialogueId = 'cmqp81vii000bv8u4wb2rfm9u';

  await prisma.dialogueLine.deleteMany({ where: { dialogueId } });

  const newLines = [
    { dialogueId, speaker: 'Person A', text: 'Hello!',                                         translation: 'Салом!',                                                    isUser: false, order: 0 },
    { dialogueId, speaker: 'Person B', text: 'Hello!',                                         translation: 'Салом!',                                                    isUser: true,  order: 1 },
    { dialogueId, speaker: 'Person A', text: 'What is your name?',                             translation: 'Номи шумо чист?',                                           isUser: false, order: 2 },
    { dialogueId, speaker: 'Person B', text: 'My name is Ali. What is your name?',             translation: 'Номи ман Алӣ аст. Номи шумо чист?',                         isUser: true,  order: 3 },
    { dialogueId, speaker: 'Person A', text: 'My name is Sara. Nice to meet you!',             translation: 'Номи ман Сара аст. Аз шиносоӣ шодам!',                      isUser: false, order: 4 },
    { dialogueId, speaker: 'Person B', text: 'Nice to meet you too! Where are you from?',      translation: 'Ман ҳам аз шиносоӣ шодам! Шумо аз куҷо ҳастед?',            isUser: true,  order: 5 },
    { dialogueId, speaker: 'Person A', text: 'I am from England. And you?',                    translation: 'Ман аз Англия ҳастам. Ва шумо?',                            isUser: false, order: 6 },
    { dialogueId, speaker: 'Person B', text: 'I am from Tajikistan. I am in Dushanbe.',        translation: 'Ман аз Тоҷикистон ҳастам. Ман дар Душанбе ҳастам.',          isUser: true,  order: 7 },
    { dialogueId, speaker: 'Person A', text: 'How old are you?',                               translation: 'Шумо чандсолаед?',                                          isUser: false, order: 8 },
    { dialogueId, speaker: 'Person B', text: 'I am twenty years old. And you?',                translation: 'Ман бистсола ҳастам. Ва шумо?',                              isUser: true,  order: 9 },
    { dialogueId, speaker: 'Person A', text: 'I am nineteen. I speak English.',                translation: 'Ман нуздаҳсола ҳастам. Ман бо англисӣ гап мезанам.',          isUser: false, order: 10 },
    { dialogueId, speaker: 'Person B', text: 'I speak Tajik and English. Goodbye!',            translation: 'Ман бо тоҷикӣ ва англисӣ гап мезанам. Хайр!',               isUser: true,  order: 11 },
    { dialogueId, speaker: 'Person A', text: 'Goodbye!',                                       translation: 'Хайр!',                                                     isUser: false, order: 12 },
  ];

  for (const line of newLines) {
    await prisma.dialogueLine.create({ data: line });
  }

  await prisma.dialogue.update({
    where: { id: dialogueId },
    data: { scenario: 'Шумо бо як шахси нав шинос мешавед. Дар бораи ном, кишвар, синну сол ва забон гуфтугӯ мекунед.' }
  });
  console.log('✅ Қадами 6a: Муколамаи Conversation Practice ислоҳ шуд');

  // ══════════════════════════════════════════════
  // ҚАДАМИ 6b: Ислоҳи имтиҳони ниҳоӣ
  // ══════════════════════════════════════════════
  const examCompId = 'cmqpfwcec000epxxbd1ijaoxw';

  await prisma.comprehensionExercise.update({
    where: { id: examCompId },
    data: {
      passage: 'Hello! My name is Anna. I am from England. I am in London. I am twenty years old. I speak English and Russian. My friend is Karim. He is from Tajikistan. He is in Dushanbe. He is nineteen years old. He speaks Tajik and English.',
      passageTranslated: 'Салом! Номи ман Анна аст. Ман аз Англия ҳастам. Ман дар Лондон ҳастам. Ман бистсола ҳастам. Ман бо англисӣ ва русӣ гап мезанам. Дӯсти ман Карим аст. Ӯ аз Тоҷикистон аст. Ӯ дар Душанбе аст. Ӯ нуздаҳсола аст. Ӯ бо тоҷикӣ ва англисӣ гап мезанад.',
    }
  });

  // Q3: fix — remove "a little"
  await prisma.comprehensionQuestion.update({
    where: { id: 'cmqw0w0yx000559neuevlqrjf' },
    data: {
      question: 'What languages does Anna speak?',
      questionTranslated: 'Анна кадом забонҳоро медонад?',
      options: JSON.stringify(['Tajik and English', 'English and Russian', 'Tajik and Russian']),
      correctIndex: 1,
      explanation: 'Матн: I speak English and Russian.',
    }
  });

  // Q4: Where does Karim live? → Where is Karim?
  await prisma.comprehensionQuestion.update({
    where: { id: 'cmqw0w1bv000759newrr30wf6' },
    data: {
      question: 'Where is Karim?',
      questionTranslated: 'Карим дар куҷост?',
      options: JSON.stringify(['London', 'Dushanbe', 'Moscow']),
      correctIndex: 1,
      explanation: 'Матн: He is in Dushanbe.',
    }
  });

  // Q8: Replace with Karim's age question (tests newly taught numbers)
  await prisma.comprehensionQuestion.update({
    where: { id: 'cmqw0w2rq000f59nei91ag8ae' },
    data: {
      question: 'How old is Karim?',
      questionTranslated: 'Карим чандсола аст?',
      options: JSON.stringify(['Nineteen', 'Twenty', 'Eighteen']),
      correctIndex: 0,
      explanation: 'Матн: He is nineteen years old. Нуздаҳ = Nineteen.',
    }
  });

  console.log('✅ Қадами 6b: Имтиҳони ниҳоӣ ислоҳ шуд');

  // ══════════════════════════════════════════════
  // ҚАДАМИ 7: Ислоҳи тарҷумаҳои Модули 1
  // ══════════════════════════════════════════════
  const sorryWord = await prisma.word.findFirst({
    where: { word: 'Sorry', lesson: { module: { order: 0 } } }
  });
  if (sorryWord) {
    await prisma.word.update({
      where: { id: sorryWord.id },
      data: { exampleTrans: 'Бубахшед. / Ман узр мехоҳам.' }
    });
    console.log('✅ Қадами 7a: Sorry тарҷума ислоҳ шуд');
  }

  const welcomeWord = await prisma.word.findFirst({
    where: { word: "You're welcome", lesson: { module: { order: 0 } } }
  });
  if (welcomeWord) {
    await prisma.word.update({
      where: { id: welcomeWord.id },
      data: { exampleTrans: 'Раҳмат! Хоҳиш мекунам.' }
    });
    console.log('✅ Қадами 7b: You\'re welcome тарҷума ислоҳ шуд');
  }

  // ══════════════════════════════════════════════
  // ТАФТИШ
  // ══════════════════════════════════════════════
  console.log('\n=== ТАФТИШ ===');
  const numWords = await prisma.word.count({ where: { lessonId: numbersLessonId } });
  console.log(`Рақамҳои дарси Numbers: ${numWords} калима (бояд 20 бошад)`);

  const reviewQs = await prisma.comprehensionQuestion.count({ where: { exerciseId: reviewCompId } });
  console.log(`Саволҳои Module Review: ${reviewQs} савол (бояд 6 бошад)`);

  const examQs = await prisma.comprehensionQuestion.count({ where: { exerciseId: examCompId } });
  console.log(`Саволҳои Final Exam: ${examQs} савол (бояд 8 бошад)`);

  const dialogLines = await prisma.dialogueLine.count({ where: { dialogueId } });
  console.log(`Сатрҳои муколама: ${dialogLines} сатр (бояд 13 бошад)`);

  console.log('\n=== ҲАМАИ ИСЛОҲОТ БОМУВАФФАҚИЯТ АНҶОМ ЁФТАНД! ===');

  await prisma.$disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
