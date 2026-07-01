import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' }, level: 'A1' },
    include: {
      modules: {
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { words: { orderBy: { order: 'asc' } } }
          }
        }
      }
    }
  });

  if (!course) {
    console.log("Course not found!");
    return;
  }

  let totalWords = 0;
  const duplicateCheck = new Map();
  const duplicates = [];

  console.log(`Course: ${course.title} (${course.level})`);
  console.log("==================================================");

  course.modules.forEach((mod, modIdx) => {
    console.log(`\nModule ${modIdx + 1}: ${mod.title}`);
    let modWords = 0;

    mod.lessons.forEach((lesson, lessIdx) => {
      const wCount = lesson.words.length;
      modWords += wCount;
      totalWords += wCount;

      console.log(`  Lesson ${lessIdx + 1}: ${lesson.title} - ${wCount} words`);
      if (wCount > 0) {
        const wordList = lesson.words.map(w => w.word);
        console.log(`    [${wordList.join(', ')}]`);
        
        // check duplicates
        lesson.words.forEach(w => {
          const lowerWord = w.word.toLowerCase();
          if (duplicateCheck.has(lowerWord)) {
            duplicates.push({ word: w.word, mod1: duplicateCheck.get(lowerWord), mod2: `M${modIdx+1}L${lessIdx+1}` });
          } else {
            duplicateCheck.set(lowerWord, `M${modIdx+1}L${lessIdx+1}`);
          }
        });
      } else {
        console.log(`    (Empty or non-vocab lesson)`);
      }
    });

    console.log(`  -> Module ${modIdx + 1} Total Words: ${modWords}`);
  });

  console.log("\n==================================================");
  console.log(`Overall Total Words: ${totalWords}`);
  
  if (duplicates.length > 0) {
    console.log("\nDuplicates found:");
    duplicates.forEach(d => console.log(`  ${d.word} (first seen in ${d.mod1}, repeated in ${d.mod2})`));
  } else {
    console.log("\nNo cross-lesson duplicates found.");
  }

}

main().finally(() => prisma.$disconnect());
