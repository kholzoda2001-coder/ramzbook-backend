// МОДУЛИ 8-и РУСӢ (A1) «Покупки» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module8_v2.md` (13.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 7` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// ⚠️ Транскрипсияи тоҷикӣ ҚАСДАН илова НАМЕШАВАД (қарори корбар, 12.09).
// Калимаҳои иваз мешуда, матнҳо, муколама ва мисоли «Тот дом большой» — дар `_ru-m8-media.mjs`.
// Машқҳои грамматика, ки ҷумлаи дурусташон иваз мешавад, audioUrl=null мегиранд →
// `_grammar-ex-audio.mjs --gen --regen <id…>` онҳоро аз нав сабт мекунад.
//
//   node prisma/_ru-m8-fix.mjs           # dry-run
//   node prisma/_ru-m8-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';
import { exerciseSentence } from './_grammar-ex-text.mjs';

const sql = connect();
banner('RU · A1 · Модули 8 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[7].id;
const lessons = await sql`SELECT id,"order",title,"grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 18) throw new Error(`Модули 8 бояд 18 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[10].gid || !L[11].gid || !L[12].cid || !L[14].did || !L[17].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const regen = [];
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'emoji'],
  Lesson: ['title', 'titleTranslated'],
  Dialogue: ['title'],
  ComprehensionExercise: ['title', 'titleTranslated'],
  GrammarTopic: ['explanation'],
  GrammarRule: ['note'],
  GrammarExample: ['translation'],
  GrammarExercise: ['prompt', 'promptTranslated', 'answer', 'options', 'explanation', 'audioUrl'],
};
const JSONCOLS = new Set(['options']);

async function setRow(table, id, want, label) {
  const cols = Object.keys(want);
  for (const c of cols) if (!ALLOW[table]?.includes(c)) throw new Error(`иҷозат нест: ${table}.${c}`);
  const sel = `SELECT ${cols.map((c) => `"${c}"`).join(',')} FROM "${table}" WHERE id=$1`;
  const r = await sql.query(sel, [id]);
  if (r.length !== 1) throw new Error(`${table} ${id}: ${r.length} сатр`);
  const same = (row, c) => JSON.stringify(row[c]) === JSON.stringify(want[c]);
  if (cols.every((c) => same(r[0], c))) { already++; return false; }
  console.log(`  • ${label}`);
  for (const c of cols) if (!same(r[0], c)) console.log(`      ${c}: ${JSON.stringify(r[0][c])}\n         → ${JSON.stringify(want[c])}`);
  changed++;
  if (!APPLY) return true;
  const sets = cols.map((c, i) => `"${c}"=$${i + 2}${JSONCOLS.has(c) ? '::jsonb' : ''}`).join(', ');
  await sql.query(`UPDATE "${table}" SET ${sets} WHERE id=$1`, [id, ...cols.map((c) => (JSONCOLS.has(c) ? JSON.stringify(want[c]) : want[c]))]);
  const [a] = await sql.query(sel, [id]);
  if (!cols.every((c) => same(a, c))) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
  return true;
}
const set = (t, id, c, v, label) => setRow(t, id, { [c]: v }, label);
const norm = (s) => (s ?? '').toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const checkChoice = (answer, options, label) => {
  if (options.filter((o) => norm(o) === norm(answer)).length !== 1) throw new Error(`ҷавоб дар вариантҳо: ${label}`);
  if (new Set(options.map(norm)).size !== options.length) throw new Error(`варианти такрорӣ: ${label}`);
};

const allWords = await sql`SELECT w.id,w.word,l."order" lo FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
  WHERE l."moduleId"=${MOD} ORDER BY l."order", w."order"`;
if (allWords.length !== 68) throw new Error(`модул: ${allWords.length} калима`);
const byWord = (w) => {
  const r = allWords.filter((x) => x.word === w);
  if (!r.length) throw new Error(`калима нест: ${w}`);
  return r;
};

// ═══ F7 · F11 · тарҷумаҳо ═══
console.log('\n── тарҷумаҳо ──');
const TR = {
  'Платье': 'Либоси занона',   // буд «Курта» — бо «Рубашка» = «Курта (ҷомаи мардона)» омехта мешуд
  'Банка': 'Банка (зарф)',     // буд «Зарф (банкаи шишагӣ)», вале эмоҷӣ 🥫 қуттии тунука аст
};
for (const [w, t] of Object.entries(TR)) for (const row of byWord(w)) await set('Word', row.id, 'translation', t, `Д${row.lo + 1} «${w}» → «${t}»`);

// ═══ R11 · мисолҳо бо калимаҳои омӯхта ═══
// Мисол бояд калимаи кортро (ақаллан решаи 4-ҳарфааш) дошта бошад.
console.log('\n── R11 · мисолҳо ──');
const EX = {
  'Платить': ['Где платить?', 'Дар куҷо пардохт кунам?'],                           // буд «заплатить» — феъли дигар
  'Сдача': ['Вот ваша сдача.', 'Инак бақияи шумо.'],                                // буд «Оставьте сдачу себе»
  'Кредитная карта': ['Это моя кредитная карта.', 'Ин корти кредитии ман аст.'],   // буд «Вы принимаете кредитные карты?»
  'Список': ['Это мой список.', 'Ин рӯйхати ман аст.'],                              // буд «список покупок»
  'Банка': ['Банка сока.', 'Як банка афшура.'],                                     // буд «газировки»
  'Качество': ['Хорошее качество.', 'Сифати хуб.'],                                  // буд «высокое»
  'Покупать': ['Я покупаю хлеб.', 'Ман нон мехарам.'],                              // буд «купить» — феъли дигар
  'Дешёвый': ['Дешёвый телефон.', 'Телефони арзон.'],                               // буд «дёшево» (зарф, на сифат)
};
for (const [w, [ex, tr]] of Object.entries(EX)) {
  const toks = norm(ex).split(' ');
  for (const part of w.toLowerCase().split(' ')) {
    if (!toks.some((t) => t.startsWith(part.slice(0, 4)))) throw new Error(`мисол калимаи худро надорад: ${w}`);
  }
  for (const row of byWord(w)) await setRow('Word', row.id, { example: ex, exampleTrans: tr }, `Д${row.lo + 1} «${w}».example`);
}
// F1 · F8 — танҳо тарҷумаи тоҷикии мисол
const EXTR = { 'Стоить': 'Ин чанд пул аст?', 'Футболка': 'Ман мехоҳам футболка харам.' };
for (const [w, t] of Object.entries(EXTR)) for (const row of byWord(w)) await set('Word', row.id, 'exampleTrans', t, `Д${row.lo + 1} «${w}».exampleTrans`);

// ═══ R10 · эмоҷӣ ═══
// Ҳар эмоҷии нав бо `_isPicturable` санҷида шуд: исмҳои абстракт («Количество», «Выход»,
// «Сдача», «Скидка») эмоҷии аз `_kPickBlockedEmojis` мегиранд → саволи «Ин чист?»-и
// гумроҳкунанда фаъол намешавад. «Кассир» дар `_kNonPicturableWords` аст.
console.log('\n── R10 · эмоҷӣ ──');
const EMO = {
  'Кассир': '🧑‍💼',   // буд 👨‍💻 (барномасоз)
  'Количество': '🔢', // буд 🛒 (= «Тележка»)
  'Выход': '🔙',      // буд 🚪 (= «Вход» дар ҳамон дарс)
  'Стоить': '💲',     // буд 💸 (= «Платить» дар дарси навиштан)
  'Бутылка': '🧴',    // буд 🍾 (шампан)
  'Сдача': '🔄',      // буд 🪙 (= «Монета»)
  'Скидка': '➖',     // буд 🏷 (= «Цена»)
};
for (const [w, e] of Object.entries(EMO)) for (const row of byWord(w)) await set('Word', row.id, 'emoji', e, `Д${row.lo + 1} «${w}».emoji`);

// ═══ R12 · R6 · унвонҳо ═══
console.log('\n── R12 · унвонҳо ──');
const TITLES = [
  [4, 'Хариди либос', 'Одежда'],
  [5, 'Хариди либос (2)', 'Одежда (2)'],
  [6, 'Хариди хӯрокворӣ', 'Продукты'],
  [7, 'Хариди хӯрокворӣ (2)', 'Продукты (2)'],
  [8, 'Забони харид', 'Покупки'],
  [9, 'Забони харид (2)', 'Покупки (2)'],
];
for (const [lo, old, title] of TITLES) {
  if (![old, title].includes(L[lo].title)) throw new Error(`Д${lo + 1} унвон: «${L[lo].title}»`);
  await set('Lesson', L[lo].id, 'title', title, `Д${lo + 1} унвон «${old}» → «${title}»`);
}
{
  const want = { title: 'Чтение: В магазине', titleTranslated: 'Хониш: дар мағоза' };
  if (![' Составление покупок', want.title].map((s) => s.trim()).includes(L[12].title)) throw new Error(`Д13 унвон: «${L[12].title}»`);
  await setRow('Lesson', L[12].id, want, 'Д13 унвони дарс');
  await setRow('ComprehensionExercise', L[12].cid, want, 'Д13 унвони машқи хониш');
}
{
  const [d] = await sql`SELECT title FROM "Dialogue" WHERE id=${L[14].did}`;
  if (!['Store Conversation', 'Разговор в магазине'].includes(d.title)) throw new Error(`Д15 унвон: «${d.title}»`);
  await set('Dialogue', L[14].did, 'title', 'Разговор в магазине', 'Д15 унвони муколама (англисӣ → русӣ)');
}

// ═══ Машқҳои грамматика ═══
async function exRow(lo, prompts) {
  const r = await sql`SELECT id,type,prompt,answer FROM "GrammarExercise" WHERE "topicId"=${L[lo].gid} AND prompt = ANY(${prompts})`;
  if (r.length !== 1) throw new Error(`Д${lo + 1} машқи «${prompts[0]}»: ${r.length}`);
  return r[0];
}
/** Агар ҷумлаи дурусти машқ иваз шавад, аудиои кӯҳна хомӯш мешавад ва ба навбати сабт меравад. */
async function setExercise(lo, oldPrompt, want, label) {
  const row = await exRow(lo, [oldPrompt, want.prompt ?? oldPrompt]);
  const next = { type: row.type, prompt: want.prompt ?? row.prompt, answer: want.answer ?? row.answer };
  if (want.options) checkChoice(next.answer, want.options, label);
  const before = exerciseSentence(row, 'ru').text;
  const after = exerciseSentence(next, 'ru');
  if (!after.text) throw new Error(`${label}: ҷумлаи аудио сохта намешавад (${after.reason})`);
  if (before !== after.text) {
    want = { ...want, audioUrl: null };
    regen.push(row.id);
    console.log(`      (аудио: «${before}» → «${after.text}» — аз нав сабт мешавад)`);
  }
  await setRow('GrammarExercise', row.id, want, label);
}

// ═══ R9 · Д11 «Сколько» ═══
console.log('\n── R9 · Д11 «Сколько» ──');
{
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${L[10].gid}`;
  const anchor = '- **Сколько стоит…?** = нарх: **Сколько стоит эта рубашка?**';
  const add = '- Ҷавоби нарх: **десять долларов**, **двадцать долларов** — баъди рақам «доллар» → «долларов». Ҳамчун қолаб ёд гиред.';
  if (!t.explanation.includes(anchor)) throw new Error('Д11: сатри «Сколько стоит» дар шарҳ ёфт нашуд');
  if (!t.explanation.includes(add)) await set('GrammarTopic', L[10].gid, 'explanation', t.explanation.replace(anchor, `${anchor}\n${add}`), 'Д11 шарҳ: «долларов» илова шуд');
  else already++;
  const rules = await sql`SELECT id,note FROM "GrammarRule" WHERE "topicId"=${L[10].gid}`;
  const r = rules.filter((x) => /much\/many|барои ҳарду як калима/.test(x.note ?? ''));
  if (r.length !== 1) throw new Error(`Д11 қоидаи much/many: ${r.length}`);
  await set('GrammarRule', r[0].id, 'note', 'Сколько книг? / Сколько воды? — барои ҳарду як калима.', 'Д11 қоида: ишораи англисии «much/many» нест');
}
await setExercise(10, 'Сколько ___ эта рубашка?', { options: ['стоит', 'стоят', 'стоить', 'стоишь'] }, 'Д11 «стоил / стоило» (замони гузашта) → шаклҳои ҳамин феъл');
await setExercise(10, 'Сколько ___ здесь? (люди)', { explanation: 'люди → людей: баъди «сколько» охири калима иваз мешавад.' }, 'Д11 тавзеҳи «людей»');
await setExercise(10, 'Сколько ___ нам нужно? (рис)', { explanation: 'Рис шумурда намешавад → риса.' }, 'Д11 тавзеҳи «риса» (имло)');
await setExercise(10, 'Саволро созед:', { promptTranslated: 'Ту чанд китоб дорӣ?' }, 'Д11 машқи тартиб: маънои ҷумла');
await setExercise(10, 'Ислоҳ кунед: Сколько яблоко?', {
  promptTranslated: 'яблоко — танҳо; баъди «сколько» бояд ҷамъ бошад.',
  explanation: 'яблоко → яблок (мисли «Сколько яблок?» дар дарси 7).',
}, 'Д11 «лозим ҷамъ» → тоҷикии дуруст');

// ═══ R1 · Д12 «Этот / Тот» — машқҳо бо қоидаи худ мувофиқ ═══
console.log('\n── R1 · Д12 «Этот / Тот» ──');
{
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${L[11].gid}`;
  const anchor = '⚡ **Фарқ аз тоҷикӣ:**';
  const add = 'Муқоиса: **Эта ручка моя.** (ин ручка аз они ман аст) ↔ **Это моя ручка.** (ин ручкаи ман аст).';
  if (t.explanation.split(anchor).length !== 2) throw new Error('Д12: ⚡ «Фарқ аз тоҷикӣ» дар шарҳ як бор нест');
  if (!t.explanation.includes(add)) await set('GrammarTopic', L[11].gid, 'explanation', t.explanation.replace(anchor, `${add}\n\n${anchor}`), 'Д12 шарҳ: муқоисаи «Эта ручка моя ↔ Это моя ручка»');
  else already++;
  const ex = await sql`SELECT id FROM "GrammarExample" WHERE "topicId"=${L[11].gid} AND sentence='Эти туфли красивые.'`;
  if (ex.length !== 1) throw new Error(`Д12 мисоли «Эти туфли»: ${ex.length}`);
  await set('GrammarExample', ex[0].id, 'translation', 'Ин туфлиҳо зебоанд.', 'Д12 мисол: «красивые» = «зебоанд»');
}
// «___ моя ручка.» бо ҷавоби «Эта» қоидаи ⚡-и худи дарсро вайрон мекард («Это моя ручка» — хабарӣ).
// Ҷумла ба шакли сифатӣ мегузарад ва «Это» аз вариантҳо мебарояд, то ду ҷавоби дуруст набошад.
await setExercise(11, '___ моя ручка. (наздик, ж.р.)', {
  prompt: '___ ручка моя. (наздик, ж.р.)', promptTranslated: 'Ин ручка аз они ман аст.',
  options: ['Этот', 'Эта', 'Эти', 'Те'],
  explanation: 'ручка — ж.р., наздик → эта. (Хабарӣ бошад — «Это моя ручка», ниг. машқи охир.)',
}, 'Д12 машқи 1: зиддият бо қоида');
await setExercise(11, '___ мои друзья. (наздик, ҷамъ)', {
  prompt: '___ книги новые. (наздик, ҷамъ)', promptTranslated: 'Ин китобҳо навоянд.',
  options: ['Тот', 'Те', 'Этот', 'Эти'],
  explanation: 'книги — ҷамъ, наздик → эти.',
}, 'Д12 машқи 2: «___ мои друзья» (ҷавоби дуруст «Это» мешуд)');
await setExercise(11, '___ книги там старые. (дур, ҷамъ)', { promptTranslated: 'книги — ҷамъ, дур.' }, 'Д12 машқи 4: «китоб — м.р.» (книга ж.р. аст)');
await setExercise(11, 'Ислоҳ кунед: Эти — моя ручка.', {
  promptTranslated: 'моя ручка — хабар; «это»-и хабарӣ тағйир намеёбад.',
  answer: 'Это моя ручка.',
  explanation: 'Хабарӣ → ҳамеша «это»: Это моя ручка.',
}, 'Д12 машқи 8: «Шакли феъл» (феъл нест), тире дар ҷавоб');

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
if (regen.length) console.log(`аудиои машқ аз нав: node prisma/_grammar-ex-audio.mjs --gen --lang ru --regen ${regen.join(',')}`);
