// МОДУЛИ 4-и РУСӢ (A1) — Фазаи 2: матнҳои дорои АУДИО (+ саволҳои ба онҳо вобаста) ва муколама.
//
//   R5   Д13 (шунавоӣ): «заканчивается», «Во сколько», «говорящему» ҳеҷ гоҳ омӯзонида нашудаанд;
//        3 тавзеҳ танҳо бо русӣ.
//   R6   Д15 («Такрор»): 2 савол, матн нусхаи Д12/Д13, «Давайте повторим» → матни нав, ки
//        рӯз, соат, «был», моҳ ва синнро такрор мекунад + 2 саволи нав.
//   R13  Д17 (имтиҳон, тарҷума пинҳон): «свободен», «семьёй», «утра» → калимаҳои омӯхта.
//   R14  Д14 (муколама): 6 сатр → 8. Ҳамаи 8 сатр бо ЯК овоз аз нав сабт мешаванд, то дар як
//        сӯҳбат ду овоз омехта нашавад.
// Матн, тарҷума, аудио ва саволҳо дар ЯК транзаксия иваз мешаванд. Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m4-media.mjs           # dry-run
//   node prisma/_ru-m4-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m4-media';
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

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did FROM "Lesson" WHERE "moduleId"=${mods[3].id} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 4: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

// proof — пора, ки бояд дар матни НАВ бошад, то ҷавоби дуруст исбот шавад.
const PLAN = [
  {
    lo: 12, label: 'Д13 шунавоӣ',
    old: 'Сегодня понедельник. Сейчас девять часов утра. У меня урок русского в десять. Мой день рождения в мае. Мне двенадцать лет. Школа заканчивается в три.',
    text: 'Меня зовут Карим. Сегодня понедельник. Сейчас девять часов. У меня урок русского в десять. Мой день рождения в мае. Мне двенадцать лет.',
    tr: 'Номи ман Карим аст. Имрӯз душанбе аст. Ҳоло соати нӯҳ аст. Дарси русии ман соати даҳ аст. Зодрӯзи ман моҳи май аст. Ман дувоздаҳсола ҳастам.',
    update: [
      { i: 0, old: 'Какой сегодня день?', question: 'Какой сегодня день?', qt: 'Имрӯз кадом рӯз аст?', options: ['Воскресенье', 'Понедельник', 'Пятница'], ci: 1,
        proof: 'Сегодня понедельник', ex: 'Дар матн: «Сегодня понедельник» — имрӯз душанбе аст.' },
      { i: 1, old: 'Во сколько урок русского?', question: 'Когда урок русского?', qt: 'Дарси русӣ кай аст?', options: ['В девять', 'В десять', 'В восемь'], ci: 1,
        proof: 'урок русского в десять', ex: 'Дар матн: «У меня урок русского в десять» — соати даҳ. «Девять» — соати ҳозира аст.' },
      { i: 2, old: 'Когда день рождения?', question: 'Когда день рождения?', qt: 'Зодрӯз кай аст?', options: ['В марте', 'В июне', 'В мае'], ci: 2,
        proof: 'день рождения в мае', ex: 'Дар матн: «Мой день рождения в мае» — моҳи май.' },
      { i: 3, old: 'Сколько лет говорящему?', question: 'Сколько ему лет?', qt: 'Ӯ чандсола аст?', options: ['Десять', 'Тринадцать', 'Двенадцать'], ci: 2,
        proof: 'Мне двенадцать лет', ex: 'Дар матн: «Мне двенадцать лет» — Карим дувоздаҳсола аст. Диққат: тринадцать = 13.' },
    ],
    count: 4,
  },
  {
    lo: 14, label: 'Д15 такрор',
    old: 'Давайте повторим числа и время! Сегодня понедельник. Сейчас восемь часов утра. Мой урок русского в десять. Мой день рождения в июне. Мне пятнадцать лет.',
    text: 'Сегодня среда. Сейчас десять часов. Вчера был вторник. Я был дома. Мой день рождения в августе. Мне тридцать лет.',
    tr: 'Имрӯз чоршанбе аст. Ҳоло соати даҳ аст. Дирӯз сешанбе буд. Ман дар хона будам. Зодрӯзи ман моҳи август аст. Ман сисола ҳастам.',
    title: ['Сегодня среда', 'Имрӯз чоршанбе'],
    update: [
      { i: 0, old: 'Когда урок русского?', question: 'Какой сегодня день?', qt: 'Имрӯз кадом рӯз аст?', options: ['Вторник', 'Среда', 'Пятница'], ci: 1,
        proof: 'Сегодня среда', ex: 'Дар матн: «Сегодня среда» — имрӯз чоршанбе аст. «Вторник» дирӯз буд.' },
      { i: 1, old: 'Когда день рождения?', question: 'Какой день был вчера?', qt: 'Дирӯз кадом рӯз буд?', options: ['Понедельник', 'Четверг', 'Вторник'], ci: 2,
        proof: 'Вчера был вторник', ex: 'Дар матн: «Вчера был вторник» — дирӯз сешанбе буд.' },
    ],
    insert: [
      { order: 2, question: 'Когда день рождения?', qt: 'Зодрӯз кай аст?', options: ['В августе', 'В апреле', 'В октябре'], ci: 0,
        proof: 'день рождения в августе', ex: 'Дар матн: «Мой день рождения в августе» — моҳи август.' },
      { order: 3, question: 'Сколько ему лет?', qt: 'Ӯ чандсола аст?', options: ['Тринадцать', 'Сорок', 'Тридцать'], ci: 2,
        proof: 'Мне тридцать лет', ex: 'Дар матн: «Мне тридцать лет» — ӯ сисола аст. Диққат: тринадцать = 13.' },
    ],
    count: 2,
  },
  {
    lo: 16, label: 'Д17 имтиҳон',
    old: 'Меня зовут Тимур. Мне двадцать лет. Мой день рождения в июне. Я встаю в семь часов утра. Школа начинается в восемь. В понедельник и среду у меня музыка. В пятницу я свободен. Вчера было воскресенье. Это был хороший день. Я был дома с семьёй.',
    text: 'Меня зовут Тимур. Мне двадцать лет. Мой день рождения в июне. Я встаю в семь часов. Школа начинается в восемь. В понедельник и в пятницу у меня музыка. Вчера было воскресенье. Это был хороший день. Я был дома.',
    tr: 'Номи ман Тимур аст. Ман бистсола ҳастам. Зодрӯзи ман моҳи июн аст. Ман соати ҳафт мехезам. Мактаб соати ҳашт сар мешавад. Рӯзҳои душанбе ва ҷумъа ман мусиқӣ дорам. Дирӯз якшанбе буд. Он рӯзи хубе буд. Ман дар хона будам.',
    update: [
      { i: 0, old: 'Сколько лет Тимуру?', question: 'Сколько лет Тимуру?', qt: 'Тимур чандсола аст?', options: ['Двадцать', 'Двенадцать', 'Тридцать'], ci: 0,
        proof: 'Мне двадцать лет', ex: 'Матн мегӯяд: «Мне двадцать лет» — Тимур бистсола аст.' },
    ],
    keep: [ // саволҳое ки иваз намешаванд, вале ҷавобашон бояд дар матни нав ҳам бошад
      { i: 1, question: 'Когда начинается школа?', proof: 'Школа начинается в восемь' },
      { i: 2, question: 'Какой день был вчера?', proof: 'Вчера было воскресенье' },
    ],
    count: 8,
  },
];

const DIALOG = {
  lo: 13, label: 'Д14 муколама',
  oldTexts: ['Какой сегодня день?', 'Сегодня понедельник.', 'Сколько сейчас времени?', 'Сейчас четыре часа.', 'Когда у тебя день рождения?', 'Мой день рождения в июне.'],
  add: [
    { order: 6, speaker: 'Собеседник', isUser: false, text: 'А какой день был вчера?', tr: 'Дирӯз чӣ рӯз буд?' },
    { order: 7, speaker: 'Ты', isUser: true, text: 'Вчера было воскресенье.', tr: 'Дирӯз якшанбе буд.' },
  ],
};

const items = [];
for (const p of PLAN) {
  const [c] = await sql`SELECT id,passage FROM "ComprehensionExercise" WHERE id=${L[p.lo].cid}`;
  const qs = await sql`SELECT id,question,options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order", id`;
  if (c.passage === p.text) { console.log(`${p.label}: аллакай нав`); continue; }
  if (c.passage !== p.old) throw new Error(`${p.label}: матни ғайричашмдошт «${c.passage}»`);
  if (qs.length !== p.count) throw new Error(`${p.label}: ${qs.length} савол (интизор ${p.count})`);
  for (const u of p.update) if (qs[u.i].question !== u.old) throw new Error(`${p.label} Q${u.i + 1}: «${qs[u.i].question}» ≠ «${u.old}»`);
  for (const q of [...p.update, ...(p.insert ?? [])]) {
    if (!p.text.includes(q.proof)) throw new Error(`${p.label} «${q.question}»: далел «${q.proof}» дар матн нест`);
    const ans = q.options[q.ci].toLowerCase().replace(/^в /, '');
    if (!q.proof.toLowerCase().includes(ans)) throw new Error(`${p.label} «${q.question}»: ҷавоб «${q.options[q.ci]}» ба далел мувофиқ нест`);
    if (new Set(q.options).size !== q.options.length) throw new Error(`${p.label}: варианти такрорӣ`);
  }
  for (const k of p.keep ?? []) {
    if (qs[k.i].question !== k.question) throw new Error(`${p.label} Q${k.i + 1}: «${qs[k.i].question}»`);
    const ans = qs[k.i].options[qs[k.i].ci].toLowerCase().replace(/^в /, '');
    if (!p.text.includes(k.proof) || !k.proof.toLowerCase().includes(ans)) throw new Error(`${p.label} Q${k.i + 1}: ҷавоби «${ans}» дар матни нав тасдиқ нашуд`);
  }
  items.push({ ...p, kind: 'passage', id: c.id, qs });
  console.log(`\n${p.label}\n  буд: ${p.old}\n  шуд: ${p.text}\n  тҷ : ${p.tr}`);
  for (const u of p.update) console.log(`  Q${u.i + 1}: ${u.question} → «${u.options[u.ci]}»`);
  for (const n of p.insert ?? []) console.log(`  + Q${n.order + 1} (нав): ${n.question} → «${n.options[n.ci]}»`);
  for (const k of p.keep ?? []) console.log(`  = Q${k.i + 1}: ${k.question} (бетағйир, дар матни нав тасдиқ шуд)`);
}

const lines = await sql`SELECT id,speaker,text,"isUser" iu,"order" FROM "DialogueLine" WHERE "dialogueId"=${L[DIALOG.lo].did} ORDER BY "order"`;
let dlg = null;
const allTexts = [...DIALOG.oldTexts, ...DIALOG.add.map((a) => a.text)];
if (lines.length === allTexts.length && lines.every((l, i) => l.text === allTexts[i])) {
  console.log(`${DIALOG.label}: аллакай нав`);
} else {
  if (lines.length !== DIALOG.oldTexts.length || !lines.every((l, i) => l.text === DIALOG.oldTexts[i] && l.order === i))
    throw new Error(`${DIALOG.label}: сатрҳои ғайричашмдошт ${JSON.stringify(lines.map((l) => l.text))}`);
  if (lines[4].iu || !lines[5].iu || lines[4].speaker !== 'Собеседник' || lines[5].speaker !== 'Ты') throw new Error('гӯяндаҳо ғайричашмдошт');
  dlg = { lines, add: DIALOG.add.map((a) => ({ ...a, id: cuidLike() })) };
  console.log(`\n${DIALOG.label}: ${lines.length} → ${lines.length + dlg.add.length} сатр, ҳама бо як овоз аз нав сабт мешаванд`);
  for (const a of dlg.add) console.log(`  + ${a.speaker}: ${a.text} = ${a.tr}`);
}

if (!APPLY || (!items.length && !dlg)) { console.log(items.length || dlg ? '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.' : '\nҲама чиз аллакай нав.'); process.exit(0); }

mkdirSync(WORK, { recursive: true });
const files = [];
if (items.length) {
  writeFileSync(`${WORK}/p.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text }))));
  console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
  files.push(...items.map((i) => ({ id: i.id, text: i.text, label: i.label, passage: true })));
}
if (dlg) {
  const all = [...dlg.lines.map((l) => ({ id: l.id, text: l.text })), ...dlg.add.map((a) => ({ id: a.id, text: a.text }))];
  writeFileSync(`${WORK}/d.json`, JSON.stringify(all));
  console.log(execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/d.json`], PY).trim());
  files.push(...all.map((a) => ({ ...a, label: `сатр «${a.text}»`, passage: false })));
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
    'Russian A1 Module 4: re-record listening, review, exam passages and dialogue (taught vocabulary only)']);
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
  for (const u of it.update) {
    tx.push(sql`UPDATE "ComprehensionQuestion" SET question=${u.question}, "questionTranslated"=${u.qt},
      options=${JSON.stringify(u.options)}::jsonb, "correctIndex"=${u.ci}, explanation=${u.ex} WHERE id=${it.qs[u.i].id}`);
  }
  for (const n of it.insert ?? []) {
    tx.push(sql`INSERT INTO "ComprehensionQuestion" (id,"exerciseId",question,"questionTranslated",options,"correctIndex",explanation,"order")
      VALUES (${cuidLike()},${it.id},${n.question},${n.qt},${JSON.stringify(n.options)}::jsonb,${n.ci},${n.ex},${n.order})`);
  }
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
  for (const a of dlg.add) {
    tx.push(sql`INSERT INTO "DialogueLine" (id,"dialogueId",speaker,text,translation,"audioUrl","isUser","order")
      VALUES (${a.id},${did},${a.speaker},${a.text},${a.tr},${urlOf[a.id]},${a.isUser},${a.order})`);
  }
  await sql.transaction(tx);
  const after = await sql`SELECT id,text,"audioUrl" au,"order" FROM "DialogueLine" WHERE "dialogueId"=${did} ORDER BY "order"`;
  const ok = after.length === allTexts.length && after.every((l, i) => l.text === allTexts[i] && l.order === i && l.au === urlOf[l.id]);
  if (!ok) throw new Error(`ТАСДИҚ НАШУД: ${DIALOG.label}`);
  console.log(`✅ ${DIALOG.label} — ${after.length} сатр, ҳама бо аудиои нав`);
}
