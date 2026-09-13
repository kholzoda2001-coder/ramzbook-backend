// МОДУЛИ 9-и РУСӢ (A1) «Города и направления» — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R2   Калимаи корт ≠ мисол: «Поворачивать» → «Повернуть», «Находить» → «Найти»,
//        «Прибывать» → «Спросить», «Местоположение» → «Минута», «Идти пешком» → «Близко».
//        Ҳамон сатри `Word` нав мешавад → кортҳои SRS-и хонандагон солим.
//   R12  «Автобус», «Такси» (қариб хомӯш), «Банк» (Д1 хомӯшии сар, Д16 клиппинг), «Налево» (Д16).
//   R1   Муколама ва ҳамаи матнҳо ба бегона бо шакли РАСМӢ: «Идите / Поверните».
//   R4   Се матни ГУНОГУН: хониш — вокзал, шунавоӣ — масҷид, имтиҳон — дорухона.
//   R5   Саволҳои воқеии фаҳмиш бо тавзеҳи тоҷикӣ. R6 такрор: 4 савол. R3 имтиҳон бе дастури русӣ.
//   R10  Мисоли грамматика «Не сворачивай» → «Не поворачивай»; мисоли нав «Идите прямо, пожалуйста.»
// Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m9-media.mjs           # dry-run
//   node prisma/_ru-m9-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m9-media';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const OLD_SHA = '670d6de';
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
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did,"grammarTopicId" gid FROM "Lesson" WHERE "moduleId"=${mods[8].id} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 9: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

// ── Калимаҳо ──
const WORDS = [
  { lo: 6, old: 'Поворачивать', word: 'Повернуть', translation: 'Гардидан', emoji: '↪️', pos: 'verb',
    example: 'Поверните налево.', exampleTrans: 'Ба чап гардед.' },
  { lo: 8, old: 'Идти пешком', word: 'Близко', translation: 'Наздик', emoji: '🤏', pos: 'adverb',
    example: 'Банк близко.', exampleTrans: 'Бонк наздик аст.' },
  { lo: 9, old: 'Местоположение', word: 'Минута', translation: 'Дақиқа', emoji: '⏱️', pos: 'noun',
    example: 'Идите пять минут.', exampleTrans: 'Панҷ дақиқа равед.' },
  { lo: 9, old: 'Находить', word: 'Найти', translation: 'Ёфтан', emoji: '🔍', pos: 'verb',
    example: 'Я не могу найти банк.', exampleTrans: 'Ман бонкро ёфта наметавонам.' },
  { lo: 9, old: 'Прибывать', word: 'Спросить', translation: 'Пурсидан', emoji: '❓', pos: 'verb',
    example: 'Можно спросить?', exampleTrans: 'Мумкин пурсам?' },
];
const RERECORD = [
  { lo: 4, word: 'Автобус' }, { lo: 4, word: 'Такси' },
  { lo: 0, word: 'Банк' }, { lo: 15, word: 'Банк' }, { lo: 15, word: 'Налево' },
];

// ── Матнҳо ──
const q = (question, qt, options, ci, key, ex) => ({ question, qt, options, ci, key, ex });
const PLAN = [
  {
    lo: 11, label: 'Д12 хониш (вокзал)',
    old: 'Извините, где больница? Иди прямо. Потом поверни налево на углу. Больница рядом с почтой. Банк рядом с парком. Это не далеко. Иди пять минут. Если хочешь музей, садись на автобус на автобусной остановке.',
    text: 'Извините, где вокзал? Вокзал далеко. Идите прямо. Потом поверните направо у светофора. Там автобусная остановка. На автобусе десять минут. Спасибо!',
    tr: 'Мебахшед, вокзал дар куҷост? Вокзал дур аст. Рост равед. Баъд дар назди чароғаки роҳ ба рост гардед. Он ҷо истгоҳи автобус аст. Бо автобус даҳ дақиқа. Ташаккур!',
    count: 4,
    update: [
      { i: 0, old: 'Где больница?', ...q('Вокзал близко?', 'Вокзал наздик аст?', ['Да, близко', 'Нет, далеко', 'Это рядом'], 1, 'далеко', 'Дар матн: «Вокзал далеко» — дур аст.') },
      { i: 1, old: 'Какое первое направление?', ...q('У светофора: налево или направо?', 'Дар назди чароғаки роҳ: ба чап ё ба рост?', ['Налево', 'Направо', 'Прямо'], 1, 'направо', 'Дар матн: «поверните направо у светофора» — ба рост.') },
      { i: 2, old: 'Что рядом с парком?', ...q('Что там?', 'Он ҷо чӣ ҳаст?', ['Автобусная остановка', 'Больница', 'Мечеть'], 0, 'автобусная остановка', 'Дар матн: «Там автобусная остановка» — истгоҳи автобус.') },
      { i: 3, old: 'Как добраться до музея?', ...q('Сколько минут на автобусе?', 'Бо автобус чанд дақиқа?', ['Пять минут', 'Десять минут', 'Двадцать минут'], 1, 'десять минут', 'Дар матн: «На автобусе десять минут» — даҳ дақиқа.') },
    ],
  },
  {
    lo: 12, label: 'Д13 шунавоӣ (масҷид)',
    old: 'Извините, где банк? Иди прямо. Потом поверни налево. Банк рядом с магазином. Он рядом с парком. Это не далеко. Большое спасибо. Больница напротив парка. Если хочешь музей, садись на автобус на автобусной остановке у угла.',
    text: 'Извините, где мечеть? Мечеть близко. Идите прямо пять минут. Потом поверните налево. Мечеть напротив парка, между банком и школой. Не поворачивайте направо: там мост.',
    tr: 'Мебахшед, масҷид дар куҷост? Масҷид наздик аст. Панҷ дақиқа рост равед. Баъд ба чап гардед. Масҷид дар рӯ ба рӯи боғ, дар байни бонк ва мактаб аст. Ба рост нагардед: он ҷо купрук аст.',
    count: 4,
    update: [
      { i: 0, old: 'Какое место он ищет?', ...q('Мечеть далеко?', 'Масҷид дур аст?', ['Да, далеко', 'Нет, близко', 'Мечеть там'], 1, 'близко', 'Дар матн: «Мечеть близко» — наздик аст.') },
      { i: 1, old: 'В какую сторону он поворачивает?', ...q('Потом: налево или направо?', 'Баъд: ба чап ё ба рост?', ['Налево', 'Направо', 'Прямо'], 0, 'налево', 'Дар матн: «Потом поверните налево» — ба чап.') },
      { i: 2, old: 'Рядом с чем банк?', ...q('Мечеть напротив…', 'Масҷид дар рӯ ба рӯи…', ['парка', 'банка', 'школы'], 0, 'парка', 'Дар матн: «Мечеть напротив парка» — дар рӯ ба рӯи боғ.') },
      { i: 3, old: 'Это далеко?', ...q('Что там направо?', 'Он ҷо, дар тарафи рост, чӣ ҳаст?', ['Мост', 'Парк', 'Банк'], 0, 'мост', 'Дар матн: «Не поворачивайте направо: там мост» — купрук.') },
    ],
  },
  {
    lo: 14, label: 'Д15 такрор (дорухона)',
    old: 'Давайте повторим направления! Я иду в город. Я ищу музей. Я иду прямо и поворачиваю направо. Он между кафе и библиотекой.',
    text: 'Я в городе. Мне нужна аптека. Аптека близко. Я иду прямо, потом налево. Аптека между кафе и библиотекой. Это пять минут.',
    tr: 'Ман дар шаҳр ҳастам. Ба ман дорухона лозим аст. Дорухона наздик аст. Ман рост меравам, баъд ба чап. Дорухона дар байни қаҳвахона ва китобхона аст. Ин панҷ дақиқа аст.',
    count: 2,
    update: [
      { i: 0, old: 'Что я ищу?', ...q('Что мне нужно?', 'Ба ман чӣ лозим аст?', ['Аптека', 'Больница', 'Банк'], 0, 'аптека', 'Дар матн: «Мне нужна аптека» — дорухона.') },
      { i: 1, old: 'Где он находится?', ...q('Где аптека?', 'Дорухона дар куҷост?', ['Напротив магазина', 'Между кафе и библиотекой', 'Рядом с парком'], 1, 'между кафе и библиотекой', 'Дар матн: «Аптека между кафе и библиотекой» — дар байни қаҳвахона ва китобхона.') },
    ],
    insert: [
      { order: 2, ...q('Аптека далеко?', 'Дорухона дур аст?', ['Да, далеко', 'Нет, близко', 'Десять минут'], 1, 'близко', 'Дар матн: «Аптека близко» — наздик аст.') },
      { order: 3, ...q('Сколько минут?', 'Чанд дақиқа?', ['Пять минут', 'Десять минут', 'Двадцать минут'], 0, 'пять минут', 'Дар матн: «Это пять минут» — панҷ дақиқа.') },
    ],
  },
  {
    lo: 16, label: 'Д17 имтиҳон (дорухона)',
    old: 'Извините, где аптека? Иди прямо и поверни налево у светофора. Аптека рядом с банком. Это не далеко. Иди пять минут. Больница напротив парка. Если хочешь музей, садись на автобус на автобусной остановке у угла.',
    text: 'Извините, где аптека? Аптека близко. Идите прямо. У светофора поверните налево. Аптека рядом с банком. Больница далеко. На такси десять минут.',
    tr: 'Мебахшед, дорухона дар куҷост? Дорухона наздик аст. Рост равед. Дар назди чароғаки роҳ ба чап гардед. Дорухона дар паҳлӯи бонк аст. Беморхона дур аст. Бо такси даҳ дақиқа.',
    count: 8,
    update: [
      { i: 0, old: 'Где ты поворачиваешь налево?', ...q('Налево — где?', 'Ба чап — дар куҷо?', ['У светофора', 'У моста', 'На углу'], 0, 'у светофора', 'Дар матн: «У светофора поверните налево» — дар назди чароғаки роҳ.') },
      { i: 1, old: 'Что рядом с банком?', ...q('Что рядом с банком?', 'Дар паҳлӯи бонк чӣ ҳаст?', ['Музей', 'Аптека', 'Больница'], 1, 'аптека', 'Дар матн: «Аптека рядом с банком» — дорухона.') },
      { i: 2, old: 'Как добраться до музея?', ...q('Больница близко?', 'Беморхона наздик аст?', ['Да', 'Нет, далеко', 'Рядом с банком'], 1, 'далеко', 'Дар матн: «Больница далеко» — дур аст.') },
      { i: 3, old: "Переведите 'Беморхона дар куҷост?':", ...q('Переведите «Беморхона дар куҷост?»:', '«Беморхона дар куҷост?»-ро тарҷума кунед:', ['Где больница?', 'Это больница?', 'Больница далеко.'], 0, null, 'Беморхона = больница, дар куҷост = где. Пас: «Где больница?»') },
      { i: 4, old: 'Выберите правильное: ___ направо на углу.', ...q('___ направо, пожалуйста.', 'Лутфан, ба рост гардед.', ['Идите', 'Поверните', 'Найти'], 1, null, 'Гардидан, ба «шумо» → Поверните. («Идите» = равед.)') },
      { i: 5, old: "Переведите 'Ман бо автобус меравам':", ...q('Переведите «Ман бо автобус меравам»:', '«Ман бо автобус меравам»-ро тарҷума кунед:', ['Я еду на автобусе.', 'Я иду в школу.', 'Где автобус?'], 0, null, 'Бо нақлиёт рафтан = ехать. Пас: «Я еду на автобусе».') },
      { i: 6, old: "Как будет 'Дорухона' по-русски?", ...q('Переведите «Дорухона»:', '«Дорухона»-ро тарҷума кунед:', ['Аптека', 'Пекарня', 'Банк'], 0, null, 'Дорухона = аптека. (нонвойхона = пекарня, бонк = банк.)') },
      { i: 7, old: "Переведите 'Рост равед':", ...q('Переведите «Рост равед»:', '«Рост равед»-ро тарҷума кунед:', ['Поверните налево', 'Идите прямо', 'Остановитесь'], 1, null, '«Равед» — ба «шумо», пас «Идите»: «Идите прямо».') },
    ],
  },
];

const DIALOG = {
  lo: 13, label: 'Д14 муколама',
  lines: [
    { old: 'Извините. Где больница?', text: 'Извините. Где больница?', tr: 'Мебахшед. Беморхона дар куҷост?' },
    { old: 'Иди прямо.', text: 'Идите прямо.', tr: 'Рост равед.' },
    { old: 'А потом?', text: 'А потом?', tr: 'Баъд чӣ?' },
    { old: 'Поверни направо.', text: 'Потом поверните направо.', tr: 'Баъд ба рост гардед.' },
    { old: 'Это рядом с банком?', text: 'Это далеко?', tr: 'Дур аст?' },
    { old: 'Да. Это рядом с банком.', text: 'Нет, близко. Больница рядом с банком.', tr: 'Не, наздик. Беморхона дар паҳлӯи бонк аст.' },
    { old: 'Спасибо.', text: 'Спасибо.', tr: 'Раҳмат.' },
    { old: 'Пожалуйста.', text: 'Пожалуйста.', tr: 'Хоҳиш мекунам.' },
  ],
};
const GEX_UPDATE = { old: 'Не сворачивай направо.', text: 'Не поворачивай направо.', tr: 'Ба рост нагард.', hl: 'Не' };
const GEX_INSERT = { text: 'Идите прямо, пожалуйста.', tr: 'Лутфан, рост равед.', hl: 'Идите' };

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
    if (/'/.test(x.question) || /Выберите|Как будет|Дополните/.test(x.question)) throw new Error(`${p.label} «${x.question}»: дастури манъшуда`);
    // Тоҷикӣ на ҳамеша ҳарфи махсус дорад («Вокзал наздик аст?») → калимаҳои хидматӣ ҳам қабуланд.
    const tg = `${x.ex} ${x.qt}`;
    if (!/[ӣӯҳҷқғ]/i.test(tg) && !/(^|[\s«(])(аст|дар|ба|бо|ва|пас|ин|он|матн)([\s.,:;!?»)]|$)/i.test(tg)) {
      throw new Error(`${p.label} «${x.question}»: тавзеҳ тоҷикӣ нест`);
    }
    if (x.key === null) continue;
    if (!lc(x.options[x.ci]).includes(x.key) || !lc(p.text).includes(x.key)) throw new Error(`${p.label} «${x.question}»: калиди «${x.key}» дар ҷавоб/матн нест`);
    if (x.options.some((o, j) => j !== x.ci && lc(o).includes(x.key))) throw new Error(`${p.label} «${x.question}»: калид дар варианти нодуруст`);
  }
  if (/\b(Иди|Поверни)\b/.test(p.text)) throw new Error(`${p.label}: шакли «ту» ба бегона (R1)`);
  items.push({ ...p, id: c.id, qs });
  console.log(`\n${p.label}\n  шуд: ${p.text}\n  тҷ : ${p.tr}`);
  for (const u of p.update) console.log(`  Q${u.i + 1}: ${u.question} → «${u.options[u.ci]}»`);
  for (const n of p.insert ?? []) console.log(`  + Q${n.order + 1} (нав): ${n.question} → «${n.options[n.ci]}»`);
}
if (new Set(PLAN.map((p) => p.text)).size !== PLAN.length) throw new Error('матнҳо бояд гуногун бошанд (R4)');

const wordItems = [];
for (const w of WORDS) {
  const r = await sql`SELECT id,word FROM "Word" WHERE "lessonId"=${L[w.lo].id} AND word = ANY(${[w.old, w.word]})`;
  if (r.length !== 1) throw new Error(`Д${w.lo + 1} «${w.old}»: ${r.length} сатр`);
  if (r[0].word === w.word) { console.log(`Д${w.lo + 1} «${w.word}»: аллакай нав`); continue; }
  if (!lc(w.example).includes(lc(w.word).slice(0, 5))) throw new Error(`«${w.word}»: мисол калимаро надорад`);
  wordItems.push({ ...w, id: r[0].id });
  console.log(`\nД${w.lo + 1}: «${w.old}» → «${w.word}» = «${w.translation}» ${w.emoji} · «${w.example}»`);
}
for (const lo of [...new Set(WORDS.map((w) => w.lo))]) {
  const rows = await sql`SELECT word,translation FROM "Word" WHERE "lessonId"=${L[lo].id}`;
  const after = rows.map((r) => WORDS.find((w) => w.lo === lo && w.old === r.word)?.translation ?? r.translation);
  if (new Set(after).size !== after.length) throw new Error(`Д${lo + 1}: коллизияи тарҷума ${JSON.stringify(after)}`);
}

const rerec = [];
for (const r of RERECORD) {
  const row = await sql`SELECT id,word,"audioUrl" au FROM "Word" WHERE "lessonId"=${L[r.lo].id} AND word=${r.word}`;
  if (row.length !== 1) throw new Error(`Д${r.lo + 1} «${r.word}»: ${row.length}`);
  if (row[0].au.includes(`@${OLD_SHA}`)) rerec.push({ ...row[0], lo: r.lo });
  else console.log(`Д${r.lo + 1} «${r.word}»: аудио аллакай нав`);
}
if (rerec.length) console.log(`\nсабти нав: ${rerec.map((r) => `Д${r.lo + 1} «${r.word}»`).join(', ')}`);

const lines = await sql`SELECT id,text,translation,"order" FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
if (lines.length !== 8) throw new Error(`${DIALOG.label}: ${lines.length} сатр`);
let dlg = null;
if (lines.every((l, i) => l.text === DIALOG.lines[i].text && l.translation === DIALOG.lines[i].tr)) console.log(`${DIALOG.label}: аллакай нав`);
else {
  if (!lines.every((l, i) => l.text === DIALOG.lines[i].old && l.order === i)) throw new Error(`${DIALOG.label}: ${JSON.stringify(lines.map((l) => l.text))}`);
  dlg = lines.map((l, i) => ({ ...DIALOG.lines[i], id: l.id }));
  console.log(`\n${DIALOG.label}: ҳама 8 сатр бо як овоз аз нав (шакли расмӣ)`);
  for (const l of dlg) if (l.old !== l.text) console.log(`  «${l.old}» → «${l.text}» = ${l.tr}`);
}

const gexRows = await sql`SELECT id,sentence,"order" FROM "GrammarExample" WHERE "topicId"=${L[10].gid} ORDER BY "order"`;
const gexU = gexRows.find((x) => x.sentence === GEX_UPDATE.old);
if (!gexU && !gexRows.some((x) => x.sentence === GEX_UPDATE.text)) throw new Error('Д11 мисоли «Не сворачивай» ёфт нашуд');
const gexUpd = gexU ? { ...GEX_UPDATE, id: gexU.id } : null;
const gexIns = gexRows.some((x) => x.sentence === GEX_INSERT.text) ? null
  : { ...GEX_INSERT, id: cuidLike(), order: Math.max(...gexRows.map((x) => x.order)) + 1 };
console.log(gexUpd ? `\nД11 мисол: «${GEX_UPDATE.old}» → «${GEX_UPDATE.text}»` : 'Д11 мисоли инкор: аллакай нав');
console.log(gexIns ? `Д11 мисоли нав: «${GEX_INSERT.text}»` : 'Д11 мисоли расмӣ: аллакай ҳаст');

const nothing = !items.length && !wordItems.length && !rerec.length && !dlg && !gexUpd && !gexIns;
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
  ...(gexUpd ? [{ id: gexUpd.id, text: gexUpd.text }] : []),
  ...(gexIns ? [{ id: gexIns.id, text: gexIns.text }] : []),
];
if (short.length) {
  writeFileSync(`${WORK}/s.json`, JSON.stringify(short));
  console.log(execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/s.json`], PY).trim().split('\n').filter((l) => !l.startsWith('OK ')).join('\n'));
  files.push(...short.map((s) => ({ ...s, label: `«${s.text}»`, passage: false })));
}
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
    'Russian A1 Module 9: distinct passages, formal directions, replaced words']);
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
for (const w of wordItems) {
  await sql`UPDATE "Word" SET word=${w.word}, translation=${w.translation}, emoji=${w.emoji}, "partOfSpeech"=${w.pos},
    example=${w.example}, "exampleTrans"=${w.exampleTrans}, "audioUrl"=${urlOf[w.id]} WHERE id=${w.id} AND word=${w.old}`;
  const [a] = await sql`SELECT word,translation,"audioUrl" au FROM "Word" WHERE id=${w.id}`;
  if (a.word !== w.word || a.translation !== w.translation || a.au !== urlOf[w.id]) throw new Error(`ТАСДИҚ НАШУД: «${w.word}»`);
  console.log(`✅ Д${w.lo + 1} «${w.old}» → «${w.word}»`);
}
for (const w of rerec) {
  await sql`UPDATE "Word" SET "audioUrl"=${urlOf[w.id]} WHERE id=${w.id} AND word=${w.word}`;
  const [a] = await sql`SELECT "audioUrl" au FROM "Word" WHERE id=${w.id}`;
  if (a.au !== urlOf[w.id]) throw new Error(`ТАСДИҚ НАШУД: «${w.word}»`);
  console.log(`✅ Д${w.lo + 1} «${w.word}» — аудиои нав`);
}
if (dlg) {
  await sql.transaction(dlg.map((l) => sql`UPDATE "DialogueLine" SET text=${l.text}, translation=${l.tr}, "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${l.old}`));
  const after = await sql`SELECT id,text,translation,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
  if (!after.every((l, i) => l.text === dlg[i].text && l.translation === dlg[i].tr && l.au === urlOf[l.id])) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — 8 сатр, шакли расмӣ, аудиои нав`);
}
if (gexUpd) {
  await sql`UPDATE "GrammarExample" SET sentence=${gexUpd.text}, translation=${gexUpd.tr}, highlight=${gexUpd.hl}, "audioUrl"=${urlOf[gexUpd.id]} WHERE id=${gexUpd.id} AND sentence=${gexUpd.old}`;
  const [a] = await sql`SELECT sentence,"audioUrl" au FROM "GrammarExample" WHERE id=${gexUpd.id}`;
  if (a.sentence !== gexUpd.text || a.au !== urlOf[gexUpd.id]) throw new Error('ТАСДИҚ НАШУД: Д11 мисоли инкор');
  console.log(`✅ Д11 мисол «${gexUpd.text}»`);
}
if (gexIns) {
  await sql`INSERT INTO "GrammarExample" (id,"topicId",sentence,translation,"audioUrl",highlight,"order")
    VALUES (${gexIns.id},${L[10].gid},${gexIns.text},${gexIns.tr},${urlOf[gexIns.id]},${gexIns.hl},${gexIns.order})`;
  const [a] = await sql`SELECT sentence,"audioUrl" au FROM "GrammarExample" WHERE id=${gexIns.id}`;
  if (a?.sentence !== gexIns.text || a.au !== urlOf[gexIns.id]) throw new Error('ТАСДИҚ НАШУД: Д11 мисоли расмӣ');
  console.log(`✅ Д11 мисоли нав «${gexIns.text}»`);
}
