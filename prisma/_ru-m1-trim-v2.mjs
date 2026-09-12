// ФАЗАИ 3 — хомӯшии АВВАЛИ аудиоҳои Модули 1-и русӣ (A1).
//
// Партияи кӯҳна (commit 073845b0, 32 kbps) пеш аз нутқ медианаи 0.56 с ва то
// 1.02 с хомӯшӣ дорад: 26 аз 61 файл > 0.7 с. Плеери барнома seek намекунад,
// пас ҳар пахши 🔊 қариб як сония бе садо мемонад.
//
// `tools/mp3_trim_lead.py` фреймҳои хомӯши аввалро мепартояд (бе рамзгузории
// дубора — овоз айнан ҳамон) ва натиҷаро аз нав дешифр карда месанҷад: дарозии
// нутқ, қулла, «клик» дар хомӯшӣ ва шакли лифофаи энергия (corr ≥ 0.98). Файли
// аз санҷиш нагузашта ДАСТ НАМЕХӮРАД.
//
// Файлҳои НАВ (edge-tts, commit f19d1e5) аллакай ~0.22 с доранд — дохил нестанд.
//
//   node prisma/_ru-m1-trim-v2.mjs --dry
//   node prisma/_ru-m1-trim-v2.mjs
import { writeFileSync, mkdirSync, existsSync, copyFileSync, unlinkSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';

const sql = connect();
const DRY = process.argv.includes('--dry');
const WORK = 'tmp/ru-m1-trim-v2';
const LEGACY = '@073845b098356a4f10d7a7e75d0b5e461ceff28a/';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const TABLES = new Set(['Word', 'GrammarExample', 'DialogueLine', 'ComprehensionExercise']);

const [M1] = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order" LIMIT 1`;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"dialogueId" did,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${M1.id} ORDER BY "order"`;
const lids = lessons.map((l) => l.id);
const gids = lessons.map((l) => l.gid).filter(Boolean);
const dids = lessons.map((l) => l.did).filter(Boolean);
const cids = lessons.map((l) => l.cid).filter(Boolean);

const rows = [
  ...(await sql`SELECT 'Word' t,id,word txt,"audioUrl" au FROM "Word" WHERE "lessonId"=ANY(${lids})`),
  ...(await sql`SELECT 'GrammarExample' t,id,sentence txt,"audioUrl" au FROM "GrammarExample" WHERE "topicId"=ANY(${gids})`),
  ...(await sql`SELECT 'DialogueLine' t,id,text txt,"audioUrl" au FROM "DialogueLine" WHERE "dialogueId"=ANY(${dids})`),
  ...(await sql`SELECT 'ComprehensionExercise' t,id,passage txt,"audioUrl" au FROM "ComprehensionExercise" WHERE id=ANY(${cids})`),
];
const items = rows.filter((r) => r.au && r.au.includes(LEGACY));
console.log(`Ҳамаи аудиоҳои модул: ${rows.length} · аз партияи кӯҳна: ${items.length}`);

// ── 1. Зеркашӣ ва буридан ────────────────────────────────────────────────────
mkdirSync(`${WORK}/in`, { recursive: true });
mkdirSync(`${WORK}/out`, { recursive: true });
const report = [];
for (const it of items) {
  const res = await fetch(it.au);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${it.au}`);
  const inP = `${WORK}/in/${it.id}.mp3`;
  writeFileSync(inP, Buffer.from(await res.arrayBuffer()));
  const outP = `${WORK}/out/${it.id}.mp3`;
  if (existsSync(outP)) unlinkSync(outP);
  const run = spawnSync('python', ['../tools/mp3_trim_lead.py', inP, outP],
    { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
  if (run.status !== 0) throw new Error(`mp3_trim_lead.py: ${run.stderr}`);
  const r = JSON.parse(run.stdout.trim().split('\n').pop());
  if (r.action === 'trimmed') {
    // Санҷиши СЕЮМ, мустақил: файли навро дар раванди ҷудогона дешифр мекунем ва
    // ҳар паёми хатои libmpg123 (масалан «part2_3_length too large» — нишонаи
    // буриши нотоза) файлро рад мекунад.
    const chk = spawnSync('python', ['../tools/audio_check.py', outP],
      { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });
    if (chk.status !== 0 || /error/i.test(chk.stderr)) {
      r.action = 'reject';
      r.why = `дешифргар хато дод: ${(chk.stderr.match(/error:[^\n]*/i) || [chk.stderr.slice(0, 80)])[0]}`;
      unlinkSync(outP);
    }
  }
  report.push({ ...it, r });
}

const trimmed = report.filter((x) => x.r.action === 'trimmed');
console.log('\n  навъ                  матн                             пеш→баъд    муддат');
for (const x of report.sort((a, b) => (b.r.lead_before ?? b.r.lead ?? 0) - (a.r.lead_before ?? a.r.lead ?? 0))) {
  const t = x.txt.slice(0, 30).padEnd(31);
  if (x.r.action === 'trimmed') {
    console.log(`  ✂ ${x.t.padEnd(20)} ${t} ${x.r.lead_before.toFixed(2)}→${x.r.lead_after.toFixed(2)}s  ${x.r.dur_before.toFixed(2)}→${x.r.dur_after.toFixed(2)}s`);
  } else {
    console.log(`  ${x.r.action === 'skip' ? '·' : '✗'} ${x.t.padEnd(20)} ${t} ${x.r.why}`);
  }
}
const rejected = report.filter((x) => x.r.action === 'reject');
console.log(`\nбурида мешавад: ${trimmed.length} · кофӣ кӯтоҳ: ${report.filter((x) => x.r.action === 'skip').length} · РАД: ${rejected.length}`);
writeFileSync(`${WORK}/report.json`, JSON.stringify(report, null, 1));
if (DRY || !trimmed.length) {
  console.log(DRY ? '\n--dry: ҳеҷ чиз бор/сабт нашуд.' : '\nЧизе барои буридан нест.');
  process.exit(0);
}

// ── 2. Push ──────────────────────────────────────────────────────────────────
const git = (args) => execFileSync('git', args, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`Клони ${REPO} нест ё вайрон аст`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
if (!git(['sparse-checkout', 'list']).split('\n').includes('audio/ru')) git(['sparse-checkout', 'add', 'audio/ru']);
for (const x of trimmed) copyFileSync(`${WORK}/out/${x.id}.mp3`, `${REPO}/audio/ru/${x.id}.mp3`);
git(['add', ...trimmed.map((x) => `audio/ru/${x.id}.mp3`)]);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m',
    `Russian A1 Module 1: trim leading silence from ${trimmed.length} clips (frame-exact, no re-encode)`]);
  git(['push', 'origin', 'HEAD:main']);
  console.log('\npush шуд');
}
const sha = git(['rev-parse', 'HEAD']);
console.log(`commit: ${sha}`);

// ── 3. CDN — md5 бояд айнан ба файли маҳаллӣ баробар бошад ─────────────────
for (const x of trimmed) x.url = `${CDN}@${sha}/audio/ru/${x.id}.mp3`;
const md5 = (p) => JSON.parse(execFileSync('python', ['../tools/audio_check.py', ...p],
  { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8' }, maxBuffer: 1 << 26 }));
const local = md5(trimmed.map((x) => `${WORK}/out/${x.id}.mp3`));
let bad = 0;
for (let attempt = 1; attempt <= 6; attempt++) {
  const cdn = md5(trimmed.map((x) => x.url));
  bad = trimmed.filter((x) => cdn[x.url]?.md5 !== local[`${WORK}/out/${x.id}.mp3`].md5).length;
  if (!bad) break;
  console.log(`кӯшиши ${attempt}: ${bad} файл ҳанӯз дар CDN нест…`);
  await new Promise((r) => setTimeout(r, 10000));
}
if (bad) { console.error('⛔ CDN файлҳоро айнан барнагардонд — база даст нахӯрд.'); process.exit(1); }
console.log(`✓ ${trimmed.length} файл дар CDN айнан ба файли маҳаллӣ баробаранд`);

// ── 4. Сабт ──────────────────────────────────────────────────────────────────
for (const x of trimmed) {
  if (!TABLES.has(x.t)) throw new Error(`ҷадвали ношинос ${x.t}`);
  await sql.query(`UPDATE "${x.t}" SET "audioUrl"=$1 WHERE id=$2 AND "audioUrl"=$3`, [x.url, x.id, x.au]);
  const [r] = await sql.query(`SELECT "audioUrl" au FROM "${x.t}" WHERE id=$1`, [x.id]);
  if (r.au !== x.url) throw new Error(`ТАСДИҚ НАШУД: ${x.t} ${x.id}`);
}
console.log(`✓ ${trimmed.length} истинод сабт ва тасдиқ шуд`);
