// МОДУЛИ 7-и РУСӢ (A1) «Хона ва ашёҳо» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module7_v2.md` (12.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 6` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// ⚠️ Транскрипсияи тоҷикӣ ҚАСДАН илова НАМЕШАВАД: хонандаи тоҷик кириллиро мехонад (қарори корбар, 12.09).
// Калимаи иваз мешуда, матнҳо ва муколама (ҳама бо аудио) — дар `_ru-m7-media.mjs`.
//
//   node prisma/_ru-m7-fix.mjs           # dry-run
//   node prisma/_ru-m7-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 7 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[6].id;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 7 бояд 17 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[9].gid || !L[10].gid || !L[11].cid || !L[16].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'emoji'],
  GrammarExercise: ['prompt', 'promptTranslated', 'answer', 'options', 'explanation'],
  ComprehensionExercise: ['passageTranslated'],
  ComprehensionQuestion: ['question', 'questionTranslated', 'options', 'correctIndex', 'explanation'],
};
const JSONCOLS = new Set(['options']);

async function setRow(table, id, want, label) {
  const cols = Object.keys(want);
  for (const c of cols) if (!ALLOW[table]?.includes(c)) throw new Error(`иҷозат нест: ${table}.${c}`);
  const sel = `SELECT ${cols.map((c) => `"${c}"`).join(',')} FROM "${table}" WHERE id=$1`;
  const r = await sql.query(sel, [id]);
  if (r.length !== 1) throw new Error(`${table} ${id}: ${r.length} сатр`);
  const same = (row, c) => JSON.stringify(row[c]) === JSON.stringify(want[c]);
  if (cols.every((c) => same(r[0], c))) { already++; return; }
  console.log(`  • ${label}`);
  for (const c of cols) if (!same(r[0], c)) console.log(`      ${c}: ${JSON.stringify(r[0][c])}\n         → ${JSON.stringify(want[c])}`);
  changed++;
  if (!APPLY) return;
  const sets = cols.map((c, i) => `"${c}"=$${i + 2}${JSONCOLS.has(c) ? '::jsonb' : ''}`).join(', ');
  await sql.query(`UPDATE "${table}" SET ${sets} WHERE id=$1`, [id, ...cols.map((c) => (JSONCOLS.has(c) ? JSON.stringify(want[c]) : want[c]))]);
  const [a] = await sql.query(sel, [id]);
  if (!cols.every((c) => same(a, c))) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}
const set = (t, id, c, v, label) => setRow(t, id, { [c]: v }, label);
const norm = (s) => (s ?? '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const checkChoice = (answer, options, label) => {
  if (options.filter((o) => norm(o) === norm(answer)).length !== 1) throw new Error(`ҷавоб дар вариантҳо: ${label}`);
  if (new Set(options.map(norm)).size !== options.length) throw new Error(`варианти такрорӣ: ${label}`);
};
const gex = async (lo, prompts) => {
  const r = await sql`SELECT id FROM "GrammarExercise" WHERE "topicId"=${L[lo].gid} AND prompt = ANY(${prompts})`;
  if (r.length !== 1) throw new Error(`Д${lo + 1} машқи «${prompts[0]}»: ${r.length}`);
  return r[0].id;
};

const allWords = await sql`SELECT w.id,w.word,l."order" lo FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
  WHERE l."moduleId"=${MOD} ORDER BY l."order", w."order"`;
if (allWords.length !== 56) throw new Error(`модул: ${allWords.length} калима`);
const byWord = (w) => allWords.filter((x) => x.word === w);

// ═══ R11 · R8 · тарҷумаҳо ═══
// «Ниже» калимаи қиёсист, на пешоянди ҷой — тарҷумааш ҳамин тавр аниқ мешавад (калима иваз НАМЕШАВАД:
// 4 корти такрори хонандагон ба он бастаанд ва SRS матнро аз база мегирад).
console.log('\n── R11/R8 · тарҷумаҳо ──');
const TR = {
  'Ручка': 'Ручка',                       // буд «Қалам / Ручка» — бо «Карандаш» омехта мешуд
  'Карандаш': 'Қалам',                    // буд «Қалами сиёҳ»
  'Над': 'Болои (дар ҳаво)',              // буд «Дар болои / баландтар аз» — бо «На» як хел
  'Ниже': 'Пасттар аз',                   // буд «Дар поёни / пасттар аз»
};
for (const [w, t] of Object.entries(TR)) for (const row of byWord(w)) await set('Word', row.id, 'translation', t, `Д${row.lo + 1} «${w}» → «${t}»`);

// ═══ R12 · R8 · мисолҳо ═══
// Калимаи ДУЮМИ ҳар дарс навбати «сохтани ҷумла»-ро мегирад → қатори ашёи ҳамон дарс.
console.log('\n── R12 · мисолҳо ──');
const EX = {
  'Комната': ['Дом, комната, кухня.', 'Хона, ҳуҷра, ошхона.'],
  'Квартира': ['Квартира, ванная, коридор.', 'Квартира, ҳаммом, роҳрав.'],
  'Стул': ['Кровать, стул, диван.', 'Кат, курсӣ, диван.'],
  'Зеркало': ['Дверь, зеркало, полка.', 'Дар, оина, раф.'],
  'Лампа': ['Книга, лампа, телефон.', 'Китоб, чароғ, телефон.'],
  'Ручка': ['Сумка, ручка, тетрадь.', 'Халта, ручка, дафтар.'],
  'Грязный': ['Чистый или грязный?', 'Тоза ё ифлос?'],
  'Растение': ['Картина, растение, сад.', 'Расм, растанӣ, боғ.'],
  'Ниже': ['Полка ниже окна.', 'Раф аз тиреза пасттар аст.'],   // буд «Коробка ниже окна» — дар русӣ чунин намегӯянд
};
for (const [w, [ex, tr]] of Object.entries(EX)) {
  if (!norm(ex).split(' ').includes(w.toLowerCase())) throw new Error(`мисол калимаи худро надорад: ${w}`);
  for (const row of byWord(w)) await setRow('Word', row.id, { example: ex, exampleTrans: tr }, `Д${row.lo + 1} «${w}».example`);
}
for (const row of byWord('Над')) await set('Word', row.id, 'exampleTrans', 'Расм болои диван овезон аст.', `Д${row.lo + 1} «Над».exampleTrans`);

// ═══ R9 · эмоҷӣ ═══
console.log('\n── R9 · эмоҷӣ ──');
const EMO = { 'Гардероб': '🧥', 'Растение': '🪴', 'Тетрадь': '📓', 'Часы': '🕰', 'Стол': '🍽' };
for (const [w, e] of Object.entries(EMO)) for (const row of byWord(w)) await set('Word', row.id, 'emoji', e, `Д${row.lo + 1} «${w}».emoji`);

// ═══ R13 · дистракторҳои бегона дар Д11 ═══
console.log('\n── R13 · Д11 дистракторҳо ──');
{
  const D = [
    ['В комнате ___ книга.', 'есть', ['есть', 'нет', 'быть']],
    ['Здесь ___ три окна.', 'есть', ['нет', 'есть', 'быть']],
    ['___ банк рядом?', 'Есть', ['Нет', 'Есть', 'Быть']],
  ];
  for (const [prompt, answer, options] of D) {
    checkChoice(answer, options, prompt);
    await setRow('GrammarExercise', await gex(10, [prompt]), { options }, `Д11 «${prompt}»: «суть / являются» → калимаҳои курс`);
  }
}

// ═══ R7 · Д12 (хониш): саволи грамматикӣ ва шакли наомӯхта → фаҳмиши воқеӣ ═══
console.log('\n── R7 · Д12 ──');
{
  const [c] = await sql`SELECT passage,"passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${L[11].cid}`;
  const q = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[11].cid} ORDER BY "order", id`;
  if (q.length !== 3) throw new Error(`Д12: ${q.length} савол`);
  const NEW = [
    { i: 0, old: 'Сколько спален в доме?', question: 'Что есть в моей спальне?', qt: 'Дар ҳуҷраи хоби ман чӣ ҳаст?',
      options: ['Кровать и письменный стол', 'Телевизор', 'Диван'], ci: 0, key: 'кровать и письменный стол',
      ex: 'Дар матн: «В моей спальне есть кровать и письменный стол».' },
    { i: 1, old: 'Дополните: В моей спальне ___ кровать.', question: 'Где мои книги?', qt: 'Китобҳои ман дар куҷоянд?',
      options: ['На кухне', 'На письменном столе', 'В шкафу'], ci: 1, key: 'на письменном столе',
      ex: 'Дар матн: «Мои книги на письменном столе» — дар болои мизи корӣ.' },
  ];
  for (const n of NEW) {
    if (![n.old, n.question].includes(q[n.i].question)) throw new Error(`Д12 Q${n.i + 1}: «${q[n.i].question}»`);
    if (!c.passage.toLowerCase().includes(n.key) || !n.options[n.ci].toLowerCase().includes(n.key)) throw new Error(`Д12 Q${n.i + 1}: калид «${n.key}»`);
    if (n.options.some((o, j) => j !== n.ci && o.toLowerCase().includes(n.key))) throw new Error(`Д12 Q${n.i + 1}: калид дар варианти нодуруст`);
    checkChoice(n.options[n.ci], n.options, `Д12 Q${n.i + 1}`);
    await setRow('ComprehensionQuestion', q[n.i].id, { question: n.question, questionTranslated: n.qt, options: n.options, correctIndex: n.ci, explanation: n.ex },
      `Д12 Q${n.i + 1}`);
  }
  // F5 — вергули зиёдатӣ
  if (c.pt.includes('хоби ман, як бистар')) {
    await set('ComprehensionExercise', L[11].cid, 'passageTranslated', c.pt.replace('хоби ман, як бистар', 'хоби ман як бистар'), 'Д12 тарҷума: вергули зиёдатӣ');
  } else already++;
}

// ═══ R4 · имтиҳон: саволҳои ба матн вобаста НЕ (Q4–Q8) ═══
console.log('\n── R4 · имтиҳон Q4–Q8 ──');
{
  const q = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[16].cid} ORDER BY "order", id`;
  if (q.length !== 8) throw new Error(`имтиҳон: ${q.length} савол`);
  const EXQ = [
    // «чиркин» бо корти калима мувофиқ набуд — он ҷо «Грязный» = «Ифлос»
    [3, "Переведите 'Хонаи ман тоза аст':", { question: 'Переведите «Хонаи ман тоза аст»:',
      explanation: 'Тоза = чистый. Пас: «Мой дом чистый». (ифлос = грязный.)' }],
    [4, 'Выберите правильное: На кухне ___ два стула.', { question: 'На кухне ___ два стула.', questionTranslated: 'Дар ошхона ду курсӣ ҳаст.',
      options: ['нет', 'есть', 'быть'], correctIndex: 1, explanation: 'Ҷамъ ҳам → есть. («нет» инкор аст, «быть» масдар.)' }],
    [5, "Переведите 'Дар болои миз':", { question: 'Переведите «Дар болои миз»:' }],
    [6, "Как будет 'Ошхона' по-русски?", { question: 'Переведите «Ошхона»:', questionTranslated: '«Ошхона»-ро тарҷума кунед.' }],
    [7, 'Выберите правильное: В спальне ___ лампы.', { question: 'В спальне ___ лампы.', questionTranslated: 'Дар ҳуҷраи хоб чароғ нест.',
      options: ['есть', 'нет', 'быть'], correctIndex: 1, explanation: 'Инкор → нет + родительный: «нет лампы».' }],
  ];
  for (const [i, old, want] of EXQ) {
    if (![old, want.question].includes(q[i].question)) throw new Error(`имтиҳон Q${i + 1}: «${q[i].question}»`);
    if (want.options) checkChoice(want.options[want.correctIndex], want.options, `имтиҳон Q${i + 1}`);
    await setRow('ComprehensionQuestion', q[i].id, want, `имтиҳон Q${i + 1}`);
  }
}

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
