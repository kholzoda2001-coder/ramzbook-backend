// МОДУЛИ 5-и РУСӢ (A1) — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R6/F4/F13  Д11 хониш: «Каждое», «с семьёй», саволҳо «он» ↔ матн «я», «Во сколько», «после» → «Меня зовут Али…»
//   R6/F5/F6   Д12 шунавоӣ: 4 тавзеҳи русӣ, «Завтракаю», «Ноништа», «Баъдаззуҳр» → «Меня зовут Умар…»
//   R10/F2     Д14 такрор: «Давайте повторим», «Потом», 2 савол, «нахоб намеравам» → матни нав + 2 саволи нав
//   R4/F15     Д16 имтиҳон: «умеет» (наомӯхта), «После школы», «с семьёй» → «может», «Днём»
//   R11        Д13 муколама: 4 → 8 сатр, ҳама бо ЯК овоз
//   R13        Д5 мисолҳо «помочь», «водить машину» ва Д10 «одеваться» (наомӯхта) → калимаҳои омӯхта;
//              ҳамаи 5 мисоли ҳар ду мавзӯъ аз нав сабт мешаванд, то дар як рӯйхат ду овоз набошад.
// Матн, тарҷума, аудио ва саволҳо/машқҳо дар ЯК транзаксия. Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m5-media.mjs           # dry-run
//   node prisma/_ru-m5-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m5-media';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const check = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths], PY);
  if (r.status !== 0) throw new Error(r.stderr);
  return { m: JSON.parse(r.stdout), err: r.stderr };
};
const cuidLike = () => {
  const a = '0123456789abcdefghijklmnopqrstuvwxyz';
  let s = '';
  for (const b of randomBytes(16)) s += a[b % 36];
  return `c${Date.now().toString(36).slice(-8)}${s}`;
};
const lc = (s) => s.toLowerCase();

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did,"grammarTopicId" gid FROM "Lesson" WHERE "moduleId"=${mods[4].id} ORDER BY "order"`;
if (lessons.length !== 16) throw new Error(`Модули 5: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

// key — пора, ки бояд ҳам дар варианти ДУРУСТ, ҳам дар матн бошад ва дар ягон варианти нодуруст набошад.
const PLAN = [
  {
    lo: 10, label: 'Д11 хониш',
    old: 'Каждое утро я просыпаюсь в семь часов. Я умываюсь и чищу зубы. Я ем завтрак и иду в школу. Я изучаю русский. Вечером я смотрю телевизор с семьёй. Я ложусь спать в десять.',
    text: 'Меня зовут Али. Утром я просыпаюсь в семь часов. Я умываюсь и чищу зубы. Я ем завтрак и иду в школу. Я изучаю русский. Вечером я смотрю телевизор. Я ложусь спать в десять.',
    tr: 'Номи ман Алӣ аст. Субҳ ман соати ҳафт бедор мешавам. Ман дасту рӯямро мешӯям ва дандонҳоямро мисвок мекунам. Ман наҳорӣ мехӯрам ва ба мактаб меравам. Ман забони русиро меомӯзам. Бегоҳӣ ман телевизор тамошо мекунам. Ман соати даҳ хоб меравам.',
    title: ['Чтение: день Али', 'Хониш: рӯзи Алӣ'],
    update: [
      { i: 0, old: 'Во сколько он просыпается?', question: 'Когда Али просыпается?', qt: 'Алӣ кай бедор мешавад?', options: ['В восемь', 'В семь', 'В девять'], ci: 1,
        key: 'в семь', ex: 'Дар матн: «Утром я просыпаюсь в семь часов» — соати ҳафт.' },
      { i: 1, old: 'Что он делает после завтрака?', question: 'Что Али изучает?', qt: 'Алӣ чиро меомӯзад?', options: ['Русский', 'Английский', 'Таджикский'], ci: 0,
        key: 'русский', ex: 'Дар матн: «Я изучаю русский» — забони русӣ.' },
      { i: 2, old: 'Что он делает вечером?', question: 'Что Али делает вечером?', qt: 'Алӣ бегоҳӣ чӣ мекунад?', options: ['Играет в футбол', 'Читает книгу', 'Смотрит телевизор'], ci: 2,
        key: 'телевизор', ex: 'Дар матн: «Вечером я смотрю телевизор» — телевизор тамошо мекунад.' },
    ],
    count: 3,
  },
  {
    lo: 11, label: 'Д12 шунавоӣ',
    old: 'Я встаю в семь часов. Завтракаю и иду в школу. Днём я делаю домашнее задание. Вечером я смотрю телевизор с семьёй. Я ложусь спать в десять часов.',
    text: 'Меня зовут Умар. Я встаю в семь часов. Я ем завтрак и иду в школу. Днём я делаю домашнее задание. Вечером я смотрю телевизор. Я ложусь спать в десять часов.',
    tr: 'Номи ман Умар аст. Ман соати ҳафт бедор мешавам. Ман наҳорӣ мехӯрам ва ба мактаб меравам. Рӯзона ман вазифаи хонагиро иҷро мекунам. Бегоҳӣ ман телевизор тамошо мекунам. Ман соати даҳ хоб меравам.',
    title: ['Аудирование: мой день', 'Шунавоӣ: рӯзи ман'],
    update: [
      { i: 0, old: 'Во сколько он встаёт?', question: 'Когда Умар встаёт?', qt: 'Умар кай бедор мешавад?', options: ['В шесть', 'В семь', 'В восемь'], ci: 1,
        key: 'в семь', ex: 'Дар матн: «Я встаю в семь часов» — соати ҳафт.' },
      { i: 1, old: 'Что он делает днём?', question: 'Что Умар делает днём?', qt: 'Умар рӯзона чӣ кор мекунад?', options: ['Делает домашнее задание', 'Смотрит телевизор', 'Спит'], ci: 0,
        key: 'домашнее задание', ex: 'Дар матн: «Днём я делаю домашнее задание» — вазифаи хонагӣ. Телевизорро ӯ бегоҳӣ мебинад.' },
      { i: 2, old: 'Что он делает вечером?', question: 'Что Умар делает вечером?', qt: 'Умар бегоҳӣ чӣ кор мекунад?', options: ['Читает книгу', 'Играет в футбол', 'Смотрит телевизор'], ci: 2,
        key: 'телевизор', ex: 'Дар матн: «Вечером я смотрю телевизор» — телевизор тамошо мекунад.' },
      { i: 3, old: 'Во сколько он ложится спать?', question: 'Когда Умар ложится спать?', qt: 'Умар кай хоб меравад?', options: ['В девять', 'В десять', 'В одиннадцать'], ci: 1,
        key: 'в десять', ex: 'Дар матн: «Я ложусь спать в десять часов» — соати даҳ.' },
    ],
    count: 4,
  },
  {
    lo: 13, label: 'Д14 такрор',
    old: 'Давайте повторим распорядок дня! Я всегда встаю в семь часов. Я умываюсь и ем завтрак. Потом я иду в школу. Вечером я смотрю телевизор. Я никогда не ложусь спать поздно.',
    text: 'Меня зовут Сара. Я всегда встаю в семь часов. Я умываюсь и ем завтрак. Утром я иду в школу. Я могу плавать. Вечером я иногда читаю книгу. Я никогда не ложусь спать поздно.',
    tr: 'Номи ман Сара аст. Ман ҳамеша соати ҳафт бедор мешавам. Ман дасту рӯямро мешӯям ва наҳорӣ мехӯрам. Субҳ ман ба мактаб меравам. Ман шино карда метавонам. Бегоҳӣ ман баъзан китоб мехонам. Ман ҳеҷ гоҳ дер хоб намеравам.',
    update: [
      { i: 0, old: 'Когда он встаёт?', question: 'Когда Сара встаёт?', qt: 'Сара кай бедор мешавад?', options: ['В семь', 'В восемь', 'В девять'], ci: 0,
        key: 'в семь', ex: 'Дар матн: «Я всегда встаю в семь часов» — ҳамеша соати ҳафт.' },
      { i: 1, old: 'Что он делает вечером?', question: 'Что Сара иногда делает вечером?', qt: 'Сара бегоҳӣ баъзан чӣ мекунад?', options: ['Играет в футбол', 'Смотрит телевизор', 'Читает книгу'], ci: 2,
        key: 'книгу', ex: 'Дар матн: «Вечером я иногда читаю книгу» — баъзан китоб мехонад.' },
    ],
    insert: [
      { order: 2, question: 'Что Сара может делать?', qt: 'Сара чӣ карда метавонад?', options: ['Плавать', 'Играть в футбол', 'Готовить'], ci: 0,
        key: 'плавать', ex: 'Дар матн: «Я могу плавать» — шино карда метавонад.' },
      { order: 3, question: 'Сара ложится спать поздно?', qt: 'Сара дер хоб меравад?', options: ['Да, всегда', 'Иногда', 'Нет, никогда'], ci: 2,
        key: 'никогда', ex: 'Дар матн: «Я никогда не ложусь спать поздно» — ҳеҷ гоҳ.' },
    ],
    count: 2,
  },
  {
    lo: 15, label: 'Д16 имтиҳон',
    old: 'Карим — студент. Он встаёт в шесть часов. Он умывается и ест завтрак. Потом он идёт в школу. После школы он делает домашнее задание и читает книгу. Вечером он смотрит телевизор с семьёй. Он умеет играть в футбол, но не умеет плавать. Он ложится спать в десять.',
    text: 'Это Карим. Он встаёт в шесть часов. Он умывается и ест завтрак. Утром он идёт в школу. Днём он делает домашнее задание и читает книгу. Вечером он смотрит телевизор. Он может играть в футбол, но не может плавать. Он ложится спать в десять.',
    tr: 'Ин Карим аст. Ӯ соати шаш бедор мешавад. Ӯ дасту рӯяшро мешӯяд ва наҳорӣ мехӯрад. Субҳ ӯ ба мактаб меравад. Рӯзона ӯ вазифаи хонагиро иҷро мекунад ва китоб мехонад. Бегоҳӣ ӯ телевизор тамошо мекунад. Ӯ футбол бозӣ карда метавонад, вале шино карда наметавонад. Ӯ соати даҳ хоб меравад.',
    title: ['Карим может играть в футбол', 'Карим футбол бозӣ карда метавонад'],
    update: [
      { i: 0, old: 'Что Карим делает после школы?', question: 'Что Карим делает днём?', qt: 'Карим рӯзона чӣ мекунад?', options: ['Делает домашнее задание', 'Готовит ужин', 'Спит'], ci: 0,
        key: 'домашнее задание', ex: 'Дар матн: «Днём он делает домашнее задание и читает книгу» — вазифаи хонагӣ.' },
      { i: 1, old: 'Что Карим НЕ умеет делать?', question: 'Что Карим НЕ может делать?', qt: 'Карим чӣ карда наметавонад?', options: ['Читать книгу', 'Плавать', 'Играть в футбол'], ci: 1,
        key: 'плавать', ex: 'Дар матн: «…но не может плавать» — шино карда наметавонад.' },
    ],
    keep: [{ i: 2, question: 'Когда он ложится спать?', key: 'в десять' }],
    count: 8,
  },
];

const DIALOG = {
  lo: 12, label: 'Д13 муколама',
  oldTexts: ['Привет, Умар! Во сколько ты просыпаешься?', 'Я просыпаюсь в семь часов.', 'Ты играешь в футбол?', 'Да, я играю в футбол вечером.'],
  add: [
    { order: 4, speaker: 'Али', isUser: false, text: 'А ты можешь плавать?', tr: 'Ту шино карда метавонӣ?' },
    { order: 5, speaker: 'Умар', isUser: true, text: 'Нет, не могу.', tr: 'Не, наметавонам.' },
    { order: 6, speaker: 'Али', isUser: false, text: 'Когда ты ложишься спать?', tr: 'Ту кай хоб меравӣ?' },
    { order: 7, speaker: 'Умар', isUser: true, text: 'Я обычно ложусь спать в десять.', tr: 'Ман одатан соати даҳ хоб меравам.' },
  ],
};

// Мисолҳои грамматика: [матни кӯҳна, матни нав, тарҷума, highlight]; ҳамаи 5 аз нав сабт мешаванд.
const GRAM = [
  { lo: 4, label: 'Д5 мочь', examples: [
      ['Я могу плавать.'], ['Она может говорить по-русски.'],
      ['Мы можем помочь тебе.', 'Мы можем играть в футбол.', 'Мо футбол бозӣ карда метавонем.', 'можем'],
      ['Он не может водить машину.', 'Он не может работать сегодня.', 'Ӯ имрӯз кор карда наметавонад.', 'не может'],
      ['Ты можешь готовить?'],
    ],
    exercises: [
      { old: 'Мы ___ помочь тебе.', prompt: 'Мы ___ играть в футбол.', pt: 'Мо футбол бозӣ карда метавонем.', answer: 'можем' },
      { old: 'Он ___ водить машину. (наметавонад)', prompt: 'Он ___ работать сегодня. (наметавонад)', pt: 'Ӯ имрӯз кор карда наметавонад.', answer: 'не может' },
    ] },
  { lo: 9, label: 'Д10 -ся', examples: [
      ['Я умываюсь утром.'], ['Он умывается быстро.'], ['Я просыпаюсь в семь часов.'], ['Мы ложимся спать в десять.'],
      ['Ты одеваешься сам?', 'Ты просыпаешься рано?', 'Ту барвақт бедор мешавӣ?', 'просыпаешься'],
    ],
    exercises: [
      { old: 'Я ___ сам. (одеваться)', prompt: 'Мы ___ в семь. (просыпаться)', pt: 'Мо соати ҳафт бедор мешавем.', answer: 'просыпаемся', ex: 'мы → -емся.' },
    ] },
];

// ── санҷиши пешакӣ (dry ва apply) ──
const items = [];
for (const p of PLAN) {
  const [c] = await sql`SELECT id,passage FROM "ComprehensionExercise" WHERE id=${L[p.lo].cid}`;
  const qs = await sql`SELECT id,question,options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order", id`;
  if (c.passage === p.text) { console.log(`${p.label}: аллакай нав`); continue; }
  if (c.passage !== p.old) throw new Error(`${p.label}: матни ғайричашмдошт «${c.passage}»`);
  if (qs.length !== p.count) throw new Error(`${p.label}: ${qs.length} савол (интизор ${p.count})`);
  for (const u of p.update) if (qs[u.i].question !== u.old) throw new Error(`${p.label} Q${u.i + 1}: «${qs[u.i].question}» ≠ «${u.old}»`);
  for (const q of [...p.update, ...(p.insert ?? [])]) {
    const right = lc(q.options[q.ci]);
    if (!right.includes(q.key) || !lc(p.text).includes(q.key)) throw new Error(`${p.label} «${q.question}»: калиди «${q.key}» дар ҷавоб/матн нест`);
    if (q.options.some((o, j) => j !== q.ci && lc(o).includes(q.key))) throw new Error(`${p.label} «${q.question}»: калид дар варианти нодуруст`);
    if (new Set(q.options).size !== q.options.length) throw new Error(`${p.label}: варианти такрорӣ`);
  }
  for (const k of p.keep ?? []) {
    const right = lc(qs[k.i].options[qs[k.i].ci]);
    if (qs[k.i].question !== k.question || !right.includes(k.key) || !lc(p.text).includes(k.key)) throw new Error(`${p.label} Q${k.i + 1}: дар матни нав тасдиқ нашуд`);
  }
  items.push({ ...p, id: c.id, qs });
  console.log(`\n${p.label}\n  буд: ${p.old}\n  шуд: ${p.text}\n  тҷ : ${p.tr}`);
  for (const u of p.update) console.log(`  Q${u.i + 1}: ${u.question} → «${u.options[u.ci]}»`);
  for (const n of p.insert ?? []) console.log(`  + Q${n.order + 1} (нав): ${n.question} → «${n.options[n.ci]}»`);
  for (const k of p.keep ?? []) console.log(`  = Q${k.i + 1}: ${k.question} (бетағйир, дар матни нав тасдиқ шуд)`);
}

const lines = await sql`SELECT id,speaker,text,"isUser" iu,"order" FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
const allTexts = [...DIALOG.oldTexts, ...DIALOG.add.map((a) => a.text)];
let dlg = null;
if (lines.length === allTexts.length && lines.every((l, i) => l.text === allTexts[i])) console.log(`${DIALOG.label}: аллакай нав`);
else {
  if (lines.length !== 4 || !lines.every((l, i) => l.text === DIALOG.oldTexts[i] && l.order === i)) throw new Error(`${DIALOG.label}: ${JSON.stringify(lines.map((l) => l.text))}`);
  if (lines[0].speaker !== 'Али' || lines[0].iu || lines[1].speaker !== 'Умар' || !lines[1].iu) throw new Error('гӯяндаҳо ғайричашмдошт');
  dlg = { lines, add: DIALOG.add.map((a) => ({ ...a, id: cuidLike() })) };
  console.log(`\n${DIALOG.label}: 4 → 8 сатр, ҳама бо як овоз аз нав сабт мешаванд`);
  for (const a of dlg.add) console.log(`  + ${a.speaker}: ${a.text} = ${a.tr}`);
}

const grams = [];
for (const g of GRAM) {
  const ex = await sql`SELECT id,sentence,translation,highlight,"order" FROM "GrammarExample" WHERE "topicId"=${L[g.lo].gid} ORDER BY "order", id`;
  const want = g.examples.map((e) => e[1] ?? e[0]);
  if (ex.length === 5 && ex.every((e, i) => e.sentence === want[i])) { console.log(`${g.label}: аллакай нав`); continue; }
  if (ex.length !== 5 || !ex.every((e, i) => e.sentence === g.examples[i][0])) throw new Error(`${g.label}: мисолҳо ${JSON.stringify(ex.map((e) => e.sentence))}`);
  const exs = [];
  for (const e of g.exercises) {
    const r = await sql`SELECT id FROM "GrammarExercise" WHERE "topicId"=${L[g.lo].gid} AND prompt=${e.old}`;
    if (r.length !== 1) throw new Error(`${g.label} машқи «${e.old}»: ${r.length}`);
    exs.push({ ...e, id: r[0].id });
  }
  for (const [i, e] of g.examples.entries()) if (e[1] && !e[1].includes(e[3])) throw new Error(`${g.label}: highlight «${e[3]}»`);
  grams.push({ ...g, rows: ex, exs });
  console.log(`\n${g.label}: 5 мисол аз нав сабт мешаванд`);
  for (const [i, e] of g.examples.entries()) if (e[1]) console.log(`  мисол ${i + 1}: ${e[0]} → ${e[1]} = ${e[2]}`);
  for (const e of exs) console.log(`  машқ: ${e.old} → ${e.prompt} («${e.answer}»)`);
}

if (!APPLY || (!items.length && !dlg && !grams.length)) { console.log(items.length || dlg || grams.length ? '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.' : '\nҲама чиз аллакай нав.'); process.exit(0); }

// ── тавлид ва санҷиши аудио ──
mkdirSync(WORK, { recursive: true });
const files = [];
if (items.length) {
  writeFileSync(`${WORK}/p.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text }))));
  console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
  files.push(...items.map((i) => ({ id: i.id, text: i.text, label: i.label, passage: true })));
}
const short = [];
if (dlg) short.push(...dlg.lines.map((l) => ({ id: l.id, text: l.text })), ...dlg.add.map((a) => ({ id: a.id, text: a.text })));
for (const g of grams) short.push(...g.rows.map((r, i) => ({ id: r.id, text: g.examples[i][1] ?? g.examples[i][0] })));
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
    ? m.peak >= 0.2 && m.lead <= 0.5 && art >= 15 && art <= 40 && m.dur <= 25
    : m.peak >= 0.2 && m.lead <= 0.5 && m.speech >= 0.4 && art >= 8 && art <= 30;
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
    'Russian A1 Module 5: re-record passages, dialogue and grammar examples (taught vocabulary only)']);
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

// ── сабт дар база ──
for (const it of items) {
  const tx = [sql`UPDATE "ComprehensionExercise" SET passage=${it.text}, "passageTranslated"=${it.tr}, "audioUrl"=${urlOf[it.id]} WHERE id=${it.id} AND passage=${it.old}`];
  if (it.title) tx.push(sql`UPDATE "ComprehensionExercise" SET title=${it.title[0]}, "titleTranslated"=${it.title[1]} WHERE id=${it.id}`);
  for (const u of it.update) tx.push(sql`UPDATE "ComprehensionQuestion" SET question=${u.question}, "questionTranslated"=${u.qt},
      options=${JSON.stringify(u.options)}::jsonb, "correctIndex"=${u.ci}, explanation=${u.ex} WHERE id=${it.qs[u.i].id}`);
  for (const n of it.insert ?? []) tx.push(sql`INSERT INTO "ComprehensionQuestion" (id,"exerciseId",question,"questionTranslated",options,"correctIndex",explanation,"order")
      VALUES (${cuidLike()},${it.id},${n.question},${n.qt},${JSON.stringify(n.options)}::jsonb,${n.ci},${n.ex},${n.order})`);
  await sql.transaction(tx);
  const [a] = await sql`SELECT passage,"passageTranslated" pt,"audioUrl" au,title FROM "ComprehensionExercise" WHERE id=${it.id}`;
  const aq = await sql`SELECT question,options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${it.id} ORDER BY "order", id`;
  const ok = a.passage === it.text && a.pt === it.tr && a.au === urlOf[it.id] && (!it.title || a.title === it.title[0])
    && it.update.every((u) => aq[u.i].question === u.question && aq[u.i].ci === u.ci && JSON.stringify(aq[u.i].options) === JSON.stringify(u.options))
    && aq.length === it.count + (it.insert?.length ?? 0);
  if (!ok) throw new Error(`ТАСДИҚ НАШУД: ${it.label}`);
  console.log(`✅ ${it.label} — матн, аудио ва ${aq.length} савол сабт ва тасдиқ шуданд`);
}
if (dlg) {
  const did = L[DIALOG.lo].did;
  const tx = dlg.lines.map((l) => sql`UPDATE "DialogueLine" SET "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${l.text}`);
  for (const a of dlg.add) tx.push(sql`INSERT INTO "DialogueLine" (id,"dialogueId",speaker,text,translation,"audioUrl","isUser","order")
      VALUES (${a.id},${did},${a.speaker},${a.text},${a.tr},${urlOf[a.id]},${a.isUser},${a.order})`);
  await sql.transaction(tx);
  const after = await sql`SELECT id,text,"audioUrl" au,"order" FROM "DialogueLine" WHERE "dialogueId"=${did} ORDER BY "order"`;
  if (!(after.length === 8 && after.every((l, i) => l.text === allTexts[i] && l.order === i && l.au === urlOf[l.id]))) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — 8 сатр, ҳама бо аудиои нав`);
}
for (const g of grams) {
  const tx = [];
  for (const [i, r] of g.rows.entries()) {
    const e = g.examples[i];
    tx.push(e[1]
      ? sql`UPDATE "GrammarExample" SET sentence=${e[1]}, translation=${e[2]}, highlight=${e[3]}, "audioUrl"=${urlOf[r.id]} WHERE id=${r.id} AND sentence=${e[0]}`
      : sql`UPDATE "GrammarExample" SET "audioUrl"=${urlOf[r.id]} WHERE id=${r.id} AND sentence=${e[0]}`);
  }
  for (const e of g.exs) tx.push(e.ex
    ? sql`UPDATE "GrammarExercise" SET prompt=${e.prompt}, "promptTranslated"=${e.pt}, answer=${e.answer}, explanation=${e.ex} WHERE id=${e.id}`
    : sql`UPDATE "GrammarExercise" SET prompt=${e.prompt}, "promptTranslated"=${e.pt}, answer=${e.answer} WHERE id=${e.id}`);
  await sql.transaction(tx);
  const ex = await sql`SELECT id,sentence,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${L[g.lo].gid} ORDER BY "order", id`;
  const ok = ex.every((r, i) => r.sentence === (g.examples[i][1] ?? g.examples[i][0]) && r.au === urlOf[r.id]);
  const okx = (await Promise.all(g.exs.map(async (e) => (await sql`SELECT prompt,answer FROM "GrammarExercise" WHERE id=${e.id}`)[0])))
    .every((r, i) => r.prompt === g.exs[i].prompt && r.answer === g.exs[i].answer);
  if (!ok || !okx) throw new Error(`ТАСДИҚ НАШУД: ${g.label}`);
  console.log(`✅ ${g.label} — 5 мисол (аудиои нав) ва ${g.exs.length} машқ`);
}
