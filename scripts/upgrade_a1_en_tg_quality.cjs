const fs = require('fs');
const path = require('path');

function loadDatabaseUrl() {
  if (process.env.DATABASE_URL) return;
  const envPath = path.join(__dirname, '..', '.env');
  const raw = fs.readFileSync(envPath, 'utf8');
  const line = raw.split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL='));
  if (!line) throw new Error('DATABASE_URL is missing');
  process.env.DATABASE_URL = line.slice('DATABASE_URL='.length).trim().replace(/^"|"$/g, '');
}

loadDatabaseUrl();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const titleUpdates = [
  ['Greetings & Introductions', 'Greetings & Introductions · Part 9', 'Evening greetings and polite words', 'Саломҳои шом ва ибораҳои одоб'],
  ['Numbers, Time & Dates', 'Numbers, Time & Dates · Part 7', 'Numbers 16-90', 'Рақамҳо аз 16 то 90'],
  ['Numbers, Time & Dates', 'Numbers, Time & Dates · Part 8', 'Ordinals and time words', 'Тартиб ва калимаҳои вақт'],
  ['Numbers, Time & Dates', 'Numbers, Time & Dates · Part 9', 'Seasons and late-year months', 'Фаслҳо ва моҳҳои охири сол'],
  ['Me & Family', 'Me & Family · Part 9', 'Extended family', 'Оилаи васеъ'],
  ['Me & Family', 'Me & Family · Part 10', 'People around me', 'Одамони атрофи ман'],
  ['Colors, Objects & Classroom', 'Colors, Objects & Classroom · Part 7', 'More colors and study tools', 'Рангҳои бештар ва ашёи таҳсил'],
  ['Colors, Objects & Classroom', 'Colors, Objects & Classroom · Part 8', 'Classroom language', 'Забони синф'],
  ['Food & Drink', 'Food & Drink · Part 9', 'Meals and ingredients', 'Хӯрокҳо ва маҳсулот'],
  ['Food & Drink', 'Food & Drink · Part 10', 'Meals and tableware', 'Вақтҳои хӯрок ва зарфҳо'],
  ['My Day', 'My Day · Part 6', 'Everyday actions 1', 'Амалҳои ҳаррӯза 1'],
  ['My Day', 'My Day · Part 7', 'Everyday actions 2', 'Амалҳои ҳаррӯза 2'],
  ['My Day', 'My Day · Part 8', 'Thinking and learning verbs', 'Феълҳои фикр ва омӯзиш'],
  ['Home & Rooms', 'Home & Rooms · Part 9', 'Things in the home', 'Ашёи хона'],
  ['Clothes & Weather', 'Clothes & Weather · Part 9', 'Clothes and rainy weather', 'Либос ва ҳавои боронӣ'],
  ['Clothes & Weather', 'Clothes & Weather · Part 10', 'Sky and cold weather', 'Осмон ва ҳавои хунук'],
  ['Transport & Travel', 'Transport & Travel · Part 9', 'Travel objects and actions', 'Ашё ва амалҳои сафар'],
  ['Health & Help', 'Health & Help · Part 9', 'Symptoms and medical help', 'Аломатҳо ва ёрии тиббӣ'],
  ['Health & Help', 'Health & Help · Part 10', 'Body parts', 'Қисмҳои бадан'],
  ['Work & School', 'Work & School · Part 9', 'Work and study life', 'Кор ва ҳаёти таҳсил'],
  ['Places & Directions', 'Places & Directions · Part 9', 'Public places and movement', 'Ҷойҳои ҷамъиятӣ ва ҳаракат'],
  ['Places & Directions', 'Places & Directions · Part 10', 'Position words', 'Калимаҳои ҷойгиршавӣ'],
  ['Ability & Now', 'Ability & Now · Part 6', 'Common describing words', 'Калимаҳои маъмули тавсиф'],
  ['Ability & Now', 'Ability & Now · Part 7', 'States and conditions', 'Ҳолатҳо ва вазъиятҳо'],
];

const grammarSets = {
  'Verb "to be" (am / is / are)': [
    ['fill_blank', 'Complete: I ___ a student.', 'am', 'Ҷумларо пур кунед: Ман донишҷӯ ҳастам.', null, 'Бо I ҳамеша am меояд.'],
    ['reorder', 'Put the words in order: happy / is / She', 'She is happy', 'Калимаҳоро бо тартиби дуруст нависед.', null, 'Дар англисӣ тартиб одатан Subject + verb + adjective аст.'],
    ['transform', 'Make it negative: They are doctors.', 'They are not doctors', 'Ҷумларо манфӣ кунед.', null, 'Барои to be, not баъд аз am/is/are меояд.'],
  ],
  'Subject pronouns': [
    ['fill_blank', 'Complete: Ali is my friend. ___ is kind.', 'He', 'Ҷонишини дурустро нависед.', null, 'Ali мард аст, бинобар ин he истифода мешавад.'],
    ['fill_blank', 'Complete: Madina is a teacher. ___ is nice.', 'She', 'Ҷонишини дурустро нависед.', null, 'Madina зан аст, бинобар ин she истифода мешавад.'],
  ],
  'Articles a / an': [
    ['fill_blank', 'Complete: This is ___ apple.', 'an', 'a ё an-ро нависед.', null, 'Пеш аз садои vowel (apple) an меояд.'],
    ['fill_blank', 'Complete: I have ___ book.', 'a', 'a ё an-ро нависед.', null, 'Пеш аз садои consonant (book) a меояд.'],
    ['reorder', 'Put the words in order: an / egg / It is', 'It is an egg', 'Калимаҳоро бо тартиби дуруст нависед.', null, 'an пеш аз egg меояд.'],
  ],
  'Plural nouns': [
    ['fill_blank', 'Complete: one book, two ___.', 'books', 'Шакли ҷамъро нависед.', null, 'Аксар исмҳо бо -s ҷамъ мешаванд.'],
    ['transform', 'Make it plural: This is a pen.', 'These are pens', 'Ҷумларо ба шакли ҷамъ гардонед.', null, 'This is -> These are, pen -> pens.'],
  ],
  'This / That / These / Those': [
    ['fill_blank', 'Complete: ___ are my books. (near)', 'These', 'Барои чизҳои наздик ҷонишини дурустро нависед.', null, 'These барои чизҳои ҷамъ ва наздик аст.'],
    ['fill_blank', 'Complete: ___ is my house. (far)', 'That', 'Барои чизи дур ҷонишини дурустро нависед.', null, 'That барои як чиз ва дур аст.'],
  ],
  'Have got / Has got': [
    ['fill_blank', 'Complete: She ___ got a brother.', 'has', 'Шакли дурусти have/has-ро нависед.', null, 'Бо he/she/it шакли has got меояд.'],
    ['transform', 'Make it negative: I have got a car.', 'I have not got a car', 'Ҷумларо манфӣ кунед.', null, 'Дар A1 шакли пурра фаҳмотар аст: have not got.'],
  ],
  'Possessive adjectives': [
    ['fill_blank', 'Complete: I am Ali. ___ name is Ali.', 'My', 'Сифати соҳибиро нависед.', null, 'I -> my.'],
    ['fill_blank', 'Complete: She is Madina. ___ bag is red.', 'Her', 'Сифати соҳибиро нависед.', null, 'She -> her.'],
  ],
  'Present Simple': [
    ['fill_blank', 'Complete: I ___ English every day.', 'study', 'Феъли дурустро нависед.', null, 'Бо I феъл бе -s меояд.'],
    ['fill_blank', 'Complete: He ___ to school.', 'goes', 'Феъли дурустро нависед.', null, 'Бо he/she/it дар present simple одатан -s/-es меояд.'],
    ['reorder', 'Put the words in order: every day / I / read', 'I read every day', 'Калимаҳоро бо тартиби дуруст нависед.', null, 'Тартиби содда: Subject + verb + time.'],
  ],
  'Questions with do / does': [
    ['fill_blank', 'Complete: ___ you like tea?', 'Do', 'Do ё Does-ро нависед.', null, 'Бо you савол бо Do оғоз мешавад.'],
    ['fill_blank', 'Complete: ___ she speak English?', 'Does', 'Do ё Does-ро нависед.', null, 'Бо she савол бо Does оғоз мешавад.'],
    ['transform', 'Make a question: You live here.', 'Do you live here?', 'Ҷумларо саволӣ кунед.', null, 'Дар present simple барои савол do/does лозим аст.'],
  ],
  'Can (ability)': [
    ['fill_blank', 'Complete: I ___ swim.', 'can', 'Феъли modal-ро нависед.', null, 'Can барои тавоноӣ истифода мешавад.'],
    ['transform', 'Make it negative: She can drive.', 'She cannot drive', 'Ҷумларо манфӣ кунед.', null, 'Шакли пурра: cannot.'],
  ],
  'There is / There are': [
    ['fill_blank', 'Complete: There ___ a book on the table.', 'is', 'is ё are-ро нависед.', null, 'Як чиз: there is.'],
    ['fill_blank', 'Complete: There ___ three chairs.', 'are', 'is ё are-ро нависед.', null, 'Чанд чиз: there are.'],
  ],
  'Prepositions of place': [
    ['fill_blank', 'Complete: The book is ___ the table.', 'on', 'Пешоянди ҷойро нависед.', null, 'On маънои “дар рӯи” дорад.'],
    ['fill_blank', 'Complete: The bag is ___ the chair.', 'under', 'Пешоянди ҷойро нависед.', null, 'Under маънои “дар зери” дорад.'],
  ],
  "Like / Don't like": [
    ['fill_blank', 'Complete: I ___ apples.', 'like', 'Like ё do not like-ро нависед.', null, 'I like... = Ман дӯст медорам.'],
    ['transform', 'Make it negative: I like coffee.', 'I do not like coffee', 'Ҷумларо манфӣ кунед.', null, 'Дар present simple бо I: do not + verb.'],
  ],
  'Question words': [
    ['fill_blank', 'Complete: ___ is your name?', 'What', 'Калимаи саволиро нависед.', null, 'What барои “чӣ” истифода мешавад.'],
    ['fill_blank', 'Complete: ___ do you live?', 'Where', 'Калимаи саволиро нависед.', null, 'Where барои “дар куҷо” истифода мешавад.'],
  ],
  'Present Continuous': [
    ['fill_blank', 'Complete: I am ___ now.', 'reading', 'Шакли -ing-ро нависед.', null, 'Present continuous: am/is/are + verb-ing.'],
    ['transform', 'Make it negative: He is sleeping.', 'He is not sleeping', 'Ҷумларо манфӣ кунед.', null, 'not баъд аз is меояд.'],
  ],
  'Imperatives': [
    ['fill_blank', 'Complete the command: ___ the door.', 'Open', 'Феъли амриро нависед.', null, 'Феъли амрӣ аз худи феъл оғоз мешавад.'],
    ['transform', 'Make it negative: Sit down.', 'Do not sit down', 'Фармонро манфӣ кунед.', null, 'Фармони манфӣ бо Do not оғоз мешавад.'],
  ],
};

const tajikClinic = [
  {
    title: 'Tajik speakers: English word order',
    titleTranslated: 'Барои тоҷикзабонҳо: тартиби калимаҳо',
    module: 'My Day',
    explanation:
      '**Дар тоҷикӣ** ҷойи калимаҳо чандиртар аст, аммо дар англисӣ ҷумлаи содда одатан тартиби устувор дорад:\n- Subject + verb + object/place/time\n- I study English every day.\n- She lives in Dushanbe.',
    rules: [
      ['Subject + verb + object', 'Аввал шахс ё чиз, баъд феъл, баъд маълумоти асосӣ меояд.'],
      ['Time words usually go at the end', 'every day, today, in the morning аксар вақт дар охир меоянд.'],
    ],
    examples: [
      ['I study English every day.', 'Ман ҳар рӯз англисӣ меомӯзам.', 'study'],
      ['She goes to school in the morning.', 'Ӯ саҳар ба мактаб меравад.', 'goes'],
      ['We drink tea at home.', 'Мо дар хона чой менӯшем.', 'drink'],
    ],
    exercises: [
      ['reorder', 'Put the words in order: English / I / study', 'I study English', 'Калимаҳоро бо тартиби англисӣ нависед.', null, 'Аввал I, баъд study, баъд English.'],
      ['reorder', 'Put the words in order: to school / She / goes', 'She goes to school', 'Калимаҳоро бо тартиби англисӣ нависед.', null, 'Subject + verb + place.'],
    ],
  },
  {
    title: 'Tajik speakers: he and she',
    titleTranslated: 'Барои тоҷикзабонҳо: he ва she',
    module: 'Me & Family',
    explanation:
      'Дар тоҷикӣ “ӯ” барои мард ва зан як хел аст. Дар англисӣ бояд фарқ кунем:\n- **he** = ӯ (мард)\n- **she** = ӯ (зан)',
    rules: [
      ['Ali -> he', 'Барои мард he истифода мешавад.'],
      ['Madina -> she', 'Барои зан she истифода мешавад.'],
    ],
    examples: [
      ['Ali is my brother. He is kind.', 'Алӣ бародари ман аст. Ӯ меҳрубон аст.', 'He'],
      ['Madina is my sister. She is a student.', 'Мадина хоҳари ман аст. Ӯ донишҷӯ аст.', 'She'],
    ],
    exercises: [
      ['fill_blank', 'Complete: Rustam is my father. ___ is a doctor.', 'He', 'Ҷонишини дурустро нависед.', null, 'Rustam мард аст.'],
      ['fill_blank', 'Complete: Zarina is my mother. ___ is kind.', 'She', 'Ҷонишини дурустро нависед.', null, 'Zarina зан аст.'],
    ],
  },
];

const pronunciationWords = [
  ['think', 'фикр кардан', '/θɪŋk/', '🤔', 'I think it is good.', 'Ман фикр мекунам, ки ин хуб аст.'],
  ['three', 'се', '/θriː/', '3️⃣', 'I have three books.', 'Ман се китоб дорам.'],
  ['this', 'ин', '/ðɪs/', '👉', 'This is my bag.', 'Ин сумкаи ман аст.'],
  ['water', 'об', '/ˈwɔːtər/', '💧', 'I drink water.', 'Ман об менӯшам.'],
  ['very', 'хеле', '/ˈveri/', '⭐', 'It is very good.', 'Ин хеле хуб аст.'],
  ['where', 'дар куҷо', '/wer/', '📍', 'Where is the bus stop?', 'Истгоҳи автобус дар куҷост?'],
];

const finalReading = {
  title: 'A1 Reading Exam: Daily Life',
  titleTranslated: 'Имтиҳони A1: Хониш - ҳаёти ҳаррӯза',
  passage:
    'My name is Amir. I am from Tajikistan. I live in Dushanbe with my family. Every morning I go to school by bus. After school, I read a book and help my mother at home. In the evening, we drink tea and talk together.',
  passageTranslated:
    'Номи ман Амир аст. Ман аз Тоҷикистон ҳастам. Ман дар Душанбе бо оилаам зиндагӣ мекунам. Ҳар саҳар ман бо автобус ба мактаб меравам. Баъд аз мактаб китоб мехонам ва ба модарам дар хона кӯмак мекунам. Шом мо чой менӯшем ва якҷоя суҳбат мекунем.',
  questions: [
    ['Where is Amir from?', ['Tajikistan', 'England', 'Russia', 'China'], 0, 'Дар матн гуфта шудааст: I am from Tajikistan.'],
    ['Where does Amir live?', ['In Dushanbe', 'In London', 'At the airport', 'In a shop'], 0, 'Матн мегӯяд: I live in Dushanbe.'],
    ['How does Amir go to school?', ['By bus', 'By train', 'By plane', 'By bike'], 0, 'Матн мегӯяд: I go to school by bus.'],
    ['What does Amir do after school?', ['He reads a book and helps at home', 'He buys a car', 'He goes to the cinema', 'He cooks dinner at school'], 0, 'Баъд аз мактаб ӯ китоб мехонад ва дар хона кӯмак мекунад.'],
    ['What do they drink in the evening?', ['Tea', 'Coffee', 'Juice', 'Water'], 0, 'Дар охир гуфта шудааст: we drink tea.'],
  ],
};

function normalizeWord(s) {
  return s.trim().toLowerCase();
}

function inferPartOfSpeech(word) {
  const w = normalizeWord(word).replace(/[?.!]/g, '');
  if (/\s/.test(w)) return 'phrase';
  if (/^(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|first|second|third)$/.test(w)) return 'numeral';
  if (/^(i|you|he|she|it|we|they|me|him|her|us|them|my|your|his|our|their)$/.test(w)) return 'pronoun';
  if (/^(in|on|under|between|near|next|to|from|with|at|by|for|of|up|down|here|there)$/.test(w)) return 'preposition';
  if (/^(and|but|or|because)$/.test(w)) return 'conjunction';
  if (/^(hello|hi|goodbye|please|yes|no|thanks|thank you|welcome)$/.test(w)) return 'interjection';
  if (/^(go|come|see|look|listen|watch|walk|wash|sit|stand|start|finish|give|make|say|ask|know|think|learn|love|wait|read|write|speak|study|work|play|eat|drink|buy|open|close|help|need|want|like|live|sleep|fly|ride|feel|have|be|am|is|are|can)$/.test(w)) return 'verb';
  if (/^(good|bad|big|small|hot|cold|warm|cool|new|old|young|beautiful|tall|short|long|fast|slow|easy|difficult|clean|dirty|full|empty|strong|ready|red|blue|green|yellow|black|white|pink|purple|grey|healthy|sweet)$/.test(w)) return 'adjective';
  if (/^(today|tomorrow|yesterday|now|morning|evening|night|always|often)$/.test(w)) return 'adverb';
  return 'noun';
}

async function getCourse() {
  const [target, native] = await Promise.all([
    prisma.language.findUnique({ where: { code: 'en' } }),
    prisma.language.findUnique({ where: { code: 'tg' } }),
  ]);
  if (!target || !native) throw new Error('English or Tajik language is missing');
  const course = await prisma.course.findFirst({
    where: { targetLanguageId: target.id, nativeLanguageId: native.id, level: 'A1' },
    include: { modules: { include: { lessons: { include: { words: true } } } } },
  });
  if (!course) throw new Error('A1 English->Tajik course is missing');
  return { course, target, native };
}

async function renameGenericLessons(course) {
  let count = 0;
  for (const [moduleTitle, oldTitle, title, titleTranslated] of titleUpdates) {
    const module = course.modules.find((m) => m.title === moduleTitle);
    if (!module) continue;
    const lesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, title: oldTitle } });
    if (!lesson) continue;
    await prisma.lesson.update({ where: { id: lesson.id }, data: { title, titleTranslated } });
    count++;
  }
  return count;
}

async function setWordMetadata(course) {
  let count = 0;
  const lessons = course.modules.flatMap((m) => m.lessons);
  let rank = 1;
  const updates = [];
  for (const lesson of lessons.sort((a, b) => a.order - b.order)) {
    for (const word of lesson.words.sort((a, b) => a.order - b.order)) {
      const data = {};
      if (!word.partOfSpeech) data.partOfSpeech = inferPartOfSpeech(word.word);
      if (!word.frequencyRank) data.frequencyRank = rank;
      rank++;
      if (Object.keys(data).length) {
        updates.push(() => prisma.word.update({ where: { id: word.id }, data }));
        count++;
      }
    }
  }
  for (let i = 0; i < updates.length; i += 25) {
    await Promise.all(updates.slice(i, i + 25).map((fn) => fn()));
  }
  return count;
}

async function ensureExercise(topicId, spec) {
  const [type, prompt, answer, promptTranslated, options, explanation] = spec;
  const existing = await prisma.grammarExercise.findFirst({ where: { topicId, prompt } });
  if (existing) {
    await prisma.grammarExercise.update({
      where: { id: existing.id },
      data: { type, answer, promptTranslated, explanation, ...(options ? { options } : {}) },
    });
    return false;
  }
  const last = await prisma.grammarExercise.findFirst({
    where: { topicId },
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  await prisma.grammarExercise.create({
    data: {
      topicId,
      type,
      prompt,
      answer,
      promptTranslated,
      options: options || undefined,
      explanation,
      order: (last?.order ?? 0) + 1,
    },
  });
  return true;
}

async function addGrammarDiversity(course) {
  const topics = await prisma.grammarTopic.findMany({ where: { courseId: course.id } });
  let created = 0;
  for (const topic of topics) {
    const specs = grammarSets[topic.title];
    if (!specs) continue;
    for (const spec of specs) {
      if (await ensureExercise(topic.id, spec)) created++;
    }
  }
  return created;
}

async function ensureTopic(course, moduleTitle, data) {
  let topic = await prisma.grammarTopic.findFirst({ where: { courseId: course.id, title: data.title } });
  if (!topic) {
    topic = await prisma.grammarTopic.create({
      data: {
        courseId: course.id,
        cefrLevel: 'A1',
        title: data.title,
        titleTranslated: data.titleTranslated,
        explanation: data.explanation,
        emoji: '🎯',
        order: 850,
        isActive: true,
      },
    });
  } else {
    topic = await prisma.grammarTopic.update({
      where: { id: topic.id },
      data: {
        titleTranslated: data.titleTranslated,
        explanation: data.explanation,
        cefrLevel: 'A1',
        isActive: true,
      },
    });
  }

  for (let i = 0; i < data.rules.length; i++) {
    const [pattern, note] = data.rules[i];
    const existing = await prisma.grammarRule.findFirst({ where: { topicId: topic.id, pattern } });
    if (!existing) await prisma.grammarRule.create({ data: { topicId: topic.id, pattern, note, order: i } });
  }
  for (let i = 0; i < data.examples.length; i++) {
    const [sentence, translation, highlight] = data.examples[i];
    const existing = await prisma.grammarExample.findFirst({ where: { topicId: topic.id, sentence } });
    if (!existing) await prisma.grammarExample.create({ data: { topicId: topic.id, sentence, translation, highlight, order: i } });
  }
  for (const spec of data.exercises) await ensureExercise(topic.id, spec);

  const module = course.modules.find((m) => m.title === moduleTitle);
  if (module) {
    const existingLesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, grammarTopicId: topic.id } });
    if (!existingLesson) {
      const last = await prisma.lesson.findFirst({ where: { moduleId: module.id }, orderBy: { order: 'desc' }, select: { order: true } });
      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: data.title,
          titleTranslated: data.titleTranslated,
          type: 'vocab',
          cefrLevel: 'A1',
          skillType: 'grammar',
          emoji: '🎯',
          xpReward: 80,
          duration: 6,
          order: (last?.order ?? 0) + 1,
          grammarTopicId: topic.id,
          isActive: true,
        },
      });
    }
  }
  return topic;
}

async function addTajikClinic(course) {
  let count = 0;
  for (const clinic of tajikClinic) {
    await ensureTopic(course, clinic.module, clinic);
    count++;
  }

  const module = course.modules.find((m) => m.title === 'Alphabet & Sounds');
  if (!module) return count;
  let lesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, title: 'Pronunciation: th, w and v' } });
  if (!lesson) {
    const last = await prisma.lesson.findFirst({ where: { moduleId: module.id }, orderBy: { order: 'desc' }, select: { order: true } });
    lesson = await prisma.lesson.create({
      data: {
        moduleId: module.id,
        title: 'Pronunciation: th, w and v',
        titleTranslated: 'Талаффуз: th, w ва v',
        type: 'vocab',
        cefrLevel: 'A1',
        skillType: 'speaking',
        emoji: '🎙️',
        xpReward: 80,
        duration: 6,
        order: (last?.order ?? 2) + 1,
        isActive: true,
      },
    });
  }

  for (let i = 0; i < pronunciationWords.length; i++) {
    const [word, translation, ipa, emoji, example, exampleTrans] = pronunciationWords[i];
    const existing = await prisma.word.findFirst({ where: { lessonId: lesson.id, word } });
    if (!existing) {
      await prisma.word.create({
        data: {
          lessonId: lesson.id,
          word,
          translation,
          ipa,
          emoji,
          example,
          exampleTrans,
          partOfSpeech: inferPartOfSpeech(word),
          frequencyRank: 900 + i,
          order: i,
          difficulty: 2,
        },
      });
    }
  }
  return count + 1;
}

async function addFinalReadingExam(course) {
  const module = course.modules.find((m) => m.title === 'Shopping & Review');
  if (!module) return false;

  let exercise = await prisma.comprehensionExercise.findFirst({
    where: { courseId: course.id, title: finalReading.title },
  });
  if (!exercise) {
    exercise = await prisma.comprehensionExercise.create({
      data: {
        courseId: course.id,
        cefrLevel: 'A1',
        kind: 'reading',
        title: finalReading.title,
        titleTranslated: finalReading.titleTranslated,
        passage: finalReading.passage,
        passageTranslated: finalReading.passageTranslated,
        emoji: '📖',
        order: 950,
        isActive: true,
      },
    });
  } else {
    exercise = await prisma.comprehensionExercise.update({
      where: { id: exercise.id },
      data: {
        kind: 'reading',
        titleTranslated: finalReading.titleTranslated,
        passage: finalReading.passage,
        passageTranslated: finalReading.passageTranslated,
        cefrLevel: 'A1',
        isActive: true,
      },
    });
  }

  await prisma.comprehensionQuestion.deleteMany({ where: { exerciseId: exercise.id } });
  for (let i = 0; i < finalReading.questions.length; i++) {
    const [question, options, correctIndex, explanation] = finalReading.questions[i];
    await prisma.comprehensionQuestion.create({
      data: {
        exerciseId: exercise.id,
        question,
        questionTranslated: '',
        options,
        correctIndex,
        explanation,
        order: i,
      },
    });
  }

  let lesson = await prisma.lesson.findFirst({ where: { moduleId: module.id, title: 'A1 Reading Exam' } });
  if (!lesson) {
    await prisma.lesson.updateMany({ where: { moduleId: module.id, order: { gte: 5 } }, data: { order: { increment: 1 } } });
    lesson = await prisma.lesson.create({
      data: {
        moduleId: module.id,
        title: 'A1 Reading Exam',
        titleTranslated: 'Имтиҳони A1: Хониш',
        type: 'vocab',
        cefrLevel: 'A1',
        skillType: 'reading',
        emoji: '📖',
        xpReward: 120,
        duration: 7,
        order: 5,
        comprehensionId: exercise.id,
        isActive: true,
      },
    });
  } else {
    await prisma.lesson.update({
      where: { id: lesson.id },
      data: {
        titleTranslated: 'Имтиҳони A1: Хониш',
        skillType: 'reading',
        cefrLevel: 'A1',
        comprehensionId: exercise.id,
        order: 5,
        isActive: true,
      },
    });
  }

  const examOrder = [
    ['A1 Reading Exam', 5],
    ['A1 Listening Exam', 6],
    ['A1 Writing Exam', 7],
    ['A1 Speaking Exam', 8],
    ['A1 Final Mastery Test', 9],
  ];
  for (const [title, order] of examOrder) {
    const row = await prisma.lesson.findFirst({ where: { moduleId: module.id, title } });
    if (row) await prisma.lesson.update({ where: { id: row.id }, data: { order, cefrLevel: 'A1' } });
  }
  return true;
}

async function audit(course) {
  const fresh = await prisma.course.findUnique({
    where: { id: course.id },
    include: {
      modules: { include: { lessons: { include: { words: true } } } },
      grammarTopics: { include: { exercises: true } },
      comprehensions: { include: { questions: true } },
    },
  });
  const lessons = fresh.modules.flatMap((m) => m.lessons);
  const words = lessons.flatMap((l) => l.words);
  const bySkill = lessons.reduce((acc, l) => {
    acc[l.skillType] = (acc[l.skillType] || 0) + 1;
    return acc;
  }, {});
  const grammarTypes = fresh.grammarTopics.flatMap((t) => t.exercises).reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});
  return {
    modules: fresh.modules.length,
    lessons: lessons.length,
    words: words.length,
    wordsMissingPos: words.filter((w) => !w.partOfSpeech).length,
    grammarTopics: fresh.grammarTopics.length,
    grammarExercises: fresh.grammarTopics.reduce((s, t) => s + t.exercises.length, 0),
    grammarTypes,
    comprehensions: fresh.comprehensions.length,
    comprehensionQuestions: fresh.comprehensions.reduce((s, c) => s + c.questions.length, 0),
    bySkill,
  };
}

async function main() {
  const { course } = await getCourse();
  const renamed = await renameGenericLessons(course);
  const metadata = await setWordMetadata(course);
  const grammarCreated = await addGrammarDiversity(course);
  const clinic = await addTajikClinic(course);
  const finalExam = await addFinalReadingExam(course);
  const stats = await audit(course);
  console.log(JSON.stringify({ ok: true, renamed, metadata, grammarCreated, clinic, finalExam, stats }, null, 2));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
