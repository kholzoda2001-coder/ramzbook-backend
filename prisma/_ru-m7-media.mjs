// МОДУЛИ 7-и РУСӢ (A1) — Фазаи 2: ҳама чизе ки ба АУДИО баста аст.
//
//   R2   Д2: «Дом / Родина» такрори «Дом»-и Д1 буд → «Стена» (девор). Ҳамон сатри `Word` нав мешавад,
//        пас 4 корти SRS-и хонандагон (itemId = Word.id) кор мекунанд ва матни навро мегиранд.
//        «Стена» дар Д5 аллакай истифода мешавад («Часы на стене») — акнун омӯзонида мешавад.
//   R3   Д13 (шунавоӣ): «в нём», «там», «комнат», варианти «На полу» (калимаи «пол» наомӯхта); 4 тавзеҳи русӣ.
//   R5   Д15 (такрор): 15 калима, 2 савол, «Давайте повторим»; «есть/нет» такрор намешавад.
//   R4   Д17 (имтиҳон): «стоит» (наомӯхта), «Сколько стульев» (ҷамъи родительный).
//   R6   Д14 (муколама): 4 → 8 сатр, ҳама бо ЯК овоз.
//   R10  Тарҷумаҳои тоҷикӣ: «хобгоҳ» → «ҳуҷраи хоб», «Сумкаи ман» → «Халтаи ман», «Хона ва Ашёҳо» → хурд.
// Матн, тарҷума, аудио ва саволҳо дар ЯК транзаксия. Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m7-media.mjs           # dry-run
//   node prisma/_ru-m7-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m7-media';
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
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did FROM "Lesson" WHERE "moduleId"=${mods[6].id} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 7: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

const WORD = {
  lo: 1, label: 'Д2 калима «Дом / Родина» → «Стена»',
  old: 'Дом / Родина', word: 'Стена', translation: 'Девор', emoji: '🧱',
  example: 'Это стена.', exampleTrans: 'Ин девор аст.', ipa: '/sʲtʲɪˈna/',
};

const PLAN = [
  {
    lo: 12, label: 'Д13 шунавоӣ',
    old: 'Это мой дом. В нём три комнаты. На кухне есть большой стол. Моя кровать в спальне. В гостиной есть телевизор. Мои книги на столе.',
    text: 'Это мой дом. В доме три комнаты. На кухне есть большой стол. Моя кровать в спальне. В гостиной есть телевизор. Мои книги на столе.',
    tr: 'Ин хонаи ман аст. Дар хона се ҳуҷра ҳаст. Дар ошхона мизи калон ҳаст. Кати ман дар ҳуҷраи хоб аст. Дар меҳмонхона телевизор ҳаст. Китобҳои ман дар болои миз ҳастанд.',
    update: [
      { i: 0, old: 'Сколько там комнат?', question: 'Что есть в гостиной?', qt: 'Дар меҳмонхона чӣ ҳаст?',
        options: ['Кровать', 'Телевизор', 'Стол'], ci: 1, key: 'телевизор', ex: 'Дар матн: «В гостиной есть телевизор» — телевизор ҳаст.' },
      { i: 1, old: 'Где большой стол?', question: 'Где большой стол?', qt: 'Мизи калон дар куҷост?',
        options: ['На кухне', 'В спальне', 'В гостиной'], ci: 0, key: 'на кухне', ex: 'Дар матн: «На кухне есть большой стол» — дар ошхона.' },
      { i: 2, old: 'Где кровать?', question: 'Где кровать?', qt: 'Кат дар куҷост?',
        options: ['В гостиной', 'В спальне', 'В коридоре'], ci: 1, key: 'в спальне', ex: 'Дар матн: «Моя кровать в спальне» — дар ҳуҷраи хоб.' },
      { i: 3, old: 'Где книги?', question: 'Где книги?', qt: 'Китобҳо дар куҷоянд?',
        options: ['На столе', 'Под столом', 'В сумке'], ci: 0, key: 'на столе', ex: 'Дар матн: «Мои книги на столе» — дар болои миз.' },
    ],
    count: 4,
  },
  {
    lo: 14, label: 'Д15 такрор',
    old: 'Давайте повторим Дом и предметы! Книга на столе. Сумка под стулом. В гостиной есть телевизор.',
    text: 'Книга на столе. Сумка под стулом. Лампа рядом с кроватью. В гостиной есть телевизор. В спальне нет телевизора.',
    tr: 'Китоб дар болои миз аст. Халта дар зери курсӣ аст. Чароғ дар паҳлӯи кат аст. Дар меҳмонхона телевизор ҳаст. Дар ҳуҷраи хоб телевизор нест.',
    update: [
      { i: 0, old: 'Где книга?', question: 'Где книга?', qt: 'Китоб дар куҷост?',
        options: ['Под стулом', 'В сумке', 'На столе'], ci: 2, key: 'на столе', ex: 'Дар матн: «Книга на столе» — дар болои миз.' },
      { i: 1, old: 'Где сумка?', question: 'Где сумка?', qt: 'Халта дар куҷост?',
        options: ['На столе', 'Под стулом', 'Рядом с дверью'], ci: 1, key: 'под стулом', ex: 'Дар матн: «Сумка под стулом» — дар зери курсӣ.' },
    ],
    insert: [
      { order: 2, question: 'Где лампа?', qt: 'Чароғ дар куҷост?',
        options: ['На столе', 'Рядом с кроватью', 'В шкафу'], ci: 1, key: 'рядом с кроватью', ex: 'Дар матн: «Лампа рядом с кроватью» — дар паҳлӯи кат.' },
      { order: 3, question: 'Где нет телевизора?', qt: 'Дар куҷо телевизор нест?',
        options: ['В гостиной', 'В спальне', 'В коридоре'], ci: 1, key: 'в спальне', ex: 'Дар матн: «В спальне нет телевизора» — инкор: нет + родительный.' },
    ],
    count: 2,
  },
  {
    lo: 16, label: 'Д17 имтиҳон',
    old: 'Это моя комната. Кровать стоит рядом с окном. Рядом с кроватью есть маленький стол. На столе есть лампа и книга. Моя сумка под письменным столом. В комнате два стула. Комната чистая. Моя кошка спит на диване в гостиной.',
    text: 'Это моя комната. Кровать рядом с окном. Рядом с кроватью есть маленький стол. На столе есть лампа и книга. Моя сумка под письменным столом. В комнате есть два стула. Комната чистая. Моя кошка спит на диване.',
    tr: 'Ин ҳуҷраи ман аст. Кат дар паҳлӯи тиреза аст. Дар паҳлӯи кат мизи хурд ҳаст. Дар болои миз чароғ ва китоб ҳаст. Халтаи ман дар зери мизи корӣ аст. Дар ҳуҷра ду курсӣ ҳаст. Ҳуҷра тоза аст. Гурбаи ман дар болои диван хоб аст.',
    update: [
      { i: 0, old: 'Где кровать?', question: 'Где кровать?', qt: 'Кат дар куҷост?',
        options: ['Рядом с окном', 'За дверью', 'Под столом'], ci: 0, key: 'рядом с окном', ex: 'Дар матн: «Кровать рядом с окном» — дар паҳлӯи тиреза.' },
      { i: 1, old: 'Что на столе?', question: 'Что на столе?', qt: 'Дар болои миз чӣ ҳаст?',
        options: ['Компьютер', 'Лампа и книга', 'Телефон'], ci: 1, key: 'лампа и книга', ex: 'Дар матн: «На столе есть лампа и книга» — чароғ ва китоб.' },
      { i: 2, old: 'Сколько стульев в комнате?', question: 'Где сумка?', qt: 'Халта дар куҷост?',
        options: ['Под письменным столом', 'На столе', 'В шкафу'], ci: 0, key: 'под письменным столом', ex: 'Дар матн: «Моя сумка под письменным столом» — дар зери мизи корӣ.' },
    ],
    count: 8,
  },
];

const DIALOG = {
  lo: 13, label: 'Д14 муколама',
  oldTexts: ['Где книга?', 'Она на столе.', 'В гостиной есть телевизор?', 'Да, есть.'],
  add: [
    { order: 4, speaker: 'Собеседник', isUser: false, text: 'Где сумка?', tr: 'Халта дар куҷост?' },
    { order: 5, speaker: 'Ты', isUser: true, text: 'Сумка под столом.', tr: 'Халта дар зери миз аст.' },
    { order: 6, speaker: 'Собеседник', isUser: false, text: 'В комнате есть компьютер?', tr: 'Дар ҳуҷра компютер ҳаст?' },
    { order: 7, speaker: 'Ты', isUser: true, text: 'Нет, компьютера нет.', tr: 'Не, компютер нест.' },
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

const wrow = await sql`SELECT w.id,w.word FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" WHERE l.id=${L[WORD.lo].id} AND w.word = ANY(${[WORD.old, WORD.word]})`;
if (wrow.length !== 1) throw new Error(`${WORD.label}: ${wrow.length} сатр`);
const wordItem = wrow[0].word === WORD.word ? null : { ...WORD, id: wrow[0].id };
if (wordItem) console.log(`\n${WORD.label}: «${WORD.old}» → «${WORD.word}» = «${WORD.translation}» ${WORD.emoji} · мисол «${WORD.example}»`);
else console.log(`${WORD.label}: аллакай нав`);

const lines = await sql`SELECT id,speaker,text,"isUser" iu,"order" FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
const allTexts = [...DIALOG.oldTexts, ...DIALOG.add.map((a) => a.text)];
let dlg = null;
if (lines.length === allTexts.length && lines.every((l, i) => l.text === allTexts[i])) console.log(`${DIALOG.label}: аллакай нав`);
else {
  if (lines.length !== 4 || !lines.every((l, i) => l.text === DIALOG.oldTexts[i] && l.order === i)) throw new Error(`${DIALOG.label}: ${JSON.stringify(lines.map((l) => l.text))}`);
  dlg = { lines, add: DIALOG.add.map((a) => ({ ...a, id: cuidLike() })) };
  console.log(`\n${DIALOG.label}: 4 → 8 сатр, ҳама бо як овоз аз нав сабт мешаванд`);
  for (const a of dlg.add) console.log(`  + ${a.speaker}: ${a.text} = ${a.tr}`);
}

if (!APPLY || (!items.length && !dlg && !wordItem)) { console.log(items.length || dlg || wordItem ? '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.' : '\nҲама чиз аллакай нав.'); process.exit(0); }

mkdirSync(WORK, { recursive: true });
const files = [];
if (items.length) {
  writeFileSync(`${WORK}/p.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text }))));
  console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
  files.push(...items.map((i) => ({ id: i.id, text: i.text, label: i.label, passage: true })));
}
const short = [];
if (dlg) short.push(...dlg.lines.map((l) => ({ id: l.id, text: l.text })), ...dlg.add.map((a) => ({ id: a.id, text: a.text })));
if (wordItem) short.push({ id: wordItem.id, text: wordItem.word });
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
    : m.peak >= 0.2 && m.lead <= 0.5 && m.speech >= 0.3 && art >= 5 && art <= (f.text.length <= 16 ? 40 : 30);
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
    'Russian A1 Module 7: re-record passages and dialogue, replace duplicate word']);
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
  console.log(`✅ ${it.label} — матн, аудио ва ${aq.length} савол сабт ва тасдиқ шуданд`);
}
if (wordItem) {
  await sql`UPDATE "Word" SET word=${wordItem.word}, translation=${wordItem.translation}, emoji=${wordItem.emoji},
    example=${wordItem.example}, "exampleTrans"=${wordItem.exampleTrans}, "audioUrl"=${urlOf[wordItem.id]}, ipa=${wordItem.ipa}
    WHERE id=${wordItem.id} AND word=${wordItem.old}`;
  const [a] = await sql`SELECT word,translation,"audioUrl" au FROM "Word" WHERE id=${wordItem.id}`;
  if (a.word !== wordItem.word || a.translation !== wordItem.translation || a.au !== urlOf[wordItem.id]) throw new Error(`ТАСДИҚ НАШУД: ${WORD.label}`);
  console.log(`✅ ${WORD.label} — калима, тарҷума, мисол ва аудиои нав`);
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
