// Модули 1-и олмониро аз рӯи `_de-m1-content.mjs` месозад.
//
// Идемпотентӣ: дарсҳо аз рӯи НОМ пайдо мешаванд, грамматика/матн/муколама аз
// рӯи ном. Такрор иҷро кардан хатарнок нест — чизи мавҷуд навсозӣ мешавад.
//
// Калимаҳои мавҷуда КӮЧОНИДА мешаванд, на аз нав сохта: онҳо аудио ва хониши
// тоҷикӣ доранд ва id-и файли аудио ба id-и калима вобаста аст.
//
//   node prisma/_de-m1-build.mjs [--dry]
import { SignJWT } from 'jose';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { execFileSync } from 'child_process';
import { neon } from '@neondatabase/serverless';
import { ipaToTajik, selfTest } from './_de-tajik.mjs';
const CONTENT = process.argv[2];
if (!CONTENT) { console.error('Истифода: node prisma/_de-module-build.mjs ./_de-m2-content.mjs [--dry]'); process.exit(1); }
const { MODULE, VOCAB, GRAMMAR, COMPREHENSIONS, DIALOGUE, WRITING, ORDER } = await import(CONTENT);

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const BASE = 'https://admin.ramz.tj';
const COURSE = 'cmqdhwb5q00021z597df2767m';
const WORK = `tmp/de-m${MODULE.order + 1}-audio`;
const DRY = process.argv.includes('--dry');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('4h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

const api = async (path, method, body) => {
  const res = await fetch(`${BASE}/api/admin/${path}`, {
    method, headers: H, body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : {};
};

console.log(`✓ Транслитератор: ${selfTest()} худсанҷиш`);

// ── Модул ───────────────────────────────────────────────────────────────────
const [module] = await sql.query(`SELECT * FROM "Module" WHERE "courseId"='${COURSE}' AND "order"=${MODULE.order}`);
console.log(`\nМодул: ${module.title} → ${MODULE.title}`);
if (!DRY) await api(`modules/${module.id}`, 'PUT', { title: MODULE.title, titleTranslated: MODULE.titleTranslated, emoji: MODULE.emoji });

// ── Ҳолати ҳозира ───────────────────────────────────────────────────────────
const oldLessons = await sql.query(`SELECT * FROM "Lesson" WHERE "moduleId"='${module.id}' ORDER BY "order"`);
const allWords = await sql.query(
  `SELECT w.*, l."moduleId" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
   JOIN "Module" m ON l."moduleId"=m.id WHERE m."courseId"='${COURSE}'`);
const wordByText = new Map(allWords.map(w => [w.word, w]));
console.log(`Дарсҳои ҳозира: ${oldLessons.length} · калимаҳо дар курс: ${allWords.length}`);

// Ҳар калимаи `existing` бояд воқеан вуҷуд дошта бошад — вагарна аз нав
// сохтанаш аудиои тайёрро партофта, дубора тавлид карданро талаб мекунад.
{
  const missing = VOCAB.flatMap(l => l.words).filter(w => w.existing && !wordByText.has(w.word));
  if (missing.length) { console.error('✗ Ин калимаҳо «existing» гуфта шудаанд, вале дар курс нестанд:', missing.map(m => m.word).join(', ')); process.exit(1); }
  const newOnes = VOCAB.flatMap(l => l.words).filter(w => !w.existing && wordByText.has(w.word));
  if (newOnes.length) { console.error('✗ Ин калимаҳо нав гуфта шудаанд, вале аллакай ҳастанд:', newOnes.map(m => m.word).join(', ')); process.exit(1); }
}

// ── Дарсҳо ──────────────────────────────────────────────────────────────────
const lessonByTitle = new Map(oldLessons.map(l => [l.title, l]));
const created = [];   // {key, id, title}
const audioJobs = []; // {id, text, kind}

async function upsertLesson(title, data, order) {
  const cur = lessonByTitle.get(title);
  if (cur) {
    if (!DRY) await api(`lessons/${cur.id}`, 'PUT', { ...data, title, order });
    return cur.id;
  }
  if (DRY) return `dry-${title}`;
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
    const id = await upsertLesson(v.title, {
      titleTranslated: v.titleTranslated, emoji: v.emoji, skillType: 'vocab',
      type: 'vocab', xpReward: 15, duration: 5,
    }, order);
    created.push({ key, id, title: v.title, vocab: v });
    console.log(`  L${order} [vocab] ${v.title} (${v.words.length} калима)`);
  }

  else if (kind === 'grammar') {
    const g = GRAMMAR[Number(arg)];
    const id = await upsertLesson(g.lessonTitle, {
      titleTranslated: g.lessonTitleTranslated, emoji: g.emoji, skillType: 'grammar',
      type: 'quiz', xpReward: 20, duration: 5,
    }, order);
    created.push({ key, id, title: g.lessonTitle, grammar: g });
    console.log(`  L${order} [grammar] ${g.lessonTitle}`);
  }

  else if (kind === 'comprehension') {
    const c = COMPREHENSIONS.find(x => x.slot === arg);
    const id = await upsertLesson(c.lessonTitle, {
      titleTranslated: c.lessonTitleTranslated, emoji: c.emoji, skillType: c.skillType,
      type: 'quiz', xpReward: c.xpReward, duration: 5,
    }, order);
    created.push({ key, id, title: c.lessonTitle, comprehension: c });
    console.log(`  L${order} [${c.skillType}] ${c.lessonTitle} (${c.questions.length} савол)`);
  }

  else if (kind === 'dialogue') {
    const id = await upsertLesson(DIALOGUE.lessonTitle, {
      titleTranslated: DIALOGUE.lessonTitleTranslated, emoji: DIALOGUE.emoji, skillType: 'speaking',
      type: 'quiz', xpReward: 20, duration: 5,
    }, order);
    created.push({ key, id, title: DIALOGUE.lessonTitle, dialogue: DIALOGUE });
    console.log(`  L${order} [speaking] ${DIALOGUE.lessonTitle} (${DIALOGUE.lines.length} сатр)`);
  }

  else if (kind === 'writing') {
    const id = await upsertLesson(WRITING.title, {
      titleTranslated: WRITING.titleTranslated, emoji: WRITING.emoji, skillType: 'writing',
      type: 'vocab', xpReward: 15, duration: 5,
    }, order);
    created.push({ key, id, title: WRITING.title, writing: WRITING });
    console.log(`  L${order} [writing] ${WRITING.title} (${WRITING.copyOf.length} калима)`);
  }
  order++;
}

// ── Калимаҳо ────────────────────────────────────────────────────────────────
console.log('\n== Калимаҳо ==');
let moved = 0, madeWords = 0;
for (const item of created.filter(c => c.vocab)) {
  let i = 0;
  for (const w of item.vocab.words) {
    if (w.existing) {
      const cur = wordByText.get(w.word);
      if (!DRY && (cur.lessonId !== item.id || cur.order !== i)) {
        await api(`words/${cur.id}`, 'PUT', { lessonId: item.id, order: i });
        moved++;
      }
    } else {
      const tajik = ipaToTajik(w.ipa);
      if (!DRY) {
        const { word } = await api('words', 'POST', {
          lessonId: item.id, word: w.word, translation: w.translation, emoji: w.emoji,
          ipa: w.ipa, ipaTajik: tajik, example: w.example, exampleTrans: w.exampleTrans, order: i,
        });
        audioJobs.push({ id: word.id, text: w.word, kind: 'word' });
        madeWords++;
      } else {
        console.log(`    нав: ${w.word.padEnd(18)} ${w.ipa.padEnd(20)} → ${tajik}`);
      }
    }
    i++;
  }
}
console.log(`  кӯчонида шуд: ${moved} · нав сохта шуд: ${madeWords}`);

// ── Дарси навиштан: нусхаи калимаҳои ҳамин модул ────────────────────────────
{
  const item = created.find(c => c.writing);
  const rows = DRY ? [] : await sql.query(`SELECT * FROM "Word" WHERE "lessonId"='${item.id}'`);
  const have = new Set(rows.map(r => r.word));
  let i = 0, n = 0;
  for (const wordText of WRITING.copyOf) {
    if (have.has(wordText)) { i++; continue; }
    // Сарчашма метавонад дар ҳамин иҷро сохта шуда бошад.
    const src = wordByText.get(wordText)
      ?? (DRY ? null : (await sql.query(`SELECT * FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
           WHERE l."moduleId"='${module.id}' AND w.word='${wordText.replace(/'/g, "''")}' LIMIT 1`))[0]);
    if (!src) { console.log(`  ⚠ ${wordText}: сарчашма ёфт нашуд`); i++; continue; }
    if (!DRY) {
      await api('words', 'POST', {
        lessonId: item.id, word: src.word, translation: src.translation, emoji: src.emoji,
        ipa: src.ipa, ipaTajik: src.ipaTajik, example: src.example, exampleTrans: src.exampleTrans,
        audioUrl: src.audioUrl, order: i,
      });
      n++;
    }
    i++;
  }
  console.log(`  дарси навиштан: ${n} нусха сохта шуд`);
}

// ── Грамматика ──────────────────────────────────────────────────────────────
console.log('\n== Грамматика ==');
for (const item of created.filter(c => c.grammar)) {
  const g = item.grammar;
  const [exist] = DRY ? [] : await sql.query(
    `SELECT * FROM "GrammarTopic" WHERE "courseId"='${COURSE}' AND title='${g.title.replace(/'/g, "''")}'`);
  let topicId;
  if (exist) {
    topicId = exist.id;
    await api(`grammar/${topicId}`, 'PUT', { title: g.title, titleTranslated: g.titleTranslated, explanation: g.explanation, emoji: g.emoji });
    // Мисол/қоида/машқро аз нав месозем — то такрор нашаванд.
    for (const t of ['rules', 'examples', 'exercises']) {
      const table = { rules: 'GrammarRule', examples: 'GrammarExample', exercises: 'GrammarExercise' }[t];
      const rows = await sql.query(`SELECT id FROM "${table}" WHERE "topicId"='${topicId}'`);
      for (const r of rows) await api(`grammar/${t}/${r.id}`, 'DELETE');
    }
  } else if (!DRY) {
    const { topic } = await api('grammar', 'POST', {
      courseId: COURSE, cefrLevel: 'A1', title: g.title, titleTranslated: g.titleTranslated,
      explanation: g.explanation, emoji: g.emoji,
    });
    topicId = topic.id;
  }
  if (DRY) { console.log(`  ${g.title}: ${g.rules.length} қоида, ${g.examples.length} мисол, ${g.exercises.length} машқ`); continue; }

  for (const [i, r] of g.rules.entries()) await api('grammar/rules', 'POST', { topicId, ...r, order: i });
  for (const [i, e] of g.examples.entries()) {
    const { example } = await api('grammar/examples', 'POST', { topicId, ...e, order: i });
    audioJobs.push({ id: example.id, text: e.sentence, kind: 'example' });
  }
  for (const [i, x] of g.exercises.entries()) await api('grammar/exercises', 'POST', { topicId, type: 'choose', ...x, order: i });
  await api(`lessons/${item.id}`, 'PUT', { linkType: 'grammar', linkId: topicId });
  console.log(`  ✓ ${g.title}: ${g.rules.length} қоида, ${g.examples.length} мисол, ${g.exercises.length} машқ`);
}

// ── Матнҳо ──────────────────────────────────────────────────────────────────
console.log('\n== Матнҳо ==');
for (const item of created.filter(c => c.comprehension)) {
  const c = item.comprehension;
  const [exist] = DRY ? [] : await sql.query(
    `SELECT * FROM "ComprehensionExercise" WHERE "courseId"='${COURSE}' AND title='${c.title.replace(/'/g, "''")}'`);
  let exId;
  const payload = {
    courseId: COURSE, cefrLevel: 'A1', kind: c.kind, title: c.title, titleTranslated: c.titleTranslated,
    passage: c.passage, passageTranslated: c.passageTranslated, emoji: c.emoji,
  };
  if (exist) {
    exId = exist.id;
    await api(`comprehensions/${exId}`, 'PUT', payload);
    const qs = await sql.query(`SELECT id FROM "ComprehensionQuestion" WHERE "exerciseId"='${exId}'`);
    for (const q of qs) await api(`comprehensions/questions/${q.id}`, 'DELETE');
  } else if (!DRY) {
    const r = await api('comprehensions', 'POST', payload);
    exId = (r.exercise ?? r.comprehension ?? r).id;
  }
  if (DRY) { console.log(`  ${c.title} [${c.kind}]: ${c.questions.length} савол`); continue; }
  for (const [i, q] of c.questions.entries()) {
    // Барнома вариантҳои ин саволҳоро омехта НАМЕКУНАД (машқи грамматика ва
    // сатҳсанҷӣ `stableShuffle` доранд, ин ҷо не). Дар файли мазмун ҷавоб
    // табиатан якум навишта мешавад — агар ҳамон тавр монад, хонанда дар ду
    // дарс мефаҳмад ва дигар намехонад. Пас ҷои ҷавобро ҳатмӣ паҳн мекунем.
    const target = i % q.options.length;
    const rest = q.options.filter((_, k) => k !== q.correctIndex);
    const options = [...rest];
    options.splice(target, 0, q.options[q.correctIndex]);
    await api('comprehensions/questions', 'POST',
      { exerciseId: exId, ...q, options, correctIndex: target, order: i });
  }
  await api(`lessons/${item.id}`, 'PUT', { linkType: 'comprehension', linkId: exId });
  audioJobs.push({ id: exId, text: c.passage, kind: 'passage' });
  console.log(`  ✓ ${c.title} [${c.kind}]: ${c.questions.length} савол`);
}

// ── Муколама ────────────────────────────────────────────────────────────────
console.log('\n== Муколама ==');
{
  const item = created.find(c => c.dialogue);
  const [exist] = DRY ? [] : await sql.query(
    `SELECT * FROM "Dialogue" WHERE "courseId"='${COURSE}' AND title='${DIALOGUE.title.replace(/'/g, "''")}'`);
  let dId;
  const payload = {
    courseId: COURSE, cefrLevel: 'A1', title: DIALOGUE.title, titleTranslated: DIALOGUE.titleTranslated,
    scenario: DIALOGUE.scenario, emoji: DIALOGUE.emoji,
  };
  if (exist) {
    dId = exist.id;
    await api(`dialogues/${dId}`, 'PUT', payload);
    const ls = await sql.query(`SELECT id FROM "DialogueLine" WHERE "dialogueId"='${dId}'`);
    for (const l of ls) await api(`dialogues/lines/${l.id}`, 'DELETE');
  } else if (!DRY) {
    const r = await api('dialogues', 'POST', payload);
    dId = (r.dialogue ?? r).id;
  }
  if (!DRY) {
    for (const [i, l] of DIALOGUE.lines.entries()) {
      const r = await api('dialogues/lines', 'POST', { dialogueId: dId, ...l, order: i });
      const line = r.line ?? r;
      audioJobs.push({ id: line.id, text: l.text, kind: 'line' });
    }
    await api(`lessons/${item.id}`, 'PUT', { linkType: 'dialogue', linkId: dId });
  }
  console.log(`  ✓ ${DIALOGUE.title}: ${DIALOGUE.lines.length} сатр`);
}

// ── Дарсҳои кӯҳнаи холӣ ─────────────────────────────────────────────────────
console.log('\n== Тозакунӣ ==');
if (!DRY) {
  const keep = new Set(created.map(c => c.id));
  for (const l of oldLessons) {
    if (keep.has(l.id)) continue;
    const [{ c }] = await sql.query(`SELECT COUNT(*)::int c FROM "Word" WHERE "lessonId"='${l.id}'`);
    if (c > 0) { console.log(`  ⚠ «${l.title}» ҳанӯз ${c} калима дорад — даст нарасид`); continue; }
    await api(`lessons/${l.id}`, 'DELETE');
    console.log(`  ✓ дарси холии «${l.title}» ҳазф шуд`);
  }
}

// ── Аудио ───────────────────────────────────────────────────────────────────
console.log(`\n== Аудио ==`);
if (!DRY && audioJobs.length) {
  mkdirSync(WORK, { recursive: true });
  writeFileSync(`${WORK}/items.json`, JSON.stringify(audioJobs.map(j => ({ id: j.id, text: j.text })), null, 1));
  const out = execFileSync('python', ['prisma/_de-tts.py', WORK, `${WORK}/items.json`],
    { encoding: 'utf8', env: { ...process.env, PYTHONUTF8: '1' }, maxBuffer: 1 << 24 });
  console.log('  ' + out.trim().split('\n').slice(-1)[0]);

  const TABLE = { word: 'Word', example: 'GrammarExample', line: 'DialogueLine', passage: 'ComprehensionExercise' };
  let ok = 0;
  for (const j of audioJobs) {
    const buf = readFileSync(`${WORK}/${j.id}.mp3`);
    const fd = new FormData();
    fd.append('file', new File([buf], `de_m1_${j.id}.mp3`, { type: 'audio/mpeg' }));
    const up = await fetch(`${BASE}/api/admin/upload`, { method: 'POST', headers: { Cookie: `admin_token=${token}` }, body: fd });
    const body = await up.json();
    if (!up.ok || !body.url) { console.log(`  ✗ ${j.text.slice(0, 30)}: upload ${up.status}`); continue; }
    await sql.query(`UPDATE "${TABLE[j.kind]}" SET "audioUrl"='${body.url}' WHERE id='${j.id}'`);
    ok++;
  }
  // Дарси навиштан калимаҳои модулро такрор мекунад ва нусхаҳо ҳангоми сохта
  // шудан аудиои сарчашмаро гирифтанд — вале сарчашмаҳои НАВ он лаҳза ҳанӯз
  // аудио надоштанд (он маҳз ҳозир сохта шуд). Акнун онро мекашем.
  const [{ n: synced }] = await sql.query(`
    WITH src AS (
      SELECT w.word, w."audioUrl" FROM "Word" w JOIN "Lesson" l ON w."lessonId"=l.id
      WHERE l."moduleId"='${module.id}' AND l."skillType" <> 'writing' AND w."audioUrl" IS NOT NULL
    )
    UPDATE "Word" t SET "audioUrl" = src."audioUrl"
    FROM src, "Lesson" l
    WHERE t."lessonId" = l.id AND l."moduleId"='${module.id}' AND l."skillType"='writing'
      AND t.word = src.word AND (t."audioUrl" IS NULL OR t."audioUrl"='')
    RETURNING 1 AS n`).then(r => [{ n: r.length }]);
  if (synced) console.log(`  аудиои дарси навиштан пайваст шуд: ${synced}`);

  // Навиштани мустақими SQL миёнабури `lib/prisma.ts`-ро давр мезанад.
  await sql.query(`INSERT INTO "AppSetting" (key, "valueJson", "updatedAt") VALUES ('content_version','"1"',NOW())
                   ON CONFLICT (key) DO UPDATE SET "updatedAt"=NOW()`);
  console.log(`  сабт шуд: ${ok}/${audioJobs.length}`);
} else console.log(`  ${audioJobs.length} файл лозим`);

// Калимаи нав бе `partOfSpeech` сохта мешавад, вале барнома расмро ТАНҲО ба
// исм нишон медиҳад (`_showIntroPhoto`) — пас таснифгарро худи ҳамин ҷо
// мегузаронем, вагарна расмҳои модул ҳеҷ гоҳ намоён намешаванд.
if (!DRY) {
  console.log('\n== Ҳиссаи нутқ ==');
  console.log('  ' + execFileSync('node', ['prisma/_de-pos.mjs'], { encoding: 'utf8', maxBuffer: 1 << 24 })
    .trim().split('\n').slice(-1)[0]);
}

console.log(`\nТамом. Акнун \`node prisma/_de-module-verify.mjs ${MODULE.order}\` -ро иҷро кунед.`);
