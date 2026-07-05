import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const has = (u) => typeof u === 'string' && u.trim().length > 0;

async function main() {
  const c = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
  });

  const modules = await prisma.module.findMany({
    where: { courseId: c.id },
    orderBy: { order: 'asc' },
    include: { lessons: { orderBy: { order: 'asc' }, include: { words: true } } },
  });

  const allWords = await prisma.word.findMany({ where: { lesson: { module: { courseId: c.id } } } });
  const uniqueWords = new Set(allWords.map(w => w.word.toLowerCase().trim()));

  // sentences = example sentences on words + grammar examples + dialogue lines + comprehension passages
  const wordsWithExample = allWords.filter(w => has(w.example)).length;
  const grammarTopics = await prisma.grammarTopic.findMany({ where: { courseId: c.id }, include: { exercises: true, examples: true, rules: true } });
  const grammarExamples = grammarTopics.reduce((a, t) => a + t.examples.length, 0);
  const grammarRules = grammarTopics.reduce((a, t) => a + t.rules.length, 0);
  const grammarExercises = grammarTopics.reduce((a, t) => a + t.exercises.length, 0);
  const dialogues = await prisma.dialogue.findMany({ where: { courseId: c.id }, include: { lines: true } });
  const dialogueLines = dialogues.reduce((a, d) => a + d.lines.length, 0);
  const comps = await prisma.comprehensionExercise.findMany({ where: { courseId: c.id }, include: { questions: true } });
  const compQuestions = comps.reduce((a, x) => a + x.questions.length, 0);

  // exercise type distribution
  const exTypes = {};
  for (const t of grammarTopics) for (const e of t.exercises) exTypes[e.type] = (exTypes[e.type] || 0) + 1;

  // skill distribution
  const bySkill = {};
  for (const m of modules) for (const l of m.lessons) bySkill[l.skillType] = (bySkill[l.skillType] || 0) + 1;

  // per-module word counts
  console.log('===== ТАҲЛИЛИ ЧУҚУРИ A1 (en→tg) =====\n');
  console.log('Модул         | Дарс | Калима | Мавзӯи-грамматика-в-дарс');
  for (const m of modules) {
    const w = m.lessons.reduce((a, l) => a + l.words.length, 0);
    const g = m.lessons.filter(l => l.skillType === 'grammar').length;
    console.log(`M${String(m.order).padEnd(2)} ${m.title.slice(0,22).padEnd(22)} | ${String(m.lessons.length).padStart(3)} | ${String(w).padStart(5)} | ${g}`);
  }

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const totalSentences = wordsWithExample + grammarExamples + dialogueLines + comps.reduce((a,x)=>a+(has(x.passage)?1:0),0);

  console.log('\n===== ҶАМЪБАСТ =====');
  console.log('Модул (units):        ', modules.length);
  console.log('Дарс (lessons):       ', totalLessons);
  console.log('Тақсими дарс аз рӯи skill:', JSON.stringify(bySkill));
  console.log('Калима (умумӣ):       ', allWords.length);
  console.log('Калима (ягона):       ', uniqueWords.size);
  console.log('Калима бо ҷумлаи мисол:', wordsWithExample);
  console.log('\nГрамматика — мавзӯъ:  ', grammarTopics.length);
  console.log('Грамматика — қоида:   ', grammarRules);
  console.log('Грамматика — мисол:   ', grammarExamples);
  console.log('Грамматика — машқ:    ', grammarExercises);
  console.log('Навъҳои машқи грамматика:', JSON.stringify(exTypes));
  console.log('\nМуколама (dialogues): ', dialogues.length, '| сатр:', dialogueLines);
  console.log('Comprehension:        ', comps.length, '| савол:', compQuestions);
  console.log('\nҶУМЛА (ҳамагӣ ≈):     ', totalSentences,
    `(мисоли калима ${wordsWithExample} + грамматика ${grammarExamples} + муколама ${dialogueLines} + матни хониш ${comps.length})`);

  await prisma.$disconnect();
}
main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
