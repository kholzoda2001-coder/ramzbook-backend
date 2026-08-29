// Имтиҳони КАЛОНИ ниҳоии «Англисӣ — A1» (Модули 12) — 15 савол аз Модулҳои 1–11.
//
// ДОМАИ БЕХАТАРӢ: `courseCode`/`Vocabulary` дар схема нестанд. Имтиҳон бо
// занҷири Lesson → Module → Course ёфта мешавад ва DELETE/INSERT танҳо ба
// ЯК `exerciseId`-и ёфташуда маҳдуд аст. Скрипт пеш аз кор тафтиш мекунад,
// ки ин exercise воқеан ба A1/Модули 12 тааллуқ дорад — вагарна қатъ мешавад.
//
//   node prisma/build-a1-final-exam.mjs --dry
//   node prisma/build-a1-final-exam.mjs
import { readFileSync, writeFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const A1 = 'cmqkvhu8p0001o5r7nkbeo4jm';   // Англисӣ — A1 (en → tg)
const MODULE_ORDER = 11;                  // Модули 12 (order 0-ро асос)

// 15 савол · ҳар кадом 4 вариант · англисӣ + тоҷикӣ.
// Ҳар 11 модул фаро гирифта шудааст; `mod` танҳо барои гузориш аст.
// `correct` бо МАТН дода мешавад — пас тартиби вариантҳоро бехатар тағйир
// додан мумкин аст ва боги «ҷавоб ҳамеша якум» пайдо намешавад.
const QUESTIONS = [
  { mod: 1, en: 'Translate «Шаб ба хайр»:', tg: '«Шаб ба хайр»-ро тарҷума кунед:',
    opts: ['Good morning', 'Good afternoon', 'Good evening', 'Good night'], correct: 'Good night',
    expl: 'Шаб ба хайр = Good night (Модули 1).' },
  { mod: 1, en: 'Choose the correct verb: My name ___ Karim.', tg: 'Феъли дурустро интихоб кунед: My name ___ Karim.',
    opts: ['am', 'is', 'are', 'be'], correct: 'is',
    expl: 'Бо «My name» (ӯ/он) → is (Модули 1, To Be).' },
  { mod: 2, en: 'Translate «Муҳандис»:', tg: '«Муҳандис»-ро тарҷума кунед:',
    opts: ['Engineer', 'Driver', 'Builder', 'Manager'], correct: 'Engineer',
    expl: 'Муҳандис = Engineer (Модули 2).' },
  { mod: 2, en: 'Choose the correct article: She is ___ engineer.', tg: 'Артикли дурустро интихоб кунед: She is ___ engineer.',
    opts: ['a', 'an', 'the', 'no article'], correct: 'an',
    expl: '«Engineer» бо садоноки e сар мешавад → an (Модули 2).' },
  { mod: 3, en: 'Translate «Ҷиян (Духтар)»:', tg: '«Ҷиян (Духтар)»-ро тарҷума кунед:',
    opts: ['Nephew', 'Cousin', 'Aunt', 'Niece'], correct: 'Niece',
    expl: 'Ҷияни духтар = Niece; ҷияни писар = Nephew (Модули 3).' },
  { mod: 4, en: 'Translate «Панҷшанбе»:', tg: '«Панҷшанбе»-ро тарҷума кунед:',
    opts: ['Thursday', 'Tuesday', 'Wednesday', 'Friday'], correct: 'Thursday',
    expl: 'Панҷшанбе = Thursday (Модули 4).' },
  { mod: 4, en: 'Choose the correct verb: Yesterday we ___ at school.', tg: 'Феъли дурустро интихоб кунед: Yesterday we ___ at school.',
    opts: ['was', 'is', 'were', 'are'], correct: 'were',
    expl: 'Бо We/You/They дар замони гузашта → were (Модули 4).' },
  { mod: 5, en: 'Translate «Шустан»:', tg: '«Шустан»-ро тарҷума кунед:',
    opts: ['Watch', 'Walk', 'Want', 'Wash'], correct: 'Wash',
    expl: 'Шустан = Wash (Модули 5).' },
  { mod: 5, en: 'Choose the correct verb: He ___ breakfast at seven.', tg: 'Феъли дурустро интихоб кунед: He ___ breakfast at seven.',
    opts: ['eat', 'eats', 'eating', 'is eat'], correct: 'eats',
    expl: 'Бо He/She/It дар Present Simple → -s: eats (Модули 5).' },
  { mod: 6, en: 'Choose the correct word: There is not ___ milk in the fridge.', tg: 'Калимаи дурустро интихоб кунед: There is not ___ milk in the fridge.',
    opts: ['any', 'some', 'a', 'the'], correct: 'any',
    expl: 'Дар ҷумлаи инкорӣ → any (Модули 6, Some / Any).' },
  { mod: 7, en: 'Translate «Ошхона»:', tg: '«Ошхона»-ро тарҷума кунед:',
    opts: ['Bathroom', 'Kitchen', 'Bedroom', 'Garden'], correct: 'Kitchen',
    expl: 'Ошхона = Kitchen (Модули 7).' },
  { mod: 8, en: 'Choose the correct question: ___ apples do you want?', tg: 'Саволи дурустро интихоб кунед: ___ apples do you want?',
    opts: ['How much', 'How long', 'How many', 'How old'], correct: 'How many',
    expl: '«Apples» ҳисобшаванда аст → How many (Модули 8).' },
  { mod: 9, en: 'You are looking for the pharmacy. What do you ask?', tg: 'Шумо дорухонаро меҷӯед. Чӣ мепурсед?',
    opts: ['How old are you?', 'What is your name?', 'Excuse me, where is the pharmacy?', 'How much is this?'],
    correct: 'Excuse me, where is the pharmacy?',
    expl: 'Барои пурсидани роҳ: Excuse me, where is …? (Модули 9).' },
  { mod: 10, en: 'Choose the correct form: She ___ a blue dress today.', tg: 'Шакли дурустро интихоб кунед: She ___ a blue dress today.',
    opts: ['is wearing', 'wear', 'wears', 'are wearing'], correct: 'is wearing',
    expl: 'Амали ҳозира → Present Continuous: is + -ing (Модули 10).' },
  { mod: 11, en: 'You have a fever. What do you tell the doctor?', tg: 'Шумо таб доред. Ба духтур чӣ мегӯед?',
    opts: ['I am a doctor.', 'I have got a fever.', 'Nice to meet you.', 'How much is it?'],
    correct: 'I have got a fever.',
    expl: 'Барои шикоят аз беморӣ: I have got a … (Модули 11 + Have got аз Модули 3).' },
];

// ── 1. Имтиҳонро ёфта, тааллуқи онро ТАСДИҚ кардан ────────────────────────
const [ex] = await q(
  `SELECT ce.id, ce.title, ce."titleTranslated", ce."courseId", m."order" mo, l.title ltitle
     FROM "Lesson" l
     JOIN "Module" m ON m.id = l."moduleId"
     JOIN "ComprehensionExercise" ce ON ce.id = l."comprehensionId"
    WHERE m."courseId" = $1 AND m."order" = $2 AND l."skillType" = 'test'`,
  [A1, MODULE_ORDER]);

if (!ex) throw new Error('Имтиҳони ниҳоии A1/Модули 12 ёфт нашуд — қатъ.');
if (ex.courseId !== A1) throw new Error(`Домаи бехатарӣ: exercise ба курси дигар тааллуқ дорад (${ex.courseId}) — қатъ.`);
if (ex.mo !== MODULE_ORDER) throw new Error(`Домаи бехатарӣ: модули нодуруст (${ex.mo}) — қатъ.`);
console.log(`Имтиҳон: «${ex.title}» / «${ex.titleTranslated}» · ${ex.ltitle} · [${ex.id}]`);

// ── 2. Нусхаи эҳтиётӣ пеш аз тоза кардан ──────────────────────────────────
const old = await q(`SELECT * FROM "ComprehensionQuestion" WHERE "exerciseId"=$1 ORDER BY "order"`, [ex.id]);
console.log(`саволҳои ҷорӣ: ${old.length}`);
const backup = new URL('./_backup-a1-m12-exam.json', import.meta.url);
writeFileSync(backup, JSON.stringify({ exerciseId: ex.id, savedAt: new Date().toISOString(), questions: old }, null, 2), 'utf8');
console.log('нусхаи эҳтиётӣ: prisma/_backup-a1-m12-exam.json');

// ── 3. Тафтиши маҷмӯа пеш аз навиштан ─────────────────────────────────────
for (const b of QUESTIONS) {
  if (b.opts.length !== 4) throw new Error(`бояд 4 вариант бошад: ${b.en}`);
  if (new Set(b.opts).size !== 4) throw new Error(`вариантҳои такрорӣ: ${b.en}`);
  if (b.opts.indexOf(b.correct) < 0) throw new Error(`ҷавоби дуруст дар вариантҳо нест: ${b.en}`);
}
const covered = [...new Set(QUESTIONS.map(x => x.mod))].sort((a, b) => a - b);
const spread = {};
QUESTIONS.forEach(b => { const i = b.opts.indexOf(b.correct); spread[i] = (spread[i] || 0) + 1; });
console.log(`\n${QUESTIONS.length} савол · модулҳои фарогирифта: ${covered.join(', ')} (${covered.length}/11)`);
console.log(`тақсими ҷавоби дуруст аз рӯи мавқеъ: ${JSON.stringify(spread)}`);
if (covered.length !== 11) throw new Error('на ҳамаи модулҳои 1–11 фаро гирифта шудаанд — қатъ.');

for (const [i, b] of QUESTIONS.entries())
  console.log(`  [${i}] M${b.mod} ${b.en}  → ${b.correct} (${b.opts.indexOf(b.correct)})`);

// ── 4. Тоза кардан ва навиштан — танҳо барои ҳамин exerciseId ─────────────
if (!DRY) {
  await q(`DELETE FROM "ComprehensionQuestion" WHERE "exerciseId"=$1`, [ex.id]);
  for (const [i, b] of QUESTIONS.entries()) {
    await q(
      `INSERT INTO "ComprehensionQuestion"
         (id, "exerciseId", question, "questionTranslated", options, "correctIndex", explanation, "order")
       VALUES (gen_random_uuid()::text, $1, $2, $3, $4::jsonb, $5, $6, $7)`,
      [ex.id, b.en, b.tg, JSON.stringify(b.opts), b.opts.indexOf(b.correct), b.expl, i]);
  }
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  console.log('\ncontent_version ламс шуд.');
}

// ── 5. Худсанҷӣ ───────────────────────────────────────────────────────────
const now = await q(`SELECT question, options, "correctIndex" ci, "order" FROM "ComprehensionQuestion" WHERE "exerciseId"=$1 ORDER BY "order"`, [ex.id]);
console.log(DRY ? `\n[--dry] ${QUESTIONS.length} савол НАВИШТА МЕШУД (ҳоло ${now.length}).` : `\nҲОЛАТИ БАЪДӢ: ${now.length} савол`);
if (!DRY) {
  const bad = now.filter(r => !Array.isArray(r.options) || r.options.length !== 4 || r.ci < 0 || r.ci > 3);
  console.log(`  ${now.length === 15 ? '✓' : '✗'} 15 савол · ${bad.length === 0 ? '✓' : '✗'} ҳама 4 вариант ва индекси дуруст`);
  console.log('  гузариш: 12/15 = 80% ≥ 75% — СЕ хато иҷозат');
}

// Домаи таъсир: имтиҳонҳои дигар даст нахӯрданд?
const others = await q(
  `SELECT c.level, tl.code, m."order" mo, COUNT(cq.id)::int qn
     FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId" JOIN "Course" c ON c.id=m."courseId"
     JOIN "Language" tl ON tl.id=c."targetLanguageId"
     LEFT JOIN "ComprehensionQuestion" cq ON cq."exerciseId"=l."comprehensionId"
    WHERE l."skillType"='test' AND c."isActive"=true AND l."comprehensionId" <> $1
    GROUP BY c.level, tl.code, m."order", l.id ORDER BY tl.code, c.level, m."order"`, [ex.id]);
const summary = {};
others.forEach(r => { const k = `${r.code}-${r.level}`; (summary[k] ||= []).push(r.qn); });
console.log('\nИмтиҳонҳои ДИГАР (даст нахӯрданд):');
for (const [k, v] of Object.entries(summary)) console.log(`  ${k}: ${v.length} имтиҳон · ${[...new Set(v)].sort().join('/')} савол`);
