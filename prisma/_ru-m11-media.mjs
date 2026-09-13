// МОДУЛИ 11-и РУСӢ (A1) «Здоровье и общение» — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R4   «Кисть» → «Палец», «Нездоровый» → «Насморк», «Пилюля» → «Шприц»,
//        «Экстренная ситуация» → «Полиция». Ҳамон сатри `Word` → SRS солим; нусхаи Д15 ҳам.
//        Баъд аз иваз — «Таблетка» = «Ҳаб» (пеш аз ин «Пилюля» ҳам «Ҳаб» буд → коллизия).
//   R13  «Врач» ×2 ва «Авария», «Пожар» (клиппинг), «Сироп» (хомӯшии сар).
//   R1–R3, R6  Чор матни ГУНОГУН: дорухона · садама · дармонгоҳ · Сара назди духтури дандон.
//   R8   Муколама бо ҷумлаҳои A1, ҳама 8 сатр бо як овоз.
// Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m11-media.mjs           # dry-run
//   node prisma/_ru-m11-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m11-media';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const OLD_SHA = '07926ea';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const check = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths], PY);
  if (r.status !== 0) throw new Error(r.stderr);
  return { m: JSON.parse(r.stdout), err: r.stderr };
};
const lc = (s) => s.toLowerCase();
const cuidLike = () => {
  const a = '0123456789abcdefghijklmnopqrstuvwxyz';
  let s = '';
  for (const b of randomBytes(16)) s += a[b % 36];
  return `c${Date.now().toString(36).slice(-8)}${s}`;
};

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did FROM "Lesson" WHERE "moduleId"=${mods[10].id} ORDER BY "order"`;
if (lessons.length !== 16) throw new Error(`Модули 11: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

// ── R4: калимаҳо ──
const W = (lo, old, word, translation, emoji, example, exampleTrans, pos = 'noun') => ({ lo, old, word, translation, emoji, example, exampleTrans, pos });
const WORDS = [
  W(1, 'Кисть', 'Палец', 'Ангушт', '☝️', 'Мой палец болит.', 'Ангушти ман дард мекунад.'),
  W(2, 'Нездоровый', 'Насморк', 'Зуком', '🤧', 'У меня насморк.', 'Ман зуком дорам.'),
  W(6, 'Пилюля', 'Шприц', 'Сӯзандору', '💉', 'Где шприц?', 'Сӯзандору дар куҷост?'),
  W(8, 'Экстренная ситуация', 'Полиция', 'Полис', '🚓', 'Полиция здесь.', 'Полис ин ҷост.'),
];
const COPIES = [{ ...WORDS[0], lo: 14 }];
// Баъд аз иваз: тарҷумаи «Таблетка» (Д7 ва нусхаи Д15).
const RETR = { word: 'Таблетка', translation: 'Ҳаб', exampleTrans: 'Ин ҳаб сафед аст.', lessons: [6, 14] };
const RERECORD = [
  { lo: 4, word: 'Врач' }, { lo: 14, word: 'Врач' }, { lo: 6, word: 'Сироп' },
  { lo: 8, word: 'Авария' }, { lo: 8, word: 'Пожар' },
];

// ── Матнҳо ──
const q = (question, qt, options, ci, key, ex) => ({ question, qt, options, ci, key, ex });
const PLAN = [
  {
    lo: 10, label: 'Д11 хониш (дорухона)',
    old: 'Я сегодня болен. У меня головная боль и температура. Я иду в поликлинику. Врач осматривает меня. Он пишет рецепт. Я принимаю лекарство и отдыхаю. Моя мама делает горячий чай для меня. Я пью воду и сплю. Я сегодня не иду в школу. Теперь мне намного лучше.',
    text: 'Я в аптеке. У меня кашель и насморк. Фармацевт говорит: «Вот сироп и капли». Сироп сладкий. Мне нужен пластырь. Спасибо!',
    tr: 'Ман дар дорухона ҳастам. Ман сулфа ва зуком дорам. Дорухонадор мегӯяд: «Инак шарбати дору ва қатра». Шарбат ширин аст. Ба ман лейкопластир лозим аст. Ташаккур!',
    count: 4,
    update: [
      { i: 0, old: 'Что у него болит?', ...q('Где я?', 'Ман дар куҷо ҳастам?', ['В аптеке', 'В школе', 'В парке'], 0, 'в аптеке', 'Дар матн: «Я в аптеке» — дар дорухона.') },
      { i: 1, old: 'Куда он идёт?', ...q('Что у меня?', 'Ман чӣ дорам?', ['Кашель и насморк', 'Зубная боль', 'Температура'], 0, 'кашель и насморк', 'Дар матн: «У меня кашель и насморк» — сулфа ва зуком.') },
      { i: 2, old: 'Что готовит его мама?', ...q('Какой сироп?', 'Шарбат чӣ гуна аст?', ['Сладкий', 'Большой', 'Белый'], 0, 'сладкий', 'Дар матн: «Сироп сладкий» — ширин.') },
      { i: 3, old: 'Он идёт в школу сегодня?', ...q('Что мне нужно?', 'Ба ман чӣ лозим аст?', ['Пластырь', 'Маска', 'Термометр'], 0, 'пластырь', 'Дар матн: «Мне нужен пластырь» — лейкопластир.') },
    ],
  },
  {
    lo: 11, label: 'Д12 шунавоӣ (садама)',
    old: 'Сегодня я плохо себя чувствую. У меня болит голова и горло. Я иду к врачу. Врач даёт мне лекарство. Я должна пить воду и отдыхать дома. Выздоравливайте скорее! Моя мама делает горячий чай для меня. Я сегодня не иду в школу. Я пью воду и сплю днём. Теперь мне намного лучше.',
    text: 'Здесь авария! На улице мужчина. У него болит нога. Я звоню в скорую помощь. Авария рядом с банком. Скорая помощь едет пять минут. Врач говорит: «Это не опасно».',
    tr: 'Ин ҷо садама! Дар кӯча марде ҳаст. Пои ӯ дард мекунад. Ман ба ёрии таъҷилӣ занг мезанам. Садама дар назди бонк аст. Ёрии таъҷилӣ панҷ дақиқа меояд. Духтур мегӯяд: «Ин хатарнок нест».',
    count: 4,
    update: [
      { i: 0, old: 'Как она себя чувствует?', ...q('Что здесь?', 'Ин ҷо чӣ шуд?', ['Авария', 'Пожар', 'Магазин'], 0, 'авария', 'Дар матн: «Здесь авария!» — садама.') },
      { i: 1, old: 'Что у неё болит?', ...q('Что у него болит?', 'Чӣ дард мекунад?', ['Рука', 'Голова', 'Нога'], 2, 'нога', 'Дар матн: «У него болит нога» — пой.') },
      { i: 2, old: 'К кому она идёт?', ...q('Где авария?', 'Садама дар куҷост?', ['Рядом с банком', 'Рядом со школой', 'В парке'], 0, 'рядом с банком', 'Дар матн: «Авария рядом с банком» — дар назди бонк.') },
      { i: 3, old: 'Что она должна делать?', ...q('Это опасно?', 'Ин хатарнок аст?', ['Да, опасно', 'Нет, не опасно', 'Это пожар'], 1, 'не опасно', 'Дар матн: «Это не опасно» — хатарнок нест.') },
    ],
  },
  {
    lo: 13, label: 'Д14 такрор (дармонгоҳ)',
    old: 'Али болен. У него головная боль и кашель. Он идёт в поликлинику. Врач осматривает его. Врач пишет рецепт. Али покупает лекарство в аптеке. Он идёт домой и отдыхает. Теперь Али здоров.',
    text: 'Али болен. У него болит голова и спина. Он идёт в поликлинику. Врач осматривает его и пишет рецепт. Али покупает таблетки в аптеке. Он отдыхает дома.',
    tr: 'Алӣ бемор аст. Сар ва пушти ӯ дард мекунад. Ӯ ба дармонгоҳ меравад. Духтур ӯро муоина мекунад ва дорунома менависад. Алӣ аз дорухона ҳаб мехарад. Ӯ дар хона истироҳат мекунад.',
    count: 3,
    update: [
      { i: 0, old: 'Что у Али болит?', ...q('Что у Али болит?', 'Чӣ Алӣ дард мекунад?', ['Голова и спина', 'Зуб', 'Живот'], 0, 'голова и спина', 'Дар матн: «У него болит голова и спина» — сар ва пушт.') },
      { i: 1, old: 'Куда идёт Али?', ...q('Али идёт…', 'Алӣ меравад…', ['в поликлинику', 'в школу', 'в парк'], 0, 'в поликлинику', 'Дар матн: «Он идёт в поликлинику» — ба дармонгоҳ.') },
      { i: 2, old: 'Где Али покупает лекарство?', ...q('Что пишет врач?', 'Духтур чӣ менависад?', ['Рецепт', 'Имя', 'Адрес'], 0, 'рецепт', 'Дар матн: «Врач … пишет рецепт» — дорунома.') },
    ],
    insert: [
      { order: 3, ...q('Где Али отдыхает?', 'Алӣ дар куҷо истироҳат мекунад?', ['Дома', 'В аптеке', 'В школе'], 0, 'дома', 'Дар матн: «Он отдыхает дома» — дар хона.') },
    ],
  },
  {
    lo: 15, label: 'Д16 имтиҳон (Сара)',
    old: 'У Сары зубная боль. Она звонит в поликлинику и записывается на приём. Медсестра добрая. Врач осматривает её зуб и даёт ей лекарство. «Принимай одну таблетку в день и отдыхай», — говорит врач. Теперь Сара чувствует себя лучше. Её мама покупает лекарство в аптеке. Сара отдыхает дома, и теперь она здорова.',
    text: 'У Сары болит зуб. Она звонит в поликлинику. Медсестра добрая. Врач осматривает её зуб и пишет рецепт. Сара покупает таблетки в аптеке. Врач говорит: «Одна таблетка в день». Сара отдыхает дома. Теперь она здорова.',
    tr: 'Дандони Сара дард мекунад. Ӯ ба дармонгоҳ занг мезанад. Ҳамшира меҳрубон аст. Духтур дандони ӯро муоина мекунад ва дорунома менависад. Сара аз дорухона ҳаб мехарад. Духтур мегӯяд: «Рӯзе як ҳаб». Сара дар хона истироҳат мекунад. Ҳоло ӯ солим аст.',
    count: 8,
    update: [
      { i: 0, old: 'Что у Сары болит?', ...q('Что у Сары болит?', 'Чӣ Сара дард мекунад?', ['Зуб', 'Голова', 'Живот'], 0, 'зуб', 'Дар матн: «У Сары болит зуб» — дандон.') },
      { i: 1, old: 'Кто добрая?', ...q('Какая медсестра?', 'Ҳамшира чӣ гуна аст?', ['Добрая', 'Усталая', 'Больная'], 0, 'добрая', 'Дар матн: «Медсестра добрая» — меҳрубон.') },
      { i: 2, old: 'Сколько таблеток в день?', ...q('Сколько таблеток в день?', 'Рӯзе чанд ҳаб?', ['Одна', 'Две', 'Три'], 0, 'одна', 'Дар матн: «Одна таблетка в день» — рӯзе як ҳаб.') },
      { i: 3, old: 'Как Сара себя чувствует теперь?', ...q('Сара теперь…', 'Сара ҳоло…', ['больна', 'здорова', 'устала'], 1, 'здорова', 'Дар матн: «Теперь она здорова» — солим аст.') },
      { i: 4, old: 'Куда звонит Сара?', ...q('Сара звонит…', 'Сара занг мезанад…', ['в поликлинику', 'в школу', 'в аптеку'], 0, 'в поликлинику', 'Дар матн: «Она звонит в поликлинику» — ба дармонгоҳ.') },
      { i: 5, old: "Как будет 'Духтур' по-русски?", ...q('Переведите «Духтур»:', '«Духтур»-ро тарҷума кунед:', ['Пациент', 'Врач', 'Медсестра'], 1, null, 'Духтур бо русӣ — врач. (Ҳамшира — медсестра, бемор — пациент.)') },
      { i: 6, old: 'Выберите правильное: У Сары ___ зубная боль.', ...q('У меня ___ зуб.', 'Дандони ман дард мекунад.', ['болит', 'болят', 'боль'], 0, null, 'Як зуб → болит. (Ду зуб — болят.) Феъл бо узв мувофиқ мешавад.') },
      { i: 7, old: "Переведите 'Ман истироҳат мекунам':", ...q('Переведите «Ман истироҳат мекунам»:', '«Ман истироҳат мекунам»-ро тарҷума кунед:', ['Я бегу.', 'Я сплю.', 'Я отдыхаю.'], 2, null, 'Истироҳат кардан бо русӣ — отдыхать. Пас: «Я отдыхаю».') },
    ],
  },
];

const DIALOG = {
  lo: 12, label: 'Д13 муколама',
  lines: [
    { old: 'Здравствуйте. Что случилось?', text: 'Здравствуйте. Что случилось?', tr: 'Салом. Чӣ шуд?' },
    { old: 'У меня болит голова и температура.', text: 'У меня болит голова. И у меня температура.', tr: 'Сарам дард мекунад. Ва таб дорам.' },
    { old: 'Как долго вы больны?', text: 'Как долго вы больны?', tr: 'Чанд вақт боз беморед?' },
    { old: 'Со вчерашнего дня.', text: 'Два дня.', tr: 'Ду рӯз.' },
    { old: 'Откройте рот, пожалуйста. Дайте я осмотрю вас.', text: 'Откройте рот, пожалуйста.', tr: 'Лутфан, даҳонатонро кушоед.' },
    { old: 'Хорошо. Это серьёзно?', text: 'Хорошо. Это опасно?', tr: 'Хуб. Ин хатарнок аст?' },
    { old: 'Нет. Примите это лекарство и отдохните.', text: 'Нет. Вот рецепт. Отдыхайте дома.', tr: 'Не. Инак дорунома. Дар хона истироҳат кунед.' },
    { old: 'Спасибо, доктор.', text: 'Спасибо, доктор.', tr: 'Ташаккур, духтур.' },
  ],
};

// ── санҷиши пешакӣ ──
const items = [];
for (const p of PLAN) {
  const [c] = await sql`SELECT id,passage FROM "ComprehensionExercise" WHERE id=${L[p.lo].cid}`;
  const qs = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order", id`;
  if (c.passage === p.text) { console.log(`${p.label}: аллакай нав`); continue; }
  if (c.passage !== p.old) throw new Error(`${p.label}: матни ғайричашмдошт «${c.passage}»`);
  if (qs.length !== p.count) throw new Error(`${p.label}: ${qs.length} савол (интизор ${p.count})`);
  for (const u of p.update) if (qs[u.i].question !== u.old) throw new Error(`${p.label} Q${u.i + 1}: «${qs[u.i].question}» ≠ «${u.old}»`);
  for (const x of [...p.update, ...(p.insert ?? [])]) {
    if (x.options.length !== 3) throw new Error(`${p.label} «${x.question}»: ${x.options.length} вариант`);
    if (new Set(x.options.map(lc)).size !== x.options.length) throw new Error(`${p.label}: варианти такрорӣ`);
    if (/'/.test(x.question) || /Выберите|Как будет|Дополните|Куда|К кому/.test(x.question)) throw new Error(`${p.label} «${x.question}»: дастури манъшуда`);
    const tg = `${x.ex} ${x.qt}`;
    if (!/[ӣӯҳҷқғ]/i.test(tg) && !/(^|[\s«(])(аст|дар|ба|бо|ва|пас|ин|он|матн)([\s.,:;!?»)]|$)/i.test(tg)) throw new Error(`${p.label} «${x.question}»: тавзеҳ тоҷикӣ нест`);
    if (x.key === null) continue;
    if (!lc(x.options[x.ci]).includes(x.key) || !lc(p.text).includes(x.key)) throw new Error(`${p.label} «${x.question}»: калиди «${x.key}» дар ҷавоб/матн нест`);
    if (x.options.some((o, j) => j !== x.ci && lc(o).includes(x.key))) throw new Error(`${p.label} «${x.question}»: калид дар варианти нодуруст`);
  }
  items.push({ ...p, id: c.id, qs });
  console.log(`\n${p.label}\n  шуд: ${p.text}\n  тҷ : ${p.tr}`);
  for (const u of p.update) console.log(`  Q${u.i + 1}: ${u.question} → «${u.options[u.ci]}»`);
  for (const n of p.insert ?? []) console.log(`  + Q${n.order + 1} (нав): ${n.question} → «${n.options[n.ci]}»`);
}
if (new Set(PLAN.map((p) => p.text)).size !== PLAN.length) throw new Error('матнҳо бояд гуногун бошанд (R1)');

const priorWords = new Set((await sql`SELECT lower(w.word) k FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} AND m.id <> ${mods[10].id}`).map((r) => r.k));
const conflicts = WORDS.map((w) => w.word).filter((x) => priorWords.has(lc(x)));
if (conflicts.length) throw new Error(`аллакай дар модули дигар корт ҳастанд: ${conflicts.join(', ')}`);
const wordItems = [];
for (const w of [...WORDS, ...COPIES]) {
  const r = await sql`SELECT id,word FROM "Word" WHERE "lessonId"=${L[w.lo].id} AND word = ANY(${[w.old, w.word]})`;
  if (r.length !== 1) throw new Error(`Д${w.lo + 1} «${w.old}»: ${r.length} сатр`);
  if (r[0].word === w.word) { console.log(`Д${w.lo + 1} «${w.word}»: аллакай нав`); continue; }
  if (!lc(w.example).includes(lc(w.word).slice(0, 4))) throw new Error(`«${w.word}»: мисол калимаро надорад`);
  wordItems.push({ ...w, id: r[0].id });
  console.log(`Д${w.lo + 1}: «${w.old}» → «${w.word}» = «${w.translation}» ${w.emoji} · «${w.example}»`);
}
const retr = [];
for (const lo of RETR.lessons) {
  const r = await sql`SELECT id,translation,"exampleTrans" et FROM "Word" WHERE "lessonId"=${L[lo].id} AND word=${RETR.word}`;
  if (r.length !== 1) throw new Error(`Д${lo + 1} «${RETR.word}»: ${r.length}`);
  if (r[0].translation !== RETR.translation || r[0].et !== RETR.exampleTrans) retr.push({ id: r[0].id, lo });
}
if (retr.length) console.log(`«${RETR.word}» = «${RETR.translation}» дар ${retr.map((x) => `Д${x.lo + 1}`).join(', ')}`);
// Коллизияи тарҷума БАЪД аз ҳамаи ивазҳо.
for (const lo of [...new Set([...WORDS, ...COPIES].map((w) => w.lo).concat(RETR.lessons))]) {
  const rows = await sql`SELECT word,translation FROM "Word" WHERE "lessonId"=${L[lo].id}`;
  const tr = rows.map((r) => {
    const rep = [...WORDS, ...COPIES].find((w) => w.lo === lo && w.old === r.word);
    if (rep) return rep.translation;
    return r.word === RETR.word ? RETR.translation : r.translation;
  });
  if (new Set(tr).size !== tr.length) throw new Error(`Д${lo + 1}: коллизияи тарҷума ${JSON.stringify(tr)}`);
}

const rerec = [];
for (const r of RERECORD) {
  const row = await sql`SELECT id,word,"audioUrl" au FROM "Word" WHERE "lessonId"=${L[r.lo].id} AND word=${r.word}`;
  if (row.length !== 1) throw new Error(`Д${r.lo + 1} «${r.word}»: ${row.length}`);
  if (row[0].au.includes(`@${OLD_SHA}`)) rerec.push({ ...row[0], lo: r.lo });
  else console.log(`Д${r.lo + 1} «${r.word}»: аудио аллакай нав`);
}
if (rerec.length) console.log(`\nсабти нав: ${rerec.map((r) => `Д${r.lo + 1} «${r.word}»`).join(', ')}`);

const did = L[DIALOG.lo].did;
const lines = await sql`SELECT id,text,translation,"order" FROM "DialogueLine" WHERE "dialogueId"=${did} ORDER BY "order"`;
if (lines.length !== 8) throw new Error(`${DIALOG.label}: ${lines.length} сатр`);
let dlg = null;
if (lines.every((l, i) => l.text === DIALOG.lines[i].text && l.translation === DIALOG.lines[i].tr)) console.log(`${DIALOG.label}: аллакай нав`);
else {
  if (!lines.every((l, i) => l.text === DIALOG.lines[i].old && l.order === i)) throw new Error(`${DIALOG.label}: ${JSON.stringify(lines.map((l) => l.text))}`);
  dlg = lines.map((l, i) => ({ ...DIALOG.lines[i], id: l.id }));
  console.log(`\n${DIALOG.label}: ҳама 8 сатр бо як овоз аз нав`);
  for (const l of dlg) if (l.old !== l.text) console.log(`  «${l.old}» → «${l.text}» = ${l.tr}`);
}

const nothing = !items.length && !wordItems.length && !rerec.length && !dlg && !retr.length;
if (!APPLY || nothing) { console.log(nothing ? '\nҲама чиз аллакай нав.' : '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.'); process.exit(0); }

// ── аудио ──
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
];
if (short.length) {
  writeFileSync(`${WORK}/s.json`, JSON.stringify(short));
  console.log(execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/s.json`], PY).trim().split('\n').filter((l) => !l.startsWith('OK ')).join('\n'));
  files.push(...short.map((s) => ({ ...s, label: `«${s.text}»`, passage: false })));
}
let urlOf = {};
if (files.length) {
  const { m: local, err } = check(files.map((f) => `${WORK}/${f.id}.mp3`));
  if (/error/i.test(err)) throw new Error(`дешифргар: ${err}`);
  const letters = (t) => (t.match(/\p{L}/gu) ?? []).length;
  let bad = 0;
  for (const f of files) {
    const m = local[`${WORK}/${f.id}.mp3`];
    const art = f.text.length / Math.max(m.speech, 0.01);
    const minSp = letters(f.text) <= 3 ? 0.12 : letters(f.text) <= 6 ? 0.18 : 0.25;
    const ok = f.passage
      ? m.peak >= 0.2 && m.peak < 0.99 && m.lead <= 0.5 && art >= 15 && art <= 40 && m.dur <= 30
      : m.peak >= 0.2 && m.peak < 0.99 && m.lead <= 0.5 && m.speech >= minSp && art >= 5 && art <= (f.text.length <= 16 ? 40 : 30);
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
      'Russian A1 Module 11: distinct passages, A1 dialogue, replaced words']);
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
  urlOf = Object.fromEntries(files.map((f) => [f.id, f.url]));
}

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
  console.log(`✅ ${it.label} — матн, аудио ва ${aq.length} савол`);
}
// Ивази калимаҳо ва тарҷумаи «Таблетка» дар ЯК транзаксия — ҳеҷ лаҳза ду «Ҳаб» дар Д7 намешавад.
if (wordItems.length || retr.length) {
  const tx = [];
  for (const w of wordItems) tx.push(sql`UPDATE "Word" SET word=${w.word}, translation=${w.translation}, emoji=${w.emoji}, "partOfSpeech"=${w.pos},
      example=${w.example}, "exampleTrans"=${w.exampleTrans}, "audioUrl"=${urlOf[w.id]} WHERE id=${w.id} AND word=${w.old}`);
  for (const r of retr) tx.push(sql`UPDATE "Word" SET translation=${RETR.translation}, "exampleTrans"=${RETR.exampleTrans} WHERE id=${r.id} AND word=${RETR.word}`);
  await sql.transaction(tx);
  for (const w of wordItems) {
    const [a] = await sql`SELECT word,translation,"audioUrl" au FROM "Word" WHERE id=${w.id}`;
    if (a.word !== w.word || a.translation !== w.translation || a.au !== urlOf[w.id]) throw new Error(`ТАСДИҚ НАШУД: «${w.word}»`);
    console.log(`✅ Д${w.lo + 1} «${w.old}» → «${w.word}»`);
  }
  for (const r of retr) {
    const [a] = await sql`SELECT translation FROM "Word" WHERE id=${r.id}`;
    if (a.translation !== RETR.translation) throw new Error(`ТАСДИҚ НАШУД: «${RETR.word}» Д${r.lo + 1}`);
    console.log(`✅ Д${r.lo + 1} «${RETR.word}» = «${RETR.translation}»`);
  }
}
for (const w of rerec) {
  await sql`UPDATE "Word" SET "audioUrl"=${urlOf[w.id]} WHERE id=${w.id} AND word=${w.word}`;
  const [a] = await sql`SELECT "audioUrl" au FROM "Word" WHERE id=${w.id}`;
  if (a.au !== urlOf[w.id]) throw new Error(`ТАСДИҚ НАШУД: «${w.word}»`);
  console.log(`✅ Д${w.lo + 1} «${w.word}» — аудиои нав`);
}
if (dlg) {
  await sql.transaction(dlg.map((l) => sql`UPDATE "DialogueLine" SET text=${l.text}, translation=${l.tr}, "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${l.old}`));
  const after = await sql`SELECT id,text,translation,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=${did} ORDER BY "order"`;
  if (!after.every((l, i) => l.text === dlg[i].text && l.translation === dlg[i].tr && l.au === urlOf[l.id])) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — 8 сатр, аудиои нав`);
}
