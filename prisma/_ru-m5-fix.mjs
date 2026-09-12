// МОДУЛИ 5-и РУСӢ (A1) «Корҳои рӯзмарра ва амалҳо» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module5_v2.md` (12.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 4` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// Санҷиши пеш аз ислоҳ: ба `Word` ягон FK нест; SRS калимаро бо `itemId = Word.id` мешиносад —
// иваз кардани `lessonId`/`order` id-ро нигоҳ медорад, пас такрори хонандагони мавҷуда дуруст мемонад.
// Матнҳо ва мисолҳои дорои аудио — дар `_ru-m5-media.mjs`.
//
//   node prisma/_ru-m5-fix.mjs           # dry-run
//   node prisma/_ru-m5-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 5 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[4].id;
const lessons = await sql`SELECT id,"order",title,"grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 16) throw new Error(`Модули 5 бояд 16 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
for (const i of [4, 5, 6, 7, 8, 9]) if (!L[i].gid) throw new Error(`Д${i + 1} грамматика нест`);
if (!L[12].did || !L[15].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const ALLOW = {
  Word: ['lessonId', 'order', 'translation', 'example', 'exampleTrans', 'ipaTajik', 'emoji'],
  Lesson: ['title', 'titleTranslated'],
  GrammarTopic: ['titleTranslated', 'explanation'],
  GrammarRule: ['note'],
  GrammarExercise: ['prompt', 'promptTranslated', 'answer', 'options', 'explanation'],
  ComprehensionQuestion: ['question', 'questionTranslated', 'options', 'correctIndex', 'explanation'],
  DialogueLine: ['translation'],
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
/** Калима дар ЯКЕ аз дарсҳои додашуда (барои кӯчонидан — ҳам пеш, ҳам пас аз он). */
async function word(los, ru) {
  const ids = [los].flat().map((lo) => L[lo].id);
  const w = await sql`SELECT id,"lessonId" lid FROM "Word" WHERE "lessonId" = ANY(${ids}) AND word=${ru}`;
  if (w.length !== 1) throw new Error(`«${ru}» дар Д${[los].flat().map((x) => x + 1).join('/')}: ${w.length}`);
  return w[0].id;
}
/** Иваз кардани пораи матн (дақиқан як бор) — ё аллакай ивазшуда. */
function patch(text, oldP, newP, label) {
  if (text.includes(newP)) return text;
  if (text.split(oldP).length !== 2) throw new Error(`${label}: пора ёфт нашуд «${oldP.slice(0, 60)}»`);
  return text.replace(oldP, newP);
}
const gex = async (lo, prompts) => {
  const r = await sql`SELECT id,type FROM "GrammarExercise" WHERE "topicId"=${L[lo].gid} AND prompt = ANY(${prompts})`;
  if (r.length !== 1) throw new Error(`Д${lo + 1} машқи «${prompts[0]}»: ${r.length}`);
  return r[0].id;
};
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const checkChoice = (answer, options, label) => {
  if (options.filter((o) => norm(o) === norm(answer)).length !== 1) throw new Error(`ҷавоб дар вариантҳо: ${label}`);
  if (new Set(options.map(norm)).size !== options.length) throw new Error(`варианти такрорӣ: ${label}`);
};

// ═══ R1 · 4 калимаи дарси грамматикаи Д7 → дарсҳои луғат ═══
// Дарси грамматика танҳо `GrammarTopicScreen`-ро мекушояд (калимаҳо ноаён), вале калимаҳоро ба SRS месупорад.
console.log('\n── R1 · калимаҳои Д7 → Д2, Д3, Д4 ──');
{
  const d7 = await sql`SELECT id FROM "Word" WHERE "lessonId"=${L[6].id}`;
  const srs = d7.length ? await sql`SELECT count(*)::int n FROM "SrsCard" WHERE "itemId" = ANY(${d7.map((x) => x.id)})` : [{ n: 0 }];
  console.log(`  Д7 ҳоло ${d7.length} калима дорад · корти SRS бо ҳамин id: ${srs[0].n} (id иваз намешавад)`);
}
const MOVE = [[6, 1, 'Знать', 7], [6, 2, 'Делать', 6], [6, 2, 'Убирать', 7], [6, 3, 'Хотеть', 6]];
for (const [from, to, ru, ord] of MOVE) {
  await setRow('Word', await word([from, to], ru), { lessonId: L[to].id, order: ord }, `«${ru}»: Д${from + 1} (грамматика) → Д${to + 1}, order ${ord}`);
}
// Тартиби нав: калимаи кӯтоҳ ё «сохтани ҷумла» дар ҳамон ҷуфт — ду навиштани клавиатура паси ҳам намеояд.
const ORDER = {
  1: ['Работать', 'Изучать', 'Читать', 'Писать', 'Слушать', 'Школа', 'Офис', 'Знать'],
  2: ['Приходить', 'Ужин', 'Готовить', 'Смотреть', 'Спать', 'Кровать', 'Делать', 'Убирать'],
  3: ['Играть', 'Бегать', 'Гулять', 'Плавать', 'Музыка', 'Игра', 'Хотеть'],
  14: ['Просыпаться', 'Идти', 'Читать', 'Спать', 'Чистить зубы', 'Школа', 'Готовить', 'Бегать'],
};
for (const [lo, list] of Object.entries(ORDER)) {
  const n = await sql`SELECT count(*)::int n FROM "Word" WHERE "lessonId"=${L[lo].id}`;
  if (APPLY || Number(lo) === 14) { if (n[0].n !== list.length) throw new Error(`Д${Number(lo) + 1}: ${n[0].n} калима ≠ ${list.length}`); }
  for (const [i, ru] of list.entries()) await set('Word', await word(MOVE.some((m) => m[2] === ru) ? [6, Number(lo)] : Number(lo), ru), 'order', i, `Д${Number(lo) + 1} «${ru}».order`);
}

// ═══ R2 · транскрипсия (38) — конвенсияи М1–М4 (-ть → т, -ться → тса, о/е бе зада → а/и) ═══
console.log('\n── R2 · транскрипсия ──');
const IPA = {
  Просыпаться: 'прасипа́тса', Вставать: 'фстава́т', Умываться: 'умива́тса', 'Чистить зубы': 'чи́стит зу́би', Есть: 'йест',
  Завтрак: 'за́фтрак', Идти: 'итти́', Работать: 'рабо́тат', Изучать: 'изуча́т', Читать: 'чита́т', Писать: 'писа́т',
  Слушать: 'слу́шат', Школа: 'шко́ла', Офис: 'о́фис', Приходить: 'прихади́т', Готовить: 'гато́вит', Ужин: 'у́жин',
  Смотреть: 'сматре́т', Спать: 'спат', Кровать: 'крава́т', Играть: 'игра́т', Бегать: 'бе́гат', Гулять: 'гуля́т',
  Плавать: 'пла́ват', Музыка: 'му́зика', Игра: 'игра́', Делать: 'де́лат', Убирать: 'убира́т', Знать: 'знат', Хотеть: 'хате́т',
};
for (const [w, t] of Object.entries(IPA)) {
  for (const part of t.split(' ')) {
    const v = (part.replace(/́/g, '').match(/[аеёиоуыэюя]/g) || []).length, acc = (part.match(/́/g) || []).length;
    if ((v > 1 && acc !== 1) || (v <= 1 && acc !== 0)) throw new Error(`зада нодуруст: ${w} → ${t}`);
  }
}
const allWords = await sql`SELECT w.id,w.word,l."order" lo FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" WHERE l."moduleId"=${MOD} ORDER BY l."order", w."order"`;
if (allWords.length !== 38) throw new Error(`модул: ${allWords.length} калима`);
for (const w of allWords) {
  if (!IPA[w.word]) throw new Error(`транскрипсия нест: ${w.word}`);
  await set('Word', w.id, 'ipaTajik', IPA[w.word], `Д${w.lo + 1} «${w.word}».ipaTajik`);
}

// ═══ R12 · тарҷумаҳо (+ нусхаҳои Д15) ═══
console.log('\n── R12 · тарҷумаҳо ──');
const TR = { Изучать: 'Омӯхтан', Читать: 'Хондан', Спать: 'Хобидан', Умываться: 'Дасту рӯ шустан', Гулять: 'Сайр кардан', Делать: 'Кардан' };
for (const w of allWords.filter((x) => TR[x.word])) await set('Word', w.id, 'translation', TR[w.word], `Д${w.lo + 1} «${w.word}» → «${TR[w.word]}»`);

// ═══ R3 · мисолҳо (+ F1) — «сохтани ҷумла» ва cloze дар навбати худ ═══
console.log('\n── R3 · мисолҳо ──');
const EX = {
  Вставать: ['Просыпаться, вставать, умываться.', 'Бедор шудан, хестан, дасту рӯ шустан.'],
  Умываться: ['Вставать, умываться, чистить зубы.', 'Хестан, дасту рӯ шустан, дандон мисвок кардан.'],
  Изучать: ['Работать и изучать.', 'Кор кардан ва омӯхтан.'],
  Читать: ['Я люблю читать.', 'Ман хонданро дӯст медорам.'],
  Готовить: ['Моя мать любит готовить.', 'Модарам пухтанро дӯст медорад.'],
  Кровать: ['Моя кровать удобная.', 'Бистари ман бароҳат аст.'],
  Бегать: ['Играть и бегать.', 'Бозӣ кардан ва давидан.'],
  Гулять: ['Я люблю гулять в парке.', 'Ман дар боғ сайр карданро дӯст медорам.'],
  Хотеть: ['Я хочу гулять.', 'Ман сайр кардан мехоҳам.'],
};
for (const w of allWords.filter((x) => EX[x.word])) {
  const [ex, tr] = EX[w.word];
  // «Кровать» танҳо тарҷума, «Хотеть» — навбати ҳарфчинӣ, шакли «хочу» қасдан (ниг. Д7 «Феълҳои номунтазам»).
  if (!['Кровать', 'Хотеть'].includes(w.word) && !norm(ex).split(' ').includes(w.word.toLowerCase())) throw new Error(`мисол калимаи худро надорад: ${w.word}`);
  await setRow('Word', w.id, { example: ex, exampleTrans: tr }, `Д${w.lo + 1} «${w.word}».example`);
}
await set('Word', await word([6, 2], 'Убирать'), 'emoji', '🧹', '«Убирать» 🛠️ (асбоб) → 🧹');

// ═══ R8 · унвонҳо ═══
console.log('\n── R8 · унвонҳо ──');
for (const [lo, ru, tg] of [[6, 'Грамматика: I спряжение', 'Грамматика: сарфи феъл, гурӯҳи I'], [7, 'Грамматика: II спряжение', 'Грамматика: сарфи феъл, гурӯҳи II']]) {
  await setRow('Lesson', L[lo].id, { title: ru, titleTranslated: tg }, `Д${lo + 1} унвон`);
  await set('GrammarTopic', L[lo].gid, 'titleTranslated', tg, `Д${lo + 1} унвони мавзӯъ`);
}

// ═══ Д5 «мочь» (F9, R13) ═══
console.log('\n── Д5 мочь ──');
await set('GrammarExercise', await gex(4, ['Она ___ говорить по-русски.']), 'promptTranslated', 'Ӯ русӣ гап зада метавонад.', 'Д5 машқи 2: тарҷумаи пурра');
{
  const id = await gex(4, ['Ҷумларо созед:']);
  const want = { answer: 'Она может готовить.', options: ['может', 'Она', 'готовить'], promptTranslated: 'Ӯ пухта метавонад.', explanation: 'Она + может + готовить.' };
  await setRow('GrammarExercise', id, want, 'Д5 reorder: «танцевать» (наомӯхта) → «готовить»');
  await setRow('GrammarExercise', await gex(4, ['Ислоҳ кунед: Она может танцевает.', 'Ислоҳ кунед: Она может готовит.']),
    { prompt: 'Ислоҳ кунед: Она может готовит.', answer: 'Она может готовить.', promptTranslated: 'Пас аз «может» — масдар лозим.', explanation: 'может + масдар (-ть): готовить, на «готовит».' },
    'Д5 transform: «танцевает» (шакли вуҷуднадошта) → «готовит»');
}

// ═══ R9 · Д6 оҳанги саволӣ ═══
console.log('\n── R9 · Д6 ──');
{
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${L[5].gid}`;
  const ex = patch(t.explanation, '- Он работает здесь. → Он работает здесь?\n',
    '- Он работает здесь. → Он работает здесь?\n\nШаклҳои *работает*, *любишь* дар дарсҳои 7–8 шарҳ дода мешаванд — ин ҷо онҳоро ҳамчун ибораи тайёр гиред.\n', 'Д6');
  await set('GrammarTopic', L[5].gid, 'explanation', ex, 'Д6 тавзеҳ: шаклҳои феъл — ибораи тайёр');
  // ⚠️ Вариантҳо НАБОЯД танҳо бо «.» / «?» фарқ кунанд: `GrammarExerciseModel._normalize` (ва ҳатто
  // `_normalizeStrict`) аломатҳоро мепартояд — «здесь.» ва «здесь?» ҳарду «дуруст» мешуданд.
  // Фарқ дар КАЛИМА: калимаи иловагӣ («что», «оё») — маҳз нуқтаи дарс.
  const q1 = { answer: 'Он работает здесь?', options: ['Он работает здесь?', 'Что он работает здесь?', 'Оё он работает здесь?'], explanation: 'Тартиби калимаҳо ҳамон, танҳо «?» илова мешавад. Калимаи иловагӣ («что», «оё») лозим нест.' };
  checkChoice(q1.answer, q1.options, 'Д6-1');
  await setRow('GrammarExercise', await gex(5, ['Кадоме дуруст аст?']), q1, 'Д6 машқи 1: сарфи феъл (ҳанӯз наомӯхта) → оҳанги савол');
  const q2 = { answer: 'Ты любишь чай?', options: ['Что ты любишь чай?', 'Ты любишь чай?', 'Оё ты любишь чай?'], explanation: 'Ҳамон калимаҳо + «?». «Оё» тарҷума намешавад ва «что» илова намешавад.' };
  checkChoice(q2.answer, q2.options, 'Д6-2');
  await setRow('GrammarExercise', await gex(5, ['Ба русӣ «Оё ту чойро дӯст медорӣ?» чӣ гуна мешавад?']), q2, 'Д6 машқи 2');
}

// ═══ R7 · Д7 / Д8 — феълҳои номунтазам ═══
console.log('\n── R7 · Д7, Д8 ──');
{
  const [t7] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${L[6].gid}`;
  const IRR = '\n**Феълҳои номунтазам** — бандакҳо ҳамонанд, вале реша дигар мешавад. Онҳоро ҳамчун калима ёд гиред:\n\n'
    + '- есть → я **ем**, он **ест**\n- идти → я **иду**, он **идёт**\n- вставать → я **встаю**, он **встаёт**\n'
    + '- писать → я **пишу**, он **пишет**\n- хотеть → я **хочу**, он **хочет**\n- жить → я **живу**, они **живут**\n- пить → я **пью**, мы **пьём**\n\n'
    + 'Баъди ҳамсадо **-ю / -ют** → **-у / -ут** мешавад (живу, живут); агар зада ба бандак афтад, **е** → **ё** (пьём, идёт).\n';
  const A7 = 'Аксари феълҳое ки бо **-ать/-ять/-еть** тамом мешаванд, ба ин синф дохил мешаванд.\n';
  const ex7 = patch(t7.explanation, A7, A7 + IRR, 'Д7');
  if ((ex7.match(/⚡/g) || []).length !== 1) throw new Error('Д7: ⚡ бояд ягона монад');
  await set('GrammarTopic', L[6].gid, 'explanation', ex7, 'Д7 тавзеҳ: бахши «Феълҳои номунтазам»');
  await set('GrammarExercise', await gex(6, ['Они ___ в Худжанде. (жить)']), 'explanation', 'они → живут: баъди ҳамсадо «-ут» (феъли номунтазам).', 'Д7 «живут»');
  await set('GrammarExercise', await gex(6, ['Мы ___ чай. (пить)']), 'explanation', 'мы → пьём: зада дар бандак, «е» → «ё».', 'Д7 «пьём»');

  const [t8] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${L[7].gid}`;
  const A8 = 'Аксари феълҳое ки бо **-ить** тамом мешаванд, ба ин синф дохил мешаванд.\n';
  const ex8 = patch(t8.explanation, A8, A8 + '\nДиққат: баъзе феълҳо дар шакли **я** ҳарф иваз мекунанд — спать → я **сплю**, ты **спишь**; чистить → я **чищу**, ты **чистишь**. Бандакҳо ҳамон **-ишь, -ит…** мемонанд.\n', 'Д8');
  if ((ex8.match(/⚡/g) || []).length !== 1) throw new Error('Д8: ⚡ бояд ягона монад');
  await set('GrammarTopic', L[7].gid, 'explanation', ex8, 'Д8 тавзеҳ: «сплю», «чищу»');
}

// ═══ R5 · R13 · Д9 зарфҳои басомад ═══
console.log('\n── R5 · Д9 ──');
{
  const q4 = { answer: 'Иногда я', options: ['Всегда я', 'Иногда я', 'Никогда я'], explanation: 'Баъзан = иногда, ва «иногда» метавонад дар аввали ҷумла биёяд. «Никогда» бе «не» намеояд.' };
  checkChoice(q4.answer, q4.options, 'Д9-4');
  await setRow('GrammarExercise', await gex(8, ['___ читаю вечером.']), q4, 'Д9: «Я иногда» ҳам дуруст буд → варианти дуюми дуруст бардошта шуд');
  await setRow('GrammarExercise', await gex(8, ['Я ___ не опаздываю.', 'Я ___ не смотрю телевизор.']),
    { prompt: 'Я ___ не смотрю телевизор.', promptTranslated: 'Ман ҳеҷ гоҳ телевизор тамошо намекунам.' }, 'Д9: «опаздываю» (наомӯхта) → «смотрю телевизор»');
  await setRow('GrammarExercise', await gex(8, ['Они ___ устают утром.', 'Они ___ гуляют в парке.']),
    { prompt: 'Они ___ гуляют в парке.', promptTranslated: 'Онҳо баъзан дар боғ сайр мекунанд.' }, 'Д9: «устают» (наомӯхта) → «гуляют в парке»');
}

// ═══ F14 · Д10 ═══
console.log('\n── F14 · Д10 ──');
{
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${L[9].gid}`;
  const ex = patch(t.explanation, 'Дар ин модул феълҳои **умываться**, **просыпаться**, **ложиться**-ро омӯхтем.',
    'Дар ин модул феълҳои **умываться** ва **просыпаться**-ро омӯхтем; **ложиться** (хоб рафтан) низ ҳамин гуна аст.', 'Д10');
  await set('GrammarTopic', L[9].gid, 'explanation', ex, 'Д10 тавзеҳ: «ложиться-ро омӯхтем» (нодуруст) ислоҳ шуд');
  const r = await sql`SELECT id FROM "GrammarRule" WHERE "topicId"=${L[9].gid} AND note = ANY(${['просыпать + ся → я просыпаюсь', 'просыпаю + сь → я просыпаюсь']})`;
  if (r.length !== 1) throw new Error(`Д10 қоида: ${r.length}`);
  await set('GrammarRule', r[0].id, 'note', 'просыпаю + сь → я просыпаюсь', 'Д10 қоида: «просыпать» (феъли дигар) → «просыпаю + сь»');
}

// ═══ F3 · муколама (сатри 1) ═══
console.log('\n── F3 · муколама ──');
{
  const r = await sql`SELECT id FROM "DialogueLine" WHERE "dialogueId"=${L[12].did} AND text=${'Привет, Умар! Во сколько ты просыпаешься?'}`;
  if (r.length !== 1) throw new Error(`муколама: ${r.length}`);
  await set('DialogueLine', r[0].id, 'translation', 'Салом, Умар! Ту соати чанд бедор мешавӣ?', 'Д13 сатри 1: вергул ва ҳарфи калон');
}

// ═══ R4 · R15 · F8 · F11 · F12 · имтиҳон Q4–Q8 (ба матн вобаста нестанд) ═══
console.log('\n── R4/R15 · имтиҳон ──');
{
  const q = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[15].cid} ORDER BY "order", id`;
  if (q.length !== 8) throw new Error(`имтиҳон: ${q.length}`);
  const EXQ = [
    [3, "Переведите 'Ман китоб мехонам':", { question: 'Переведите «Ман китоб мехонам»:' }],
    [4, 'Выберите правильный глагол для «Он»:', { question: 'Он ___ здесь.', questionTranslated: 'Ӯ ин ҷо кор мекунад.',
      options: ['работаю', 'работает', 'работать'], correctIndex: 1,
      explanation: 'Бо «он / она» феъл бандаки -ет мегирад: он работает. («работаю» бо «я» меояд, «работать» масдар аст.)' }],
    [5, "Переведите 'Бедор шудан':", { question: 'Переведите «Бедор шудан»:', explanation: 'Бедор шудан = просыпаться. (хобидан = спать, сайр кардан = гулять.)' }],
    [6, 'Выберите правильный глагол: Она ___ телевизор вечером.', { question: 'Она ___ телевизор вечером.', questionTranslated: 'Ӯ бегоҳӣ телевизор тамошо мекунад.',
      options: ['смотрю', 'смотрит', 'смотреть'], correctIndex: 1,
      explanation: 'Бо «она» феъли гурӯҳи II бандаки -ит мегирад: она смотрит. («смотрю» — бо «я», «смотреть» — масдар.)' }],
    [7, "Переведите 'Хоб рафтан':", { question: 'Переведите «Сайр кардан»:', questionTranslated: '«Сайр кардан»-ро тарҷума кунед.',
      options: ['Бегать', 'Гулять', 'Плавать'], correctIndex: 1, explanation: 'Сайр кардан = гулять. Диққат: давидан = бегать, шино кардан = плавать.' }],
  ];
  for (const [i, old, want] of EXQ) {
    if (![old, want.question].includes(q[i].question)) throw new Error(`имтиҳон Q${i + 1}: «${q[i].question}»`);
    await setRow('ComprehensionQuestion', q[i].id, want, `имтиҳон Q${i + 1}`);
  }
}

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
