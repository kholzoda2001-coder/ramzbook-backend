import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const has = (u) => typeof u === 'string' && u.trim().length > 0;

// ── Official CEFR A2 targets (Cambridge A2 Key / English Profile / examenglish) ──
const TARGET = {
  vocabulary: 700,   // ~600–750 NEW words at A2 (cumulative ~1000–1500)
  grammar: 25,       // 25 core A2 structures (examenglish.com list)
  reading: 12,
  listening: 12,
  speaking: 12,
  writing: 8,
  reallife: 12,
};

// The 25 A2 grammar structures we must cover (for a checklist).
const A2_GRAMMAR = [
  'past simple', 'past continuous', 'present perfect', 'comparative', 'superlative',
  'going to', 'will', 'gerund', 'adverbs of frequency', 'much many', 'countable',
  'should', 'have to', 'could', 'phrasal verb', 'zero conditional', 'first conditional',
  'present continuous future', 'prepositions of time', 'possessive', 'imperative',
  'questions past', 'like want would like', 'quantifiers', 'adverbs',
];

async function main() {
  const c = await prisma.course.findFirst({ where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A2' } });
  if (!c) { console.log('Курси A2 НЕСТ'); return; }

  const modules = await prisma.module.count({ where: { courseId: c.id } });
  const lessons = await prisma.lesson.findMany({ where: { module: { courseId: c.id } }, select: { skillType: true, words: { select: { id: true } } } });
  const bySkill = {}; for (const l of lessons) bySkill[l.skillType] = (bySkill[l.skillType] || 0) + 1;

  const words = await prisma.word.findMany({ where: { lesson: { module: { courseId: c.id } } }, select: { word: true, ipa: true, ipaTajik: true, translation: true, emoji: true, example: true, exampleTrans: true, audioUrl: true } });
  const unique = new Set(words.map(w => w.word.toLowerCase().trim())).size;
  const fullFields = words.filter(w => has(w.ipa) && has(w.ipaTajik) && has(w.translation) && has(w.emoji) && has(w.example) && has(w.exampleTrans)).length;

  const topics = await prisma.grammarTopic.findMany({ where: { courseId: c.id }, include: { exercises: true } });
  const topicsWithEx = topics.filter(t => t.exercises.length > 0).length;
  const grammarExercises = topics.reduce((a, t) => a + t.exercises.length, 0);

  const comps = await prisma.comprehensionExercise.findMany({ where: { courseId: c.id }, include: { questions: true } });
  const reading = comps.filter(x => x.kind === 'reading');
  const listening = comps.filter(x => x.kind === 'listening');
  const dialogues = await prisma.dialogue.findMany({ where: { courseId: c.id }, include: { lines: true } });

  const examLessons = lessons.filter(l => l.skillType === 'test').length;
  const reviewLessons = lessons.filter(l => l.skillType === 'review').length;

  // grammar checklist coverage
  const topicText = topics.map(t => (t.title + ' ' + t.titleTranslated).toLowerCase()).join(' | ');
  const covered = A2_GRAMMAR.filter(g => g.split(' ').some(w => topicText.includes(w)));

  const pct = (x, t) => Math.min(100, Math.round(x / t * 100));
  const cov = {
    vocabulary: pct(unique, TARGET.vocabulary),
    grammar: pct(topicsWithEx, TARGET.grammar),
    reading: pct(reading.length, TARGET.reading),
    listening: pct(listening.length, TARGET.listening),
    speaking: pct(dialogues.length, TARGET.speaking),
    writing: pct(lessons.filter(l => l.skillType === 'writing').length + Math.floor(grammarExercises / 20), TARGET.writing),
    reallife: pct(dialogues.length, TARGET.reallife),
  };
  const W = { vocabulary: 0.20, grammar: 0.20, reading: 0.13, listening: 0.13, speaking: 0.12, writing: 0.10, reallife: 0.12 };
  const overall = Object.entries(cov).reduce((a, [k, v]) => a + v * W[k], 0);

  console.log('═══════ АУДИТИ A2 (en→tg) ═══════');
  console.log(JSON.stringify({
    structure: { modules, lessons: lessons.length, bySkill, examLessons, reviewLessons },
    vocabulary: { total: words.length, unique, fullSevenFields: fullFields },
    grammar: { topics: topics.length, withExercises: topicsWithEx, exercises: grammarExercises },
    reading: { count: reading.length, questions: reading.reduce((a, x) => a + x.questions.length, 0) },
    listening: { count: listening.length },
    speaking: { dialogues: dialogues.length, lines: dialogues.reduce((a, d) => a + d.lines.length, 0) },
    coveragePct: cov,
    overallA2Pct: Math.round(overall),
    grammarChecklist: { covered: covered.length, of: A2_GRAMMAR.length, missing: A2_GRAMMAR.filter(g => !covered.includes(g)) },
    TARGET,
  }, null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
