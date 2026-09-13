// МОДУЛИ 12-и РУСӢ (A1) «Природа, школа и чувства» — Фазаи 1: ислоҳи МАЗМУН (бе аудио).
//
// Асос: `Digital_Students_Report_RU_A1_Module12_v2.md` (13.09.2026).
// ДОИРА — ТАНҲО РУСӢ: `_ru-mod-precheck.mjs 11` → ҳар ҷузъ танҳо ба ЯК дарси ҳамин модул.
// ⚠️ Транскрипсияи тоҷикӣ ҚАСДАН илова НАМЕШАВАД (қарори корбар, 12.09).
// «Кабинет» → «Парта», матнҳо, муколама ва сабтҳо — `_ru-m12-media.mjs`.
//
//   node prisma/_ru-m12-fix.mjs           # dry-run
//   node prisma/_ru-m12-fix.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';
import { exerciseSentence } from './_grammar-ex-text.mjs';

const sql = connect();
banner('RU · A1 · Модули 12 — ислоҳи мазмун (Фазаи 1)');

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const MOD = mods[11].id;
const lessons = await sql`SELECT id,"order",title,"titleTranslated" tt,"grammarTopicId" gid,"comprehensionId" cid,"dialogueId" did
  FROM "Lesson" WHERE "moduleId"=${MOD} ORDER BY "order"`;
if (lessons.length !== 20) throw new Error(`Модули 12 бояд 20 дарс дошта бошад, ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (!L[12].gid || !L[13].gid || !L[14].cid || !L[15].cid || !L[16].did || !L[17].cid || !L[19].cid) throw new Error('сохтори модул ғайричашмдошт');

let changed = 0, already = 0;
const regen = [];
const ALLOW = {
  Word: ['translation', 'example', 'exampleTrans', 'emoji'],
  Lesson: ['title', 'titleTranslated'],
  ComprehensionExercise: ['title', 'titleTranslated'],
  Dialogue: ['title'],
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
if (allWords.length !== 82) throw new Error(`модул: ${allWords.length} калима`);
const byWord = (w) => {
  if (w === 'Кабинет') throw new Error('«Кабинет» дар media иваз мешавад');
  const r = allWords.filter((x) => x.word === w);
  if (!r.length) throw new Error(`калима нест: ${w}`);
  return r;
};

// ═══ F1 · F2 · тарҷумаҳо ═══
console.log('\n── тарҷумаҳо ──');
const TR = { 'Птица': 'Парранда', 'Весёлый': 'Шод (хурсанд)' };
for (const [w, t] of Object.entries(TR)) for (const row of byWord(w)) await set('Word', row.id, 'translation', t, `Д${row.lo + 1} «${w}» → «${t}»`);

// ═══ R5 · F4 · мисолҳо ═══
console.log('\n── R5 · мисолҳо ──');
const EX = {
  'Солнце': ['Солнце жёлтое.', 'Офтоб зард аст.'],
  'Облако': ['Облако белое.', 'Абр сафед аст.'],
  'Жаркий': ['Жаркий день.', 'Рӯзи сӯзон.'],
  'Весна': ['Весна тёплая.', 'Баҳор гарм аст.'],
  'Лето': ['Лето жаркое.', 'Тобистон сӯзон аст.'],
  'Осень': ['Осень красивая.', 'Тирамоҳ зебо аст.'],
  'Птица': ['Птица маленькая.', 'Парранда хурд аст.'],
  'Корова': ['Корова большая.', 'Гов калон аст.'],
  'Змея': ['Змея длинная.', 'Мор дароз аст.'],
  'Лес': ['Лес большой.', 'Ҷангал калон аст.'],
  'Озеро': ['Озеро большое.', 'Кӯл калон аст.'],
  'Звезда': ['Звезда яркая.', 'Ситора равшан аст.'],
  'Доска': ['Доска зелёная.', 'Тахта сабз аст.'],
  'Урок': ['Урок длинный.', 'Дарс дароз аст.'],
  'Домашнее задание': ['Это домашнее задание.', 'Ин вазифаи хонагӣ аст.'],
  'Ответ': ['Это мой ответ.', 'Ин ҷавоби ман аст.'],
  'Любить': ['Я люблю лето.', 'Ман тобистонро дӯст медорам.'],
  'Смеяться': ['Он смеётся.', 'Ӯ механдад.'],
  'Плакать': ['Она плачет.', 'Ӯ гиря мекунад.'],
  'Испуганный': ['Кошка испуганная.', 'Гурба тарсида аст.'],
  'Слабый': ['Он слабый.', 'Ӯ заиф аст.'],
  'Весёлый': ['Он весёлый.', 'Ӯ шод аст.'],
};
// Феълҳои беқоида решаи дигар доранд.
const STEM = { 'Смеяться': ['смеё'], 'Плакать': ['плач'], 'Любить': ['любл'] };
const BAD = /^(вижу|умеет|даёт|боюсь|раскрываются|падают|плаваем|посмотрите|начинается|каждый|свою|дети|ребёнок|правильный|слабость)$/;
for (const [w, [ex, tr]] of Object.entries(EX)) {
  const toks = norm(ex).split(' ');
  for (const part of STEM[w] ?? w.toLowerCase().split(' ')) {
    if (!toks.some((t) => t.startsWith(part.slice(0, 4)))) throw new Error(`мисол калимаи худро надорад: ${w}`);
  }
  if (toks.some((t) => BAD.test(t))) throw new Error(`«${w}»: калимаи наомӯхта дар мисол`);
  for (const row of byWord(w)) await setRow('Word', row.id, { example: ex, exampleTrans: tr }, `Д${row.lo + 1} «${w}».example`);
}

// ═══ R10 · эмоҷӣ ═══
console.log('\n── R10 · эмоҷӣ ──');
for (const row of byWord('Питомец')) await set('Word', row.id, 'emoji', '🐹', `Д${row.lo + 1} «Питомец» 🐕 → 🐹 (дар ҳамон дарс «Собака» 🐶)`);

// ═══ R7 · унвонҳо ═══
console.log('\n── R7 · унвонҳо ──');
{
  if (!['Сохтмони грамматикӣ', 'Грамматика: Описание вещей'].includes(L[12].title)) throw new Error(`Д13 унвон: «${L[12].title}»`);
  await set('Lesson', L[12].id, 'title', 'Грамматика: Описание вещей', 'Д13 унвони русӣ (буд «Сохтмони грамматикӣ»)');
  const w15 = { title: 'Чтение: В зоопарке', titleTranslated: 'Хониш: дар боғи ҳайвонот' };
  if (!['Составление предложений о природе', w15.title].includes(L[14].title)) throw new Error(`Д15 унвон: «${L[14].title}»`);
  await setRow('Lesson', L[14].id, w15, 'Д15 унвони дарс (матни нав — боғи ҳайвонот)');
  await setRow('ComprehensionExercise', L[14].cid, w15, 'Д15 унвони машқи хониш');
  const [d] = await sql`SELECT title FROM "Dialogue" WHERE id=${L[16].did}`;
  if (!['Talking About The Weather', 'Разговор о погоде'].includes(d.title)) throw new Error(`Д17 унвон: «${d.title}»`);
  await set('Dialogue', L[16].did, 'title', 'Разговор о погоде', 'Д17 унвони муколама (англисӣ → русӣ)');
}

// ═══ R8 · F5 · Д13 машқи «Я ___.» ═══
console.log('\n── R8 · Д13 ──');
{
  const want = {
    prompt: 'Он ___.',
    promptTranslated: 'Ӯ (мард) хоболуд аст.',
    explanation: 'Фоили мардона («он») → сонный. (Зан — «она сонная».)',
  };
  const r = await sql`SELECT id,type,prompt,answer FROM "GrammarExercise" WHERE "topicId"=${L[12].gid} AND prompt = ANY(${['Я ___.', want.prompt]})`;
  if (r.length !== 1) throw new Error(`Д13 машқи «Я ___.»: ${r.length}`);
  const before = exerciseSentence(r[0], 'ru').text;
  const after = exerciseSentence({ type: r[0].type, prompt: want.prompt, answer: r[0].answer }, 'ru');
  if (!after.text) throw new Error(`Д13: ҷумлаи аудио сохта намешавад (${after.reason})`);
  if (before !== after.text) {
    regen.push(r[0].id);
    console.log(`      (аудио: «${before}» → «${after.text}» — аз нав сабт мешавад)`);
    await setRow('GrammarExercise', r[0].id, { ...want, audioUrl: null }, 'Д13 машқ: «Я ___.» ду ҷавоби дуруст дошт (сонный/сонная)');
  } else await setRow('GrammarExercise', r[0].id, want, 'Д13 машқ');
}

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
if (regen.length) console.log(`аудиои машқ аз нав: node prisma/_grammar-ex-audio.mjs --gen --lang ru --regen ${regen.join(',')}`);
