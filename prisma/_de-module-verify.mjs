// Санҷиши Модули 1-и олмонӣ — аз рӯи он чи ХОНАНДА мебинад, на аз рӯи он чи
// скрипт навишт. Ҳар дарс бояд ё калима дошта бошад, ё ба ҷузъи худ пайваст
// бошад; вагарна хонанда экрани холӣ мебинад.
//
//   node prisma/_de-m1-verify.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = t => sql.query(t);
const COURSE = 'cmqdhwb5q00021z597df2767m';
const ORDER = Number(process.argv[2] ?? 0);

const problems = [];
const P = m => problems.push(m);

const urlOk = new Map();
/** Як хатои лаҳзаии шабака набояд ҳушдори бардурӯғ диҳад — се кӯшиш мекунем. */
async function reachable(url) {
  if (!url) return false;
  if (urlOk.has(url)) return urlOk.get(url);
  let ok = false;
  for (let i = 0; i < 3 && !ok; i++) {
    if (i) await new Promise(r => setTimeout(r, 1500));
    try { ok = (await fetch(url, { method: 'HEAD' })).ok; } catch { ok = false; }
  }
  urlOk.set(url, ok);
  return ok;
}

const [m] = await q(`SELECT * FROM "Module" WHERE "courseId"='${COURSE}' AND "order"=${ORDER}`);
console.log(`${m.emoji} ${m.title}\n${' '.repeat(3)}${m.titleTranslated}\n`);

const lessons = await q(`SELECT * FROM "Lesson" WHERE "moduleId"='${m.id}' ORDER BY "order"`);
if (lessons.length < 14) P(`модул ${lessons.length} дарс дорад (англисӣ 14)`);

const orders = lessons.map(l => l.order);
if (!orders.every((v, i) => v === i)) P(`тартиби дарсҳо пайваста нест: ${orders.join(',')}`);

for (const l of lessons) {
  const words = await q(`SELECT * FROM "Word" WHERE "lessonId"='${l.id}' ORDER BY "order"`);
  const link = l.grammarTopicId ? 'grammar' : l.dialogueId ? 'dialogue'
    : l.comprehensionId ? 'comprehension' : l.phraseCollectionId ? 'phrases' : null;

  let detail = '';
  if (link === 'grammar') {
    const [t] = await q(`SELECT * FROM "GrammarTopic" WHERE id='${l.grammarTopicId}'`);
    const [{ r }] = await q(`SELECT COUNT(*)::int r FROM "GrammarRule" WHERE "topicId"='${t.id}'`);
    const ex = await q(`SELECT * FROM "GrammarExample" WHERE "topicId"='${t.id}'`);
    const xs = await q(`SELECT * FROM "GrammarExercise" WHERE "topicId"='${t.id}'`);
    detail = `${r} қоида · ${ex.length} мисол · ${xs.length} машқ`;
    if (!t.explanation?.trim()) P(`«${t.title}»: шарҳ нест`);
    if (!ex.length) P(`«${t.title}»: мисол нест`);
    if (xs.length < 4) P(`«${t.title}»: танҳо ${xs.length} машқ`);
    for (const e of ex) if (!await reachable(e.audioUrl)) P(`мисоли «${e.sentence}»: аудио нест ё дастнорас`);
    for (const x of xs) {
      const opts = x.options ?? [];
      if (!opts.includes(x.answer)) P(`машқи «${x.prompt}»: ҷавоб дар вариантҳо нест`);
      if (new Set(opts).size !== opts.length) P(`машқи «${x.prompt}»: варианти такрорӣ`);
      if (!x.promptTranslated?.trim()) P(`машқи «${x.prompt}»: тарҷума нест`);
    }
  } else if (link === 'dialogue') {
    const lines = await q(`SELECT * FROM "DialogueLine" WHERE "dialogueId"='${l.dialogueId}' ORDER BY "order"`);
    detail = `${lines.length} сатр`;
    if (lines.length < 4) P(`муколама танҳо ${lines.length} сатр дорад`);
    for (const ln of lines) {
      if (!ln.translation?.trim()) P(`сатри «${ln.text}»: тарҷума нест`);
      if (!await reachable(ln.audioUrl)) P(`сатри «${ln.text}»: аудио нест ё дастнорас`);
    }
  } else if (link === 'comprehension') {
    const [c] = await q(`SELECT * FROM "ComprehensionExercise" WHERE id='${l.comprehensionId}'`);
    const qs = await q(`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId"='${c.id}' ORDER BY "order"`);
    detail = `${c.kind} · ${qs.length} савол`;
    if (!c.passageTranslated?.trim()) P(`матни «${c.title}»: тарҷума нест`);
    if (!qs.length) P(`матни «${c.title}»: савол нест`);
    // Дарси шунавоӣ бе аудио маъно надорад.
    if (c.kind === 'listening' && !await reachable(c.audioUrl)) P(`«${c.title}»: дарси шунавоӣ аудио надорад`);
    for (const x of qs) {
      const opts = x.options ?? [];
      if (opts.length < 2) P(`саволи «${x.question}»: камтар аз 2 вариант`);
      if (x.correctIndex < 0 || x.correctIndex >= opts.length) P(`саволи «${x.question}»: correctIndex нодуруст`);
      if (new Set(opts).size !== opts.length) P(`саволи «${x.question}»: варианти такрорӣ`);
      if (!x.questionTranslated?.trim()) P(`саволи «${x.question}»: тарҷума нест`);
    }
  } else if (words.length) {
    detail = `${words.length} калима`;
    if (words.length < 4) P(`дарси «${l.title}»: танҳо ${words.length} калима — барои 4 варианти ҷавоб кам`);
    const tr = words.map(w => w.translation.trim().toLowerCase());
    if (new Set(tr).size !== tr.length) P(`дарси «${l.title}»: тарҷумаи такрорӣ дар як дарс`);
    for (const w of words) {
      const miss = ['translation', 'ipa', 'ipaTajik', 'example', 'exampleTrans', 'audioUrl'].filter(f => !w[f]?.trim());
      if (miss.length) P(`«${w.word}»: ${miss.join(', ')} нест`);
      else if (!await reachable(w.audioUrl)) P(`«${w.word}»: аудио дастнорас`);
    }
  } else {
    P(`дарси «${l.title}»: на калима дорад, на ба чизе пайваст аст — экрани холӣ`);
  }

  console.log(`L${String(l.order).padStart(2)} [${l.skillType.padEnd(9)}] ${l.emoji} ${l.title.padEnd(26)} ${detail}`);
}

console.log('\n' + '─'.repeat(60));
if (!problems.length) console.log('✓ Ҳеҷ мушкил ёфт нашуд.');
else { console.log(`${problems.length} мушкил:\n`); for (const p of problems) console.log(`  • ${p}`); }
