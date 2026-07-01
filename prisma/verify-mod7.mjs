import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkModule() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });
  const m = await prisma.module.findFirst({ where: { order: 7, courseId: course.id }, include: { lessons: true } });
  if (!m) { console.log('Mod 7 not found'); return; }

  const lessons = m.lessons;
  const lessonIds = lessons.map(l => l.id);

  const words = await prisma.word.findMany({ where: { lessonId: { in: lessonIds } } });
  const uniqueWordsCount = new Set(words.map(w => w.word.toLowerCase().trim())).size;
  
  const grammarIds = lessons.filter(l => l.grammarTopicId).map(l => l.grammarTopicId);
  const grammars = await prisma.grammarTopic.count({ where: { id: { in: grammarIds } } });

  const compIds = lessons.filter(l => l.comprehensionId).map(l => l.comprehensionId);
  const comps = await prisma.comprehensionExercise.count({ where: { id: { in: compIds } } });

  const diaIds = lessons.filter(l => l.dialogueId).map(l => l.dialogueId);
  const dias = await prisma.dialogue.count({ where: { id: { in: diaIds } } });

  console.log(`Lessons: ${lessons.length}`);
  console.log(`Module Vocabulary Count: ${words.length}`);
  console.log(`Unique Vocabulary Count: ${uniqueWordsCount}`);
  console.log(`Grammar Topics Added: ${grammars}`);
  console.log(`Comprehensions Added: ${comps}`);
  console.log(`Number Of Dialogues: ${dias}`);
}

checkModule().catch(e=>console.error(e)).finally(()=>prisma.$disconnect());
