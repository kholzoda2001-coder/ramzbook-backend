// МОДУЛИ 6-и РУСӢ (A1) — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R15  Д14: сатри «Да.» ХОМӮШ аст (қулла 0.002, нутқ 0.00 с) → ҳамаи сатрҳо аз нав сабт мешаванд.
//   R6   Д14: 5 → 8 сатр; «Я бы хотел» (шакли шартӣ, наомӯхта) → «Я хочу … , пожалуйста».
//   R3/R5 Д13 (шунавоӣ): «очень», «фрукты», «после», «любимая», «мясом» наомӯхтаанд; 4 тавзеҳи русӣ.
//   R7   Д15 (такрор): «Давайте повторим», 2 савол, нӯшокӣ ва грамматика такрор намешаванд.
//   R2   Д17 (имтиҳон): падежи творительнӣ («с картофелем, морковью и луком»), «кухне», «каждое» — ҳеҷ гоҳ таълим нашудаанд.
//   R9   Д10/Д11: мисолҳои «покупает», «Нам нужно» (наомӯхта) ва тарҷумаҳои F5/F6 → ҳар ду мавзӯъ пурра аз нав сабт.
// Матн, тарҷума, аудио ва саволҳо/машқҳо дар ЯК транзаксия. Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m6-media.mjs           # dry-run
//   node prisma/_ru-m6-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m6-media';
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
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did,"grammarTopicId" gid FROM "Lesson" WHERE "moduleId"=${mods[5].id} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 6: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

const PLAN = [
  {
    lo: 12, label: 'Д13 шунавоӣ',
    old: 'Я очень люблю фрукты. На завтрак я ем хлеб и яйца. Я пью чай, но не люблю кофе. Моя любимая еда — рис с мясом. После обеда я всегда пью воду.',
    text: 'Меня зовут Нигина. На завтрак я ем хлеб и яйцо. Я пью чай, но не люблю кофе. На обед я ем рис и курицу. Вечером я пью воду.',
    tr: 'Номи ман Нигина аст. Барои наҳорӣ ман нон ва тухм мехӯрам. Ман чой менӯшам, вале қаҳваро дӯст намедорам. Барои хӯроки нисфирӯзӣ ман биринҷ ва гӯшти мурғ мехӯрам. Бегоҳӣ ман об менӯшам.',
    update: [
      { i: 0, old: 'Что она ест на завтрак?', question: 'Что Нигина ест на завтрак?', qt: 'Нигина барои наҳорӣ чӣ мехӯрад?',
        options: ['Рис и курицу', 'Хлеб и яйцо', 'Суп'], ci: 1, key: 'хлеб и яйцо', ex: 'Дар матн: «На завтрак я ем хлеб и яйцо» — нон ва тухм.' },
      { i: 1, old: 'Что она НЕ любит?', question: 'Что Нигина НЕ любит?', qt: 'Нигина чиро дӯст намедорад?',
        options: ['Чай', 'Воду', 'Кофе'], ci: 2, key: 'кофе', ex: 'Дар матн: «Я пью чай, но не люблю кофе» — қаҳваро дӯст намедорад.' },
      { i: 2, old: 'Какая её любимая еда?', question: 'Что Нигина ест на обед?', qt: 'Нигина барои хӯроки нисфирӯзӣ чӣ мехӯрад?',
        options: ['Рис и курицу', 'Хлеб', 'Яйцо'], ci: 0, key: 'рис и курицу', ex: 'Дар матн: «На обед я ем рис и курицу» — биринҷ ва гӯшти мурғ.' },
      { i: 3, old: 'Что она пьёт после обеда?', question: 'Что Нигина пьёт вечером?', qt: 'Нигина бегоҳӣ чӣ менӯшад?',
        options: ['Чай', 'Воду', 'Кофе'], ci: 1, key: 'воду', ex: 'Дар матн: «Вечером я пью воду» — об менӯшад.' },
    ],
    count: 4,
  },
  {
    lo: 14, label: 'Д15 такрор',
    old: 'Давайте повторим Еду и напитки! Утром я ем завтрак. Я люблю фрукты и молоко. На обед я ем курицу и рис.',
    text: 'Утром я ем завтрак. Я люблю яблоки и молоко. На обед я ем курицу и рис. У меня есть немного сока. Вечером я пью воду.',
    tr: 'Субҳ ман наҳорӣ мехӯрам. Ман себ ва ширро дӯст медорам. Барои хӯроки нисфирӯзӣ ман гӯшти мурғ ва биринҷ мехӯрам. Ман каме афшура дорам. Бегоҳӣ ман об менӯшам.',
    update: [
      { i: 0, old: 'Что я ем утром?', question: 'Что я ем утром?', qt: 'Ман субҳ чӣ мехӯрам?',
        options: ['Завтрак', 'Ужин', 'Перекус'], ci: 0, key: 'завтрак', ex: 'Дар матн: «Утром я ем завтрак» — субҳ наҳорӣ.' },
      { i: 1, old: 'Что я ем на обед?', question: 'Что я ем на обед?', qt: 'Ман барои хӯроки нисфирӯзӣ чӣ мехӯрам?',
        options: ['Воду и хлеб', 'Курицу и рис', 'Суп'], ci: 1, key: 'курицу и рис', ex: 'Дар матн: «На обед я ем курицу и рис» — гӯшти мурғ ва биринҷ.' },
    ],
    insert: [
      { order: 2, question: 'Что я пью вечером?', qt: 'Ман бегоҳӣ чӣ менӯшам?',
        options: ['Чай', 'Воду', 'Кофе'], ci: 1, key: 'воду', ex: 'Дар матн: «Вечером я пью воду» — об.' },
      { order: 3, question: 'Дополните: У меня есть ___ сока.', qt: 'Холигиро пур кунед: «Ман каме афшура дорам».',
        options: ['несколько', 'немного', 'нет'], ci: 1, key: 'немного', ex: 'Сок шумурда намешавад → немного сока (дар матн ҳам ҳамин тавр аст).' },
    ],
    count: 2,
  },
  {
    lo: 16, label: 'Д17 имтиҳон',
    old: 'На кухне у нас есть немного хлеба и немного сыра. У нас нет мяса сегодня. Моя сестра любит фрукты. Она ест яблоко и банан каждое утро. Я пью чай с молоком на завтрак. Мой отец пьёт кофе. Вечером мы готовим суп с картофелем, морковью и луком.',
    text: 'У нас есть немного хлеба и немного сыра. Мяса нет. Моя сестра любит яблоки. Утром она ест яблоко и банан. Я пью чай. Мой отец пьёт кофе. Вечером мы готовим суп и рис.',
    tr: 'Мо каме нон ва каме панир дорем. Гӯшт нест. Хоҳарам себро дӯст медорад. Субҳ ӯ себ ва банан мехӯрад. Ман чой менӯшам. Падарам қаҳва менӯшад. Бегоҳӣ мо шӯрбо ва биринҷ мепазем.',
    title: ['Что у нас есть', 'Мо чӣ дорем'],
    update: [
      { i: 0, old: 'Что у них НЕТ сегодня?', question: 'Чего у них нет?', qt: 'Онҳо чӣ надоранд?',
        options: ['Мяса', 'Хлеба', 'Сыра'], ci: 0, key: 'мяса', ex: 'Дар матн: «Мяса нет» — гӯшт надоранд. (Баъди «нет» охири исм иваз мешавад: мясо → мяса.)' },
      { i: 1, old: 'Что сестра ест каждое утро?', question: 'Что сестра ест утром?', qt: 'Хоҳар субҳ чӣ мехӯрад?',
        options: ['Хлеб и сыр', 'Яблоко и банан', 'Суп'], ci: 1, key: 'яблоко и банан', ex: 'Дар матн: «Утром она ест яблоко и банан» — себ ва банан.' },
      { i: 2, old: 'Что в супе?', question: 'Что они готовят вечером?', qt: 'Онҳо бегоҳӣ чӣ мепазанд?',
        options: ['Яйца и сыр', 'Суп и рис', 'Рыбу'], ci: 1, key: 'суп и рис', ex: 'Дар матн: «Вечером мы готовим суп и рис» — шӯрбо ва биринҷ.' },
    ],
    count: 8,
  },
];

const DIALOG = {
  lo: 13, label: 'Д14 муколама',
  oldTexts: ['Здравствуйте.', 'Здравствуйте.', 'Можно мне немного воды, пожалуйста?', 'Да.', 'Я бы хотел рис и курицу.'],
  // матни нав барои сатрҳои мавҷуда (индекс → матн/тарҷума); «Да.» аудиои ХОМӮШ дошт
  rewrite: {
    3: { text: 'Да, пожалуйста.', tr: 'Бале, марҳамат.' },
    4: { text: 'Я хочу рис и курицу, пожалуйста.', tr: 'Ман биринҷ ва гӯшти мурғ мехоҳам, лутфан.' },
  },
  add: [
    { order: 5, speaker: 'Официант', isUser: false, text: 'Хорошо. Что вы хотите пить?', tr: 'Хуб. Шумо чӣ нӯшидан мехоҳед?' },
    { order: 6, speaker: 'Посетитель', isUser: true, text: 'Я хочу чай, пожалуйста.', tr: 'Ман чой мехоҳам, лутфан.' },
    { order: 7, speaker: 'Официант', isUser: false, text: 'Хорошо, спасибо.', tr: 'Хуб, раҳмат.' },
  ],
};

// Мисолҳои грамматика: [матни кӯҳна, матни нав?, тарҷумаи нав?, highlight?] — ҳамаашон аз нав сабт мешаванд.
const GRAM = [
  { lo: 9, label: 'Д10 немного/несколько', examples: [
      ['У меня есть немного хлеба.'],
      ['У тебя есть вода?', null, 'Ту об дорӣ?', 'есть'],
      ['Молока нет.', null, 'Шир нест.', 'нет'],
      ['Она покупает несколько яблок.', 'У неё есть несколько яблок.', 'Ӯ якчанд себ дорад.', 'несколько'],
      ['Нам нужно немного риса.', 'У нас есть немного риса.', 'Мо каме биринҷ дорем.', 'немного'],
    ], exercises: [] },
  { lo: 10, label: 'Д11 винительный', examples: [
      ['Я пью воду.'], ['Я ем хлеб.'],
      ['Она покупает рыбу.', 'Она ест рыбу.', 'Ӯ моҳӣ мехӯрад.', 'рыбу'],
      ['Мы пьём молоко.'], ['Что ты ешь?'],
    ], exercises: [] },
];

const items = [];
for (const p of PLAN) {
  const [c] = await sql`SELECT id,passage FROM "ComprehensionExercise" WHERE id=${L[p.lo].cid}`;
  const qs = await sql`SELECT id,question,options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order", id`;
  if (c.passage === p.text) { console.log(`${p.label}: аллакай нав`); continue; }
  if (c.passage !== p.old) throw new Error(`${p.label}: матни ғайричашмдошт «${c.passage}»`);
  if (qs.length !== p.count) throw new Error(`${p.label}: ${qs.length} савол (интизор ${p.count})`);
  for (const u of p.update) if (qs[u.i].question !== u.old) throw new Error(`${p.label} Q${u.i + 1}: «${qs[u.i].question}» ≠ «${u.old}»`);
  for (const q of [...p.update, ...(p.insert ?? [])]) {
    if (!lc(q.options[q.ci]).includes(q.key) || !lc(p.text).includes(q.key)) throw new Error(`${p.label} «${q.question}»: калиди «${q.key}» дар ҷавоб/матн нест`);
    if (q.options.some((o, j) => j !== q.ci && lc(o).includes(q.key))) throw new Error(`${p.label} «${q.question}»: калид дар варианти нодуруст`);
    if (new Set(q.options).size !== q.options.length) throw new Error(`${p.label}: варианти такрорӣ`);
  }
  items.push({ ...p, id: c.id, qs });
  console.log(`\n${p.label}\n  буд: ${p.old}\n  шуд: ${p.text}\n  тҷ : ${p.tr}`);
  for (const u of p.update) console.log(`  Q${u.i + 1}: ${u.question} → «${u.options[u.ci]}»`);
  for (const n of p.insert ?? []) console.log(`  + Q${n.order + 1} (нав): ${n.question} → «${n.options[n.ci]}»`);
}

const lines = await sql`SELECT id,speaker,text,translation,"isUser" iu,"order" FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
const newTexts = [...DIALOG.oldTexts.map((t, i) => DIALOG.rewrite[i]?.text ?? t), ...DIALOG.add.map((a) => a.text)];
let dlg = null;
if (lines.length === newTexts.length && lines.every((l, i) => l.text === newTexts[i])) console.log(`${DIALOG.label}: аллакай нав`);
else {
  if (lines.length !== 5 || !lines.every((l, i) => l.text === DIALOG.oldTexts[i] && l.order === i)) throw new Error(`${DIALOG.label}: ${JSON.stringify(lines.map((l) => l.text))}`);
  dlg = { lines, add: DIALOG.add.map((a) => ({ ...a, id: cuidLike() })) };
  console.log(`\n${DIALOG.label}: 5 → 8 сатр, ҳама бо як овоз аз нав сабт мешаванд (сатри «Да.» ХОМӮШ буд)`);
  for (const [i, r] of Object.entries(DIALOG.rewrite)) console.log(`  ~ сатри ${Number(i) + 1}: «${DIALOG.oldTexts[i]}» → «${r.text}»`);
  for (const a of dlg.add) console.log(`  + ${a.speaker}: ${a.text} = ${a.tr}`);
}

const grams = [];
for (const g of GRAM) {
  const ex = await sql`SELECT id,sentence,translation,highlight,"order" FROM "GrammarExample" WHERE "topicId"=${L[g.lo].gid} ORDER BY "order", id`;
  const want = g.examples.map((e) => e[1] ?? e[0]);
  if (ex.length === 5 && ex.every((e, i) => e.sentence === want[i]) && ex.every((e) => e.audioUrl !== null)) {
    const tgOk = g.examples.every((e, i) => !e[2] || ex[i].translation === e[2]);
    if (tgOk) { console.log(`${g.label}: аллакай нав`); continue; }
  }
  if (ex.length !== 5 || !ex.every((e, i) => [e.sentence].includes(g.examples[i][0]) || e.sentence === want[i])) throw new Error(`${g.label}: ${JSON.stringify(ex.map((e) => e.sentence))}`);
  grams.push({ ...g, rows: ex });
  console.log(`\n${g.label}: 5 мисол аз нав сабт мешаванд`);
  for (const [i, e] of g.examples.entries()) if (e[1] || e[2]) console.log(`  мисол ${i + 1}: ${e[0]}${e[1] ? ` → ${e[1]}` : ''}${e[2] ? ` = ${e[2]}` : ''}`);
}

if (!APPLY || (!items.length && !dlg && !grams.length)) { console.log(items.length || dlg || grams.length ? '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.' : '\nҲама чиз аллакай нав.'); process.exit(0); }

mkdirSync(WORK, { recursive: true });
const files = [];
if (items.length) {
  writeFileSync(`${WORK}/p.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text }))));
  console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
  files.push(...items.map((i) => ({ id: i.id, text: i.text, label: i.label, passage: true })));
}
const short = [];
if (dlg) {
  short.push(...dlg.lines.map((l, i) => ({ id: l.id, text: DIALOG.rewrite[i]?.text ?? l.text })), ...dlg.add.map((a) => ({ id: a.id, text: a.text })));
}
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
    // сатри кӯтоҳ («Здравствуйте.») табиатан «ҳарф/сония»-и баланд дорад — ҳадди боло фарохтар аст
    : m.peak >= 0.2 && m.lead <= 0.5 && m.speech >= 0.35 && art >= 8 && art <= (f.text.length <= 16 ? 40 : 30);
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
    'Russian A1 Module 6: re-record passages, dialogue (silent line) and grammar examples']);
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
  if (it.title) tx.push(sql`UPDATE "ComprehensionExercise" SET title=${it.title[0]}, "titleTranslated"=${it.title[1]} WHERE id=${it.id}`);
  for (const u of it.update) tx.push(sql`UPDATE "ComprehensionQuestion" SET question=${u.question}, "questionTranslated"=${u.qt},
      options=${JSON.stringify(u.options)}::jsonb, "correctIndex"=${u.ci}, explanation=${u.ex} WHERE id=${it.qs[u.i].id}`);
  for (const n of it.insert ?? []) tx.push(sql`INSERT INTO "ComprehensionQuestion" (id,"exerciseId",question,"questionTranslated",options,"correctIndex",explanation,"order")
      VALUES (${cuidLike()},${it.id},${n.question},${n.qt},${JSON.stringify(n.options)}::jsonb,${n.ci},${n.ex},${n.order})`);
  await sql.transaction(tx);
  const [a] = await sql`SELECT passage,"passageTranslated" pt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${it.id}`;
  const aq = await sql`SELECT question,options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${it.id} ORDER BY "order", id`;
  const ok = a.passage === it.text && a.pt === it.tr && a.au === urlOf[it.id]
    && it.update.every((u) => aq[u.i].question === u.question && aq[u.i].ci === u.ci)
    && aq.length === it.count + (it.insert?.length ?? 0);
  if (!ok) throw new Error(`ТАСДИҚ НАШУД: ${it.label}`);
  console.log(`✅ ${it.label} — матн, аудио ва ${aq.length} савол сабт ва тасдиқ шуданд`);
}
if (dlg) {
  const did = L[DIALOG.lo].did;
  const tx = dlg.lines.map((l, i) => {
    const rw = DIALOG.rewrite[i];
    return rw
      ? sql`UPDATE "DialogueLine" SET text=${rw.text}, translation=${rw.tr}, "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${l.text}`
      : sql`UPDATE "DialogueLine" SET "audioUrl"=${urlOf[l.id]} WHERE id=${l.id} AND text=${l.text}`;
  });
  for (const a of dlg.add) tx.push(sql`INSERT INTO "DialogueLine" (id,"dialogueId",speaker,text,translation,"audioUrl","isUser","order")
      VALUES (${a.id},${did},${a.speaker},${a.text},${a.tr},${urlOf[a.id]},${a.isUser},${a.order})`);
  await sql.transaction(tx);
  const after = await sql`SELECT id,text,"audioUrl" au,"order" FROM "DialogueLine" WHERE "dialogueId"=${did} ORDER BY "order"`;
  if (!(after.length === 8 && after.every((l, i) => l.text === newTexts[i] && l.order === i && l.au === urlOf[l.id]))) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — 8 сатр, ҳама бо аудиои нав (сатри хомӯш бартараф шуд)`);
}
for (const g of grams) {
  const tx = g.rows.map((r, i) => {
    const e = g.examples[i];
    return e[1] || e[2]
      ? sql`UPDATE "GrammarExample" SET sentence=${e[1] ?? e[0]}, translation=${e[2] ?? r.translation}, highlight=${e[3] ?? r.highlight}, "audioUrl"=${urlOf[r.id]} WHERE id=${r.id}`
      : sql`UPDATE "GrammarExample" SET "audioUrl"=${urlOf[r.id]} WHERE id=${r.id}`;
  });
  await sql.transaction(tx);
  const ex = await sql`SELECT id,sentence,translation,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=${L[g.lo].gid} ORDER BY "order", id`;
  const ok = ex.every((r, i) => r.sentence === (g.examples[i][1] ?? g.examples[i][0]) && r.au === urlOf[r.id] && (!g.examples[i][2] || r.translation === g.examples[i][2]));
  if (!ok) throw new Error(`ТАСДИҚ НАШУД: ${g.label}`);
  console.log(`✅ ${g.label} — 5 мисол бо аудиои нав`);
}
