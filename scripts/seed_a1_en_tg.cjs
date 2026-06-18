/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Full A1 English-for-Tajik course seeder.
// Wipes ONLY the (English target, Tajik native, level A1) course content and
// rebuilds it from scratch: modules → lessons → words, plus grammar topics,
// phrase collections, dialogues and reading comprehensions. Other courses,
// languages and users are never touched.
//
// Run (from backend dir, with env loaded):
//   set -a; . .env; set +a
//   node scripts/seed_a1_en_tg.cjs
//
// NOTE: `options` on grammar/comprehension are Prisma Json fields — pass arrays
// DIRECTLY (never JSON.stringify), otherwise Array.isArray() checks fail.
// ─────────────────────────────────────────────────────────────────────────────
const { PrismaClient } = require('C:/Users/ASUS1/Desktop/RAMZ/backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const TARGET_CODE = 'en';
const NATIVE_CODE = 'tg';
const LEVEL = 'A1';

// Content arrays — populated in chunks further down this file.
const CONTENT = {
  grammar: [],        // { key, title, titleTranslated, explanation, emoji, order, examples[], rules[], exercises[] }
  phrases: [],        // { key, category, title, titleTranslated, emoji, order, phrases[] }
  dialogues: [],      // { key, title, titleTranslated, scenario, emoji, order, lines[] }
  comprehensions: [], // { key, kind, title, titleTranslated, passage, passageTranslated, emoji, order, questions[] }
  modules: [],        // { title, titleTranslated, emoji, color, order, lessons[] }
};

// ── Engine ───────────────────────────────────────────────────────────────────

// Capitalise the FIRST letter of any word/sentence, in any language. Display
// content must never start with a lowercase letter (user requirement). Applied
// to all shown text fields below; left OFF grammar answer/option match tokens
// so mid-sentence fill-in answers still compare correctly.
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

  if (!course) {
    course = await prisma.course.create({
      data: {
        targetLanguageId: target.id,
        nativeLanguageId: native.id,
        level: LEVEL,
        title: 'Англисӣ — Сатҳи A1',
        description: 'Аз сифр: алифбо, саломҳо, рақамҳо, оила, грамматикаи асосӣ ва муколамаҳои ҳаррӯза.',
        emoji: '🇬🇧',
        color: '#14B8A6',
        order: 1,
        isActive: true,
      },
    });
    console.log('  + created A1 course', course.id);
  } else {
    // Keep the course but freshen its presentation.
    await prisma.course.update({
      where: { id: course.id },
      data: {
        title: 'Англисӣ — Сатҳи A1',
        description: 'Аз сифр: алифбо, саломҳо, рақамҳо, оила, грамматикаи асосӣ ва муколамаҳои ҳаррӯза.',
        emoji: '🇬🇧',
        color: '#14B8A6',
        isActive: true,
      },
    });
    console.log('  · using existing A1 course', course.id);
  }
  return course;
}

async function wipeCourseContent(courseId) {
  // 1. Lessons of this course → delete their UserProgress first (no cascade on it).
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
  // 2. SRS cards scoped to this course (loose ref → tidy up).
  const ds = await prisma.srsCard.deleteMany({ where: { courseId } });
  if (ds.count) console.log(`  - deleted ${ds.count} srsCards`);

  // 3. Modules (cascade → lessons → words). Lesson→component links are SetNull.
  const dm = await prisma.module.deleteMany({ where: { courseId } });
  console.log(`  - deleted ${dm.count} modules (+lessons +words)`);

  // 4. Components (cascade → their children).
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
        examples: {
          create: (g.examples ?? []).map((e, j) => ({
            sentence: cap(e.sentence), translation: cap(e.translation),
            highlight: e.highlight ?? null, order: j,
          }))
        },
        rules: {
          create: (g.rules ?? []).map((r, j) => ({
            pattern: r.pattern, note: cap(r.note) ?? null, order: j,
          }))
        },
        exercises: {
          create: (g.exercises ?? []).map((x, j) => ({
            type: x.type ?? 'choose', prompt: cap(x.prompt),
            promptTranslated: cap(x.promptTranslated) ?? null,
            answer: x.answer, options: x.options ?? undefined, // match tokens — keep as authored
            explanation: cap(x.explanation) ?? null, order: j,
          }))
        },
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
        phrases: {
          create: (p.phrases ?? []).map((ph, j) => ({
            text: cap(ph.text), translation: cap(ph.translation),
            literal: cap(ph.literal) ?? null, note: cap(ph.note) ?? null, order: j,
          }))
        },
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
        lines: {
          create: (d.lines ?? []).map((l, j) => ({
            speaker: cap(l.speaker), text: cap(l.text), translation: cap(l.translation),
            isUser: l.isUser ?? false, order: j,
          }))
        },
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
        questions: {
          create: (c.questions ?? []).map((q, j) => ({
            question: cap(q.question), questionTranslated: cap(q.questionTranslated) ?? null,
            options: (q.options ?? []).map(cap), // Json array; correctIndex is positional → safe to cap
            correctIndex: q.correctIndex ?? 0,
            explanation: cap(q.explanation) ?? null, order: j,
          }))
        },
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
        emoji: m.emoji ?? '📚', color: m.color ?? '#14B8A6',
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
          words: {
            create: (l.words ?? []).map((w, j) => ({
              word: cap(w.word), translation: cap(w.translation),
              emoji: w.emoji ?? null, ipa: w.ipa ?? null,
              example: cap(w.example) ?? null, exampleTrans: cap(w.exampleTrans) ?? null,
              partOfSpeech: w.partOfSpeech ?? null,
              difficulty: w.difficulty ?? 1, order: j,
            }))
          },
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
  console.log('▶ Seeding A1 English-for-Tajik …');
  const course = await resolveCourse();
  console.log('▶ Wiping old A1 content …');
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
    key: 'be', emoji: '🟰', title: 'Verb "to be" (am / is / are)', titleTranslated: 'Феъли «to be» (будан)',
    explanation: 'Феъли **to be** маънои «будан»-ро дорад. Се шакл дорад:\n\n- **I am** — ман ҳастам\n- **He / She / It is** — ӯ ҳаст\n- **You / We / They are** — шумо/мо/онҳо ҳастанд\n\nДар забони англисӣ ҳатман ин феъл лозим аст, ҳарчанд дар тоҷикӣ баъзан партофта мешавад.',
    examples: [
      { sentence: 'I am a student.', translation: 'Ман донишҷӯ ҳастам.', highlight: 'am' },
      { sentence: 'She is my sister.', translation: 'Ӯ хоҳари ман аст.', highlight: 'is' },
      { sentence: 'They are happy.', translation: 'Онҳо хушҳоланд.', highlight: 'are' },
    ],
    rules: [
      { pattern: 'I + am', note: 'Бо «I» ҳамеша «am».' },
      { pattern: 'He / She / It + is', note: 'Бо шахси сеюми танҳо «is».' },
      { pattern: 'You / We / They + are', note: 'Бо ҷамъ ва «you» ҳамеша «are».' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ a teacher.', promptTranslated: 'Ман муаллим ҳастам.', answer: 'am', options: ['am', 'is', 'are'], explanation: 'Бо «I» ҳамеша «am».' },
      { type: 'choose', prompt: 'He ___ from Dushanbe.', promptTranslated: 'Ӯ аз Душанбе аст.', answer: 'is', options: ['am', 'is', 'are'], explanation: 'Бо «He» — «is».' },
      { type: 'choose', prompt: 'We ___ friends.', promptTranslated: 'Мо дӯст ҳастем.', answer: 'are', options: ['am', 'is', 'are'], explanation: 'Бо «We» — «are».' },
    ],
  },
  {
    key: 'pronouns', emoji: '👤', title: 'Subject pronouns', titleTranslated: 'Ҷонишинҳои шахсӣ',
    explanation: 'Ҷонишинҳо ба ҷои ном меоянд:\n\n- **I** — ман\n- **You** — ту/шумо\n- **He** — ӯ (мард)\n- **She** — ӯ (зан)\n- **It** — он (ашё/ҳайвон)\n- **We** — мо\n- **They** — онҳо',
    examples: [
      { sentence: 'I like tea.', translation: 'Ман чой дӯст медорам.', highlight: 'I' },
      { sentence: 'She is a doctor.', translation: 'Ӯ духтур аст.', highlight: 'She' },
      { sentence: 'They live here.', translation: 'Онҳо дар ин ҷо зиндагӣ мекунанд.', highlight: 'They' },
    ],
    rules: [
      { pattern: 'I / You / He / She / It / We / They', note: 'Ҷонишин ҳамеша пеш аз феъл меояд.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ is my mother. (зан)', promptTranslated: 'Ӯ модари ман аст.', answer: 'She', options: ['He', 'She', 'It'], explanation: 'Барои зан — «She».' },
      { type: 'choose', prompt: '___ are students.', promptTranslated: 'Онҳо донишҷӯ ҳастанд.', answer: 'They', options: ['He', 'They', 'She'], explanation: 'Барои ҷамъ — «They».' },
      { type: 'choose', prompt: '___ is a cat.', promptTranslated: 'Он гурба аст.', answer: 'It', options: ['He', 'She', 'It'], explanation: 'Барои ҳайвон/ашё — «It».' },
    ],
  },
  {
    key: 'a_an', emoji: '🅰️', title: 'Articles a / an', titleTranslated: 'Артиклҳои a / an',
    explanation: 'Пеш аз исми танҳо артикл меояд:\n\n- **a** — пеш аз садоноки ҳамсадо: a book, a car\n- **an** — пеш аз садонок (a, e, i, o, u): an apple, an egg',
    examples: [
      { sentence: 'This is a book.', translation: 'Ин китоб аст.', highlight: 'a' },
      { sentence: 'I have an apple.', translation: 'Ман себ дорам.', highlight: 'an' },
      { sentence: 'She is an engineer.', translation: 'Ӯ муҳандис аст.', highlight: 'an' },
    ],
    rules: [
      { pattern: 'a + ҳамсадо', note: 'a dog, a table, a pen.' },
      { pattern: 'an + садонок', note: 'an orange, an hour, an umbrella.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I see ___ elephant.', promptTranslated: 'Ман як фил мебинам.', answer: 'an', options: ['a', 'an'], explanation: '«elephant» бо садонок сар мешавад → an.' },
      { type: 'choose', prompt: 'He has ___ dog.', promptTranslated: 'Ӯ саг дорад.', answer: 'a', options: ['a', 'an'], explanation: '«dog» бо ҳамсадо → a.' },
      { type: 'choose', prompt: 'It is ___ orange.', promptTranslated: 'Ин афлесун аст.', answer: 'an', options: ['a', 'an'], explanation: '«orange» бо садонок → an.' },
    ],
  },
  {
    key: 'plural', emoji: '➕', title: 'Plural nouns', titleTranslated: 'Ҷамъи исмҳо',
    explanation: 'Барои ҷамъ ба охири исм **-s** ё **-es** илова мешавад:\n\n- book → book**s**\n- box → box**es** (баъди -s, -x, -ch, -sh)\n- baby → bab**ies** (y → ies)',
    examples: [
      { sentence: 'Two cats.', translation: 'Ду гурба.', highlight: 'cats' },
      { sentence: 'Three boxes.', translation: 'Се қуттӣ.', highlight: 'boxes' },
      { sentence: 'Many babies.', translation: 'Бисёр кӯдакон.', highlight: 'babies' },
    ],
    rules: [
      { pattern: 'Исм + s', note: 'Шакли муқаррарӣ: dogs, pens.' },
      { pattern: 'Исм + es', note: 'Баъди -s,-x,-ch,-sh: buses, watches.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I have three ___.', promptTranslated: 'Ман се китоб дорам.', answer: 'books', options: ['book', 'books', 'bookes'], explanation: 'Ҷамъи book → books.' },
      { type: 'choose', prompt: 'Two ___.', promptTranslated: 'Ду шиша.', answer: 'glasses', options: ['glass', 'glasss', 'glasses'], explanation: 'Баъди -ss → es.' },
    ],
  },
  {
    key: 'this_that', emoji: '👉', title: 'This / That / These / Those', titleTranslated: 'This / That / These / Those',
    explanation: 'Барои нишон додани ашё:\n\n- **This** — ин (наздик, танҳо)\n- **That** — он (дур, танҳо)\n- **These** — инҳо (наздик, ҷамъ)\n- **Those** — онҳо (дур, ҷамъ)',
    examples: [
      { sentence: 'This is my pen.', translation: 'Ин қалами ман аст.', highlight: 'This' },
      { sentence: 'That is a car.', translation: 'Он мошин аст.', highlight: 'That' },
      { sentence: 'These are books.', translation: 'Инҳо китобҳо ҳастанд.', highlight: 'These' },
    ],
    rules: [
      { pattern: 'This / That + исми танҳо', note: 'this book, that house.' },
      { pattern: 'These / Those + исми ҷамъ', note: 'these pens, those cars.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ is my house. (наздик)', promptTranslated: 'Ин хонаи ман аст.', answer: 'This', options: ['This', 'These', 'Those'], explanation: 'Наздик ва танҳо → This.' },
      { type: 'choose', prompt: '___ are my friends. (наздик, ҷамъ)', promptTranslated: 'Инҳо дӯстони ман ҳастанд.', answer: 'These', options: ['This', 'That', 'These'], explanation: 'Наздик ва ҷамъ → These.' },
    ],
  },
  {
    key: 'have_got', emoji: '🤲', title: 'Have got / Has got', titleTranslated: 'Have got / Has got (доштан)',
    explanation: 'Барои «доштан»:\n\n- **I / You / We / They have got**\n- **He / She / It has got**',
    examples: [
      { sentence: 'I have got a brother.', translation: 'Ман бародар дорам.', highlight: 'have got' },
      { sentence: 'She has got a cat.', translation: 'Ӯ гурба дорад.', highlight: 'has got' },
    ],
    rules: [
      { pattern: 'I/You/We/They + have got', note: 'have got = доранд.' },
      { pattern: 'He/She/It + has got', note: 'has got = дорад.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'She ___ a new phone.', promptTranslated: 'Ӯ телефони нав дорад.', answer: 'has got', options: ['have got', 'has got'], explanation: 'Бо She → has got.' },
      { type: 'choose', prompt: 'They ___ two children.', promptTranslated: 'Онҳо ду фарзанд доранд.', answer: 'have got', options: ['have got', 'has got'], explanation: 'Бо They → have got.' },
    ],
  },
  {
    key: 'possessive', emoji: '🔑', title: 'Possessive adjectives', titleTranslated: 'Сифатҳои соҳибӣ (my, your…)',
    explanation: 'Барои нишон додани соҳибият:\n\n- **my** — -и ман\n- **your** — -и ту/шумо\n- **his** — -и ӯ (мард)\n- **her** — -и ӯ (зан)\n- **its** — -и он\n- **our** — -и мо\n- **their** — -и онҳо',
    examples: [
      { sentence: 'This is my book.', translation: 'Ин китоби ман аст.', highlight: 'my' },
      { sentence: 'Her name is Sara.', translation: 'Номи ӯ Сара аст.', highlight: 'Her' },
      { sentence: 'Their house is big.', translation: 'Хонаи онҳо калон аст.', highlight: 'Their' },
    ],
    rules: [
      { pattern: 'Сифати соҳибӣ + исм', note: 'my car, your pen, his bag.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'This is ___ pen. (-и ман)', promptTranslated: 'Ин қалами ман аст.', answer: 'my', options: ['my', 'your', 'his'], explanation: '«-и ман» → my.' },
      { type: 'choose', prompt: 'What is ___ name? (-и ту)', promptTranslated: 'Номи ту чист?', answer: 'your', options: ['my', 'your', 'her'], explanation: '«-и ту» → your.' },
    ],
  },
  {
    key: 'present_simple', emoji: '🔁', title: 'Present Simple', titleTranslated: 'Замони ҳозираи содда',
    explanation: 'Барои амалҳои ҳамешагӣ ва одат:\n\n- I / You / We / They + **феъл**\n- He / She / It + **феъл + s**\n\nМисол: I work. → She work**s**.',
    examples: [
      { sentence: 'I play football.', translation: 'Ман футбол бозӣ мекунам.', highlight: 'play' },
      { sentence: 'He works in a bank.', translation: 'Ӯ дар бонк кор мекунад.', highlight: 'works' },
      { sentence: 'We live in Tajikistan.', translation: 'Мо дар Тоҷикистон зиндагӣ мекунем.', highlight: 'live' },
    ],
    rules: [
      { pattern: 'I/You/We/They + феъл', note: 'Бе тағйир: I read.' },
      { pattern: 'He/She/It + феъл + s', note: 'Шахси сеюм: He reads.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'She ___ English.', promptTranslated: 'Ӯ англисиро меомӯзад.', answer: 'studies', options: ['study', 'studies', 'studys'], explanation: 'He/She → феъл + s (y→ies).' },
      { type: 'choose', prompt: 'They ___ tea every day.', promptTranslated: 'Онҳо ҳар рӯз чой менӯшанд.', answer: 'drink', options: ['drink', 'drinks'], explanation: 'They → феъли соф.' },
    ],
  },
  {
    key: 'present_simple_q', emoji: '❓', title: 'Questions with do / does', titleTranslated: 'Саволҳо бо do / does',
    explanation: 'Барои савол дар замони ҳозира:\n\n- **Do** I/you/we/they …?\n- **Does** he/she/it …?\n\nФеъл баъди do/does ҳамеша соф мемонад.',
    examples: [
      { sentence: 'Do you like coffee?', translation: 'Ту қаҳва дӯст медорӣ?', highlight: 'Do' },
      { sentence: 'Does she speak English?', translation: 'Ӯ англисӣ гап мезанад?', highlight: 'Does' },
    ],
    rules: [
      { pattern: 'Do + I/you/we/they + феъл?', note: 'Do they work?' },
      { pattern: 'Does + he/she/it + феъл?', note: 'Does he work?' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ he live here?', promptTranslated: 'Ӯ дар ин ҷо зиндагӣ мекунад?', answer: 'Does', options: ['Do', 'Does'], explanation: 'Бо he → Does.' },
      { type: 'choose', prompt: '___ you speak Tajik?', promptTranslated: 'Ту тоҷикӣ гап мезанӣ?', answer: 'Do', options: ['Do', 'Does'], explanation: 'Бо you → Do.' },
    ],
  },
  {
    key: 'can', emoji: '💪', title: 'Can (ability)', titleTranslated: 'Can (тавоноӣ)',
    explanation: '**Can** маънои «метавонам» дорад. Баъди can феъл соф меояд:\n\n- I can swim. — Ман шино карда метавонам.\n- She can**not** (can\'t) drive. — Ӯ ронандагӣ карда наметавонад.',
    examples: [
      { sentence: 'I can speak English.', translation: 'Ман англисӣ гап зада метавонам.', highlight: 'can' },
      { sentence: 'He cannot swim.', translation: 'Ӯ шино карда наметавонад.', highlight: 'cannot' },
      { sentence: 'Can you help me?', translation: 'Метавонӣ ба ман кӯмак кунӣ?', highlight: 'Can' },
    ],
    rules: [
      { pattern: 'Subject + can + феъл', note: 'I can read.' },
      { pattern: 'Subject + can\'t + феъл', note: 'Инкор: I can\'t read.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ play the guitar.', promptTranslated: 'Ман гитара навохта метавонам.', answer: 'can', options: ['can', 'cans', 'caning'], explanation: 'Баъди can феъли соф.' },
      { type: 'choose', prompt: '___ you cook?', promptTranslated: 'Ту хӯрок пухта метавонӣ?', answer: 'Can', options: ['Can', 'Do', 'Does'], explanation: 'Савол бо тавоноӣ → Can.' },
    ],
  },
  {
    key: 'there_is_are', emoji: '📍', title: 'There is / There are', titleTranslated: 'There is / There are (ҳаст/ҳастанд)',
    explanation: 'Барои гуфтани «ҳаст/ҳастанд»:\n\n- **There is** + исми танҳо\n- **There are** + исми ҷамъ',
    examples: [
      { sentence: 'There is a book on the table.', translation: 'Дар рӯи миз китоб ҳаст.', highlight: 'There is' },
      { sentence: 'There are five chairs.', translation: 'Панҷ курсӣ ҳаст.', highlight: 'There are' },
    ],
    rules: [
      { pattern: 'There is + танҳо', note: 'There is a cat.' },
      { pattern: 'There are + ҷамъ', note: 'There are two cats.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ a dog in the garden.', promptTranslated: 'Дар боғ як саг ҳаст.', answer: 'There is', options: ['There is', 'There are'], explanation: 'Як саг (танҳо) → There is.' },
      { type: 'choose', prompt: '___ many people here.', promptTranslated: 'Дар ин ҷо бисёр одам ҳаст.', answer: 'There are', options: ['There is', 'There are'], explanation: 'Ҷамъ → There are.' },
    ],
  },
  {
    key: 'prepositions', emoji: '🧭', title: 'Prepositions of place', titleTranslated: 'Пешояндҳои ҷой (in, on, under…)',
    explanation: 'Барои нишон додани ҷой:\n\n- **in** — дар дохили\n- **on** — дар рӯи\n- **under** — дар зери\n- **next to** — дар паҳлӯи',
    examples: [
      { sentence: 'The cat is on the bed.', translation: 'Гурба дар рӯи кат аст.', highlight: 'on' },
      { sentence: 'The ball is under the table.', translation: 'Тӯб дар зери миз аст.', highlight: 'under' },
      { sentence: 'The keys are in the bag.', translation: 'Калидҳо дар дохили халта ҳастанд.', highlight: 'in' },
    ],
    rules: [
      { pattern: 'in / on / under / next to + ҷой', note: 'on the chair, in the box.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'The book is ___ the table.', promptTranslated: 'Китоб дар рӯи миз аст.', answer: 'on', options: ['in', 'on', 'under'], explanation: 'Дар рӯи → on.' },
      { type: 'choose', prompt: 'The cat is ___ the box.', promptTranslated: 'Гурба дар дохили қуттӣ аст.', answer: 'in', options: ['in', 'on', 'under'], explanation: 'Дар дохили → in.' },
    ],
  },
  {
    key: 'like', emoji: '❤️', title: 'Like / Don\'t like', titleTranslated: 'Like / Don\'t like (дӯст доштан)',
    explanation: 'Барои баёни табъ:\n\n- I **like** tea. — Ман чой дӯст медорам.\n- I **don\'t like** coffee. — Ман қаҳва дӯст намедорам.\n- He **doesn\'t like** milk. — Ӯ шир дӯст намедорад.',
    examples: [
      { sentence: 'I like apples.', translation: 'Ман себ дӯст медорам.', highlight: 'like' },
      { sentence: 'She doesn\'t like fish.', translation: 'Ӯ моҳӣ дӯст намедорад.', highlight: "doesn't like" },
    ],
    rules: [
      { pattern: 'I/You/We/They + don\'t like', note: 'Инкор бо don\'t.' },
      { pattern: 'He/She/It + doesn\'t like', note: 'Инкор бо doesn\'t.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'He ___ vegetables.', promptTranslated: 'Ӯ сабзавот дӯст намедорад.', answer: "doesn't like", options: ["don't like", "doesn't like"], explanation: 'Бо He → doesn\'t like.' },
      { type: 'choose', prompt: 'I ___ chocolate.', promptTranslated: 'Ман шоколад дӯст медорам.', answer: 'like', options: ['like', 'likes'], explanation: 'Бо I → like.' },
    ],
  },
  {
    key: 'question_words', emoji: '🔎', title: 'Question words', titleTranslated: 'Калимаҳои саволӣ (what, where…)',
    explanation: 'Калимаҳои асосии саволӣ:\n\n- **What** — чӣ\n- **Where** — куҷо\n- **Who** — кӣ\n- **When** — кай\n- **How** — чӣ хел',
    examples: [
      { sentence: 'What is your name?', translation: 'Номи ту чист?', highlight: 'What' },
      { sentence: 'Where do you live?', translation: 'Ту куҷо зиндагӣ мекунӣ?', highlight: 'Where' },
      { sentence: 'How are you?', translation: 'Ту чӣ хелӣ?', highlight: 'How' },
    ],
    rules: [
      { pattern: 'Калимаи саволӣ + савол', note: 'What/Where/Who… аввал меояд.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ is your name?', promptTranslated: 'Номи ту чист?', answer: 'What', options: ['What', 'Where', 'Who'], explanation: 'Барои ном → What.' },
      { type: 'choose', prompt: '___ do you live?', promptTranslated: 'Ту куҷо зиндагӣ мекунӣ?', answer: 'Where', options: ['What', 'Where', 'When'], explanation: 'Барои ҷой → Where.' },
    ],
  },
  {
    key: 'present_continuous', emoji: '⏳', title: 'Present Continuous', titleTranslated: 'Замони ҳозираи давомдор',
    explanation: 'Барои амале, ки ҳозир рӯй дода истодааст:\n\n- **am / is / are + феъл + ing**\n\nМисол: I **am reading**. — Ман ҳозир хонда истодаам.',
    examples: [
      { sentence: 'I am eating now.', translation: 'Ман ҳозир хӯрок хӯрда истодаам.', highlight: 'am eating' },
      { sentence: 'She is sleeping.', translation: 'Ӯ хоб карда истодааст.', highlight: 'is sleeping' },
    ],
    rules: [
      { pattern: 'am/is/are + феъл + ing', note: 'I am working, He is working.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'She is ___ a book.', promptTranslated: 'Ӯ китоб хонда истодааст.', answer: 'reading', options: ['read', 'reads', 'reading'], explanation: 'Давомдор → феъл + ing.' },
      { type: 'choose', prompt: 'They ___ playing.', promptTranslated: 'Онҳо бозӣ карда истодаанд.', answer: 'are', options: ['am', 'is', 'are'], explanation: 'Бо They → are.' },
    ],
  },
  {
    key: 'imperatives', emoji: '✋', title: 'Imperatives', titleTranslated: 'Феъли амрӣ (фармоиш)',
    explanation: 'Барои фармоиш ё дархост феъл бе ҷонишин меояд:\n\n- **Open** the door. — Дарро кушо.\n- **Don\'t** run. — Надав.',
    examples: [
      { sentence: 'Sit down, please.', translation: 'Лутфан нишинед.', highlight: 'Sit' },
      { sentence: 'Don\'t be late.', translation: 'Дер накун.', highlight: "Don't" },
    ],
    rules: [
      { pattern: 'Феъл (соф)', note: 'Тасдиқ: Close the window.' },
      { pattern: 'Don\'t + феъл', note: 'Инкор: Don\'t open it.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ the door, please.', promptTranslated: 'Лутфан дарро кушо.', answer: 'Open', options: ['Open', 'Opens', 'Opening'], explanation: 'Амрӣ → феъли соф.' },
      { type: 'choose', prompt: '___ smoke here.', promptTranslated: 'Дар ин ҷо тамоку накаш.', answer: "Don't", options: ["Don't", 'Not', 'No'], explanation: 'Инкори амрӣ → Don\'t.' },
    ],
  },
);

// ── PHRASE COLLECTIONS ───────────────────────────────────────────────────────
CONTENT.phrases.push(
  {
    key: 'greetings', category: 'greetings', emoji: '👋', title: 'Greetings', titleTranslated: 'Саломҳо',
    phrases: [
      { text: 'Hello!', translation: 'Салом!' },
      { text: 'Good morning!', translation: 'Субҳ ба хайр!' },
      { text: 'Good afternoon!', translation: 'Рӯз ба хайр!' },
      { text: 'Good evening!', translation: 'Шом ба хайр!' },
      { text: 'How are you?', translation: 'Шумо чӣ хелед?' },
      { text: 'I am fine, thank you.', translation: 'Ман нағз, ташаккур.' },
      { text: 'Goodbye!', translation: 'Хайр!' },
      { text: 'See you later!', translation: 'То боздид!' },
    ],
  },
  {
    key: 'introductions', category: 'introductions', emoji: '🤝', title: 'Introducing yourself', titleTranslated: 'Муаррифии худ',
    phrases: [
      { text: 'My name is Alex.', translation: 'Номи ман Алекс аст.' },
      { text: 'What is your name?', translation: 'Номи шумо чист?' },
      { text: 'Nice to meet you.', translation: 'Аз шиносоӣ хушҳолам.' },
      { text: 'I am from Tajikistan.', translation: 'Ман аз Тоҷикистон ҳастам.' },
      { text: 'Where are you from?', translation: 'Шумо аз куҷоед?' },
      { text: 'I am twenty years old.', translation: 'Ман бистсола ҳастам.' },
      { text: 'I am a student.', translation: 'Ман донишҷӯ ҳастам.' },
    ],
  },
  {
    key: 'classroom', category: 'classroom', emoji: '🏫', title: 'In the classroom', titleTranslated: 'Дар синф',
    phrases: [
      { text: 'Open your book.', translation: 'Китобатонро кушоед.' },
      { text: 'Listen, please.', translation: 'Лутфан гӯш кунед.' },
      { text: 'Repeat after me.', translation: 'Аз паси ман такрор кунед.' },
      { text: 'I don\'t understand.', translation: 'Ман намефаҳмам.' },
      { text: 'Can you repeat, please?', translation: 'Лутфан такрор карда метавонед?' },
      { text: 'How do you say this in English?', translation: 'Инро бо англисӣ чӣ хел мегӯянд?' },
    ],
  },
  {
    key: 'restaurant', category: 'food', emoji: '🍽️', title: 'At the restaurant', titleTranslated: 'Дар тарабхона',
    phrases: [
      { text: 'A table for two, please.', translation: 'Лутфан мизе барои ду нафар.' },
      { text: 'Can I see the menu?', translation: 'Менюро дида метавонам?' },
      { text: 'I would like a coffee.', translation: 'Ман қаҳва мехоҳам.' },
      { text: 'How much is it?', translation: 'Ин чанд пул аст?' },
      { text: 'The bill, please.', translation: 'Лутфан ҳисоб.' },
      { text: 'It is delicious!', translation: 'Ин болаззат аст!' },
    ],
  },
  {
    key: 'shopping', category: 'shopping', emoji: '🛍️', title: 'Shopping', titleTranslated: 'Харидорӣ',
    phrases: [
      { text: 'How much is this?', translation: 'Ин чанд пул аст?' },
      { text: 'It is too expensive.', translation: 'Ин хеле қимат аст.' },
      { text: 'Do you have a smaller size?', translation: 'Андозаи хурдтар доред?' },
      { text: 'I will take it.', translation: 'Ман инро мегирам.' },
      { text: 'Can I pay by card?', translation: 'Бо корт пардохт карда метавонам?' },
      { text: 'Here you are.', translation: 'Мана, бигиред.' },
    ],
  },
  {
    key: 'directions', category: 'travel', emoji: '🧭', title: 'Asking directions', titleTranslated: 'Пурсидани самт',
    phrases: [
      { text: 'Excuse me, where is the bank?', translation: 'Бубахшед, бонк дар куҷост?' },
      { text: 'Go straight.', translation: 'Рост равед.' },
      { text: 'Turn left.', translation: 'Ба чап гардед.' },
      { text: 'Turn right.', translation: 'Ба рост гардед.' },
      { text: 'It is near here.', translation: 'Ин дар наздикии ин ҷост.' },
      { text: 'Thank you for your help.', translation: 'Ташаккур барои кӯмакатон.' },
    ],
  },
);

// ── DIALOGUES ────────────────────────────────────────────────────────────────
CONTENT.dialogues.push(
  {
    key: 'meeting', emoji: '🤝', title: 'Meeting someone new', titleTranslated: 'Шиносоӣ бо шахси нав',
    scenario: 'Ду нафар бори аввал вомехӯранд ва худро муаррифӣ мекунанд.',
    lines: [
      { speaker: 'Anna', text: 'Hello! My name is Anna.', translation: 'Салом! Номи ман Анна аст.' },
      { speaker: 'You', text: 'Hi Anna! I am Karim.', translation: 'Салом Анна! Ман Карим ҳастам.', isUser: true },
      { speaker: 'Anna', text: 'Nice to meet you, Karim.', translation: 'Аз шиносоӣ хушҳолам, Карим.' },
      { speaker: 'You', text: 'Nice to meet you too. Where are you from?', translation: 'Ман ҳам хушҳолам. Шумо аз куҷоед?', isUser: true },
      { speaker: 'Anna', text: 'I am from London. And you?', translation: 'Ман аз Лондон ҳастам. Шумо чӣ?' },
      { speaker: 'You', text: 'I am from Dushanbe.', translation: 'Ман аз Душанбе ҳастам.', isUser: true },
    ],
  },
  {
    key: 'cafe', emoji: '☕', title: 'Ordering at a cafe', titleTranslated: 'Фармоиш дар қаҳвахона',
    scenario: 'Дар қаҳвахона мизоҷ аз пешхизмат фармоиш медиҳад.',
    lines: [
      { speaker: 'Waiter', text: 'Good morning! What would you like?', translation: 'Субҳ ба хайр! Чӣ мехоҳед?' },
      { speaker: 'You', text: 'I would like a tea, please.', translation: 'Лутфан як чой мехоҳам.', isUser: true },
      { speaker: 'Waiter', text: 'Anything else?', translation: 'Боз чизе?' },
      { speaker: 'You', text: 'Yes, a piece of cake.', translation: 'Ҳа, як порча торт.', isUser: true },
      { speaker: 'Waiter', text: 'That is five dollars.', translation: 'Ин панҷ доллар мешавад.' },
      { speaker: 'You', text: 'Here you are. Thank you.', translation: 'Мана, бигиред. Ташаккур.', isUser: true },
    ],
  },
  {
    key: 'family', emoji: '👨‍👩‍👧', title: 'Talking about family', titleTranslated: 'Сӯҳбат дар бораи оила',
    scenario: 'Дӯстон дар бораи аъзои оилаи худ сӯҳбат мекунанд.',
    lines: [
      { speaker: 'Sara', text: 'Do you have any brothers or sisters?', translation: 'Ту бародар ё хоҳар дорӣ?' },
      { speaker: 'You', text: 'Yes, I have one brother.', translation: 'Ҳа, ман як бародар дорам.', isUser: true },
      { speaker: 'Sara', text: 'How old is he?', translation: 'Ӯ чандсола аст?' },
      { speaker: 'You', text: 'He is ten years old.', translation: 'Ӯ даҳсола аст.', isUser: true },
      { speaker: 'Sara', text: 'Nice! I have two sisters.', translation: 'Хуб! Ман ду хоҳар дорам.' },
    ],
  },
  {
    key: 'shopping_dlg', emoji: '🛍️', title: 'At the shop', titleTranslated: 'Дар мағоза',
    scenario: 'Харидор дар мағоза нарх мепурсад ва харид мекунад.',
    lines: [
      { speaker: 'Seller', text: 'Can I help you?', translation: 'Метавонам кӯмак кунам?' },
      { speaker: 'You', text: 'Yes. How much is this shirt?', translation: 'Ҳа. Ин ҷома чанд пул аст?', isUser: true },
      { speaker: 'Seller', text: 'It is fifteen dollars.', translation: 'Ин понздаҳ доллар аст.' },
      { speaker: 'You', text: 'Okay, I will take it.', translation: 'Хуб, ман инро мегирам.', isUser: true },
      { speaker: 'Seller', text: 'Thank you. Have a nice day!', translation: 'Ташаккур. Рӯзи хуш!' },
    ],
  },
  {
    key: 'directions_dlg', emoji: '🗺️', title: 'Finding the station', titleTranslated: 'Ёфтани истгоҳ',
    scenario: 'Сайёҳ роҳи истгоҳро мепурсад.',
    lines: [
      { speaker: 'Tourist', text: 'Excuse me, where is the station?', translation: 'Бубахшед, истгоҳ дар куҷост?' },
      { speaker: 'You', text: 'Go straight and turn left.', translation: 'Рост равед ва ба чап гардед.', isUser: true },
      { speaker: 'Tourist', text: 'Is it far?', translation: 'Дур аст?' },
      { speaker: 'You', text: 'No, it is near.', translation: 'Не, наздик аст.', isUser: true },
      { speaker: 'Tourist', text: 'Thank you very much!', translation: 'Ташаккури зиёд!' },
    ],
  },
);

// ── READING COMPREHENSION ────────────────────────────────────────────────────
CONTENT.comprehensions.push(
  {
    key: 'about_me', emoji: '🙋', kind: 'reading', title: 'About me', titleTranslated: 'Дар бораи ман',
    passage: 'Hello! My name is Omar. I am nineteen years old. I am from Khujand. I am a student. I like music and football. I have a small family.',
    passageTranslated: 'Салом! Номи ман Умар аст. Ман нуздаҳсола ҳастам. Ман аз Хуҷанд ҳастам. Ман донишҷӯ ҳастам. Ман мусиқӣ ва футболро дӯст медорам. Ман оилаи хурд дорам.',
    questions: [
      { question: 'What is his name?', questionTranslated: 'Номи ӯ чист?', options: ['Omar', 'Ali', 'Sara', 'Karim'], correctIndex: 0, explanation: 'Дар матн: «My name is Omar».' },
      { question: 'How old is he?', questionTranslated: 'Ӯ чандсола аст?', options: ['Eighteen', 'Nineteen', 'Twenty', 'Ten'], correctIndex: 1, explanation: '«I am nineteen years old».' },
      { question: 'Where is he from?', questionTranslated: 'Ӯ аз куҷост?', options: ['Dushanbe', 'London', 'Khujand', 'Moscow'], correctIndex: 2, explanation: '«I am from Khujand».' },
    ],
  },
  {
    key: 'my_family', emoji: '👪', kind: 'reading', title: 'My family', titleTranslated: 'Оилаи ман',
    passage: 'This is my family. My father is a doctor. My mother is a teacher. I have one sister. Her name is Lola. She is twelve. We live in a big house.',
    passageTranslated: 'Ин оилаи ман аст. Падари ман духтур аст. Модари ман муаллима аст. Ман як хоҳар дорам. Номи ӯ Лола аст. Ӯ дувоздаҳсола аст. Мо дар хонаи калон зиндагӣ мекунем.',
    questions: [
      { question: 'What is the father\'s job?', questionTranslated: 'Касби падар чист?', options: ['Teacher', 'Doctor', 'Driver', 'Engineer'], correctIndex: 1, explanation: '«My father is a doctor».' },
      { question: 'What is the sister\'s name?', questionTranslated: 'Номи хоҳар чист?', options: ['Sara', 'Lola', 'Anna', 'Maryam'], correctIndex: 1, explanation: '«Her name is Lola».' },
      { question: 'How old is the sister?', questionTranslated: 'Хоҳар чандсола аст?', options: ['Ten', 'Eleven', 'Twelve', 'Thirteen'], correctIndex: 2, explanation: '«She is twelve».' },
    ],
  },
  {
    key: 'my_day', emoji: '🌅', kind: 'reading', title: 'My day', titleTranslated: 'Рӯзи ман',
    passage: 'I get up at seven o\'clock. I have breakfast and go to school. I study English and maths. In the evening I do my homework. I go to bed at ten.',
    passageTranslated: 'Ман соати ҳафт бедор мешавам. Ноништа мекунам ва ба мактаб меравам. Ман англисӣ ва математикаро меомӯзам. Бегоҳӣ вазифаи хонагиро иҷро мекунам. Соати даҳ хоб меравам.',
    questions: [
      { question: 'When does he get up?', questionTranslated: 'Ӯ кай бедор мешавад?', options: ['At six', 'At seven', 'At eight', 'At ten'], correctIndex: 1, explanation: '«I get up at seven».' },
      { question: 'What does he study?', questionTranslated: 'Ӯ чиро меомӯзад?', options: ['Music', 'English and maths', 'Sport', 'Art'], correctIndex: 1, explanation: '«I study English and maths».' },
    ],
  },
  {
    key: 'my_city', emoji: '🏙️', kind: 'reading', title: 'My city', titleTranslated: 'Шаҳри ман',
    passage: 'I live in Dushanbe. It is the capital of Tajikistan. There are many parks and shops. The city is beautiful. I like my city very much.',
    passageTranslated: 'Ман дар Душанбе зиндагӣ мекунам. Ин пойтахти Тоҷикистон аст. Дар ин ҷо боғҳо ва мағозаҳои зиёд ҳастанд. Шаҳр зебо аст. Ман шаҳри худро хеле дӯст медорам.',
    questions: [
      { question: 'Where does he live?', questionTranslated: 'Ӯ дар куҷо зиндагӣ мекунад?', options: ['Khujand', 'Dushanbe', 'Bokhtar', 'Kulob'], correctIndex: 1, explanation: '«I live in Dushanbe».' },
      { question: 'What is in the city?', questionTranslated: 'Дар шаҳр чӣ ҳаст?', options: ['Mountains', 'Parks and shops', 'A sea', 'A desert'], correctIndex: 1, explanation: '«There are many parks and shops».' },
    ],
  },
);

// ── MODULES & LESSONS ────────────────────────────────────────────────────────
CONTENT.modules.push(
  {
    title: 'Alphabet & Sounds', titleTranslated: 'Алифбо ва садоҳо', emoji: '🔤', color: '#14B8A6',
    lessons: [
      {
        skillType: 'vocab', title: 'Alphabet A–F', titleTranslated: 'Алифбо A–F', emoji: '🔠',
        words: [
          { word: 'A', translation: 'ҳарфи A', ipa: '/eɪ/', example: 'Apple', exampleTrans: 'Себ', emoji: '🍎' },
          { word: 'B', translation: 'ҳарфи B', ipa: '/biː/', example: 'Ball', exampleTrans: 'Тӯб', emoji: '⚽' },
          { word: 'C', translation: 'ҳарфи C', ipa: '/siː/', example: 'Cat', exampleTrans: 'Гурба', emoji: '🐱' },
          { word: 'D', translation: 'ҳарфи D', ipa: '/diː/', example: 'Dog', exampleTrans: 'Саг', emoji: '🐶' },
          { word: 'E', translation: 'ҳарфи E', ipa: '/iː/', example: 'Egg', exampleTrans: 'Тухм', emoji: '🥚' },
          { word: 'F', translation: 'ҳарфи F', ipa: '/ɛf/', example: 'Fish', exampleTrans: 'Моҳӣ', emoji: '🐟' },
        ],
      },
      {
        skillType: 'vocab', title: 'Alphabet G–M', titleTranslated: 'Алифбо G–M', emoji: '🔤',
        words: [
          { word: 'G', translation: 'ҳарфи G', ipa: '/dʒiː/', example: 'Girl', exampleTrans: 'Духтар', emoji: '👧' },
          { word: 'H', translation: 'ҳарфи H', ipa: '/eɪtʃ/', example: 'House', exampleTrans: 'Хона', emoji: '🏠' },
          { word: 'I', translation: 'ҳарфи I', ipa: '/aɪ/', example: 'Ice', exampleTrans: 'Ях', emoji: '🧊' },
          { word: 'J', translation: 'ҳарфи J', ipa: '/dʒeɪ/', example: 'Juice', exampleTrans: 'Шарбат', emoji: '🧃' },
          { word: 'K', translation: 'ҳарфи K', ipa: '/keɪ/', example: 'Key', exampleTrans: 'Калид', emoji: '🔑' },
          { word: 'L', translation: 'ҳарфи L', ipa: '/ɛl/', example: 'Lion', exampleTrans: 'Шер', emoji: '🦁' },
          { word: 'M', translation: 'ҳарфи M', ipa: '/ɛm/', example: 'Moon', exampleTrans: 'Моҳ', emoji: '🌙' },
        ],
      },
      {
        skillType: 'vocab', title: 'Alphabet N–S', titleTranslated: 'Алифбо N–S', emoji: '🔡',
        words: [
          { word: 'N', translation: 'ҳарфи N', ipa: '/ɛn/', example: 'Name', exampleTrans: 'Ном', emoji: '📛' },
          { word: 'O', translation: 'ҳарфи O', ipa: '/oʊ/', example: 'Orange', exampleTrans: 'Афлесун', emoji: '🍊' },
          { word: 'P', translation: 'ҳарфи P', ipa: '/piː/', example: 'Pen', exampleTrans: 'Қалам', emoji: '🖊️' },
          { word: 'Q', translation: 'ҳарфи Q', ipa: '/kjuː/', example: 'Queen', exampleTrans: 'Малика', emoji: '👑' },
          { word: 'R', translation: 'ҳарфи R', ipa: '/ɑːr/', example: 'Rain', exampleTrans: 'Борон', emoji: '🌧️' },
          { word: 'S', translation: 'ҳарфи S', ipa: '/ɛs/', example: 'Sun', exampleTrans: 'Офтоб', emoji: '☀️' },
        ],
      },
      {
        skillType: 'vocab', title: 'Alphabet T–Z', titleTranslated: 'Алифбо T–Z', emoji: '🆎',
        words: [
          { word: 'T', translation: 'ҳарфи T', ipa: '/tiː/', example: 'Tree', exampleTrans: 'Дарахт', emoji: '🌳' },
          { word: 'U', translation: 'ҳарфи U', ipa: '/juː/', example: 'Umbrella', exampleTrans: 'Чатр', emoji: '☂️' },
          { word: 'V', translation: 'ҳарфи V', ipa: '/viː/', example: 'Van', exampleTrans: 'Микроавтобус', emoji: '🚐' },
          { word: 'W', translation: 'ҳарфи W', ipa: '/ˈdʌbəljuː/', example: 'Water', exampleTrans: 'Об', emoji: '💧' },
          { word: 'X', translation: 'ҳарфи X', ipa: '/ɛks/', example: 'Box', exampleTrans: 'Қуттӣ', emoji: '📦' },
          { word: 'Y', translation: 'ҳарфи Y', ipa: '/waɪ/', example: 'Yellow', exampleTrans: 'Зард', emoji: '💛' },
          { word: 'Z', translation: 'ҳарфи Z', ipa: '/zɛd/', example: 'Zoo', exampleTrans: 'Боғи ҳайвонот', emoji: '🦓' },
        ],
      },
      {
        skillType: 'vocab', title: 'First words', titleTranslated: 'Калимаҳои аввал', emoji: '✨',
        words: [
          { word: 'Yes', translation: 'Ҳа', ipa: '/jɛs/' },
          { word: 'No', translation: 'Не', ipa: '/noʊ/' },
          { word: 'Please', translation: 'Лутфан', ipa: '/pliːz/' },
          { word: 'Thank you', translation: 'Ташаккур', ipa: '/ˈθæŋk juː/' },
          { word: 'Sorry', translation: 'Бубахшед', ipa: '/ˈsɒri/' },
          { word: 'Good', translation: 'Хуб', ipa: '/ɡʊd/' },
        ],
      },
    ],
  },
  {
    title: 'Greetings & Introductions', titleTranslated: 'Саломҳо ва шиносоӣ', emoji: '👋', color: '#A78BFA',
    lessons: [
      { skillType: 'vocab', phraseKey: 'greetings', title: 'Greetings', titleTranslated: 'Саломҳо', emoji: '👋' },
      { skillType: 'grammar', grammarKey: 'pronouns', title: 'Subject pronouns', titleTranslated: 'Ҷонишинҳои шахсӣ', emoji: '👤' },
      { skillType: 'grammar', grammarKey: 'be', title: 'Verb to be', titleTranslated: 'Феъли to be', emoji: '🟰' },
      { skillType: 'vocab', dialogueKey: 'meeting', title: 'Meeting someone', titleTranslated: 'Шиносоӣ', emoji: '🤝' },
      { skillType: 'vocab', phraseKey: 'introductions', title: 'Introducing yourself', titleTranslated: 'Муаррифии худ', emoji: '🙋' },
      { skillType: 'reading', comprehensionKey: 'about_me', title: 'Reading: About me', titleTranslated: 'Хониш: Дар бораи ман', emoji: '📖' },
      {
        skillType: 'speaking', title: 'Speak: Greetings', titleTranslated: 'Гуфтор: Саломҳо', emoji: '🎤',
        words: [
          { word: 'Hello', translation: 'Салом', ipa: '/həˈloʊ/' },
          { word: 'Good morning', translation: 'Субҳ ба хайр' },
          { word: 'How are you', translation: 'Шумо чӣ хелед' },
          { word: 'Nice to meet you', translation: 'Аз шиносоӣ хушҳолам' },
          { word: 'Goodbye', translation: 'Хайр', ipa: '/ɡʊdˈbaɪ/' },
        ],
      },
    ],
  },
  {
    title: 'Numbers, Time & Dates', titleTranslated: 'Рақамҳо, вақт ва сана', emoji: '🔢', color: '#FB923C',
    lessons: [
      {
        skillType: 'vocab', title: 'Numbers 1–10', titleTranslated: 'Рақамҳо 1–10', emoji: '🔟',
        words: [
          { word: 'One', translation: 'Як', ipa: '/wʌn/' },
          { word: 'Two', translation: 'Ду', ipa: '/tuː/' },
          { word: 'Three', translation: 'Се', ipa: '/θriː/' },
          { word: 'Four', translation: 'Чор', ipa: '/fɔːr/' },
          { word: 'Five', translation: 'Панҷ', ipa: '/faɪv/' },
          { word: 'Six', translation: 'Шаш', ipa: '/sɪks/' },
          { word: 'Seven', translation: 'Ҳафт', ipa: '/ˈsɛvən/' },
          { word: 'Eight', translation: 'Ҳашт', ipa: '/eɪt/' },
          { word: 'Nine', translation: 'Нӯҳ', ipa: '/naɪn/' },
          { word: 'Ten', translation: 'Даҳ', ipa: '/tɛn/' },
        ],
      },
      {
        skillType: 'vocab', title: 'Numbers 11–20 & tens', titleTranslated: 'Рақамҳо 11–20 ва даҳҳо', emoji: '💯',
        words: [
          { word: 'Eleven', translation: 'Ёздаҳ' },
          { word: 'Twelve', translation: 'Дувоздаҳ' },
          { word: 'Thirteen', translation: 'Сездаҳ' },
          { word: 'Fifteen', translation: 'Понздаҳ' },
          { word: 'Twenty', translation: 'Бист' },
          { word: 'Thirty', translation: 'Сӣ' },
          { word: 'Forty', translation: 'Чил' },
          { word: 'Fifty', translation: 'Панҷоҳ' },
          { word: 'Hundred', translation: 'Сад' },
        ],
      },
      {
        skillType: 'vocab', title: 'Days of the week', titleTranslated: 'Рӯзҳои ҳафта', emoji: '📅',
        words: [
          { word: 'Monday', translation: 'Душанбе' },
          { word: 'Tuesday', translation: 'Сешанбе' },
          { word: 'Wednesday', translation: 'Чоршанбе' },
          { word: 'Thursday', translation: 'Панҷшанбе' },
          { word: 'Friday', translation: 'Ҷумъа' },
          { word: 'Saturday', translation: 'Шанбе' },
          { word: 'Sunday', translation: 'Якшанбе' },
          { word: 'Today', translation: 'Имрӯз' },
          { word: 'Tomorrow', translation: 'Фардо' },
        ],
      },
      {
        skillType: 'vocab', title: 'Months', titleTranslated: 'Моҳҳо', emoji: '🗓️',
        words: [
          { word: 'January', translation: 'Январ' },
          { word: 'February', translation: 'Феврал' },
          { word: 'March', translation: 'Март' },
          { word: 'April', translation: 'Апрел' },
          { word: 'May', translation: 'Май' },
          { word: 'June', translation: 'Июн' },
          { word: 'July', translation: 'Июл' },
          { word: 'August', translation: 'Август' },
          { word: 'September', translation: 'Сентябр' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'question_words', title: 'Question words', titleTranslated: 'Калимаҳои саволӣ', emoji: '🔎' },
      { skillType: 'reading', comprehensionKey: 'my_day', title: 'Reading: My day', titleTranslated: 'Хониш: Рӯзи ман', emoji: '📖' },
    ],
  },
  {
    title: 'Me & Family', titleTranslated: 'Ман ва оила', emoji: '👪', color: '#F472B6',
    lessons: [
      {
        skillType: 'vocab', title: 'Family members', titleTranslated: 'Аъзои оила', emoji: '👨‍👩‍👧‍👦',
        words: [
          { word: 'Mother', translation: 'Модар', ipa: '/ˈmʌðər/', emoji: '👩' },
          { word: 'Father', translation: 'Падар', ipa: '/ˈfɑːðər/', emoji: '👨' },
          { word: 'Brother', translation: 'Бародар', emoji: '👦' },
          { word: 'Sister', translation: 'Хоҳар', emoji: '👧' },
          { word: 'Son', translation: 'Писар' },
          { word: 'Daughter', translation: 'Духтар' },
          { word: 'Grandmother', translation: 'Бибӣ', emoji: '👵' },
          { word: 'Grandfather', translation: 'Бобо', emoji: '👴' },
          { word: 'Family', translation: 'Оила', emoji: '👪' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'possessive', title: 'My, your, his, her', titleTranslated: 'Сифатҳои соҳибӣ', emoji: '🔑' },
      { skillType: 'grammar', grammarKey: 'have_got', title: 'Have / Has got', titleTranslated: 'Доштан', emoji: '🤲' },
      { skillType: 'vocab', dialogueKey: 'family', title: 'Talking about family', titleTranslated: 'Сӯҳбат дар бораи оила', emoji: '🗣️' },
      { skillType: 'reading', comprehensionKey: 'my_family', title: 'Reading: My family', titleTranslated: 'Хониш: Оилаи ман', emoji: '📖' },
      {
        skillType: 'speaking', title: 'Speak: Family', titleTranslated: 'Гуфтор: Оила', emoji: '🎤',
        words: [
          { word: 'My mother', translation: 'Модари ман' },
          { word: 'My father', translation: 'Падари ман' },
          { word: 'I have a brother', translation: 'Ман бародар дорам' },
          { word: 'I have a sister', translation: 'Ман хоҳар дорам' },
        ],
      },
    ],
  },
  {
    title: 'Colors, Objects & Classroom', titleTranslated: 'Ранг, ашё ва синф', emoji: '🎨', color: '#60A5FA',
    lessons: [
      {
        skillType: 'vocab', title: 'Colors', titleTranslated: 'Рангҳо', emoji: '🌈',
        words: [
          { word: 'Red', translation: 'Сурх', emoji: '🔴' },
          { word: 'Blue', translation: 'Кабуд', emoji: '🔵' },
          { word: 'Green', translation: 'Сабз', emoji: '🟢' },
          { word: 'Yellow', translation: 'Зард', emoji: '🟡' },
          { word: 'Black', translation: 'Сиёҳ', emoji: '⚫' },
          { word: 'White', translation: 'Сафед', emoji: '⚪' },
          { word: 'Orange', translation: 'Норинҷӣ', emoji: '🟠' },
          { word: 'Brown', translation: 'Қаҳваранг', emoji: '🟤' },
        ],
      },
      {
        skillType: 'vocab', title: 'Classroom objects', titleTranslated: 'Ашёи синф', emoji: '🏫',
        words: [
          { word: 'Book', translation: 'Китоб', emoji: '📕' },
          { word: 'Pen', translation: 'Қалам', emoji: '🖊️' },
          { word: 'Pencil', translation: 'Қалами оддӣ', emoji: '✏️' },
          { word: 'Desk', translation: 'Парта', emoji: '🪑' },
          { word: 'Chair', translation: 'Курсӣ', emoji: '🪑' },
          { word: 'Bag', translation: 'Халта', emoji: '🎒' },
          { word: 'Board', translation: 'Тахта' },
          { word: 'Teacher', translation: 'Муаллим', emoji: '🧑‍🏫' },
          { word: 'Student', translation: 'Донишҷӯ', emoji: '🧑‍🎓' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'a_an', title: 'Articles a / an', titleTranslated: 'Артиклҳои a / an', emoji: '🅰️' },
      { skillType: 'grammar', grammarKey: 'this_that', title: 'This / That', titleTranslated: 'This / That', emoji: '👉' },
      { skillType: 'grammar', grammarKey: 'plural', title: 'Plural nouns', titleTranslated: 'Ҷамъи исмҳо', emoji: '➕' },
      { skillType: 'vocab', phraseKey: 'classroom', title: 'In the classroom', titleTranslated: 'Дар синф', emoji: '🗨️' },
    ],
  },
);

CONTENT.modules.push(
  {
    title: 'Food & Drink', titleTranslated: 'Хӯрок ва нӯшокӣ', emoji: '🍎', color: '#34D399',
    lessons: [
      {
        skillType: 'vocab', title: 'Food', titleTranslated: 'Хӯрок', emoji: '🍲',
        words: [
          { word: 'Bread', translation: 'Нон', emoji: '🍞' },
          { word: 'Rice', translation: 'Биринҷ', emoji: '🍚' },
          { word: 'Meat', translation: 'Гӯшт', emoji: '🥩' },
          { word: 'Egg', translation: 'Тухм', emoji: '🥚' },
          { word: 'Soup', translation: 'Шӯрбо', emoji: '🍜' },
          { word: 'Cheese', translation: 'Панир', emoji: '🧀' },
          { word: 'Sugar', translation: 'Шакар' },
          { word: 'Salt', translation: 'Намак', emoji: '🧂' },
        ],
      },
      {
        skillType: 'vocab', title: 'Fruits & drinks', titleTranslated: 'Меваҳо ва нӯшокиҳо', emoji: '🍇',
        words: [
          { word: 'Apple', translation: 'Себ', emoji: '🍎' },
          { word: 'Banana', translation: 'Банан', emoji: '🍌' },
          { word: 'Grape', translation: 'Ангур', emoji: '🍇' },
          { word: 'Melon', translation: 'Харбуза', emoji: '🍈' },
          { word: 'Water', translation: 'Об', emoji: '💧' },
          { word: 'Tea', translation: 'Чой', emoji: '🍵' },
          { word: 'Coffee', translation: 'Қаҳва', emoji: '☕' },
          { word: 'Milk', translation: 'Шир', emoji: '🥛' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'like', title: 'Like / Don\'t like', titleTranslated: 'Дӯст доштан', emoji: '❤️' },
      { skillType: 'vocab', dialogueKey: 'cafe', title: 'Ordering at a cafe', titleTranslated: 'Фармоиш дар қаҳвахона', emoji: '☕' },
      { skillType: 'vocab', phraseKey: 'restaurant', title: 'At the restaurant', titleTranslated: 'Дар тарабхона', emoji: '🍽️' },
      {
        skillType: 'speaking', title: 'Speak: Food', titleTranslated: 'Гуфтор: Хӯрок', emoji: '🎤',
        words: [
          { word: 'I like tea', translation: 'Ман чой дӯст медорам' },
          { word: 'I want bread', translation: 'Ман нон мехоҳам' },
          { word: 'It is delicious', translation: 'Ин болаззат аст' },
          { word: 'How much is it', translation: 'Ин чанд пул аст' },
        ],
      },
    ],
  },
  {
    title: 'My Day', titleTranslated: 'Рӯзи ман', emoji: '🌅', color: '#FBBF24',
    lessons: [
      {
        skillType: 'vocab', title: 'Daily verbs', titleTranslated: 'Феълҳои ҳаррӯза', emoji: '🏃',
        words: [
          { word: 'Wake up', translation: 'Бедор шудан' },
          { word: 'Eat', translation: 'Хӯрдан', emoji: '🍽️' },
          { word: 'Drink', translation: 'Нӯшидан', emoji: '🥤' },
          { word: 'Go', translation: 'Рафтан' },
          { word: 'Work', translation: 'Кор кардан', emoji: '💼' },
          { word: 'Study', translation: 'Омӯхтан', emoji: '📚' },
          { word: 'Play', translation: 'Бозӣ кардан', emoji: '🎮' },
          { word: 'Sleep', translation: 'Хобидан', emoji: '😴' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'present_simple', title: 'Present Simple', titleTranslated: 'Замони ҳозираи содда', emoji: '🔁' },
      { skillType: 'grammar', grammarKey: 'present_simple_q', title: 'Questions with do/does', titleTranslated: 'Саволҳо бо do/does', emoji: '❓' },
      {
        skillType: 'vocab', title: 'Time of day', titleTranslated: 'Вақти рӯз', emoji: '🕐',
        words: [
          { word: 'Morning', translation: 'Субҳ', emoji: '🌅' },
          { word: 'Afternoon', translation: 'Нимрӯзӣ', emoji: '🌤️' },
          { word: 'Evening', translation: 'Бегоҳ', emoji: '🌆' },
          { word: 'Night', translation: 'Шаб', emoji: '🌙' },
          { word: 'Hour', translation: 'Соат' },
          { word: 'Minute', translation: 'Дақиқа' },
          { word: 'Early', translation: 'Барвақт' },
          { word: 'Late', translation: 'Дер' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: My routine', titleTranslated: 'Гуфтор: Рӯзи ман', emoji: '🎤',
        words: [
          { word: 'I get up early', translation: 'Ман барвақт бедор мешавам' },
          { word: 'I go to school', translation: 'Ман ба мактаб меравам' },
          { word: 'I study English', translation: 'Ман англисӣ меомӯзам' },
          { word: 'I go to bed', translation: 'Ман хоб меравам' },
        ],
      },
    ],
  },
  {
    title: 'Places & Directions', titleTranslated: 'Ҷойҳо ва самтҳо', emoji: '🧭', color: '#22D3EE',
    lessons: [
      {
        skillType: 'vocab', title: 'Places in town', titleTranslated: 'Ҷойҳо дар шаҳр', emoji: '🏙️',
        words: [
          { word: 'School', translation: 'Мактаб', emoji: '🏫' },
          { word: 'Hospital', translation: 'Беморхона', emoji: '🏥' },
          { word: 'Shop', translation: 'Мағоза', emoji: '🏬' },
          { word: 'Bank', translation: 'Бонк', emoji: '🏦' },
          { word: 'Park', translation: 'Боғ', emoji: '🌳' },
          { word: 'Market', translation: 'Бозор', emoji: '🛒' },
          { word: 'Station', translation: 'Истгоҳ', emoji: '🚉' },
          { word: 'Street', translation: 'Кӯча', emoji: '🛣️' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'there_is_are', title: 'There is / are', titleTranslated: 'There is / are', emoji: '📍' },
      { skillType: 'grammar', grammarKey: 'prepositions', title: 'Prepositions of place', titleTranslated: 'Пешояндҳои ҷой', emoji: '🧭' },
      { skillType: 'vocab', phraseKey: 'directions', title: 'Asking directions', titleTranslated: 'Пурсидани самт', emoji: '🗺️' },
      { skillType: 'vocab', dialogueKey: 'directions_dlg', title: 'Finding the station', titleTranslated: 'Ёфтани истгоҳ', emoji: '🚉' },
      { skillType: 'reading', comprehensionKey: 'my_city', title: 'Reading: My city', titleTranslated: 'Хониш: Шаҳри ман', emoji: '📖' },
    ],
  },
  {
    title: 'Ability & Now', titleTranslated: 'Қобилият ва ҳозира', emoji: '💪', color: '#A3E635',
    lessons: [
      {
        skillType: 'vocab', title: 'Hobbies & actions', titleTranslated: 'Машғулиятҳо ва амалҳо', emoji: '🎯',
        words: [
          { word: 'Swim', translation: 'Шино кардан', emoji: '🏊' },
          { word: 'Sing', translation: 'Сурудан', emoji: '🎤' },
          { word: 'Dance', translation: 'Рақсидан', emoji: '💃' },
          { word: 'Run', translation: 'Давидан', emoji: '🏃' },
          { word: 'Read', translation: 'Хондан', emoji: '📖' },
          { word: 'Write', translation: 'Навиштан', emoji: '✍️' },
          { word: 'Cook', translation: 'Хӯрок пухтан', emoji: '🍳' },
          { word: 'Drive', translation: 'Ронандагӣ кардан', emoji: '🚗' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'can', title: 'Can (ability)', titleTranslated: 'Can (тавоноӣ)', emoji: '💪' },
      { skillType: 'grammar', grammarKey: 'present_continuous', title: 'Present Continuous', titleTranslated: 'Замони ҳозираи давомдор', emoji: '⏳' },
      {
        skillType: 'vocab', title: 'Common adjectives', titleTranslated: 'Сифатҳои маъмул', emoji: '🔠',
        words: [
          { word: 'Big', translation: 'Калон' },
          { word: 'Small', translation: 'Хурд' },
          { word: 'Hot', translation: 'Гарм', emoji: '🔥' },
          { word: 'Cold', translation: 'Хунук', emoji: '❄️' },
          { word: 'New', translation: 'Нав' },
          { word: 'Old', translation: 'Кӯҳна' },
          { word: 'Happy', translation: 'Хушҳол', emoji: '😊' },
          { word: 'Sad', translation: 'Ғамгин', emoji: '😢' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: I can…', titleTranslated: 'Гуфтор: Ман метавонам…', emoji: '🎤',
        words: [
          { word: 'I can swim', translation: 'Ман шино карда метавонам' },
          { word: 'I can cook', translation: 'Ман хӯрок пухта метавонам' },
          { word: 'I cannot drive', translation: 'Ман ронандагӣ карда наметавонам' },
          { word: 'Can you sing', translation: 'Ту суруда метавонӣ' },
        ],
      },
    ],
  },
  {
    title: 'Writing & Listening', titleTranslated: 'Навиштан ва шунавоӣ', emoji: '✍️', color: '#F59E0B',
    lessons: [
      {
        skillType: 'listening', title: 'Listen: First words', titleTranslated: 'Шунавоӣ: Калимаҳои аввал', emoji: '🎧',
        words: [
          { word: 'Cat', translation: 'Гурба', emoji: '🐱' },
          { word: 'Dog', translation: 'Саг', emoji: '🐶' },
          { word: 'Sun', translation: 'Офтоб', emoji: '☀️' },
          { word: 'Water', translation: 'Об', emoji: '💧' },
          { word: 'Book', translation: 'Китоб', emoji: '📕' },
        ],
      },
      {
        skillType: 'listening', title: 'Listen: Greetings', titleTranslated: 'Шунавоӣ: Саломҳо', emoji: '🎧',
        words: [
          { word: 'Hello', translation: 'Салом' },
          { word: 'Good morning', translation: 'Субҳ ба хайр' },
          { word: 'Thank you', translation: 'Ташаккур' },
          { word: 'Goodbye', translation: 'Хайр' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: First words', titleTranslated: 'Навиштан: Калимаҳои аввал', emoji: '✍️',
        words: [
          { word: 'Cat', translation: 'Гурба', emoji: '🐱' },
          { word: 'Dog', translation: 'Саг', emoji: '🐶' },
          { word: 'Sun', translation: 'Офтоб', emoji: '☀️' },
          { word: 'Book', translation: 'Китоб', emoji: '📕' },
          { word: 'Water', translation: 'Об', emoji: '💧' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Greetings', titleTranslated: 'Навиштан: Саломҳо', emoji: '✍️',
        words: [
          { word: 'Hello', translation: 'Салом' },
          { word: 'Thank you', translation: 'Ташаккур' },
          { word: 'Yes', translation: 'Ҳа' },
          { word: 'No', translation: 'Не' },
          { word: 'Good', translation: 'Хуб' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Family', titleTranslated: 'Навиштан: Оила', emoji: '✍️',
        words: [
          { word: 'Mother', translation: 'Модар' },
          { word: 'Father', translation: 'Падар' },
          { word: 'Sister', translation: 'Хоҳар' },
          { word: 'Brother', translation: 'Бародар' },
          { word: 'Family', translation: 'Оила' },
        ],
      },
    ],
  },
  {
    title: 'Shopping & Review', titleTranslated: 'Харидорӣ ва такрор', emoji: '🛍️', color: '#F87171',
    lessons: [
      {
        skillType: 'vocab', title: 'Shopping & money', titleTranslated: 'Харидорӣ ва пул', emoji: '💰',
        words: [
          { word: 'Money', translation: 'Пул', emoji: '💵' },
          { word: 'Price', translation: 'Нарх' },
          { word: 'Cheap', translation: 'Арзон' },
          { word: 'Expensive', translation: 'Қимат' },
          { word: 'Buy', translation: 'Харидан' },
          { word: 'Sell', translation: 'Фурӯхтан' },
          { word: 'Shirt', translation: 'Ҷома', emoji: '👕' },
          { word: 'Shoes', translation: 'Пойафзол', emoji: '👟' },
        ],
      },
      { skillType: 'vocab', phraseKey: 'shopping', title: 'Shopping phrases', titleTranslated: 'Ибораҳои харидорӣ', emoji: '🛍️' },
      { skillType: 'vocab', dialogueKey: 'shopping_dlg', title: 'At the shop', titleTranslated: 'Дар мағоза', emoji: '🏬' },
      { skillType: 'grammar', grammarKey: 'imperatives', title: 'Imperatives', titleTranslated: 'Феъли амрӣ', emoji: '✋' },
      {
        skillType: 'review', type: 'quiz', title: 'A1 Review', titleTranslated: 'Такрори A1', emoji: '🏆', xpReward: 100,
        words: [
          { word: 'Hello', translation: 'Салом' },
          { word: 'Family', translation: 'Оила' },
          { word: 'Water', translation: 'Об' },
          { word: 'Friend', translation: 'Дӯст' },
          { word: 'School', translation: 'Мактаб' },
          { word: 'Money', translation: 'Пул' },
          { word: 'Big', translation: 'Калон' },
          { word: 'Happy', translation: 'Хушҳол' },
          { word: 'Today', translation: 'Имрӯз' },
          { word: 'Thank you', translation: 'Ташаккур' },
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

