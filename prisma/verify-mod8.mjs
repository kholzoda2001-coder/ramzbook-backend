import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkModule() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });
  const m = await prisma.module.findFirst({ where: { order: 8, courseId: course.id }, include: { lessons: true } });
  if (!m) { console.log('Mod 8 not found'); return; }

  const lessons = m.lessons;
  const lessonIds = lessons.map(l => l.id);

  const words = await prisma.word.findMany({ where: { lessonId: { in: lessonIds } } });
  
  // Calculate unique words in this module
  const uniqueWordsInModule = new Set(words.map(w => w.word.toLowerCase().trim())).size;
  
  const grammarIds = lessons.filter(l => l.grammarTopicId).map(l => l.grammarTopicId);
  const grammars = await prisma.grammarTopic.count({ where: { id: { in: grammarIds } } });

  const compIds = lessons.filter(l => l.comprehensionId).map(l => l.comprehensionId);
  const comps = await prisma.comprehensionExercise.count({ where: { id: { in: compIds } } });

  const diaIds = lessons.filter(l => l.dialogueId).map(l => l.dialogueId);
  const dias = await prisma.dialogue.count({ where: { id: { in: diaIds } } });

  // Get course-wide counts
  const allModules = await prisma.module.findMany({ where: { courseId: course.id }, include: { lessons: true } });
  const allLessonIds = allModules.flatMap(am => am.lessons.map(l => l.id));
  const allWords = await prisma.word.findMany({ where: { lessonId: { in: allLessonIds } } });
  const courseUniqueWords = new Set(allWords.map(w => w.word.toLowerCase().trim())).size;
  const courseGrammars = await prisma.grammarTopic.count({ where: { courseId: course.id } });
  const courseDialogues = await prisma.dialogue.count({ where: { courseId: course.id } });

  console.log(`--- MODULE 8 STATS ---`);
  console.log(`Module Vocabulary Count: ${words.length}`);
  console.log(`Unique Vocabulary in Module: ${uniqueWordsInModule}`);
  console.log(`Grammar Topics Added: ${grammars}`);
  console.log(`Dialogues Added: ${dias}`);
  console.log(`Comprehensions Added: ${comps}`);
  console.log(`\n--- COURSE STATS (Modules 1-8) ---`);
  console.log(`Total Course Vocabulary (Raw): ${allWords.length}`);
  console.log(`Total Course Vocabulary (Unique): ${courseUniqueWords}`);
  console.log(`Total Course Grammar Topics: ${courseGrammars}`);
  console.log(`Total Course Dialogues: ${courseDialogues}`);
}

checkModule().catch(e=>console.error(e)).finally(()=>prisma.$disconnect());
