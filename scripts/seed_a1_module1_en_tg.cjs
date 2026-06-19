/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const TARGET_CODE = 'en';
const NATIVE_CODE = 'tg';
const LEVEL = 'A1';

function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

function tuneDatabaseUrl() {
  if (!process.env.DATABASE_URL) return;
  const url = new URL(process.env.DATABASE_URL);
  url.searchParams.set('connection_limit', '1');
  url.searchParams.set('pool_timeout', '60');
  url.searchParams.set('connect_timeout', '60');
  process.env.DATABASE_URL = url.toString();
}

loadEnv();
tuneDatabaseUrl();

const prisma = new PrismaClient();

const CEFR_DESCRIPTORS = [
  {
    skill: 'overall',
    canDo: 'Дар сатҳи A1 донишомӯз метавонад калимаҳо ва ҷумлаҳои хеле соддаро фаҳмад ва истифода барад: салом додан, худро муаррифӣ кардан, рақамҳо гуфтан ва ба саволҳои кӯтоҳ ҷавоб додан.',
  },
  {
    skill: 'listening',
    canDo: 'Метавонад калимаҳо, рақамҳо ва ибораҳои хеле шиносро, агар оҳиста ва равшан гуфта шаванд, бишнавад ва шиносад.',
  },
  {
    skill: 'speaking',
    canDo: 'Метавонад бо ҷумлаҳои кӯтоҳ салом диҳад, номашро гӯяд, синну солашро баён кунад ва аз шахси дигар ном пурсад.',
  },
  {
    skill: 'reading',
    canDo: 'Метавонад калимаҳо ва ҷумлаҳои кӯтоҳи A1-ро хонад: Hello, My name is..., I am..., рақамҳо ва ибораҳои оддӣ.',
  },
  {
    skill: 'writing',
    canDo: 'Метавонад калимаҳои аввалин ва ҷумлаҳои кӯтоҳ нависад: Hello, I am Ali, My name is..., I am ten.',
  },
];

const MODULE = {
  title: 'Start from Zero',
  titleTranslated: 'Оғоз аз сифр',
  emoji: '🌱',
  color: '#14B8A6',
};

const GRAMMAR_TO_BE = {
  title: 'I am / You are',
  titleTranslated: 'I am / You are',
  explanation: [
    'Дар A1 аввалин ҷумлаҳои англисӣ бо **to be** оғоз мешаванд.',
    '',
    '- **I am ...** — Ман ... ҳастам',
    '- **You are ...** — Ту/Шумо ... ҳастӣ/ҳастед',
    '',
    'Дар англисӣ феъл ҳатмӣ аст: **I am Ali**, **You are my friend**.',
  ].join('\n'),
  emoji: '🧩',
  examples: [
    ['I am Ali.', 'Ман Алӣ ҳастам.', 'am'],
    ['You are my friend.', 'Ту дӯсти ман ҳастӣ.', 'are'],
    ['I am a student.', 'Ман донишҷӯ ҳастам.', 'am'],
  ],
  rules: [
    ['I + am', 'Бо I ҳамеша am меояд: I am.'],
    ['You + are', 'Бо you ҳамеша are меояд: You are.'],
    ['My name is + name', 'Барои гуфтани ном: My name is Ali.'],
  ],
  exercises: [
    ['choose', 'I ___ Ali.', 'Ман Алӣ ҳастам.', 'am', ['am', 'are', 'is'], 'Бо I шакли дуруст am аст.'],
    ['choose', 'You ___ my friend.', 'Ту дӯсти ман ҳастӣ.', 'are', ['am', 'are', 'is'], 'Бо you шакли дуруст are аст.'],
    ['choose', 'My name ___ Sara.', 'Номи ман Сара аст.', 'is', ['am', 'are', 'is'], 'Дар ибораи My name is... шакли is истифода мешавад.'],
  ],
};

const PHRASES_GREETINGS = {
  category: 'greetings',
  title: 'First greetings',
  titleTranslated: 'Саломҳои аввалин',
  emoji: '👋',
  phrases: [
    ['Hello!', 'Салом!', 'Саломи умумӣ ва бетараф.'],
    ['Hi!', 'Салом!', 'Саломи кӯтоҳ ва дӯстона.'],
    ['Good morning!', 'Субҳ ба хайр!', 'Субҳ истифода мешавад.'],
    ['Goodbye!', 'Хайр!', 'Ҳангоми рафтан истифода мешавад.'],
    ['Thank you.', 'Ташаккур.', 'Барои изҳори миннатдорӣ.'],
  ],
};

const PHRASES_INTRO = {
  category: 'introductions',
  title: 'Introduce yourself',
  titleTranslated: 'Худро муаррифӣ кунед',
  emoji: '👤',
  phrases: [
    ['My name is Ali.', 'Номи ман Алӣ аст.', 'Барои гуфтани ном.'],
    ['I am a student.', 'Ман донишҷӯ ҳастам.', 'Барои шиносоии кӯтоҳ.'],
    ['Nice to meet you.', 'Аз шиносоӣ шодам.', 'Ҳангоми мулоқоти аввал.'],
    ['What is your name?', 'Номи шумо чист?', 'Барои пурсидани ном.'],
  ],
};

const LESSONS = [
  {
    title: 'First learning words',
    titleTranslated: 'Калимаҳои аввалини омӯзишӣ',
    skillType: 'vocab',
    emoji: '📘',
    xpReward: 60,
    duration: 6,
    words: [
      ['Hello', 'Салом', '/həˈloʊ/', 'ҳелоу', 'Hello, teacher.', 'Салом, муаллим.', 'interjection', '👋'],
      ['I', 'Ман', '/aɪ/', 'ай', 'I am Ali.', 'Ман Алӣ ҳастам.', 'pronoun', '🙂'],
      ['You', 'Ту / Шумо', '/juː/', 'ю', 'You are Sara.', 'Ту Сара ҳастӣ.', 'pronoun', '👉'],
      ['Yes', 'Ҳа', '/jes/', 'йес', 'Yes, please.', 'Ҳа, лутфан.', 'adverb', '✅'],
      ['No', 'Не', '/noʊ/', 'ноу', 'No, thank you.', 'Не, ташаккур.', 'adverb', '❌'],
      ['Good', 'Хуб', '/ɡʊd/', 'гуд', 'Good morning.', 'Субҳ ба хайр.', 'adjective', '👍'],
    ],
  },
  {
    title: 'Hello and polite words',
    titleTranslated: 'Салом ва калимаҳои одоб',
    skillType: 'speaking',
    phraseKey: 'greetings',
    emoji: '👋',
    xpReward: 70,
    duration: 7,
    words: [
      ['Hello', 'Салом', '/həˈloʊ/', 'ҳелоу', 'Hello, Ali!', 'Салом, Алӣ!', 'interjection', '👋'],
      ['Hi', 'Салом', '/haɪ/', 'ҳай', 'Hi, Sara!', 'Салом, Сара!', 'interjection', '🙋'],
      ['Good morning', 'Субҳ ба хайр', '/ˌɡʊd ˈmɔːr.nɪŋ/', 'гуд морнинг', 'Good morning, teacher.', 'Субҳ ба хайр, муаллим.', 'phrase', '🌅'],
      ['Goodbye', 'Хайр', '/ˌɡʊdˈbaɪ/', 'гудбай', 'Goodbye, my friend.', 'Хайр, дӯстам.', 'interjection', '👋'],
      ['Please', 'Лутфан', '/pliːz/', 'плиз', 'Please sit down.', 'Лутфан шинед.', 'adverb', '🙏'],
      ['Thank you', 'Ташаккур', '/ˈθæŋk juː/', 'сэнк ю', 'Thank you very much.', 'Ташаккури зиёд.', 'phrase', '💛'],
    ],
  },
  {
    title: 'I am and you are',
    titleTranslated: 'I am ва you are',
    skillType: 'grammar',
    grammarKey: 'to_be',
    emoji: '🧩',
    xpReward: 75,
    duration: 8,
    words: [
      ['I', 'Ман', '/aɪ/', 'ай', 'I am Ali.', 'Ман Алӣ ҳастам.', 'pronoun', '🙂'],
      ['You', 'Ту / Шумо', '/juː/', 'ю', 'You are Sara.', 'Ту Сара ҳастӣ.', 'pronoun', '👉'],
      ['Am', 'Ҳастам', '/æm/', 'эм', 'I am a student.', 'Ман донишҷӯ ҳастам.', 'verb', '🧩'],
      ['Are', 'Ҳастӣ / ҳастед', '/ɑːr/', 'ар', 'You are my friend.', 'Ту дӯсти ман ҳастӣ.', 'verb', '🤝'],
      ['My', 'Аз они ман / -и ман', '/maɪ/', 'май', 'My name is Ali.', 'Номи ман Алӣ аст.', 'determiner', '🙋'],
      ['Name', 'Ном', '/neɪm/', 'нейм', 'My name is Sara.', 'Номи ман Сара аст.', 'noun', '🏷️'],
    ],
  },
  {
    title: 'Numbers and age',
    titleTranslated: 'Рақамҳо ва синну сол',
    skillType: 'vocab',
    phraseKey: 'intro',
    emoji: '🔢',
    xpReward: 70,
    duration: 7,
    words: [
      ['Zero', 'Сифр', '/ˈzɪr.oʊ/', 'зиро', 'Zero mistakes.', 'Сифр хато.', 'number', '0️⃣'],
      ['One', 'Як', '/wʌn/', 'ван', 'One book.', 'Як китоб.', 'number', '1️⃣'],
      ['Two', 'Ду', '/tuː/', 'ту', 'Two apples.', 'Ду себ.', 'number', '2️⃣'],
      ['Three', 'Се', '/θriː/', 'срӣ', 'Three cats.', 'Се гурба.', 'number', '3️⃣'],
      ['Four', 'Чор', '/fɔːr/', 'фор', 'Four books.', 'Чор китоб.', 'number', '4️⃣'],
      ['Five', 'Панҷ', '/faɪv/', 'файв', 'Five students.', 'Панҷ донишҷӯ.', 'number', '5️⃣'],
    ],
  },
];

function wordRows(words) {
  return words.map(([word, translation, ipa, ipaTajik, example, exampleTrans, partOfSpeech, emoji], order) => ({
    word,
    translation,
    ipa,
    ipaTajik,
    emoji,
    example,
    exampleTrans,
    partOfSpeech,
    difficulty: 1,
    frequencyRank: order + 1,
    order,
  }));
}

async function ensureLanguage(code, data) {
  const existing = await prisma.language.findUnique({ where: { code } });
  if (existing) return existing;
  return prisma.language.create({ data: { code, ...data } });
}

async function ensureCourse(target, native) {
  const where = {
    targetLanguageId_nativeLanguageId_level: {
      targetLanguageId: target.id,
      nativeLanguageId: native.id,
      level: LEVEL,
    },
  };

  const data = {
    title: 'Англисӣ — A1',
    description: 'Сатҳи A1 аз сифр: алифбо, садоҳои аввал, салом, муаррифӣ, рақамҳо ва ҷумлаҳои кӯтоҳи ҳаррӯза мувофиқи CEFR.',
    emoji: '🇬🇧',
    color: '#14B8A6',
    order: 1,
    isActive: true,
  };

  const existing = await prisma.course.findUnique({ where });
  if (existing) {
    return prisma.course.update({ where: { id: existing.id }, data });
  }

  return prisma.course.create({
    data: {
      targetLanguageId: target.id,
      nativeLanguageId: native.id,
      level: LEVEL,
      ...data,
    },
  });
}

async function ensureCefrDescriptors(target, native) {
  let count = 0;
  const canonicalSkills = CEFR_DESCRIPTORS.map((descriptor) => descriptor.skill);
  await prisma.cefrDescriptor.deleteMany({
    where: {
      targetLanguageId: target.id,
      nativeLanguageId: native.id,
      cefrLevel: LEVEL,
      skill: { notIn: canonicalSkills },
    },
  });

  for (const [order, descriptor] of CEFR_DESCRIPTORS.entries()) {
    const existingRows = await prisma.cefrDescriptor.findMany({
      where: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        cefrLevel: LEVEL,
        skill: descriptor.skill,
      },
      orderBy: { createdAt: 'asc' },
    });
    const [existing, ...duplicates] = existingRows;
    if (duplicates.length) {
      await prisma.cefrDescriptor.deleteMany({ where: { id: { in: duplicates.map((row) => row.id) } } });
    }

    if (existing) {
      await prisma.cefrDescriptor.update({
        where: { id: existing.id },
        data: { canDo: descriptor.canDo, order },
      });
    } else {
      await prisma.cefrDescriptor.create({
        data: {
          targetLanguageId: target.id,
          nativeLanguageId: native.id,
          cefrLevel: LEVEL,
          skill: descriptor.skill,
          canDo: descriptor.canDo,
          order,
        },
      });
    }
    count += 1;
  }
  return count;
}

async function ensureModule(courseId) {
  const existing =
    (await prisma.module.findFirst({ where: { courseId, title: MODULE.title } })) ||
    (await prisma.module.findFirst({ where: { courseId, order: 0 } }));

  const data = {
    title: MODULE.title,
    titleTranslated: MODULE.titleTranslated,
    emoji: MODULE.emoji,
    color: MODULE.color,
    order: 0,
    isPremium: false,
    isBoss: false,
    isActive: true,
  };

  if (existing) return prisma.module.update({ where: { id: existing.id }, data });
  return prisma.module.create({ data: { courseId, ...data } });
}

async function removeModuleLessons(moduleId, courseId) {
  const oldLessons = await prisma.lesson.findMany({
    where: { moduleId },
    select: {
      id: true,
      words: { select: { id: true } },
    },
  });
  const lessonIds = oldLessons.map((lesson) => lesson.id);
  const wordIds = oldLessons.flatMap((lesson) => lesson.words.map((word) => word.id));

  if (lessonIds.length) {
    await prisma.userProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
  }
  if (lessonIds.length || wordIds.length) {
    await prisma.srsCard.deleteMany({
      where: {
        OR: [
          { courseId },
          ...(lessonIds.length ? [{ itemId: { in: lessonIds } }] : []),
          ...(wordIds.length ? [{ itemId: { in: wordIds } }] : []),
        ],
      },
    });
  }
  await prisma.lesson.deleteMany({ where: { moduleId } });
}

async function recreateModuleComponents(courseId) {
  const grammar = await prisma.grammarTopic.create({
    data: {
      courseId,
      cefrLevel: LEVEL,
      title: GRAMMAR_TO_BE.title,
      titleTranslated: GRAMMAR_TO_BE.titleTranslated,
      explanation: GRAMMAR_TO_BE.explanation,
      emoji: GRAMMAR_TO_BE.emoji,
      order: 0,
      isPremium: false,
      isActive: true,
      examples: {
        create: GRAMMAR_TO_BE.examples.map(([sentence, translation, highlight], order) => ({
          sentence,
          translation,
          highlight,
          order,
        })),
      },
      rules: {
        create: GRAMMAR_TO_BE.rules.map(([pattern, note], order) => ({ pattern, note, order })),
      },
      exercises: {
        create: GRAMMAR_TO_BE.exercises.map(([type, prompt, promptTranslated, answer, options, explanation], order) => ({
          type,
          prompt,
          promptTranslated,
          answer,
          options,
          explanation,
          order,
        })),
      },
    },
  });

  const greetings = await prisma.phraseCollection.create({
    data: {
      courseId,
      cefrLevel: LEVEL,
      category: PHRASES_GREETINGS.category,
      title: PHRASES_GREETINGS.title,
      titleTranslated: PHRASES_GREETINGS.titleTranslated,
      emoji: PHRASES_GREETINGS.emoji,
      order: 0,
      isPremium: false,
      isActive: true,
      phrases: {
        create: PHRASES_GREETINGS.phrases.map(([text, translation, note], order) => ({
          text,
          translation,
          note,
          order,
        })),
      },
    },
  });

  const intro = await prisma.phraseCollection.create({
    data: {
      courseId,
      cefrLevel: LEVEL,
      category: PHRASES_INTRO.category,
      title: PHRASES_INTRO.title,
      titleTranslated: PHRASES_INTRO.titleTranslated,
      emoji: PHRASES_INTRO.emoji,
      order: 1,
      isPremium: false,
      isActive: true,
      phrases: {
        create: PHRASES_INTRO.phrases.map(([text, translation, note], order) => ({
          text,
          translation,
          note,
          order,
        })),
      },
    },
  });

  return { grammar, greetings, intro };
}

async function removeOldModuleComponents(courseId) {
  await prisma.grammarTopic.deleteMany({ where: { courseId, title: GRAMMAR_TO_BE.title } });
  await prisma.phraseCollection.deleteMany({
    where: {
      courseId,
      title: { in: [PHRASES_GREETINGS.title, PHRASES_INTRO.title] },
    },
  });
}

async function createLessons(moduleId, links) {
  for (const [order, lesson] of LESSONS.entries()) {
    const linkData = {};
    if (lesson.grammarKey === 'to_be') linkData.grammarTopicId = links.grammar.id;
    if (lesson.phraseKey === 'greetings') linkData.phraseCollectionId = links.greetings.id;
    if (lesson.phraseKey === 'intro') linkData.phraseCollectionId = links.intro.id;

    await prisma.lesson.create({
      data: {
        moduleId,
        title: lesson.title,
        titleTranslated: lesson.titleTranslated,
        type: lesson.skillType === 'grammar' ? 'quiz' : 'vocab',
        cefrLevel: LEVEL,
        skillType: lesson.skillType,
        emoji: lesson.emoji,
        xpReward: lesson.xpReward,
        duration: lesson.duration,
        order,
        isPremium: false,
        isActive: true,
        ...linkData,
        words: { create: wordRows(lesson.words) },
      },
    });
  }
}

async function main() {
  const target = await ensureLanguage(TARGET_CODE, {
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    canBeNative: false,
    canBeTarget: true,
    order: 1,
    ttsLocale: 'en-US',
    sttLocale: 'en-US',
    hasIPA: true,
  });
  const native = await ensureLanguage(NATIVE_CODE, {
    name: 'Tajik',
    nativeName: 'Тоҷикӣ',
    flag: '🇹🇯',
    canBeNative: true,
    canBeTarget: false,
    order: 0,
    ttsLocale: 'tg-TJ',
    sttLocale: 'tg-TJ',
    hasIPA: false,
  });

  const course = await ensureCourse(target, native);
  const module = await ensureModule(course.id);

  await removeModuleLessons(module.id, course.id);
  await removeOldModuleComponents(course.id);
  const links = await recreateModuleComponents(course.id);
  await createLessons(module.id, links);
  const descriptorCount = await ensureCefrDescriptors(target, native);

  const activeLessonCount = await prisma.lesson.count({ where: { moduleId: module.id, isActive: true } });
  const wordCount = await prisma.word.count({ where: { lesson: { moduleId: module.id } } });
  console.log(JSON.stringify({
    success: true,
    courseId: course.id,
    moduleId: module.id,
    level: LEVEL,
    activeLessonCount,
    wordCount,
    cefrDescriptors: descriptorCount,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
