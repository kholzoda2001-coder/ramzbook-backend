import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function checkModule5() {
  const m = await prisma.module.findFirst({ where: { order: 5 }, include: { lessons: true } });
  if (!m) { console.log('Mod 5 not found'); return; }

  const lessons = m.lessons;
  const lessonIds = lessons.map(l => l.id);

  const words = await prisma.word.count({ where: { lessonId: { in: lessonIds } } });
  
  const grammarIds = lessons.filter(l => l.grammarTopicId).map(l => l.grammarTopicId);
  const grammars = await prisma.grammarTopic.count({ where: { id: { in: grammarIds } } });

  const compIds = lessons.filter(l => l.comprehensionId).map(l => l.comprehensionId);
  const comps = await prisma.comprehensionExercise.count({ where: { id: { in: compIds } } });

  const diaIds = lessons.filter(l => l.dialogueId).map(l => l.dialogueId);
  const dias = await prisma.dialogue.count({ where: { id: { in: diaIds } } });

  console.log(`Lessons: ${lessons.length}`);
  console.log(`Words: ${words}`);
  console.log(`Grammars: ${grammars}`);
  console.log(`Comprehensions: ${comps}`);
  console.log(`Dialogues: ${dias}`);
}

checkModule5().catch(e=>console.error(e)).finally(()=>prisma.$disconnect());
