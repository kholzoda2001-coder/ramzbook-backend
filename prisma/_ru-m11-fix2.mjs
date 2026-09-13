// МОДУЛИ 11-и РУСӢ (A1) — Фазаи 3: он чи детектори такрорӣ ёфт.
//
//   D1   Д16 матн: «Теперь она здорова.» — «теперь» калимаи тамоман нав (детектор бо М1–М10).
//        «Сейчас» дар Модули 10 омӯзонида шуд → «Сейчас она здорова.» + Q4 «Сара сейчас…».
//        Матн иваз мешавад → сабти нав.
//
//   node prisma/_ru-m11-fix2.mjs           # dry-run
//   node prisma/_ru-m11-fix2.mjs --apply
import { writeFileSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { connect, COURSE_RU_A1, APPLY } from './_ru-fix-lib.mjs';

const sql = connect();
const WORK = 'tmp/ru-m11-fix2';
const REPO = `${process.env.TEMP}/ramz-audio-audio`.replace(/\\/g, '/');
const CDN = 'https://cdn.jsdelivr.net/gh/kholzoda2001-coder/ramz-audio';
const PY = { encoding: 'utf8', env: { ...process.env, PYTHONIOENCODING: 'utf-8', PYTHONUTF8: '1' }, maxBuffer: 1 << 26 };
const check = (paths) => {
  const r = spawnSync('python', ['../tools/audio_check.py', ...paths], PY);
  if (r.status !== 0) throw new Error(r.stderr);
  return JSON.parse(r.stdout);
};

const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const [l] = await sql`SELECT "comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${mods[10].id} AND "order"=15`;
const [c] = await sql`SELECT id,passage,"passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${l.cid}`;
const qs = await sql`SELECT id,question,"questionTranslated" qt FROM "ComprehensionQuestion" WHERE "exerciseId"=${l.cid} ORDER BY "order", id`;

const FROM = 'Теперь она здорова.', TO = 'Сейчас она здорова.';
const Q4 = { old: 'Сара теперь…', question: 'Сара сейчас…' };
if (c.passage.includes(TO) && qs[3]?.question === Q4.question) { console.log('Ҳама чиз аллакай нав.'); process.exit(0); }
if (!c.passage.includes(FROM)) throw new Error(`Д16: матн ғайричашмдошт «${c.passage}»`);
if (qs[3]?.question !== Q4.old) throw new Error(`Д16 Q4: «${qs[3]?.question}»`);
const text = c.passage.replace(FROM, TO);
console.log(`Д16 матн: «${FROM}» → «${TO}»\nД16 Q4: «${Q4.old}» → «${Q4.question}»`);
if (!APPLY) { console.log('--dry: ҳеҷ чиз сохта/бор/сабт нашуд.'); process.exit(0); }

mkdirSync(WORK, { recursive: true });
writeFileSync(`${WORK}/p.json`, JSON.stringify([{ id: c.id, text }]));
console.log(execFileSync('python', ['../tools/ru_tts_passage.py', WORK, `${WORK}/p.json`, '+0%'], PY).trim());
const f = `${WORK}/${c.id}.mp3`;
const m = check([f])[f];
const art = text.length / Math.max(m.speech, 0.01);
const ok = m.peak >= 0.2 && m.peak < 0.99 && m.lead <= 0.5 && art >= 15 && art <= 40 && m.dur <= 30;
console.log(`  ${ok ? '✓' : '✗'} Д16: ${m.dur}s нутқ=${m.speech}s (${art.toFixed(1)} ҳ/с) пеш=${m.lead}s peak=${m.peak}`);
if (!ok) { console.error('⛔ файли бад — бор нашуд'); process.exit(1); }

const git = (a) => execFileSync('git', a, { cwd: REPO, encoding: 'utf8' }).trim();
if (!existsSync(`${REPO}/.git/HEAD`)) throw new Error(`клони ${REPO} нест`);
git(['fetch', '--depth', '1', 'origin', 'main']);
git(['reset', '--hard', 'origin/main']);
copyFileSync(f, `${REPO}/audio/ru/${c.id}.mp3`);
git(['add', `audio/ru/${c.id}.mp3`]);
if (git(['status', '--porcelain']).trim()) {
  git(['-c', 'user.name=RAMZ Content', '-c', 'user.email=help@ramz.tj', 'commit', '-m', 'Russian A1 Module 11: exam passage without untaught word']);
  git(['push', 'origin', 'HEAD:main']);
}
const url = `${CDN}@${git(['rev-parse', 'HEAD'])}/audio/ru/${c.id}.mp3`;
let same = false;
for (let a = 1; a <= 6 && !same; a++) {
  same = check([url])[url]?.md5 === m.md5;
  if (!same) { console.log(`кӯшиши ${a}: CDN ҳанӯз нест…`); await new Promise((r) => setTimeout(r, 10000)); }
}
if (!same) { console.error('⛔ CDN — база даст нахӯрд'); process.exit(1); }

await sql.transaction([
  sql`UPDATE "ComprehensionExercise" SET passage=${text}, "audioUrl"=${url} WHERE id=${c.id} AND passage=${c.passage}`,
  sql`UPDATE "ComprehensionQuestion" SET question=${Q4.question} WHERE id=${qs[3].id} AND question=${Q4.old}`,
]);
const [a] = await sql`SELECT passage,"audioUrl" au FROM "ComprehensionExercise" WHERE id=${c.id}`;
const [aq] = await sql`SELECT question FROM "ComprehensionQuestion" WHERE id=${qs[3].id}`;
if (a.passage !== text || a.au !== url || aq.question !== Q4.question) throw new Error('ТАСДИҚ НАШУД: Д16');
console.log('✅ Д16 матн, аудио ва Q4');
