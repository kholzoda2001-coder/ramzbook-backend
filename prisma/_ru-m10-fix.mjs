// МОДУЛИ 10-и РУСӢ (A1) «Одежда и цвета» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module10_v2.md` (13.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 9` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// ⚠️ Транскрипсияи тоҷикӣ ҚАСДАН илова НАМЕШАВАД (қарори корбар, 12.09).
// Калимаҳои такрорӣ (R1), матнҳо, муколама ва сабтҳо — дар `_ru-m10-media.mjs`.
// Ин скрипт ба калимаҳое, ки иваз мешаванд, даст НАМЕЗАНАД.
//
//   node prisma/_ru-m10-fix.mjs           # dry-run
//   node prisma/_ru-m10-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';
import { exerciseSentence } from './_grammar-ex-text.mjs';

const sql = connect();
banner('RU · A1 · Модули 10 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[9].id;
const lessons = await sql`SELECT id,"order",title,"titleTranslated" tt,"grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 18) throw new Error(`Модули 10 бояд 18 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[10].gid || !L[11].gid || !L[12].cid || !L[13].cid || !L[14].did || !L[15].cid || !L[17].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const regen = [];
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'emoji'],
  Lesson: ['title', 'titleTranslated'],
  ComprehensionExercise: ['title', 'titleTranslated'],
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

const allWords = await sql`SELECT w.id,w.word,l."order" lo FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
  WHERE l."moduleId"=${MOD} ORDER BY l."order", w."order"`;
if (allWords.length !== 72) throw new Error(`модул: ${allWords.length} калима`);
// Калимаҳое, ки `_ru-m10-media.mjs` иваз мекунад — ин ҷо даст намезанем.
const REPLACED = new Set(['Рубашка', 'Брюки', 'Обувь', 'Куртка', 'Платье', 'Носки', 'Кепка', 'Сумка', 'Рюкзак', 'Шляпа',
  'Кошелёк', 'Старый', 'Чистый', 'Грязный', 'Чёрно-синий']);
const byWord = (w) => {
  if (REPLACED.has(w)) throw new Error(`«${w}» дар media иваз мешавад`);
  const r = allWords.filter((x) => x.word === w);
  if (!r.length) throw new Error(`калима нест: ${w}`);
  return r;
};

// ═══ F5 · тарҷума ═══
console.log('\n── тарҷума ──');
for (const row of byWord('Приятный')) await set('Word', row.id, 'translation', 'Форам', `Д${row.lo + 1} «Приятный» → «Форам» (буд «Хуб» = «Хороший»-и М8)`);

// ═══ R8 · F6 · F7 · мисолҳо ═══
// Бе феъли «носить» (дар Д11 омӯзонида мешавад) ва бе калимаҳои наомӯхта. Калимаҳои ИВАЗШАВАНДА
// дар мисолҳо истифода намешаванд (Рубашка/Платье… омӯхта аз М8 боқӣ мемонанд — онҳо мумкин).
console.log('\n── R8 · мисолҳо ──');
const EX = {
  'Розовый': ['Розовое платье.', 'Пироҳани гулобӣ.'],
  'Бордовый': ['Бордовый цвет.', 'Ранги сурхи тира.'],
  'Тёмно-синий': ['Рубашка тёмно-синяя.', 'Курта кабуди тира аст.'],
  'Бледный': ['Бледный цвет.', 'Ранги хира.'],
  'Перчатки': ['Перчатки серые.', 'Дастпӯшак хокистарранг аст.'],
  'Шорты': ['Шорты синие.', 'Шорт кабуд аст.'],
  'Свитер': ['Свитер бежевый.', 'Свитер ранги беж аст.'],
  'Костюм': ['Костюм чёрный.', 'Костюм сиёҳ аст.'],
  'Кроссовки': ['Кроссовки белые.', 'Кроссовка сафед аст.'],
  'Очки': ['Это мои очки.', 'Ин айнаки ман аст.'],
  'Шарф': ['Шарф красный.', 'Шарф сурх аст.'],
  'Серьги': ['Серьги золотые.', 'Гӯшвор тиллоӣ аст.'],
  'Солнечные очки': ['Это солнечные очки.', 'Ин айнаки офтобӣ аст.'],
  'Красивый': ['Платье красивое.', 'Пироҳан зебо аст.'],
  'Приятный': ['Приятный цвет.', 'Ранги форам.'],
  'Короткий': ['Юбка короткая.', 'Доман кӯтоҳ аст.'],
  'Удобный': ['Обувь удобная.', 'Пойафзол бароҳат аст.'],
};
for (const [w, [ex, tr]] of Object.entries(EX)) {
  const toks = norm(ex).split(' ');
  for (const part of w.toLowerCase().split(' ')) {
    if (!toks.some((t) => t.startsWith(part.slice(0, 4)))) throw new Error(`мисол калимаи худро надорад: ${w}`);
  }
  // Танҳо ОҒОЗИ калима: «тёмно-синяя» → «тёмносиняя» дар дохил «носи» дорад (13.09.2026).
  if (toks.some((t) => /^(нош|носи)/.test(t))) throw new Error(`«${w}»: феъли «носить» то Д11 омӯзонида нашудааст`);
  for (const row of byWord(w)) await setRow('Word', row.id, { example: ex, exampleTrans: tr }, `Д${row.lo + 1} «${w}».example`);
}

// ═══ R9 · эмоҷӣ ═══
// Сифатҳо расм намегиранд (`_isPicturable` танҳо исм). «Ремень» исм аст ва акс дорад — эмоҷӣ танҳо
// ҳангоми набудани акс дида мешавад.
console.log('\n── R9 · эмоҷӣ ──');
const EMO = {
  'Серый': '🩶', 'Серебристый': '🥈', 'Золотой': '🥇', 'Тёмно-синий': '🌃', 'Бежевый': '🟫', 'Бледный': '🤍',
  'Ремень': '🪢', 'Большой': '🐘', 'Маленький': '🐭', 'Удобный': '🛋️', 'Некрасивый': '👎',
  'Короткий': '🩳', 'Тесный': '🤏', 'Свободный': '👐',
};
for (const [w, e] of Object.entries(EMO)) for (const row of byWord(w)) await set('Word', row.id, 'emoji', e, `Д${row.lo + 1} «${w}».emoji`);

// ═══ R11 · унвонҳо ═══
console.log('\n── R11 · унвонҳо ──');
{
  const w13 = { title: 'Чтение: Моя семья', titleTranslated: 'Хониш: оилаи ман' };
  if (!['Сохтани одежды', w13.title].includes(L[12].title)) throw new Error(`Д13 унвон: «${L[12].title}»`);
  await setRow('Lesson', L[12].id, w13, 'Д13 унвони дарс («Сохтани одежды»)');
  await setRow('ComprehensionExercise', L[12].cid, w13, 'Д13 унвони машқи хониш');
  const w18 = { title: 'Сара и Али', titleTranslated: 'Сара ва Алӣ' };
  if (!['Посмотрите на моих друзей', w18.title].includes(L[17].title)) throw new Error(`Д18 унвон: «${L[17].title}»`);
  await setRow('Lesson', L[17].id, w18, 'Д18 унвон («Посмотрите на моих друзей» — калимаҳои наомӯхта)');
  await setRow('ComprehensionExercise', L[17].cid, w18, 'Д18 унвони машқи имтиҳон');
}

// ═══ R7 · F3 · F4 · Д11 «Настоящее время» ═══
console.log('\n── R7 · Д11 ──');
{
  const rules = await sql`SELECT id,note FROM "GrammarRule" WHERE "topicId"=${L[10].gid}`;
  const RN = [
    [/I am wearing|^Я ношу = ман мепӯшам/, 'Я ношу = ман мепӯшам — ҳам одат, ҳам ҳозир.'],
    [/Are you working|шакли алоҳидаи «?давомдор»? нест/, 'Ты работаешь? — шакли алоҳидаи «давомдор» нест.'],
  ];
  for (const [re, note] of RN) {
    const r = rules.filter((x) => re.test(x.note ?? ''));
    if (r.length !== 1) throw new Error(`Д11 қоида ${re}: ${r.length}`);
    await set('GrammarRule', r[0].id, 'note', note, `Д11 қоида бе англисӣ: «${note}»`);
  }
  const exs = await sql`SELECT id,sentence FROM "GrammarExample" WHERE "topicId"=${L[10].gid}`;
  const ET = { 'Я ношу синюю рубашку.': 'Ман куртаи кабуд мепӯшам.', 'Она носит красное платье.': 'Ӯ пироҳани сурх мепӯшад.' };
  for (const [s, t] of Object.entries(ET)) {
    const r = exs.filter((x) => x.sentence === s);
    if (r.length !== 1) throw new Error(`Д11 мисол «${s}»: ${r.length}`);
    await set('GrammarExample', r[0].id, 'translation', t, `Д11 мисол «${s}» — тарҷумаи замони ҳозира`);
  }
}
async function setExercise(gid, lo, oldPrompt, want, label) {
  const r = await sql`SELECT id,type,prompt,answer FROM "GrammarExercise" WHERE "topicId"=${gid} AND prompt = ANY(${[oldPrompt, want.prompt ?? oldPrompt]})`;
  if (r.length !== 1) throw new Error(`Д${lo + 1} машқи «${oldPrompt}»: ${r.length}`);
  const row = r[0];
  const next = { type: row.type, prompt: want.prompt ?? row.prompt, answer: want.answer ?? row.answer };
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
await setExercise(L[10].gid, 10, 'Я ___ шляпу.', { promptTranslated: 'Ман кулоҳ мепӯшам.' }, 'Д11 машқи 1: тарҷумаи замони ҳозира');
await setExercise(L[10].gid, 10, 'Ба савол гузаронед: Ты работаешь.', {
  prompt: 'Ба «мы» гузаронед: Я читаю книгу.',
  promptTranslated: 'Я → мы.',
  answer: 'Мы читаем книгу.',
  explanation: 'Бо «мы» → читаем.',
}, 'Д11 машқи 8: ҷавоб ба худи савол баробар буд (R7)');

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
if (regen.length) console.log(`аудиои машқ аз нав: node prisma/_grammar-ex-audio.mjs --gen --lang ru --regen ${regen.join(',')}`);
