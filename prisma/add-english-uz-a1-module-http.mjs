// Ingliz tili A1 (en→uz) — BITTA modulni materializatsiya qilingan JSON'dan bazaga yozadi.
// Manba: prisma/data/en-uz-a1-mNN.json (inglizcha matn + audio URL tojikcha kursdan,
// ona tilidagi qismlar — o'zbekcha tarjima). Idempotent: modul bor bo'lsa o'tkazadi.
//
//   node prisma/add-english-uz-a1-module-http.mjs prisma/data/en-uz-a1-m01.json --dry
//   node prisma/add-english-uz-a1-module-http.mjs prisma/data/en-uz-a1-m01.json
//   node prisma/add-english-uz-a1-module-http.mjs prisma/data/en-uz-a1-m01.json --replace
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const file = process.argv[2];
const DRY = process.argv.includes('--dry');
const REPLACE = process.argv.includes('--replace');
const M = JSON.parse(readFileSync(file, 'utf8'));
const cuid = () => 'c' + [...crypto.getRandomValues(new Uint8Array(12))].map(b => b.toString(36).padStart(2, '0')).join('').slice(0, 24);
const say = (...a) => console.log(...a);
const J = (v) => (v == null ? null : JSON.stringify(v));

const [course] = await sql.query(
  `SELECT c.id FROM "Course" c JOIN "Language" t ON t.id=c."targetLanguageId" JOIN "Language" n ON n.id=c."nativeLanguageId"
    WHERE t.code='en' AND n.code='uz' AND c.level='A1'`);
if (!course) { say('Course en->uz A1 yoq — avval add-english-for-uzbek-http.mjs'); process.exit(1); }
const CID = course.id;

const [exists] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=$2`, [CID, M.module.order]);
if (exists && !REPLACE) { say(`Modul (order=${M.module.order}) bor — o'tkazildi (--replace bilan qayta yoziladi)`); process.exit(0); }

const nW = M.lessons.reduce((a, l) => a + l.words.length, 0);
say(`${exists ? 'QAYTA YOZILADI' : 'Yangi'}: "${M.module.titleTranslated}" — ${M.lessons.length} dars, ${nW} so'z, ${M.grammar.length} grammatika, ${M.dialogues.length} dialog, ${M.phrases.length} ibora to'plami, ${M.comps.length} tushunish`);
if (DRY) { say('--dry: hech narsa yozilmadi.'); process.exit(0); }

if (exists) {
  // Modul (va uning darslari/so'zlari — CASCADE) hamda shu modul yaratgan mavzular.
  for (const g of M.grammar) await sql.query(`DELETE FROM "GrammarTopic" WHERE "courseId"=$1 AND title=$2`, [CID, g.title]);
  for (const d of M.dialogues) await sql.query(`DELETE FROM "Dialogue" WHERE "courseId"=$1 AND title=$2`, [CID, d.title]);
  for (const p of M.phrases) await sql.query(`DELETE FROM "PhraseCollection" WHERE "courseId"=$1 AND title=$2`, [CID, p.title]);
  for (const c of M.comps) await sql.query(`DELETE FROM "ComprehensionExercise" WHERE "courseId"=$1 AND title=$2`, [CID, c.title]);
  await sql.query(`DELETE FROM "Module" WHERE id=$1`, [exists.id]);
}

const gIds = [];
for (const g of M.grammar) {
  const id = cuid(); gIds.push(id);
  await sql.query(
    `INSERT INTO "GrammarTopic" (id,"courseId","cefrLevel",title,"titleTranslated",explanation,emoji,"order","isPremium","isActive")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, CID, g.cefrLevel, g.title, g.titleTranslated, g.explanation, g.emoji, g.order, g.isPremium, g.isActive]);
  for (const e of g.examples) await sql.query(
    `INSERT INTO "GrammarExample" (id,"topicId",sentence,translation,"audioUrl",highlight,"order") VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [cuid(), id, e.sentence, e.translation, e.audioUrl, e.highlight, e.order]);
  for (const r of g.rules) await sql.query(
    `INSERT INTO "GrammarRule" (id,"topicId",pattern,note,"order") VALUES ($1,$2,$3,$4,$5)`,
    [cuid(), id, r.pattern, r.note, r.order]);
  for (const x of g.exercises) await sql.query(
    `INSERT INTO "GrammarExercise" (id,"topicId",type,prompt,"promptTranslated",answer,options,explanation,"audioUrl","order")
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9,$10)`,
    [cuid(), id, x.type, x.prompt, x.promptTranslated, x.answer, J(x.options), x.explanation, x.audioUrl, x.order]);
}

const dIds = [];
for (const d of M.dialogues) {
  const id = cuid(); dIds.push(id);
  await sql.query(
    `INSERT INTO "Dialogue" (id,"courseId","cefrLevel",title,"titleTranslated",scenario,emoji,"order","isPremium","isActive")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, CID, d.cefrLevel, d.title, d.titleTranslated, d.scenario, d.emoji, d.order, d.isPremium, d.isActive]);
  for (const l of d.lines) await sql.query(
    `INSERT INTO "DialogueLine" (id,"dialogueId",speaker,text,translation,"audioUrl","isUser","order") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [cuid(), id, l.speaker, l.text, l.translation, l.audioUrl, l.isUser, l.order]);
}

const pIds = [];
for (const p of M.phrases) {
  const id = cuid(); pIds.push(id);
  await sql.query(
    `INSERT INTO "PhraseCollection" (id,"courseId","cefrLevel",category,title,"titleTranslated",emoji,"order","isPremium","isActive")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
    [id, CID, p.cefrLevel, p.category ?? null, p.title, p.titleTranslated, p.emoji, p.order, p.isPremium, p.isActive]);
  for (const x of p.phrases) await sql.query(
    `INSERT INTO "Phrase" (id,"collectionId",text,translation,literal,note,"audioUrl","order") VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [cuid(), id, x.text, x.translation, x.literal ?? null, x.note ?? null, x.audioUrl, x.order]);
}

const cIds = [];
for (const c of M.comps) {
  const id = cuid(); cIds.push(id);
  await sql.query(
    `INSERT INTO "ComprehensionExercise" (id,"courseId","cefrLevel",kind,title,"titleTranslated",passage,"passageTranslated","audioUrl",emoji,"order","isPremium","isActive")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
    [id, CID, c.cefrLevel, c.kind, c.title, c.titleTranslated, c.passage, c.passageTranslated, c.audioUrl, c.emoji, c.order, c.isPremium, c.isActive]);
  for (const q of c.questions) await sql.query(
    `INSERT INTO "ComprehensionQuestion" (id,"exerciseId",question,"questionTranslated",options,"correctIndex",explanation,"order")
     VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8)`,
    [cuid(), id, q.question, q.questionTranslated, J(q.options), q.correctIndex, q.explanation, q.order]);
}

const mid = cuid();
const m = M.module;
await sql.query(
  `INSERT INTO "Module" (id,"courseId",title,"titleTranslated",emoji,color,"order","isPremium","isBoss","isActive","canDoStatement","contentVersion")
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
  [mid, CID, m.title, m.titleTranslated, m.emoji, m.color, m.order, m.isPremium, m.isBoss, m.isActive, m.canDoStatement, m.contentVersion]);

for (const l of M.lessons) {
  const lid = cuid();
  await sql.query(
    `INSERT INTO "Lesson" (id,"moduleId",title,"titleTranslated",type,"cefrLevel","skillType",emoji,"xpReward",duration,"order","isPremium","isActive",
                           "grammarTopicId","phraseCollectionId","dialogueId","comprehensionId")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
    [lid, mid, l.title, l.titleTranslated, l.type, l.cefrLevel, l.skillType, l.emoji, l.xpReward, l.duration, l.order, l.isPremium, l.isActive,
     l.grammar != null ? gIds[l.grammar] : null, l.phrase != null ? pIds[l.phrase] : null,
     l.dialogue != null ? dIds[l.dialogue] : null, l.comp != null ? cIds[l.comp] : null]);
  for (const w of l.words) await sql.query(
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,ipa,"ipaTajik",example,"exampleTrans","audioUrl",difficulty,"partOfSpeech","frequencyRank","order")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [cuid(), lid, w.word, w.translation, w.emoji, w.ipa, w.ipaTajik, w.example, w.exampleTrans, w.audioUrl, w.difficulty, w.partOfSpeech, w.frequencyRank, w.order]);
}
say('Tayyor.');
