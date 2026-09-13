// МОДУЛИ 9-и РУСӢ (A1) «Города и направления» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module9_v2.md` (13.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 8` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// ⚠️ Транскрипсияи тоҷикӣ ҚАСДАН илова НАМЕШАВАД (қарори корбар, 12.09).
// Калимаҳои иваз мешуда, матнҳо, муколама ва мисолҳои грамматика (бо аудио) — `_ru-m9-media.mjs`.
//
//   node prisma/_ru-m9-fix.mjs           # dry-run
//   node prisma/_ru-m9-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';
import { exerciseSentence } from './_grammar-ex-text.mjs';

const sql = connect();
banner('RU · A1 · Модули 9 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[8].id;
const lessons = await sql`SELECT id,"order",title,"titleTranslated" tt,"grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 9 бояд 17 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[10].gid || !L[11].cid || !L[12].cid || !L[13].did || !L[14].cid || !L[16].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const regen = [];
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'emoji'],
  Lesson: ['title', 'titleTranslated'],
  ComprehensionExercise: ['title', 'titleTranslated'],
  GrammarTopic: ['explanation'],
  GrammarRule: ['note'],
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

const allWords = await sql`SELECT w.id,w.word,l."order" lo FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
  WHERE l."moduleId"=${MOD} ORDER BY l."order", w."order"`;
if (allWords.length !== 58) throw new Error(`модул: ${allWords.length} калима`);
const byWord = (w) => {
  const r = allWords.filter((x) => x.word === w);
  if (!r.length) throw new Error(`калима нест: ${w}`);
  return r;
};

// ═══ F1–F3, F5 · тарҷумаҳо ═══
console.log('\n── тарҷумаҳо ──');
const TR = {
  'Мост': 'Купрук',                       // буд «Пул» — дар Модули 8 «Деньги» = «Пул»
  'Поезд': 'Қатора',                       // буд «Поезд»
  'Вокзал': 'Вокзал (истгоҳи қатора)',     // буд «Истгоҳи поезд»
  'Ехать': 'Рафтан (бо нақлиёт)',          // буд «Бо мошин рафтан», вале «еду на автобусе»
};
for (const [w, t] of Object.entries(TR)) for (const row of byWord(w)) await set('Word', row.id, 'translation', t, `Д${row.lo + 1} «${w}» → «${t}»`);

// ═══ R7 · мисолҳо бо калимаҳои омӯхта ═══
// Мисол бояд калимаи кортро (решаи 4-ҳарфа) дошта бошад. Самтҳо (Д7) дар шакли хабарӣ меоянд —
// «Поверни» (ба «ту») то дарси грамматика омӯзонида намешавад ва ба бегона нодуруст аст (R1).
console.log('\n── R7 · мисолҳо ──');
const EX = {
  'Супермаркет': ['Супермаркет большой.', 'Супермаркет калон аст.'],
  'Музей': ['Музей рядом с парком.', 'Осорхона дар паҳлӯи боғ аст.'],
  'Кинотеатр': ['Кинотеатр рядом с кафе.', 'Кинотеатр дар паҳлӯи қаҳвахона аст.'],
  'Почта': ['Почта рядом с банком.', 'Почта дар паҳлӯи бонк аст.'],
  'Полицейский участок': ['Где полицейский участок?', 'Идораи полис дар куҷост?'],
  'Автобус': ['Где автобус?', 'Автобус дар куҷост?'],
  'Такси': ['Где такси?', 'Такси дар куҷост?'],
  'Машина': ['Это моя машина.', 'Ин мошини ман аст.'],
  'Велосипед': ['У меня есть велосипед.', 'Ман дучарха дорам.'],
  'Самолёт': ['Самолёт большой.', 'Ҳавопаймо калон аст.'],
  'Автобусная остановка': ['Где автобусная остановка?', 'Истгоҳи автобус дар куҷост?'],
  'Налево': ['Аптека налево.', 'Дорухона дар тарафи чап аст.'],
  'Направо': ['Банк направо.', 'Бонк дар тарафи рост аст.'],
  'Прямо': ['Вокзал прямо.', 'Вокзал рост дар пеш аст.'],
  'Светофор': ['Светофор рядом с банком.', 'Чароғаки роҳ дар паҳлӯи бонк аст.'],
  'Перекрёсток': ['Банк на перекрёстке.', 'Бонк дар чорраҳа аст.'],
  'Мост': ['Мост рядом с парком.', 'Купрук дар паҳлӯи боғ аст.'],
  'Далеко': ['Вокзал далеко.', 'Вокзал дур аст.'],
  'Ехать': ['Я еду на автобусе.', 'Ман бо автобус меравам.'],
};
// Феъли беқоида решаи дигар дорад: ехать → еду.
const STEM = { 'Ехать': ['еду'] };
for (const [w, [ex, tr]] of Object.entries(EX)) {
  const toks = norm(ex).split(' ');
  for (const part of STEM[w] ?? w.toLowerCase().split(' ')) {
    if (!toks.some((t) => t.startsWith(part.slice(0, 4)))) throw new Error(`мисол калимаи худро надорад: ${w}`);
  }
  for (const row of byWord(w)) await setRow('Word', row.id, { example: ex, exampleTrans: tr }, `Д${row.lo + 1} «${w}».example`);
}
const EXTR = { 'Поезд': 'Қатора тез аст.' };
for (const [w, t] of Object.entries(EXTR)) for (const row of byWord(w)) await set('Word', row.id, 'exampleTrans', t, `Д${row.lo + 1} «${w}».exampleTrans`);

// ═══ R11 · эмоҷӣ ═══
// «Угол» 📐 (секунҷаи расмкашӣ) исми расмшаванда аст → «Ин чист? 📐» гумроҳ мекард.
// 📍 дар `_kPickBlockedEmojis` аст → савол хомӯш мешавад. «Напротив» пешоянд аст (расм намегирад).
console.log('\n── R11 · эмоҷӣ ──');
const EMO = { 'Угол': '📍', 'Напротив': '↕️' };
for (const [w, e] of Object.entries(EMO)) for (const row of byWord(w)) await set('Word', row.id, 'emoji', e, `Д${row.lo + 1} «${w}».emoji`);

// ═══ R11 · F8 · F9 · унвонҳо ═══
console.log('\n── унвонҳо ──');
{
  const want12 = { title: 'Чтение: Где вокзал?', titleTranslated: 'Хониш: вокзал дар куҷост?' };
  if (!['Сохтани самтов', want12.title].includes(L[11].title)) throw new Error(`Д12 унвон: «${L[11].title}»`);
  await setRow('Lesson', L[11].id, want12, 'Д12 унвони дарс («Сохтани самтов»)');
  await setRow('ComprehensionExercise', L[11].cid, want12, 'Д12 унвони машқи хониш');
  if (!['Дорухона дар куҷост?', 'Где аптека?'].includes(L[16].title)) throw new Error(`Д17 унвон: «${L[16].title}»`);
  await set('Lesson', L[16].id, 'title', 'Где аптека?', 'Д17 унвони русӣ (буд тоҷикӣ)');
  await set('ComprehensionExercise', L[16].cid, 'title', 'Где аптека?', 'Д17 унвони машқи имтиҳон');
}

// ═══ R1 · R10 · Д11 «Повелительное наклонение» ═══
console.log('\n── R1 · R10 · Д11 ──');
{
  const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${L[10].gid}`;
  let e = t.explanation;
  const oldNeg = 'Инкор: **Не** + феъли амрӣ → **Не сворачивай!** (Нагард!).';
  const newNeg = 'Инкор: **Не** + феъли амрӣ → **Не поворачивай!** (Нагард!).';
  const anchor = '- **Остановись** здесь. — Ин ҷо ист.';
  const formal = '- Ба бегона ва калонсол — шакли расмӣ бо **-те**: **Идите** прямо. **Поверните** налево. **Остановитесь** здесь.';
  if (!e.includes(newNeg)) { if (!e.includes(oldNeg)) throw new Error('Д11: сатри инкор ёфт нашуд'); e = e.replace(oldNeg, newNeg); }
  if (!e.includes(formal)) { if (!e.includes(anchor)) throw new Error('Д11: сатри «Остановись» ёфт нашуд'); e = e.replace(anchor, `${anchor}\n${formal}`); }
  await set('GrammarTopic', L[10].gid, 'explanation', e, 'Д11 шарҳ: шакли расмӣ «Идите / Поверните» + «Не поворачивай»');
  const rules = await sql`SELECT id,note FROM "GrammarRule" WHERE "topicId"=${L[10].gid}`;
  const RN = [
    [/^Иди! Поверни! (Остановись!|· ба «шумо»)/, 'Иди! Поверни! · ба «шумо»: Идите! Поверните!'],
    [/^Не (сворачивай|поворачивай) направо!$/, 'Не поворачивай направо!'],
  ];
  for (const [re, note] of RN) {
    const r = rules.filter((x) => re.test(x.note ?? ''));
    if (r.length !== 1) throw new Error(`Д11 қоида ${re}: ${r.length}`);
    await set('GrammarRule', r[0].id, 'note', note, `Д11 қоида: «${note}»`);
  }
}
async function setExercise(oldPrompt, want, label) {
  const r = await sql`SELECT id,type,prompt,answer FROM "GrammarExercise" WHERE "topicId"=${L[10].gid} AND prompt = ANY(${[oldPrompt, want.prompt ?? oldPrompt]})`;
  if (r.length !== 1) throw new Error(`Д11 машқи «${oldPrompt}»: ${r.length}`);
  const row = r[0];
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
await setExercise('___ прямо, потом поверни налево.', {
  options: ['Иди', 'Идёшь', 'Идти', 'Идите'],
  explanation: 'Ба «ту» → Иди. (Ба «шумо» — Идите.)',
}, 'Д11 машқи 1: «Идущий» (сифати феълӣ) → «Идите»');
await setExercise('___ налево у банка.', {
  options: ['Поворачиваешь', 'Поверни', 'Поворачивать', 'Поверните'],
  explanation: 'Ба «ту» → Поверни. (Ба «шумо» — Поверните.)',
}, 'Д11 машқи 2: «Повернувший» → «Поверните»');
await setExercise('Ислоҳ кунед: Ты идёшь прямо.', {
  prompt: 'Ба бегона гӯед: Иди прямо.',
  promptTranslated: 'Шакли расмӣ — ба «шумо».',
  answer: 'Идите прямо.',
  explanation: 'Ба бегона → -те: Идите прямо.',
}, 'Д11 машқи 7: шакли расмӣ (R1)');

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
if (regen.length) console.log(`аудиои машқ аз нав: node prisma/_grammar-ex-audio.mjs --gen --lang ru --regen ${regen.join(',')}`);
