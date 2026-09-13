// МОДУЛИ 10-и РУСӢ (A1) «Одежда и цвета» — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R1   14 калимаи «нав» аллакай дар М2/М7/М8 омӯзонида шуда буданд (Д5 — 7 аз 8!) → калимаҳои
//        воқеан нав. R10 «Чёрно-синий» → «Голубой». Ҳамон сатри `Word` нав мешавад → SRS солим.
//        Нусхаҳои дарси навиштан (Д17) ҳам иваз мешаванд.
//   R12  «Шорты», «Шарф» (қариб хомӯш), «Наручные часы», «Большой» (клиппинг), «Фиолетовый».
//   R3–R5 Се матни ГУНОГУН + такрор, саволҳои фаҳмиш бо тавзеҳи тоҷикӣ, имтиҳон бе дастури русӣ.
//   R6   Муколама 7 → 8 сатр, ҳама бо як овоз.
// Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m10-media.mjs           # dry-run
//   node prisma/_ru-m10-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { randomBytes } from 'crypto';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m10-media';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const OLD_SHA = 'ec21a24';
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
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did FROM "Lesson" WHERE "moduleId"=${mods[9].id} ORDER BY "order"`;
if (lessons.length !== 18) throw new Error(`Модули 10: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

// ── R1 · R10: калимаҳо ──
const W = (lo, old, word, translation, emoji, example, exampleTrans, pos = 'noun') => ({ lo, old, word, translation, emoji, example, exampleTrans, pos });
const WORDS = [
  W(4, 'Рубашка', 'Блузка', 'Блузка', '👚', 'Блузка белая.', 'Блузка сафед аст.'),
  W(4, 'Брюки', 'Пиджак', 'Пиҷак', '🤵', 'Пиджак серый.', 'Пиҷак хокистарранг аст.'),
  W(4, 'Обувь', 'Туфли', 'Туфлӣ', '👞', 'Туфли чёрные.', 'Туфлӣ сиёҳ аст.'),
  W(4, 'Куртка', 'Майка', 'Майка', '🎽', 'Майка жёлтая.', 'Майка зард аст.'),
  W(4, 'Платье', 'Халат', 'Халат', '🥼', 'Халат белый.', 'Халат сафед аст.'),
  W(4, 'Носки', 'Тапочки', 'Шиппак', '🩴', 'Где мои тапочки?', 'Шиппакҳои ман дар куҷоянд?'),
  W(4, 'Кепка', 'Сандалии', 'Сандал', '👡', 'Сандалии коричневые.', 'Сандал қаҳваранг аст.'),
  W(6, 'Сумка', 'Браслет', 'Дастпона', '📿', 'Браслет золотой.', 'Дастпона тиллоӣ аст.'),
  W(6, 'Рюкзак', 'Чемодан', 'Ҷомадон', '🧳', 'Чемодан большой.', 'Ҷомадон калон аст.'),
  W(6, 'Шляпа', 'Шапка', 'Телпак', '🧢', 'Шапка серая.', 'Телпак хокистарранг аст.'),
  W(7, 'Кошелёк', 'Пуговица', 'Тугма', '🔘', 'Пуговица чёрная.', 'Тугма сиёҳ аст.'),
  W(8, 'Старый', 'Модный', 'Замонавӣ', '😎', 'Это модная куртка.', 'Ин куртаи замонавӣ аст.', 'adjective'),
  // «Тёплый» аллакай дар модули дигар корт аст (муҳофиз ёфт) → «Мягкий».
  W(8, 'Чистый', 'Мягкий', 'Нарм', '🧸', 'Свитер мягкий.', 'Свитер нарм аст.', 'adjective'),
  W(9, 'Грязный', 'Лёгкий', 'Сабук', '🪶', 'Куртка лёгкая.', 'Куртка сабук аст.', 'adjective'),
  W(2, 'Чёрно-синий', 'Голубой', 'Осмонӣ (кабуди равшан)', '🩵', 'Небо голубое.', 'Осмон кабуди равшан аст.', 'adjective'),
];
// Нусхаҳои дарси навиштан — ҳамон калимаи нав, ҳамон мисол.
const COPIES = ['Чёрно-синий', 'Обувь', 'Рюкзак', 'Чистый'].map((old) => ({ ...WORDS.find((w) => w.old === old), lo: 16 }));
const RERECORD = [
  { lo: 5, word: 'Шорты' }, { lo: 7, word: 'Шарф' }, { lo: 6, word: 'Наручные часы' },
  { lo: 8, word: 'Большой' }, { lo: 1, word: 'Фиолетовый' },
];

// ── Матнҳо ──
const q = (question, qt, options, ci, key, ex) => ({ question, qt, options, ci, key, ex });
const PLAN = [
  {
    lo: 12, label: 'Д13 хониш (оила)',
    old: 'Я ношу белую рубашку и синие джинсы. Моя подруга носит красное платье. Её туфли чёрные. Моя мама носит зелёное платье и коричневые туфли. У моего брата жёлтая шляпа и синяя куртка. Нам очень нравится наша новая одежда. Сегодня мы идём в парк.',
    text: 'Это моя семья. Мой брат носит серый костюм и белую рубашку. Моя сестра носит длинное синее платье. Её туфли чёрные. Я ношу джинсы и новые кроссовки. Мне нравится моя новая майка.',
    tr: 'Ин оилаи ман аст. Бародарам костюми хокистарранг ва куртаи сафед мепӯшад. Хоҳарам пироҳани дарози кабуд мепӯшад. Туфлии ӯ сиёҳ аст. Ман ҷинс ва кроссовкаи нав мепӯшам. Майкаи нави ман ба ман писанд аст.',
    count: 4,
    update: [
      { i: 0, old: 'Какого цвета моя рубашка?', ...q('Что носит брат?', 'Бародар чӣ мепӯшад?', ['Серый костюм', 'Синее платье', 'Новые кроссовки'], 0, 'серый костюм', 'Дар матн: «Мой брат носит серый костюм» — костюми хокистарранг.') },
      { i: 1, old: 'Что носит моя подруга?', ...q('Какое платье?', 'Пироҳан чӣ гуна аст?', ['Короткое и красное', 'Длинное и синее', 'Белое'], 1, 'длинное', 'Дар матн: «длинное синее платье» — дароз ва кабуд.') },
      { i: 2, old: 'Какого цвета платье мамы?', ...q('Какие туфли?', 'Туфлӣ чӣ ранг аст?', ['Белые', 'Чёрные', 'Коричневые'], 1, 'чёрные', 'Дар матн: «Её туфли чёрные» — сиёҳ.') },
      { i: 3, old: 'Что есть у брата?', ...q('Что мне нравится?', 'Ба ман чӣ писанд аст?', ['Моя новая майка', 'Мой костюм', 'Её платье'], 0, 'моя новая майка', 'Дар матн: «Мне нравится моя новая майка» — майкаи нав.') },
    ],
  },
  {
    lo: 13, label: 'Д14 шунавоӣ (ҳавои сард)',
    old: 'Сегодня я ношу синюю рубашку и чёрные брюки. Мои туфли белые. Моя сестра носит красное платье. Её шляпа зелёная. Нам очень нравится наша новая одежда. У моего брата жёлтая шляпа и коричневые туфли. Сегодня мы идём в парк с друзьями. Погода тёплая, и небо синее.',
    text: 'Сегодня я ношу тёплый свитер, серые перчатки и красный шарф. Мой друг носит футболку и синие шорты. Моя сестра носит жёлтую куртку и белую шапку. Мы идём в парк.',
    tr: 'Имрӯз ман свитери гарм, дастпӯшаки хокистарранг ва шарфи сурх мепӯшам. Дӯстам футболка ва шорти кабуд мепӯшад. Хоҳарам куртаи зард ва телпаки сафед мепӯшад. Мо ба боғ меравем.',
    count: 4,
    update: [
      { i: 0, old: 'Какого цвета его рубашка?', ...q('Какой шарф?', 'Шарф чӣ ранг аст?', ['Красный', 'Синий', 'Белый'], 0, 'красный', 'Дар матн: «красный шарф» — шарфи сурх.') },
      { i: 1, old: 'Какого цвета его туфли?', ...q('Что носит друг?', 'Дӯст чӣ мепӯшад?', ['Свитер и шарф', 'Футболку и синие шорты', 'Куртку и шапку'], 1, 'футболку и синие шорты', 'Дар матн: «Мой друг носит футболку и синие шорты» — футболка ва шорти кабуд.') },
      { i: 2, old: 'Что носит его сестра?', ...q('Какая куртка у сестры?', 'Куртаи хоҳар чӣ ранг аст?', ['Жёлтая', 'Белая', 'Серая'], 0, null, 'Дар матн: «Моя сестра носит жёлтую куртку» — зард.') },
      { i: 3, old: 'Какого цвета её шляпа?', ...q('Мы идём…', 'Мо меравем…', ['в парк', 'в школу', 'в магазин'], 0, 'в парк', 'Дар матн: «Мы идём в парк» — ба боғ.') },
    ],
  },
  {
    lo: 15, label: 'Д16 такрор',
    old: 'Давайте повторим одежду! Мужчина носит чёрный костюм и белую рубашку. Женщина носит красивое жёлтое платье и серебряные серьги.',
    text: 'Мой брат носит чёрный костюм и белую рубашку. Моя сестра носит красивое жёлтое платье и золотые серьги. Мои туфли старые, но удобные.',
    tr: 'Бародарам костюми сиёҳ ва куртаи сафед мепӯшад. Хоҳарам пироҳани зебои зард ва гӯшвори тиллоӣ мепӯшад. Туфлии ман кӯҳна, вале бароҳат аст.',
    count: 2,
    update: [
      { i: 0, old: 'Что носит мужчина?', ...q('Что носит брат?', 'Бародар чӣ мепӯшад?', ['Чёрный костюм', 'Жёлтое платье', 'Золотые серьги'], 0, 'чёрный костюм', 'Дар матн: «Мой брат носит чёрный костюм» — костюми сиёҳ.') },
      { i: 1, old: 'Какого цвета платье?', ...q('Какое платье?', 'Пироҳан чӣ ранг аст?', ['Белое', 'Жёлтое', 'Чёрное'], 1, 'жёлтое', 'Дар матн: «красивое жёлтое платье» — зард.') },
    ],
    insert: [
      { order: 2, ...q('Какие серьги?', 'Гӯшвор чӣ гуна аст?', ['Золотые', 'Серебряные', 'Большие'], 0, 'золотые', 'Дар матн: «золотые серьги» — тиллоӣ.') },
      { order: 3, ...q('Какие туфли?', 'Туфлӣ чӣ гуна аст?', ['Новые', 'Старые, но удобные', 'Красивые'], 1, 'старые, но удобные', 'Дар матн: «Мои туфли старые, но удобные» — кӯҳна, вале бароҳат.') },
    ],
  },
  {
    lo: 17, label: 'Д18 имтиҳон (Сара ва Алӣ)',
    old: 'Посмотрите на моих друзей. Сара носит красное платье и белые туфли. Она держит маленькую сумку. Омар носит синие джинсы и чёрную куртку. Сегодня он не носит шляпу. Погода холодная, поэтому они идут быстро. Туфли Омара старые, но удобные.',
    text: 'Это Сара и Али. Сара носит красное платье и белые туфли. Её сумка маленькая. Али носит синие джинсы и чёрную куртку. Сегодня он не носит шапку. Его туфли старые, но удобные.',
    tr: 'Ин Сара ва Алӣ. Сара пироҳани сурх ва туфлии сафед мепӯшад. Халтаи ӯ хурд аст. Алӣ ҷинси кабуд ва куртаи сиёҳ мепӯшад. Имрӯз ӯ телпак намепӯшад. Туфлии ӯ кӯҳна, вале бароҳат аст.',
    count: 8,
    update: [
      { i: 0, old: 'Что носит Сара?', ...q('Что носит Сара?', 'Сара чӣ мепӯшад?', ['Красное платье', 'Синюю куртку', 'Чёрные джинсы'], 0, 'красное платье', 'Дар матн: «Сара носит красное платье» — пироҳани сурх.') },
      { i: 1, old: 'Что Омар НЕ носит?', ...q('Что Али сегодня не носит?', 'Алӣ имрӯз чиро намепӯшад?', ['Куртку', 'Шапку', 'Джинсы'], 1, 'шапку', 'Дар матн: «Сегодня он не носит шапку» — телпак.') },
      { i: 2, old: 'Какие туфли у Омара?', ...q('Какие туфли у Али?', 'Туфлии Алӣ чӣ гунаанд?', ['Красивые', 'Новые', 'Старые, но удобные'], 2, 'старые, но удобные', 'Дар матн: «Его туфли старые, но удобные» — кӯҳна, вале бароҳат.') },
      { i: 3, old: "Переведите 'Ман куртаи кабуд пӯшидаам':", ...q('Переведите «Ман куртаи кабуд мепӯшам»:', '«Ман куртаи кабуд мепӯшам»-ро тарҷума кунед:', ['Я ношу синюю рубашку.', 'Он носит синюю рубашку.', 'У меня есть синяя рубашка.'], 0, null, 'Курта = рубашка, кабуд = синий, «мепӯшам» = ношу. Пас: «Я ношу синюю рубашку».') },
      { i: 4, old: 'Выберите правильное: Она ___ красное платье.', ...q('Она ___ красное платье.', 'Ӯ пироҳани сурх мепӯшад.', ['ношу', 'носит', 'носим'], 1, null, 'Бо «она» → носит. (я ношу, мы носим.)') },
      { i: 5, old: "Переведите 'Куртаи нав':", ...q('Переведите «Куртаи нав»:', '«Куртаи нав»-ро тарҷума кунед:', ['Старая рубашка', 'Большая рубашка', 'Новая рубашка'], 2, null, 'Курта = рубашка (на куртка!), нав = новый. Пас: «Новая рубашка».') },
      { i: 6, old: "Как будет 'Чатр' по-русски?", ...q('Переведите «Чатр»:', '«Чатр»-ро тарҷума кунед:', ['Зонт', 'Шарф', 'Пуговица'], 0, null, 'Чатр бо русӣ — зонт. (Шарф — шарф, тугма — пуговица.)') },
      { i: 7, old: "Переведите 'Сиёҳ':", ...q('Переведите «Сиёҳ»:', '«Сиёҳ»-ро тарҷума кунед:', ['Белый', 'Синий', 'Чёрный'], 2, null, 'Сиёҳ бо русӣ — чёрный. (Сафед — белый, кабуд — синий.)') },
    ],
  },
];

const DIALOG = {
  lo: 14, label: 'Д15 муколама',
  oldTexts: ['Здравствуйте.', 'Здравствуйте.', 'Мне нравится эта рубашка.', 'Какой цвет?', 'Синий.', 'Пожалуйста.', 'Спасибо.'],
  lines: [
    { speaker: 'Покупатель', isUser: true, text: 'Здравствуйте.', tr: 'Салом.' },
    { speaker: 'Продавец', isUser: false, text: 'Здравствуйте.', tr: 'Салом.' },
    { speaker: 'Покупатель', isUser: true, text: 'Мне нравится эта рубашка.', tr: 'Ин курта ба ман писанд аст.' },
    { speaker: 'Продавец', isUser: false, text: 'Какой цвет?', tr: 'Чӣ ранг?' },
    { speaker: 'Покупатель', isUser: true, text: 'Синий. Можно примерить?', tr: 'Кабуд. Мумкин пӯшида бинам?' },
    { speaker: 'Продавец', isUser: false, text: 'Да, пожалуйста.', tr: 'Бале, марҳамат.' },
    { speaker: 'Покупатель', isUser: true, text: 'Рубашка тесная. Есть большой размер?', tr: 'Курта танг аст. Андозаи калон ҳаст?' },
    { speaker: 'Продавец', isUser: false, text: 'Да, вот большой.', tr: 'Бале, инак калонаш.' },
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
    if (/'/.test(x.question) || /Выберите|Как будет|Дополните|Какого цвета/.test(x.question)) throw new Error(`${p.label} «${x.question}»: дастури манъшуда`);
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
if (new Set(PLAN.map((p) => p.text)).size !== PLAN.length) throw new Error('матнҳо бояд гуногун бошанд (R4)');

// Калимаи нав набояд дар ягон модули дигари русӣ A1 ҳамчун корт бошад (R1 такрор нашавад).
const priorWords = new Set((await sql`SELECT lower(w.word) k FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} AND m.id <> ${mods[9].id}`).map((r) => r.k));
const conflicts = [...new Set([...WORDS, ...COPIES].map((w) => w.word).filter((x) => priorWords.has(lc(x))))];
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
for (const lo of [...new Set([...WORDS, ...COPIES].map((w) => w.lo))]) {
  const rows = await sql`SELECT word,translation,emoji FROM "Word" WHERE "lessonId"=${L[lo].id}`;
  const rep = (r) => [...WORDS, ...COPIES].find((w) => w.lo === lo && w.old === r.word);
  const tr = rows.map((r) => rep(r)?.translation ?? r.translation);
  const wd = rows.map((r) => lc(rep(r)?.word ?? r.word));
  if (new Set(tr).size !== tr.length) throw new Error(`Д${lo + 1}: коллизияи тарҷума ${JSON.stringify(tr)}`);
  if (new Set(wd).size !== wd.length) throw new Error(`Д${lo + 1}: калимаи такрорӣ ${JSON.stringify(wd)}`);
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
let dlg = null;
if (lines.length === 8 && lines.every((l, i) => l.text === DIALOG.lines[i].text)) console.log(`${DIALOG.label}: аллакай нав`);
else {
  if (lines.length !== 7 || !lines.every((l, i) => l.text === DIALOG.oldTexts[i] && l.order === i)) throw new Error(`${DIALOG.label}: ${JSON.stringify(lines.map((l) => l.text))}`);
  dlg = DIALOG.lines.map((l, i) => ({ ...l, order: i, id: lines[i]?.id ?? cuidLike(), isNew: !lines[i] }));
  console.log(`\n${DIALOG.label}: 7 → 8 сатр, ҳама бо як овоз`);
  for (const l of dlg) if (l.isNew || l.text !== DIALOG.oldTexts[l.order]) console.log(`  ${l.isNew ? '+' : '~'} ${l.speaker}: ${l.text} = ${l.tr}`);
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
  ...rerec.map((w) => ({ id: w.id, text: w.word })),
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
    'Russian A1 Module 10: replace repeated words, distinct passages, 8-line dialogue']);
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
  const tx = [];
  for (const l of dlg) {
    if (l.isNew) tx.push(sql`INSERT INTO "DialogueLine" (id,"dialogueId",speaker,text,translation,"audioUrl","isUser","order")
        VALUES (${l.id},${did},${l.speaker},${l.text},${l.tr},${urlOf[l.id]},${l.isUser},${l.order})`);
    else tx.push(sql`UPDATE "DialogueLine" SET text=${l.text}, translation=${l.tr}, "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${DIALOG.oldTexts[l.order]}`);
  }
  await sql.transaction(tx);
  const after = await sql`SELECT id,text,"audioUrl" au,"order" FROM "DialogueLine" WHERE "dialogueId"=${did} ORDER BY "order"`;
  if (!(after.length === 8 && after.every((l, i) => l.text === DIALOG.lines[i].text && l.au === urlOf[l.id]))) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — 8 сатр, аудиои нав`);
}
