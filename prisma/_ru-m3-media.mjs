// МОДУЛИ 3-и РУСӢ (A1) — Фазаи 2: матнҳои дорои АУДИО (+ саволҳои ба онҳо вобаста).
//
//   R1/R3  Д13 (шунавоӣ, тарҷума пинҳон): «врач», «учительница», «один», вариантҳои
//          «Анны/Карима/Сары», «Медсестра», «Один/Два/Три» ҳеҷ гоҳ таълим нашудаанд.
//   R4     Д16 («Такрор»): матн = сарлавҳа ва ҳамагӣ 2 савол → матни воқеӣ + 2 саволи нав.
//   R1/R3  Д17 (имтиҳон, тарҷума пинҳон): «врач», «два брата», «одна сестра».
// Ҳар матн бо калимаҳои ОМӮХТАИ Модулҳои 1–3 аз нав навишта шуд. Матн, тарҷума, аудио ва
// саволҳо дар ЯК транзаксия иваз мешаванд. Бе --apply ҳеҷ чиз сохта/бор/сабт намешавад.
//
//   node prisma/_ru-m3-media.mjs           # dry-run
//   node prisma/_ru-m3-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { randomBytes } from 'crypto';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m3-media';
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
const lessons = await sql`SELECT id,"order","comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${mods[2].id} ORDER BY "order"`;
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');

const PLAN = [
  {
    lo: 12, label: 'Д13 шунавоӣ',
    old: 'Здравствуйте! Это моя подруга Сара. У неё есть большая семья. Её мать учительница. Её отец врач. У неё есть один брат. Её брат высокий и сильный.',
    text: 'Здравствуйте! Это моя подруга Сара. У неё есть большая семья. Её мать учитель. Её отец инженер. У неё есть брат и сестра. Её брат высокий и сильный.',
    tr: 'Салом! Ин дугонаи ман Сара аст. Ӯ оилаи калон дорад. Модари ӯ муаллим аст. Падари ӯ муҳандис аст. Ӯ бародар ва хоҳар дорад. Бародари ӯ қадбаланд ва қавӣ аст.',
    update: [
      { i: 0, old: 'Чья это семья?', question: 'Как зовут подругу?', qt: 'Номи дугона чист?', options: ['Анна', 'Сара', 'Карим'], ci: 1,
        ex: 'Дар матн: «Это моя подруга Сара» — номи ӯ Сара аст.' },
      { i: 1, old: 'Кто мать Сары?', question: 'Кто мать Сары?', qt: 'Модари Сара кист?', options: ['Инженер', 'Учитель', 'Студент'], ci: 1,
        ex: 'Дар матн: «Её мать учитель» — модари Сара муаллим аст.' },
      { i: 2, old: 'Сколько братьев?', question: 'Кто есть у Сары?', qt: 'Сара кӣ дорад?', options: ['Брат и сестра', 'Сын и дочь', 'Муж и жена'], ci: 0,
        ex: 'Дар матн: «У неё есть брат и сестра» — ӯ бародар ва хоҳар дорад.' },
      { i: 3, old: 'Какой брат?', question: 'Какой брат?', qt: 'Бародар чӣ гуна?', options: ['Маленький и грустный', 'Высокий и сильный', 'Низкий и старый'], ci: 1,
        ex: 'Дар матн: «Её брат высокий и сильный» — қадбаланд ва қавӣ.' },
    ],
    count: 4,
  },
  {
    lo: 15, label: 'Д16 такрор',
    old: 'Повторение Модуля 3: Семья, Родственники и Описания.',
    text: 'Это моя семья. Мой дедушка старый, а моя бабушка добрая. У меня есть брат и сестра. Мой брат высокий и сильный. Моя сестра низкая. Мы счастливы.',
    tr: 'Ин оилаи ман аст. Бобои ман пир аст, бибии ман бошад меҳрубон аст. Ман бародар ва хоҳар дорам. Бародари ман қадбаланд ва қавӣ аст. Хоҳари ман қадпаст аст. Мо хушбахт ҳастем.',
    update: [],
    insert: [
      { order: 2, question: 'Какая бабушка?', qt: 'Бибӣ чӣ гуна аст?', options: ['Добрая', 'Грустная', 'Высокая'], ci: 0,
        ex: 'Дар матн: «моя бабушка добрая» — бибӣ меҳрубон аст.' },
      { order: 3, question: 'Какая сестра?', qt: 'Хоҳар чӣ гуна аст?', options: ['Высокая', 'Низкая', 'Старая'], ci: 1,
        ex: 'Дар матн: «Моя сестра низкая» — хоҳар қадпаст аст.' },
    ],
    count: 2,
  },
  {
    lo: 16, label: 'Д17 имтиҳон',
    old: 'Это моя семья. У меня есть большая семья. Мой отец учитель. Моя мать врач. У меня есть два брата и одна сестра. Мой брат высокий. Моя сестра маленькая. Мы счастливы.',
    text: 'Это моя семья. У меня есть большая семья. Мой отец учитель. Моя мать инженер. У меня есть брат и сестра. Мой брат высокий. Моя сестра маленькая. Мы счастливы.',
    tr: 'Ин оилаи ман аст. Ман оилаи калон дорам. Падари ман муаллим аст. Модари ман муҳандис аст. Ман бародар ва хоҳар дорам. Бародари ман қадбаланд аст. Хоҳари ман хурд аст. Мо хушбахт ҳастем.',
    update: [
      { i: 1, old: 'Кто отец?', question: 'Кто отец?', qt: 'Падар кист (касб)?', options: ['Инженер', 'Учитель', 'Студент'], ci: 1,
        ex: 'Дар матн: «Мой отец учитель» — падар муаллим аст.' },
      { i: 2, old: 'Кто мать?', question: 'Кто мать?', qt: 'Модар кист (касб)?', options: ['Студент', 'Учитель', 'Инженер'], ci: 2,
        ex: 'Дар матн: «Моя мать инженер» — модар муҳандис аст.' },
      { i: 3, old: 'Сколько братьев?', question: 'Что правильно?', qt: 'Кадомаш дуруст аст?',
        options: ['У меня есть брат и сестра.', 'У меня есть сын и дочь.', 'У меня нет брата.'], ci: 0,
        ex: 'Дар матн: «У меня есть брат и сестра» — ҳам бародар, ҳам хоҳар ҳаст.' },
    ],
    count: 8,
  },
];

const items = [];
for (const p of PLAN) {
  const [c] = await sql`SELECT id,passage FROM "ComprehensionExercise" WHERE id=${L[p.lo].cid}`;
  const qs = await sql`SELECT id,question,"order" FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order", id`;
  if (c.passage === p.text) { console.log(`${p.label}: аллакай нав`); continue; }
  if (c.passage !== p.old) throw new Error(`${p.label}: матни ғайричашмдошт «${c.passage}»`);
  if (qs.length !== p.count) throw new Error(`${p.label}: ${qs.length} савол (интизор ${p.count})`);
  for (const u of p.update) if (qs[u.i].question !== u.old) throw new Error(`${p.label} Q${u.i + 1}: «${qs[u.i].question}» ≠ «${u.old}»`);
  // Ҳар ҷавоби дуруст бояд дар матни НАВ тасдиқ шавад (санҷиши механикӣ ҳамроҳи хондан)
  items.push({ ...p, id: c.id, qs });
  console.log(`\n${p.label}\n  буд: ${p.old}\n  шуд: ${p.text}\n  тҷ : ${p.tr}`);
  for (const u of p.update) console.log(`  Q${u.i + 1}: ${u.question} → «${u.options[u.ci]}»`);
  for (const n of p.insert ?? []) console.log(`  + Q${n.order + 1} (нав): ${n.question} → «${n.options[n.ci]}»`);
}
if (!APPLY || !items.length) { console.log(items.length ? '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.' : '\nҲама чиз аллакай нав.'); process.exit(0); }

mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/p.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text }))));
console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
const { m: local, err } = check(items.map((i) => `${WORK}/${i.id}.mp3`));
if (/error/i.test(err)) throw new Error(`дешифргар: ${err}`);
let bad = 0;
for (const it of items) {
  const m = local[`${WORK}/${it.id}.mp3`];
  const art = it.text.length / Math.max(m.speech, 0.01);
  const ok = m.peak >= 0.2 && m.lead <= 0.5 && art >= 15 && art <= 40 && m.dur <= 25;
  console.log(`  ${ok ? '✓' : '✗'} ${it.label}: ${m.dur}s нутқ=${m.speech}s (${art.toFixed(1)} ҳ/с) пеш=${m.lead}s peak=${m.peak}`);
  if (!ok) bad++;
  it.md5 = m.md5;
}
if (bad) { console.error('⛔ файли бад — ҳеҷ чиз бор нашуд'); process.exit(1); }

const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/ru')) git(['sparse-checkout', 'add', 'audio/ru']);
for (const it of items) copyFileSync(`${WORK}/${it.id}.mp3`, `${REPO}/audio/ru/${it.id}.mp3`);
git(['add', ...items.map((i) => `audio/ru/${i.id}.mp3`)]);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
    'Russian A1 Module 3: re-record listening, review and exam passages (taught vocabulary only)']);
  git(['push', 'origin', 'HEAD:main']);
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);
for (const it of items) it.url = `${CDN}@${sha}/audio/ru/${it.id}.mp3`;
let cdnBad = items.length;
for (let a = 1; a <= 6 && cdnBad; a++) {
  const { m } = check(items.map((i) => i.url));
  cdnBad = items.filter((i) => m[i.url]?.md5 !== i.md5).length;
  if (cdnBad) { console.log(`кӯшиши ${a}: ${cdnBad} ҳанӯз нест…`); await new Promise((r) => setTimeout(r, 10000)); }
}
if (cdnBad) { console.error('⛔ CDN — база даст нахӯрд'); process.exit(1); }
console.log('✓ CDN: md5 айнан баробар');

for (const it of items) {
  const tx = [sql`UPDATE "ComprehensionExercise" SET passage=${it.text}, "passageTranslated"=${it.tr}, "audioUrl"=${it.url} WHERE id=${it.id} AND passage=${it.old}`];
  for (const u of it.update) {
    tx.push(sql`UPDATE "ComprehensionQuestion" SET question=${u.question}, "questionTranslated"=${u.qt},
      options=${JSON.stringify(u.options)}::jsonb, "correctIndex"=${u.ci}, explanation=${u.ex} WHERE id=${it.qs[u.i].id}`);
  }
  for (const n of it.insert ?? []) {
    tx.push(sql`INSERT INTO "ComprehensionQuestion" (id,"exerciseId",question,"questionTranslated",options,"correctIndex",explanation,"order")
      VALUES (${cuidLike()},${it.id},${n.question},${n.qt},${JSON.stringify(n.options)}::jsonb,${n.ci},${n.ex},${n.order})`);
  }
  await sql.transaction(tx);
  const [a] = await sql`SELECT passage,"passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${it.id}`;
  const aq = await sql`SELECT question,options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${it.id} ORDER BY "order", id`;
  const ok = a.passage === it.text && a.pt === it.tr
    && it.update.every((u) => aq[u.i].question === u.question && aq[u.i].ci === u.ci && JSON.stringify(aq[u.i].options) === JSON.stringify(u.options))
    && aq.length === it.count + (it.insert?.length ?? 0);
  if (!ok) throw new Error(`ТАСДИҚ НАШУД: ${it.label}`);
  console.log(`✅ ${it.label} — матн, аудио ва ${aq.length} савол сабт ва тасдиқ шуданд`);
}
