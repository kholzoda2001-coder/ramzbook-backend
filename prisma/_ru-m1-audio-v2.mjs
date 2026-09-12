// ФАЗАИ 2 — АУДИО ва МУКОЛАМАи Модули 1-и русӣ (A1).
//
// Ду гурӯҳ:
//   1. 4 файли ХОМӮШ (қуллаи садо 0.000–0.035 — хонанда 🔊-ро пахш мекунад ва
//      ҳеҷ чиз намешунавад): «Да» (#0), «Я» (#2), «Да» (#12), «Ты» (#12).
//   2. Муколамаи #10 регистрро омехта мекард: «Здравствуйте» (расмӣ) + «Как
//      тебя зовут?» (ғайрирасмӣ). Ислоҳ: саломи ду сатри аввал → «Привет.»
//      (дар дарси #0 таълим дода шудааст), ва гӯянда «Анна» → «Сара» — ду
//      ҳамсол (Али ва Сара, ҳамон ки дар имтиҳони модул), ки «ты» мегӯянд.
//      «Как вас зовут?»-ро интихоб НАКАРДЕМ: «вас» дар модул таълим дода
//      нашудааст ва дарси #3 маҳз «Тебя»-ро меомӯзонад.
//
// ТАРТИБИ БЕХАТАР: тавлид → санҷиши МАҲАЛЛӢ (агар ягон файл хомӯш/кӯтоҳ бошад,
// ҳеҷ чиз бор намешавад) → push ба `ramz-audio` → сабт бо пини commit (матн ва
// аудиои муколама дар ЯК UPDATE, то ҳеҷ гоҳ аз ҳам ҷудо набошанд) → санҷиши
// ниҳоӣ аз CDN (md5 = файли маҳаллӣ).
//
//   node prisma/_ru-m1-audio-v2.mjs --dry
//   node prisma/_ru-m1-audio-v2.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync } from 'child_process';
import { createHash } from 'crypto';
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';

const sql = connect();
const DRY = process.argv.includes('--dry');
const WORK = 'tmp/ru-m1-audio-v2';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';

// Меъёри файли НАВ (edge-tts): садо бояд воқеӣ бошад.
const MIN_PEAK = 0.2;
const MIN_SPEECH = 0.1;
const MAX_LEAD = 0.5;

const check = (paths) => JSON.parse(execFileSync('python', ['../tools/audio_check.py', ...paths],
  { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 24 }));

// ── 0. Сатрҳо ────────────────────────────────────────────────────────────────
const [M1] = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order" LIMIT 1`;
const lessons = await sql`SELECT id,"order","dialogueId" did FROM "Lesson" WHERE "moduleId"=${M1.id} ORDER BY "order"`;
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));

const SILENT = [[0, 'Да'], [2, 'Я'], [12, 'Да'], [12, 'Ты']];
const items = [];
for (const [lo, ru] of SILENT) {
  const rows = await sql`SELECT id,word,"audioUrl" au FROM "Word" WHERE "lessonId"=${L[lo].id} AND word=${ru}`;
  if (rows.length !== 1) throw new Error(`«${ru}» #${lo}: ${rows.length} сатр`);
  items.push({ table: 'Word', id: rows[0].id, text: rows[0].word, oldUrl: rows[0].au, label: `#${lo} «${ru}»` });
}

const lines = await sql`SELECT id,speaker,text,translation,"isUser" iu,"audioUrl" au,"order"
  FROM "DialogueLine" WHERE "dialogueId"=${L[10].did} ORDER BY "order"`;
if (lines.length !== 8) throw new Error(`Муколама: ${lines.length} сатр (интизор 8)`);
const GREET = lines.slice(0, 2);
for (const g of GREET) {
  if (!['Здравствуйте.', 'Привет.'].includes(g.text)) throw new Error(`Сатри ғайричашмдошт: «${g.text}»`);
  if (g.text === 'Привет.' && g.au && g.au.includes('/audio/ru/') && !g.au.includes('073845b0')) {
    console.log(`  (сатри «${g.speaker}» аллакай «Привет.» ва аудиои нав дорад — гузаронда мешавад)`);
    continue;
  }
  items.push({ table: 'DialogueLine', id: g.id, text: 'Привет.', oldUrl: g.au, label: `#10 ${g.speaker}: «${g.text}» → «Привет.»` });
}

console.log('\n== Чӣ сохта мешавад ==');
for (const it of items) console.log(`  ${it.label}`);
const anna = lines.filter((l) => l.speaker === 'Анна');
console.log(`  гӯянда «Анна» → «Сара»: ${anna.length} сатр`);

// ── 1. Санҷиши файлҳои КӮҲНА (исботи он ки воқеан хомӯшанд) ───────────────
console.log('\n== Файлҳои кӯҳна ==');
const oldM = check(items.filter((i) => i.table === 'Word').map((i) => i.oldUrl));
for (const it of items.filter((i) => i.table === 'Word')) {
  const m = oldM[it.oldUrl];
  console.log(`  ${it.label}: peak=${m.peak} speech=${m.speech}s`);
  if (m.peak >= 0.1) throw new Error(`${it.label} хомӯш НЕСТ (peak ${m.peak}) — чизи дигар иваз шудааст, боздошт`);
}
if (DRY) {
  if (!items.length && !anna.length) console.log('\nҲама чиз аллакай ислоҳ шудааст.');
  console.log('\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.');
  process.exit(0);
}

if (items.length) {
  // ── 2. Тавлид ──────────────────────────────────────────────────────────────
  mkdirSync(WORK, { recursive: true });
  writeFileSync(`${WORK}/items.json`, JSON.stringify(items.map((i) => ({ id: i.id, text: i.text })), null, 1));
  console.log('\n== Тавлид (edge-tts, ru-RU-SvetlanaNeural) ==');
  const out = execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/items.json`],
    { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } });
  console.log(out.trim().split('\n').slice(-1).join('\n'));

  // ── 3. Санҷиши МАҲАЛЛӢ ─────────────────────────────────────────────────────
  console.log('\n== Санҷиши маҳаллӣ ==');
  const localM = check(items.map((i) => `${WORK}/${i.id}.mp3`));
  let bad = 0;
  for (const it of items) {
    const m = localM[`${WORK}/${it.id}.mp3`];
    const ok = m && !m.error && m.peak >= MIN_PEAK && m.speech >= MIN_SPEECH && m.lead <= MAX_LEAD;
    console.log(`  ${ok ? '✓' : '✗'} ${it.label}: ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`);
    if (!ok) bad++;
    it.md5 = m.md5;
  }
  if (bad) { console.error('\n⛔ Файли бад — ҳеҷ чиз бор карда нашуд.'); process.exit(1); }

  // ── 4. Push ────────────────────────────────────────────────────────────────
  console.log('\n== Репои аудио ==');
  const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
  if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`Клони ${REPO} нест ё вайрон аст`);
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
  const sparse = git(['sparse-checkout', 'list']);
  if (!sparse.split('\n').includes('audio/ru')) git(['sparse-checkout', 'add', 'audio/ru']);
  mkdirSync(`${REPO}/audio/ru`, { recursive: true });
  for (const it of items) copyFileSync(`${WORK}/${it.id}.mp3`, `${REPO}/audio/ru/${it.id}.mp3`);
  git(['add', ...items.map((i) => `audio/ru/${i.id}.mp3`)]);
  if (git(['status', '--porcelain']).trim()) {
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
      'Russian A1 Module 1: re-record 4 silent word clips and the informal greeting in the dialogue']);
    git(['push', 'origin', 'HEAD:main']);
    console.log('  push шуд');
  } else console.log('  файлҳо дар репо аллакай ҳамин буданд');
  const sha = git(['rev-parse', 'HEAD']);
  console.log(`  commit: ${sha}`);

  // ── 5. Санҷиш аз CDN ПЕШ аз сабт ──────────────────────────────────────────
  console.log('\n== CDN (пеш аз сабт) ==');
  for (const it of items) it.url = `${CDN}@${sha}/audio/ru/${it.id}.mp3`;
  let cdnBad = 0;
  for (let attempt = 1; attempt <= 6; attempt++) {
    const cdnM = check(items.map((i) => i.url));
    cdnBad = 0;
    for (const it of items) {
      const m = cdnM[it.url];
      if (!m || m.error || m.md5 !== it.md5) cdnBad++;
    }
    if (!cdnBad) break;
    console.log(`  кӯшиши ${attempt}: ${cdnBad} файл ҳанӯз дар CDN нест, интизорӣ…`);
    await new Promise((r) => setTimeout(r, 10000));
  }
  if (cdnBad) { console.error('⛔ CDN файлҳоро айнан барнагардонд — база даст нахӯрд.'); process.exit(1); }
  console.log('  ✓ ҳама файлҳо дар CDN айнан ба файли маҳаллӣ баробаранд (md5)');

  // ── 6. Сабт ───────────────────────────────────────────────────────────────
  console.log('\n== Сабт ==');
  for (const it of items) {
    if (it.table === 'Word') {
      await sql`UPDATE "Word" SET "audioUrl"=${it.url} WHERE id=${it.id}`;
      const [r] = await sql`SELECT "audioUrl" au FROM "Word" WHERE id=${it.id}`;
      if (r.au !== it.url) throw new Error(`ТАСДИҚ НАШУД: ${it.label}`);
    } else {
      // Матн ва аудио дар ЯК UPDATE — ҳеҷ гоҳ «Привет» бо садои «Здравствуйте».
      await sql`UPDATE "DialogueLine" SET text=${it.text}, "audioUrl"=${it.url} WHERE id=${it.id}`;
      const [r] = await sql`SELECT text,"audioUrl" au FROM "DialogueLine" WHERE id=${it.id}`;
      if (r.au !== it.url || r.text !== it.text) throw new Error(`ТАСДИҚ НАШУД: ${it.label}`);
    }
    console.log(`  ✓ ${it.label}`);
  }
}

// ── 7. Гӯянда (аудио надорад) ────────────────────────────────────────────────
if (anna.length) {
  await sql`UPDATE "DialogueLine" SET speaker=${'Сара'} WHERE "dialogueId"=${L[10].did} AND speaker=${'Анна'}`;
  const left = await sql`SELECT count(*)::int n FROM "DialogueLine" WHERE "dialogueId"=${L[10].did} AND speaker=${'Анна'}`;
  if (left[0].n !== 0) throw new Error('Гӯянда иваз нашуд');
  console.log(`  ✓ гӯянда «Анна» → «Сара» (${anna.length} сатр)`);
}

const after = await sql`SELECT speaker,text,"isUser" iu FROM "DialogueLine" WHERE "dialogueId"=${L[10].did} ORDER BY "order"`;
console.log('\n== Муколамаи ниҳоӣ ==');
for (const l of after) console.log(`  ${l.iu ? '[МАН]' : '[   ]'} ${l.speaker}: ${l.text}`);
