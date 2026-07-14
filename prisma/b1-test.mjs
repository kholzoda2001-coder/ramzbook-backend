import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  let b1Course;
  for(let i=0; i<10; i++) {
    try {
      b1Course = await prisma.course.findFirst({
        where: { level: 'B1' },
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  words: true,
                  grammarTopic: true,
                  dialogue: { include: { lines: true } },
                  comprehension: true
                }
              }
            }
          }
        }
      });
      break;
    } catch(e) {
      console.log('Retry test connection...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  if (!b1Course) {
    console.error('❌ B1 course not found!');
    return;
  }

  console.log(`✅ Course found: ${b1Course.title}`);
  console.log(`📦 Modules count: ${b1Course.modules.length}`);

  const m1 = b1Course.modules.find(m => m.order === 1);
  if (!m1) {
    console.error('❌ Module 1 not found!');
    return;
  }

  console.log(`✅ Module 1 found: ${m1.titleTranslated}`);
  console.log(`📚 Lessons count: ${m1.lessons.length}`);
  
  let wordCount = 0;
  let hasGrammar = false;
  let hasDialogue = false;
  let hasListening = false;

  m1.lessons.forEach(lesson => {
    wordCount += lesson.words.length;
    if (lesson.grammarTopic) hasGrammar = true;
    if (lesson.dialogue) hasDialogue = true;
    if (lesson.skillType === 'listening') hasListening = true;
  });

  console.log(`📝 Total words inserted: ${wordCount}`);
  console.log(`🧠 Grammar topic attached: ${hasGrammar ? '✅' : '❌'}`);
  console.log(`🗣️ Dialogue attached: ${hasDialogue ? '✅' : '❌'}`);
  console.log(`🎧 Listening/Comprehension attached: ${hasListening ? '✅' : '❌'}`);
}

test()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
