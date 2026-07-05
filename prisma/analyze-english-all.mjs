import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const has = (u) => typeof u === 'string' && u.trim().length > 0;

async function main() {
  const courses = await prisma.course.findMany({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } },
    orderBy: { order: 'asc' },
  });

  console.log(`\n===== КУРСҲОИ АНГЛИСӢ (en → tg) =====`);
  console.log(`Ҳамагӣ курс (сатҳ): ${courses.length} → ${courses.map(c => c.level).join(', ')}\n`);

  for (const course of courses) {
    const modules = await prisma.module.findMany({
      where: { courseId: course.id },
      orderBy: { order: 'asc' },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { words: true },
        },
      },
    });

    console.log(`\n########## СATҲ ${course.level} — "${course.title}" (${course.titleTranslated}) ##########`);
    console.log(`Модул: ${modules.length}, Дарс: ${modules.reduce((a, m) => a + m.lessons.length, 0)}`);

    let courseIssues = [];

    for (const m of modules) {
      console.log(`\n-- Модул ${m.order}: ${m.title} / ${m.titleTranslated} (${m.lessons.length} дарс)${m.isActive ? '' : '  [ФАЪОЛ НЕСТ]'}`);
      for (const l of m.lessons) {
        const issues = [];
        if (!l.isActive) issues.push('ФАЪОЛ НЕСТ');
        if (l.skillType === 'vocab' || l.skillType === 'reading') {
          if (l.words.length === 0) issues.push('ХОЛӢ (калима нест)');
          else {
            const badWords = l.words.filter(w =>
              !has(w.translation) || !has(w.ipa) || !has(w.ipaTajik) || !has(w.emoji) || !has(w.example) || !has(w.exampleTrans)
            );
            if (badWords.length > 0) issues.push(`${badWords.length}/${l.words.length} калима бо майдони холӣ`);
            const noAudio = l.words.filter(w => !has(w.audioUrl)).length;
            if (noAudio > 0) issues.push(`${noAudio}/${l.words.length} бидуни аудио`);
          }
        }
        if (l.skillType === 'grammar' && !l.grammarTopicId) issues.push('grammarTopic пайваст нест');
        if (l.skillType === 'speaking' && !l.dialogueId) issues.push('dialogue пайваст нест');
        if ((l.skillType === 'reading' || l.skillType === 'listening') && !l.comprehensionId) issues.push('comprehension пайваст нест');
        if (!has(l.emoji)) issues.push('emoji нест');

        const tag = issues.length ? `  ⚠️  ${issues.join('; ')}` : '  ✅';
        console.log(`   [${l.order}] ${l.skillType.padEnd(9)} "${l.title}" / ${l.titleTranslated}${tag}`);
        if (issues.length) courseIssues.push({ module: m.title, lesson: l.title, issues });
      }
    }

    // grammar topics / dialogues / comprehension not linked to any lesson
    const grammarTopics = await prisma.grammarTopic.findMany({ where: { courseId: course.id }, include: { exercises: true, lessons: true } });
    const orphanGrammar = grammarTopics.filter(g => g.lessons.length === 0);
    const noExGrammar = grammarTopics.filter(g => g.exercises.length === 0);
    const dialogues = await prisma.dialogue.findMany({ where: { courseId: course.id }, include: { lines: true, lessons: true } });
    const orphanDialogues = dialogues.filter(d => d.lessons.length === 0);
    const comps = await prisma.comprehensionExercise.findMany({ where: { courseId: course.id }, include: { questions: true, lessons: true } });
    const orphanComps = comps.filter(c => c.lessons.length === 0);

    console.log(`\n-- Хулосаи сатҳи ${course.level} --`);
    console.log(`Мавзӯи грамматика: ${grammarTopics.length} (бе машқ: ${noExGrammar.length}, ба дарс пайваст нашуда: ${orphanGrammar.length})`);
    console.log(`Муколама: ${dialogues.length} (ба дарс пайваст нашуда: ${orphanDialogues.length})`);
    console.log(`Comprehension (reading/listening): ${comps.length} (ба дарс пайваст нашуда: ${orphanComps.length})`);
    console.log(`Дарсҳои дорои мушкилот: ${courseIssues.length}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
