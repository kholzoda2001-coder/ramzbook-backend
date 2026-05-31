/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Full A2 English-for-Tajik course seeder.
// Wipes ONLY the (English target, Tajik native, level A2) course content and
// rebuilds it from scratch. A1 and every other course/language/user is untouched.
//
// Run (from backend dir, with env loaded):
//   set -a; . .env; set +a
//   node scripts/seed_a2_en_tg.cjs
//
// NOTE: `options` on grammar/comprehension are Prisma Json fields — pass arrays
// DIRECTLY (never JSON.stringify).
// ─────────────────────────────────────────────────────────────────────────────
const { PrismaClient } = require('C:/Users/ASUS1/Desktop/RAMZ/backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const TARGET_CODE = 'en';
const NATIVE_CODE = 'tg';
const LEVEL = 'A2';

const CONTENT = {
  grammar: [],
  phrases: [],
  dialogues: [],
  comprehensions: [],
  modules: [],
};

// ── Engine ───────────────────────────────────────────────────────────────────

// Capitalise the FIRST letter of any word/sentence, in any language.
function cap(s) {
  if (s == null) return s;
  const str = String(s);
  const i = str.search(/\S/);
  if (i < 0) return str;
  return str.slice(0, i) + str.charAt(i).toUpperCase() + str.slice(i + 1);
}

async function resolveCourse() {
  const target = await prisma.language.findUnique({ where: { code: TARGET_CODE } });
  const native = await prisma.language.findUnique({ where: { code: NATIVE_CODE } });
  if (!target) throw new Error(`Target language '${TARGET_CODE}' not found`);
  if (!native) throw new Error(`Native language '${NATIVE_CODE}' not found`);

  let course = await prisma.course.findUnique({
    where: {
      targetLanguageId_nativeLanguageId_level: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        level: LEVEL,
      },
    },
  });

  const data = {
    title: 'Англисӣ — Сатҳи A2',
    description: 'Гузашта, оянда, муқоиса, саломатӣ, сафар ва кор — гуфтугӯи воқеии ҳаррӯза.',
    emoji: '🇬🇧',
    color: '#A78BFA',
    isActive: true,
  };

  if (!course) {
    course = await prisma.course.create({
      data: { targetLanguageId: target.id, nativeLanguageId: native.id, level: LEVEL, order: 2, ...data },
    });
    console.log('  + created A2 course', course.id);
  } else {
    await prisma.course.update({ where: { id: course.id }, data });
    console.log('  · using existing A2 course', course.id);
  }
  return course;
}

async function wipeCourseContent(courseId) {
  const modules = await prisma.module.findMany({ where: { courseId }, select: { id: true } });
  const moduleIds = modules.map((m) => m.id);
  if (moduleIds.length) {
    const lessons = await prisma.lesson.findMany({
      where: { moduleId: { in: moduleIds } },
      select: { id: true },
    });
    const lessonIds = lessons.map((l) => l.id);
    if (lessonIds.length) {
      const dp = await prisma.userProgress.deleteMany({ where: { lessonId: { in: lessonIds } } });
      console.log(`  - deleted ${dp.count} userProgress rows`);
    }
  }
  const ds = await prisma.srsCard.deleteMany({ where: { courseId } });
  if (ds.count) console.log(`  - deleted ${ds.count} srsCards`);

  const dm = await prisma.module.deleteMany({ where: { courseId } });
  console.log(`  - deleted ${dm.count} modules (+lessons +words)`);

  const dg = await prisma.grammarTopic.deleteMany({ where: { courseId } });
  const dph = await prisma.phraseCollection.deleteMany({ where: { courseId } });
  const dd = await prisma.dialogue.deleteMany({ where: { courseId } });
  const dc = await prisma.comprehensionExercise.deleteMany({ where: { courseId } });
  console.log(`  - deleted components: ${dg.count} grammar, ${dph.count} phrases, ${dd.count} dialogues, ${dc.count} comprehensions`);
}

async function createComponents(courseId) {
  const ids = { grammar: {}, phrases: {}, dialogues: {}, comprehensions: {} };

  for (const [i, g] of CONTENT.grammar.entries()) {
    const row = await prisma.grammarTopic.create({
      data: {
        courseId, cefrLevel: LEVEL,
        title: cap(g.title), titleTranslated: cap(g.titleTranslated),
        explanation: cap(g.explanation), emoji: g.emoji ?? '🔤',
        order: g.order ?? i, isActive: true,
        examples: { create: (g.examples ?? []).map((e, j) => ({
          sentence: cap(e.sentence), translation: cap(e.translation),
          highlight: e.highlight ?? null, order: j,
        })) },
        rules: { create: (g.rules ?? []).map((r, j) => ({
          pattern: r.pattern, note: cap(r.note) ?? null, order: j,
        })) },
        exercises: { create: (g.exercises ?? []).map((x, j) => ({
          type: x.type ?? 'choose', prompt: cap(x.prompt),
          promptTranslated: cap(x.promptTranslated) ?? null,
          answer: x.answer, options: x.options ?? undefined,
          explanation: cap(x.explanation) ?? null, order: j,
        })) },
      },
    });
    ids.grammar[g.key] = row.id;
  }

  for (const [i, p] of CONTENT.phrases.entries()) {
    const row = await prisma.phraseCollection.create({
      data: {
        courseId, cefrLevel: LEVEL,
        category: p.category ?? null, title: cap(p.title), titleTranslated: cap(p.titleTranslated),
        emoji: p.emoji ?? '💬', order: p.order ?? i, isActive: true,
        phrases: { create: (p.phrases ?? []).map((ph, j) => ({
          text: cap(ph.text), translation: cap(ph.translation),
          literal: cap(ph.literal) ?? null, note: cap(ph.note) ?? null, order: j,
        })) },
      },
    });
    ids.phrases[p.key] = row.id;
  }

  for (const [i, d] of CONTENT.dialogues.entries()) {
    const row = await prisma.dialogue.create({
      data: {
        courseId, cefrLevel: LEVEL,
        title: cap(d.title), titleTranslated: cap(d.titleTranslated),
        scenario: cap(d.scenario) ?? null, emoji: d.emoji ?? '🎙️',
        order: d.order ?? i, isActive: true,
        lines: { create: (d.lines ?? []).map((l, j) => ({
          speaker: cap(l.speaker), text: cap(l.text), translation: cap(l.translation),
          isUser: l.isUser ?? false, order: j,
        })) },
      },
    });
    ids.dialogues[d.key] = row.id;
  }

  for (const [i, c] of CONTENT.comprehensions.entries()) {
    const row = await prisma.comprehensionExercise.create({
      data: {
        courseId, cefrLevel: LEVEL, kind: c.kind ?? 'reading',
        title: cap(c.title), titleTranslated: cap(c.titleTranslated),
        passage: cap(c.passage), passageTranslated: cap(c.passageTranslated) ?? null,
        emoji: c.emoji ?? '📖', order: c.order ?? i, isActive: true,
        questions: { create: (c.questions ?? []).map((q, j) => ({
          question: cap(q.question), questionTranslated: cap(q.questionTranslated) ?? null,
          options: (q.options ?? []).map(cap),
          correctIndex: q.correctIndex ?? 0,
          explanation: cap(q.explanation) ?? null, order: j,
        })) },
      },
    });
    ids.comprehensions[c.key] = row.id;
  }

  console.log(`  + components: ${CONTENT.grammar.length} grammar, ${CONTENT.phrases.length} phrases, ${CONTENT.dialogues.length} dialogues, ${CONTENT.comprehensions.length} comprehensions`);
  return ids;
}

async function createModules(courseId, ids) {
  let totalLessons = 0;
  let totalWords = 0;

  for (const [mi, m] of CONTENT.modules.entries()) {
    const module = await prisma.module.create({
      data: {
        courseId, title: cap(m.title), titleTranslated: cap(m.titleTranslated),
        emoji: m.emoji ?? '📚', color: m.color ?? '#A78BFA',
        order: m.order ?? mi, isPremium: false, isActive: true,
      },
    });

    for (const [li, l] of (m.lessons ?? []).entries()) {
      const link = {};
      if (l.grammarKey) link.grammarTopicId = ids.grammar[l.grammarKey];
      if (l.phraseKey) link.phraseCollectionId = ids.phrases[l.phraseKey];
      if (l.dialogueKey) link.dialogueId = ids.dialogues[l.dialogueKey];
      if (l.comprehensionKey) link.comprehensionId = ids.comprehensions[l.comprehensionKey];

      await prisma.lesson.create({
        data: {
          moduleId: module.id,
          title: cap(l.title), titleTranslated: cap(l.titleTranslated),
          type: l.type ?? 'vocab',
          cefrLevel: LEVEL,
          skillType: l.skillType ?? 'vocab',
          emoji: l.emoji ?? '📘',
          xpReward: l.xpReward ?? 60,
          duration: l.duration ?? 5,
          order: li, isPremium: false, isActive: true,
          ...link,
          words: { create: (l.words ?? []).map((w, j) => ({
            word: cap(w.word), translation: cap(w.translation),
            emoji: w.emoji ?? null, ipa: w.ipa ?? null,
            example: cap(w.example) ?? null, exampleTrans: cap(w.exampleTrans) ?? null,
            partOfSpeech: w.partOfSpeech ?? null,
            difficulty: w.difficulty ?? 2, order: j,
          })) },
        },
      });
      totalLessons++;
      totalWords += (l.words ?? []).length;
    }
    console.log(`  + module ${mi + 1}: ${m.titleTranslated} (${(m.lessons ?? []).length} lessons)`);
  }
  console.log(`  = ${CONTENT.modules.length} modules, ${totalLessons} lessons, ${totalWords} words`);
}

async function main() {
  console.log('▶ Seeding A2 English-for-Tajik …');
  const course = await resolveCourse();
  console.log('▶ Wiping old A2 content …');
  await wipeCourseContent(course.id);
  console.log('▶ Creating components …');
  const ids = await createComponents(course.id);
  console.log('▶ Creating modules + lessons …');
  await createModules(course.id, ids);
  console.log('✅ Done.');
}

// ── GRAMMAR TOPICS ───────────────────────────────────────────────────────────
CONTENT.grammar.push(
  {
    key: 'past_be', emoji: '⏮️', title: 'Past Simple of "to be" (was / were)', titleTranslated: 'Гузаштаи «to be» (буд/буданд)',
    explanation: 'Шакли гузаштаи феъли **to be**:\n\n- I / He / She / It → **was**\n- You / We / They → **were**\n\nИнкор: **wasn\'t / weren\'t**.',
    examples: [
      { sentence: 'I was at home yesterday.', translation: 'Ман дирӯз дар хона будам.', highlight: 'was' },
      { sentence: 'They were happy.', translation: 'Онҳо хушҳол буданд.', highlight: 'were' },
      { sentence: 'She wasn\'t late.', translation: 'Ӯ дер намонда буд.', highlight: "wasn't" },
    ],
    rules: [
      { pattern: 'I/He/She/It + was', note: 'was = буд (танҳо).' },
      { pattern: 'You/We/They + were', note: 'were = буданд (ҷамъ).' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ tired last night.', promptTranslated: 'Ман шаби гузашта монда будам.', answer: 'was', options: ['was', 'were'], explanation: 'Бо I → was.' },
      { type: 'choose', prompt: 'They ___ at school.', promptTranslated: 'Онҳо дар мактаб буданд.', answer: 'were', options: ['was', 'were'], explanation: 'Бо They → were.' },
    ],
  },
  {
    key: 'past_regular', emoji: '✅', title: 'Past Simple (regular verbs)', titleTranslated: 'Замони гузаштаи содда (феълҳои қоидавӣ)',
    explanation: 'Барои амали анҷомёфта дар гузашта ба феъл **-ed** илова мешавад:\n\n- work → work**ed**\n- play → play**ed**\n- study → stud**ied** (y → ied)',
    examples: [
      { sentence: 'I worked yesterday.', translation: 'Ман дирӯз кор кардам.', highlight: 'worked' },
      { sentence: 'She watched a film.', translation: 'Ӯ филм тамошо кард.', highlight: 'watched' },
      { sentence: 'We played football.', translation: 'Мо футбол бозӣ кардем.', highlight: 'played' },
    ],
    rules: [
      { pattern: 'Феъл + ed', note: 'cleaned, opened, visited.' },
      { pattern: 'Феъл + d (баъди e)', note: 'live → lived.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Yesterday I ___ TV.', promptTranslated: 'Дирӯз ман телевизор тамошо кардам.', answer: 'watched', options: ['watch', 'watched', 'watching'], explanation: 'Гузашта → watched.' },
      { type: 'choose', prompt: 'They ___ in Dushanbe in 2020.', promptTranslated: 'Онҳо соли 2020 дар Душанбе зиндагӣ карданд.', answer: 'lived', options: ['live', 'lived', 'lives'], explanation: 'live → lived.' },
    ],
  },
  {
    key: 'past_irregular', emoji: '🌀', title: 'Past Simple (irregular verbs)', titleTranslated: 'Замони гузашта (феълҳои бесистема)',
    explanation: 'Баъзе феълҳо шакли хоси гузашта доранд (бе -ed):\n\n- go → **went**\n- have → **had**\n- see → **saw**\n- eat → **ate**\n- buy → **bought**',
    examples: [
      { sentence: 'I went to the market.', translation: 'Ман ба бозор рафтам.', highlight: 'went' },
      { sentence: 'She had breakfast.', translation: 'Ӯ ноништа кард.', highlight: 'had' },
      { sentence: 'We saw a good film.', translation: 'Мо филми хуб дидем.', highlight: 'saw' },
    ],
    rules: [
      { pattern: 'go→went, see→saw, eat→ate', note: 'Инҳоро аз ёд кардан лозим.' },
      { pattern: 'have→had, buy→bought, do→did', note: 'Шаклҳои махсус.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ to London last year.', promptTranslated: 'Ман соли гузашта ба Лондон рафтам.', answer: 'went', options: ['goed', 'went', 'gone'], explanation: 'go → went.' },
      { type: 'choose', prompt: 'She ___ a new phone.', promptTranslated: 'Ӯ телефони нав харид.', answer: 'bought', options: ['buyed', 'bought', 'buy'], explanation: 'buy → bought.' },
    ],
  },
  {
    key: 'past_questions', emoji: '❔', title: 'Past questions & negatives (did)', titleTranslated: 'Саволу инкори гузашта (did)',
    explanation: 'Дар гузашта барои савол ва инкор **did** истифода мешавад, феъл соф мемонад:\n\n- **Did** you go? — Рафтӣ?\n- I **didn\'t** go. — Нарафтам.',
    examples: [
      { sentence: 'Did you see her?', translation: 'Ту ӯро дидӣ?', highlight: 'Did' },
      { sentence: 'I didn\'t like the food.', translation: 'Ман хӯрокро дӯст надоштам.', highlight: "didn't" },
    ],
    rules: [
      { pattern: 'Did + subject + феъл?', note: 'Did he come?' },
      { pattern: 'Subject + didn\'t + феъл', note: 'I didn\'t know.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ you go to school?', promptTranslated: 'Ту ба мактаб рафтӣ?', answer: 'Did', options: ['Do', 'Did', 'Does'], explanation: 'Савол дар гузашта → Did.' },
      { type: 'choose', prompt: 'I ___ understand.', promptTranslated: 'Ман нафаҳмидам.', answer: "didn't", options: ["don't", "didn't", "doesn't"], explanation: 'Инкори гузашта → didn\'t.' },
    ],
  },
  {
    key: 'comparatives', emoji: '⚖️', title: 'Comparatives', titleTranslated: 'Дараҷаи қиёсии сифатҳо',
    explanation: 'Барои муқоисаи ду чиз:\n\n- сифати кӯтоҳ + **-er** + **than**: tall → tall**er than**\n- сифати дароз: **more** + сифат + **than**: more beautiful than\n- истиснo: good → **better**, bad → **worse**',
    examples: [
      { sentence: 'He is taller than me.', translation: 'Ӯ аз ман баландтар аст.', highlight: 'taller than' },
      { sentence: 'This book is more interesting.', translation: 'Ин китоб ҷолибтар аст.', highlight: 'more interesting' },
      { sentence: 'Today is better than yesterday.', translation: 'Имрӯз аз дирӯз беҳтар аст.', highlight: 'better' },
    ],
    rules: [
      { pattern: 'кӯтоҳ + er + than', note: 'cheaper than, faster than.' },
      { pattern: 'more + дароз + than', note: 'more expensive than.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'A car is ___ than a bike.', promptTranslated: 'Мошин аз велосипед тезтар аст.', answer: 'faster', options: ['fast', 'faster', 'fastest'], explanation: 'Қиёсӣ → faster.' },
      { type: 'choose', prompt: 'This is ___ interesting than that.', promptTranslated: 'Ин аз он ҷолибтар аст.', answer: 'more', options: ['more', 'most', 'much'], explanation: 'Сифати дароз → more.' },
    ],
  },
  {
    key: 'superlatives', emoji: '🏅', title: 'Superlatives', titleTranslated: 'Дараҷаи олии сифатҳо',
    explanation: 'Барои «аз ҳама…»:\n\n- сифати кӯтоҳ: **the** + сифат + **-est**: the tall**est**\n- сифати дароз: **the most** + сифат: the most beautiful\n- истиснo: the **best**, the **worst**',
    examples: [
      { sentence: 'He is the tallest in the class.', translation: 'Ӯ дар синф аз ҳама баланд аст.', highlight: 'the tallest' },
      { sentence: 'It is the most expensive car.', translation: 'Ин гаронтарин мошин аст.', highlight: 'the most expensive' },
      { sentence: 'This is the best day.', translation: 'Ин беҳтарин рӯз аст.', highlight: 'the best' },
    ],
    rules: [
      { pattern: 'the + кӯтоҳ + est', note: 'the cheapest, the biggest.' },
      { pattern: 'the most + дароз', note: 'the most famous.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Everest is the ___ mountain.', promptTranslated: 'Эверест баландтарин кӯҳ аст.', answer: 'highest', options: ['high', 'higher', 'highest'], explanation: 'Олӣ → the highest.' },
      { type: 'choose', prompt: 'She is the ___ student.', promptTranslated: 'Ӯ беҳтарин донишҷӯ аст.', answer: 'best', options: ['good', 'better', 'best'], explanation: 'good → the best.' },
    ],
  },
  {
    key: 'going_to', emoji: '🎯', title: 'Future: be going to', titleTranslated: 'Оянда: be going to (нақша)',
    explanation: 'Барои нақша ва ният дар оянда:\n\n- **am/is/are + going to + феъл**\n\nМисол: I **am going to** study. — Ман мехоҳам/ният дорам хонам.',
    examples: [
      { sentence: 'I am going to visit my friend.', translation: 'Ман ният дорам ба назди дӯстам равам.', highlight: 'going to' },
      { sentence: 'They are going to travel.', translation: 'Онҳо ният доранд сафар кунанд.', highlight: 'going to' },
    ],
    rules: [
      { pattern: 'am/is/are + going to + феъл', note: 'Нақшаи муайян.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'She is going ___ buy a car.', promptTranslated: 'Ӯ ният дорад мошин харад.', answer: 'to', options: ['to', 'for', 'at'], explanation: 'going **to** + феъл.' },
      { type: 'choose', prompt: 'We ___ going to study tonight.', promptTranslated: 'Мо имшаб ният дорем хонем.', answer: 'are', options: ['am', 'is', 'are'], explanation: 'Бо We → are.' },
    ],
  },
  {
    key: 'will', emoji: '🔮', title: 'Future: will', titleTranslated: 'Оянда: will (қарор/пешбинӣ)',
    explanation: '**will + феъл** барои қарори лаҳзаина ё пешбинӣ:\n\n- I **will** help you. — Ман ба ту кӯмак мекунам.\n- It **will** rain. — Борон меборад.\n- Инкор: **won\'t**.',
    examples: [
      { sentence: 'I will call you later.', translation: 'Ман баъдтар ба ту занг мезанам.', highlight: 'will' },
      { sentence: 'It will be sunny tomorrow.', translation: 'Фардо офтобӣ мешавад.', highlight: 'will' },
      { sentence: 'I won\'t forget.', translation: 'Ман фаромӯш намекунам.', highlight: "won't" },
    ],
    rules: [
      { pattern: 'will + феъли соф', note: 'Барои ҳама шахс якхела.' },
      { pattern: "won't + феъл", note: 'Инкор: will not = won\'t.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ help you tomorrow.', promptTranslated: 'Ман фардо ба ту кӯмак мекунам.', answer: 'will', options: ['will', 'am', 'going'], explanation: 'Қарор → will.' },
      { type: 'choose', prompt: 'They ___ come to the party.', promptTranslated: 'Онҳо ба базм намеоянд.', answer: "won't", options: ["won't", "don't", "didn't"], explanation: 'Инкори оянда → won\'t.' },
    ],
  },
  {
    key: 'countable', emoji: '🧮', title: 'Countable / Uncountable, some / any', titleTranslated: 'Шумурдашаванда/нашаванда, some/any',
    explanation: '- Исмҳои **шумурдашаванда**: apple → apples.\n- Исмҳои **нашаванда** (water, rice, money) ҷамъ намешаванд.\n- **some** дар ҷумлаи тасдиқӣ, **any** дар савол/инкор.',
    examples: [
      { sentence: 'I have some money.', translation: 'Ман каме пул дорам.', highlight: 'some' },
      { sentence: 'Is there any milk?', translation: 'Шир ҳаст?', highlight: 'any' },
      { sentence: 'There aren\'t any apples.', translation: 'Ҳеҷ себ нест.', highlight: 'any' },
    ],
    rules: [
      { pattern: 'some + тасдиқ', note: 'I need some water.' },
      { pattern: 'any + савол/инкор', note: 'Do you have any bread?' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I have ___ books.', promptTranslated: 'Ман якчанд китоб дорам.', answer: 'some', options: ['some', 'any'], explanation: 'Тасдиқ → some.' },
      { type: 'choose', prompt: 'Is there ___ water?', promptTranslated: 'Об ҳаст?', answer: 'any', options: ['some', 'any'], explanation: 'Савол → any.' },
    ],
  },
  {
    key: 'quantifiers', emoji: '📊', title: 'much / many / a lot of', titleTranslated: 'much / many / a lot of (миқдор)',
    explanation: '- **many** + исми шумурдашаванда: many books\n- **much** + исми нашаванда: much water\n- **a lot of** бо ҳарду истифода мешавад.',
    examples: [
      { sentence: 'How many books do you have?', translation: 'Чанд китоб дорӣ?', highlight: 'many' },
      { sentence: 'I don\'t have much time.', translation: 'Ман вақти зиёд надорам.', highlight: 'much' },
      { sentence: 'There are a lot of people.', translation: 'Бисёр одам ҳаст.', highlight: 'a lot of' },
    ],
    rules: [
      { pattern: 'many + шумурдашаванда', note: 'many cars.' },
      { pattern: 'much + нашаванда', note: 'much money.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'How ___ water do you drink?', promptTranslated: 'Чӣ қадар об менӯшӣ?', answer: 'much', options: ['much', 'many'], explanation: 'water нашаванда → much.' },
      { type: 'choose', prompt: 'How ___ students are here?', promptTranslated: 'Чанд донишҷӯ ин ҷост?', answer: 'many', options: ['much', 'many'], explanation: 'students шумурдашаванда → many.' },
    ],
  },
  {
    key: 'adverbs_frequency', emoji: '🔁', title: 'Adverbs of frequency', titleTranslated: 'Зарфҳои такрор (always, usually…)',
    explanation: 'Зарфҳои такрор пеш аз феъли асосӣ меоянд:\n\n- **always** (ҳамеша), **usually** (одатан), **often** (зуд-зуд), **sometimes** (баъзан), **never** (ҳеҷ гоҳ).',
    examples: [
      { sentence: 'I always drink tea.', translation: 'Ман ҳамеша чой менӯшам.', highlight: 'always' },
      { sentence: 'She never smokes.', translation: 'Ӯ ҳеҷ гоҳ тамоку намекашад.', highlight: 'never' },
      { sentence: 'We sometimes go to the park.', translation: 'Мо баъзан ба боғ меравем.', highlight: 'sometimes' },
    ],
    rules: [
      { pattern: 'Subject + зарф + феъл', note: 'I usually wake up early.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ eat breakfast. (ҳамеша)', promptTranslated: 'Ман ҳамеша ноништа мекунам.', answer: 'always', options: ['always', 'never', 'yesterday'], explanation: 'ҳамеша → always.' },
      { type: 'choose', prompt: 'He ___ drinks coffee. (ҳеҷ гоҳ)', promptTranslated: 'Ӯ ҳеҷ гоҳ қаҳва наменӯшад.', answer: 'never', options: ['never', 'always', 'often'], explanation: 'ҳеҷ гоҳ → never.' },
    ],
  },
  {
    key: 'should', emoji: '💡', title: 'should / shouldn\'t (advice)', titleTranslated: 'should / shouldn\'t (маслиҳат)',
    explanation: '**should** барои маслиҳат:\n\n- You **should** rest. — Ту бояд истироҳат кунӣ.\n- You **shouldn\'t** smoke. — Ту набояд тамоку кашӣ.',
    examples: [
      { sentence: 'You should see a doctor.', translation: 'Ту бояд ба духтур муроҷиат кунӣ.', highlight: 'should' },
      { sentence: 'You shouldn\'t eat so much sugar.', translation: 'Ту набояд ин қадар шакар хӯрӣ.', highlight: "shouldn't" },
    ],
    rules: [
      { pattern: 'should + феъли соф', note: 'Маслиҳати хуб.' },
      { pattern: "shouldn't + феъл", note: 'Маслиҳати манъ.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'You ___ drink more water.', promptTranslated: 'Ту бояд бештар об нӯшӣ.', answer: 'should', options: ['should', "shouldn't"], explanation: 'Маслиҳати мусбат → should.' },
      { type: 'choose', prompt: 'You ___ be late for work.', promptTranslated: 'Ту набояд ба кор дер монӣ.', answer: "shouldn't", options: ['should', "shouldn't"], explanation: 'Манъ → shouldn\'t.' },
    ],
  },
  {
    key: 'have_to', emoji: '📌', title: 'have to / must (obligation)', titleTranslated: 'have to / must (ӯҳдадорӣ)',
    explanation: '**must** ва **have to** маънои «бояд»-ро доранд:\n\n- I **must** go. — Ман бояд равам.\n- She **has to** work. — Ӯ бояд кор кунад.',
    examples: [
      { sentence: 'I must finish my homework.', translation: 'Ман бояд вазифаамро тамом кунам.', highlight: 'must' },
      { sentence: 'He has to wake up early.', translation: 'Ӯ бояд барвақт бедор шавад.', highlight: 'has to' },
    ],
    rules: [
      { pattern: 'must + феъли соф', note: 'Ӯҳдадории қавӣ.' },
      { pattern: 'have/has to + феъл', note: 'has to барои He/She/It.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'She ___ to study tonight.', promptTranslated: 'Ӯ имшаб бояд хонад.', answer: 'has', options: ['have', 'has'], explanation: 'Бо She → has to.' },
      { type: 'choose', prompt: 'I ___ go now.', promptTranslated: 'Ман ҳозир бояд равам.', answer: 'must', options: ['must', 'musts'], explanation: 'must + феъли соф.' },
    ],
  },
  {
    key: 'present_perfect', emoji: '✔️', title: 'Present Perfect (intro)', titleTranslated: 'Замони ҳозираи комил (муқаддима)',
    explanation: 'Барои таҷриба ё амали ба ҳозира алоқаманд:\n\n- **have/has + феъли сеюм (past participle)**\n- ever (ягон бор), never (ҳеҷ гоҳ), already, yet.\n\nМисол: I **have seen** that film.',
    examples: [
      { sentence: 'I have visited London.', translation: 'Ман дар Лондон будаам.', highlight: 'have visited' },
      { sentence: 'Have you ever eaten sushi?', translation: 'Ту ягон бор суши хӯрдаӣ?', highlight: 'Have' },
      { sentence: 'She has never been to Paris.', translation: 'Ӯ ҳеҷ гоҳ дар Париж набудааст.', highlight: 'has never' },
    ],
    rules: [
      { pattern: 'have/has + past participle', note: 'have gone, has seen.' },
      { pattern: 'ever / never / already', note: 'Бо present perfect истифода мешаванд.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ seen this film.', promptTranslated: 'Ман ин филмро дидаам.', answer: 'have', options: ['have', 'has', 'had'], explanation: 'Бо I → have.' },
      { type: 'choose', prompt: 'She has ___ to Italy.', promptTranslated: 'Ӯ дар Италия будааст.', answer: 'been', options: ['be', 'was', 'been'], explanation: 'past participle → been.' },
    ],
  },
  {
    key: 'prepositions_time', emoji: '🕰️', title: 'Prepositions of time (in/on/at)', titleTranslated: 'Пешояндҳои вақт (in/on/at)',
    explanation: '- **at** + соат: at 7 o\'clock\n- **on** + рӯз/сана: on Monday\n- **in** + моҳ/сол/қисми рӯз: in May, in 2020, in the morning',
    examples: [
      { sentence: 'The class starts at 9.', translation: 'Дарс соати 9 сар мешавад.', highlight: 'at' },
      { sentence: 'I was born in May.', translation: 'Ман дар моҳи май таваллуд шудам.', highlight: 'in' },
      { sentence: 'We meet on Friday.', translation: 'Мо рӯзи ҷумъа вомехӯрем.', highlight: 'on' },
    ],
    rules: [
      { pattern: 'at + соат', note: 'at noon, at 6 pm.' },
      { pattern: 'on + рӯз; in + моҳ/сол', note: 'on Sunday; in winter.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I get up ___ 7 o\'clock.', promptTranslated: 'Ман соати 7 бедор мешавам.', answer: 'at', options: ['at', 'on', 'in'], explanation: 'Соат → at.' },
      { type: 'choose', prompt: 'My birthday is ___ July.', promptTranslated: 'Зодрӯзи ман дар июл аст.', answer: 'in', options: ['at', 'on', 'in'], explanation: 'Моҳ → in.' },
    ],
  },
  {
    key: 'too_enough', emoji: '⚠️', title: 'too / enough', titleTranslated: 'too / enough (аз ҳад/кофӣ)',
    explanation: '- **too** + сифат = аз ҳад зиёд: too expensive (аз ҳад қимат)\n- сифат + **enough** = ба қадри кофӣ: big enough (ба қадри кофӣ калон)',
    examples: [
      { sentence: 'This coffee is too hot.', translation: 'Ин қаҳва аз ҳад гарм аст.', highlight: 'too' },
      { sentence: 'He is not old enough.', translation: 'Ӯ ба қадри кофӣ калонсол нест.', highlight: 'enough' },
    ],
    rules: [
      { pattern: 'too + сифат', note: 'too small, too late.' },
      { pattern: 'сифат + enough', note: 'good enough, strong enough.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'These shoes are ___ small.', promptTranslated: 'Ин пойафзол аз ҳад хурд аст.', answer: 'too', options: ['too', 'enough'], explanation: 'Аз ҳад → too.' },
      { type: 'choose', prompt: 'He is tall ___ to play basketball.', promptTranslated: 'Ӯ ба қадри кофӣ баланд аст.', answer: 'enough', options: ['too', 'enough'], explanation: 'сифат + enough.' },
    ],
  },
);

// ── PHRASE COLLECTIONS ───────────────────────────────────────────────────────
CONTENT.phrases.push(
  {
    key: 'airport', category: 'travel', emoji: '✈️', title: 'At the airport', titleTranslated: 'Дар фурудгоҳ',
    phrases: [
      { text: 'Where is the check-in desk?', translation: 'Мизи бақайдгирӣ дар куҷост?' },
      { text: 'Here is my passport.', translation: 'Ин шиносномаи ман.' },
      { text: 'I have one suitcase.', translation: 'Ман як ҷомадон дорам.' },
      { text: 'Which gate is it?', translation: 'Кадом дарвоза?' },
      { text: 'What time does the flight leave?', translation: 'Парвоз кай мепарад?' },
      { text: 'Is the flight delayed?', translation: 'Парвоз дер мемонад?' },
    ],
  },
  {
    key: 'hotel', category: 'travel', emoji: '🏨', title: 'At the hotel', titleTranslated: 'Дар меҳмонхона',
    phrases: [
      { text: 'I have a reservation.', translation: 'Ман ҷой банд кардаам.' },
      { text: 'I would like a single room.', translation: 'Ман ҳуҷраи якнафара мехоҳам.' },
      { text: 'How much is it per night?', translation: 'Як шаб чанд пул аст?' },
      { text: 'Is breakfast included?', translation: 'Ноништа дохил аст?' },
      { text: 'What time is check-out?', translation: 'Вақти баромадан кай аст?' },
      { text: 'Can I have the key, please?', translation: 'Лутфан калидро дода метавонед?' },
    ],
  },
  {
    key: 'doctor', category: 'health', emoji: '🩺', title: 'At the doctor', titleTranslated: 'Дар назди духтур',
    phrases: [
      { text: 'I don\'t feel well.', translation: 'Ман худро бад ҳис мекунам.' },
      { text: 'I have a headache.', translation: 'Сарам дард мекунад.' },
      { text: 'I have a fever.', translation: 'Ман таб дорам.' },
      { text: 'My throat hurts.', translation: 'Гулӯям дард мекунад.' },
      { text: 'How often should I take this?', translation: 'Инро чанд бор истеъмол кунам?' },
      { text: 'Get well soon!', translation: 'Зудтар сиҳат шавед!' },
    ],
  },
  {
    key: 'weather', category: 'daily', emoji: '🌦️', title: 'Talking about weather', titleTranslated: 'Сӯҳбат дар бораи обу ҳаво',
    phrases: [
      { text: 'What\'s the weather like today?', translation: 'Имрӯз обу ҳаво чӣ хел аст?' },
      { text: 'It\'s sunny.', translation: 'Офтобӣ аст.' },
      { text: 'It\'s raining.', translation: 'Борон меборад.' },
      { text: 'It\'s very cold today.', translation: 'Имрӯз хеле хунук аст.' },
      { text: 'It will be hot tomorrow.', translation: 'Фардо гарм мешавад.' },
      { text: 'Take an umbrella.', translation: 'Чатр гир.' },
    ],
  },
  {
    key: 'phone', category: 'daily', emoji: '📞', title: 'On the phone', titleTranslated: 'Дар телефон',
    phrases: [
      { text: 'Hello, who is calling?', translation: 'Салом, кӣ занг зада истодааст?' },
      { text: 'Can I speak to Ali?', translation: 'Бо Алӣ гап зада метавонам?' },
      { text: 'Just a moment, please.', translation: 'Лутфан як лаҳза.' },
      { text: 'He is not here right now.', translation: 'Ӯ ҳозир ин ҷо нест.' },
      { text: 'Can I leave a message?', translation: 'Паём гузошта метавонам?' },
      { text: 'I\'ll call you back.', translation: 'Ман ба ту боз занг мезанам.' },
    ],
  },
  {
    key: 'restaurant2', category: 'food', emoji: '🍽️', title: 'Ordering a meal', titleTranslated: 'Фармоиши хӯрок',
    phrases: [
      { text: 'Are you ready to order?', translation: 'Барои фармоиш тайёред?' },
      { text: 'I\'ll have the chicken, please.', translation: 'Лутфан ман мурғ мегирам.' },
      { text: 'What do you recommend?', translation: 'Чиро тавсия медиҳед?' },
      { text: 'Could I have the menu?', translation: 'Менюро дода метавонед?' },
      { text: 'Can we have the bill, please?', translation: 'Лутфан ҳисобро биёред.' },
      { text: 'Everything was delicious.', translation: 'Ҳама чиз болаззат буд.' },
    ],
  },
);

// ── DIALOGUES ────────────────────────────────────────────────────────────────
CONTENT.dialogues.push(
  {
    key: 'airport_dlg', emoji: '✈️', title: 'At check-in', titleTranslated: 'Дар бақайдгирӣ',
    scenario: 'Мусофир дар фурудгоҳ ба бақайдгирӣ мегузарад.',
    lines: [
      { speaker: 'Agent', text: 'Good morning. Where are you flying today?', translation: 'Субҳ ба хайр. Имрӯз ба куҷо парвоз мекунед?' },
      { speaker: 'You', text: 'To Istanbul. Here is my passport.', translation: 'Ба Истанбул. Ин шиносномаи ман.', isUser: true },
      { speaker: 'Agent', text: 'How many bags do you have?', translation: 'Чанд бағоҷ доред?' },
      { speaker: 'You', text: 'Just one suitcase.', translation: 'Танҳо як ҷомадон.', isUser: true },
      { speaker: 'Agent', text: 'Here is your boarding pass. Gate 12.', translation: 'Ин чиптаи савориатон. Дарвозаи 12.' },
      { speaker: 'You', text: 'Thank you very much.', translation: 'Ташаккури зиёд.', isUser: true },
    ],
  },
  {
    key: 'doctor_dlg', emoji: '🩺', title: 'At the doctor', titleTranslated: 'Дар назди духтур',
    scenario: 'Бемор ба духтур мушкилиашро мегӯяд.',
    lines: [
      { speaker: 'Doctor', text: 'What\'s the problem?', translation: 'Мушкилӣ чист?' },
      { speaker: 'You', text: 'I have a headache and a fever.', translation: 'Сарам дард мекунаду таб дорам.', isUser: true },
      { speaker: 'Doctor', text: 'How long have you felt like this?', translation: 'Чанд вақт боз ин хелед?' },
      { speaker: 'You', text: 'Since yesterday.', translation: 'Аз дирӯз.', isUser: true },
      { speaker: 'Doctor', text: 'You should rest and drink water.', translation: 'Ту бояд истироҳат кунӣ ва об нӯшӣ.' },
      { speaker: 'You', text: 'Thank you, doctor.', translation: 'Ташаккур, духтур.', isUser: true },
    ],
  },
  {
    key: 'hotel_dlg', emoji: '🏨', title: 'Booking a room', titleTranslated: 'Банд кардани ҳуҷра',
    scenario: 'Меҳмон дар меҳмонхона ҳуҷра банд мекунад.',
    lines: [
      { speaker: 'Receptionist', text: 'Welcome! How can I help you?', translation: 'Хуш омадед! Чӣ хизмат?' },
      { speaker: 'You', text: 'I\'d like a room for two nights.', translation: 'Ман барои ду шаб ҳуҷра мехоҳам.', isUser: true },
      { speaker: 'Receptionist', text: 'A single or double room?', translation: 'Ҳуҷраи якнафара ё дунафара?' },
      { speaker: 'You', text: 'A single room, please. How much is it?', translation: 'Якнафара, лутфан. Чанд пул аст?', isUser: true },
      { speaker: 'Receptionist', text: 'Forty dollars per night, breakfast included.', translation: 'Шабе чил доллар, бо ноништа.' },
      { speaker: 'You', text: 'Great, I\'ll take it.', translation: 'Аъло, ман мегирам.', isUser: true },
    ],
  },
  {
    key: 'plans_dlg', emoji: '📅', title: 'Weekend plans', titleTranslated: 'Нақшаҳои истироҳат',
    scenario: 'Ду дӯст дар бораи рӯзҳои истироҳат сӯҳбат мекунанд.',
    lines: [
      { speaker: 'Sara', text: 'What are you going to do this weekend?', translation: 'Ин истироҳат чӣ кор мекунӣ?' },
      { speaker: 'You', text: 'I\'m going to visit my grandparents.', translation: 'Ман ба назди бобову бибиям меравам.', isUser: true },
      { speaker: 'Sara', text: 'Nice! Will you travel by car?', translation: 'Хуб! Бо мошин меравӣ?' },
      { speaker: 'You', text: 'Yes, and you? What are your plans?', translation: 'Ҳа, ту чӣ? Нақшаат чист?', isUser: true },
      { speaker: 'Sara', text: 'I\'ll stay home and read a book.', translation: 'Ман дар хона мемонаму китоб мехонам.' },
    ],
  },
  {
    key: 'interview_dlg', emoji: '💼', title: 'A simple job interview', titleTranslated: 'Мусоҳибаи кор',
    scenario: 'Номзад дар мусоҳибаи кор савол ҷавоб медиҳад.',
    lines: [
      { speaker: 'Manager', text: 'Tell me about yourself.', translation: 'Дар бораи худатон гӯед.' },
      { speaker: 'You', text: 'I\'m 25 and I studied marketing.', translation: 'Ман 25-сола ҳастам ва маркетинг хондаам.', isUser: true },
      { speaker: 'Manager', text: 'Why do you want this job?', translation: 'Чаро ин корро мехоҳед?' },
      { speaker: 'You', text: 'I like working with people.', translation: 'Ман бо одамон кор карданро дӯст медорам.', isUser: true },
      { speaker: 'Manager', text: 'When can you start?', translation: 'Кай сар карда метавонед?' },
      { speaker: 'You', text: 'I can start next week.', translation: 'Ман ҳафтаи оянда сар карда метавонам.', isUser: true },
    ],
  },
);

// ── READING COMPREHENSION ────────────────────────────────────────────────────
CONTENT.comprehensions.push(
  {
    key: 'last_holiday', emoji: '🏖️', kind: 'reading', title: 'My last holiday', titleTranslated: 'Истироҳати охирини ман',
    passage: 'Last summer I went to Bukhara with my family. We stayed in a small hotel for three days. The weather was hot and sunny. We visited old buildings and ate delicious food. It was a wonderful holiday.',
    passageTranslated: 'Тобистони гузашта ман бо оилаам ба Бухоро рафтам. Мо се рӯз дар меҳмонхонаи хурд мондем. Ҳаво гарму офтобӣ буд. Мо биноҳои қадимиро дидем ва хӯроки болаззат хӯрдем. Истироҳати аҷоиб буд.',
    questions: [
      { question: 'Where did he go?', questionTranslated: 'Ӯ ба куҷо рафт?', options: ['Bukhara', 'Dushanbe', 'Moscow', 'Istanbul'], correctIndex: 0, explanation: '«I went to Bukhara».' },
      { question: 'How long did they stay?', questionTranslated: 'Чанд рӯз монданд?', options: ['Two days', 'Three days', 'A week', 'One day'], correctIndex: 1, explanation: '«for three days».' },
      { question: 'How was the weather?', questionTranslated: 'Ҳаво чӣ хел буд?', options: ['Cold', 'Rainy', 'Hot and sunny', 'Snowy'], correctIndex: 2, explanation: '«hot and sunny».' },
    ],
  },
  {
    key: 'busy_week', emoji: '📅', kind: 'reading', title: 'A busy week', titleTranslated: 'Ҳафтаи серкор',
    passage: 'Omar has a busy week. On Monday he works in the office. On Wednesday he studies English. On Friday he plays football with friends. He usually goes to bed early because he wakes up at six.',
    passageTranslated: 'Умар ҳафтаи серкор дорад. Душанбе дар идора кор мекунад. Чоршанбе англисӣ меомӯзад. Ҷумъа бо дӯстон футбол бозӣ мекунад. Ӯ одатан барвақт хоб меравад, зеро соати шаш бедор мешавад.',
    questions: [
      { question: 'What does he do on Wednesday?', questionTranslated: 'Чоршанбе чӣ кор мекунад?', options: ['Works', 'Studies English', 'Plays football', 'Sleeps'], correctIndex: 1, explanation: '«On Wednesday he studies English».' },
      { question: 'When does he wake up?', questionTranslated: 'Кай бедор мешавад?', options: ['At five', 'At six', 'At seven', 'At eight'], correctIndex: 1, explanation: '«he wakes up at six».' },
    ],
  },
  {
    key: 'future_plans', emoji: '🚀', kind: 'reading', title: 'My future plans', titleTranslated: 'Нақшаҳои ояндаи ман',
    passage: 'Next year I am going to study at university. I want to be an engineer. First, I will learn English well, because many books are in English. I think it will be difficult, but I will work hard.',
    passageTranslated: 'Соли оянда ман дар донишгоҳ мехонам. Ман мехоҳам муҳандис шавам. Аввал, ман англисиро хуб меомӯзам, зеро бисёр китобҳо бо англисӣ ҳастанд. Ман фикр мекунам, ки душвор мешавад, аммо сахт кор мекунам.',
    questions: [
      { question: 'What does he want to be?', questionTranslated: 'Ӯ кӣ шудан мехоҳад?', options: ['A doctor', 'A teacher', 'An engineer', 'A driver'], correctIndex: 2, explanation: '«I want to be an engineer».' },
      { question: 'What will he learn first?', questionTranslated: 'Аввал чиро меомӯзад?', options: ['Maths', 'English', 'Music', 'Sport'], correctIndex: 1, explanation: '«I will learn English well».' },
    ],
  },
  {
    key: 'friend_job', emoji: '👩‍⚕️', kind: 'reading', title: "My friend's job", titleTranslated: 'Кори дӯсти ман',
    passage: 'My friend Lola is a nurse. She works at a hospital in Khujand. She usually starts work at eight in the morning. She helps sick people every day. She is always kind and patient. She loves her job.',
    passageTranslated: 'Дӯстам Лола ҳамшираи шафқат аст. Ӯ дар беморхонаи Хуҷанд кор мекунад. Одатан соати ҳашти субҳ корро сар мекунад. Ҳар рӯз ба беморон кӯмак мекунад. Ӯ ҳамеша меҳрубону сабр аст. Корашро дӯст медорад.',
    questions: [
      { question: 'What is Lola\'s job?', questionTranslated: 'Касби Лола чист?', options: ['Teacher', 'Nurse', 'Doctor', 'Cook'], correctIndex: 1, explanation: '«Lola is a nurse».' },
      { question: 'When does she start work?', questionTranslated: 'Кай корро сар мекунад?', options: ['At seven', 'At eight', 'At nine', 'At ten'], correctIndex: 1, explanation: '«at eight in the morning».' },
    ],
  },
);

// ── MODULES & LESSONS ────────────────────────────────────────────────────────
CONTENT.modules.push(
  {
    title: 'The Past 1 (was / were)', titleTranslated: 'Гузашта 1 (буд/буданд)', emoji: '⏮️', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'Past time expressions', titleTranslated: 'Ибораҳои вақти гузашта', emoji: '🕰️',
        words: [
          { word: 'Yesterday', translation: 'Дирӯз' },
          { word: 'Last night', translation: 'Шаби гузашта' },
          { word: 'Last week', translation: 'Ҳафтаи гузашта' },
          { word: 'Last year', translation: 'Соли гузашта' },
          { word: 'Ago', translation: 'Пеш (аз ин)' },
          { word: 'Then', translation: 'Он гоҳ' },
          { word: 'In the past', translation: 'Дар гузашта' },
          { word: 'This morning', translation: 'Имрӯз субҳ' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'past_be', title: 'Was / Were', titleTranslated: 'Буд / Буданд', emoji: '⏮️' },
      {
        skillType: 'vocab', title: "Yesterday's activities", titleTranslated: 'Корҳои дирӯза', emoji: '🏃',
        words: [
          { word: 'Visit', translation: 'Меҳмонӣ рафтан' },
          { word: 'Clean', translation: 'Тоза кардан', emoji: '🧹' },
          { word: 'Watch', translation: 'Тамошо кардан', emoji: '📺' },
          { word: 'Listen', translation: 'Гӯш кардан', emoji: '🎧' },
          { word: 'Call', translation: 'Занг задан', emoji: '📞' },
          { word: 'Help', translation: 'Кӯмак кардан' },
          { word: 'Stay', translation: 'Мондан' },
          { word: 'Travel', translation: 'Сафар кардан', emoji: '🧳' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'past_regular', title: 'Past Simple (-ed)', titleTranslated: 'Гузаштаи қоидавӣ (-ed)', emoji: '✅' },
      { skillType: 'reading', comprehensionKey: 'busy_week', title: 'Reading: A busy week', titleTranslated: 'Хониш: Ҳафтаи серкор', emoji: '📖' },
      {
        skillType: 'speaking', title: 'Speak: Yesterday', titleTranslated: 'Гуфтор: Дирӯз', emoji: '🎤',
        words: [
          { word: 'I was at home', translation: 'Ман дар хона будам' },
          { word: 'I watched a film', translation: 'Ман филм тамошо кардам' },
          { word: 'We played football', translation: 'Мо футбол бозӣ кардем' },
          { word: 'It was a good day', translation: 'Рӯзи хуб буд' },
        ],
      },
    ],
  },
  {
    title: 'The Past 2 (irregular)', titleTranslated: 'Гузашта 2 (бесистема)', emoji: '🌀', color: '#A78BFA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'past_irregular', title: 'Irregular verbs', titleTranslated: 'Феълҳои бесистема', emoji: '🌀' },
      {
        skillType: 'vocab', title: 'Common irregular verbs', titleTranslated: 'Феълҳои бесистемаи маъмул', emoji: '📋',
        words: [
          { word: 'Go → Went', translation: 'Рафтан → рафт' },
          { word: 'See → Saw', translation: 'Дидан → дид' },
          { word: 'Eat → Ate', translation: 'Хӯрдан → хӯрд' },
          { word: 'Have → Had', translation: 'Доштан → дошт' },
          { word: 'Buy → Bought', translation: 'Харидан → харид' },
          { word: 'Make → Made', translation: 'Сохтан → сохт' },
          { word: 'Take → Took', translation: 'Гирифтан → гирифт' },
          { word: 'Come → Came', translation: 'Омадан → омад' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'past_questions', title: 'Questions with did', titleTranslated: 'Саволҳо бо did', emoji: '❔' },
      { skillType: 'reading', comprehensionKey: 'last_holiday', title: 'Reading: My last holiday', titleTranslated: 'Хониш: Истироҳати охирин', emoji: '📖' },
      {
        skillType: 'speaking', title: 'Speak: My weekend', titleTranslated: 'Гуфтор: Истироҳати ман', emoji: '🎤',
        words: [
          { word: 'I went to the park', translation: 'Ман ба боғ рафтам' },
          { word: 'I saw my friend', translation: 'Ман дӯстамро дидам' },
          { word: 'We had dinner', translation: 'Мо хӯроки шом хӯрдем' },
          { word: 'Did you have fun', translation: 'Хуш гузаронидӣ' },
        ],
      },
    ],
  },
  {
    title: 'Comparisons', titleTranslated: 'Муқоиса', emoji: '⚖️', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'Describing adjectives', titleTranslated: 'Сифатҳои тавсифӣ', emoji: '🎨',
        words: [
          { word: 'Cheap', translation: 'Арзон' },
          { word: 'Expensive', translation: 'Қимат' },
          { word: 'Fast', translation: 'Тез' },
          { word: 'Slow', translation: 'Суст' },
          { word: 'Easy', translation: 'Осон' },
          { word: 'Difficult', translation: 'Душвор' },
          { word: 'Beautiful', translation: 'Зебо' },
          { word: 'Famous', translation: 'Машҳур' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'comparatives', title: 'Comparatives', titleTranslated: 'Дараҷаи қиёсӣ', emoji: '⚖️' },
      { skillType: 'grammar', grammarKey: 'superlatives', title: 'Superlatives', titleTranslated: 'Дараҷаи олӣ', emoji: '🏅' },
      {
        skillType: 'vocab', title: 'Opposites', titleTranslated: 'Зидмаъноҳо', emoji: '↔️',
        words: [
          { word: 'Old', translation: 'Кӯҳна / пир' },
          { word: 'Young', translation: 'Ҷавон' },
          { word: 'Strong', translation: 'Қавӣ' },
          { word: 'Weak', translation: 'Заиф' },
          { word: 'Clean', translation: 'Тоза' },
          { word: 'Dirty', translation: 'Ифлос' },
          { word: 'Light', translation: 'Сабук' },
          { word: 'Heavy', translation: 'Вазнин' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: Compare', titleTranslated: 'Гуфтор: Муқоиса', emoji: '🎤',
        words: [
          { word: 'A car is faster than a bike', translation: 'Мошин аз велосипед тезтар аст' },
          { word: 'This is the best film', translation: 'Ин беҳтарин филм аст' },
          { word: 'Summer is hotter than winter', translation: 'Тобистон аз зимистон гармтар аст' },
        ],
      },
    ],
  },
  {
    title: 'The Future', titleTranslated: 'Оянда', emoji: '🔮', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'Future time words', titleTranslated: 'Калимаҳои вақти оянда', emoji: '⏭️',
        words: [
          { word: 'Tomorrow', translation: 'Фардо' },
          { word: 'Next week', translation: 'Ҳафтаи оянда' },
          { word: 'Next year', translation: 'Соли оянда' },
          { word: 'Soon', translation: 'Ба зудӣ' },
          { word: 'Later', translation: 'Баъдтар' },
          { word: 'Tonight', translation: 'Имшаб' },
          { word: 'In the future', translation: 'Дар оянда' },
          { word: 'Plan', translation: 'Нақша' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'going_to', title: 'Be going to', titleTranslated: 'Be going to', emoji: '🎯' },
      { skillType: 'grammar', grammarKey: 'will', title: 'Will', titleTranslated: 'Will', emoji: '🔮' },
      { skillType: 'reading', comprehensionKey: 'future_plans', title: 'Reading: My future plans', titleTranslated: 'Хониш: Нақшаҳои оянда', emoji: '📖' },
      { skillType: 'vocab', dialogueKey: 'plans_dlg', title: 'Weekend plans', titleTranslated: 'Нақшаҳои истироҳат', emoji: '📅' },
      {
        skillType: 'speaking', title: 'Speak: My plans', titleTranslated: 'Гуфтор: Нақшаҳои ман', emoji: '🎤',
        words: [
          { word: 'I am going to study', translation: 'Ман ният дорам хонам' },
          { word: 'I will call you later', translation: 'Ман баъдтар ба ту занг мезанам' },
          { word: 'We are going to travel', translation: 'Мо ният дорем сафар кунем' },
        ],
      },
    ],
  },
  {
    title: 'Food & Quantity', titleTranslated: 'Хӯрок ва миқдор', emoji: '🍔', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'More food', titleTranslated: 'Хӯроки бештар', emoji: '🥗',
        words: [
          { word: 'Vegetable', translation: 'Сабзавот', emoji: '🥦' },
          { word: 'Fruit', translation: 'Мева', emoji: '🍓' },
          { word: 'Chicken', translation: 'Мурғ', emoji: '🍗' },
          { word: 'Potato', translation: 'Картошка', emoji: '🥔' },
          { word: 'Butter', translation: 'Равған' },
          { word: 'Juice', translation: 'Шарбат', emoji: '🧃' },
          { word: 'Plate', translation: 'Табақ', emoji: '🍽️' },
          { word: 'Spoon', translation: 'Қошуқ', emoji: '🥄' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'countable', title: 'Some / Any', titleTranslated: 'Some / Any', emoji: '🧮' },
      { skillType: 'grammar', grammarKey: 'quantifiers', title: 'Much / Many', titleTranslated: 'Much / Many', emoji: '📊' },
      { skillType: 'vocab', phraseKey: 'restaurant2', title: 'Ordering a meal', titleTranslated: 'Фармоиши хӯрок', emoji: '🍽️' },
      {
        skillType: 'speaking', title: 'Speak: At a cafe', titleTranslated: 'Гуфтор: Дар қаҳвахона', emoji: '🎤',
        words: [
          { word: 'I would like some tea', translation: 'Ман каме чой мехоҳам' },
          { word: 'How much is it', translation: 'Ин чанд пул аст' },
          { word: 'Can I have the bill', translation: 'Ҳисобро дода метавонед' },
        ],
      },
    ],
  },
);

CONTENT.modules.push(
  {
    title: 'Health', titleTranslated: 'Саломатӣ', emoji: '🩺', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'Body & health', titleTranslated: 'Бадан ва саломатӣ', emoji: '🧍',
        words: [
          { word: 'Head', translation: 'Сар', emoji: '🧠' },
          { word: 'Stomach', translation: 'Меъда' },
          { word: 'Throat', translation: 'Гулӯ' },
          { word: 'Tooth', translation: 'Дандон', emoji: '🦷' },
          { word: 'Fever', translation: 'Таб', emoji: '🤒' },
          { word: 'Cough', translation: 'Сулфа' },
          { word: 'Medicine', translation: 'Дору', emoji: '💊' },
          { word: 'Healthy', translation: 'Солим' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'should', title: 'Should / Shouldn\'t', titleTranslated: 'Маслиҳат (should)', emoji: '💡' },
      { skillType: 'grammar', grammarKey: 'have_to', title: 'Have to / Must', titleTranslated: 'Бояд (have to/must)', emoji: '📌' },
      { skillType: 'vocab', phraseKey: 'doctor', title: 'At the doctor', titleTranslated: 'Дар назди духтур', emoji: '🩺' },
      { skillType: 'vocab', dialogueKey: 'doctor_dlg', title: "Doctor's visit", titleTranslated: 'Ташрифи духтур', emoji: '🗣️' },
    ],
  },
  {
    title: 'Travel', titleTranslated: 'Сафар', emoji: '✈️', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'Travel words', titleTranslated: 'Калимаҳои сафар', emoji: '🧳',
        words: [
          { word: 'Airport', translation: 'Фурудгоҳ', emoji: '🛫' },
          { word: 'Ticket', translation: 'Чипта', emoji: '🎫' },
          { word: 'Passport', translation: 'Шиноснома' },
          { word: 'Luggage', translation: 'Бағоҷ', emoji: '🧳' },
          { word: 'Flight', translation: 'Парвоз' },
          { word: 'Train', translation: 'Қатор', emoji: '🚆' },
          { word: 'Map', translation: 'Харита', emoji: '🗺️' },
          { word: 'Trip', translation: 'Сафар' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'prepositions_time', title: 'In / On / At (time)', titleTranslated: 'Пешояндҳои вақт', emoji: '🕰️' },
      { skillType: 'vocab', phraseKey: 'airport', title: 'At the airport', titleTranslated: 'Дар фурудгоҳ', emoji: '✈️' },
      { skillType: 'vocab', phraseKey: 'hotel', title: 'At the hotel', titleTranslated: 'Дар меҳмонхона', emoji: '🏨' },
      { skillType: 'vocab', dialogueKey: 'airport_dlg', title: 'Check-in', titleTranslated: 'Бақайдгирӣ', emoji: '🛂' },
      { skillType: 'vocab', dialogueKey: 'hotel_dlg', title: 'Booking a room', titleTranslated: 'Банд кардани ҳуҷра', emoji: '🛏️' },
    ],
  },
  {
    title: 'Work & Routine', titleTranslated: 'Кор ва ҳаррӯза', emoji: '💼', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'Jobs', titleTranslated: 'Касбҳо', emoji: '👷',
        words: [
          { word: 'Doctor', translation: 'Духтур', emoji: '👨‍⚕️' },
          { word: 'Teacher', translation: 'Муаллим', emoji: '🧑‍🏫' },
          { word: 'Nurse', translation: 'Ҳамшираи шафқат', emoji: '👩‍⚕️' },
          { word: 'Driver', translation: 'Ронанда', emoji: '🚗' },
          { word: 'Engineer', translation: 'Муҳандис', emoji: '👷' },
          { word: 'Cook', translation: 'Ошпаз', emoji: '👨‍🍳' },
          { word: 'Office', translation: 'Идора', emoji: '🏢' },
          { word: 'Salary', translation: 'Маош', emoji: '💵' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'adverbs_frequency', title: 'Adverbs of frequency', titleTranslated: 'Зарфҳои такрор', emoji: '🔁' },
      { skillType: 'grammar', grammarKey: 'present_perfect', title: 'Present Perfect', titleTranslated: 'Замони ҳозираи комил', emoji: '✔️' },
      { skillType: 'reading', comprehensionKey: 'friend_job', title: "Reading: My friend's job", titleTranslated: 'Хониш: Кори дӯсти ман', emoji: '📖' },
      { skillType: 'vocab', dialogueKey: 'interview_dlg', title: 'Job interview', titleTranslated: 'Мусоҳибаи кор', emoji: '💼' },
    ],
  },
  {
    title: 'Weather & Contact', titleTranslated: 'Обу ҳаво ва алоқа', emoji: '🌦️', color: '#A78BFA',
    lessons: [
      {
        skillType: 'vocab', title: 'Weather words', titleTranslated: 'Калимаҳои обу ҳаво', emoji: '🌤️',
        words: [
          { word: 'Sunny', translation: 'Офтобӣ', emoji: '☀️' },
          { word: 'Rainy', translation: 'Боронӣ', emoji: '🌧️' },
          { word: 'Cloudy', translation: 'Абрнок', emoji: '☁️' },
          { word: 'Windy', translation: 'Шамолӣ', emoji: '💨' },
          { word: 'Snow', translation: 'Барф', emoji: '❄️' },
          { word: 'Hot', translation: 'Гарм', emoji: '🔥' },
          { word: 'Cold', translation: 'Хунук', emoji: '🥶' },
          { word: 'Temperature', translation: 'Ҳарорат', emoji: '🌡️' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'too_enough', title: 'Too / Enough', titleTranslated: 'Too / Enough', emoji: '⚠️' },
      { skillType: 'vocab', phraseKey: 'weather', title: 'Talking about weather', titleTranslated: 'Сӯҳбати обу ҳаво', emoji: '🌦️' },
      { skillType: 'vocab', phraseKey: 'phone', title: 'On the phone', titleTranslated: 'Дар телефон', emoji: '📞' },
      {
        skillType: 'speaking', title: 'Speak: Weather', titleTranslated: 'Гуфтор: Обу ҳаво', emoji: '🎤',
        words: [
          { word: "What's the weather like", translation: 'Обу ҳаво чӣ хел аст' },
          { word: 'It is sunny today', translation: 'Имрӯз офтобӣ аст' },
          { word: 'It will rain tomorrow', translation: 'Фардо борон меборад' },
        ],
      },
    ],
  },
  {
    title: 'Writing & Listening', titleTranslated: 'Навиштан ва шунавоӣ', emoji: '✍️', color: '#F59E0B',
    lessons: [
      {
        skillType: 'listening', title: 'Listen: Past verbs', titleTranslated: 'Шунавоӣ: Феълҳои гузашта', emoji: '🎧',
        words: [
          { word: 'Went', translation: 'Рафт' },
          { word: 'Saw', translation: 'Дид' },
          { word: 'Bought', translation: 'Харид' },
          { word: 'Ate', translation: 'Хӯрд' },
        ],
      },
      {
        skillType: 'listening', title: 'Listen: Travel', titleTranslated: 'Шунавоӣ: Сафар', emoji: '🎧',
        words: [
          { word: 'Airport', translation: 'Фурудгоҳ' },
          { word: 'Ticket', translation: 'Чипта' },
          { word: 'Hotel', translation: 'Меҳмонхона' },
          { word: 'Weather', translation: 'Обу ҳаво' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Past verbs', titleTranslated: 'Навиштан: Феълҳои гузашта', emoji: '✍️',
        words: [
          { word: 'Went', translation: 'Рафт' },
          { word: 'Saw', translation: 'Дид' },
          { word: 'Bought', translation: 'Харид' },
          { word: 'Ate', translation: 'Хӯрд' },
          { word: 'Had', translation: 'Дошт' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Travel & health', titleTranslated: 'Навиштан: Сафар ва саломатӣ', emoji: '✍️',
        words: [
          { word: 'Airport', translation: 'Фурудгоҳ' },
          { word: 'Ticket', translation: 'Чипта' },
          { word: 'Medicine', translation: 'Дору' },
          { word: 'Hotel', translation: 'Меҳмонхона' },
          { word: 'Weather', translation: 'Обу ҳаво' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Short sentences', titleTranslated: 'Навиштан: Ҷумлаҳои кӯтоҳ', emoji: '✍️',
        words: [
          { word: 'I am going to study', translation: 'Ман ният дорам хонам' },
          { word: 'She is taller than me', translation: 'Ӯ аз ман баландтар аст' },
          { word: 'I will call you', translation: 'Ман ба ту занг мезанам' },
        ],
      },
    ],
  },
  {
    title: 'A2 Review', titleTranslated: 'Такрори A2', emoji: '🏆', color: '#A78BFA',
    lessons: [
      {
        skillType: 'review', type: 'quiz', title: 'A2 Review — Past & Future', titleTranslated: 'Такрор — гузашта ва оянда', emoji: '🔁', xpReward: 100,
        words: [
          { word: 'Went', translation: 'Рафт' },
          { word: 'Bought', translation: 'Харид' },
          { word: 'Yesterday', translation: 'Дирӯз' },
          { word: 'Tomorrow', translation: 'Фардо' },
          { word: 'Faster', translation: 'Тезтар' },
          { word: 'The best', translation: 'Беҳтарин' },
          { word: 'Going to', translation: 'Ният доштан' },
          { word: 'Will', translation: 'Хоҳад (оянда)' },
        ],
      },
      {
        skillType: 'review', type: 'quiz', title: 'A2 Review — Daily life', titleTranslated: 'Такрор — ҳаёти ҳаррӯза', emoji: '🏆', xpReward: 100,
        words: [
          { word: 'Should', translation: 'Бояд (маслиҳат)' },
          { word: 'Must', translation: 'Бояд' },
          { word: 'Airport', translation: 'Фурудгоҳ' },
          { word: 'Medicine', translation: 'Дору' },
          { word: 'Salary', translation: 'Маош' },
          { word: 'Weather', translation: 'Обу ҳаво' },
          { word: 'Always', translation: 'Ҳамеша' },
          { word: 'Never', translation: 'Ҳеҷ гоҳ' },
        ],
      },
    ],
  },
);

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('❌ Seed failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

