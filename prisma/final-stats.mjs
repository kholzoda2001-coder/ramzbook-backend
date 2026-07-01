import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' }
  });

  if (!course) return;

  const modules = await prisma.module.count({ where: { courseId: course.id } });
  const lessons = await prisma.lesson.count({ where: { module: { courseId: course.id } } });
  
  const allWords = await prisma.word.findMany({ where: { lesson: { module: { courseId: course.id } } } });
  const totalVocab = allWords.length;
  
  const uniqueWords = new Set(allWords.map(w => w.word.toLowerCase()));
  const uniqueVocab = uniqueWords.size;

  const grammarTopics = await prisma.grammarTopic.count({ where: { courseId: course.id } });
  const dialogues = await prisma.dialogue.count({ where: { courseId: course.id } });
  const comprehensions = await prisma.comprehensionExercise.count({ where: { courseId: course.id } });

  console.log(`Final Verification Stats (Modules 1-4)`);
  console.log(`========================================`);
  console.log(`Modules: ${modules}`);
  console.log(`Lessons: ${lessons}`);
  console.log(`Total Vocabulary: ${totalVocab} (including spaced repetition)`);
  console.log(`Unique Vocabulary: ${uniqueVocab}`);
  console.log(`Grammar Topics: ${grammarTopics}`);
  console.log(`Dialogues: ${dialogues}`);
  console.log(`Comprehension Quizzes/Readings: ${comprehensions}`);
}

main().finally(() => prisma.$disconnect());
