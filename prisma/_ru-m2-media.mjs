// МОДУЛИ 2-и РУСӢ (A1) — Фазаи 2: матнҳои дорои АУДИО.
//
//   R1/R4/R5  Д11 (шунавоӣ): «Мне пятнадцать лет» ва вариантҳои Пять/Пятьдесят/
//             Москва/Лондон/Россия ҳеҷ гоҳ пеш аз ин таълим нашудаанд. Матн ба
//             ҳамон Рустами Д10 табдил меёбад, бо «Мне десять лет» (Д1 «Лет»).
//             Матн, тарҷума, аудио ва ҳар 4 савол дар ЯК транзаксия иваз мешаванд —
//             ҳеҷ лаҳзае нест, ки саволҳо «Рустам» гӯянд ва аудио «Карим».
//   R8        Д14 («Такрор»): «матн» сарлавҳа буд → матни воқеӣ аз калимаҳои модул.
//   R9        Д12: «Здравствуйте!» + «ты/тебя» → «Привет!» (ҳамон ислоҳи Модули 1).
//
// ТАРТИБ: тавлид → санҷиши маҳаллӣ → push (audio/ru, ТАНҲО файлҳои нав) → CDN md5 →
// транзаксия → санҷиш. Бе --apply ҳеҷ чиз тавлид/бор/сабт намешавад.
//
//   node prisma/_ru-m2-media.mjs           # dry-run
//   node prisma/_ru-m2-media.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m2-media';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const check = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths], PY);
  if (r.status !== 0) throw new Error(r.stderr);
  return { m: JSON.parse(r.stdout), err: r.stderr };
};

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid,"dialogueId" did FROM "Lesson" WHERE "moduleId"=${mods[1].id} ORDER BY "order"`;
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));

// Санҷиши транзаксияи драйвер (танҳо хониш)
const probe = await sql.transaction([sql`SELECT 1 AS a`, sql`SELECT 2 AS b`]);
if (probe?.[1]?.[0]?.b !== 2) throw new Error('sql.transaction кор намекунад');
console.log('✓ транзаксияи драйвер кор мекунад');

// ── Д11 ─────────────────────────────────────────────────────────────────────
const LISTEN = {
  old: 'Здравствуйте! Меня зовут Карим. Я из Таджикистана. Я живу в Душанбе. Мне пятнадцать лет. Я говорю на таджикском и русском.',
  text: 'Здравствуйте! Меня зовут Рустам. Я из Таджикистана. Я живу в Душанбе. Мне десять лет. Я говорю на таджикском и русском.',
  tr: 'Салом! Номи ман Рустам аст. Ман аз Тоҷикистон ҳастам. Ман дар Душанбе зиндагӣ мекунам. Ман даҳсола ҳастам. Ман бо тоҷикӣ ва русӣ гап мезанам.',
  q: [
    { old: 'Откуда Карим?', question: 'Откуда Рустам?', qt: 'Рустам аз куҷост?', options: ['Америка', 'Таджикистан', 'Англия'], ci: 1,
      ex: 'Дар матн: «Я из Таджикистана» — Рустам аз Тоҷикистон аст.' },
    { old: 'Сколько лет Кариму?', question: 'Что Рустам говорит о возрасте?', qt: 'Рустам дар бораи синну солаш чӣ мегӯяд?',
      options: ['Мне десять лет.', 'Я из Таджикистана.', 'Я живу в Душанбе.'], ci: 0,
      ex: 'Дар матн: «Мне десять лет» — Рустам даҳсола аст.' },
    { old: 'Где живёт Карим?', question: 'Где живёт Рустам?', qt: 'Рустам дар куҷо зиндагӣ мекунад?', options: ['Дубай', 'Душанбе', 'Америка'], ci: 1,
      ex: 'Дар матн: «Я живу в Душанбе» — Рустам дар Душанбе зиндагӣ мекунад.' },
    { old: 'На каких языках говорит Карим?', question: 'На каких языках говорит Рустам?', qt: 'Рустам кадом забонҳоро медонад?',
      options: ['Таджикский и английский', 'Английский и русский', 'Таджикский и русский'], ci: 2,
      ex: 'Матн мегӯяд: «Я говорю на таджикском и русском» — тоҷикӣ ва русӣ.' },
  ],
};
const REVIEW = {
  old: 'Повторение Модуля 2: Возраст, Страны, Города и Языки.',
  text: 'Меня зовут Рустам. Мне десять лет. Я из Таджикистана. Я живу в Душанбе. Мой друг Том из Англии. Он живёт в Лондоне. Я говорю на таджикском и русском.',
  tr: 'Номи ман Рустам аст. Ман даҳсола ҳастам. Ман аз Тоҷикистон ҳастам. Ман дар Душанбе зиндагӣ мекунам. Дӯсти ман Том аз Англия аст. Ӯ дар Лондон зиндагӣ мекунад. Ман бо тоҷикӣ ва русӣ гап мезанам.',
};

const [c11] = await sql`SELECT id,passage,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${L[10].cid}`;
const q11 = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${c11.id} ORDER BY "order", id`;
const [c14] = await sql`SELECT id,passage,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${L[13].cid}`;
const d12 = await sql`SELECT id,speaker,text,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=${L[11].did} ORDER BY "order"`;

const items = [];
if (c11.passage === LISTEN.old) {
  if (q11.length !== 4 || q11.some((q, i) => q.question !== LISTEN.q[i].old)) throw new Error('Д11: саволҳо аз дамп фарқ доранд — боздошт');
  items.push({ kind: 'passage', id: c11.id, text: LISTEN.text, label: 'Д11 матни шунавоӣ (+4 савол)' });
} else if (c11.passage !== LISTEN.text) throw new Error(`Д11: матни ғайричашмдошт «${c11.passage}»`);
else console.log('Д11: аллакай нав');

if (c14.passage === REVIEW.old) items.push({ kind: 'passage', id: c14.id, text: REVIEW.text, label: 'Д14 матни такрор' });
else if (c14.passage !== REVIEW.text) throw new Error(`Д14: матни ғайричашмдошт «${c14.passage}»`);
else console.log('Д14: аллакай нав');

if (d12.length !== 13) throw new Error(`Д12: ${d12.length} сатр`);
for (const ln of d12.slice(0, 2)) {
  if (ln.text === 'Здравствуйте!') items.push({ kind: 'line', id: ln.id, text: 'Привет!', label: `Д12 ${ln.speaker}: «Здравствуйте!» → «Привет!»` });
  else if (ln.text !== 'Привет!') throw new Error(`Д12: сатри ғайричашмдошт «${ln.text}»`);
}
// Регистр: баъди иваз дар муколама ягон «Здравствуйте» набояд монад
const leftFormal = d12.slice(2).filter((l) => /Здравствуйте/.test(l.text));
if (leftFormal.length) throw new Error(`Д12: «Здравствуйте» дар сатрҳои дигар: ${leftFormal.map((l) => l.text)}`);

console.log('\n== Чӣ сохта мешавад ==');
for (const it of items) console.log(`  ${it.label}\n    «${it.text}»`);
if (!APPLY || !items.length) { console.log(items.length ? '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.' : '\nҲама чиз аллакай нав.'); process.exit(0); }

// ── Тавлид ──────────────────────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
const passages = items.filter((i) => i.kind === 'passage');
const lines = items.filter((i) => i.kind === 'line');
if (passages.length) {
  writeFileSync(`${WORK}/p.json`, JSON.stringify(passages.map((i) => ({ id: i.id, text: i.text }))));
  console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
}
if (lines.length) {
  writeFileSync(`${WORK}/l.json`, JSON.stringify(lines.map((i) => ({ id: i.id, text: i.text }))));
  console.log(execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/l.json`], PY).trim().split('\n').pop());
}
const { m: local, err } = check(items.map((i) => `${WORK}/${i.id}.mp3`));
if (/error/i.test(err)) throw new Error(`дешифргар: ${err}`);
let bad = 0;
for (const it of items) {
  const m = local[`${WORK}/${it.id}.mp3`];
  const art = it.text.length / Math.max(m.speech, 0.01);
  const ok = m.peak >= 0.2 && m.lead <= 0.5 && (it.kind === 'line' ? m.speech >= 0.2 : art >= 15 && art <= 40 && m.dur <= 25);
  console.log(`  ${ok ? '✓' : '✗'} ${it.label}: ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`);
  if (!ok) bad++;
  it.md5 = m.md5;
}
if (bad) { console.error('⛔ файли бад — ҳеҷ чиз бор нашуд'); process.exit(1); }

// ── Push ────────────────────────────────────────────────────────────────────
const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/ru')) git(['sparse-checkout', 'add', 'audio/ru']);
for (const it of items) copyFileSync(`${WORK}/${it.id}.mp3`, `${REPO}/audio/ru/${it.id}.mp3`);
git(['add', ...items.map((i) => `audio/ru/${i.id}.mp3`)]);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
    'Russian A1 Module 2: re-record listening + review passages (taught vocabulary only) and informal greeting']);
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

// ── Транзаксия: матн + аудио + саволҳо якҷоя ────────────────────────────────
const tx = [];
for (const it of items) {
  if (it.id === c11.id) {
    tx.push(sql`UPDATE "ComprehensionExercise" SET passage=${LISTEN.text}, "passageTranslated"=${LISTEN.tr}, "audioUrl"=${it.url} WHERE id=${c11.id} AND passage=${LISTEN.old}`);
    q11.forEach((q, i) => {
      const n = LISTEN.q[i];
      tx.push(sql`UPDATE "ComprehensionQuestion" SET question=${n.question}, "questionTranslated"=${n.qt},
        options=${JSON.stringify(n.options)}::jsonb, "correctIndex"=${n.ci}, explanation=${n.ex} WHERE id=${q.id}`);
    });
  } else if (it.id === c14.id) {
    tx.push(sql`UPDATE "ComprehensionExercise" SET passage=${REVIEW.text}, "passageTranslated"=${REVIEW.tr}, "audioUrl"=${it.url} WHERE id=${c14.id} AND passage=${REVIEW.old}`);
  } else {
    tx.push(sql`UPDATE "DialogueLine" SET text=${it.text}, "audioUrl"=${it.url} WHERE id=${it.id} AND text=${'Здравствуйте!'}`);
  }
}
await sql.transaction(tx);

// ── Тасдиқ ──────────────────────────────────────────────────────────────────
const [a11] = await sql`SELECT passage,"passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${c11.id}`;
const a11q = await sql`SELECT question,options,"correctIndex" ci,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${c11.id} ORDER BY "order", id`;
const [a14] = await sql`SELECT passage FROM "ComprehensionExercise" WHERE id=${c14.id}`;
const a12 = await sql`SELECT text FROM "DialogueLine" WHERE "dialogueId"=${L[11].did} ORDER BY "order" LIMIT 2`;
const ok = a11.passage === LISTEN.text && a11.pt === LISTEN.tr
  && a11q.every((q, i) => q.question === LISTEN.q[i].question && q.ci === LISTEN.q[i].ci && JSON.stringify(q.options) === JSON.stringify(LISTEN.q[i].options))
  && a14.passage === REVIEW.text && a12.every((l) => l.text === 'Привет!');
if (!ok) throw new Error('ТАСДИҚ НАШУД — ниг. база');
console.log('✅ Д11 (матн + 4 савол), Д14, Д12 — сабт ва тасдиқ шуданд');
