import fs from 'node:fs';
import path from 'node:path';
import { q } from './db.mjs';

const MODULE_ID = process.env.MOD || 'cmqngcvui0001ee513prbg336';
const OUT = path.resolve(process.cwd(), '..', 'audit', 'lessons');
fs.mkdirSync(OUT, { recursive: true });

const pad = n => String(n).padStart(3, '0');
const esc = s => (s === null || s === undefined) ? '' : String(s);

const mod = (await q(`select * from "Module" where id=$1`, [MODULE_ID]))[0];
const lessons = await q(`select * from "Lesson" where "moduleId"=$1 order by "order", id`, [MODULE_ID]);

let idx = 0;
for (const l of lessons) {
  idx++;
  const L = [];
  L.push(`# Lesson ${idx} — ${esc(l.title)}`);
  L.push('');
  L.push(`- lesson_id: \`${l.id}\``);
  L.push(`- title_en: ${esc(l.title)}`);
  L.push(`- title_tj: ${esc(l.titleTranslated)}`);
  L.push(`- type: ${esc(l.type)} / skill: ${esc(l.skillType)} / cefr: ${esc(l.cefrLevel)}`);
  L.push(`- module: ${esc(mod.title)} (#${mod.order})`);
  L.push(`- order_in_module: ${l.order}`);
  L.push('');

  // VOCABULARY
  const words = await q(`select * from "Word" where "lessonId"=$1 order by "order", id`, [l.id]);
  L.push(`## Vocabulary (${words.length})`);
  L.push('');
  if (!words.length) L.push('_(none)_');
  else {
    L.push('| # | English | Tajik | IPA | IPA-tj | Example | Example (tj) |');
    L.push('|---|---------|-------|-----|--------|---------|--------------|');
    words.forEach((w, i) => L.push(`| ${i + 1} | ${esc(w.word)} | ${esc(w.translation)} | ${esc(w.ipa)} | ${esc(w.ipaTajik)} | ${esc(w.example)} | ${esc(w.exampleTrans)} |`));
  }
  L.push('');

  // GRAMMAR
  if (l.grammarTopicId) {
    const t = (await q(`select * from "GrammarTopic" where id=$1`, [l.grammarTopicId]))[0];
    const rules = await q(`select * from "GrammarRule" where "topicId"=$1 order by "order", id`, [l.grammarTopicId]);
    const exs = await q(`select * from "GrammarExample" where "topicId"=$1 order by "order", id`, [l.grammarTopicId]);
    const drills = await q(`select * from "GrammarExercise" where "topicId"=$1 order by "order", id`, [l.grammarTopicId]);
    L.push(`## Grammar topic: ${esc(t.title)} / ${esc(t.titleTranslated)}  (cefr ${esc(t.cefrLevel)})`);
    L.push('');
    L.push('### Explanation (as shown to learner)');
    L.push('');
    L.push(esc(t.explanation));
    L.push('');
    L.push(`### Rules (${rules.length})`);
    rules.forEach((r, i) => L.push(`${i + 1}. **${esc(r.pattern)}**${r.note ? ` — ${esc(r.note)}` : ''}`));
    L.push('');
    L.push(`### Examples (${exs.length})`);
    exs.forEach((e, i) => L.push(`${i + 1}. ${esc(e.sentence)} — _${esc(e.translation)}_${e.highlight ? ` [highlight: ${esc(e.highlight)}]` : ''}`));
    L.push('');
    L.push(`### Grammar exercises (${drills.length})`);
    L.push('');
    drills.forEach((d, i) => {
      L.push(`**${i + 1}. [${esc(d.type)}]** ${esc(d.prompt)}`);
      if (d.promptTranslated) L.push(`   - prompt_tj: ${esc(d.promptTranslated)}`);
      let opts = d.options;
      if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch {} }
      if (Array.isArray(opts) && opts.length) {
        L.push(`   - options: ${opts.map((o, j) => `${j + 1}) ${esc(o)}`).join('  |  ')}`);
      } else {
        L.push(`   - options: _(none — free input)_`);
      }
      L.push(`   - CORRECT ANSWER: **${esc(d.answer)}**`);
      if (d.explanation) L.push(`   - explanation: ${esc(d.explanation)}`);
      L.push('');
    });
  }

  // COMPREHENSION (reading / listening / review / exam)
  if (l.comprehensionId) {
    const c = (await q(`select * from "ComprehensionExercise" where id=$1`, [l.comprehensionId]))[0];
    const qs = await q(`select * from "ComprehensionQuestion" where "exerciseId"=$1 order by "order", id`, [l.comprehensionId]);
    L.push(`## Comprehension [${esc(c.kind)}]: ${esc(c.title)} / ${esc(c.titleTranslated)}  (cefr ${esc(c.cefrLevel)})`);
    L.push('');
    L.push('### Passage');
    L.push('');
    L.push('```');
    L.push(esc(c.passage));
    L.push('```');
    if (c.passageTranslated) { L.push(''); L.push(`Passage (tj): ${esc(c.passageTranslated)}`); }
    L.push(`\naudio: ${c.audioUrl ? 'yes' : 'NO'}`);
    L.push('');
    L.push(`### Questions (${qs.length})`);
    L.push('');
    qs.forEach((x, i) => {
      L.push(`**${i + 1}.** ${esc(x.question)}`);
      if (x.questionTranslated) L.push(`   - question_tj: ${esc(x.questionTranslated)}`);
      let opts = x.options;
      if (typeof opts === 'string') { try { opts = JSON.parse(opts); } catch {} }
      if (Array.isArray(opts)) {
        opts.forEach((o, j) => L.push(`   - ${j === x.correctIndex ? '**[CORRECT]**' : '[ ]'} ${j}) ${esc(o)}`));
      }
      L.push(`   - correctIndex: ${x.correctIndex}`);
      if (x.explanation) L.push(`   - explanation: ${esc(x.explanation)}`);
      L.push('');
    });
  }

  // DIALOGUE
  if (l.dialogueId) {
    const d = (await q(`select * from "Dialogue" where id=$1`, [l.dialogueId]))[0];
    const lines = await q(`select * from "DialogueLine" where "dialogueId"=$1 order by "order", id`, [l.dialogueId]);
    L.push(`## Dialogue: ${esc(d.title)} / ${esc(d.titleTranslated)}  (cefr ${esc(d.cefrLevel)})`);
    if (d.scenario) L.push(`\nscenario: ${esc(d.scenario)}`);
    L.push('');
    L.push(`### Lines (${lines.length})`);
    L.push('');
    lines.forEach((x, i) => {
      L.push(`${i + 1}. **${esc(x.speaker)}**${x.isUser ? ' _(learner speaks)_' : ''}: ${esc(x.text)}`);
      L.push(`   - tj: ${esc(x.translation)}`);
      L.push(`   - audio: ${x.audioUrl ? 'yes' : 'NO'}`);
    });
    L.push('');
  }

  // PHRASES
  if (l.phraseCollectionId) {
    const pc = (await q(`select * from "PhraseCollection" where id=$1`, [l.phraseCollectionId]))[0];
    const ph = await q(`select * from "Phrase" where "collectionId"=$1 order by "order", id`, [l.phraseCollectionId]);
    L.push(`## Phrases: ${esc(pc.title)} / ${esc(pc.titleTranslated)}`);
    L.push('');
    ph.forEach((p, i) => {
      L.push(`${i + 1}. ${esc(p.text)} — _${esc(p.translation)}_${p.literal ? ` (literal: ${esc(p.literal)})` : ''}${p.note ? ` [note: ${esc(p.note)}]` : ''}`);
    });
    L.push('');
  }

  const file = path.join(OUT, `${pad(idx)}.md`);
  fs.writeFileSync(file, L.join('\n'), 'utf8');
  console.log(`wrote ${pad(idx)}.md  ${l.title}  (${L.join('\n').length} chars)`);
}
console.log(`\nDone: ${lessons.length} lessons -> ${OUT}`);
