// Санҷиши як модули курси TOPIK I (кореягӣ) — аз рӯи он чи ХОНАНДА мебинад.
//
// Ҳамон санҷишҳои `_de-module-verify.mjs` (экрани холӣ, аудио, тарҷума, машқҳо)
// + санҷишҳои кореягӣ:
//   • хониши тоҷикии ҳар калима АЙНАН ба `hangulToTajik()` баробар — корти калима
//     набояд ба қоидаҳои алифбо зид бошад;
//   • калима ҳангул дорад, мисол худи калимаро дорад, `partOfSpeech` пур аст;
//   • ҷои ҷавоби дуруст дар матнҳо паҳн аст (барнома онҳоро омехта намекунад);
//   • муколама сатри хонанда (`isUser`) дорад.
//
//   node prisma/_ko-module-verify.mjs [order]
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import { hangulToTajik } from './_ko-tajik.mjs';
import { checkEnergy } from './_ko-tts-google.mjs';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);
const COURSE = 'cmtkb6vgg001lmgnbunb';
const ORDER = Number(process.argv[2] ?? 0);
const HANGUL = /[가-힣]/;

const problems = [];
const P = (m) => problems.push(m);
const urlOk = new Map();
// Ҳар аудиои кушодашаванда баъдтар барои САДОИ ВОҚЕӢ санҷида мешавад: HTTP 200
// хомӯширо нишон намедиҳад (네, 씨 — 2026-09-11).
const audioSeen = new Set();
async function reachable(url) {
  if (!url) return false;
  if (urlOk.has(url)) return urlOk.get(url);
  let ok = false;
  for (let i = 0; i < 3 && !ok; i++) {
    if (i) await new Promise(r => setTimeout(r, 1500));
    try { ok = (await fetch(url, { method: 'HEAD' })).ok; } catch { ok = false; }
  }
  urlOk.set(url, ok);
  if (ok) audioSeen.add(url);
  return ok;
}

const [c] = await q(`SELECT * FROM "Course" WHERE id=$1`, [COURSE]);
const [m] = await q(`SELECT * FROM "Module" WHERE "courseId"=$1 AND "order"=$2`, [COURSE, ORDER]);
if (!m) { console.error(`✗ модули ${ORDER} нест`); process.exit(1); }
console.log(`Курс: ${c.title} · level=${c.level} · isActive=${c.isActive}`);
console.log(`${m.emoji} ${m.title} — ${m.titleTranslated}`);
if (!m.canDoStatement?.trim()) P('модул: canDoStatement нест');

const lessons = await q(`SELECT * FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [m.id]);
if (lessons.length < 14) P(`модул ${lessons.length} дарс дорад (модули 1-и забонҳои дигар 14–15)`);
if (!lessons.map(l => l.order).every((v, i) => v === i)) P(`тартиби дарсҳо пайваста нест`);
const skills = new Set(lessons.map(l => l.skillType));
for (const s of ['vocab', 'grammar', 'reading', 'listening', 'speaking', 'writing', 'review', 'test'])
  if (!skills.has(s)) P(`навъи дарси «${s}» нест`);

let wordCount = 0, audioCount = 0;
const seenWords = new Set();
for (const l of lessons) {
  const words = await q(`SELECT * FROM "Word" WHERE "lessonId"=$1 ORDER BY "order"`, [l.id]);
  const link = l.grammarTopicId ? 'grammar' : l.dialogueId ? 'dialogue' : l.comprehensionId ? 'comprehension' : null;
  let detail = '';
  if (link === 'grammar') {
    const [t] = await q(`SELECT * FROM "GrammarTopic" WHERE id=$1`, [l.grammarTopicId]);
    const [{ r }] = await q(`SELECT COUNT(*)::int r FROM "GrammarRule" WHERE "topicId"=$1`, [t.id]);
    const ex = await q(`SELECT * FROM "GrammarExample" WHERE "topicId"=$1`, [t.id]);
    const xs = await q(`SELECT * FROM "GrammarExercise" WHERE "topicId"=$1`, [t.id]);
    detail = `${r} қоида · ${ex.length} мисол · ${xs.length} машқ`;
    if (!t.explanation?.trim()) P(`«${t.title}»: шарҳ нест`);
    if (ex.length < 3) P(`«${t.title}»: ${ex.length} мисол`);
    if (xs.length < 4) P(`«${t.title}»: ${xs.length} машқ`);
    for (const e of ex) { if (await reachable(e.audioUrl)) audioCount++; else P(`мисоли «${e.sentence}»: аудио нест`); }
    for (const x of xs) {
      const opts = x.options ?? [];
      if (x.type === 'reorder') {
        const tokens = x.answer.replace(/[.?!]/g, '').trim().split(/\s+/).sort().join('|');
        if ([...opts].sort().join('|') !== tokens) P(`машқи «${x.promptTranslated}»: плиткаҳо ба ҷавоб рост намеоянд`);
      } else if (!opts.includes(x.answer)) P(`машқи «${x.prompt}»: ҷавоб дар вариантҳо нест`);
      if (new Set(opts).size !== opts.length) P(`машқи «${x.prompt}»: варианти такрорӣ`);
      if (!x.promptTranslated?.trim()) P(`машқи «${x.prompt}»: тарҷума нест`);
    }
  } else if (link === 'dialogue') {
    const lines = await q(`SELECT * FROM "DialogueLine" WHERE "dialogueId"=$1 ORDER BY "order"`, [l.dialogueId]);
    detail = `${lines.length} сатр · хонанда ${lines.filter(x => x.isUser).length}`;
    if (lines.length < 6) P(`муколама ${lines.length} сатр`);
    if (!lines.some(x => x.isUser)) P('муколама сатри хонанда (isUser) надорад');
    for (const ln of lines) {
      if (!ln.translation?.trim()) P(`сатри «${ln.text}»: тарҷума нест`);
      if (await reachable(ln.audioUrl)) audioCount++; else P(`сатри «${ln.text}»: аудио нест`);
    }
  } else if (link === 'comprehension') {
    const [x] = await q(`SELECT * FROM "ComprehensionExercise" WHERE id=$1`, [l.comprehensionId]);
    const qs = await q(`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId"=$1 ORDER BY "order"`, [x.id]);
    detail = `${x.kind} · ${qs.length} савол`;
    if (!x.passageTranslated?.trim()) P(`матни «${x.title}»: тарҷума нест`);
    if (!HANGUL.test(x.passage)) P(`матни «${x.title}»: ҳангул нест`);
    if (await reachable(x.audioUrl)) audioCount++; else P(`матни «${x.title}»: аудио нест`);
    if (!qs.length) P(`матни «${x.title}»: савол нест`);
    const pos = new Set();
    for (const y of qs) {
      const opts = y.options ?? [];
      if (opts.length < 3) P(`саволи «${y.question}»: ${opts.length} вариант`);
      if (y.correctIndex < 0 || y.correctIndex >= opts.length) P(`саволи «${y.question}»: correctIndex нодуруст`);
      if (new Set(opts).size !== opts.length) P(`саволи «${y.question}»: варианти такрорӣ`);
      if (!y.questionTranslated?.trim()) P(`саволи «${y.question}»: тарҷума нест`);
      pos.add(y.correctIndex);
    }
    if (qs.length >= 3 && pos.size < 2) P(`«${x.title}»: ҷавоби дуруст ҳамеша дар як ҷо`);
    // Давраи 0,1,2,0,1,2… низ қолаб аст: версияҳои кӯҳнаи барнома вариантҳоро
    // омехта намекунанд ва имтиҳонро бе хондан гузаштан мумкин буд (аудит 2026-09-11).
    if (qs.length >= 2 && qs.every((y, i) => y.correctIndex === i % Math.max(1, (y.options ?? []).length)))
      P(`«${x.title}»: ҷойи ҷавоб давра мезанад (0,1,2,…) — пешгӯишаванда`);
    // Такрори ПУРРАИ пораи давраи 2 ё 3 (0,1,0,1 · 2,1,0,2,1,0) ҳам — аудити M5 (2026-09-12):
    // имтиҳон «2,1,0,2,1,0,0,1» буд, ва санҷиши боло онро намедид.
    {
      const t = qs.map(y => y.correctIndex);
      const run = [2, 3].some(p => t.some((_, s) => s + 2 * p <= t.length && new Set(t.slice(s, s + p)).size > 1
        && t.slice(s, s + p).every((v, k) => v === t[s + p + k])));
      if (run) P(`«${x.title}»: ҷойи ҷавоб такрор мешавад (${t.join(',')}) — пешгӯишаванда`);
    }
  } else if (words.length) {
    detail = `${words.length} калима`;
    if (words.length < 4) P(`«${l.title}»: ${words.length} калима`);
    const tr = words.map(w => w.translation.trim().toLowerCase());
    if (new Set(tr).size !== tr.length) P(`«${l.title}»: тарҷумаи такрорӣ дар як дарс`);
    for (const w of words) {
      const miss = ['translation', 'ipa', 'ipaTajik', 'example', 'exampleTrans', 'emoji', 'partOfSpeech'].filter(f => !w[f]?.trim());
      if (miss.length) P(`«${w.word}»: ${miss.join(', ')} нест`);
      if (!HANGUL.test(w.word)) P(`«${w.word}»: ҳангул нест`);
      if (w.ipaTajik && w.ipaTajik !== hangulToTajik(w.word)) P(`«${w.word}»: хониш «${w.ipaTajik}» ≠ транслитератор «${hangulToTajik(w.word)}»`);
      const core = w.word.replace(/[?!.]/g, '').trim();
      if (w.example && !w.example.includes(core)) P(`«${w.word}»: мисол калимаро надорад`);
      if (await reachable(w.audioUrl)) audioCount++; else P(`«${w.word}»: аудио нест`);
      if (l.skillType === 'vocab') seenWords.add(w.word);
      wordCount++;
    }
  } else {
    P(`дарси «${l.title}»: на калима, на пайванд — экрани холӣ`);
  }
  console.log(`L${String(l.order).padStart(2)} [${l.skillType.padEnd(9)}] ${l.emoji} ${l.title.padEnd(16)} ${detail}`);
}

{
  const dir = 'tmp/ko-verify-audio';
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const files = [];
  for (const [i, url] of [...audioSeen].entries()) {
    const f = `${dir}/${i}.mp3`;
    writeFileSync(f, Buffer.from(await (await fetch(url)).arrayBuffer()));
    files.push([f, url]);
  }
  const silent = new Set(checkEnergy(files.map(x => x[0])));
  for (const [f, url] of files) if (silent.has(f)) P(`аудио ХОМӮШ (HTTP 200, вале садо нест): ${url.split('/').pop()}`);
  console.log(`Садои воқеӣ: ${files.length - silent.size}/${files.length} файл`);
}
console.log(`\nКалимаҳои нав: ${seenWords.size} · ҳамаи қаторҳои калима: ${wordCount} · аудиои зинда: ${audioCount}`);
console.log('─'.repeat(60));
if (!problems.length) console.log('✓ Ҳеҷ мушкил ёфт нашуд.');
else { console.log(`${problems.length} мушкил:`); for (const p of problems) console.log(`  • ${p}`); process.exitCode = 1; }
