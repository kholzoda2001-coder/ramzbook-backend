import { PrismaClient } from '@prisma/client';
import fs from 'fs';

const prisma = new PrismaClient();

async function exportToMarkdown(moduleOrder, filename) {
  const course = await prisma.course.findFirst({
    where: { targetLanguage: { code: 'en' }, nativeLanguage: { code: 'tg' } }
  });

  const mod = await prisma.module.findFirst({
    where: { courseId: course.id, order: moduleOrder },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        include: {
          words: { orderBy: { order: 'asc' } },
          grammarTopic: {
            include: {
              examples: { orderBy: { order: 'asc' } },
              rules: { orderBy: { order: 'asc' } },
              exercises: { orderBy: { order: 'asc' } }
            }
          },
          phraseCollection: {
            include: { phrases: { orderBy: { order: 'asc' } } }
          },
          dialogue: {
            include: { lines: { orderBy: { order: 'asc' } } }
          },
          comprehension: {
            include: { questions: { orderBy: { order: 'asc' } } }
          }
        }
      }
    }
  });

  if (!mod) {
    console.log(`Module with order ${moduleOrder} not found.`);
    return;
  }

  let md = `# ${mod.title} (${mod.titleTranslated})\n\n`;

  for (const lesson of mod.lessons) {
    md += `## Lesson ${lesson.order + 1}: ${lesson.title} (${lesson.titleTranslated})\n`;
    md += `**Skill Type:** ${lesson.skillType} | **Type:** ${lesson.type}\n\n`;

    if (lesson.words.length > 0) {
      md += `### Vocabulary\n`;
      for (const w of lesson.words) {
        md += `- **${w.word}** (${w.ipa}) - ${w.translation}\n`;
        if (w.example) {
          md += `  *Example:* ${w.example} - ${w.exampleTrans}\n`;
        }
      }
      md += `\n`;
    }

    if (lesson.grammarTopic) {
      const g = lesson.grammarTopic;
      md += `### Grammar: ${g.title} (${g.titleTranslated})\n`;
      md += `**Explanation:**\n${g.explanation}\n\n`;
      
      if (g.rules.length > 0) {
        md += `**Rules:**\n`;
        for (const r of g.rules) {
          md += `- ${r.pattern} (${r.note})\n`;
        }
        md += `\n`;
      }

      if (g.examples.length > 0) {
        md += `**Examples:**\n`;
        for (const e of g.examples) {
          md += `- ${e.sentence} - ${e.translation}\n`;
        }
        md += `\n`;
      }
    }

    if (lesson.phraseCollection) {
      const p = lesson.phraseCollection;
      md += `### Phrases: ${p.title} (${p.titleTranslated})\n`;
      for (const ph of p.phrases) {
        md += `- **${ph.text}** - ${ph.translation}\n`;
      }
      md += `\n`;
    }

    if (lesson.dialogue) {
      const d = lesson.dialogue;
      md += `### Dialogue: ${d.title} (${d.titleTranslated})\n`;
      if (d.scenario) md += `*Scenario: ${d.scenario}*\n\n`;
      for (const l of d.lines) {
        md += `- **${l.speaker}**: ${l.text}\n  *(${l.translation})*\n`;
      }
      md += `\n`;
    }

    if (lesson.comprehension) {
      const c = lesson.comprehension;
      md += `### Comprehension / Test: ${c.title} (${c.titleTranslated})\n`;
      md += `**Passage:**\n${c.passage}\n*(${c.passageTranslated})*\n\n`;
      md += `**Questions:**\n`;
      for (const q of c.questions) {
        md += `- ${q.question} (${q.questionTranslated})\n`;
        const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options);
        for (let i = 0; i < options.length; i++) {
          md += `  ${i === q.correctIndex ? '[x]' : '[ ]'} ${options[i]}\n`;
        }
        if (q.explanation) md += `  *Explanation: ${q.explanation}*\n`;
      }
      md += `\n`;
    }
    
    md += `---\n\n`;
  }

  fs.writeFileSync(filename, md);
  console.log(`Exported Module ${moduleOrder + 1} to ${filename}`);
}

async function main() {
  await exportToMarkdown(0, 'review-module1.md');
  await exportToMarkdown(1, 'review-module2.md');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
