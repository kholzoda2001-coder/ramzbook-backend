/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Full A1 Russian-for-Tajik course seeder.
// Wipes ONLY the (Russian target, Tajik native, level A1) course content and
// rebuilds it from scratch: modules → lessons → words, plus grammar topics,
// phrase collections, dialogues and reading comprehensions. Other courses,
// languages and users are never touched.
//
// Run (from backend dir, with env loaded):
//   node scripts/seed_a1_ru_tg.cjs
//
// NOTE: `options` on grammar/comprehension are Prisma Json fields — pass arrays
// DIRECTLY (never JSON.stringify), otherwise Array.isArray() checks fail.
// ─────────────────────────────────────────────────────────────────────────────
const { PrismaClient } = require('C:/Users/ASUS1/Desktop/RAMZ/backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const TARGET_CODE = 'ru';
const NATIVE_CODE = 'tg';
const LEVEL = 'A1';

const CONTENT = {
  grammar: [],
  phrases: [],
  dialogues: [],
  comprehensions: [],
  modules: [],
};

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
        title: 'Русӣ — Сатҳи A1',
        description: 'Аз сифр: алифбо, саломҳо, рақамҳо, оила, грамматикаи асосӣ ва муколамаҳои ҳаррӯза.',
        emoji: '🇷🇺',
        color: '#3B82F6',
        order: 2,
        isActive: true,
      },
    });
    console.log('  + created A1 course', course.id);
  } else {
    await prisma.course.update({
      where: { id: course.id },
      data: {
        title: 'Русӣ — Сатҳи A1',
        description: 'Аз сифр: алифбо, саломҳо, рақамҳо, оила, грамматикаи асосӣ ва муколамаҳои ҳаррӯза.',
        emoji: '🇷🇺',
        color: '#3B82F6',
        isActive: true,
      },
    });
    console.log('  · using existing A1 course', course.id);
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
        emoji: m.emoji ?? '📚', color: m.color ?? '#3B82F6',
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
            difficulty: w.difficulty ?? 1, order: j,
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
  console.log('▶ Seeding A1 Russian-for-Tajik …');
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
    key: 'pronouns', emoji: '👤', title: 'Местоимения (я, ты, он…)', titleTranslated: 'Ҷонишинҳои шахсӣ',
    explanation: 'Ҷонишинҳои шахсӣ дар русӣ:\n\n- **я** — ман\n- **ты** — ту\n- **он** — ӯ (мард)\n- **она** — ӯ (зан)\n- **оно** — он (ашё)\n- **мы** — мо\n- **вы** — шумо\n- **они** — онҳо\n\nДар русӣ ҷонишин ҳамеша пеш аз феъл меояд.',
    examples: [
      { sentence: 'Я студент.', translation: 'Ман донишҷӯ ҳастам.', highlight: 'Я' },
      { sentence: 'Она врач.', translation: 'Ӯ духтур аст.', highlight: 'Она' },
      { sentence: 'Они живут здесь.', translation: 'Онҳо дар ин ҷо зиндагӣ мекунанд.', highlight: 'Они' },
    ],
    rules: [
      { pattern: 'я / ты / он / она / оно / мы / вы / они', note: 'Ҷонишин пеш аз феъл меояд.' },
      { pattern: 'он — мард, она — зан, оно — ашё', note: 'Ҷинс муҳим аст.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ — врач. (зан)', promptTranslated: 'Ӯ духтур аст.', answer: 'Она', options: ['Он', 'Она', 'Оно'], explanation: 'Барои зан — «Она».' },
      { type: 'choose', prompt: '___ живём в Душанбе. (мо)', promptTranslated: 'Мо дар Душанбе зиндагӣ мекунем.', answer: 'Мы', options: ['Мы', 'Вы', 'Они'], explanation: 'Барои «мо» — «Мы».' },
      { type: 'choose', prompt: '___ учатся в школе. (ҷамъ)', promptTranslated: 'Онҳо дар мактаб таҳсил мекунанд.', answer: 'Они', options: ['Мы', 'Вы', 'Они'], explanation: 'Барои «онҳо» — «Они».' },
    ],
  },
  {
    key: 'dash_rule', emoji: '🟰', title: 'Я — студент (тире)', titleTranslated: 'Ман донишҷӯ ҳастам — тире',
    explanation: 'Дар забони русӣ феъли «быть» (будан) дар замони ҳозира **партофта мешавад**.\n\nАгар ҷумла аз ду **исм** иборат бошад, **тире (—)** гузошта мешавад:\n\n- **Я — студент.** = Ман донишҷӯ ҳастам.\n- **Москва — столица России.** = Москва пойтахти Россия аст.\n\nАгар баъди ҷонишин **сифат** биёяд — тире нагузошта мешавад:\n- **Она добрая.** = Ӯ меҳрубон аст.',
    examples: [
      { sentence: 'Я — врач.', translation: 'Ман духтур ҳастам.', highlight: '—' },
      { sentence: 'Он — мой друг.', translation: 'Ӯ дӯсти ман аст.', highlight: '—' },
      { sentence: 'Она красивая.', translation: 'Ӯ зебо аст.', highlight: 'красивая' },
    ],
    rules: [
      { pattern: 'Исм + — + Исм', note: 'Тире гузошта мешавад: Я — учитель.' },
      { pattern: 'Ҷонишин + сифат', note: 'Тире нагузошта мешавад: Она умная.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Он ___ мой брат.', promptTranslated: 'Ӯ бародари ман аст.', answer: '—', options: ['—', 'есть', 'является'], explanation: 'Ду исм → тире.' },
      { type: 'choose', prompt: 'Мы ___ студенты.', promptTranslated: 'Мо донишҷӯ ҳастем.', answer: '—', options: ['—', 'есть', 'быть'], explanation: 'Ду исм → тире.' },
    ],
  },
  {
    key: 'gender', emoji: '🔵🔴', title: 'Род существительных', titleTranslated: 'Ҷинси исмҳо (мужской, женский, средний)',
    explanation: 'Дар русӣ ҳар исм **се ҷинс** дорад:\n\n- **Мардона (мужской)**: исм ба ҳамсадо ё **-й/-ь** тамом мешавад.\n  Мисол: стол (миз), чай (чой), день (рӯз)\n\n- **Занона (женский)**: исм ба **-а/-я** тамом мешавад (ё -ь барои баъзе).\n  Мисол: книга (китоб), семья (оила)\n\n- **Миёна (средний)**: исм ба **-о/-е** тамом мешавад.\n  Мисол: окно (равзана), море (дарё)',
    examples: [
      { sentence: 'Стол (мардона)', translation: 'Миз — ҷинси мардона', highlight: 'Стол' },
      { sentence: 'Книга (занона)', translation: 'Китоб — ҷинси занона', highlight: 'Книга' },
      { sentence: 'Окно (миёна)', translation: 'Равзана — ҷинси миёна', highlight: 'Окно' },
    ],
    rules: [
      { pattern: 'Ҳамсадо / -й / -ь → мардона', note: 'стол, день, чай.' },
      { pattern: '-а / -я → занона', note: 'мама, книга, неделя.' },
      { pattern: '-о / -е → миёна', note: 'окно, море, письмо.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Книга — кадом ҷинс?', promptTranslated: 'Книга — какой род?', answer: 'Занона', options: ['Мардона', 'Занона', 'Миёна'], explanation: 'книга (-а) → занона.' },
      { type: 'choose', prompt: 'Стол — кадом ҷинс?', promptTranslated: 'Стол — какой род?', answer: 'Мардона', options: ['Мардона', 'Занона', 'Миёна'], explanation: 'стол (ҳамсадо) → мардона.' },
      { type: 'choose', prompt: 'Окно — кадом ҷинс?', promptTranslated: 'Окно — какой род?', answer: 'Миёна', options: ['Мардона', 'Занона', 'Миёна'], explanation: 'окно (-о) → миёна.' },
    ],
  },
  {
    key: 'eto', emoji: '👉', title: '«Это» — это/это', titleTranslated: '«Это» — ин аст / он аст',
    explanation: '«**Это**» дар русӣ маънои «ин аст» ё «он аст»-ро дорад.\n\nБарои **ҳама ҷинсҳо якхела** аст:\n\n- Это книга. = Ин китоб аст.\n- Это стол. = Ин миз аст.\n- Это окно. = Ин равзана аст.\n\nБарои пурсидан: **Что это?** — Ин чист?',
    examples: [
      { sentence: 'Это мой друг.', translation: 'Ин дӯсти ман аст.', highlight: 'Это' },
      { sentence: 'Это Москва.', translation: 'Ин Москва аст.', highlight: 'Это' },
      { sentence: 'Что это?', translation: 'Ин чист?', highlight: 'это' },
    ],
    rules: [
      { pattern: 'Это + исм', note: 'Барои ҳар ҷинс якхела: это стол, это книга, это окно.' },
      { pattern: 'Что это? — ин чист?', note: 'Савол бо «что это?».' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ книга.', promptTranslated: 'Ин китоб аст.', answer: 'Это', options: ['Этот', 'Эта', 'Это'], explanation: '«Это» барои ҳама ҷинсҳо якхела аст.' },
      { type: 'choose', prompt: '___ мой телефон.', promptTranslated: 'Ин телефони ман аст.', answer: 'Это', options: ['Это', 'Этот', 'Эта'], explanation: '«Это» — универсалӣ.' },
    ],
  },
  {
    key: 'plural', emoji: '➕', title: 'Множественное число', titleTranslated: 'Ҷамъи исмҳо',
    explanation: 'Барои ҷамъ дар русӣ:\n\n- Мардона (ҳамсадо) → **+ы**: стол → стол**ы**, друг → друг**и**\n- Занона (-а) → **-а + и**: книга → книг**и**\n- Миёна (-о) → **-о + а**: окно → окн**а**\n\nИстисноҳо зиёданд, аммо қоидаи асосӣ ин аст.',
    examples: [
      { sentence: 'Книга → книги', translation: 'Китоб → китобҳо', highlight: 'книги' },
      { sentence: 'Стол → столы', translation: 'Миз → мизҳо', highlight: 'столы' },
      { sentence: 'Окно → окна', translation: 'Равзана → равзанаҳо', highlight: 'окна' },
    ],
    rules: [
      { pattern: 'Ҳамсадо + ы/и', note: 'стол → столы, карандаш → карандаши.' },
      { pattern: '-а → и', note: 'книга → книги, мама → мамы.' },
      { pattern: '-о → а', note: 'окно → окна, слово → слова.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Книга → ?', promptTranslated: 'Китоб → китобҳо', answer: 'книги', options: ['книги', 'книгы', 'книга'], explanation: 'книга (-а) → книги.' },
      { type: 'choose', prompt: 'Стол → ?', promptTranslated: 'Миз → мизҳо', answer: 'столы', options: ['столи', 'столы', 'столе'], explanation: 'стол (ҳамсадо) → столы.' },
    ],
  },
  {
    key: 'possessive', emoji: '🔑', title: 'Притяжательные местоимения', titleTranslated: 'Сифатҳои соҳибӣ (мой, твой…)',
    explanation: 'Дар русӣ соҳибят тибқи **ҷинси исм** тағйир меёбад:\n\n| Шахс | Мардона | Занона | Миёна |\n|------|---------|--------|-------|\n| Ман | **мой** | **моя** | **моё** |\n| Ту | **твой** | **твоя** | **твоё** |\n| Ӯ (мард) | **его** | **его** | **его** |\n| Ӯ (зан) | **её** | **её** | **её** |\n| Мо | **наш** | **наша** | **наше** |\n| Шумо | **ваш** | **ваша** | **ваше** |\n| Онҳо | **их** | **их** | **их** |',
    examples: [
      { sentence: 'Это мой брат.', translation: 'Ин бародари ман аст.', highlight: 'мой' },
      { sentence: 'Это моя сестра.', translation: 'Ин хоҳари ман аст.', highlight: 'моя' },
      { sentence: 'Это моё письмо.', translation: 'Ин номаи ман аст.', highlight: 'моё' },
    ],
    rules: [
      { pattern: 'мой/твой/наш/ваш — пеш аз исми мардона', note: 'мой стол, твой друг.' },
      { pattern: 'моя/твоя/наша/ваша — пеш аз исми занона', note: 'моя книга, твоя сестра.' },
      { pattern: 'моё/твоё/наше/ваше — пеш аз исми миёна', note: 'моё окно, твоё письмо.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ сестра. (ман, занона)', promptTranslated: 'Хоҳари ман.', answer: 'Моя', options: ['Мой', 'Моя', 'Моё'], explanation: 'сестра — занона → моя.' },
      { type: 'choose', prompt: '___ брат. (ту, мардона)', promptTranslated: 'Бародари ту.', answer: 'Твой', options: ['Твой', 'Твоя', 'Твоё'], explanation: 'брат — мардона → твой.' },
      { type: 'choose', prompt: '___ письмо. (ман, миёна)', promptTranslated: 'Номаи ман.', answer: 'Моё', options: ['Мой', 'Моя', 'Моё'], explanation: 'письмо — миёна → моё.' },
    ],
  },
  {
    key: 'have', emoji: '🤲', title: '«У меня есть» (у кого есть)', titleTranslated: '«У меня есть» — ман дорам',
    explanation: 'Дар русӣ «доштан» бо ибораи **«у + ҷонишин + есть»** ифода мешавад:\n\n- **У меня есть** брат. = Ман бародар дорам.\n- **У тебя есть** телефон? = Ту телефон дорӣ?\n- **У него есть** машина. = Ӯ мошин дорад.\n- **У неё есть** сестра. = Ӯ хоҳар дорад.\n\nҶадвал:\n- у меня, у тебя, у него, у неё, у нас, у вас, у них',
    examples: [
      { sentence: 'У меня есть кошка.', translation: 'Ман гурба дорам.', highlight: 'У меня есть' },
      { sentence: 'У него есть машина.', translation: 'Ӯ мошин дорад.', highlight: 'У него есть' },
      { sentence: 'У тебя есть телефон?', translation: 'Ту телефон дорӣ?', highlight: 'У тебя есть' },
    ],
    rules: [
      { pattern: 'У меня/тебя/него/неё/нас/вас/них + есть', note: 'у меня есть = ман дорам.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ есть книга. (ман)', promptTranslated: 'Ман китоб дорам.', answer: 'У меня', options: ['У меня', 'У тебя', 'У него'], explanation: '«Ман» → у меня.' },
      { type: 'choose', prompt: 'У тебя ___ телефон?', promptTranslated: 'Ту телефон дорӣ?', answer: 'есть', options: ['есть', 'нет', 'имеет'], explanation: '«Доштан» → есть.' },
    ],
  },
  {
    key: 'verb_conj', emoji: '🔁', title: 'Спряжение глаголов (I тип)', titleTranslated: 'Феълҳои ҳозира (читать, работать)',
    explanation: 'Феълҳои русӣ дар ҳозира **тибқи шахс** тағйир меёбанд.\n\nФеъли **читать** (хондан):\n\n- **я читаю** — ман мехонам\n- **ты читаешь** — ту мехонӣ\n- **он/она читает** — ӯ мехонад\n- **мы читаем** — мо мехонем\n- **вы читаете** — шумо мехонед\n- **они читают** — онҳо мехонанд\n\nФеъли **работать** (кор кардан) ҳам ҳамин хел.',
    examples: [
      { sentence: 'Я читаю книгу.', translation: 'Ман китоб мехонам.', highlight: 'читаю' },
      { sentence: 'Она работает в школе.', translation: 'Ӯ дар мактаб кор мекунад.', highlight: 'работает' },
      { sentence: 'Мы учимся вместе.', translation: 'Мо якҷо таҳсил мекунем.', highlight: 'учимся' },
    ],
    rules: [
      { pattern: 'я → -ю/-у', note: 'я читаю, я работаю.' },
      { pattern: 'ты → -ешь/-ёшь', note: 'ты читаешь, ты работаешь.' },
      { pattern: 'он/она → -ет/-ёт', note: 'он читает, она работает.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Она ___ по-русски. (говорить)', promptTranslated: 'Ӯ ба русӣ гап мезанад.', answer: 'говорит', options: ['говорю', 'говорит', 'говорят'], explanation: 'Бо она → говорит.' },
      { type: 'choose', prompt: 'Они ___ в школе. (учиться)', promptTranslated: 'Онҳо дар мактаб таҳсил мекунанд.', answer: 'учатся', options: ['учусь', 'учится', 'учатся'], explanation: 'Бо они → учатся.' },
    ],
  },
  {
    key: 'negation', emoji: '🚫', title: 'Отрицание с «не»', titleTranslated: 'Инкор бо «не»',
    explanation: 'Барои инкор дар русӣ пеш аз феъл **«не»** гузошта мешавад:\n\n- Я понимаю → Я **не** понимаю — Ман намефаҳмам\n- Он живёт здесь → Он **не** живёт здесь — Ӯ дар ин ҷо зиндагӣ намекунад\n\nБарои «доштан» инкор аст: **У меня нет** = Ман надорам',
    examples: [
      { sentence: 'Я не понимаю.', translation: 'Ман намефаҳмам.', highlight: 'не' },
      { sentence: 'Она не работает.', translation: 'Ӯ кор намекунад.', highlight: 'не' },
      { sentence: 'Я не говорю по-английски.', translation: 'Ман ба англисӣ гап намезанам.', highlight: 'не' },
    ],
    rules: [
      { pattern: 'не + феъл', note: 'Инкори асосӣ: я не читаю.' },
      { pattern: 'У меня нет + исм', note: 'Инкори доштан: у меня нет книги.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Я ___ понимаю.', promptTranslated: 'Ман намефаҳмам.', answer: 'не', options: ['не', 'нет', 'ни'], explanation: 'Инкори феъл → не.' },
      { type: 'choose', prompt: 'Она ___ живёт здесь.', promptTranslated: 'Ӯ дар ин ҷо зиндагӣ намекунад.', answer: 'не', options: ['не', 'нет', 'без'], explanation: 'Инкори феъл → не.' },
    ],
  },
  {
    key: 'question_words', emoji: '🔎', title: 'Вопросительные слова', titleTranslated: 'Калимаҳои саволӣ (кто, что, где…)',
    explanation: 'Калимаҳои асосии саволӣ дар русӣ:\n\n- **Кто?** — кӣ?\n- **Что?** — чӣ?\n- **Где?** — куҷо?\n- **Как?** — чӣ хел?\n- **Когда?** — кай?\n- **Сколько?** — чанд?\n- **Почему?** — чаро?',
    examples: [
      { sentence: 'Как вас зовут?', translation: 'Номи шумо чист?', highlight: 'Как' },
      { sentence: 'Где вы живёте?', translation: 'Шумо дар куҷо зиндагӣ мекунед?', highlight: 'Где' },
      { sentence: 'Сколько вам лет?', translation: 'Шумо чандсола ҳастед?', highlight: 'Сколько' },
    ],
    rules: [
      { pattern: 'Калимаи саволӣ + феъл/ҷонишин', note: 'Кто/Что/Где… аввал меояд.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ вас зовут?', promptTranslated: 'Номи шумо чист?', answer: 'Как', options: ['Как', 'Где', 'Кто'], explanation: 'Барои ном → Как (Как вас зовут?).' },
      { type: 'choose', prompt: '___ вы живёте?', promptTranslated: 'Шумо дар куҷо зиндагӣ мекунед?', answer: 'Где', options: ['Что', 'Где', 'Когда'], explanation: 'Барои ҷой → Где.' },
      { type: 'choose', prompt: '___ вам лет?', promptTranslated: 'Шумо чандсола ҳастед?', answer: 'Сколько', options: ['Сколько', 'Когда', 'Почему'], explanation: 'Барои шумора → Сколько.' },
    ],
  },
  {
    key: 'prepositions', emoji: '🧭', title: 'Предлоги в/на (где?)', titleTranslated: 'Пешояндҳои ҷой (в/на — дар куҷо?)',
    explanation: 'Барои гуфтани «дар куҷо?» дар русӣ:\n\n- **в** — дар дохили ҷой: в школе (дар мактаб), в доме (дар хона)\n- **на** — дар рӯи ё ҷойи кушод: на столе (дар рӯи миз), на улице (дар кӯча)\n\nИсм баъди в/на шакл иваз мекунад (падежи предложный):\n- школа → в школ**е**\n- стол → на стол**е**',
    examples: [
      { sentence: 'Я живу в Таджикистане.', translation: 'Ман дар Тоҷикистон зиндагӣ мекунам.', highlight: 'в Таджикистане' },
      { sentence: 'Книга на столе.', translation: 'Китоб дар рӯи миз аст.', highlight: 'на столе' },
      { sentence: 'Я учусь в школе.', translation: 'Ман дар мактаб таҳсил мекунам.', highlight: 'в школе' },
    ],
    rules: [
      { pattern: 'в + ҷои пӯшида', note: 'в школе, в доме, в городе.' },
      { pattern: 'на + рӯи ашё/ҷойи кушод', note: 'на столе, на улице, на работе.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Книга ___ столе.', promptTranslated: 'Китоб дар рӯи миз аст.', answer: 'на', options: ['в', 'на', 'под'], explanation: 'Рӯи миз → на.' },
      { type: 'choose', prompt: 'Я учусь ___ школе.', promptTranslated: 'Ман дар мактаб таҳсил мекунам.', answer: 'в', options: ['в', 'на', 'у'], explanation: 'Дар дохили мактаб → в.' },
    ],
  },
  {
    key: 'like', emoji: '❤️', title: 'Любить / нравиться', titleTranslated: 'Дӯст доштан (любить/нравиться)',
    explanation: 'Дар русӣ «дӯст доштан» ду роҳ дорад:\n\n**1. Любить** — дӯст доштан (амиқтар):\n- Я **люблю** чай. — Ман чой дӯст медорам.\n- Ты **любишь** музыку? — Ту мусиқӣ дӯст медорӣ?\n- Он/Она **любит** спорт. — Ӯ варзишро дӯст медорад.\n\nИнкор:\n- Я **не люблю** кофе. — Ман қаҳва дӯст намедорам.',
    examples: [
      { sentence: 'Я люблю чай.', translation: 'Ман чой дӯст медорам.', highlight: 'люблю' },
      { sentence: 'Ты любишь музыку?', translation: 'Ту мусиқӣ дӯст медорӣ?', highlight: 'любишь' },
      { sentence: 'Она не любит кофе.', translation: 'Ӯ қаҳва дӯст намедорад.', highlight: 'не любит' },
    ],
    rules: [
      { pattern: 'я люблю / ты любишь / он-она любит', note: 'Феъли любить.' },
      { pattern: 'я не люблю + исм', note: 'Инкор: я не люблю мясо.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Я ___ спорт.', promptTranslated: 'Ман варзишро дӯст медорам.', answer: 'люблю', options: ['люблю', 'любит', 'любишь'], explanation: 'Бо я → люблю.' },
      { type: 'choose', prompt: 'Она не ___ кофе.', promptTranslated: 'Ӯ қаҳва дӯст намедорад.', answer: 'любит', options: ['люблю', 'любит', 'любишь'], explanation: 'Бо она → любит.' },
    ],
  },
  {
    key: 'can', emoji: '💪', title: 'Мочь (я могу…)', titleTranslated: 'Метавонам — мочь',
    explanation: 'Феъли **мочь** маънои «метавонам»-ро дорад:\n\n- **я могу** — ман метавонам\n- **ты можешь** — ту метавонӣ\n- **он/она может** — ӯ метавонад\n- **мы можем** — мо метавонем\n- **вы можете** — шумо метавонед\n- **они могут** — онҳо метавонанд\n\nИнкор: **не могу** — наметавонам\n\nБрои иҷозат: **Можно?** — Мумкин?',
    examples: [
      { sentence: 'Я могу говорить по-русски.', translation: 'Ман ба русӣ гап зада метавонам.', highlight: 'могу' },
      { sentence: 'Ты можешь мне помочь?', translation: 'Ту ба ман кӯмак карда метавонӣ?', highlight: 'можешь' },
      { sentence: 'Можно войти?', translation: 'Дохил шудан мумкин аст?', highlight: 'Можно' },
    ],
    rules: [
      { pattern: 'я могу / ты можешь / он может', note: 'Феъли мочь.' },
      { pattern: 'Можно? — Нельзя.', note: 'Иҷозат: можно = мумкин, нельзя = мумкин нест.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Я ___ говорить по-русски.', promptTranslated: 'Ман ба русӣ гап зада метавонам.', answer: 'могу', options: ['могу', 'может', 'можем'], explanation: 'Бо я → могу.' },
      { type: 'choose', prompt: 'Ты ___ мне помочь?', promptTranslated: 'Ту ба ман кӯмак карда метавонӣ?', answer: 'можешь', options: ['могу', 'можешь', 'может'], explanation: 'Бо ты → можешь.' },
    ],
  },
  {
    key: 'imperatives', emoji: '✋', title: 'Повелительное наклонение', titleTranslated: 'Феъли амрӣ (фармоиш)',
    explanation: 'Барои фармоиш ё дархост дар русӣ:\n\n- **Ғайрирасмӣ (ты)**: феъли асос + **-й/-и**\n  Читай! — Бихон! | Говори! — Гап зан!\n\n- **Расмӣ (вы)**: феъли асос + **-йте/-ите**\n  Читайте! — Бихонед! | Говорите! — Гап занед!\n\n- **Инкор**: Не + феъли амрӣ\n  Не говори! — Нагӯй! | Не опаздывайте! — Дер накунед!',
    examples: [
      { sentence: 'Слушайте внимательно!', translation: 'Диқат гӯш кунед!', highlight: 'Слушайте' },
      { sentence: 'Повторите, пожалуйста.', translation: 'Лутфан такрор кунед.', highlight: 'Повторите' },
      { sentence: 'Не опаздывайте!', translation: 'Дер накунед!', highlight: 'Не опаздывайте' },
    ],
    rules: [
      { pattern: 'Феъл + -й/-и (ту)', note: 'Говори! Читай! Иди!' },
      { pattern: 'Феъл + -йте/-ите (шумо)', note: 'Говорите! Читайте! Идите!' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ пожалуйста. (расмӣ — нишинед)', promptTranslated: 'Лутфан нишинед.', answer: 'Садитесь,', options: ['Садись,', 'Садитесь,', 'Сядь,'], explanation: 'Расмӣ (вы) → -итесь/-ите.' },
      { type: 'choose', prompt: '___ здесь! (дар ин ҷо гап назанед)', promptTranslated: 'Дар ин ҷо гап назанед!', answer: 'Не говорите', options: ['Не говори', 'Не говорите', 'Не говорит'], explanation: 'Инкори расмӣ → Не + -ите.' },
    ],
  },
  {
    key: 'adjectives', emoji: '🎨', title: 'Прилагательные (мужской/женский/средний)', titleTranslated: 'Сифатҳо (мардона/занона/миёна)',
    explanation: 'Дар русӣ сифат тибқи **ҷинс ва шумораи исм** тағйир меёбад:\n\n- **Мардона (-ый/-ий)**: большой стол, красивый дом\n- **Занона (-ая/-яя)**: большая книга, красивая девушка\n- **Миёна (-ое/-ее)**: большое окно, красивое море\n- **Ҷамъ (-ые/-ие)**: большие дома',
    examples: [
      { sentence: 'Большой дом.', translation: 'Хонаи калон.', highlight: 'Большой' },
      { sentence: 'Красивая девушка.', translation: 'Духтари зебо.', highlight: 'Красивая' },
      { sentence: 'Новое слово.', translation: 'Калимаи нав.', highlight: 'Новое' },
    ],
    rules: [
      { pattern: '-ый/-ий (мардона)', note: 'большой стол, новый дом.' },
      { pattern: '-ая/-яя (занона)', note: 'большая книга, новая школа.' },
      { pattern: '-ое/-ее (миёна)', note: 'большое окно, новое письмо.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Больш___ дом. (мардона)', promptTranslated: 'Хонаи калон.', answer: 'Большой', options: ['Большой', 'Большая', 'Большое'], explanation: 'дом — мардона → большой.' },
      { type: 'choose', prompt: 'Нов___ книга. (занона)', promptTranslated: 'Китоби нав.', answer: 'Новая', options: ['Новый', 'Новая', 'Новое'], explanation: 'книга — занона → новая.' },
    ],
  },
);

// ── PHRASE COLLECTIONS ───────────────────────────────────────────────────────
CONTENT.phrases.push(
  {
    key: 'greetings', category: 'greetings', emoji: '👋', title: 'Приветствия', titleTranslated: 'Саломҳо',
    phrases: [
      { text: 'Привет!', translation: 'Салом! (ғайрирасмӣ)' },
      { text: 'Здравствуйте!', translation: 'Салом! (расмӣ)' },
      { text: 'Доброе утро!', translation: 'Субҳ ба хайр!' },
      { text: 'Добрый день!', translation: 'Рӯз ба хайр!' },
      { text: 'Добрый вечер!', translation: 'Шом ба хайр!' },
      { text: 'Как дела?', translation: 'Корҳо чӣ хел?' },
      { text: 'Хорошо, спасибо!', translation: 'Хуб, ташаккур!' },
      { text: 'До свидания!', translation: 'Хайр! (расмӣ)' },
      { text: 'Пока!', translation: 'Хайр! (ғайрирасмӣ)' },
    ],
  },
  {
    key: 'introductions', category: 'introductions', emoji: '🤝', title: 'Знакомство', titleTranslated: 'Муаррифии худ',
    phrases: [
      { text: 'Меня зовут Алексей.', translation: 'Номи ман Алексей аст.' },
      { text: 'Как вас зовут?', translation: 'Номи шумо чист?' },
      { text: 'Очень приятно!', translation: 'Аз шиносоӣ хушҳолам!' },
      { text: 'Я из Таджикистана.', translation: 'Ман аз Тоҷикистон ҳастам.' },
      { text: 'Откуда вы?', translation: 'Шумо аз куҷоед?' },
      { text: 'Мне двадцать лет.', translation: 'Ман бистсола ҳастам.' },
      { text: 'Я — студент.', translation: 'Ман донишҷӯ ҳастам.' },
      { text: 'Я говорю немного по-русски.', translation: 'Ман каме ба русӣ гап мезанам.' },
    ],
  },
  {
    key: 'classroom', category: 'classroom', emoji: '🏫', title: 'В классе', titleTranslated: 'Дар синф',
    phrases: [
      { text: 'Откройте книгу.', translation: 'Китобро кушоед.' },
      { text: 'Слушайте, пожалуйста.', translation: 'Лутфан гӯш кунед.' },
      { text: 'Повторите за мной.', translation: 'Аз паси ман такрор кунед.' },
      { text: 'Я не понимаю.', translation: 'Ман намефаҳмам.' },
      { text: 'Повторите, пожалуйста?', translation: 'Лутфан такрор карда метавонед?' },
      { text: 'Как это сказать по-русски?', translation: 'Инро ба русӣ чӣ хел мегӯянд?' },
    ],
  },
  {
    key: 'restaurant', category: 'food', emoji: '🍽️', title: 'В ресторане', titleTranslated: 'Дар тарабхона',
    phrases: [
      { text: 'Столик на двоих, пожалуйста.', translation: 'Лутфан мизе барои ду нафар.' },
      { text: 'Можно меню?', translation: 'Менюро дида метавонам?' },
      { text: 'Я хочу чай, пожалуйста.', translation: 'Ман чой мехоҳам, лутфан.' },
      { text: 'Сколько это стоит?', translation: 'Ин чанд пул аст?' },
      { text: 'Счёт, пожалуйста.', translation: 'Лутфан ҳисоб.' },
      { text: 'Это очень вкусно!', translation: 'Ин хеле болаззат аст!' },
    ],
  },
  {
    key: 'shopping', category: 'shopping', emoji: '🛍️', title: 'В магазине', titleTranslated: 'Дар мағоза',
    phrases: [
      { text: 'Сколько это стоит?', translation: 'Ин чанд пул аст?' },
      { text: 'Это слишком дорого.', translation: 'Ин хеле қимат аст.' },
      { text: 'У вас есть другой размер?', translation: 'Андозаи дигар доред?' },
      { text: 'Я возьму это.', translation: 'Ман инро мегирам.' },
      { text: 'Можно оплатить картой?', translation: 'Бо корт пардохт карда метавонам?' },
      { text: 'Вот, пожалуйста.', translation: 'Мана, бигиред.' },
    ],
  },
  {
    key: 'directions', category: 'travel', emoji: '🧭', title: 'Как пройти', titleTranslated: 'Пурсидани самт',
    phrases: [
      { text: 'Извините, где находится банк?', translation: 'Бубахшед, бонк дар куҷост?' },
      { text: 'Идите прямо.', translation: 'Рост равед.' },
      { text: 'Поверните налево.', translation: 'Ба чап гардед.' },
      { text: 'Поверните направо.', translation: 'Ба рост гардед.' },
      { text: 'Это рядом.', translation: 'Ин наздик аст.' },
      { text: 'Спасибо за помощь!', translation: 'Ташаккур барои кӯмак!' },
    ],
  },
);

// ── DIALOGUES ────────────────────────────────────────────────────────────────
CONTENT.dialogues.push(
  {
    key: 'meeting', emoji: '🤝', title: 'Знакомство', titleTranslated: 'Шиносоӣ бо шахси нав',
    scenario: 'Ду нафар бори аввал вомехӯранд ва худро муаррифӣ мекунанд.',
    lines: [
      { speaker: 'Анна', text: 'Привет! Меня зовут Анна.', translation: 'Салом! Номи ман Анна аст.' },
      { speaker: 'Ту', text: 'Привет, Анна! Я — Карим.', translation: 'Салом, Анна! Ман Карим ҳастам.', isUser: true },
      { speaker: 'Анна', text: 'Очень приятно, Карим!', translation: 'Аз шиносоӣ хушҳолам, Карим!' },
      { speaker: 'Ту', text: 'И мне приятно. Откуда вы?', translation: 'Ман ҳам хушҳолам. Шумо аз куҷоед?', isUser: true },
      { speaker: 'Анна', text: 'Я из Москвы. А вы?', translation: 'Ман аз Москва ҳастам. Шумо чӣ?' },
      { speaker: 'Ту', text: 'Я из Душанбе.', translation: 'Ман аз Душанбе ҳастам.', isUser: true },
    ],
  },
  {
    key: 'cafe', emoji: '☕', title: 'В кафе', titleTranslated: 'Дар қаҳвахона',
    scenario: 'Дар қаҳвахона мизоҷ аз официант фармоиш медиҳад.',
    lines: [
      { speaker: 'Официант', text: 'Добрый день! Что вы хотите?', translation: 'Рӯз ба хайр! Чӣ мехоҳед?' },
      { speaker: 'Ту', text: 'Я хочу чай, пожалуйста.', translation: 'Ман чой мехоҳам, лутфан.', isUser: true },
      { speaker: 'Официант', text: 'Что-нибудь ещё?', translation: 'Боз чизе?' },
      { speaker: 'Ту', text: 'Да, один кусок торта.', translation: 'Ҳа, як порча торт.', isUser: true },
      { speaker: 'Официант', text: 'Итого пятьсот рублей.', translation: 'Ҷамъан панҷсад рубл.' },
      { speaker: 'Ту', text: 'Вот, пожалуйста. Спасибо!', translation: 'Мана, бигиред. Ташаккур!', isUser: true },
    ],
  },
  {
    key: 'family', emoji: '👨‍👩‍👧', title: 'О семье', titleTranslated: 'Сӯҳбат дар бораи оила',
    scenario: 'Дӯстон дар бораи аъзои оилаи худ сӯҳбат мекунанд.',
    lines: [
      { speaker: 'Сара', text: 'У тебя есть братья или сёстры?', translation: 'Ту бародар ё хоҳар дорӣ?' },
      { speaker: 'Ту', text: 'Да, у меня есть один брат.', translation: 'Ҳа, ман як бародар дорам.', isUser: true },
      { speaker: 'Сара', text: 'Сколько ему лет?', translation: 'Ӯ чандсола аст?' },
      { speaker: 'Ту', text: 'Ему десять лет.', translation: 'Ӯ даҳсола аст.', isUser: true },
      { speaker: 'Сара', text: 'Здорово! А у меня две сестры.', translation: 'Хуб! Ман ду хоҳар дорам.' },
    ],
  },
  {
    key: 'shopping_dlg', emoji: '🛍️', title: 'В магазине', titleTranslated: 'Дар мағоза',
    scenario: 'Харидор нарх мепурсад ва хариди мекунад.',
    lines: [
      { speaker: 'Продавец', text: 'Чем могу помочь?', translation: 'Чӣ кор мекунам?' },
      { speaker: 'Ту', text: 'Сколько стоит эта рубашка?', translation: 'Ин кӯйлак чанд пул аст?', isUser: true },
      { speaker: 'Продавец', text: 'Тысяча рублей.', translation: 'Ҳазор рубл.' },
      { speaker: 'Ту', text: 'Хорошо, я возьму.', translation: 'Хуб, ман мегирам.', isUser: true },
      { speaker: 'Продавец', text: 'Спасибо. Хорошего дня!', translation: 'Ташаккур. Рӯзи хуш!' },
    ],
  },
  {
    key: 'directions_dlg', emoji: '🗺️', title: 'Как найти метро', titleTranslated: 'Ёфтани метро',
    scenario: 'Сайёҳ роҳи метрора мепурсад.',
    lines: [
      { speaker: 'Турист', text: 'Извините, где метро?', translation: 'Бубахшед, метро дар куҷост?' },
      { speaker: 'Ту', text: 'Идите прямо, потом направо.', translation: 'Рост равед, баъд ба рост гардед.', isUser: true },
      { speaker: 'Турист', text: 'Это далеко?', translation: 'Дур аст?' },
      { speaker: 'Ту', text: 'Нет, это близко.', translation: 'Не, наздик аст.', isUser: true },
      { speaker: 'Турист', text: 'Большое спасибо!', translation: 'Ташаккури зиёд!' },
    ],
  },
);

// ── READING COMPREHENSION ────────────────────────────────────────────────────
CONTENT.comprehensions.push(
  {
    key: 'about_me', emoji: '🙋', kind: 'reading', title: 'О себе', titleTranslated: 'Дар бораи ман',
    passage: 'Привет! Меня зовут Омар. Мне девятнадцать лет. Я из Худжанда. Я — студент. Я люблю музыку и футбол. У меня небольшая семья.',
    passageTranslated: 'Салом! Номи ман Умар аст. Ман нуздаҳсола ҳастам. Ман аз Хуҷанд ҳастам. Ман донишҷӯ ҳастам. Ман мусиқӣ ва футболро дӯст медорам. Ман оилаи хурд дорам.',
    questions: [
      { question: 'Как его зовут?', questionTranslated: 'Номи ӯ чист?', options: ['Омар', 'Али', 'Сара', 'Карим'], correctIndex: 0, explanation: 'Дар матн: «Меня зовут Омар».' },
      { question: 'Сколько ему лет?', questionTranslated: 'Ӯ чандсола аст?', options: ['Восемнадцать', 'Девятнадцать', 'Двадцать', 'Десять'], correctIndex: 1, explanation: '«Мне девятнадцать лет».' },
      { question: 'Откуда он?', questionTranslated: 'Ӯ аз куҷост?', options: ['Из Душанбе', 'Из Москвы', 'Из Худжанда', 'Из Лондона'], correctIndex: 2, explanation: '«Я из Худжанда».' },
    ],
  },
  {
    key: 'my_family', emoji: '👪', kind: 'reading', title: 'Моя семья', titleTranslated: 'Оилаи ман',
    passage: 'Это моя семья. Мой папа — врач. Моя мама — учительница. У меня одна сестра. Её зовут Лола. Ей двенадцать лет. Мы живём в большом доме.',
    passageTranslated: 'Ин оилаи ман аст. Падари ман духтур аст. Модари ман муаллима аст. Ман як хоҳар дорам. Номи ӯ Лола аст. Ӯ дувоздаҳсола аст. Мо дар хонаи калон зиндагӣ мекунем.',
    questions: [
      { question: 'Кто папа по профессии?', questionTranslated: 'Касби падар чист?', options: ['Учитель', 'Врач', 'Водитель', 'Инженер'], correctIndex: 1, explanation: '«Мой папа — врач».' },
      { question: 'Как зовут сестру?', questionTranslated: 'Номи хоҳар чист?', options: ['Сара', 'Лола', 'Анна', 'Марям'], correctIndex: 1, explanation: '«Её зовут Лола».' },
      { question: 'Сколько лет сестре?', questionTranslated: 'Хоҳар чандсола аст?', options: ['Десять', 'Одиннадцать', 'Двенадцать', 'Тринадцать'], correctIndex: 2, explanation: '«Ей двенадцать лет».' },
    ],
  },
  {
    key: 'my_day', emoji: '🌅', kind: 'reading', title: 'Мой день', titleTranslated: 'Рӯзи ман',
    passage: 'Я встаю в семь часов. Я завтракаю и иду в школу. Я учу русский язык и математику. Вечером я делаю домашнее задание. Я ложусь спать в десять часов.',
    passageTranslated: 'Ман соати ҳафт бедор мешавам. Ноништа мекунам ва ба мактаб меравам. Ман забони русӣ ва математикаро меомӯзам. Бегоҳӣ вазифаи хонагиро иҷро мекунам. Соати даҳ хоб меравам.',
    questions: [
      { question: 'Когда он встаёт?', questionTranslated: 'Ӯ кай бедор мешавад?', options: ['В шесть', 'В семь', 'В восемь', 'В десять'], correctIndex: 1, explanation: '«Я встаю в семь часов».' },
      { question: 'Что он учит?', questionTranslated: 'Ӯ чиро меомӯзад?', options: ['Музыку', 'Русский и математику', 'Спорт', 'Рисование'], correctIndex: 1, explanation: '«Я учу русский язык и математику».' },
    ],
  },
  {
    key: 'my_city', emoji: '🏙️', kind: 'reading', title: 'Мой город', titleTranslated: 'Шаҳри ман',
    passage: 'Я живу в Душанбе. Это столица Таджикистана. Здесь много парков и магазинов. Город красивый. Я очень люблю свой город.',
    passageTranslated: 'Ман дар Душанбе зиндагӣ мекунам. Ин пойтахти Тоҷикистон аст. Дар ин ҷо боғҳо ва мағозаҳои зиёд ҳастанд. Шаҳр зебо аст. Ман шаҳри худро хеле дӯст медорам.',
    questions: [
      { question: 'Где он живёт?', questionTranslated: 'Ӯ дар куҷо зиндагӣ мекунад?', options: ['В Москве', 'В Душанбе', 'В Бохтаре', 'В Кулябе'], correctIndex: 1, explanation: '«Я живу в Душанбе».' },
      { question: 'Что есть в городе?', questionTranslated: 'Дар шаҳр чӣ ҳаст?', options: ['Горы', 'Парки и магазины', 'Море', 'Пустыня'], correctIndex: 1, explanation: '«Здесь много парков и магазинов».' },
    ],
  },
);

// ── MODULES & LESSONS ────────────────────────────────────────────────────────
CONTENT.modules.push(
  {
    title: 'Russian Letters & First Words', titleTranslated: 'Ҳарфҳои русӣ ва калимаҳои аввал', emoji: '🔤', color: '#3B82F6',
    lessons: [
      {
        skillType: 'vocab', title: 'Special Russian letters', titleTranslated: 'Ҳарфҳои хоси русӣ', emoji: '🔠',
        words: [
          { word: 'Э э', translation: 'Садоноки э — /ɛ/', ipa: '/ɛ/', example: 'Это', exampleTrans: 'Ин аст' },
          { word: 'Ы ы', translation: 'Садоноки ы — /ɨ/ (ғайри тоҷикӣ)', ipa: '/ɨ/', example: 'Мы', exampleTrans: 'Мо' },
          { word: 'Ё ё', translation: 'Ё — /jo/', ipa: '/jo/', example: 'Ёж', exampleTrans: 'Кир-хор', emoji: '🦔' },
          { word: 'Ю ю', translation: 'Ю — /ju/', ipa: '/ju/', example: 'Юг', exampleTrans: 'Ҷануб', emoji: '🧭' },
          { word: 'Я я', translation: 'Я — /ja/ (ва «ман»)', ipa: '/ja/', example: 'Яблоко', exampleTrans: 'Себ', emoji: '🍎' },
          { word: 'Щ щ', translation: 'Щ — /ɕː/ (ш+ш нарм)', ipa: '/ɕː/', example: 'Щи', exampleTrans: 'Шӯрбои карам' },
          { word: 'Ъ ъ', translation: 'Ъ — аломати сахт (садо надорад)', example: 'Объект', exampleTrans: 'Объект' },
          { word: 'Ц ц', translation: 'Ц — /ts/', ipa: '/ts/', example: 'Цирк', exampleTrans: 'Сирк', emoji: '🎪' },
        ],
      },
      {
        skillType: 'vocab', title: 'First Russian words', titleTranslated: 'Калимаҳои аввали русӣ', emoji: '✨',
        words: [
          { word: 'Да', translation: 'Ҳа', ipa: '/da/' },
          { word: 'Нет', translation: 'Не', ipa: '/nʲet/' },
          { word: 'Пожалуйста', translation: 'Лутфан', ipa: '/pəˈʐalʊstə/' },
          { word: 'Спасибо', translation: 'Ташаккур', ipa: '/spɐˈsʲibə/' },
          { word: 'Извините', translation: 'Бубахшед', ipa: '/ɪzvʲɪˈnʲitʲɪ/' },
          { word: 'Хорошо', translation: 'Хуб', ipa: '/xərɐˈʂo/' },
          { word: 'Вода', translation: 'Об', ipa: '/vɐˈda/', emoji: '💧' },
          { word: 'Школа', translation: 'Мактаб', ipa: '/ˈʂkolə/', emoji: '🏫' },
          { word: 'Дом', translation: 'Хона', ipa: '/dom/', emoji: '🏠' },
          { word: 'Друг', translation: 'Дӯст', ipa: '/druk/', emoji: '🧑‍🤝‍🧑' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'pronouns', title: 'Personal pronouns', titleTranslated: 'Ҷонишинҳои шахсӣ', emoji: '👤' },
    ],
  },
  {
    title: 'Greetings & Introductions', titleTranslated: 'Саломҳо ва шиносоӣ', emoji: '👋', color: '#A78BFA',
    lessons: [
      { skillType: 'vocab', phraseKey: 'greetings', title: 'Greetings', titleTranslated: 'Саломҳо', emoji: '👋' },
      { skillType: 'grammar', grammarKey: 'dash_rule', title: 'Я — студент (dash)', titleTranslated: 'Ман донишҷӯ ҳастам — тире', emoji: '🟰' },
      { skillType: 'vocab', dialogueKey: 'meeting', title: 'Meeting someone', titleTranslated: 'Шиносоӣ', emoji: '🤝' },
      { skillType: 'vocab', phraseKey: 'introductions', title: 'Introducing yourself', titleTranslated: 'Муаррифии худ', emoji: '🙋' },
      { skillType: 'reading', comprehensionKey: 'about_me', title: 'Reading: About me', titleTranslated: 'Хониш: Дар бораи ман', emoji: '📖' },
      {
        skillType: 'speaking', title: 'Speak: Greetings', titleTranslated: 'Гуфтор: Саломҳо', emoji: '🎤',
        words: [
          { word: 'Привет', translation: 'Салом', ipa: '/prʲɪˈvʲet/' },
          { word: 'Здравствуйте', translation: 'Саломи расмӣ', ipa: '/ˈzdrastvʊjtʲɪ/' },
          { word: 'Как дела', translation: 'Корҳо чӣ хел', ipa: '/kak dʲɪˈla/' },
          { word: 'Спасибо', translation: 'Ташаккур' },
          { word: 'До свидания', translation: 'Хайр', ipa: '/də svʲɪˈdanʲɪjə/' },
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
          { word: 'Один', translation: 'Як', ipa: '/ɐˈdʲin/' },
          { word: 'Два', translation: 'Ду', ipa: '/dva/' },
          { word: 'Три', translation: 'Се', ipa: '/trʲi/' },
          { word: 'Четыре', translation: 'Чор', ipa: '/tɕɪˈtɨrʲɪ/' },
          { word: 'Пять', translation: 'Панҷ', ipa: '/pʲatʲ/' },
          { word: 'Шесть', translation: 'Шаш', ipa: '/ʂɛstʲ/' },
          { word: 'Семь', translation: 'Ҳафт', ipa: '/sʲemʲ/' },
          { word: 'Восемь', translation: 'Ҳашт', ipa: '/ˈvosʲɪmʲ/' },
          { word: 'Девять', translation: 'Нӯҳ', ipa: '/ˈdʲevʲɪtʲ/' },
          { word: 'Десять', translation: 'Даҳ', ipa: '/ˈdʲesʲɪtʲ/' },
        ],
      },
      {
        skillType: 'vocab', title: 'Numbers 11–20 & tens', titleTranslated: 'Рақамҳо 11–20 ва даҳҳо', emoji: '💯',
        words: [
          { word: 'Одиннадцать', translation: 'Ёздаҳ' },
          { word: 'Двенадцать', translation: 'Дувоздаҳ' },
          { word: 'Тринадцать', translation: 'Сездаҳ' },
          { word: 'Пятнадцать', translation: 'Понздаҳ' },
          { word: 'Двадцать', translation: 'Бист' },
          { word: 'Тридцать', translation: 'Сӣ' },
          { word: 'Сорок', translation: 'Чил' },
          { word: 'Пятьдесят', translation: 'Панҷоҳ' },
          { word: 'Сто', translation: 'Сад' },
        ],
      },
      {
        skillType: 'vocab', title: 'Days of the week', titleTranslated: 'Рӯзҳои ҳафта', emoji: '📅',
        words: [
          { word: 'Понедельник', translation: 'Душанбе' },
          { word: 'Вторник', translation: 'Сешанбе' },
          { word: 'Среда', translation: 'Чоршанбе' },
          { word: 'Четверг', translation: 'Панҷшанбе' },
          { word: 'Пятница', translation: 'Ҷумъа' },
          { word: 'Суббота', translation: 'Шанбе' },
          { word: 'Воскресенье', translation: 'Якшанбе' },
          { word: 'Сегодня', translation: 'Имрӯз' },
          { word: 'Завтра', translation: 'Фардо' },
        ],
      },
      {
        skillType: 'vocab', title: 'Months', titleTranslated: 'Моҳҳо', emoji: '🗓️',
        words: [
          { word: 'Январь', translation: 'Январ' },
          { word: 'Февраль', translation: 'Феврал' },
          { word: 'Март', translation: 'Март' },
          { word: 'Апрель', translation: 'Апрел' },
          { word: 'Май', translation: 'Май' },
          { word: 'Июнь', translation: 'Июн' },
          { word: 'Июль', translation: 'Июл' },
          { word: 'Август', translation: 'Август' },
          { word: 'Сентябрь', translation: 'Сентябр' },
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
          { word: 'Мама', translation: 'Модар', ipa: '/ˈmamə/', emoji: '👩' },
          { word: 'Папа', translation: 'Падар', ipa: '/ˈpapə/', emoji: '👨' },
          { word: 'Брат', translation: 'Бародар', ipa: '/brat/', emoji: '👦' },
          { word: 'Сестра', translation: 'Хоҳар', ipa: '/sʲɪˈstra/', emoji: '👧' },
          { word: 'Сын', translation: 'Писар', ipa: '/sɨn/' },
          { word: 'Дочь', translation: 'Духтар', ipa: '/dotɕ/' },
          { word: 'Бабушка', translation: 'Бибӣ', ipa: '/ˈbabuʂkə/', emoji: '👵' },
          { word: 'Дедушка', translation: 'Бобо', ipa: '/ˈdʲeduʂkə/', emoji: '👴' },
          { word: 'Семья', translation: 'Оила', ipa: '/sʲɪˈmʲja/', emoji: '👪' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'possessive', title: 'Мой, твой, его, её', titleTranslated: 'Сифатҳои соҳибӣ', emoji: '🔑' },
      { skillType: 'grammar', grammarKey: 'have', title: 'У меня есть', titleTranslated: 'Ман дорам', emoji: '🤲' },
      { skillType: 'vocab', dialogueKey: 'family', title: 'Talking about family', titleTranslated: 'Сӯҳбат дар бораи оила', emoji: '🗣️' },
      { skillType: 'reading', comprehensionKey: 'my_family', title: 'Reading: My family', titleTranslated: 'Хониш: Оилаи ман', emoji: '📖' },
      {
        skillType: 'speaking', title: 'Speak: Family', titleTranslated: 'Гуфтор: Оила', emoji: '🎤',
        words: [
          { word: 'Моя мама', translation: 'Модари ман' },
          { word: 'Мой папа', translation: 'Падари ман' },
          { word: 'У меня есть брат', translation: 'Ман бародар дорам' },
          { word: 'У меня есть сестра', translation: 'Ман хоҳар дорам' },
        ],
      },
    ],
  },
  {
    title: 'Colors, Objects & Classroom', titleTranslated: 'Рангҳо, ашё ва синф', emoji: '🎨', color: '#60A5FA',
    lessons: [
      {
        skillType: 'vocab', title: 'Colors', titleTranslated: 'Рангҳо', emoji: '🌈',
        words: [
          { word: 'Красный', translation: 'Сурх', ipa: '/ˈkrasnɨj/', emoji: '🔴' },
          { word: 'Синий', translation: 'Кабуди торик', ipa: '/ˈsʲinʲɪj/', emoji: '🔵' },
          { word: 'Голубой', translation: 'Осмонранг', emoji: '🩵' },
          { word: 'Зелёный', translation: 'Сабз', emoji: '🟢' },
          { word: 'Жёлтый', translation: 'Зард', emoji: '🟡' },
          { word: 'Чёрный', translation: 'Сиёҳ', emoji: '⚫' },
          { word: 'Белый', translation: 'Сафед', emoji: '⚪' },
          { word: 'Оранжевый', translation: 'Норинҷӣ', emoji: '🟠' },
        ],
      },
      {
        skillType: 'vocab', title: 'Classroom objects', titleTranslated: 'Ашёи синф', emoji: '🏫',
        words: [
          { word: 'Книга', translation: 'Китоб', ipa: '/ˈknʲiɡə/', emoji: '📕' },
          { word: 'Ручка', translation: 'Ручка', ipa: '/ˈrutɕkə/', emoji: '🖊️' },
          { word: 'Карандаш', translation: 'Қалами оддӣ', ipa: '/kərɐnˈdaʂ/', emoji: '✏️' },
          { word: 'Стол', translation: 'Миз', ipa: '/stol/', emoji: '🪑' },
          { word: 'Стул', translation: 'Курсӣ', ipa: '/stul/', emoji: '🪑' },
          { word: 'Сумка', translation: 'Халта', ipa: '/ˈsumkə/', emoji: '🎒' },
          { word: 'Доска', translation: 'Тахта' },
          { word: 'Учитель', translation: 'Муаллим', emoji: '🧑‍🏫' },
          { word: 'Студент', translation: 'Донишҷӯ', emoji: '🧑‍🎓' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'gender', title: 'Gender of nouns', titleTranslated: 'Ҷинси исмҳо', emoji: '🔵🔴' },
      { skillType: 'grammar', grammarKey: 'eto', title: 'Это (this is)', titleTranslated: '«Это» — ин аст', emoji: '👉' },
      { skillType: 'grammar', grammarKey: 'plural', title: 'Plural nouns', titleTranslated: 'Ҷамъи исмҳо', emoji: '➕' },
      { skillType: 'grammar', grammarKey: 'adjectives', title: 'Adjective agreement', titleTranslated: 'Сифатҳо', emoji: '🎨' },
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
          { word: 'Хлеб', translation: 'Нон', ipa: '/xlʲep/', emoji: '🍞' },
          { word: 'Рис', translation: 'Биринҷ', ipa: '/rʲis/', emoji: '🍚' },
          { word: 'Мясо', translation: 'Гӯшт', ipa: '/ˈmʲasə/', emoji: '🥩' },
          { word: 'Яйцо', translation: 'Тухм', ipa: '/jɪˈtso/', emoji: '🥚' },
          { word: 'Суп', translation: 'Шӯрбо', ipa: '/sup/', emoji: '🍜' },
          { word: 'Сыр', translation: 'Панир', ipa: '/sɨr/', emoji: '🧀' },
          { word: 'Сахар', translation: 'Шакар', ipa: '/ˈsaxər/' },
          { word: 'Соль', translation: 'Намак', ipa: '/solʲ/', emoji: '🧂' },
        ],
      },
      {
        skillType: 'vocab', title: 'Fruits & drinks', titleTranslated: 'Меваҳо ва нӯшокиҳо', emoji: '🍇',
        words: [
          { word: 'Яблоко', translation: 'Себ', ipa: '/ˈjabləkə/', emoji: '🍎' },
          { word: 'Банан', translation: 'Банан', emoji: '🍌' },
          { word: 'Виноград', translation: 'Ангур', emoji: '🍇' },
          { word: 'Дыня', translation: 'Харбуза', emoji: '🍈' },
          { word: 'Вода', translation: 'Об', emoji: '💧' },
          { word: 'Чай', translation: 'Чой', ipa: '/tɕaj/', emoji: '🍵' },
          { word: 'Кофе', translation: 'Қаҳва', ipa: '/ˈkofʲɪ/', emoji: '☕' },
          { word: 'Молоко', translation: 'Шир', ipa: '/məlɐˈko/', emoji: '🥛' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'like', title: 'Любить/нравиться', titleTranslated: 'Дӯст доштан', emoji: '❤️' },
      { skillType: 'vocab', dialogueKey: 'cafe', title: 'В кафе', titleTranslated: 'Дар қаҳвахона', emoji: '☕' },
      { skillType: 'vocab', phraseKey: 'restaurant', title: 'At the restaurant', titleTranslated: 'Дар тарабхона', emoji: '🍽️' },
      {
        skillType: 'speaking', title: 'Speak: Food', titleTranslated: 'Гуфтор: Хӯрок', emoji: '🎤',
        words: [
          { word: 'Я люблю чай', translation: 'Ман чой дӯст медорам' },
          { word: 'Я хочу хлеб', translation: 'Ман нон мехоҳам' },
          { word: 'Это очень вкусно', translation: 'Ин хеле болаззат аст' },
          { word: 'Сколько это стоит', translation: 'Ин чанд пул аст' },
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
          { word: 'Вставать', translation: 'Бедор шудан', ipa: '/vstɐˈvatʲ/' },
          { word: 'Есть', translation: 'Хӯрдан', ipa: '/jestʲ/', emoji: '🍽️' },
          { word: 'Пить', translation: 'Нӯшидан', ipa: '/pʲitʲ/', emoji: '🥤' },
          { word: 'Идти', translation: 'Рафтан', ipa: '/ɪdˈtʲi/' },
          { word: 'Работать', translation: 'Кор кардан', ipa: '/ˈrabətɐtʲ/', emoji: '💼' },
          { word: 'Учиться', translation: 'Омӯхтан', ipa: '/ʊˈtɕɪtʲsə/', emoji: '📚' },
          { word: 'Играть', translation: 'Бозӣ кардан', ipa: '/ɪˈɡratʲ/', emoji: '🎮' },
          { word: 'Спать', translation: 'Хобидан', ipa: '/spatʲ/', emoji: '😴' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'verb_conj', title: 'Verb conjugation', titleTranslated: 'Феълҳои ҳозира', emoji: '🔁' },
      { skillType: 'grammar', grammarKey: 'negation', title: 'Negation with не', titleTranslated: 'Инкор бо «не»', emoji: '🚫' },
      {
        skillType: 'vocab', title: 'Time of day', titleTranslated: 'Вақти рӯз', emoji: '🕐',
        words: [
          { word: 'Утро', translation: 'Субҳ', ipa: '/ˈutrə/', emoji: '🌅' },
          { word: 'День', translation: 'Рӯз', ipa: '/dʲenʲ/', emoji: '🌤️' },
          { word: 'Вечер', translation: 'Бегоҳ', ipa: '/ˈvʲetɕɪr/', emoji: '🌆' },
          { word: 'Ночь', translation: 'Шаб', ipa: '/notɕ/', emoji: '🌙' },
          { word: 'Час', translation: 'Соат', ipa: '/tɕas/' },
          { word: 'Минута', translation: 'Дақиқа', ipa: '/mʲɪˈnutə/' },
          { word: 'Рано', translation: 'Барвақт', ipa: '/ˈranə/' },
          { word: 'Поздно', translation: 'Дер', ipa: '/ˈpoznə/' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: My routine', titleTranslated: 'Гуфтор: Рӯзи ман', emoji: '🎤',
        words: [
          { word: 'Я встаю рано', translation: 'Ман барвақт бедор мешавам' },
          { word: 'Я иду в школу', translation: 'Ман ба мактаб меравам' },
          { word: 'Я учу русский', translation: 'Ман русиро меомӯзам' },
          { word: 'Я ложусь спать', translation: 'Ман хоб меравам' },
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
          { word: 'Школа', translation: 'Мактаб', emoji: '🏫' },
          { word: 'Больница', translation: 'Беморхона', emoji: '🏥' },
          { word: 'Магазин', translation: 'Мағоза', emoji: '🏬' },
          { word: 'Банк', translation: 'Бонк', emoji: '🏦' },
          { word: 'Парк', translation: 'Боғ', emoji: '🌳' },
          { word: 'Рынок', translation: 'Бозор', emoji: '🛒' },
          { word: 'Станция', translation: 'Истгоҳ', emoji: '🚉' },
          { word: 'Улица', translation: 'Кӯча', emoji: '🛣️' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'prepositions', title: 'В/на (where?)', titleTranslated: 'Пешояндҳои ҷой', emoji: '🧭' },
      { skillType: 'vocab', phraseKey: 'directions', title: 'Asking directions', titleTranslated: 'Пурсидани самт', emoji: '🗺️' },
      { skillType: 'vocab', dialogueKey: 'directions_dlg', title: 'Finding the metro', titleTranslated: 'Ёфтани метро', emoji: '🚇' },
      { skillType: 'reading', comprehensionKey: 'my_city', title: 'Reading: My city', titleTranslated: 'Хониш: Шаҳри ман', emoji: '📖' },
    ],
  },
  {
    title: 'Ability & Actions', titleTranslated: 'Тавоноӣ ва амалҳо', emoji: '💪', color: '#A3E635',
    lessons: [
      {
        skillType: 'vocab', title: 'Hobbies & actions', titleTranslated: 'Машғулиятҳо ва амалҳо', emoji: '🎯',
        words: [
          { word: 'Плавать', translation: 'Шино кардан', emoji: '🏊' },
          { word: 'Петь', translation: 'Сурудан', emoji: '🎤' },
          { word: 'Танцевать', translation: 'Рақсидан', emoji: '💃' },
          { word: 'Бегать', translation: 'Давидан', emoji: '🏃' },
          { word: 'Читать', translation: 'Хондан', emoji: '📖' },
          { word: 'Писать', translation: 'Навиштан', emoji: '✍️' },
          { word: 'Готовить', translation: 'Хӯрок пухтан', emoji: '🍳' },
          { word: 'Водить машину', translation: 'Ронандагӣ кардан', emoji: '🚗' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'can', title: 'Мочь (can)', titleTranslated: 'Метавонам — мочь', emoji: '💪' },
      { skillType: 'grammar', grammarKey: 'imperatives', title: 'Imperatives', titleTranslated: 'Феъли амрӣ', emoji: '✋' },
      {
        skillType: 'vocab', title: 'Common adjectives', titleTranslated: 'Сифатҳои маъмул', emoji: '🔠',
        words: [
          { word: 'Большой', translation: 'Калон', ipa: '/bɐlʲˈʂoj/' },
          { word: 'Маленький', translation: 'Хурд', ipa: '/ˈmalʲɪnʲkʲɪj/' },
          { word: 'Горячий', translation: 'Гарм', emoji: '🔥' },
          { word: 'Холодный', translation: 'Хунук', emoji: '❄️' },
          { word: 'Новый', translation: 'Нав' },
          { word: 'Старый', translation: 'Кӯҳна' },
          { word: 'Весёлый', translation: 'Хушҳол', emoji: '😊' },
          { word: 'Грустный', translation: 'Ғамгин', emoji: '😢' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: I can…', titleTranslated: 'Гуфтор: Ман метавонам…', emoji: '🎤',
        words: [
          { word: 'Я могу плавать', translation: 'Ман шино карда метавонам' },
          { word: 'Я могу готовить', translation: 'Ман хӯрок пухта метавонам' },
          { word: 'Я не могу водить', translation: 'Ман ронандагӣ карда наметавонам' },
          { word: 'Ты можешь петь', translation: 'Ту суруда метавонӣ' },
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
          { word: 'Кошка', translation: 'Гурба', ipa: '/ˈkoʂkə/', emoji: '🐱' },
          { word: 'Собака', translation: 'Саг', ipa: '/sɐˈbakə/', emoji: '🐶' },
          { word: 'Солнце', translation: 'Офтоб', ipa: '/ˈsontsə/', emoji: '☀️' },
          { word: 'Вода', translation: 'Об', emoji: '💧' },
          { word: 'Книга', translation: 'Китоб', emoji: '📕' },
        ],
      },
      {
        skillType: 'listening', title: 'Listen: Greetings', titleTranslated: 'Шунавоӣ: Саломҳо', emoji: '🎧',
        words: [
          { word: 'Привет', translation: 'Салом' },
          { word: 'Доброе утро', translation: 'Субҳ ба хайр' },
          { word: 'Спасибо', translation: 'Ташаккур' },
          { word: 'До свидания', translation: 'Хайр' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: First words', titleTranslated: 'Навиштан: Калимаҳои аввал', emoji: '✍️',
        words: [
          { word: 'Кошка', translation: 'Гурба', emoji: '🐱' },
          { word: 'Собака', translation: 'Саг', emoji: '🐶' },
          { word: 'Солнце', translation: 'Офтоб', emoji: '☀️' },
          { word: 'Книга', translation: 'Китоб', emoji: '📕' },
          { word: 'Вода', translation: 'Об', emoji: '💧' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Greetings', titleTranslated: 'Навиштан: Саломҳо', emoji: '✍️',
        words: [
          { word: 'Привет', translation: 'Салом' },
          { word: 'Спасибо', translation: 'Ташаккур' },
          { word: 'Да', translation: 'Ҳа' },
          { word: 'Нет', translation: 'Не' },
          { word: 'Хорошо', translation: 'Хуб' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Family', titleTranslated: 'Навиштан: Оила', emoji: '✍️',
        words: [
          { word: 'Мама', translation: 'Модар' },
          { word: 'Папа', translation: 'Падар' },
          { word: 'Сестра', translation: 'Хоҳар' },
          { word: 'Брат', translation: 'Бародар' },
          { word: 'Семья', translation: 'Оила' },
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
          { word: 'Деньги', translation: 'Пул', ipa: '/ˈdʲenʲɡʲɪ/', emoji: '💵' },
          { word: 'Цена', translation: 'Нарх', ipa: '/tsɨˈna/' },
          { word: 'Дёшево', translation: 'Арзон', ipa: '/ˈdʲoʂəvə/' },
          { word: 'Дорого', translation: 'Қимат', ipa: '/ˈdorəɡə/' },
          { word: 'Покупать', translation: 'Харидан' },
          { word: 'Продавать', translation: 'Фурӯхтан' },
          { word: 'Рубашка', translation: 'Кӯйлак', emoji: '👕' },
          { word: 'Обувь', translation: 'Пойафзол', emoji: '👟' },
        ],
      },
      { skillType: 'vocab', phraseKey: 'shopping', title: 'Shopping phrases', titleTranslated: 'Ибораҳои харидорӣ', emoji: '🛍️' },
      { skillType: 'vocab', dialogueKey: 'shopping_dlg', title: 'В магазине', titleTranslated: 'Дар мағоза', emoji: '🏬' },
      {
        skillType: 'review', type: 'quiz', title: 'A1 Review', titleTranslated: 'Такрори A1', emoji: '🏆', xpReward: 100,
        words: [
          { word: 'Привет', translation: 'Салом' },
          { word: 'Семья', translation: 'Оила' },
          { word: 'Вода', translation: 'Об' },
          { word: 'Друг', translation: 'Дӯст' },
          { word: 'Школа', translation: 'Мактаб' },
          { word: 'Деньги', translation: 'Пул' },
          { word: 'Большой', translation: 'Калон' },
          { word: 'Хорошо', translation: 'Хуб' },
          { word: 'Сегодня', translation: 'Имрӯз' },
          { word: 'Спасибо', translation: 'Ташаккур' },
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
