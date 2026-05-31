/* eslint-disable no-console */
// ─────────────────────────────────────────────────────────────────────────────
// Full B1 English-for-Tajik course seeder. Wipes ONLY the (English, Tajik, B1)
// course content and rebuilds it. A1/A2 and everything else are untouched.
//   set -a; . .env; set +a
//   node scripts/seed_b1_en_tg.cjs
// NOTE: `options` (grammar/comprehension) are Prisma Json — pass arrays directly.
// ─────────────────────────────────────────────────────────────────────────────
const { PrismaClient } = require('C:/Users/ASUS1/Desktop/RAMZ/backend/node_modules/@prisma/client');
const prisma = new PrismaClient();

const TARGET_CODE = 'en';
const NATIVE_CODE = 'tg';
const LEVEL = 'B1';

const CONTENT = { grammar: [], phrases: [], dialogues: [], comprehensions: [], modules: [] };

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
        targetLanguageId: target.id, nativeLanguageId: native.id, level: LEVEL,
      },
    },
  });
  const data = {
    title: 'Англисӣ — Сатҳи B1',
    description: 'Гузаштаи давомдор, шартҳо, феъли мафъул, нақли қавл — гуфтугӯи мустақилонаи муосир.',
    emoji: '🇬🇧', color: '#60A5FA', isActive: true,
  };
  if (!course) {
    course = await prisma.course.create({
      data: { targetLanguageId: target.id, nativeLanguageId: native.id, level: LEVEL, order: 3, ...data },
    });
    console.log('  + created B1 course', course.id);
  } else {
    await prisma.course.update({ where: { id: course.id }, data });
    console.log('  · using existing B1 course', course.id);
  }
  return course;
}

async function wipeCourseContent(courseId) {
  const modules = await prisma.module.findMany({ where: { courseId }, select: { id: true } });
  const moduleIds = modules.map((m) => m.id);
  if (moduleIds.length) {
    const lessons = await prisma.lesson.findMany({ where: { moduleId: { in: moduleIds } }, select: { id: true } });
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
          sentence: cap(e.sentence), translation: cap(e.translation), highlight: e.highlight ?? null, order: j,
        })) },
        rules: { create: (g.rules ?? []).map((r, j) => ({ pattern: r.pattern, note: cap(r.note) ?? null, order: j })) },
        exercises: { create: (g.exercises ?? []).map((x, j) => ({
          type: x.type ?? 'choose', prompt: cap(x.prompt), promptTranslated: cap(x.promptTranslated) ?? null,
          answer: x.answer, options: x.options ?? undefined, explanation: cap(x.explanation) ?? null, order: j,
        })) },
      },
    });
    ids.grammar[g.key] = row.id;
  }
  for (const [i, p] of CONTENT.phrases.entries()) {
    const row = await prisma.phraseCollection.create({
      data: {
        courseId, cefrLevel: LEVEL, category: p.category ?? null,
        title: cap(p.title), titleTranslated: cap(p.titleTranslated), emoji: p.emoji ?? '💬',
        order: p.order ?? i, isActive: true,
        phrases: { create: (p.phrases ?? []).map((ph, j) => ({
          text: cap(ph.text), translation: cap(ph.translation), literal: cap(ph.literal) ?? null, note: cap(ph.note) ?? null, order: j,
        })) },
      },
    });
    ids.phrases[p.key] = row.id;
  }
  for (const [i, d] of CONTENT.dialogues.entries()) {
    const row = await prisma.dialogue.create({
      data: {
        courseId, cefrLevel: LEVEL, title: cap(d.title), titleTranslated: cap(d.titleTranslated),
        scenario: cap(d.scenario) ?? null, emoji: d.emoji ?? '🎙️', order: d.order ?? i, isActive: true,
        lines: { create: (d.lines ?? []).map((l, j) => ({
          speaker: cap(l.speaker), text: cap(l.text), translation: cap(l.translation), isUser: l.isUser ?? false, order: j,
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
          options: (q.options ?? []).map(cap), correctIndex: q.correctIndex ?? 0,
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
  let totalLessons = 0, totalWords = 0;
  for (const [mi, m] of CONTENT.modules.entries()) {
    const module = await prisma.module.create({
      data: {
        courseId, title: cap(m.title), titleTranslated: cap(m.titleTranslated),
        emoji: m.emoji ?? '📚', color: m.color ?? '#60A5FA', order: m.order ?? mi, isPremium: false, isActive: true,
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
          moduleId: module.id, title: cap(l.title), titleTranslated: cap(l.titleTranslated),
          type: l.type ?? 'vocab', cefrLevel: LEVEL, skillType: l.skillType ?? 'vocab',
          emoji: l.emoji ?? '📘', xpReward: l.xpReward ?? 60, duration: l.duration ?? 5,
          order: li, isPremium: false, isActive: true, ...link,
          words: { create: (l.words ?? []).map((w, j) => ({
            word: cap(w.word), translation: cap(w.translation), emoji: w.emoji ?? null, ipa: w.ipa ?? null,
            example: cap(w.example) ?? null, exampleTrans: cap(w.exampleTrans) ?? null,
            partOfSpeech: w.partOfSpeech ?? null, difficulty: w.difficulty ?? 3, order: j,
          })) },
        },
      });
      totalLessons++; totalWords += (l.words ?? []).length;
    }
    console.log(`  + module ${mi + 1}: ${m.titleTranslated} (${(m.lessons ?? []).length} lessons)`);
  }
  console.log(`  = ${CONTENT.modules.length} modules, ${totalLessons} lessons, ${totalWords} words`);
}

async function main() {
  console.log('▶ Seeding B1 English-for-Tajik …');
  const course = await resolveCourse();
  console.log('▶ Wiping old B1 content …');
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
    key: 'past_continuous', emoji: '🎬', title: 'Past Continuous', titleTranslated: 'Замони гузаштаи давомдор',
    explanation: 'Барои амале, ки дар лаҳзаи муайяни гузашта **давом дошт**:\n\n- **was/were + феъл + ing**\n\nМисол: At 8 pm I **was watching** TV. — Соати 8-и шом ман телевизор тамошо карда истода будам.',
    examples: [
      { sentence: 'I was reading at 9 o\'clock.', translation: 'Ман соати 9 хонда истода будам.', highlight: 'was reading' },
      { sentence: 'They were playing football.', translation: 'Онҳо футбол бозӣ карда истода буданд.', highlight: 'were playing' },
      { sentence: 'What were you doing?', translation: 'Ту чӣ кор карда истода будӣ?', highlight: 'were doing' },
    ],
    rules: [
      { pattern: 'I/He/She/It + was + V-ing', note: 'was barои танҳо.' },
      { pattern: 'You/We/They + were + V-ing', note: 'were barои ҷамъ.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'At 7 pm I ___ dinner.', promptTranslated: 'Соати 7 ман хӯрок хӯрда истода будам.', answer: 'was having', options: ['was having', 'were having', 'had'], explanation: 'Бо I → was + ing.' },
      { type: 'choose', prompt: 'They ___ when I called.', promptTranslated: 'Вақте занг задам, онҳо хоб карда истода буданд.', answer: 'were sleeping', options: ['was sleeping', 'were sleeping', 'slept'], explanation: 'Бо They → were + ing.' },
    ],
  },
  {
    key: 'when_while', emoji: '⏳', title: 'When / While (past)', titleTranslated: 'When / While дар гузашта',
    explanation: 'Барои ду амали гузашта:\n\n- амали **давомдор** (Past Continuous) бо **while**\n- амали **кӯтоҳ** (Past Simple) бо **when**\n\nМисол: **While** I **was cooking**, the phone **rang**.',
    examples: [
      { sentence: 'While I was walking, it started to rain.', translation: 'Вақте ман қадам мезадам, борон сар шуд.', highlight: 'While' },
      { sentence: 'When she arrived, we were eating.', translation: 'Вақте ӯ омад, мо хӯрок хӯрда истода будем.', highlight: 'When' },
    ],
    rules: [
      { pattern: 'While + Past Continuous', note: 'Амали давомдор.' },
      { pattern: 'When + Past Simple', note: 'Амали кӯтоҳ ки ба миён омад.' },
    ],
    exercises: [
      { type: 'choose', prompt: '___ I was sleeping, he came in.', promptTranslated: 'Вақте ман хоб будам, ӯ даромад.', answer: 'While', options: ['While', 'When'], explanation: 'Бо амали давомдор → While.' },
      { type: 'choose', prompt: 'I was reading ___ the lights went off.', promptTranslated: 'Ман мехондам, вақте чароғ хомӯш шуд.', answer: 'when', options: ['when', 'while'], explanation: 'Амали кӯтоҳ → when.' },
    ],
  },
  {
    key: 'present_perfect_cont', emoji: '⏱️', title: 'Present Perfect Continuous', titleTranslated: 'Замони ҳозираи комили давомдор',
    explanation: 'Барои амале, ки аз гузашта **то ҳозир давом дорад**:\n\n- **have/has been + феъл + ing**\n- **for** (муддат), **since** (аз кай)\n\nМисол: I **have been learning** English **for** two years.',
    examples: [
      { sentence: 'I have been working since morning.', translation: 'Ман аз субҳ кор карда истодаам.', highlight: 'have been working' },
      { sentence: 'She has been living here for 5 years.', translation: 'Ӯ 5 сол боз ин ҷо зиндагӣ мекунад.', highlight: 'has been living' },
    ],
    rules: [
      { pattern: 'have/has been + V-ing', note: 'Амали давомдори то ҳозир.' },
      { pattern: 'for + муддат, since + нуқтаи вақт', note: 'for two hours, since 2020.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I have been waiting ___ an hour.', promptTranslated: 'Ман як соат боз интизорам.', answer: 'for', options: ['for', 'since'], explanation: 'Муддат → for.' },
      { type: 'choose', prompt: 'She has ___ studying all day.', promptTranslated: 'Ӯ тамоми рӯз хонда истодааст.', answer: 'been', options: ['be', 'been', 'being'], explanation: 'have/has + been + ing.' },
    ],
  },
  {
    key: 'just_already_yet', emoji: '✔️', title: 'Just / Already / Yet', titleTranslated: 'Just / Already / Yet',
    explanation: 'Бо Present Perfect:\n\n- **just** — навакак (I have just finished)\n- **already** — аллакай (тасдиқ)\n- **yet** — ҳанӯз (савол/инкор, дар охир)',
    examples: [
      { sentence: 'I have just eaten.', translation: 'Ман навакак хӯрок хӯрдам.', highlight: 'just' },
      { sentence: 'She has already left.', translation: 'Ӯ аллакай рафтааст.', highlight: 'already' },
      { sentence: 'Have you finished yet?', translation: 'Ту ҳанӯз тамом кардӣ?', highlight: 'yet' },
    ],
    rules: [
      { pattern: 'have + just/already + V3', note: 'Дар мобайн.' },
      { pattern: '… yet?  /  … not … yet', note: 'Дар охири ҷумла.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I have ___ finished my homework. (аллакай)', promptTranslated: 'Ман аллакай вазифаамро тамом кардам.', answer: 'already', options: ['already', 'yet', 'just'], explanation: 'Аллакай → already.' },
      { type: 'choose', prompt: 'Has the bus arrived ___?', promptTranslated: 'Автобус ҳанӯз омад?', answer: 'yet', options: ['yet', 'already', 'just'], explanation: 'Савол → yet.' },
    ],
  },
  {
    key: 'used_to', emoji: '🕰️', title: 'Used to', titleTranslated: 'Used to (одати гузашта)',
    explanation: '**used to + феъл** = амале ки дар гузашта **одат буд**, аммо ҳоло не:\n\n- I **used to** play football. — Ман пештар футбол бозӣ мекардам (ҳоло не).\n- Инкор: **didn\'t use to**.',
    examples: [
      { sentence: 'I used to live in a village.', translation: 'Ман пештар дар деҳа зиндагӣ мекардам.', highlight: 'used to' },
      { sentence: 'She didn\'t use to like tea.', translation: 'Ӯ пештар чойро дӯст намедошт.', highlight: "didn't use to" },
    ],
    rules: [
      { pattern: 'used to + феъли соф', note: 'Одати гузашта.' },
      { pattern: "didn't use to + феъл", note: 'Инкор (бе d дар use).' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I ___ to smoke, but I stopped.', promptTranslated: 'Ман пештар тамоку мекашидам, вале бас кардам.', answer: 'used', options: ['used', 'use', 'using'], explanation: 'used to + феъл.' },
      { type: 'choose', prompt: 'We used ___ play outside.', promptTranslated: 'Мо пештар берун бозӣ мекардем.', answer: 'to', options: ['to', 'for', 'at'], explanation: 'used **to** + феъл.' },
    ],
  },
  {
    key: 'first_conditional', emoji: '🔮', title: 'First Conditional', titleTranslated: 'Шарти якум (имконпазир)',
    explanation: 'Барои ҳолати **воқеӣ/имконпазир** дар оянда:\n\n- **If + Present Simple, … will + феъл**\n\nМисол: **If** it **rains**, I **will stay** home. — Агар борон борад, ман дар хона мемонам.',
    examples: [
      { sentence: 'If you study, you will pass.', translation: 'Агар хонӣ, имтиҳон месупорӣ.', highlight: 'If … will' },
      { sentence: 'I will call you if I have time.', translation: 'Агар вақт дошта бошам, ба ту занг мезанам.', highlight: 'will … if' },
    ],
    rules: [
      { pattern: 'If + Present Simple, will + феъл', note: 'Ҳолати воқеии оянда.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'If it rains, I ___ at home.', promptTranslated: 'Агар борон борад, ман дар хона мемонам.', answer: 'will stay', options: ['will stay', 'stayed', 'would stay'], explanation: 'Шарти 1 → will + феъл.' },
      { type: 'choose', prompt: 'If you ___ hard, you will succeed.', promptTranslated: 'Агар сахт кор кунӣ, муваффақ мешавӣ.', answer: 'work', options: ['work', 'will work', 'worked'], explanation: 'Баъди if → Present Simple.' },
    ],
  },
  {
    key: 'second_conditional', emoji: '💭', title: 'Second Conditional', titleTranslated: 'Шарти дуюм (хаёлӣ)',
    explanation: 'Барои ҳолати **хаёлӣ/ғайривоқеӣ**:\n\n- **If + Past Simple, … would + феъл**\n\nМисол: **If** I **had** money, I **would travel**. — Агар пул медоштам, сафар мекардам.',
    examples: [
      { sentence: 'If I were rich, I would help people.', translation: 'Агар бой мебудам, ба одамон кӯмак мекардам.', highlight: 'would help' },
      { sentence: 'What would you do if you won?', translation: 'Агар бурдӣ, чӣ кор мекардӣ?', highlight: 'would … if' },
    ],
    rules: [
      { pattern: 'If + Past Simple, would + феъл', note: 'Ҳолати хаёлӣ.' },
      { pattern: 'If I were …', note: 'Бо «I/he/she» зуд-зуд «were» истифода мешавад.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'If I had time, I ___ help you.', promptTranslated: 'Агар вақт медоштам, ба ту кӯмак мекардам.', answer: 'would', options: ['would', 'will', 'did'], explanation: 'Шарти 2 → would.' },
      { type: 'choose', prompt: 'If I ___ you, I would rest.', promptTranslated: 'Агар ман ҷои ту мебудам, истироҳат мекардам.', answer: 'were', options: ['were', 'am', 'will be'], explanation: 'If I were …' },
    ],
  },
  {
    key: 'relative_clauses', emoji: '🔗', title: 'Relative clauses', titleTranslated: 'Ҷумлаҳои нисбӣ (who/which/that)',
    explanation: 'Барои тавсиф додани исм:\n\n- **who** — барои одамон\n- **which** — барои ашё\n- **that** — барои ҳарду\n- **where** — барои ҷой',
    examples: [
      { sentence: 'The man who lives here is kind.', translation: 'Марде, ки ин ҷо зиндагӣ мекунад, меҳрубон аст.', highlight: 'who' },
      { sentence: 'This is the book which I bought.', translation: 'Ин китобест, ки ман харидам.', highlight: 'which' },
      { sentence: 'The city where I was born.', translation: 'Шаҳре, ки ман дар он таваллуд шудам.', highlight: 'where' },
    ],
    rules: [
      { pattern: 'одам → who, ашё → which', note: 'that бо ҳарду мешавад.' },
      { pattern: 'ҷой → where', note: 'The place where …' },
    ],
    exercises: [
      { type: 'choose', prompt: 'The woman ___ called you is here.', promptTranslated: 'Зане, ки ба ту занг зад, ин ҷост.', answer: 'who', options: ['who', 'which', 'where'], explanation: 'Одам → who.' },
      { type: 'choose', prompt: 'The phone ___ I bought is new.', promptTranslated: 'Телефоне, ки харидам, нав аст.', answer: 'which', options: ['who', 'which', 'where'], explanation: 'Ашё → which.' },
    ],
  },
  {
    key: 'passive_present', emoji: '🔄', title: 'Passive (present)', titleTranslated: 'Феъли мафъул (ҳозира)',
    explanation: 'Вақте муҳим он чизест, ки амал бар он мешавад:\n\n- **am/is/are + феъли сеюм (V3)**\n\nМисол: English **is spoken** here. — Дар ин ҷо англисӣ гап зада мешавад.',
    examples: [
      { sentence: 'Coffee is made here.', translation: 'Дар ин ҷо қаҳва тайёр карда мешавад.', highlight: 'is made' },
      { sentence: 'Cars are sold in this shop.', translation: 'Дар ин мағоза мошин фурӯхта мешавад.', highlight: 'are sold' },
    ],
    rules: [
      { pattern: 'is/are + V3', note: 'is built, are made.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'Tea ___ in China.', promptTranslated: 'Чой дар Хитой парвариш карда мешавад.', answer: 'is grown', options: ['is grown', 'grows', 'is growing'], explanation: 'Мафъул → is + V3.' },
      { type: 'choose', prompt: 'These books ___ in English.', promptTranslated: 'Ин китобҳо бо англисӣ навишта мешаванд.', answer: 'are written', options: ['are written', 'write', 'is written'], explanation: 'Ҷамъ → are + V3.' },
    ],
  },
  {
    key: 'passive_past', emoji: '🏛️', title: 'Passive (past)', titleTranslated: 'Феъли мафъул (гузашта)',
    explanation: 'Барои гузашта:\n\n- **was/were + феъли сеюм (V3)**\n\nМисол: This house **was built** in 1990.',
    examples: [
      { sentence: 'The bridge was built last year.', translation: 'Пул соли гузашта сохта шуд.', highlight: 'was built' },
      { sentence: 'The letters were sent yesterday.', translation: 'Номаҳо дирӯз фиристода шуданд.', highlight: 'were sent' },
    ],
    rules: [
      { pattern: 'was/were + V3', note: 'was made, were found.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'America ___ in 1492.', promptTranslated: 'Амрико соли 1492 кашф карда шуд.', answer: 'was discovered', options: ['was discovered', 'discovered', 'is discovered'], explanation: 'Гузаштаи мафъул → was + V3.' },
      { type: 'choose', prompt: 'The cars ___ in Japan.', promptTranslated: 'Мошинҳо дар Япония сохта шуданд.', answer: 'were made', options: ['were made', 'was made', 'made'], explanation: 'Ҷамъ → were + V3.' },
    ],
  },
  {
    key: 'reported_speech', emoji: '🗣️', title: 'Reported speech', titleTranslated: 'Нақли қавл',
    explanation: 'Барои нақли гуфтаи каси дигар. Замон як қадам ба гузашта мегузарад:\n\n- "I am tired" → He said (that) he **was** tired.\n- present → past, will → would.',
    examples: [
      { sentence: 'He said that he was busy.', translation: 'Ӯ гуфт, ки банд аст.', highlight: 'said that' },
      { sentence: 'She told me she would come.', translation: 'Ӯ ба ман гуфт, ки меояд.', highlight: 'told me' },
    ],
    rules: [
      { pattern: 'say (that) … / tell someone (that) …', note: 'tell бо шахс: told me.' },
      { pattern: 'am/is → was;  will → would', note: 'Замон як қадам ақиб.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'He said he ___ tired.', promptTranslated: 'Ӯ гуфт, ки монда аст.', answer: 'was', options: ['was', 'is', 'be'], explanation: 'is → was дар нақл.' },
      { type: 'choose', prompt: 'She ___ me that she was happy.', promptTranslated: 'Ӯ ба ман гуфт, ки хушҳол аст.', answer: 'told', options: ['told', 'said'], explanation: 'Бо шахс → told.' },
    ],
  },
  {
    key: 'gerund_infinitive', emoji: '🔀', title: 'Gerund / Infinitive', titleTranslated: 'Gerund / Infinitive (V-ing / to V)',
    explanation: 'Баъзе феълҳо бо **-ing**, баъзеҳо бо **to + феъл**:\n\n- enjoy, like, finish + **V-ing**: I enjoy **reading**.\n- want, need, decide + **to + V**: I want **to go**.',
    examples: [
      { sentence: 'I enjoy listening to music.', translation: 'Ман гӯш кардани мусиқиро дӯст медорам.', highlight: 'listening' },
      { sentence: 'She wants to travel.', translation: 'Ӯ мехоҳад сафар кунад.', highlight: 'to travel' },
    ],
    rules: [
      { pattern: 'enjoy/like/finish + V-ing', note: 'finish doing.' },
      { pattern: 'want/need/decide + to + V', note: 'need to go.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'I enjoy ___ books.', promptTranslated: 'Ман хондани китобро дӯст медорам.', answer: 'reading', options: ['reading', 'to read', 'read'], explanation: 'enjoy + V-ing.' },
      { type: 'choose', prompt: 'They decided ___ early.', promptTranslated: 'Онҳо қарор доданд барвақт раванд.', answer: 'to leave', options: ['to leave', 'leaving', 'leave'], explanation: 'decide + to + V.' },
    ],
  },
  {
    key: 'modals_deduction', emoji: '🕵️', title: 'must / might / can\'t (deduction)', titleTranslated: 'must / might / can\'t (тахмин)',
    explanation: 'Барои тахмин дар бораи ҳозира:\n\n- **must** — бешубҳа ҳаст (She must be tired.)\n- **might / could** — шояд (He might be at home.)\n- **can\'t** — наметавонад бошад (It can\'t be true.)',
    examples: [
      { sentence: 'He must be rich.', translation: 'Ӯ бешубҳа бой аст.', highlight: 'must be' },
      { sentence: 'They might be at home.', translation: 'Шояд онҳо дар хона бошанд.', highlight: 'might be' },
      { sentence: 'That can\'t be right.', translation: 'Ин наметавонад дуруст бошад.', highlight: "can't be" },
    ],
    rules: [
      { pattern: 'must/might/can\'t + феъли соф', note: 'must be, might know.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'She isn\'t answering — she ___ be busy.', promptTranslated: 'Ҷавоб намедиҳад — шояд банд бошад.', answer: 'might', options: ['might', 'must', "can't"], explanation: 'Эҳтимол → might.' },
      { type: 'choose', prompt: 'He has three cars, he ___ be poor.', promptTranslated: 'Ӯ се мошин дорад, наметавонад камбағал бошад.', answer: "can't", options: ["can't", 'must', 'might'], explanation: 'Ғайриимкон → can\'t.' },
    ],
  },
  {
    key: 'comparatives_as_as', emoji: '⚖️', title: 'as … as', titleTranslated: 'as … as (баробарӣ)',
    explanation: 'Барои нишон додани баробарӣ:\n\n- **as + сифат + as** — ба андозаи…\n- **not as … as** — ба андозаи… не\n\nМисол: He is **as tall as** me.',
    examples: [
      { sentence: 'She is as clever as her sister.', translation: 'Ӯ ба андозаи хоҳараш доно аст.', highlight: 'as clever as' },
      { sentence: 'This is not as expensive as that.', translation: 'Ин ба андозаи он қимат нест.', highlight: 'not as … as' },
    ],
    rules: [
      { pattern: 'as + сифат + as', note: 'as big as.' },
      { pattern: 'not as + сифат + as', note: 'not as good as.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'He is as tall ___ his father.', promptTranslated: 'Ӯ ба андозаи падараш баланд аст.', answer: 'as', options: ['as', 'than', 'so'], explanation: 'as … as.' },
      { type: 'choose', prompt: 'Today is not ___ hot as yesterday.', promptTranslated: 'Имрӯз ба андозаи дирӯз гарм нест.', answer: 'as', options: ['as', 'more', 'than'], explanation: 'not as … as.' },
    ],
  },
  {
    key: 'question_tags', emoji: '❓', title: 'Question tags', titleTranslated: 'Саволчаҳои иловагӣ (isn\'t it?)',
    explanation: 'Дар охири ҷумла барои тасдиқ:\n\n- ҷумлаи мусбат → саволчаи манфӣ: You are tired, **aren\'t you?**\n- ҷумлаи манфӣ → саволчаи мусбат: He isn\'t here, **is he?**',
    examples: [
      { sentence: 'You like coffee, don\'t you?', translation: 'Ту қаҳваро дӯст медорӣ, ҳамин тавр не?', highlight: "don't you?" },
      { sentence: 'She is a teacher, isn\'t she?', translation: 'Ӯ муаллим аст, ҳамин тавр не?', highlight: "isn't she?" },
    ],
    rules: [
      { pattern: 'мусбат → tag-и манфӣ', note: 'is → isn\'t it?' },
      { pattern: 'манфӣ → tag-и мусбат', note: "isn't → is it?" },
    ],
    exercises: [
      { type: 'choose', prompt: 'You are coming, ___?', promptTranslated: 'Ту меоӣ, ҳамин тавр не?', answer: "aren't you", options: ["aren't you", 'are you', "don't you"], explanation: 'are → aren\'t you?' },
      { type: 'choose', prompt: 'He doesn\'t smoke, ___?', promptTranslated: 'Ӯ тамоку намекашад, ҳамин тавр не?', answer: 'does he', options: ['does he', "doesn't he", 'is he'], explanation: 'doesn\'t → does he?' },
    ],
  },
  {
    key: 'quantifiers_b1', emoji: '📊', title: 'too much / too many / enough', titleTranslated: 'too much / too many / enough',
    explanation: '- **too much** + нашаванда: too much sugar\n- **too many** + шумурдашаванда: too many people\n- **enough** — ба қадри кофӣ: enough money',
    examples: [
      { sentence: 'There is too much noise.', translation: 'Садои зиёд ҳаст.', highlight: 'too much' },
      { sentence: 'There are too many cars.', translation: 'Мошинҳои аз ҳад зиёд ҳаст.', highlight: 'too many' },
      { sentence: 'I don\'t have enough time.', translation: 'Ман вақти кофӣ надорам.', highlight: 'enough' },
    ],
    rules: [
      { pattern: 'too much + нашаванда; too many + шумурдашаванда', note: 'too much water; too many books.' },
      { pattern: 'enough + исм', note: 'enough money.' },
    ],
    exercises: [
      { type: 'choose', prompt: 'There are too ___ people here.', promptTranslated: 'Дар ин ҷо одами аз ҳад зиёд аст.', answer: 'many', options: ['many', 'much'], explanation: 'people шумурдашаванда → many.' },
      { type: 'choose', prompt: 'I drink too ___ coffee.', promptTranslated: 'Ман қаҳваи аз ҳад зиёд менӯшам.', answer: 'much', options: ['many', 'much'], explanation: 'coffee нашаванда → much.' },
    ],
  },
);

// ── PHRASE COLLECTIONS ───────────────────────────────────────────────────────
CONTENT.phrases.push(
  {
    key: 'opinions', category: 'communication', emoji: '💭', title: 'Giving opinions', titleTranslated: 'Баёни фикр',
    phrases: [
      { text: 'In my opinion, …', translation: 'Ба фикри ман, …' },
      { text: 'I think that …', translation: 'Ман фикр мекунам, ки …' },
      { text: 'I agree with you.', translation: 'Ман бо шумо розӣ ҳастам.' },
      { text: 'I don\'t agree.', translation: 'Ман розӣ нестам.' },
      { text: 'That\'s a good point.', translation: 'Ин фикри хуб аст.' },
      { text: 'It depends.', translation: 'Вобаста аст.' },
    ],
  },
  {
    key: 'suggestions', category: 'communication', emoji: '💡', title: 'Making suggestions', titleTranslated: 'Пешниҳод кардан',
    phrases: [
      { text: 'Let\'s go to the cinema.', translation: 'Биё ба кинотеатр равем.' },
      { text: 'How about having lunch?', translation: 'Нисфирӯзӣ хӯрем, чӣ?' },
      { text: 'Why don\'t we take a break?', translation: 'Чаро танаффус накунем?' },
      { text: 'Shall we start?', translation: 'Сар кунем?' },
      { text: 'That sounds great!', translation: 'Ин аъло садо медиҳад!' },
      { text: 'Maybe another time.', translation: 'Шояд бори дигар.' },
    ],
  },
  {
    key: 'complaints', category: 'daily', emoji: '⚠️', title: 'Making a complaint', titleTranslated: 'Шикоят кардан',
    phrases: [
      { text: 'Excuse me, there is a problem.', translation: 'Бубахшед, як мушкилӣ ҳаст.' },
      { text: 'This isn\'t what I ordered.', translation: 'Ин он чизе нест, ки ман фармоиш додам.' },
      { text: 'Could you change it, please?', translation: 'Лутфан онро иваз карда метавонед?' },
      { text: 'The room is not clean.', translation: 'Ҳуҷра тоза нест.' },
      { text: 'I\'d like to speak to the manager.', translation: 'Ман мехоҳам бо мудир гап занам.' },
      { text: 'I\'d like a refund.', translation: 'Ман мехоҳам пуламро баргардонед.' },
    ],
  },
  {
    key: 'job_work', category: 'work', emoji: '💼', title: 'Work & interview', titleTranslated: 'Кор ва мусоҳиба',
    phrases: [
      { text: 'I have experience in …', translation: 'Ман таҷриба дорам дар …' },
      { text: 'I\'m good at working in a team.', translation: 'Ман дар кори дастаҷамъӣ моҳирам.' },
      { text: 'What are the working hours?', translation: 'Соатҳои корӣ чӣ гунаанд?' },
      { text: 'I\'m looking for a new job.', translation: 'Ман кори нав меҷӯям.' },
      { text: 'Could you tell me about the salary?', translation: 'Дар бораи маош гуфта метавонед?' },
      { text: 'When can I start?', translation: 'Кай сар карда метавонам?' },
    ],
  },
  {
    key: 'travel_b1', category: 'travel', emoji: '🧳', title: 'Travel & transport', titleTranslated: 'Сафар ва нақлиёт',
    phrases: [
      { text: 'How can I get to the centre?', translation: 'Ба марказ чӣ тавр расам?' },
      { text: 'Which platform does the train leave from?', translation: 'Қатор аз кадом платформа меравад?' },
      { text: 'A return ticket, please.', translation: 'Лутфан як чиптаи рафту баргашт.' },
      { text: 'How long does the journey take?', translation: 'Сафар чанд вақт мегирад?' },
      { text: 'Is this seat free?', translation: 'Ин ҷой холӣ аст?' },
      { text: 'I\'d like to book a taxi.', translation: 'Ман мехоҳам такси фармоиш диҳам.' },
    ],
  },
  {
    key: 'phone_b1', category: 'communication', emoji: '📞', title: 'Formal phone calls', titleTranslated: 'Занги расмӣ',
    phrases: [
      { text: 'Could I speak to Mr. Karimov, please?', translation: 'Лутфан бо ҷаноби Каримов гап зада метавонам?' },
      { text: 'Who\'s calling, please?', translation: 'Лутфан, кӣ занг зада истодааст?' },
      { text: 'I\'m calling about …', translation: 'Ман дар бораи … занг зада истодаам.' },
      { text: 'Could you hold on, please?', translation: 'Лутфан як лаҳза интизор шавед?' },
      { text: 'Could you call back later?', translation: 'Баъдтар занг зада метавонед?' },
      { text: 'Thank you for calling.', translation: 'Ташаккур барои занг.' },
    ],
  },
);

// ── DIALOGUES ────────────────────────────────────────────────────────────────
CONTENT.dialogues.push(
  {
    key: 'interview_b1', emoji: '💼', title: 'Job interview', titleTranslated: 'Мусоҳибаи корӣ',
    scenario: 'Номзад дар мусоҳибаи корӣ муфассал ҷавоб медиҳад.',
    lines: [
      { speaker: 'Manager', text: 'Why do you want to work here?', translation: 'Чаро мехоҳед дар ин ҷо кор кунед?' },
      { speaker: 'You', text: 'I think this is a great company to grow.', translation: 'Ман фикр мекунам, ки ин ширкати хуб барои рушд аст.', isUser: true },
      { speaker: 'Manager', text: 'What experience do you have?', translation: 'Чӣ таҷриба доред?' },
      { speaker: 'You', text: 'I have worked in sales for two years.', translation: 'Ман ду сол дар фурӯш кор кардаам.', isUser: true },
      { speaker: 'Manager', text: 'Great. We\'ll contact you soon.', translation: 'Аъло. Мо ба зудӣ бо шумо тамос мегирем.' },
      { speaker: 'You', text: 'Thank you for your time.', translation: 'Ташаккур барои вақтатон.', isUser: true },
    ],
  },
  {
    key: 'complaint_dlg', emoji: '⚠️', title: 'A complaint at a restaurant', titleTranslated: 'Шикоят дар тарабхона',
    scenario: 'Мизоҷ дар тарабхона шикоят мекунад.',
    lines: [
      { speaker: 'You', text: 'Excuse me, this isn\'t what I ordered.', translation: 'Бубахшед, ин он нест, ки фармоиш додам.', isUser: true },
      { speaker: 'Waiter', text: 'Oh, I\'m so sorry. What did you order?', translation: 'Оҳ, бубахшед. Чӣ фармоиш дода будед?' },
      { speaker: 'You', text: 'I ordered chicken, not fish.', translation: 'Ман мурғ фармоиш дода будам, на моҳӣ.', isUser: true },
      { speaker: 'Waiter', text: 'I\'ll change it right away.', translation: 'Ман дарҳол иваз мекунам.' },
      { speaker: 'You', text: 'Thank you, I appreciate it.', translation: 'Ташаккур, миннатдорам.', isUser: true },
    ],
  },
  {
    key: 'advice_dlg', emoji: '🤝', title: 'Asking for advice', titleTranslated: 'Пурсидани маслиҳат',
    scenario: 'Дӯст барои мушкилиаш маслиҳат мепурсад.',
    lines: [
      { speaker: 'Friend', text: 'I\'m so tired these days.', translation: 'Ин рӯзҳо ман хеле монда шудаам.' },
      { speaker: 'You', text: 'You should sleep more and rest.', translation: 'Ту бояд бештар хоб кунӣ ва истироҳат кунӣ.', isUser: true },
      { speaker: 'Friend', text: 'But I have too much work.', translation: 'Аммо кори аз ҳад зиёд дорам.' },
      { speaker: 'You', text: 'If I were you, I would take a break.', translation: 'Агар ҷои ту мебудам, танаффус мегирифтам.', isUser: true },
      { speaker: 'Friend', text: 'That\'s a good idea. Thanks!', translation: 'Фикри хуб аст. Ташаккур!' },
    ],
  },
  {
    key: 'invitation_dlg', emoji: '🎉', title: 'An invitation', titleTranslated: 'Даъват',
    scenario: 'Ду дӯст барои истироҳат нақша мекашанд.',
    lines: [
      { speaker: 'Sara', text: 'How about going to the mountains this weekend?', translation: 'Ин истироҳат ба кӯҳ равем, чӣ?' },
      { speaker: 'You', text: 'That sounds great! When shall we leave?', translation: 'Аъло! Кай равем?', isUser: true },
      { speaker: 'Sara', text: 'Let\'s leave early on Saturday morning.', translation: 'Биё шанбе субҳи барвақт равем.' },
      { speaker: 'You', text: 'Perfect. I\'ll bring some food.', translation: 'Олӣ. Ман каме хӯрок меорам.', isUser: true },
      { speaker: 'Sara', text: 'Great, see you then!', translation: 'Аъло, то он вақт!' },
    ],
  },
  {
    key: 'pharmacy_dlg', emoji: '💊', title: 'At the pharmacy', titleTranslated: 'Дар дорухона',
    scenario: 'Мизоҷ дар дорухона дору мепурсад.',
    lines: [
      { speaker: 'Pharmacist', text: 'Hello, how can I help you?', translation: 'Салом, чӣ хизмат?' },
      { speaker: 'You', text: 'I have a bad headache. Do you have anything?', translation: 'Сарам сахт дард мекунад. Чизе доред?', isUser: true },
      { speaker: 'Pharmacist', text: 'Yes, take this twice a day.', translation: 'Ҳа, инро рӯзе ду бор истеъмол кунед.' },
      { speaker: 'You', text: 'Should I take it after food?', translation: 'Баъди хӯрок истеъмол кунам?', isUser: true },
      { speaker: 'Pharmacist', text: 'Yes, and drink plenty of water.', translation: 'Ҳа, ва оби зиёд нӯшед.' },
    ],
  },
);

// ── READING COMPREHENSION ────────────────────────────────────────────────────
CONTENT.comprehensions.push(
  {
    key: 'my_job', emoji: '💼', kind: 'reading', title: 'My job', titleTranslated: 'Кори ман',
    passage: 'I have been working as a software developer for three years. I usually start at nine and finish at six. The best part of my job is solving problems. I work in a team, and my colleagues are friendly. If I had more time, I would learn new programming languages.',
    passageTranslated: 'Ман се сол боз ҳамчун барномасоз кор мекунам. Одатан соати нӯҳ сар мекунам ва шаш тамом мекунам. Беҳтарин қисми корам ҳалли мушкилот аст. Ман дар даста кор мекунам ва ҳамкоронам меҳрубонанд. Агар вақти бештар медоштам, забонҳои нави барномасозиро меомӯхтам.',
    questions: [
      { question: 'What is his job?', questionTranslated: 'Касби ӯ чист?', options: ['Teacher', 'Software developer', 'Doctor', 'Driver'], correctIndex: 1, explanation: '«software developer».' },
      { question: 'How long has he worked there?', questionTranslated: 'Чанд вақт боз кор мекунад?', options: ['One year', 'Two years', 'Three years', 'Five years'], correctIndex: 2, explanation: '«for three years».' },
      { question: 'What is the best part of his job?', questionTranslated: 'Беҳтарин қисми кораш чист?', options: ['The salary', 'Solving problems', 'The hours', 'The office'], correctIndex: 1, explanation: '«solving problems».' },
    ],
  },
  {
    key: 'unforgettable_trip', emoji: '🏔️', kind: 'reading', title: 'An unforgettable trip', titleTranslated: 'Сафари фаромӯшнашаванда',
    passage: 'Last year I travelled to the Pamir mountains. While we were driving, the views were amazing. One evening, when we were having dinner, we saw a beautiful sunset. I had never seen anything like it. It was the best trip of my life.',
    passageTranslated: 'Соли гузашта ман ба кӯҳҳои Помир сафар кардам. Вақте мо меронем, манзараҳо аҷоиб буданд. Як бегоҳ, вақте хӯроки шом мехӯрдем, ғуруби зебоеро дидем. Ман ҳеҷ гоҳ чунин чизро надида будам. Ин беҳтарин сафари ҳаётам буд.',
    questions: [
      { question: 'Where did he travel?', questionTranslated: 'Ба куҷо сафар кард?', options: ['The Pamir mountains', 'The sea', 'London', 'A village'], correctIndex: 0, explanation: '«the Pamir mountains».' },
      { question: 'What did they see one evening?', questionTranslated: 'Як бегоҳ чӣ диданд?', options: ['A storm', 'A sunset', 'A river', 'A city'], correctIndex: 1, explanation: '«a beautiful sunset».' },
    ],
  },
  {
    key: 'technology_life', emoji: '📱', kind: 'reading', title: 'Technology in my life', titleTranslated: 'Технология дар ҳаёти ман',
    passage: 'Technology has changed my life a lot. I use my phone to study, to talk to friends and to read the news. Many things are done online now. However, I think people should not spend too much time on screens. Balance is important.',
    passageTranslated: 'Технология ҳаёти маро хеле тағйир додааст. Ман телефонамро барои хондан, гап задан бо дӯстон ва хондани хабарҳо истифода мебарам. Ҳоло бисёр корҳо онлайн анҷом дода мешаванд. Аммо ман фикр мекунам, ки одамон набояд вақти зиёд дар экран сарф кунанд. Тавозун муҳим аст.',
    questions: [
      { question: 'What does he use his phone for?', questionTranslated: 'Телефонро барои чӣ истифода мебарад?', options: ['Only games', 'Study, friends, news', 'Only photos', 'Nothing'], correctIndex: 1, explanation: '«to study, to talk to friends and to read the news».' },
      { question: 'What does he think is important?', questionTranslated: 'Чиро муҳим медонад?', options: ['Money', 'Balance', 'Speed', 'Fame'], correctIndex: 1, explanation: '«Balance is important».' },
    ],
  },
  {
    key: 'email_friend', emoji: '✉️', kind: 'reading', title: 'An email to a friend', titleTranslated: 'Нома ба дӯст',
    passage: 'Hi Sam, How are you? I have just moved to a new city. The flat which I rented is small but comfortable. I have been looking for a job, and I had an interview yesterday. If I get the job, I will invite you to visit. Write back soon! Best, Rustam.',
    passageTranslated: 'Салом Сэм, Чӣ хелӣ? Ман навакак ба шаҳри нав кӯчидам. Хонае, ки иҷора гирифтам, хурд аст, вале бароҳат. Ман кор меҷустам ва дирӯз мусоҳиба доштам. Агар корро гирам, туро ба меҳмонӣ даъват мекунам. Зудтар ҷавоб навис! Бо эҳтиром, Рустам.',
    questions: [
      { question: 'What has Rustam just done?', questionTranslated: 'Рустам навакак чӣ кор кард?', options: ['Bought a car', 'Moved to a new city', 'Got married', 'Started school'], correctIndex: 1, explanation: '«I have just moved to a new city».' },
      { question: 'What did he have yesterday?', questionTranslated: 'Дирӯз чӣ дошт?', options: ['A party', 'An interview', 'An exam', 'A trip'], correctIndex: 1, explanation: '«I had an interview yesterday».' },
    ],
  },
);

// ── MODULES & LESSONS ────────────────────────────────────────────────────────
CONTENT.modules.push(
  {
    title: 'Past Continuous', titleTranslated: 'Гузаштаи давомдор', emoji: '🎬', color: '#60A5FA',
    lessons: [
      {
        skillType: 'vocab', title: 'Action verbs', titleTranslated: 'Феълҳои амал', emoji: '🏃',
        words: [
          { word: 'Drive', translation: 'Ронандагӣ кардан', emoji: '🚗' },
          { word: 'Cook', translation: 'Хӯрок пухтан', emoji: '🍳' },
          { word: 'Wait', translation: 'Интизор шудан' },
          { word: 'Happen', translation: 'Рӯй додан' },
          { word: 'Notice', translation: 'Пай бурдан' },
          { word: 'Arrive', translation: 'Расидан' },
          { word: 'Climb', translation: 'Боло баромадан', emoji: '🧗' },
          { word: 'Suddenly', translation: 'Ногаҳон' },
        ],
      },
      { skillType: 'grammar', grammarKey: 'past_continuous', title: 'Past Continuous', titleTranslated: 'Гузаштаи давомдор', emoji: '🎬' },
      { skillType: 'grammar', grammarKey: 'when_while', title: 'When / While', titleTranslated: 'When / While', emoji: '⏳' },
      { skillType: 'reading', comprehensionKey: 'unforgettable_trip', title: 'Reading: An unforgettable trip', titleTranslated: 'Хониш: Сафари фаромӯшнашаванда', emoji: '📖' },
      {
        skillType: 'speaking', title: 'Speak: What were you doing?', titleTranslated: 'Гуфтор: Чӣ кор мекардӣ?', emoji: '🎤',
        words: [
          { word: 'I was watching TV', translation: 'Ман телевизор тамошо мекардам' },
          { word: 'While I was cooking', translation: 'Вақте ман хӯрок мепухтам' },
          { word: 'It happened suddenly', translation: 'Ин ногаҳон рӯй дод' },
          { word: 'When she arrived', translation: 'Вақте ӯ расид' },
        ],
      },
    ],
  },
  {
    title: 'Experience & Now', titleTranslated: 'Таҷриба ва ҳозира', emoji: '⏱️', color: '#60A5FA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'present_perfect_cont', title: 'Present Perfect Continuous', titleTranslated: 'Ҳозираи комили давомдор', emoji: '⏱️' },
      { skillType: 'grammar', grammarKey: 'just_already_yet', title: 'Just / Already / Yet', titleTranslated: 'Just / Already / Yet', emoji: '✔️' },
      {
        skillType: 'vocab', title: 'Life experiences', titleTranslated: 'Таҷрибаҳои ҳаётӣ', emoji: '🌟',
        words: [
          { word: 'Experience', translation: 'Таҷриба' },
          { word: 'Achieve', translation: 'Ноил шудан' },
          { word: 'Travel abroad', translation: 'Ба хориҷа сафар кардан', emoji: '✈️' },
          { word: 'Learn a skill', translation: 'Малака омӯхтан' },
          { word: 'Recently', translation: 'Ба наздикӣ' },
          { word: 'So far', translation: 'То ҳол' },
          { word: 'Lately', translation: 'Дар вақтҳои охир' },
          { word: 'For a long time', translation: 'Муддати дароз' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: Experiences', titleTranslated: 'Гуфтор: Таҷрибаҳо', emoji: '🎤',
        words: [
          { word: 'I have been learning English', translation: 'Ман англисӣ омӯхта истодаам' },
          { word: 'I have just finished', translation: 'Ман навакак тамом кардам' },
          { word: 'I have already eaten', translation: 'Ман аллакай хӯрдам' },
          { word: 'Have you finished yet', translation: 'Ту ҳанӯз тамом кардӣ' },
        ],
      },
    ],
  },
  {
    title: 'Past Habits', titleTranslated: 'Одатҳои гузашта', emoji: '🕰️', color: '#60A5FA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'used_to', title: 'Used to', titleTranslated: 'Used to', emoji: '🕰️' },
      {
        skillType: 'vocab', title: 'Childhood & change', titleTranslated: 'Кӯдакӣ ва тағйирот', emoji: '🧒',
        words: [
          { word: 'Childhood', translation: 'Кӯдакӣ' },
          { word: 'Memory', translation: 'Хотира' },
          { word: 'Grow up', translation: 'Калон шудан' },
          { word: 'Change', translation: 'Тағйир ёфтан' },
          { word: 'Habit', translation: 'Одат' },
          { word: 'Nowadays', translation: 'Имрӯзҳо' },
          { word: 'In the past', translation: 'Дар гузашта' },
          { word: 'Anymore', translation: 'Дигар (на)' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: When I was young', titleTranslated: 'Гуфтор: Вақте ҷавон будам', emoji: '🎤',
        words: [
          { word: 'I used to play outside', translation: 'Ман пештар берун бозӣ мекардам' },
          { word: 'I didn\'t use to like it', translation: 'Ман пештар инро дӯст намедоштам' },
          { word: 'Things have changed', translation: 'Чизҳо тағйир ёфтаанд' },
          { word: 'Nowadays I work a lot', translation: 'Имрӯзҳо ман зиёд кор мекунам' },
        ],
      },
    ],
  },
  {
    title: 'Conditionals', titleTranslated: 'Шартҳо', emoji: '🔮', color: '#60A5FA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'first_conditional', title: 'First Conditional', titleTranslated: 'Шарти якум', emoji: '🔮' },
      { skillType: 'grammar', grammarKey: 'second_conditional', title: 'Second Conditional', titleTranslated: 'Шарти дуюм', emoji: '💭' },
      {
        skillType: 'vocab', title: 'Dreams & plans', titleTranslated: 'Орзуҳо ва нақшаҳо', emoji: '🌈',
        words: [
          { word: 'Dream', translation: 'Орзу', emoji: '💫' },
          { word: 'Goal', translation: 'Мақсад', emoji: '🎯' },
          { word: 'Succeed', translation: 'Муваффақ шудан' },
          { word: 'Decision', translation: 'Қарор' },
          { word: 'Opportunity', translation: 'Имконият' },
          { word: 'Future', translation: 'Оянда' },
          { word: 'Choose', translation: 'Интихоб кардан' },
          { word: 'Win', translation: 'Бурдан', emoji: '🏆' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: If …', titleTranslated: 'Гуфтор: Агар …', emoji: '🎤',
        words: [
          { word: 'If I have time, I will help', translation: 'Агар вақт дошта бошам, кӯмак мекунам' },
          { word: 'If I were rich, I would travel', translation: 'Агар бой мебудам, сафар мекардам' },
          { word: 'What would you do', translation: 'Ту чӣ кор мекардӣ' },
          { word: 'I would like to succeed', translation: 'Ман мехоҳам муваффақ шавам' },
        ],
      },
    ],
  },
  {
    title: 'Describing Things', titleTranslated: 'Тавсиф кардан', emoji: '🔗', color: '#60A5FA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'relative_clauses', title: 'Relative clauses', titleTranslated: 'Ҷумлаҳои нисбӣ', emoji: '🔗' },
      { skillType: 'grammar', grammarKey: 'comparatives_as_as', title: 'As … as', titleTranslated: 'As … as', emoji: '⚖️' },
      {
        skillType: 'vocab', title: 'Descriptive adjectives', titleTranslated: 'Сифатҳои тавсифӣ', emoji: '🎨',
        words: [
          { word: 'Amazing', translation: 'Аҷоиб' },
          { word: 'Boring', translation: 'Дилгиркунанда' },
          { word: 'Comfortable', translation: 'Бароҳат' },
          { word: 'Dangerous', translation: 'Хатарнок' },
          { word: 'Friendly', translation: 'Дӯстона' },
          { word: 'Useful', translation: 'Фоиданок' },
          { word: 'Crowded', translation: 'Серодам' },
          { word: 'Quiet', translation: 'Ором' },
        ],
      },
      {
        skillType: 'speaking', title: 'Speak: Describe it', titleTranslated: 'Гуфтор: Тавсиф кун', emoji: '🎤',
        words: [
          { word: 'The man who helped me', translation: 'Марде, ки ба ман кӯмак кард' },
          { word: 'This is as good as that', translation: 'Ин ба андозаи он хуб аст' },
          { word: 'The place where I live', translation: 'Ҷое, ки ман зиндагӣ мекунам' },
        ],
      },
    ],
  },
);

CONTENT.modules.push(
  {
    title: 'The Passive', titleTranslated: 'Феъли мафъул', emoji: '🔄', color: '#60A5FA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'passive_present', title: 'Passive (present)', titleTranslated: 'Мафъул (ҳозира)', emoji: '🔄' },
      { skillType: 'grammar', grammarKey: 'passive_past', title: 'Passive (past)', titleTranslated: 'Мафъул (гузашта)', emoji: '🏛️' },
      {
        skillType: 'vocab', title: 'Processes & inventions', titleTranslated: 'Равандҳо ва ихтироот', emoji: '⚙️',
        words: [
          { word: 'Invent', translation: 'Ихтироъ кардан' },
          { word: 'Produce', translation: 'Истеҳсол кардан' },
          { word: 'Build', translation: 'Сохтан', emoji: '🏗️' },
          { word: 'Discover', translation: 'Кашф кардан' },
          { word: 'Design', translation: 'Тарроҳӣ кардан' },
          { word: 'Material', translation: 'Маводд' },
          { word: 'Factory', translation: 'Корхона', emoji: '🏭' },
          { word: 'Machine', translation: 'Мошин/дастгоҳ' },
        ],
      },
      { skillType: 'reading', comprehensionKey: 'technology_life', title: 'Reading: Technology in my life', titleTranslated: 'Хониш: Технология дар ҳаёти ман', emoji: '📖' },
    ],
  },
  {
    title: 'Communication', titleTranslated: 'Муошират', emoji: '🗣️', color: '#60A5FA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'reported_speech', title: 'Reported speech', titleTranslated: 'Нақли қавл', emoji: '🗣️' },
      { skillType: 'grammar', grammarKey: 'question_tags', title: 'Question tags', titleTranslated: 'Саволчаҳои иловагӣ', emoji: '❓' },
      { skillType: 'vocab', phraseKey: 'opinions', title: 'Giving opinions', titleTranslated: 'Баёни фикр', emoji: '💭' },
      { skillType: 'vocab', dialogueKey: 'advice_dlg', title: 'Asking for advice', titleTranslated: 'Пурсидани маслиҳат', emoji: '🤝' },
      {
        skillType: 'speaking', title: 'Speak: Opinions', titleTranslated: 'Гуфтор: Фикрҳо', emoji: '🎤',
        words: [
          { word: 'In my opinion', translation: 'Ба фикри ман' },
          { word: 'I agree with you', translation: 'Ман бо ту розӣ ҳастам' },
          { word: 'He said he was busy', translation: 'Ӯ гуфт, ки банд аст' },
          { word: 'You like it, don\'t you', translation: 'Ту инро дӯст медорӣ, ҳамин тавр не' },
        ],
      },
    ],
  },
  {
    title: 'Verb Patterns & Deduction', titleTranslated: 'Феълҳо ва тахмин', emoji: '🕵️', color: '#60A5FA',
    lessons: [
      { skillType: 'grammar', grammarKey: 'gerund_infinitive', title: 'Gerund / Infinitive', titleTranslated: 'Gerund / Infinitive', emoji: '🔀' },
      { skillType: 'grammar', grammarKey: 'modals_deduction', title: 'Must / Might / Can\'t', titleTranslated: 'Тахмин (must/might/can\'t)', emoji: '🕵️' },
      { skillType: 'vocab', phraseKey: 'suggestions', title: 'Making suggestions', titleTranslated: 'Пешниҳод кардан', emoji: '💡' },
      { skillType: 'vocab', dialogueKey: 'invitation_dlg', title: 'An invitation', titleTranslated: 'Даъват', emoji: '🎉' },
      {
        skillType: 'speaking', title: 'Speak: Suggest & guess', titleTranslated: 'Гуфтор: Пешниҳод ва тахмин', emoji: '🎤',
        words: [
          { word: 'How about going out', translation: 'Берун равем, чӣ' },
          { word: 'I enjoy reading', translation: 'Ман хонданро дӯст медорам' },
          { word: 'She might be at home', translation: 'Шояд ӯ дар хона бошад' },
          { word: 'That can\'t be true', translation: 'Ин наметавонад дуруст бошад' },
        ],
      },
    ],
  },
  {
    title: 'Work & Technology', titleTranslated: 'Кор ва технология', emoji: '💼', color: '#60A5FA',
    lessons: [
      {
        skillType: 'vocab', title: 'Work vocabulary', titleTranslated: 'Луғати корӣ', emoji: '🏢',
        words: [
          { word: 'Job', translation: 'Кор/вазифа' },
          { word: 'Salary', translation: 'Маош', emoji: '💵' },
          { word: 'Colleague', translation: 'Ҳамкор' },
          { word: 'Meeting', translation: 'Вохӯрӣ' },
          { word: 'Deadline', translation: 'Мӯҳлати ниҳоӣ' },
          { word: 'Experience', translation: 'Таҷриба' },
          { word: 'Interview', translation: 'Мусоҳиба' },
          { word: 'Skill', translation: 'Малака' },
        ],
      },
      {
        skillType: 'vocab', title: 'Technology', titleTranslated: 'Технология', emoji: '💻',
        words: [
          { word: 'Computer', translation: 'Компютер', emoji: '💻' },
          { word: 'Internet', translation: 'Интернет', emoji: '🌐' },
          { word: 'Software', translation: 'Нармафзор' },
          { word: 'Download', translation: 'Боргирӣ кардан' },
          { word: 'Screen', translation: 'Экран', emoji: '🖥️' },
          { word: 'Password', translation: 'Рамз' },
          { word: 'Online', translation: 'Онлайн' },
          { word: 'Device', translation: 'Дастгоҳ', emoji: '📱' },
        ],
      },
      { skillType: 'vocab', phraseKey: 'job_work', title: 'Work & interview phrases', titleTranslated: 'Ибораҳои корӣ', emoji: '💼' },
      { skillType: 'vocab', dialogueKey: 'interview_b1', title: 'Job interview', titleTranslated: 'Мусоҳибаи корӣ', emoji: '🗣️' },
      { skillType: 'reading', comprehensionKey: 'my_job', title: 'Reading: My job', titleTranslated: 'Хониш: Кори ман', emoji: '📖' },
    ],
  },
  {
    title: 'Writing & Listening', titleTranslated: 'Навиштан ва шунавоӣ', emoji: '✍️', color: '#F59E0B',
    lessons: [
      {
        skillType: 'listening', title: 'Listen: Key verbs', titleTranslated: 'Шунавоӣ: Феълҳои калидӣ', emoji: '🎧',
        words: [
          { word: 'Decide', translation: 'Қарор додан' },
          { word: 'Improve', translation: 'Беҳтар кардан' },
          { word: 'Discover', translation: 'Кашф кардан' },
          { word: 'Suggest', translation: 'Пешниҳод кардан' },
        ],
      },
      {
        skillType: 'listening', title: 'Listen: Work & tech', titleTranslated: 'Шунавоӣ: Кор ва технология', emoji: '🎧',
        words: [
          { word: 'Experience', translation: 'Таҷриба' },
          { word: 'Colleague', translation: 'Ҳамкор' },
          { word: 'Software', translation: 'Нармафзор' },
          { word: 'Interview', translation: 'Мусоҳиба' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Key verbs', titleTranslated: 'Навиштан: Феълҳои калидӣ', emoji: '✍️',
        words: [
          { word: 'Decide', translation: 'Қарор додан' },
          { word: 'Achieve', translation: 'Ноил шудан' },
          { word: 'Improve', translation: 'Беҳтар кардан' },
          { word: 'Discover', translation: 'Кашф кардан' },
          { word: 'Suggest', translation: 'Пешниҳод кардан' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Sentences', titleTranslated: 'Навиштан: Ҷумлаҳо', emoji: '✍️',
        words: [
          { word: 'If I had time, I would travel', translation: 'Агар вақт медоштам, сафар мекардам' },
          { word: 'I have been learning English', translation: 'Ман англисӣ омӯхта истодаам' },
          { word: 'The book was written in 1990', translation: 'Китоб соли 1990 навишта шуд' },
        ],
      },
      {
        skillType: 'writing', title: 'Write: Work & technology', titleTranslated: 'Навиштан: Кор ва технология', emoji: '✍️',
        words: [
          { word: 'Experience', translation: 'Таҷриба' },
          { word: 'Colleague', translation: 'Ҳамкор' },
          { word: 'Software', translation: 'Нармафзор' },
          { word: 'Interview', translation: 'Мусоҳиба' },
          { word: 'Deadline', translation: 'Мӯҳлати ниҳоӣ' },
        ],
      },
    ],
  },
  {
    title: 'Travel & Review', titleTranslated: 'Сафар ва такрор', emoji: '🧳', color: '#60A5FA',
    lessons: [
      {
        skillType: 'vocab', title: 'Travel & transport', titleTranslated: 'Сафар ва нақлиёт', emoji: '🚆',
        words: [
          { word: 'Journey', translation: 'Сафар' },
          { word: 'Platform', translation: 'Платформа' },
          { word: 'Return ticket', translation: 'Чиптаи рафту баргашт' },
          { word: 'Delay', translation: 'Дермонӣ' },
          { word: 'Luggage', translation: 'Бағоҷ', emoji: '🧳' },
          { word: 'Abroad', translation: 'Хориҷа' },
          { word: 'Book (reserve)', translation: 'Банд кардан' },
          { word: 'Passenger', translation: 'Мусофир' },
        ],
      },
      { skillType: 'vocab', phraseKey: 'travel_b1', title: 'Travel phrases', titleTranslated: 'Ибораҳои сафар', emoji: '🗺️' },
      { skillType: 'vocab', dialogueKey: 'complaint_dlg', title: 'Making a complaint', titleTranslated: 'Шикоят кардан', emoji: '⚠️' },
      { skillType: 'grammar', grammarKey: 'quantifiers_b1', title: 'Too much / many / enough', titleTranslated: 'Миқдор (too much/many)', emoji: '📊' },
      {
        skillType: 'review', type: 'quiz', title: 'B1 Review', titleTranslated: 'Такрори B1', emoji: '🏆', xpReward: 120,
        words: [
          { word: 'Was watching', translation: 'Тамошо мекард' },
          { word: 'Have been working', translation: 'Кор карда истодааст' },
          { word: 'Used to', translation: 'Пештар (одат)' },
          { word: 'If I were you', translation: 'Агар ҷои ту мебудам' },
          { word: 'Was built', translation: 'Сохта шуд' },
          { word: 'He said that', translation: 'Ӯ гуфт, ки' },
          { word: 'Might be', translation: 'Шояд бошад' },
          { word: 'As tall as', translation: 'Ба андозаи баланд' },
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

