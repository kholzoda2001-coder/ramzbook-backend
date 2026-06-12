const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;

  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex <= 0) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] == null) process.env[key] = value;
  }
}

loadEnvFile();

const prisma = new PrismaClient();
const TARGET_CODE = process.argv[2] || 'en';
const NATIVE_CODE = process.argv[3] || 'tg';
const LEVEL = 'A1';

const CHECKPOINT_LESSONS = [
  {
    moduleTitle: 'Greetings & Introductions',
    title: 'Checkpoint 1: Meet and greet',
    titleTranslated: 'Санҷиш 1: Салом ва шиносоӣ',
    emoji: '🎯',
    words: [
      ['Hello', 'Салом'],
      ['Good morning', 'Субҳ ба хайр'],
      ['My name is Ali', 'Номи ман Алӣ аст'],
      ['I am from Tajikistan', 'Ман аз Тоҷикистон ҳастам'],
      ['How are you?', 'Шумо чӣ хелед?'],
      ['Nice to meet you', 'Аз шиносоӣ шодам'],
    ],
  },
  {
    moduleTitle: 'Me & Family',
    title: 'Checkpoint 2: Me and family',
    titleTranslated: 'Санҷиш 2: Ман ва оила',
    emoji: '👨‍👩‍👧‍👦',
    words: [
      ['This is my mother', 'Ин модари ман аст'],
      ['He is my brother', 'Ӯ бародари ман аст'],
      ['I have one sister', 'Ман як хоҳар дорам'],
      ['My father is kind', 'Падари ман меҳрубон аст'],
      ['We are a family', 'Мо як оила ҳастем'],
      ['They are happy', 'Онҳо хушҳоланд'],
    ],
  },
  {
    moduleTitle: 'Food & Drink',
    title: 'Checkpoint 3: Cafe mission',
    titleTranslated: 'Санҷиш 3: Вазифаи қаҳвахона',
    emoji: '☕',
    words: [
      ['I would like tea', 'Ман чой мехоҳам'],
      ['Can I have bread?', 'Метавонам нон гирам?'],
      ['How much is it?', 'Ин чанд пул аст?'],
      ['It is delicious', 'Ин болаззат аст'],
      ['I do not like coffee', 'Ман қаҳваро дӯст намедорам'],
      ['Thank you very much', 'Ташаккури зиёд'],
    ],
  },
  {
    moduleTitle: 'Places & Directions',
    title: 'Checkpoint 4: City mission',
    titleTranslated: 'Санҷиш 4: Вазифаи шаҳр',
    emoji: '🗺️',
    words: [
      ['Where is the school?', 'Мактаб дар куҷост?'],
      ['Go straight', 'Рост равед'],
      ['Turn left', 'Ба чап гардед'],
      ['The shop is near the bank', 'Мағоза назди бонк аст'],
      ['There is a park here', 'Дар ин ҷо боғ ҳаст'],
      ['I need the bus station', 'Ба ман истгоҳи автобус лозим аст'],
    ],
  },
];

const EXTRA_SKILL_LESSONS = [
  {
    moduleTitle: 'Me & Family',
    skillType: 'writing',
    title: 'Write: About me',
    titleTranslated: 'Навиштан: Дар бораи ман',
    emoji: '✍️',
    words: [
      ['My name is ...', 'Номи ман ... аст'],
      ['I am a student', 'Ман донишҷӯ ҳастам'],
      ['I am from Dushanbe', 'Ман аз Душанбе ҳастам'],
      ['I have a small family', 'Ман оилаи хурд дорам'],
      ['My mother is kind', 'Модари ман меҳрубон аст'],
    ],
  },
  {
    moduleTitle: 'Food & Drink',
    skillType: 'listening',
    title: 'Listen: At a cafe',
    titleTranslated: 'Шунавоӣ: Дар қаҳвахона',
    emoji: '🎧',
    words: [
      ['Tea', 'Чой'],
      ['Coffee', 'Қаҳва'],
      ['Bread', 'Нон'],
      ['Water', 'Об'],
      ['I want water', 'Ман об мехоҳам'],
      ['Can I have tea?', 'Метавонам чой гирам?'],
    ],
  },
  {
    moduleTitle: 'Places & Directions',
    skillType: 'writing',
    title: 'Write: Simple directions',
    titleTranslated: 'Навиштан: Самтҳои оддӣ',
    emoji: '✍️',
    words: [
      ['Go straight', 'Рост равед'],
      ['Turn right', 'Ба рост гардед'],
      ['Turn left', 'Ба чап гардед'],
      ['The bank is near the school', 'Бонк назди мактаб аст'],
      ['The park is behind the shop', 'Боғ пушти мағоза аст'],
    ],
  },
];

const FINAL_EXAM_LESSONS = [
  {
    skillType: 'listening',
    title: 'A1 Listening Exam',
    titleTranslated: 'Имтиҳони A1: Шунидан',
    emoji: '🎧',
    xpReward: 120,
    words: [
      ['Hello, my name is Sara', 'Салом, номи ман Сара аст'],
      ['I live in Dushanbe', 'Ман дар Душанбе зиндагӣ мекунам'],
      ['I go to school in the morning', 'Ман саҳар ба мактаб меравам'],
      ['I like rice and tea', 'Ман биринҷ ва чойро дӯст медорам'],
      ['The shop is on the left', 'Мағоза дар тарафи чап аст'],
    ],
  },
  {
    skillType: 'writing',
    title: 'A1 Writing Exam',
    titleTranslated: 'Имтиҳони A1: Навиштан',
    emoji: '✍️',
    xpReward: 120,
    words: [
      ['My name is ...', 'Номи ман ... аст'],
      ['I am from Tajikistan', 'Ман аз Тоҷикистон ҳастам'],
      ['I have a family', 'Ман оила дорам'],
      ['I like English', 'Ман англисиро дӯст медорам'],
      ['Thank you', 'Ташаккур'],
    ],
  },
  {
    skillType: 'speaking',
    title: 'A1 Speaking Exam',
    titleTranslated: 'Имтиҳони A1: Гуфтор',
    emoji: '🎤',
    xpReward: 120,
    words: [
      ['Hello', 'Салом'],
      ['My name is ...', 'Номи ман ... аст'],
      ['I am a student', 'Ман донишҷӯ ҳастам'],
      ['I like tea', 'Ман чойро дӯст медорам'],
      ['I can speak English a little', 'Ман каме англисӣ гап зада метавонам'],
    ],
  },
  {
    skillType: 'review',
    type: 'quiz',
    title: 'A1 Final Mastery Test',
    titleTranslated: 'Имтиҳони ниҳоии A1',
    emoji: '🏆',
    xpReward: 160,
    words: [
      ['Hello', 'Салом'],
      ['Family', 'Оила'],
      ['School', 'Мактаб'],
      ['Water', 'Об'],
      ['Bread', 'Нон'],
      ['Go straight', 'Рост равед'],
      ['How much is it?', 'Ин чанд пул аст?'],
      ['I can swim', 'Ман шино карда метавонам'],
      ['I am writing', 'Ман навишта истодаам'],
      ['Thank you very much', 'Ташаккури зиёд'],
    ],
  },
];

function wordRows(words) {
  return words.map(([word, translation], order) => ({
    word,
    translation,
    emoji: null,
    ipa: null,
    example: word,
    exampleTrans: translation,
    difficulty: 1,
    order,
  }));
}

async function resolveCourse() {
  const target = await prisma.language.findUnique({ where: { code: TARGET_CODE } });
  const native = await prisma.language.findUnique({ where: { code: NATIVE_CODE } });
  if (!target || !native) throw new Error(`Language pair not found: ${NATIVE_CODE} -> ${TARGET_CODE}`);

  const course = await prisma.course.findUnique({
    where: {
      targetLanguageId_nativeLanguageId_level: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        level: LEVEL,
      },
    },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: {
              words: true,
              phraseCollection: true,
              dialogue: true,
            },
          },
        },
      },
    },
  });
  if (!course) throw new Error(`A1 course not found for ${NATIVE_CODE} -> ${TARGET_CODE}`);
  return course;
}

async function retagLinkedLessons(course) {
  let changed = 0;
  for (const module of course.modules) {
    for (const lesson of module.lessons) {
      let nextSkill = null;
      if (lesson.phraseCollection && lesson.skillType === 'vocab') nextSkill = 'speaking';
      if (lesson.dialogue && lesson.skillType === 'vocab') nextSkill = 'listening';
      if (!nextSkill) continue;
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: { skillType: nextSkill, cefrLevel: LEVEL },
      });
      changed += 1;
    }
  }
  return changed;
}

async function appendLesson(module, lessonSpec) {
  const existing = await prisma.lesson.findFirst({
    where: { moduleId: module.id, title: lessonSpec.title },
    select: { id: true },
  });
  if (existing) return false;

  const maxOrder = await prisma.lesson.aggregate({
    where: { moduleId: module.id },
    _max: { order: true },
  });

  await prisma.lesson.create({
    data: {
      moduleId: module.id,
      title: lessonSpec.title,
      titleTranslated: lessonSpec.titleTranslated,
      type: lessonSpec.type || (lessonSpec.skillType === 'review' ? 'quiz' : 'vocab'),
      cefrLevel: LEVEL,
      skillType: lessonSpec.skillType || 'review',
      emoji: lessonSpec.emoji || '🎯',
      xpReward: lessonSpec.xpReward || 90,
      duration: lessonSpec.duration || 6,
      order: (maxOrder._max.order ?? -1) + 1,
      isPremium: false,
      isActive: true,
      words: { create: wordRows(lessonSpec.words || []) },
    },
  });
  return true;
}

async function addMasteryLessons(course) {
  const modulesByTitle = new Map(course.modules.map((module) => [module.title, module]));
  let added = 0;

  for (const spec of CHECKPOINT_LESSONS) {
    const module = modulesByTitle.get(spec.moduleTitle);
    if (!module) throw new Error(`Module not found: ${spec.moduleTitle}`);
    if (await appendLesson(module, { ...spec, skillType: 'review', type: 'quiz', xpReward: 110 })) added += 1;
  }

  for (const spec of EXTRA_SKILL_LESSONS) {
    const module = modulesByTitle.get(spec.moduleTitle);
    if (!module) throw new Error(`Module not found: ${spec.moduleTitle}`);
    if (await appendLesson(module, spec)) added += 1;
  }

  const finalModule = modulesByTitle.get('Shopping & Review');
  if (!finalModule) throw new Error('Final module not found: Shopping & Review');
  for (const spec of FINAL_EXAM_LESSONS) {
    if (await appendLesson(finalModule, spec)) added += 1;
  }

  return added;
}

async function main() {
  console.log(`Enhancing A1 mastery: ${NATIVE_CODE} -> ${TARGET_CODE}`);
  const course = await resolveCourse();
  const retagged = await retagLinkedLessons(course);
  const added = await addMasteryLessons(course);
  console.log(`Retagged linked phrase/dialogue lessons: ${retagged}`);
  console.log(`Added mastery/checkpoint/final lessons: ${added}`);
  console.log('Done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
