// ФАЗАИ 4 — се МАТНи Модули 1-и русӣ бе калимаи наомӯхта (+ аудиои нав).
//
//   #9  шунавоӣ  — «Доброе утро всем», «Приятно познакомиться», «до скорой
//                  встречи» ҳеҷ ҷо пеш аз ин таълим дода нашудаанд. Дар шунавоӣ
//                  тарҷума то «ошкор кардан» пинҳон аст — пас монеаи воқеӣ.
//   #11 такрор   — «Давайте повторим приветствия!» наомӯхта.
//   #13 имтиҳон — «Это моя подруга Сара»: «подруга» наомӯхта ва дар имтиҳон
//                  тарҷума пинҳон аст.
//
// Ҳамаи саволҳо ва тавзеҳҳои ин се матн пеш аз навиштан тафтиш шуданд: ҳар кадом
// ба ҷумлае ишора мекунад, ки дар матни НАВ айнан боқист (ниг. REQUIRED).
//
// Матн ба аудио баста аст → матн, тарҷума ва audioUrl дар ЯК UPDATE иваз
// мешаванд, танҳо баъди он ки файли нав дар CDN айнан (md5) тасдиқ шуд.
//
//   node prisma/_ru-m1-passages-v2.mjs --dry
//   node prisma/_ru-m1-passages-v2.mjs
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';

const sql = connect();
const DRY = process.argv.includes('--dry');
const WORK = 'tmp/ru-m1-passages-v2';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';

const PLAN = {
  9: {
    old: 'Здравствуйте! Меня зовут Анна. Я учитель. Доброе утро всем. Это мой друг Том. Он студент. Приятно познакомиться. До свидания, до скорой встречи!',
    text: 'Здравствуйте! Меня зовут Анна. Я учитель. Доброе утро! Это мой друг Том. Он студент. До свидания!',
    tr: 'Салом! Номи ман Анна аст. Ман муаллим ҳастам. Субҳ ба хайр! Ин дӯсти ман Том аст. Ӯ донишҷӯ аст. Хайр!',
    REQUIRED: ['Меня зовут Анна', 'Я учитель', 'Это мой друг Том', 'Он студент'],
  },
  11: {
    old: 'Давайте повторим приветствия! Доброе утро! Меня зовут Али. Я студент. Это мой друг Карим. Он учитель. Спасибо и до свидания!',
    text: 'Доброе утро! Меня зовут Али. Я студент. Это мой друг Карим. Он учитель. Спасибо и до свидания!',
    tr: 'Субҳ ба хайр! Номи ман Алӣ аст. Ман донишҷӯ ҳастам. Ин дӯсти ман Карим аст. Ӯ муаллим аст. Ташаккур ва хайр!',
    REQUIRED: ['Это мой друг Карим. Он учитель', 'Спасибо и до свидания!'],
  },
  13: {
    old: 'Здравствуйте! Меня зовут Али. Я мальчик. Это моя подруга Сара. Она девочка. Доброе утро, учитель!',
    text: 'Здравствуйте! Меня зовут Али. Я мальчик. Это Сара. Она девочка. Доброе утро, учитель!',
    tr: 'Салом! Номи ман Алӣ аст. Ман писарбача ҳастам. Ин Сара аст. Ӯ духтарча аст. Субҳ ба хайр, муаллим!',
    REQUIRED: ['Меня зовут Али', 'Она девочка', 'Доброе утро, учитель!'],
  },
};

const check = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths],
    { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 });
  if (r.status !== 0) throw new Error(r.stderr);
  return { m: JSON.parse(r.stdout), err: r.stderr };
};

const [M1] = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order" LIMIT 1`;
const lessons = await sql`SELECT "order","comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${M1.id} ORDER BY "order"`;
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));

const items = [];
for (const [lo, p] of Object.entries(PLAN)) {
  for (const s of p.REQUIRED) {
    if (!p.text.includes(s)) throw new Error(`#${lo}: матни нав «${s}»-ро надорад — тавзеҳи савол шикаст мехӯрад`);
  }
  const [c] = await sql`SELECT id,passage,"passageTranslated" pt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${L[lo].cid}`;
  if (c.passage === p.text) { console.log(`#${lo}: аллакай нав аст — гузаронда шуд`); continue; }
  if (c.passage !== p.old) throw new Error(`#${lo}: матни ғайричашмдошт:\n  «${c.passage}»`);
  // Ҳар тавзеҳи саволҳо бояд ба матни НАВ мувофиқ бошад (иқтибос дар «…» бояд дар матн бошад).
  const qs = await sql`SELECT question,explanation FROM "ComprehensionQuestion" WHERE "exerciseId"=${c.id} ORDER BY "order"`;
  for (const q of qs) {
    for (const quote of (q.explanation || '').match(/«[^»]*[А-Яа-яЁё][^»]*»/g) || []) {
      const inner = quote.slice(1, -1).replace(/[.!?]$/, '');
      const cyrRu = /[ӣӯҳҷқғ]/i.test(inner) ? null : inner; // тоҷикиро намесанҷем
      if (cyrRu && !p.text.includes(cyrRu) && !['До свидания'].includes(cyrRu)) {
        throw new Error(`#${lo} «${q.question}»: тавзеҳ ба «${cyrRu}» ишора мекунад, ки дар матни нав нест`);
      }
    }
  }
  items.push({ lo, id: c.id, old: c.passage, oldTr: c.pt, text: p.text, tr: p.tr, oldUrl: c.au, questions: qs.length });
}

for (const it of items) {
  console.log(`\n#${it.lo} (${it.questions} савол)\n  буд : ${it.old}\n  шуд : ${it.text}\n  тҷ  : ${it.tr}`);
}
if (DRY || !items.length) { console.log(DRY ? '\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.' : '\nҲама чиз аллакай нав аст.'); process.exit(0); }

// ── Тавлид ва санҷиши маҳаллӣ ────────────────────────────────────────────────
mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/items.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text }))));
// Суръати ПЕШФАРЗ (+0%). Озмоиш (10.09): «-20%» матни 97-ҳарфаи #9-ро 18.3 с
// кард — оҳистатар аз ҳад. Сабаб суръати талаффуз нест, балки таваққуфи
// edge-tts баъди ҳар «.»/«!»: матни нав 7 ҷумлаи кӯтоҳ дорад. Барои ҳамин
// меъёр аз НУТҚИ ВОҚЕӢ (бе таваққуф) ҳисоб мешавад: матни кӯҳнаи #9 28.6
// ҳарф/сонияи нутқ дошт, «+0%» ~23 медиҳад.
console.log('\n' + execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/items.json`, '+0%'],
  { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } }).trim());
const { m: local, err } = check(items.map((i) => `${WORK}/${i.id}.mp3`));
if (/error/i.test(err)) throw new Error(`дешифргар: ${err}`);
let bad = 0;
for (const it of items) {
  const m = local[`${WORK}/${it.id}.mp3`];
  const art = it.text.length / m.speech;
  const ok = m.peak >= 0.2 && m.lead <= 0.5 && art >= 15 && art <= 40 && m.dur <= 20;
  console.log(`  ${ok ? '✓' : '✗'} #${it.lo}: ${m.dur}s (нутқ ${m.speech}s · ${art.toFixed(1)} ҳарф/с нутқ) · пеш=${m.lead}s · peak=${m.peak}`);
  if (!ok) bad++;
  it.md5 = m.md5;
}
if (bad) { console.error('⛔ файли бад — ҳеҷ чиз бор нашуд'); process.exit(1); }

// ── Push ─────────────────────────────────────────────────────────────────────
const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`Клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/ru')) git(['sparse-checkout', 'add', 'audio/ru']);
for (const it of items) copyFileSync(`${WORK}/${it.id}.mp3`, `${REPO}/audio/ru/${it.id}.mp3`);
git(['add', ...items.map((i) => `audio/ru/${i.id}.mp3`)]);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
    'Russian A1 Module 1: re-record 3 passages rewritten with taught vocabulary only']);
  git(['push', 'origin', 'HEAD:main']);
  console.log('push шуд');
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
  await sql`UPDATE "ComprehensionExercise" SET passage=${it.text}, "passageTranslated"=${it.tr}, "audioUrl"=${it.url}
    WHERE id=${it.id} AND passage=${it.old}`;
  const [r] = await sql`SELECT passage,"passageTranslated" pt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${it.id}`;
  if (r.passage !== it.text || r.pt !== it.tr || r.au !== it.url) throw new Error(`ТАСДИҚ НАШУД #${it.lo}`);
  console.log(`✓ #${it.lo} сабт ва тасдиқ шуд`);
}
