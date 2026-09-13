// МОДУЛИ 12-и РУСӢ (A1) «Природа, школа и чувства» — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R6   «Кабинет» (= «Синфхона», қариб айнан «Класс» ва акси якхела дар ҳамон дарс) → «Парта».
//        Ҳамон сатри `Word` → SRS солим.
//   R11  «Корова», «Кролик», «Трава» ва мисоли «Завтра я буду читать книгу.» — сабти нав.
//   R1–R4 Чор матни ГУНОГУН: боғи ҳайвонот · чор фасл · ферма · рӯзи мактабӣ;
//        саволҳои фаҳмиш бо тавзеҳи тоҷикӣ, ҳама 3 вариант, бе дастури русӣ.
//   R9   Муколама бе «Солнечно / Пойдём», ҳама 8 сатр бо як овоз.
// Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m12-media.mjs           # dry-run
//   node prisma/_ru-m12-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m12-media';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const OLD_SHAS = ['5285417', '14cfa62'];
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
const isOld = (u) => OLD_SHAS.some((s) => (u ?? '').includes(`@${s}`));

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did,"grammarTopicId" gid FROM "Lesson" WHERE "moduleId"=${mods[11].id} ORDER BY "order"`;
if (lessons.length !== 20) throw new Error(`Модули 12: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

// ── R6: калима ──
const WORDS = [
  { lo: 8, old: 'Кабинет', word: 'Парта', translation: 'Парта', emoji: '🪑', pos: 'noun', example: 'Парта новая.', exampleTrans: 'Парта нав аст.' },
];
const RERECORD = [{ lo: 3, word: 'Корова' }, { lo: 5, word: 'Кролик' }, { lo: 6, word: 'Трава' }];
const GEX = { lo: 13, sentence: 'Завтра я буду читать книгу.' };

// ── Матнҳо ──
const q = (question, qt, options, ci, key, ex) => ({ question, qt, options, ci, key, ex });
const PLAN = [
  {
    lo: 14, label: 'Д15 хониш (боғи ҳайвонот)',
    old: 'Сейчас весна. Погода тёплая и небо голубое. Сегодня я счастлив. Я иду в школу с другом. Наш учитель добрый. Урок русского весёлый. После школы я играю с собакой в саду. Ночью я смотрю на луну и звёзды. Я чувствую себя счастливым.',
    text: 'Сегодня суббота. Я и мой брат в зоопарке. Там большой слон и сильный лев. Обезьяна маленькая и весёлая. Медведь спит. Змея длинная, и я испуганный. Мой брат смеётся.',
    tr: 'Имрӯз шанбе аст. Ман ва бародарам дар боғи ҳайвонот ҳастем. Он ҷо фили калон ва шери зӯр ҳаст. Маймун хурд ва шод аст. Хирс хоб аст. Мор дароз аст ва ман тарсидаам. Бародарам механдад.',
    count: 4,
    update: [
      { i: 0, old: 'Какая погода?', ...q('Где мы?', 'Мо дар куҷо ҳастем?', ['В зоопарке', 'В школе', 'На ферме'], 0, 'в зоопарке', 'Дар матн: «Я и мой брат в зоопарке» — дар боғи ҳайвонот.') },
      { i: 1, old: 'Как он себя чувствует сегодня?', ...q('Какой лев?', 'Шер чӣ гуна аст?', ['Сильный', 'Маленький', 'Весёлый'], 0, 'сильный', 'Дар матн: «сильный лев» — шери зӯр.') },
      { i: 2, old: 'Где он играет с собакой?', ...q('Что делает медведь?', 'Хирс чӣ кор мекунад?', ['Спит', 'Ест', 'Смеётся'], 0, 'спит', 'Дар матн: «Медведь спит» — хоб аст.') },
      { i: 3, old: 'Что он видит ночью?', ...q('Кто смеётся?', 'Кӣ механдад?', ['Мой брат', 'Обезьяна', 'Лев'], 0, 'мой брат', 'Дар матн: «Мой брат смеётся» — бародарам.') },
    ],
  },
  {
    lo: 15, label: 'Д16 шунавоӣ (чор фасл)',
    old: 'В году четыре времени года. Весной погода тёплая и цветы раскрываются. Летом жарко и небо голубое. Осенью ветер сильный и листья падают. Зимой холодно и есть снег. Я больше всего люблю лето. Моё любимое время года — лето, потому что я могу плавать в реке с друзьями.',
    text: 'Есть четыре времени года: весна, лето, осень и зима. Весной тепло и есть цветы. Летом жарко, мы на пляже. Осенью дождь и ветер. Зимой холодно и идёт снег. Я люблю лето.',
    tr: 'Чор фасли сол ҳаст: баҳор, тобистон, тирамоҳ ва зимистон. Дар баҳор ҳаво гарм аст ва гул ҳаст. Дар тобистон ҳаво сӯзон аст, мо дар соҳил ҳастем. Дар тирамоҳ борон ва шамол аст. Дар зимистон хунук аст ва барф меборад. Ман тобистонро дӯст медорам.',
    count: 4,
    update: [
      { i: 0, old: 'Сколько времён года в году?', ...q('Сколько времён года?', 'Чанд фасли сол ҳаст?', ['Четыре', 'Пять', 'Три'], 0, 'четыре', 'Дар матн: «Есть четыре времени года» — чор фасл.') },
      { i: 1, old: 'Когда жарко?', ...q('Когда жарко?', 'Кай ҳаво сӯзон аст?', ['Весной', 'Летом', 'Зимой'], 1, 'летом', 'Дар матн: «Летом жарко» — дар тобистон.') },
      { i: 2, old: 'Что падает осенью?', ...q('Что осенью?', 'Дар тирамоҳ чӣ ҳаст?', ['Снег', 'Цветы', 'Дождь и ветер'], 2, 'дождь и ветер', 'Дар матн: «Осенью дождь и ветер» — борон ва шамол.') },
      { i: 3, old: 'Какое время года говорящий любит больше всего?', ...q('Что я люблю?', 'Ман чиро дӯст медорам?', ['Лето', 'Осень', 'Зиму'], 0, 'лето', 'Дар матн: «Я люблю лето» — тобистонро.') },
    ],
  },
  {
    lo: 17, label: 'Д18 такрор (ферма)',
    old: 'Азиз живёт на ферме со своей семьёй. У него есть собака, две коровы и много овец. Весной трава зелёная и погода тёплая. Азиз и его собака гуляют к реке каждое утро. Вечером он делает домашнее задание и смотрит на звёзды в небе.',
    text: 'Азиз живёт на ферме. У него есть собака, корова и три овцы. Весной трава зелёная. Утром Азиз и собака на реке. Вечером он делает домашнее задание.',
    tr: 'Азиз дар ферма зиндагӣ мекунад. Ӯ саг, гов ва се гӯсфанд дорад. Дар баҳор алаф сабз аст. Субҳ Азиз ва саг дар лаби дарё ҳастанд. Бегоҳ ӯ вазифаи хонагӣ иҷро мекунад.',
    count: 3,
    update: [
      { i: 0, old: 'Где живёт Азиз?', ...q('Где живёт Азиз?', 'Азиз дар куҷо зиндагӣ мекунад?', ['На ферме', 'На пляже', 'В городе'], 0, 'на ферме', 'Дар матн: «Азиз живёт на ферме» — дар ферма.') },
      { i: 1, old: 'Какие животные у него есть?', ...q('Какие животные у него есть?', 'Ӯ кадом ҳайвонҳоро дорад?', ['Лев и медведь', 'Собака, корова и три овцы', 'Кошка и птица'], 1, 'собака, корова и три овцы', 'Дар матн: «У него есть собака, корова и три овцы» — саг, гов ва се гӯсфанд.') },
      { i: 2, old: 'Что Азиз делает вечером?', ...q('Что Азиз делает вечером?', 'Азиз бегоҳ чӣ кор мекунад?', ['Играет', 'Спит', 'Делает домашнее задание'], 2, 'делает домашнее задание', 'Дар матн: «Вечером он делает домашнее задание» — вазифаи хонагӣ.') },
    ],
    insert: [
      { order: 3, ...q('Какая трава весной?', 'Дар баҳор алаф чӣ ранг аст?', ['Зелёная', 'Жёлтая', 'Белая'], 0, 'зелёная', 'Дар матн: «Весной трава зелёная» — сабз.') },
    ],
  },
  {
    lo: 19, label: 'Д20 имтиҳон (рӯзи мактабӣ)',
    old: 'Сегодня учебный день. Мадина встаёт рано и смотрит на небо. Погода хорошая — тепло и солнечно. В школе учитель пишет новые слова на доске. Урок весёлый. После школы Мадина играет со своей кошкой и делает домашнее задание. Ночью она видит луну и много звёзд. Она чувствует себя счастливой.',
    text: 'Сегодня понедельник. Мадина идёт в школу. Погода хорошая: тепло и солнце. Учитель пишет новые слова на доске. Урок весёлый. Потом Мадина делает домашнее задание. Вечером она играет с кошкой. Мадина счастливая.',
    tr: 'Имрӯз душанбе аст. Мадина ба мактаб меравад. Ҳаво хуб аст: гарм ва офтобӣ. Муаллим калимаҳои навро дар тахта менависад. Дарс шавқовар аст. Баъд Мадина вазифаи хонагиро иҷро мекунад. Бегоҳ ӯ бо гурбааш бозӣ мекунад. Мадина хушҳол аст.',
    count: 8,
    update: [
      { i: 0, old: 'Какая погода?', ...q('Какая погода?', 'Ҳаво чӣ гуна аст?', ['Тепло и солнце', 'Холодно и снег', 'Дождь и ветер'], 0, 'тепло и солнце', 'Дар матн: «тепло и солнце» — гарм ва офтобӣ.') },
      { i: 1, old: 'Где учитель пишет новые слова?', ...q('Где учитель пишет новые слова?', 'Муаллим калимаҳои навро дар куҷо менависад?', ['В книге', 'На доске', 'На бумаге'], 1, 'на доске', 'Дар матн: «пишет новые слова на доске» — дар тахта.') },
      { i: 2, old: 'Что Мадина делает после школы?', ...q('Что делает Мадина потом?', 'Мадина баъд чӣ кор мекунад?', ['Спит', 'Делает домашнее задание', 'Играет в футбол'], 1, 'делает домашнее задание', 'Дар матн: «Потом Мадина делает домашнее задание» — вазифаи хонагӣ.') },
      { i: 3, old: 'Как Мадина себя чувствует ночью?', ...q('Мадина…', 'Мадина … аст.', ['счастливая', 'злая', 'сонная'], 0, 'счастливая', 'Дар матн: «Мадина счастливая» — хушҳол аст.') },
      { i: 4, old: 'Какой урок?', ...q('Какой урок?', 'Дарс чӣ гуна аст?', ['Весёлый', 'Длинный', 'Новый'], 0, 'весёлый', 'Дар матн: «Урок весёлый» — шавқовар.') },
      { i: 5, old: "Как будет 'Осмон' по-русски?", ...q('Переведите «Осмон»:', '«Осмон»-ро тарҷума кунед:', ['Облако', 'Небо', 'Звезда'], 1, null, 'Осмон бо русӣ — небо. (Абр — облако, ситора — звезда.)') },
      { i: 6, old: 'Выберите правильное: Мадина ___ рано.', ...q('Мадина ___ в школу.', 'Мадина ба мактаб меравад.', ['иду', 'идёт', 'идём'], 1, null, 'Бо «она» → идёт. (я иду, мы идём.)') },
      { i: 7, old: "Переведите 'ситораҳои зиёд':", ...q('Переведите «Вазифаи хонагӣ»:', '«Вазифаи хонагӣ»-ро тарҷума кунед:', ['Домашнее задание', 'Экзамен', 'Урок'], 0, null, 'Вазифаи хонагӣ бо русӣ — домашнее задание. (Имтиҳон — экзамен, дарс — урок.)') },
    ],
  },
];

const DIALOG = {
  lo: 16, label: 'Д17 муколама',
  lines: [
    { old: 'Какая сегодня погода?', text: 'Какая сегодня погода?', tr: 'Имрӯз обу ҳаво чӣ хел аст?' },
    { old: 'Солнечно и тепло.', text: 'Тепло, и есть солнце.', tr: 'Гарм аст ва офтоб ҳаст.' },
    { old: 'Тебе нравится жаркая погода?', text: 'Тебе нравится жаркая погода?', tr: 'Ба ту ҳавои гарм писанд аст?' },
    { old: 'Да. Лето — моё любимое время года.', text: 'Да. Лето — моё любимое время года.', tr: 'Ҳа. Тобистон фасли дӯстдоштаи ман аст.' },
    { old: 'Мне нравится зима. Я люблю снег.', text: 'Мне нравится зима. Я люблю снег.', tr: 'Ба ман зимистон писанд аст. Ман барфро дӯст медорам.' },
    { old: 'Зимой очень холодно!', text: 'Зимой очень холодно!', tr: 'Дар зимистон хеле хунук аст!' },
    { old: 'Да, но это красиво.', text: 'Да, но это красиво.', tr: 'Ҳа, аммо зебо аст.' },
    { old: 'Пойдём сейчас в парк.', text: 'Хорошо. Сейчас мы идём в парк.', tr: 'Хуб. Ҳозир мо ба боғ меравем.' },
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
    if (/'/.test(x.question) || /Выберите|Как будет|Дополните|Куда|видит|себя/.test(x.question)) throw new Error(`${p.label} «${x.question}»: дастури манъшуда`);
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
  WHERE m."courseId"=${COURSE_RU_A1} AND m.id <> ${mods[11].id}`).map((r) => r.k));
const conflicts = WORDS.map((w) => w.word).filter((x) => priorWords.has(lc(x)));
if (conflicts.length) throw new Error(`аллакай дар модули дигар корт ҳастанд: ${conflicts.join(', ')}`);
const wordItems = [];
for (const w of WORDS) {
  const r = await sql`SELECT id,word FROM "Word" WHERE "lessonId"=${L[w.lo].id} AND word = ANY(${[w.old, w.word]})`;
  if (r.length !== 1) throw new Error(`Д${w.lo + 1} «${w.old}»: ${r.length} сатр`);
  if (r[0].word === w.word) { console.log(`Д${w.lo + 1} «${w.word}»: аллакай нав`); continue; }
  const rows = await sql`SELECT word,translation FROM "Word" WHERE "lessonId"=${L[w.lo].id}`;
  const tr = rows.map((x) => (x.word === w.old ? w.translation : x.translation));
  if (new Set(tr).size !== tr.length) throw new Error(`Д${w.lo + 1}: коллизияи тарҷума ${JSON.stringify(tr)}`);
  wordItems.push({ ...w, id: r[0].id });
  console.log(`Д${w.lo + 1}: «${w.old}» → «${w.word}» = «${w.translation}» ${w.emoji} · «${w.example}»`);
}

const rerec = [];
for (const r of RERECORD) {
  const row = await sql`SELECT id,word,"audioUrl" au FROM "Word" WHERE "lessonId"=${L[r.lo].id} AND word=${r.word}`;
  if (row.length !== 1) throw new Error(`Д${r.lo + 1} «${r.word}»: ${row.length}`);
  if (isOld(row[0].au)) rerec.push({ ...row[0], lo: r.lo, table: 'Word', text: r.word });
  else console.log(`Д${r.lo + 1} «${r.word}»: аудио аллакай нав`);
}
{
  const g = await sql`SELECT id,sentence,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${L[GEX.lo].gid} AND sentence=${GEX.sentence}`;
  if (g.length !== 1) throw new Error(`Д${GEX.lo + 1} мисол «${GEX.sentence}»: ${g.length}`);
  if (isOld(g[0].au)) rerec.push({ id: g[0].id, lo: GEX.lo, table: 'GrammarExample', text: GEX.sentence });
  else console.log(`Д${GEX.lo + 1} мисол: аудио аллакай нав`);
}
if (rerec.length) console.log(`\nсабти нав: ${rerec.map((r) => `Д${r.lo + 1} «${r.text}»`).join(', ')}`);

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

const nothing = !items.length && !wordItems.length && !rerec.length && !dlg;
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
  ...rerec.map((w) => ({ id: w.id, text: w.text })),
  ...(dlg ?? []).map((l) => ({ id: l.id, text: l.text })),
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
    'Russian A1 Module 12: distinct passages, A1 dialogue, replaced word']);
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
  if (w.table === 'Word') await sql`UPDATE "Word" SET "audioUrl"=${urlOf[w.id]} WHERE id=${w.id}`;
  else await sql`UPDATE "GrammarExample" SET "audioUrl"=${urlOf[w.id]} WHERE id=${w.id}`;
  const [a] = w.table === 'Word'
    ? await sql`SELECT "audioUrl" au FROM "Word" WHERE id=${w.id}`
    : await sql`SELECT "audioUrl" au FROM "GrammarExample" WHERE id=${w.id}`;
  if (a.au !== urlOf[w.id]) throw new Error(`ТАСДИҚ НАШУД: «${w.text}»`);
  console.log(`✅ Д${w.lo + 1} «${w.text}» — аудиои нав`);
}
if (dlg) {
  await sql.transaction(dlg.map((l) => sql`UPDATE "DialogueLine" SET text=${l.text}, translation=${l.tr}, "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${l.old}`));
  const after = await sql`SELECT id,text,translation,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=${did} ORDER BY "order"`;
  if (!after.every((l, i) => l.text === dlg[i].text && l.translation === dlg[i].tr && l.au === urlOf[l.id])) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — 8 сатр, аудиои нав`);
}
