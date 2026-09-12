// МОДУЛИ 6-и РУСӢ (A1) «Хӯрок ва нӯшокиҳо» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module6_v2.md` (12.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 5` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// Матнҳо, мисолҳои грамматика ва муколама (ҳама бо аудио) — дар `_ru-m6-media.mjs`.
//
//   node prisma/_ru-m6-fix.mjs           # dry-run
//   node prisma/_ru-m6-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 6 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[5].id;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 6 бояд 17 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[9].gid || !L[10].gid || !L[11].cid || !L[13].did || !L[16].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'ipaTajik', 'emoji'],
  GrammarRule: ['note'],
  GrammarExercise: ['prompt', 'promptTranslated', 'answer', 'options', 'explanation'],
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

// ═══ R1 · транскрипсия (56) — конвенсияи М1–М5 ═══
console.log('\n── R1 · транскрипсия ──');
const IPA = {
  Яблоко: 'я́блака', Банан: 'бана́н', Апельсин: 'апилси́н', Виноград: 'винагра́т', Арбуз: 'арбу́с',
  Клубника: 'клубни́ка', Манго: 'ма́нга', Ананас: 'анана́с', Персик: 'пе́рсик', Лимон: 'лимо́н',
  Картофель: 'карто́фил', Помидор: 'памидо́р', Морковь: 'марко́ф', Лук: 'лук', Огурец: 'агуре́тс',
  Салат: 'сала́т', Кукуруза: 'кукуру́за', Перец: 'пе́ритс', Чеснок: 'чисно́к', Капуста: 'капу́ста',
  Вода: 'вада́', Молоко: 'малако́', Кофе: 'ко́фи', Чай: 'чай', Сок: 'сок',
  Газировка: 'газиро́фка', Лимонад: 'лимана́т', Пить: 'пит', 'Лёд': 'лёт', 'Горячий шоколад': 'гаря́чий шокола́т',
  Хлеб: 'хлеп', Рис: 'рис', Курица: 'ку́ритса', 'Яйцо': 'йийтсо́', Сыр: 'сир',
  'Мясо': 'мя́са', Рыба: 'ри́ба', Суп: 'суп', Масло: 'ма́сла', Макароны: 'макаро́ни',
  Завтрак: 'за́фтрак', Обед: 'абе́т', Ужин: 'у́жин', Еда: 'йида́', Голодный: 'гало́дний',
  Сытый: 'си́тий', 'Хочу пить': 'хачу́ пит', Перекус: 'пирику́с',
};
for (const [w, t] of Object.entries(IPA)) {
  for (const part of t.split(' ')) {
    const v = (part.replace(/́/g, '').match(/[аеёиоуыэюя]/g) || []).length, acc = (part.match(/́/g) || []).length;
    if ((v > 1 && acc !== 1) || (v <= 1 && acc !== 0)) throw new Error(`зада нодуруст: ${w} → ${t}`);
  }
}
for (const w of allWords) {
  if (!IPA[w.word]) throw new Error(`транскрипсия нест: ${w.word}`);
  await set('Word', w.id, 'ipaTajik', IPA[w.word], `Д${w.lo + 1} «${w.word}».ipaTajik`);
}

// ═══ R10 · тарҷумаҳо ═══
console.log('\n── R10 · тарҷумаҳо ──');
const TR = { 'Пить': 'Нӯшидан', 'Хочу пить': 'Ташна будан' };
for (const w of allWords.filter((x) => TR[x.word])) await set('Word', w.id, 'translation', TR[w.word], `Д${w.lo + 1} «${w.word}» → «${TR[w.word]}»`);

// ═══ R13 · R11 · мисолҳо (қатори хӯрок → «сохтани ҷумла» ва cloze имконпазир) ═══
console.log('\n── R13/R11 · мисолҳо ──');
const EX = {
  // калимаи ДУЮМИ ҳар дарс навбати «сохтани ҷумла»-ро мегирад (variant 1) — қатори хӯрок
  Банан: ['Яблоко, банан, виноград.', 'Себ, банан, ангур.'],
  Манго: ['Клубника, манго, ананас.', 'Қулфинай, манго, ананас.'],
  Помидор: ['Картофель, помидор, морковь.', 'Картошка, помидор, сабзӣ.'],
  Кукуруза: ['Салат, кукуруза, перец.', 'Коҳу, ҷуворимакка, қаламфур.'],
  Молоко: ['Вода, молоко, чай.', 'Об, шир, чой.'],
  Лимонад: ['Газировка, лимонад, лёд.', 'Оби газдор, лимонад, ях.'],
  Рис: ['Хлеб, рис, курица.', 'Нон, биринҷ, гӯшти мурғ.'],
  Рыба: ['Мясо, рыба, суп.', 'Гӯшт, моҳӣ, шӯрбо.'],
  Обед: ['Завтрак, обед, ужин.', 'Наҳорӣ, хӯроки нисфирӯзӣ, хӯроки шом.'],
};
// Танҳо ТАРҶУМАИ тоҷикӣ иваз мешавад (матни русӣ ҳамон мемонад) — F3, F7, F8, F12 ва «Ташна»
const EX_TG = {
  'Яблоко': 'Ман себро дӯст медорам.',
  'Апельсин': 'Ман афлесун мехӯрам.',
  'Персик': 'Ту шафтолуро дӯст медорӣ?',
  'Чеснок': 'Ман сирпиёзро дӯст медорам.',
  'Сыр': 'Ту панирро дӯст медорӣ?',
  'Лук': 'Ман пиёзро дӯст намедорам.',
  'Масло': 'Равғани маска ба ман писанд аст.',
  'Хочу пить': 'Ман ташнаам.',
};
for (const w of allWords.filter((x) => EX[x.word])) {
  const [ex, tr] = EX[w.word];
  if (!norm(ex).split(' ').includes(w.word.toLowerCase())) throw new Error(`мисол калимаи худро надорад: ${w.word}`);
  await setRow('Word', w.id, { example: ex, exampleTrans: tr }, `Д${w.lo + 1} «${w.word}».example`);
}
for (const w of allWords.filter((x) => EX_TG[x.word])) {
  await set('Word', w.id, 'exampleTrans', EX_TG[w.word], `Д${w.lo + 1} «${w.word}».exampleTrans`);
}

// ═══ R12 · эмоҷӣ ═══
console.log('\n── R12 · эмоҷӣ ──');
{
  const kap = allWords.find((x) => x.word === 'Капуста'), sal = allWords.find((x) => x.word === 'Салат');
  await set('Word', kap.id, 'emoji', '🥬', 'Д4 «Капуста»: 🥦 (брокколӣ) → 🥬');
  await set('Word', sal.id, 'emoji', '🥗', 'Д4 «Салат»: 🥬 → 🥗 (то дар як дарс ду эмоҷии якхела нашавад)');
}

// ═══ R9 · машқҳои грамматика бо калимаи наомӯхта ═══
console.log('\n── R9 · Д10, Д11 ──');
{
  await setRow('GrammarExercise', await gex(9, ['Ислоҳ кунед: У меня нет немного денег.', 'Ислоҳ кунед: У меня нет немного молока.']),
    { prompt: 'Ислоҳ кунед: У меня нет немного молока.', answer: 'У меня нет молока.', explanation: 'Инкор → нет + родительный, бе «немного».' },
    'Д10 transform: «денег» (наомӯхта) → «молока»');
  await setRow('GrammarExercise', await gex(9, ['Ба савол гузаронед: У меня есть немного сахара.', 'Ба савол гузаронед: У меня есть немного хлеба.']),
    { prompt: 'Ба савол гузаронед: У меня есть немного хлеба.', answer: 'У тебя есть хлеб?', explanation: 'Дар савол «немного» меафтад ва исм ба шакли оддӣ бармегардад.' },
    'Д10 transform: «сахара» (наомӯхта) → «хлеба»');
  // «покупать» ҳеҷ гоҳ омӯзонида нашудааст — машқҳо ба феълҳои омӯхта мегузаранд (мисолҳо дар media)
  await setRow('GrammarExercise', await gex(9, ['Она покупает ___ яблок.', 'У неё есть ___ яблок.']),
    { prompt: 'У неё есть ___ яблок.', promptTranslated: 'Ӯ якчанд себ дорад.', answer: 'несколько', options: ['немного', 'несколько', 'нет', 'весь'], explanation: 'Яблоки шумурда мешаванд → несколько.' },
    'Д10 машқи 2: «покупает» (наомӯхта) → «У неё есть»');
  await setRow('GrammarExercise', await gex(9, ['Нам нужно ___ риса. (каме)', 'У нас есть ___ риса. (каме)']),
    { prompt: 'У нас есть ___ риса. (каме)', promptTranslated: 'Мо каме биринҷ дорем.', answer: 'немного', explanation: 'Рис шумурда намешавад → немного риса.' },
    'Д10 машқи 4: «Нам нужно» (наомӯхта) → «У нас есть»');
  await setRow('GrammarExercise', await gex(10, ['Она покупает ___. (рыба)', 'Она ест ___. (рыба)']),
    { prompt: 'Она ест ___. (рыба)', promptTranslated: 'Ӯ моҳӣ мехӯрад.', answer: 'рыбу', options: ['рыба', 'рыбу', 'рыбы', 'рыбой'], explanation: 'Занона -а → -у.' },
    'Д11 машқи 2: «покупает» → «ест»');
  await setRow('GrammarExercise', await gex(10, ['Он покупает ___. (сыр)', 'Он хочет ___. (сыр)']),
    { prompt: 'Он хочет ___. (сыр)', promptTranslated: 'Ӯ панир мехоҳад.', answer: 'сыр', explanation: 'Мардонаи беҷон тағйир намеёбад.' },
    'Д11 машқи 6: «покупает» → «хочет»');
  const r = await sql`SELECT id,note FROM "GrammarRule" WHERE "topicId"=${L[10].gid} AND note = ANY(${['Что ты ешь? — Я ем кашу.', 'Что ты ешь? — Я ем суп.']})`;
  if (r.length !== 1) throw new Error(`Д11 қоида: ${r.length}`);
  await set('GrammarRule', r[0].id, 'note', 'Что ты ешь? — Я ем суп.', 'Д11 қоида: «кашу» (наомӯхта) → «суп»');
}

// ═══ R4 · Д12 (хониш) — ду саволи такрории грамматика → фаҳмиши воқеӣ ═══
console.log('\n── R4 · Д12 ──');
{
  const [c] = await sql`SELECT passage FROM "ComprehensionExercise" WHERE id=${L[11].cid}`;
  const q = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[11].cid} ORDER BY "order", id`;
  if (q.length !== 3) throw new Error(`Д12: ${q.length} савол`);
  const NEW = [
    { i: 0, old: 'Дополните: У меня есть ___ хлеба.', question: 'Что у него есть?', qt: 'Ӯ чӣ дорад?',
      options: ['Немного хлеба и сыра', 'Немного мяса', 'Немного молока'], ci: 0, key: 'хлеба и сыра',
      ex: 'Дар матн: «У меня есть немного хлеба и сыра» — каме нон ва панир.' },
    // «напиток» ҳам омӯзонида нашуда буд — саволи ниҳоӣ дар `_ru-m6-fix2.mjs` (ҳарду скрипт як натиҷа медиҳанд)
    { i: 1, old: 'Как правильно спросить про воду?', question: 'Что он не любит?', qt: 'Ӯ чиро дӯст намедорад?',
      options: ['Чай', 'Сок', 'Кофе'], ci: 2, key: 'кофе',
      ex: 'Дар матн: «Я пью чай, но не люблю кофе» — қаҳваро дӯст намедорад.' },
  ];
  for (const n of NEW) {
    if (![n.old, n.question, 'Какой напиток он не любит?'].includes(q[n.i].question)) throw new Error(`Д12 Q${n.i + 1}: «${q[n.i].question}»`);
    if (!c.passage.toLowerCase().includes(n.key) || !n.options[n.ci].toLowerCase().includes(n.key)) throw new Error(`Д12 Q${n.i + 1}: калид «${n.key}»`);
    if (n.options.some((o, j) => j !== n.ci && o.toLowerCase().includes(n.key))) throw new Error(`Д12 Q${n.i + 1}: калид дар варианти нодуруст`);
    checkChoice(n.options[n.ci], n.options, `Д12 Q${n.i + 1}`);
    await setRow('ComprehensionQuestion', q[n.i].id, { question: n.question, questionTranslated: n.qt, options: n.options, correctIndex: n.ci, explanation: n.ex },
      `Д12 Q${n.i + 1}: такрори машқи Д10 → фаҳмиши матн`);
  }
}

// ═══ R8 · имтиҳон: саволҳои ба матн вобаста НЕ (Q4–Q8) ═══
console.log('\n── R8 · имтиҳон Q4–Q8 ──');
{
  const q = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[16].cid} ORDER BY "order", id`;
  if (q.length !== 8) throw new Error(`имтиҳон: ${q.length} савол`);
  const EXQ = [
    [3, "Переведите 'Ман об менӯшам':", { question: 'Переведите «Ман об менӯшам»:' }],
    [4, "Переведите 'Оё ту себро нағз мебинӣ?':", { question: 'Переведите «Оё ту себро дӯст медорӣ?»:',
      questionTranslated: '«Оё ту себро дӯст медорӣ?»-ро тарҷума кунед.' }],
    [5, 'Выберите правильное: У тебя есть ___ молока?', { question: 'У тебя есть ___ молока?', questionTranslated: 'Ту каме шир дорӣ?',
      options: ['несколько', 'немного', 'нет'], correctIndex: 1, explanation: 'Молоко шумурда намешавад → немного. («несколько» танҳо бо ҷамъи шумурдашаванда меояд.)' }],
    [6, "Как будет 'Гӯшти мурғ' по-русски?", { question: 'Переведите «Гӯшти мурғ»:', questionTranslated: '«Гӯшти мурғ»-ро тарҷума кунед.',
      options: ['Мясо', 'Рыба', 'Курица'], correctIndex: 2, explanation: 'Гӯшти мурғ = курица. (гӯшт = мясо, моҳӣ = рыба.)' }],
    [7, 'Выберите правильное: У меня ___ яблок.', { question: 'У меня ___ яблок.', questionTranslated: 'Ман себ надорам.',
      options: ['есть', 'нет', 'немного'], correctIndex: 1, explanation: 'Инкор → «нет» ва охири исм иваз мешавад: «У меня нет яблок».' }],
  ];
  for (const [i, old, want] of EXQ) {
    if (![old, want.question].includes(q[i].question)) throw new Error(`имтиҳон Q${i + 1}: «${q[i].question}»`);
    if (want.options) checkChoice(want.options[want.correctIndex], want.options, `имтиҳон Q${i + 1}`);
    await setRow('ComprehensionQuestion', q[i].id, want, `имтиҳон Q${i + 1}`);
  }
}

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
