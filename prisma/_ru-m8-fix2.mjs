// МОДУЛИ 8-и РУСӢ (A1) — Фазаи 3: он чи санҷиши зинда (`_ru-m8-live.mjs`) ва детектори такрорӣ ёфтанд.
//
//   C6   Д6: «Платье» ва «Юбка» ҳарду 👗. «Юбка» 🎀 мегирад — эмоҷии манъ дар `_kPickBlockedEmojis`,
//        пас рафтори «Ин чист?» айнан ҳамон мемонад (пеш аз ин ҳам бо сабаби такрор хомӯш буд);
//        корти калима акси доманро нишон медиҳад.
//   A1   Д7 «Сок»: 0.08 с нутқ пас аз 0.92 с хомӯшӣ — амалан шунида намешавад → сабти нав.
//   D1   Д14 Q3: варианти «Очень» — калимаи наомӯхта → вариантҳо аз худи матн.
//   D1   Д18 матн: «Это дёшево» (зарфи наомӯхта) → «Хлеб дешёвый» (калимаи корти Д9) → сабти нав.
//
//   node prisma/_ru-m8-fix2.mjs           # dry-run
//   node prisma/_ru-m8-fix2.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m8-fix2';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const OLD_SHA = 'e05ed2b8c5af9fba6245e1d07e91872d1bbdf25b';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const check = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths], PY);
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout);
};

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${mods[7].id} ORDER BY "order"`;
if (lessons.length !== 18) throw new Error(`Модули 8: ${lessons.length} дарс`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
let todo = 0;

// ── C6 · Юбка ──
const [yu] = await sql`SELECT id,emoji FROM "Word" WHERE "lessonId"=${L[5].id} AND word='Юбка'`;
if (!yu) throw new Error('Д6 «Юбка» нест');
const yuDo = yu.emoji !== '🎀';
if (yuDo) { todo++; console.log(`Д6 «Юбка».emoji: ${yu.emoji} → 🎀`); }

// ── A1 · Сок ──
const sok = await sql`SELECT id,word,"audioUrl" au FROM "Word" WHERE "lessonId"=${L[6].id} AND word='Сок'`;
if (sok.length !== 1) throw new Error(`Д7 «Сок»: ${sok.length}`);
const sokDo = sok[0].au.includes(OLD_SHA);
if (sokDo) { todo++; console.log('Д7 «Сок»: аудиои қариб хомӯш → сабти нав'); }

// ── D1 · Д14 Q3 ──
const Q3 = { old: ['Очень', 'Да', 'Нет'], options: ['Да, дорого', 'Нет, не дорого', 'Это дорогая куртка'], ci: 1 };
const q14 = await sql`SELECT id,question,options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE "exerciseId"=${L[13].cid} ORDER BY "order", id`;
if (q14[2]?.question !== 'Это дорого?') throw new Error(`Д14 Q3: «${q14[2]?.question}»`);
const [p14] = await sql`SELECT passage FROM "ComprehensionExercise" WHERE id=${L[13].cid}`;
if (!p14.passage.includes('Это не дорого.')) throw new Error('Д14: матн ғайричашмдошт');
const q3Do = JSON.stringify(q14[2].options) !== JSON.stringify(Q3.options);
if (q3Do) {
  if (JSON.stringify(q14[2].options) !== JSON.stringify(Q3.old)) throw new Error(`Д14 Q3 вариантҳо: ${JSON.stringify(q14[2].options)}`);
  todo++;
  console.log(`Д14 Q3 вариантҳо: ${JSON.stringify(Q3.old)} → ${JSON.stringify(Q3.options)} (ҷавоб «${Q3.options[Q3.ci]}»)`);
}

// ── D1 · Д18 матн ──
const P18 = {
  fromText: 'Продавец говорит: «Это дёшево».', toText: 'Продавец говорит: «Хлеб дешёвый».',
  fromTr: 'Фурӯшанда мегӯяд: «Ин арзон аст».', toTr: 'Фурӯшанда мегӯяд: «Нон арзон аст».',
};
const [c18] = await sql`SELECT id,passage,"passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${L[17].cid}`;
let p18 = null;
if (!c18.passage.includes(P18.toText)) {
  if (!c18.passage.includes(P18.fromText) || !c18.pt.includes(P18.fromTr)) throw new Error('Д18: матн ғайричашмдошт');
  p18 = { id: c18.id, old: c18.passage, text: c18.passage.replace(P18.fromText, P18.toText), tr: c18.pt.replace(P18.fromTr, P18.toTr) };
  todo++;
  console.log(`Д18 матн: «${P18.fromText}» → «${P18.toText}» (сабти нав)`);
}

if (!todo) { console.log('Ҳама чиз аллакай нав.'); process.exit(0); }
if (!APPLY) { console.log('\n--dry: ҳеҷ чиз сохта/бор/сабт нашуд.'); process.exit(0); }

// ── аудио: тавлид → санҷиш → як commit → md5-и CDN ──
mkdirSync(WORK, { recursive: true });
const files = [];
if (p18) {
  writeFileSync(`${WORK}/p.json`, JSON.stringify([{ id: p18.id, text: p18.text }]));
  console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
  files.push({ id: p18.id, text: p18.text, passage: true });
}
if (sokDo) {
  writeFileSync(`${WORK}/s.json`, JSON.stringify([{ id: sok[0].id, text: 'Сок' }]));
  console.log(execFileSync('python', ['prisma/_ru-tts.py', WORK, `${WORK}/s.json`], PY).trim());
  files.push({ id: sok[0].id, text: 'Сок', passage: false });
}
if (files.length) {
  const local = check(files.map((f) => `${WORK}/${f.id}.mp3`));
  for (const f of files) {
    const m = local[`${WORK}/${f.id}.mp3`];
    const art = f.text.length / Math.max(m.speech, 0.01);
    // Калимаи 3-ҳарфа табиатан ~0.12–0.2 с садои баланд дорад (ниг. `_grammar-ex-audio.mjs`).
    const ok = f.passage
      ? m.peak >= 0.2 && m.peak < 0.99 && m.lead <= 0.5 && art >= 15 && art <= 40 && m.dur <= 30
      : m.peak >= 0.2 && m.peak < 0.99 && m.lead <= 0.5 && m.speech >= 0.12;
    console.log(`  ${ok ? '✓' : '✗'} «${f.text.slice(0, 30)}»: ${m.dur}s нутқ=${m.speech}s пеш=${m.lead}s peak=${m.peak}`);
    if (!ok) { console.error('⛔ файли бад — ҳеҷ чиз бор нашуд'); process.exit(1); }
    f.md5 = m.md5;
  }
  const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
  if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
  git(['fetch', '--depth', '1', 'origin', 'main']);
  git(['reset', '--hard', 'origin/main']);
  for (const f of files) copyFileSync(`${WORK}/${f.id}.mp3`, `${REPO}/audio/ru/${f.id}.mp3`);
  git(['add', ...files.map((f) => `audio/ru/${f.id}.mp3`)]);
  if (git(['status', '--porcelain']).trim()) {
    git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m', 'Russian A1 Module 8: re-record near-silent word and exam passage']);
    git(['push', 'origin', 'HEAD:main']);
  }
  const sha = git(['rev-parse', 'HEAD']);
  for (const f of files) f.url = `${CDN}@${sha}/audio/ru/${f.id}.mp3`;
  let bad = files.length;
  for (let a = 1; a <= 6 && bad; a++) {
    const m = check(files.map((f) => f.url));
    bad = files.filter((f) => m[f.url]?.md5 !== f.md5).length;
    if (bad) { console.log(`кӯшиши ${a}: ${bad} дар CDN ҳанӯз нест…`); await new Promise((r) => setTimeout(r, 10000)); }
  }
  if (bad) { console.error('⛔ CDN — база даст нахӯрд'); process.exit(1); }
  console.log(`✓ CDN @${sha.slice(0, 7)}: md5 айнан баробар`);
}
const urlOf = Object.fromEntries(files.map((f) => [f.id, f.url]));

if (yuDo) {
  await sql`UPDATE "Word" SET emoji='🎀' WHERE id=${yu.id}`;
  const [a] = await sql`SELECT emoji FROM "Word" WHERE id=${yu.id}`;
  if (a.emoji !== '🎀') throw new Error('ТАСДИҚ НАШУД: Юбка');
  console.log('✅ Д6 «Юбка» 🎀');
}
if (sokDo) {
  await sql`UPDATE "Word" SET "audioUrl"=${urlOf[sok[0].id]} WHERE id=${sok[0].id} AND word='Сок'`;
  const [a] = await sql`SELECT "audioUrl" au FROM "Word" WHERE id=${sok[0].id}`;
  if (a.au !== urlOf[sok[0].id]) throw new Error('ТАСДИҚ НАШУД: Сок');
  console.log('✅ Д7 «Сок» — аудиои нав');
}
if (q3Do) {
  await sql`UPDATE "ComprehensionQuestion" SET options=${JSON.stringify(Q3.options)}::jsonb, "correctIndex"=${Q3.ci} WHERE id=${q14[2].id}`;
  const [a] = await sql`SELECT options,"correctIndex" ci FROM "ComprehensionQuestion" WHERE id=${q14[2].id}`;
  if (JSON.stringify(a.options) !== JSON.stringify(Q3.options) || a.ci !== Q3.ci) throw new Error('ТАСДИҚ НАШУД: Д14 Q3');
  console.log('✅ Д14 Q3 вариантҳо');
}
if (p18) {
  await sql`UPDATE "ComprehensionExercise" SET passage=${p18.text}, "passageTranslated"=${p18.tr}, "audioUrl"=${urlOf[p18.id]} WHERE id=${p18.id} AND passage=${p18.old}`;
  const [a] = await sql`SELECT passage,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${p18.id}`;
  if (a.passage !== p18.text || a.au !== urlOf[p18.id]) throw new Error('ТАСДИҚ НАШУД: Д18');
  console.log('✅ Д18 матн ва аудио');
}
