import fs from 'fs';

function auditModule(filename) {
  const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  console.log(`\n=== Auditing ${filename} ===`);
  console.log(`Module: ${data.title} (${data.titleTranslated})`);
  
  let issues = 0;
  
  for (const lesson of data.lessons) {
    // Check basic lesson info
    if (!lesson.title || !lesson.titleTranslated) {
      console.log(`[Lesson ${lesson.order}] Missing title or translation`);
      issues++;
    }
    
    // Check words
    if (lesson.words && lesson.words.length > 0) {
      for (const w of lesson.words) {
        if (!w.word || !w.translation) {
          console.log(`[Lesson ${lesson.order}] Word missing text or translation: ${JSON.stringify(w)}`);
          issues++;
        }
        if (!w.ipa || !w.ipaTajik) {
          console.log(`[Lesson ${lesson.order}] Word missing IPA: ${w.word}`);
          issues++;
        }
      }
    }
    
    // Check grammar
    if (lesson.grammarTopic) {
      const g = lesson.grammarTopic;
      if (!g.title || !g.titleTranslated || !g.explanation) {
         console.log(`[Lesson ${lesson.order}] Grammar missing title or explanation`);
         issues++;
      }
      if (!g.examples || g.examples.length === 0) {
        console.log(`[Lesson ${lesson.order}] Grammar has no examples`);
        issues++;
      }
      if (!g.exercises || g.exercises.length === 0) {
        console.log(`[Lesson ${lesson.order}] Grammar has no exercises`);
        issues++;
      }
    }
    
    // Check dialogues
    if (lesson.dialogue) {
      const d = lesson.dialogue;
      if (!d.lines || d.lines.length === 0) {
        console.log(`[Lesson ${lesson.order}] Dialogue has no lines`);
        issues++;
      } else {
        let userLines = d.lines.filter(l => l.isUser);
        if (userLines.length === 0) {
          console.log(`[Lesson ${lesson.order}] Dialogue has no user lines`);
          issues++;
        }
      }
    }
    
    // Check comprehension
    if (lesson.comprehension) {
      const c = lesson.comprehension;
      if (!c.passage || !c.passageTranslated) {
        console.log(`[Lesson ${lesson.order}] Comprehension missing passage`);
        issues++;
      }
      if (!c.questions || c.questions.length === 0) {
        console.log(`[Lesson ${lesson.order}] Comprehension missing questions`);
        issues++;
      } else {
        for (const q of c.questions) {
          if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
            console.log(`[Lesson ${lesson.order}] Comprehension question invalid correctIndex: ${q.question}`);
            issues++;
          }
        }
      }
    }
  }
  
  if (issues === 0) {
    console.log(`No major structural issues found in ${filename}`);
  } else {
    console.log(`Found ${issues} issues in ${filename}`);
  }
}

auditModule('mod1-review.json');
auditModule('mod2-review.json');
