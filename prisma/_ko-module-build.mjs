// Як модули курси TOPIK I (кореягӣ → тоҷикӣ) -ро аз файли мазмун месозад.
//
// Ҳамон роҳи `_de-module-build.mjs`, бо фарқҳои кореягӣ:
//   • модул нав сохта мешавад (курси кореягӣ холӣ буд), на иваз;
//   • хониши тоҷикӣ аз ҲАНГУЛ (`_ko-tajik.mjs`), на аз IPA — ҳамон 7 қоидаи алифбо;
//   • `partOfSpeech` аз файли мазмун (барнома расмро танҳо ба исм нишон медиҳад);
//   • аудио: Google `ko-KR-Chirp3-HD-Despina` (ҳамон овози алифбо ва шиносоӣ),
//     3 такрор → миёна → буриши хомӯшӣ (`_ar-trim.py`);
//   • сатрҳои хонанда дар муколама `isUser`.
// Курс ХОМӮШ мемонад (`isActive` даст нарасонда мешавад) — фаъолкунӣ қарори корбар.
//
// Идемпотент: дарс/грамматика/матн/муколама аз рӯи НОМ ёфта ва навсозӣ мешаванд.
// Пеш аз ҳар навиштан мазмун санҷида мешавад; хато бошад — ҳеҷ чиз навишта намешавад.
//
//   node prisma/_ko-module-build.mjs ./_ko-m1-content.mjs [--dry]
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
import { hangulToTajik, selfTest } from './_ko-tajik.mjs';
import { speakReliable, useTrimOrRaw } from './_ko-tts-google.mjs';

const CONTENT = process.argv[2];
if (!CONTENT) { console.error('Истифода: node prisma/_ko-module-build.mjs ./_ko-m1-content.mjs [--dry]'); process.exit(1); }
const CONTENT_MOD = await import(CONTENT);
const { MODULE, VOCAB, GRAMMAR, COMPREHENSIONS, DIALOGUE, WRITING, ORDER } = CONTENT_MOD;

// Модулҳои 2+ (`KNOWN_FROM` дар файли мазмун): ҳар ҷумла танҳо аз калимаҳои
// омӯхташуда ва қаҳрамонҳо собит (`_ko-coverage.mjs`). Хато бошад — ҳеҷ чиз навишта намешавад.
if (CONTENT_MOD.KNOWN_FROM) {
  const { checkCoverage, checkCharacters } = await import('./_ko-coverage.mjs');
  const prior = await Promise.all(CONTENT_MOD.KNOWN_FROM.map(p => import(p)));
  const probs = [...checkCoverage(CONTENT_MOD, prior), ...checkCharacters(CONTENT_MOD)];
  if (probs.length) {
    console.error(`✗ ${probs.length} мушкил дар луғат/қаҳрамонҳо — ҳеҷ чиз навишта нашуд:`);
    for (const p of probs) console.error('   ' + p);
    process.exit(1);
  }
  console.log(`✓ Луғат: ҳар ҷумла аз калимаҳои омӯхташуда · қаҳрамонҳо собит (${Object.keys(CONTENT_MOD.CHARACTERS ?? {}).length})`);
}

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
// Драйвери HTTP-и Neon аз ин мошин гоҳ-гоҳ «Connect Timeout» медиҳад (2026-09-11:
// иҷро дар нимаи калимаҳо афтод). Танҳо хатои ПАЙВАСТ такрор мешавад — дархост ба
// сервер нарасидааст, пас такрор бехатар аст; хатои SQL фавран мебарояд.
const isNetErr = (e) => /fetch failed|Connect Timeout|ECONNRESET|ETIMEDOUT|UND_ERR/i.test(`${e?.message} ${e?.sourceError?.cause?.code ?? ''} ${e?.cause?.code ?? ''}`);
async function withRetry(fn) {
  for (let a = 0; ; a++) {
    try { return await fn(); } catch (e) {
      if (a >= 4 || !isNetErr(e)) throw e;
      console.log(`  ↻ шабака (${a + 1}/4), такрор…`);
      await new Promise(r => setTimeout(r, 2000 * (a + 1)));
    }
  }
}
const rawSql = neon(env.DATABASE_URL);
const sql = { query: (text, params) => withRetry(() => rawSql.query(text, params)) };
const BASE = 'https://admin.ramz.tj';
const COURSE = 'cmtkb6vgg001lmgnbunb';
const COURSE_TITLE = 'TOPIK I — 1급';
const COURSE_DESC = 'Сатҳи 1-и TOPIK I (стандарти расмии Корея): салом, шиносоӣ, харид, вақт ва ҳаёти ҳаррӯза. Ҳадаф — ~800 калима.';
const VOICE = 'ko-KR-Chirp3-HD-Despina';
const TAKES = 3;
const WORK = `tmp/ko-m${MODULE.order + 1}-audio`;
const DRY = process.argv.includes('--dry');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('4h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };
const api = async (path, method, body) => {
  const res = await withRetry(() => fetch(`${BASE}/api/admin/${path}`, { method, headers: H, body: body === undefined ? undefined : JSON.stringify(body) }));
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
};
const esc = (s) => s.replace(/'/g, "''");

// Ҷойи ҷавоби дуруст барои саволҳои як матн: тақрибан баробар байни мавқеъҳо,
// тартиб аз тухмӣ (устувор байни иҷроҳо), вале ҲЕҶ ГОҲ давраи 0,1,2,0,1,2…,
// се якхела паси ҳам ё ҳамааш дар як ҷо. Пештар `i % options.length` буд — аудити
// 2026-09-11 нишон дод, ки имтиҳонро аз рӯи ҳамин қолаб бе хондан гузаштан мумкин
// аст. Барномаи нав вариантҳоро худаш омехта мекунад, версияҳои кӯҳна не.
/** Оё дар [t] ягон пораи давраи 2 ё 3 ПУРРА ду бор паси ҳам меояд (0,1,0,1 · 2,1,0,2,1,0)? */
export function periodicRun(t) {
  for (const p of [2, 3]) {
    for (let s = 0; s + 2 * p <= t.length; s++) {
      if (new Set(t.slice(s, s + p)).size < 2) continue; // «0,0,0,0» — кори `triple`
      if (t.slice(s, s + p).every((v, k) => v === t[s + p + k])) return true;
    }
  }
  return false;
}

function spreadAnswers(lengths, seed) {
  let x = 2166136261;
  for (const ch of seed) { x ^= ch.codePointAt(0); x = Math.imul(x, 16777619) >>> 0; }
  x = x || 1;
  const rnd = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
  let last = lengths.map((n, i) => i % n);
  for (let attempt = 0; attempt < 200; attempt++) {
    const out = lengths.map((n, i) => i % n);
    for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
    const t = out.map((v, i) => v % lengths[i]);
    const cyclic = t.every((v, i) => v === i % lengths[i]);
    const triple = t.some((v, i) => i >= 2 && v === t[i - 1] && v === t[i - 2]);
    const oneSpot = t.length > 1 && new Set(t).size === 1;
    // Ҳар гуна такрори ПУРРА — на танҳо давраи рост: имтиҳони M5 «2,1,0,2,1,0,0,1» баромад
    // (давраи баръакси 3, ду бор) ва персонаи «алгоритм» онро ёфт (аудити 2026-09-12).
    const periodic = periodicRun(t);
    if (!cyclic && !triple && !oneSpot && !periodic) return t;
    last = t;
  }
  return last;
}

console.log(`✓ Транслитератор: ${selfTest()} худсанҷиш`);

// ── 0. Санҷиши мазмун ПЕШ аз навиштан ───────────────────────────────────────
{
  const P = [];
  const HANGUL = /[가-힣]/;
  for (const l of VOCAB) {
    if (l.words.length < 4) P.push(`«${l.title}»: ${l.words.length} калима (барои 4 вариант кам)`);
    const tr = l.words.map(w => w.translation.trim().toLowerCase());
    if (new Set(tr).size !== tr.length) P.push(`«${l.title}»: тарҷумаи такрорӣ дар як дарс`);
    for (const w of l.words) {
      for (const f of ['word', 'translation', 'emoji', 'pos', 'ipa', 'example', 'exampleTrans'])
        if (!w[f]?.trim()) P.push(`«${w.word}»: ${f} нест`);
      if (!HANGUL.test(w.word)) P.push(`«${w.word}»: ҳангул нест`);
      const core = w.word.replace(/[?!.]/g, '').trim();
      if (!w.example.includes(core)) P.push(`«${w.word}»: мисол худи калимаро надорад`);
      if (!hangulToTajik(w.word)) P.push(`«${w.word}»: хониши тоҷикӣ холӣ баромад`);
    }
  }
  const allWords = VOCAB.flatMap(l => l.words.map(w => w.word));
  for (const c of WRITING.copyOf) if (!allWords.includes(c)) P.push(`навиштан: «${c}» дар модул нест`);
  for (const g of GRAMMAR) {
    if (g.exercises.length < 4) P.push(`«${g.title}»: танҳо ${g.exercises.length} машқ`);
    for (const x of g.exercises) {
      if (new Set(x.options).size !== x.options.length) P.push(`машқи «${x.prompt}»: варианти такрорӣ`);
      if (x.type === 'reorder') {
        // Плиткаҳо бояд АЙНАН калимаҳои ҷавоб бошанд (бе аломати китобат) — вагарна ҷумла сохта намешавад.
        const tokens = x.answer.replace(/[.?!]/g, '').trim().split(/\s+/).sort().join('|');
        if ([...x.options].sort().join('|') !== tokens) P.push(`машқи «${x.promptTranslated}»: плиткаҳо ба ҷавоб рост намеоянд`);
      } else {
        if (!x.options.includes(x.answer)) P.push(`машқи «${x.prompt}»: ҷавоб дар вариантҳо нест`);
        if (!x.prompt.includes('___')) P.push(`машқи «${x.prompt}»: ҷои холӣ (___) нест`);
      }
    }
  }
  for (const c of COMPREHENSIONS) for (const q of c.questions) {
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) P.push(`«${q.question}»: correctIndex нодуруст`);
    if (new Set(q.options).size !== q.options.length) P.push(`«${q.question}»: варианти такрорӣ`);
  }
  if (!DIALOGUE.lines.some(l => l.isUser)) P.push('муколама: сатри хонанда (isUser) нест');
  for (const key of ORDER) {
    const [kind, arg] = key.split(':');
    const ok = kind === 'vocab' ? VOCAB.some(v => v.title === arg)
      : kind === 'grammar' ? !!GRAMMAR[Number(arg)]
      : kind === 'comprehension' ? COMPREHENSIONS.some(c => c.slot === arg)
      : kind === 'dialogue' || kind === 'writing';
    if (!ok) P.push(`ORDER: «${key}» ёфт нашуд`);
  }
  if (P.length) { console.error(`✗ ${P.length} мушкил дар мазмун — ҳеҷ чиз навишта нашуд:`); for (const p of P) console.error('   ' + p); process.exit(1); }
  console.log(`✓ Мазмун: ${VOCAB.length} дарси луғат, ${allWords.length} калима, ${GRAMMAR.length} грамматика, ${COMPREHENSIONS.length} матн, ${DIALOGUE.lines.length} сатри муколама`);
}

if (DRY) {
  console.log('\n== Хониши тоҷикӣ (--dry) ==');
  for (const l of VOCAB) for (const w of l.words) console.log(`  ${w.word.padEnd(12)} → ${hangulToTajik(w.word).padEnd(18)} ${w.translation}`);
  console.log('\n--dry: ба база чизе навишта нашуд.');
  process.exit(0);
}

// ── 1. Курс ва модул ────────────────────────────────────────────────────────
await api(`courses/${COURSE}`, 'PUT', { title: COURSE_TITLE, description: COURSE_DESC });
console.log(`\nКурс: «${COURSE_TITLE}» (хомӯш мемонад)`);
let [module] = await sql.query(`SELECT * FROM "Module" WHERE "courseId"='${COURSE}' AND "order"=${MODULE.order}`);
if (module) {
  await api(`modules/${module.id}`, 'PUT', { title: MODULE.title, titleTranslated: MODULE.titleTranslated, emoji: MODULE.emoji, canDoStatement: MODULE.canDoStatement });
  console.log(`Модул навсозӣ шуд: ${MODULE.title}`);
} else {
  const r = await api('modules', 'POST', { courseId: COURSE, order: MODULE.order, title: MODULE.title,
    titleTranslated: MODULE.titleTranslated, emoji: MODULE.emoji, canDoStatement: MODULE.canDoStatement, color: '#7C3AED' });
  module = r.module;
  // `POST /api/admin/modules` ҳамеша `isActive: true` мегузорад, курс ҳам фаъол аст —
  // бе ин сатр модули санҷиданашуда ҳамон лаҳза ба хонандагон намоён мешуд.
  // Фаъолкунӣ ДАСТӢ, баъди verify ва аудит.
  await api(`modules/${module.id}`, 'PUT', { isActive: false });
  console.log(`Модул сохта шуд (ПИНҲОН — баъди санҷиш фаъол кунед): ${MODULE.title}`);
}

// ── 2. Дарсҳо ───────────────────────────────────────────────────────────────
const oldLessons = await sql.query(`SELECT * FROM "Lesson" WHERE "moduleId"='${module.id}' ORDER BY "order"`);
const lessonByTitle = new Map(oldLessons.map(l => [l.title, l]));
const created = [];
const audioJobs = [];
async function upsertLesson(title, data, order) {
  const cur = lessonByTitle.get(title);
  if (cur) { await api(`lessons/${cur.id}`, 'PUT', { ...data, title, order }); return cur.id; }
  const { lesson } = await api('lessons', 'POST', { moduleId: module.id, title, order, cefrLevel: 'A1', ...data });
  lessonByTitle.set(title, lesson);
  return lesson.id;
}
console.log('\n== Дарсҳо ==');
let order = 0;
for (const key of ORDER) {
  const [kind, arg] = key.split(':');
  if (kind === 'vocab') {
    const v = VOCAB.find(x => x.title === arg);
    const id = await upsertLesson(v.title, { titleTranslated: v.titleTranslated, emoji: v.emoji, skillType: 'vocab', type: 'vocab', xpReward: 15, duration: 5 }, order);
    created.push({ id, vocab: v });
    console.log(`  L${order} [vocab] ${v.title} (${v.words.length})`);
  } else if (kind === 'grammar') {
    const g = GRAMMAR[Number(arg)];
    const id = await upsertLesson(g.lessonTitle, { titleTranslated: g.lessonTitleTranslated, emoji: g.emoji, skillType: 'grammar', type: 'quiz', xpReward: 20, duration: 5 }, order);
    created.push({ id, grammar: g });
    console.log(`  L${order} [grammar] ${g.lessonTitle}`);
  } else if (kind === 'comprehension') {
    const c = COMPREHENSIONS.find(x => x.slot === arg);
    const id = await upsertLesson(c.lessonTitle, { titleTranslated: c.lessonTitleTranslated, emoji: c.emoji, skillType: c.skillType, type: 'quiz', xpReward: c.xpReward, duration: 5 }, order);
    created.push({ id, comprehension: c });
    console.log(`  L${order} [${c.skillType}] ${c.lessonTitle}`);
  } else if (kind === 'dialogue') {
    const id = await upsertLesson(DIALOGUE.lessonTitle, { titleTranslated: DIALOGUE.lessonTitleTranslated, emoji: DIALOGUE.emoji, skillType: 'speaking', type: 'quiz', xpReward: 20, duration: 5 }, order);
    created.push({ id, dialogue: true });
    console.log(`  L${order} [speaking] ${DIALOGUE.lessonTitle}`);
  } else if (kind === 'writing') {
    const id = await upsertLesson(WRITING.title, { titleTranslated: WRITING.titleTranslated, emoji: WRITING.emoji, skillType: 'writing', type: 'vocab', xpReward: 15, duration: 5 }, order);
    created.push({ id, writing: true });
    console.log(`  L${order} [writing] ${WRITING.title}`);
  }
  order++;
}

// ── 3. Калимаҳо ─────────────────────────────────────────────────────────────
console.log('\n== Калимаҳо ==');
let madeWords = 0;
for (const item of created.filter(c => c.vocab)) {
  const have = await sql.query(`SELECT * FROM "Word" WHERE "lessonId"='${item.id}'`);
  const byWord = new Map(have.map(w => [w.word, w]));
  for (const [i, w] of item.vocab.words.entries()) {
    const payload = { lessonId: item.id, word: w.word, translation: w.translation, emoji: w.emoji, ipa: w.ipa,
      ipaTajik: hangulToTajik(w.word), example: w.example, exampleTrans: w.exampleTrans, partOfSpeech: w.pos, order: i };
    const cur = byWord.get(w.word);
    if (cur) {
      await api(`words/${cur.id}`, 'PUT', payload);
      if (!cur.audioUrl) audioJobs.push({ id: cur.id, text: w.word, kind: 'word' });
    } else {
      const { word } = await api('words', 'POST', payload);
      audioJobs.push({ id: word.id, text: w.word, kind: 'word' });
      madeWords++;
    }
  }
}
console.log(`  нав: ${madeWords}`);

// ── 4. Дарси навиштан — нусхаи калимаҳои ҳамин модул ────────────────────────
{
  const item = created.find(c => c.writing);
  const have = new Set((await sql.query(`SELECT word FROM "Word" WHERE "lessonId"='${item.id}'`)).map(r => r.word));
  let n = 0;
  for (const [i, text] of WRITING.copyOf.entries()) {
    if (have.has(text)) {
      // Нусхаи мавҷуда бо сарчашма ҳамвор мешавад — тарҷума/мисол метавонанд иваз
      // шуда бошанд (мас. огоҳии «네 = бале», 2026-09-11). Аудио ҷудо пайваст мешавад.
      await sql.query(`UPDATE "Word" t SET translation=s.translation, emoji=s.emoji, ipa=s.ipa, "ipaTajik"=s."ipaTajik",
          example=s.example, "exampleTrans"=s."exampleTrans", "partOfSpeech"=s."partOfSpeech", "order"=${i}
        FROM "Word" s JOIN "Lesson" sl ON s."lessonId"=sl.id
        WHERE t."lessonId"='${item.id}' AND t.word='${esc(text)}'
          AND sl."moduleId"='${module.id}' AND sl."skillType"='vocab' AND s.word=t.word`);
      continue;
    }
    const [src] = await sql.query(`SELECT w.* FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
      WHERE l."moduleId"='${module.id}' AND l."skillType"='vocab' AND w.word='${esc(text)}' LIMIT 1`);
    await api('words', 'POST', { lessonId: item.id, word: src.word, translation: src.translation, emoji: src.emoji,
      ipa: src.ipa, ipaTajik: src.ipaTajik, example: src.example, exampleTrans: src.exampleTrans,
      partOfSpeech: src.partOfSpeech, audioUrl: src.audioUrl, order: i });
    n++;
  }
  console.log(`  навиштан: ${n} нусха`);
}

// ── 5. Грамматика ───────────────────────────────────────────────────────────
console.log('\n== Грамматика ==');
for (const item of created.filter(c => c.grammar)) {
  const g = item.grammar;
  const [exist] = await sql.query(`SELECT * FROM "GrammarTopic" WHERE "courseId"='${COURSE}' AND title='${esc(g.title)}'`);
  let topicId;
  // Аудиои мисолҳои БЕТАҒЙИР нигоҳ дошта мешавад (аз рӯи матни ҷумла): танҳо
  // ҷумлаи нав ё ивазшуда аз нав сабт мешавад — овози санҷидашуда гум намешавад.
  let keepAudio = new Map();
  // Ҳамин тавр аудиои МАШҚҲО (ҷумлаи дуруст, `_grammar-ex-audio.mjs`): машқҳо нест ва
  // аз нав сохта мешаванд (id-и нав), пас бе ин харита ҳар билди модул аудиоро пок мекард.
  // Калид = навъ + савол + ҷавоб — ҳамон чизе, ки ҷумлаи сабтшуда аз он сохта шудааст.
  const exKey = (x) => `${x.type ?? 'choose'}|${x.prompt}|${x.answer}`;
  let keepExAudio = new Map();
  if (exist) {
    topicId = exist.id;
    keepAudio = new Map((await sql.query(`SELECT sentence, "audioUrl" FROM "GrammarExample"
      WHERE "topicId"='${topicId}' AND "audioUrl" IS NOT NULL AND "audioUrl"<>''`)).map(r => [r.sentence, r.audioUrl]));
    keepExAudio = new Map((await sql.query(`SELECT type, prompt, answer, "audioUrl" FROM "GrammarExercise"
      WHERE "topicId"='${topicId}' AND "audioUrl" IS NOT NULL AND "audioUrl"<>''`)).map(r => [exKey(r), r.audioUrl]));
    await api(`grammar/${topicId}`, 'PUT', { title: g.title, titleTranslated: g.titleTranslated, explanation: g.explanation, emoji: g.emoji });
    for (const [t, table] of [['rules', 'GrammarRule'], ['examples', 'GrammarExample'], ['exercises', 'GrammarExercise']])
      for (const r of await sql.query(`SELECT id FROM "${table}" WHERE "topicId"='${topicId}'`)) await api(`grammar/${t}/${r.id}`, 'DELETE');
  } else {
    const { topic } = await api('grammar', 'POST', { courseId: COURSE, cefrLevel: 'A1', title: g.title, titleTranslated: g.titleTranslated, explanation: g.explanation, emoji: g.emoji });
    topicId = topic.id;
  }
  for (const [i, r] of g.rules.entries()) await api('grammar/rules', 'POST', { topicId, ...r, order: i });
  for (const [i, e] of g.examples.entries()) {
    const { example } = await api('grammar/examples', 'POST', { topicId, ...e, order: i });
    const kept = keepAudio.get(e.sentence);
    if (kept) await sql.query(`UPDATE "GrammarExample" SET "audioUrl"=$1 WHERE id=$2`, [kept, example.id]);
    else audioJobs.push({ id: example.id, text: e.sentence, kind: 'example' });
  }
  let keptEx = 0;
  for (const [i, x] of g.exercises.entries()) {
    const { exercise } = await api('grammar/exercises', 'POST', { topicId, type: 'choose', ...x, order: i });
    const kept = keepExAudio.get(exKey(x));
    if (kept && exercise?.id) { await sql.query(`UPDATE "GrammarExercise" SET "audioUrl"=$1 WHERE id=$2`, [kept, exercise.id]); keptEx++; }
  }
  if (keepExAudio.size) console.log(`    аудиои машқ нигоҳ дошта шуд: ${keptEx}/${g.exercises.length} (нав → prisma/_grammar-ex-audio.mjs)`);
  await api(`lessons/${item.id}`, 'PUT', { linkType: 'grammar', linkId: topicId });
  console.log(`  ✓ ${g.title}: ${g.rules.length} қоида, ${g.examples.length} мисол, ${g.exercises.length} машқ`);
}

// ── 6. Матнҳо ───────────────────────────────────────────────────────────────
console.log('\n== Матнҳо ==');
for (const item of created.filter(c => c.comprehension)) {
  const c = item.comprehension;
  const [exist] = await sql.query(`SELECT * FROM "ComprehensionExercise" WHERE "courseId"='${COURSE}' AND title='${esc(c.title)}'`);
  const payload = { courseId: COURSE, cefrLevel: 'A1', kind: c.kind, title: c.title, titleTranslated: c.titleTranslated,
    passage: c.passage, passageTranslated: c.passageTranslated, emoji: c.emoji };
  let exId;
  if (exist) {
    exId = exist.id;
    await api(`comprehensions/${exId}`, 'PUT', payload);
    for (const q of await sql.query(`SELECT id FROM "ComprehensionQuestion" WHERE "exerciseId"='${exId}'`)) await api(`comprehensions/questions/${q.id}`, 'DELETE');
  } else {
    const r = await api('comprehensions', 'POST', payload);
    exId = (r.exercise ?? r.comprehension ?? r).id;
  }
  // Ҷойи ҷавоб: баробар тақсим, вале БЕ ҚОЛАБ (ниг. `spreadAnswers`).
  const targets = spreadAnswers(c.questions.map(q => q.options.length), c.title);
  for (const [i, q] of c.questions.entries()) {
    const target = targets[i];
    const options = q.options.filter((_, k) => k !== q.correctIndex);
    options.splice(target, 0, q.options[q.correctIndex]);
    await api('comprehensions/questions', 'POST', { exerciseId: exId, ...q, options, correctIndex: target, order: i });
  }
  await api(`lessons/${item.id}`, 'PUT', { linkType: 'comprehension', linkId: exId });
  // Матн иваз шуд → аудиои кӯҳна дигар ба матн рост намеояд, аз нав сабт мешавад.
  if (!exist?.audioUrl || exist.passage !== c.passage) audioJobs.push({ id: exId, text: c.passage, kind: 'passage' });
  console.log(`  ✓ ${c.title} [${c.kind}]: ${c.questions.length} савол`);
}

// ── 7. Муколама ─────────────────────────────────────────────────────────────
console.log('\n== Муколама ==');
{
  const item = created.find(c => c.dialogue);
  const [exist] = await sql.query(`SELECT * FROM "Dialogue" WHERE "courseId"='${COURSE}' AND title='${esc(DIALOGUE.title)}'`);
  const payload = { courseId: COURSE, cefrLevel: 'A1', title: DIALOGUE.title, titleTranslated: DIALOGUE.titleTranslated, scenario: DIALOGUE.scenario, emoji: DIALOGUE.emoji };
  let dId;
  // Аудиои сатрҳои БЕТАҒЙИР нигоҳ дошта мешавад (аз рӯи матн) — ҳамон сабаби мисолҳо.
  let keepLine = new Map();
  if (exist) {
    dId = exist.id;
    keepLine = new Map((await sql.query(`SELECT text, "audioUrl" FROM "DialogueLine"
      WHERE "dialogueId"='${dId}' AND "audioUrl" IS NOT NULL AND "audioUrl"<>''`)).map(r => [r.text, r.audioUrl]));
    await api(`dialogues/${dId}`, 'PUT', payload);
    for (const l of await sql.query(`SELECT id FROM "DialogueLine" WHERE "dialogueId"='${dId}'`)) await api(`dialogues/lines/${l.id}`, 'DELETE');
  } else {
    const r = await api('dialogues', 'POST', payload);
    dId = (r.dialogue ?? r).id;
  }
  for (const [i, l] of DIALOGUE.lines.entries()) {
    const r = await api('dialogues/lines', 'POST', { dialogueId: dId, ...l, order: i });
    const lineId = (r.line ?? r).id;
    const kept = keepLine.get(l.text);
    if (kept) await sql.query(`UPDATE "DialogueLine" SET "audioUrl"=$1 WHERE id=$2`, [kept, lineId]);
    else audioJobs.push({ id: lineId, text: l.text, kind: 'line' });
  }
  await api(`lessons/${item.id}`, 'PUT', { linkType: 'dialogue', linkId: dId });
  console.log(`  ✓ ${DIALOGUE.title}: ${DIALOGUE.lines.length} сатр`);
}

// ── 8. Аудио ────────────────────────────────────────────────────────────────
console.log(`\n== Аудио (${audioJobs.length} клип, ${VOICE}) ==`);
if (audioJobs.length) {
  async function googleTts(text) {
    for (let a = 0; a < 4; a++) {
      const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${env.GOOGLE_TTS_KEY}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: { text }, voice: { languageCode: 'ko-KR', name: VOICE }, audioConfig: { audioEncoding: 'MP3' } }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.audioContent) return Buffer.from(d.audioContent, 'base64');
      if (a === 3) throw new Error(`TTS ${res.status}: ${JSON.stringify(d).slice(0, 160)}`);
      await new Promise(r => setTimeout(r, 1500 * (a + 1)));
    }
  }
  const secOf = (b) => b.length * 8 / 32000; // Chirp3-HD = CBR 32 kbps
  mkdirSync(WORK, { recursive: true });
  let gi = 0;
  await Promise.all(Array.from({ length: 5 }, async () => {
    while (gi < audioJobs.length) {
      const j = audioJobs[gi++];
      // Садои ВОҚЕӢ санҷида мешавад — «миёна аз рӯи дарозӣ» нусхаи хомӯшро
      // интихоб мекард (네, 씨 — 2026-09-11). Ниг. `_ko-tts-google.mjs`.
      const { buf, variant, attempts } = await speakReliable(j.text, { apiKey: env.GOOGLE_TTS_KEY, workDir: WORK });
      if (variant !== 'plain' || attempts > 1) console.log(`  ↻ «${j.text.slice(0, 20)}»: ${variant}, ${attempts} кӯшиш`);
      writeFileSync(`${WORK}/${j.id}.mp3`, buf);
    }
  }));
  const TRIM = `${WORK}-trim`;
  console.log('  ' + execFileSync('python', ['prisma/_ar-trim.py', WORK, TRIM], { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' } }).trim().split('\n').slice(-1)[0]);
  // Пас аз буриш бори дигар: файли хомӯш ҳеҷ гоҳ ба база намеравад.
  const { still: silent, usedRaw } = useTrimOrRaw(audioJobs.map(j => [`${WORK}/${j.id}.mp3`, `${TRIM}/${j.id}.mp3`]));
  if (usedRaw) console.log(`  ${usedRaw} клипи кӯтоҳ бе буриш монд (буриш садоро мехӯрд)`);
  if (silent.length) { console.error('✗ файли хомӯш баъди буриш — ҳеҷ чиз бор нашуд:', silent.join(', ')); process.exit(1); }
  const TABLE = { word: 'Word', example: 'GrammarExample', line: 'DialogueLine', passage: 'ComprehensionExercise' };
  let ok = 0;
  for (const j of audioJobs) {
    const fd = new FormData();
    fd.append('file', new File([readFileSync(`${TRIM}/${j.id}.mp3`)], `ko_m${MODULE.order + 1}_${j.id}.mp3`, { type: 'audio/mpeg' }));
    const up = await withRetry(() => fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd }));
    const body = await up.json().catch(() => ({}));
    if (!up.ok || !body.url) { console.log(`  ✗ ${j.text.slice(0, 30)}: upload ${up.status}`); continue; }
    await sql.query(`UPDATE "${TABLE[j.kind]}" SET "audioUrl"=$1 WHERE id=$2`, [body.url, j.id]);
    ok++;
  }
  console.log(`  сабт шуд: ${ok}/${audioJobs.length}`);
}
// Нусхаҳои дарси навиштан аудиои сарчашмаро мегиранд (сарчашма ҳозир сохта шуд).
const synced = await sql.query(`
  WITH src AS (SELECT w.word, w."audioUrl" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
               WHERE l."moduleId"='${module.id}' AND l."skillType"='vocab' AND w."audioUrl" IS NOT NULL)
  UPDATE "Word" t SET "audioUrl"=src."audioUrl" FROM src, "Lesson" l
  WHERE t."lessonId"=l.id AND l."moduleId"='${module.id}' AND l."skillType"='writing'
    AND t.word=src.word AND (t."audioUrl" IS NULL OR t."audioUrl"='') RETURNING 1`);
if (synced.length) console.log(`  аудиои дарси навиштан пайваст шуд: ${synced.length}`);
// SQL-и мустақим миёнабури `lib/prisma.ts`-ро давр мезанад → версияи кэш дастӣ.
await sql.query(`INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version','"1"',NOW())
                 ON CONFLICT (key) DO UPDATE SET "updatedAt"=NOW()`);
// ...ва версияи БАХШ: танҳо ин телефонҳоро маҷбур мекунад, ки кэши дарсҳоро
// партоянд (`syncModuleVersion`); версияи глобалӣ онро фақат «кӯҳна» қайд мекунад
// ва SWR нусхаи кӯҳнаро як бори дигар нишон медиҳад (ташхиси «аудио нест», 2026-09-11).
const [mv] = await sql.query(`UPDATE "Module" SET "contentVersion"="contentVersion"+1 WHERE id=$1 RETURNING "contentVersion"`, [module.id]);
console.log(`  Module.contentVersion → ${mv.contentVersion}`);

console.log(`\nТамом. Акнун: node prisma/_ko-module-verify.mjs ${MODULE.order}`);
