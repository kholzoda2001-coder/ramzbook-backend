// МОДУЛИ 8-и РУСӢ (A1) «Покупки» — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R3   Д10: «Нуждаться» → «Нужно», «Возвращать» → «Вернуть», «Примерять» → «Примерить»
//        (калимаи корт бо мисол мувофиқ нест буд). Ҳамон сатри `Word` нав мешавад → кортҳои SRS солим.
//   R14  «Наличные» (Д1) ва «Платить» (Д17) — клиппинг → сабти нав.
//   R6   Д13 хониш: «даёт», «его/ему», савол-грамматика → матн ва 4 саволи фаҳмиш.
//   R8   Д14 шунавоӣ: «даёт», «находится», тавзеҳҳои русӣ, «курти сурх» (матн қариб ҳамон, сабти нав — клиппинг).
//   R7   Д16 такрор: «Давайте повторим», «одежда», «Куда» → матни нав + 4 савол.
//   R4   Д18 имтиҳон: «с мамой», «спрашивает», «мальчик», «Выберите», «Как будет», «Менеджер».
//   R2   Д15 муколама: «Да.» ХОМӮШ, «Могу я её купить?» → ҳама 8 сатр бо ЯК овоз.
//   R1   Д12 мисоли «То большой дом.» → «Тот дом большой.»
// Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m8-media.mjs           # dry-run
//   node prisma/_ru-m8-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m8-media';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const check = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths], PY);
  if (r.status !== 0) throw new Error(r.stderr);
  return { m: JSON.parse(r.stdout), err: r.stderr };
};
const lc = (s) => s.toLowerCase();

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did,"grammarTopicId" gid FROM "Lesson" WHERE "moduleId"=${mods[7].id} ORDER BY "order"`;
if (lessons.length !== 18) throw new Error(`Модули 8: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

// ── Калимаҳо ──
const WORDS = [
  { lo: 9, old: 'Нуждаться', word: 'Нужно', translation: 'Лозим аст', emoji: '❗', pos: 'adverb',
    example: 'Мне нужно купить хлеб.', exampleTrans: 'Ман бояд нон харам.' },
  { lo: 9, old: 'Возвращать', word: 'Вернуть', translation: 'Баргардонидан', emoji: '↩️', pos: 'verb',
    example: 'Я хочу это вернуть.', exampleTrans: 'Ман мехоҳам инро баргардонам.' },
  { lo: 9, old: 'Примерять', word: 'Примерить', translation: 'Пӯшида дидан', emoji: '👕', pos: 'verb',
    example: 'Можно это примерить?', exampleTrans: 'Метавонам инро пӯшида бинам?' },
];
const RERECORD = [{ lo: 0, word: 'Наличные' }, { lo: 16, word: 'Платить' }];

// ── Матнҳо ──
const PLAN = [
  {
    lo: 12, label: 'Д13 хониш',
    old: 'Я в магазине. Эта рубашка дешёвая, но та куртка дорогая. Сколько стоит рубашка? Она стоит десять долларов. Я хочу купить эти туфли. У меня есть деньги в пакете. Я плачу кассиру, и она даёт мне чек.',
    text: 'Я в магазине. Эта рубашка дешёвая, но та куртка дорогая. Сколько стоит рубашка? Рубашка стоит десять долларов. Я хочу купить эти туфли. Мои деньги в пакете. Я плачу картой. Вот мой чек.',
    tr: 'Ман дар мағоза ҳастам. Ин курта арзон аст, вале он куртка қимат аст. Курта чанд пул аст? Курта даҳ доллар аст. Ман мехоҳам ин туфлиҳоро харам. Пулам дар халта аст. Ман бо корт пардохт мекунам. Инак расиди ман.',
    count: 4,
    update: [
      { i: 0, old: 'Дополните: ___ рубашка дешёвая.', question: 'Какая рубашка?', qt: 'Курта чӣ гуна аст?',
        options: ['Дешёвая', 'Дорогая', 'Новая'], ci: 0, key: 'дешёвая', ex: 'Дар матн: «Эта рубашка дешёвая» — курта арзон аст.' },
      { i: 1, old: 'Сколько стоит рубашка?', question: 'Сколько стоит рубашка?', qt: 'Курта чанд пул аст?',
        options: ['Пять долларов', 'Десять долларов', 'Двадцать долларов'], ci: 1, key: 'десять долларов', ex: 'Дар матн: «Рубашка стоит десять долларов» — даҳ доллар.' },
      { i: 2, old: 'Где его деньги?', question: 'Где деньги?', qt: 'Пул дар куҷост?',
        options: ['В магазине', 'На столе', 'В пакете'], ci: 2, key: 'в пакете', ex: 'Дар матн: «Мои деньги в пакете» — дар халта.' },
      { i: 3, old: 'Что даёт ему кассир?', question: 'Как я плачу?', qt: 'Ман чӣ гуна пардохт мекунам?',
        options: ['Наличными', 'Картой', 'Монетами'], ci: 1, key: 'картой', ex: 'Дар матн: «Я плачу картой» — бо корт.' },
    ],
  },
  {
    lo: 13, label: 'Д14 шунавоӣ',
    old: 'Я в магазине. Я хочу купить красную рубашку. Извините, сколько это стоит? Это стоит десять долларов. Это не дорого. У меня есть деньги. Вот, пожалуйста. Большое спасибо. Кассир даёт мне чек. Мой друг хочет купить чёрные брюки, но они дорогие.',
    text: 'Я в магазине. Я хочу купить красную рубашку. Извините, сколько это стоит? Это стоит десять долларов. Это не дорого. У меня есть деньги. Вот, пожалуйста. Большое спасибо. Вот мой чек. Мой друг хочет купить чёрные брюки, но они дорогие.',
    tr: 'Ман дар мағоза ҳастам. Ман мехоҳам куртаи сурх харам. Бубахшед, ин чанд пул аст? Ин даҳ доллар аст. Ин қимат нест. Ман пул дорам. Марҳамат. Ташаккури зиёд. Инак расиди ман. Дӯстам мехоҳад шими сиёҳ харад, вале шим қимат аст.',
    count: 4,
    update: [
      { i: 0, old: 'Что он хочет купить?', question: 'Что я хочу купить?', qt: 'Ман чӣ харидан мехоҳам?',
        options: ['Красную рубашку', 'Чёрные брюки', 'Кепку'], ci: 0, key: 'красную рубашку', ex: 'Дар матн: «Я хочу купить красную рубашку» — куртаи сурх.' },
      { i: 1, old: 'Сколько это стоит?', question: 'Сколько это стоит?', qt: 'Ин чанд пул аст?',
        options: ['Пять долларов', 'Десять долларов', 'Двадцать долларов'], ci: 1, key: 'десять долларов', ex: 'Дар матн: «Это стоит десять долларов» — даҳ доллар.' },
      { i: 2, old: 'Это дорого?', question: 'Это дорого?', qt: 'Ин қимат аст?',
        options: ['Очень', 'Да', 'Нет'], ci: 2, key: null, ex: 'Дар матн: «Это не дорого» — қимат нест.' },
      { i: 3, old: 'Где он находится?', question: 'Что хочет купить друг?', qt: 'Дӯстам чӣ харидан мехоҳад?',
        options: ['Кепку', 'Чёрные брюки', 'Красную рубашку'], ci: 1, key: 'чёрные брюки', ex: 'Дар матн: «Мой друг хочет купить чёрные брюки» — шими сиёҳ.' },
    ],
  },
  {
    lo: 15, label: 'Д16 такрор',
    old: 'Давайте повторим покупки! Мне нужна новая одежда. Я иду в магазин с деньгами. Я хочу купить красную рубашку и чёрные брюки. Я плачу кассиру.',
    text: 'Я иду в магазин. У меня есть деньги и список. Мне нужно купить хлеб и молоко. Я хочу купить красную рубашку и чёрные брюки. Рубашка дешёвая, но брюки дорогие. Я плачу картой.',
    tr: 'Ман ба мағоза меравам. Ман пул ва рӯйхат дорам. Ман бояд нон ва шир харам. Ман мехоҳам куртаи сурх ва шими сиёҳ харам. Курта арзон аст, вале шим қимат аст. Ман бо корт пардохт мекунам.',
    count: 2,
    update: [
      { i: 0, old: 'Куда я иду?', question: 'Что у меня есть?', qt: 'Ман чӣ дорам?',
        options: ['Деньги и список', 'Хлеб и молоко', 'Сок и яйца'], ci: 0, key: 'деньги и список', ex: 'Дар матн: «У меня есть деньги и список» — пул ва рӯйхат.' },
      { i: 1, old: 'Что я хочу купить?', question: 'Что я хочу купить?', qt: 'Ман чӣ харидан мехоҳам?',
        options: ['Кепку', 'Красную рубашку', 'Куртку'], ci: 1, key: 'красную рубашку', ex: 'Дар матн: «Я хочу купить красную рубашку и чёрные брюки» — куртаи сурх.' },
    ],
    insert: [
      { order: 2, question: 'Что мне нужно купить?', qt: 'Ман бояд чӣ харам?',
        options: ['Хлеб и молоко', 'Сок и яйца', 'Курицу'], ci: 0, key: 'хлеб и молоко', ex: 'Дар матн: «Мне нужно купить хлеб и молоко» — нон ва шир.' },
      { order: 3, question: 'Как я плачу?', qt: 'Ман чӣ гуна пардохт мекунам?',
        options: ['Наличными', 'Картой', 'Монетами'], ci: 1, key: 'картой', ex: 'Дар матн: «Я плачу картой» — бо корт.' },
    ],
  },
  {
    lo: 17, label: 'Д18 имтиҳон',
    old: 'В субботу я иду в магазин с мамой. Нам нужны хлеб, молоко и яйца. «Сколько стоит этот хлеб?» — спрашивает мама. Продавец говорит, что это дёшево. Я хочу те туфли, но они дорогие. Мама платит картой. Кассир даёт нам чек.',
    text: 'Сегодня суббота. Я и мама в магазине. Нам нужно купить хлеб, молоко и яйца. Мама говорит: «Сколько стоит этот хлеб?» Продавец говорит: «Это дёшево». Я хочу те туфли, но они дорогие. Мама платит картой. Вот наш чек.',
    tr: 'Имрӯз шанбе аст. Ман ва модарам дар мағоза ҳастем. Мо бояд нон, шир ва тухм харем. Модарам мегӯяд: «Ин нон чанд пул аст?» Фурӯшанда мегӯяд: «Ин арзон аст». Ман он туфлиҳоро мехоҳам, вале онҳо қимат ҳастанд. Модарам бо корт пардохт мекунад. Инак расиди мо.',
    count: 8,
    update: [
      { i: 0, old: 'Что им нужно в магазине?', question: 'Что нам нужно купить?', qt: 'Мо бояд чӣ харем?',
        options: ['Хлеб, молоко и яйца', 'Курицу и сок', 'Яблоко и сок'], ci: 0, key: 'хлеб, молоко и яйца', ex: 'Дар матн: «Нам нужно купить хлеб, молоко и яйца» — нон, шир ва тухм.' },
      { i: 1, old: 'Почему мальчик не покупает туфли?', question: 'Какие туфли?', qt: 'Туфлиҳо чӣ гунаанд?',
        options: ['Дешёвые', 'Дорогие', 'Новые'], ci: 1, key: 'дорогие', ex: 'Дар матн: «Я хочу те туфли, но они дорогие» — қимат.' },
      { i: 2, old: 'Как платит мама?', question: 'Как платит мама?', qt: 'Модар чӣ гуна пардохт мекунад?',
        options: ['Наличными', 'Монетами', 'Картой'], ci: 2, key: 'картой', ex: 'Дар матн: «Мама платит картой» — бо корт.' },
      { i: 3, old: "Переведите 'Ин чанд пул меистад?':", question: 'Переведите «Ин чанд пул аст?»:', qt: '«Ин чанд пул аст?»-ро тарҷума кунед:',
        options: ['Сколько это стоит?', 'Где магазин?', 'Это дёшево?'], ci: 0, key: null, ex: 'Ин чанд пул аст? = Сколько это стоит?' },
      { i: 4, old: 'Выберите правильное: Я хочу купить ___ туфли.', question: 'Я хочу купить ___ туфли.', qt: 'Ман мехоҳам ин туфлиҳоро харам.',
        options: ['этот', 'эти', 'эта'], ci: 1, key: null, ex: '«Туфли» ҷамъ аст ва наздик — пас эти. (этот — мардонаи танҳо, эта — занонаи танҳо.)' },
      { i: 5, old: "Переведите 'Ман бо корт пардохт мекунам':", question: 'Переведите «Ман бо корт пардохт мекунам»:', qt: '«Ман бо корт пардохт мекунам»-ро тарҷума кунед:',
        options: ['Я хочу деньги.', 'Я плачу наличными.', 'Я плачу картой.'], ci: 2, key: null, ex: 'Пардохт кардан = платить, бо корт = картой. Пас: «Я плачу картой».' },
      { i: 6, old: "Как будет 'Хазинадор' по-русски?", question: 'Переведите «Хазинадор»:', qt: '«Хазинадор»-ро тарҷума кунед:',
        options: ['Кассир', 'Покупатель', 'Продавец'], ci: 0, key: null, ex: 'Хазинадор = кассир. (фурӯшанда = продавец, мизоҷ = покупатель.)' },
      { i: 7, old: "Как будет 'Арзон' по-русски?", question: 'Переведите «Арзон»:', qt: '«Арзон»-ро тарҷума кунед:',
        options: ['Дорогой', 'Дешёвый', 'Цена'], ci: 1, key: null, ex: 'Арзон = дешёвый. (қимат = дорогой, нарх = цена.)' },
    ],
  },
];

const DIALOG = {
  lo: 14, label: 'Д15 муколама',
  lines: [
    { old: 'Здравствуйте.', text: 'Здравствуйте.', tr: 'Салом.' },
    { old: 'Здравствуйте.', text: 'Здравствуйте.', tr: 'Салом.' },
    { old: 'Сколько стоит эта рубашка?', text: 'Сколько стоит эта рубашка?', tr: 'Ин курта чанд пул аст?' },
    { old: 'Она стоит двадцать долларов.', text: 'Она стоит двадцать долларов.', tr: 'Нархаш бист доллар.' },
    { old: 'Могу я её купить?', text: 'Хорошо. Я плачу картой.', tr: 'Хуб. Ман бо корт пардохт мекунам.' },
    { old: 'Да.', text: 'Вот ваш чек.', tr: 'Инак расиди шумо.' },
    { old: 'Спасибо.', text: 'Спасибо.', tr: 'Раҳмат.' },
    { old: 'Пожалуйста.', text: 'Пожалуйста.', tr: 'Хоҳиш мекунам.' },
  ],
};
const GEX = { lo: 11, old: 'То большой дом.', text: 'Тот дом большой.', tr: 'Он хона калон аст.', hl: 'Тот' };

// ── санҷиши пешакӣ ──
const items = [];
for (const p of PLAN) {
  const [c] = await sql`SELECT id,passage FROM "ComprehensionExercise" WHERE id=${L[p.lo].cid}`;
  const qs = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order", id`;
  if (c.passage === p.text) { console.log(`${p.label}: аллакай нав`); continue; }
  if (c.passage !== p.old) throw new Error(`${p.label}: матни ғайричашмдошт «${c.passage}»`);
  if (qs.length !== p.count) throw new Error(`${p.label}: ${qs.length} савол (интизор ${p.count})`);
  for (const u of p.update) if (qs[u.i].question !== u.old) throw new Error(`${p.label} Q${u.i + 1}: «${qs[u.i].question}» ≠ «${u.old}»`);
  for (const q of [...p.update, ...(p.insert ?? [])]) {
    if (q.options.length !== 3) throw new Error(`${p.label} «${q.question}»: ${q.options.length} вариант`);
    if (new Set(q.options.map(lc)).size !== q.options.length) throw new Error(`${p.label}: варианти такрорӣ`);
    if (/'/.test(q.question) || /Выберите|Как будет|Дополните/.test(q.question)) throw new Error(`${p.label} «${q.question}»: дастури манъшуда`);
    if (!/[ӣӯҳҷқғ]/i.test(q.ex + q.qt)) throw new Error(`${p.label} «${q.question}»: тавзеҳ тоҷикӣ нест`);
    if (q.key === null) continue;
    if (!lc(q.options[q.ci]).includes(q.key) || !lc(p.text).includes(q.key)) throw new Error(`${p.label} «${q.question}»: калиди «${q.key}» дар ҷавоб/матн нест`);
    if (q.options.some((o, j) => j !== q.ci && lc(o).includes(q.key))) throw new Error(`${p.label} «${q.question}»: калид дар варианти нодуруст`);
  }
  items.push({ ...p, id: c.id, qs });
  console.log(`\n${p.label}\n  буд: ${p.old}\n  шуд: ${p.text}\n  тҷ : ${p.tr}`);
  for (const u of p.update) console.log(`  Q${u.i + 1}: ${u.question} → «${u.options[u.ci]}»`);
  for (const n of p.insert ?? []) console.log(`  + Q${n.order + 1} (нав): ${n.question} → «${n.options[n.ci]}»`);
}

const wordItems = [];
for (const w of WORDS) {
  const r = await sql`SELECT id,word FROM "Word" WHERE "lessonId"=${L[w.lo].id} AND word = ANY(${[w.old, w.word]})`;
  if (r.length !== 1) throw new Error(`Д${w.lo + 1} «${w.old}»: ${r.length} сатр`);
  if (r[0].word === w.word) { console.log(`Д${w.lo + 1} «${w.word}»: аллакай нав`); continue; }
  if (!lc(w.example).includes(lc(w.word))) throw new Error(`«${w.word}»: мисол калимаро надорад`);
  wordItems.push({ ...w, id: r[0].id });
  console.log(`\nД${w.lo + 1}: «${w.old}» → «${w.word}» = «${w.translation}» ${w.emoji} · «${w.example}»`);
}
{
  const rows = await sql`SELECT word,translation FROM "Word" WHERE "lessonId"=${L[9].id}`;
  const after = rows.map((r) => WORDS.find((w) => w.old === r.word)?.translation ?? r.translation);
  if (new Set(after).size !== after.length) throw new Error(`Д10: коллизияи тарҷума ${JSON.stringify(after)}`);
}

const rerec = [];
for (const r of RERECORD) {
  const row = await sql`SELECT id,word,"audioUrl" au FROM "Word" WHERE "lessonId"=${L[r.lo].id} AND word=${r.word}`;
  if (row.length !== 1) throw new Error(`Д${r.lo + 1} «${r.word}»: ${row.length}`);
  if (row[0].au.includes('e05ed2b8c5af9fba6245e1d07e91872d1bbdf25b')) rerec.push({ ...row[0], lo: r.lo });
  else console.log(`Д${r.lo + 1} «${r.word}»: аудио аллакай нав`);
}
if (rerec.length) console.log(`\nклиппинг → сабти нав: ${rerec.map((r) => `Д${r.lo + 1} «${r.word}»`).join(', ')}`);

const lines = await sql`SELECT id,text,translation,"order" FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
let dlg = null;
if (lines.length !== 8) throw new Error(`${DIALOG.label}: ${lines.length} сатр`);
if (lines.every((l, i) => l.text === DIALOG.lines[i].text && l.translation === DIALOG.lines[i].tr)) console.log(`${DIALOG.label}: аллакай нав`);
else {
  if (!lines.every((l, i) => l.text === DIALOG.lines[i].old && l.order === i)) throw new Error(`${DIALOG.label}: ${JSON.stringify(lines.map((l) => l.text))}`);
  dlg = lines.map((l, i) => ({ ...DIALOG.lines[i], id: l.id }));
  console.log(`\n${DIALOG.label}: ҳама 8 сатр бо як овоз аз нав`);
  for (const l of dlg) if (l.old !== l.text) console.log(`  «${l.old}» → «${l.text}» = ${l.tr}`);
}

const gexRow = await sql`SELECT id,sentence FROM "GrammarExample" WHERE "topicId"=${L[GEX.lo].gid} AND sentence = ANY(${[GEX.old, GEX.text]})`;
if (gexRow.length !== 1) throw new Error(`Д12 мисол: ${gexRow.length}`);
const gex = gexRow[0].sentence === GEX.text ? null : { ...GEX, id: gexRow[0].id };
console.log(gex ? `\nД12 мисол: «${GEX.old}» → «${GEX.text}»` : 'Д12 мисол: аллакай нав');

const nothing = !items.length && !wordItems.length && !rerec.length && !dlg && !gex;
if (!APPLY || nothing) { console.log(nothing ? '\nҲама чиз аллакай нав.' : '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.'); process.exit(0); }

mkdirSync(WORK, { recursive: true });
const files = [];
if (items.length) {
  writeFileSync(`${WORK}/p.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text }))));
  console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
  files.push(...items.map((i) => ({ id: i.id, text: i.text, label: i.label, passage: true })));
}
const short = [
  ...wordItems.map((w) => ({ id: w.id, text: w.word })),
  ...rerec.map((w) => ({ id: w.id, text: w.word })),
  ...(dlg ?? []).map((l) => ({ id: l.id, text: l.text })),
  ...(gex ? [{ id: gex.id, text: gex.text }] : []),
];
if (short.length) {
  writeFileSync(`${WORK}/s.json`, JSON.stringify(short));
  console.log(execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/s.json`], PY).trim().split('\n').filter((l) => !l.startsWith('OK ')).join('\n'));
  files.push(...short.map((s) => ({ ...s, label: `«${s.text}»`, passage: false })));
}
const { m: local, err } = check(files.map((f) => `${WORK}/${f.id}.mp3`));
if (/error/i.test(err)) throw new Error(`дешифргар: ${err}`);
let bad = 0;
for (const f of files) {
  const m = local[`${WORK}/${f.id}.mp3`];
  const art = f.text.length / Math.max(m.speech, 0.01);
  const ok = f.passage
    ? m.peak >= 0.2 && m.peak < 0.99 && m.lead <= 0.5 && art >= 15 && art <= 40 && m.dur <= 30
    : m.peak >= 0.2 && m.peak < 0.99 && m.lead <= 0.5 && m.speech >= 0.3 && art >= 5 && art <= (f.text.length <= 16 ? 40 : 30);
  console.log(`  ${ok ? '✓' : '✗'} ${f.label}: ${m.dur}s нутқ=${m.speech}s (${art.toFixed(1)} ҳ/с) пеш=${m.lead}s peak=${m.peak}`);
  if (!ok) bad++;
  f.md5 = m.md5;
}
if (bad) { console.error('⛔ файли бад — ҳеҷ чиз бор нашуд'); process.exit(1); }

const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/ru')) git(['sparse-checkout', 'add', 'audio/ru']);
for (const f of files) copyFileSync(`${WORK}/${f.id}.mp3`, `${REPO}/audio/ru/${f.id}.mp3`);
git(['add', ...files.map((f) => `audio/ru/${f.id}.mp3`)]);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
    'Russian A1 Module 8: re-record passages and dialogue, replace mismatched words']);
  git(['push', 'origin', 'HEAD:main']);
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);
for (const f of files) f.url = `${CDN}@${sha}/audio/ru/${f.id}.mp3`;
let cdnBad = files.length;
for (let a = 1; a <= 6 && cdnBad; a++) {
  const { m } = check(files.map((f) => f.url));
  cdnBad = files.filter((f) => m[f.url]?.md5 !== f.md5).length;
  if (cdnBad) { console.log(`кӯшиши ${a}: ${cdnBad} ҳанӯз нест…`); await new Promise((r) => setTimeout(r, 10000)); }
}
if (cdnBad) { console.error('⛔ CDN — база даст нахӯрд'); process.exit(1); }
console.log('✓ CDN: md5 айнан баробар');
const urlOf = Object.fromEntries(files.map((f) => [f.id, f.url]));
const cuidLike = () => `c${Date.now().toString(36).slice(-8)}${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`;

for (const it of items) {
  const tx = [sql`UPDATE "ComprehensionExercise" SET passage=${it.text}, "passageTranslated"=${it.tr}, "audioUrl"=${urlOf[it.id]} WHERE id=${it.id} AND passage=${it.old}`];
  for (const u of it.update) tx.push(sql`UPDATE "ComprehensionQuestion" SET question=${u.question}, "questionTranslated"=${u.qt},
      options=${JSON.stringify(u.options)}::jsonb, "correctIndex"=${u.ci}, explanation=${u.ex} WHERE id=${it.qs[u.i].id}`);
  for (const n of it.insert ?? []) tx.push(sql`INSERT INTO "ComprehensionQuestion" (id,"exerciseId",question,"questionTranslated",options,"correctIndex",explanation,"order")
      VALUES (${cuidLike()},${it.id},${n.question},${n.qt},${JSON.stringify(n.options)}::jsonb,${n.ci},${n.ex},${n.order})`);
  await sql.transaction(tx);
  const [a] = await sql`SELECT passage,"passageTranslated" pt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${it.id}`;
  const aq = await sql`SELECT question,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${it.id} ORDER BY "order", id`;
  const ok = a.passage === it.text && a.pt === it.tr && a.au === urlOf[it.id]
    && it.update.every((u) => aq[u.i].question === u.question && aq[u.i].ci === u.ci)
    && aq.length === it.count + (it.insert?.length ?? 0);
  if (!ok) throw new Error(`ТАСДИҚ НАШУД: ${it.label}`);
  console.log(`✅ ${it.label} — матн, аудио ва ${aq.length} савол сабт ва тасдиқ шуданд`);
}
for (const w of wordItems) {
  await sql`UPDATE "Word" SET word=${w.word}, translation=${w.translation}, emoji=${w.emoji}, "partOfSpeech"=${w.pos},
    example=${w.example}, "exampleTrans"=${w.exampleTrans}, "audioUrl"=${urlOf[w.id]} WHERE id=${w.id} AND word=${w.old}`;
  const [a] = await sql`SELECT word,translation,"audioUrl" au FROM "Word" WHERE id=${w.id}`;
  if (a.word !== w.word || a.translation !== w.translation || a.au !== urlOf[w.id]) throw new Error(`ТАСДИҚ НАШУД: «${w.word}»`);
  console.log(`✅ Д${w.lo + 1} «${w.old}» → «${w.word}» — калима, тарҷума, мисол ва аудио`);
}
for (const w of rerec) {
  await sql`UPDATE "Word" SET "audioUrl"=${urlOf[w.id]} WHERE id=${w.id} AND word=${w.word}`;
  const [a] = await sql`SELECT "audioUrl" au FROM "Word" WHERE id=${w.id}`;
  if (a.au !== urlOf[w.id]) throw new Error(`ТАСДИҚ НАШУД: «${w.word}»`);
  console.log(`✅ Д${w.lo + 1} «${w.word}» — аудиои нав (бе клиппинг)`);
}
if (dlg) {
  await sql.transaction(dlg.map((l) => sql`UPDATE "DialogueLine" SET text=${l.text}, translation=${l.tr}, "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${l.old}`));
  const after = await sql`SELECT id,text,translation,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
  if (!after.every((l, i) => l.text === dlg[i].text && l.translation === dlg[i].tr && l.au === urlOf[l.id])) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — 8 сатр, ҳама бо аудиои нав`);
}
if (gex) {
  await sql`UPDATE "GrammarExample" SET sentence=${gex.text}, translation=${gex.tr}, highlight=${gex.hl}, "audioUrl"=${urlOf[gex.id]} WHERE id=${gex.id} AND sentence=${gex.old}`;
  const [a] = await sql`SELECT sentence,"audioUrl" au FROM "GrammarExample" WHERE id=${gex.id}`;
  if (a.sentence !== gex.text || a.au !== urlOf[gex.id]) throw new Error('ТАСДИҚ НАШУД: Д12 мисол');
  console.log('✅ Д12 мисол «Тот дом большой.» — матн ва аудио');
}
