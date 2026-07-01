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
            include: {
              words: { orderBy: { order: 'asc' } },
              grammarTopic: { include: { rules: true, examples: true, exercises: true } },
              phraseCollection: { include: { phrases: true } },
              dialogue: { include: { lines: true } },
              comprehension: { include: { questions: true } },
            }
          }
        }
      }
    }
  });

  if (!course) { console.log('A1 EN->TG course NOT FOUND'); return; }

  console.log('############ COURSE ############');
  console.log(`title=${course.title} level=${course.level} modules=${course.modules.length}`);

  let totalLessons = 0, totalWords = 0;
  const skillCount = {};
  const allWords = [];
  let wordsNoExample = 0, wordsNoIpa = 0, wordsNoAudio = 0, wordsNoEmoji = 0;

  for (const m of course.modules) {
    console.log(`\n===== MODULE ${m.order}: ${m.title} / ${m.titleTranslated} (premium=${m.isPremium} boss=${m.isBoss}) lessons=${m.lessons.length} =====`);
    for (const l of m.lessons) {
      totalLessons++;
      skillCount[l.skillType] = (skillCount[l.skillType] || 0) + 1;
      let extra = '';
      if (l.grammarTopic) extra = `GRAMMAR[rules=${l.grammarTopic.rules.length} ex=${l.grammarTopic.examples.length} exer=${l.grammarTopic.exercises.length}]`;
      if (l.phraseCollection) extra = `PHRASES[${l.phraseCollection.phrases.length}]`;
      if (l.dialogue) extra = `DIALOGUE[lines=${l.dialogue.lines.length}]`;
      if (l.comprehension) extra = `READING[q=${l.comprehension.questions.length}]`;
      console.log(`  L${l.order} [${l.skillType}] ${l.title} / ${l.titleTranslated} | words=${l.words.length} xp=${l.xpReward} ${extra}`);
      for (const w of l.words) {
        totalWords++;
        allWords.push(w.word.toLowerCase().trim());
        if (!w.example) wordsNoExample++;
        if (!w.ipa) wordsNoIpa++;
        if (!w.audioUrl) wordsNoAudio++;
        if (!w.emoji) wordsNoEmoji++;
      }
    }
  }

  console.log('\n############ TOTALS ############');
  console.log(`lessons=${totalLessons} words(total occurrences)=${totalWords}`);
  console.log('skill distribution:', JSON.stringify(skillCount));
  const unique = new Set(allWords);
  console.log(`unique word forms=${unique.size}`);
  console.log(`words missing example=${wordsNoExample} missing IPA=${wordsNoIpa} missing audio=${wordsNoAudio} missing emoji=${wordsNoEmoji}`);

  // duplicates across course
  const freq = {};
  for (const w of allWords) freq[w] = (freq[w]||0)+1;
  const dups = Object.entries(freq).filter(([,c])=>c>1).sort((a,b)=>b[1]-a[1]);
  console.log(`duplicated word forms across course: ${dups.length}`);
  console.log('top dups:', JSON.stringify(dups.slice(0,25)));

  // CEFR descriptors
  const desc = await prisma.cefrDescriptor.findMany({
    where: { targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'}, cefrLevel:'A1' },
    orderBy:{ order:'asc' }
  });
  console.log(`\n############ CEFR DESCRIPTORS (A1): ${desc.length} ############`);
  for (const d of desc) console.log(`  [${d.skill}] ${d.canDo}`);

  // Placement
  const plc = await prisma.placementQuestion.findMany({
    where: { targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'} }
  });
  const byLevel = {};
  for (const p of plc) byLevel[p.cefrLevel]=(byLevel[p.cefrLevel]||0)+1;
  console.log(`\n############ PLACEMENT QUESTIONS: ${plc.length} ############`);
  console.log('by level:', JSON.stringify(byLevel));

  // Onboarding
  const onb = await prisma.onboardingWord.count({ where:{ targetLanguage:{code:'en'}, nativeLanguage:{code:'tg'} } });
  console.log(`\nOnboarding words: ${onb}`);
}

main().catch(console.error).finally(()=>prisma.$disconnect());
