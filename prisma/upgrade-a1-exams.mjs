// Барои имтиҳонҳои кӯтоҳи A1 — ҳар кадом дақиқан 8 савол.
//
// Чаро 8: сатҳи гузариш kLessonPassMark = 75% (lesson_stage.dart:88).
// 6/8 = 75% — яъне маҳз ДУ хато иҷозат дода мешавад. Дар имтиҳони 3-саволӣ
// 2/3 = 67% меафтад, пас ягон хато ҳам мумкин набуд.
//
// Скрипт IDEMPOTENT аст: шумораи ҳозираро мехонад ва танҳо камбудро пур
// мекунад. Агар аллакай 8 бошад — ҳеҷ чиз намедарорад.
//
//   node prisma/upgrade-a1-exams.mjs --dry
//   node prisma/upgrade-a1-exams.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
// Prisma аз ин мошин ба Neon намерасад (TCP 5432 баста) — драйвери HTTP.
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const DRY = process.argv.includes('--dry');
const TARGET = 8;
const COURSE = 'cmqkvhu8p0001o5r7nkbeo4jm'; // Англисӣ — A1 (en → tg)
const MODULES = [3, 4];                     // Module 4 ва Module 5 (order 0-ро асос)

// Захираи саволҳо барои ҳар модул — ба матни воқеии имтиҳон вобаста.
// Ҳар яке 4 вариант, ҷавоби дуруст бо матн (на бо рақам) дода мешавад, то
// тартиб дар ин ҷо бехатар тағйир ёбад.
const BANK = {
  3: [ // Module 4 · «Sam’s Day» — рақамҳо, рӯзҳо, вақт
    { en: 'When is Sam’s birthday?', tg: 'Зодрӯзи Сэм кай аст?',
      opts: ['In June', 'In July', 'In January', 'In May'], correct: 'In June',
      expl: 'Дар матн: «My birthday is in June.»' },
    { en: 'What time does Sam get up?', tg: 'Сэм соати чанд бармехезад?',
      opts: ['At six', 'At seven', 'At eight', 'At nine'], correct: 'At seven',
      expl: 'Дар матн: «I get up at seven o’clock.»' },
    { en: 'On which day is Sam free?', tg: 'Сэм кадом рӯз озод аст?',
      opts: ['Monday', 'Wednesday', 'Friday', 'Sunday'], correct: 'Friday',
      expl: 'Дар матн: «On Friday I am free.»' },
    { en: 'Translate «Понздаҳ»:', tg: 'Тарҷума кунед.',
      opts: ['Five', 'Fourteen', 'Fifteen', 'Fifty'], correct: 'Fifteen',
      expl: 'Понздаҳ = Fifteen.' },
    { en: 'Translate «Ҷумъа»:', tg: 'Тарҷума кунед.',
      opts: ['Monday', 'Sunday', 'Saturday', 'Friday'], correct: 'Friday',
      expl: 'Ҷумъа = Friday.' },
  ],
  4: [ // Module 5 · «Karim’s Morning» — феълҳо, корҳои рӯзмарра
    { en: 'What does Karim do first in the morning?', tg: 'Карим саҳарӣ аввал чӣ кор мекунад?',
      opts: ['He gets up', 'He goes to school', 'He watches TV', 'He reads a book'], correct: 'He gets up',
      expl: 'Дар матн: «He gets up at six o’clock.»' },
    { en: 'Who does Karim watch TV with?', tg: 'Карим бо кӣ телевизор тамошо мекунад?',
      opts: ['With his teacher', 'With his family', 'Alone', 'With his friends'], correct: 'With his family',
      expl: 'Дар матн: «he watches TV with his family».' },
    { en: 'What can Karim do?', tg: 'Карим чӣ кор карда метавонад?',
      opts: ['Swim', 'Drive', 'Play football', 'Cook'], correct: 'Play football',
      expl: 'Дар матн: «He can play football, but he cannot swim.»' },
    { en: 'Choose the correct verb: She ___ TV in the evening.', tg: 'Феъли дурустро интихоб кунед.',
      opts: ['watching', 'is watch', 'watches', 'watch'], correct: 'watches',
      expl: 'Бо He/She/It → watches.' },
    { en: 'Translate «Хоб рафтан»:', tg: 'Тарҷума кунед.',
      opts: ['Wake up', 'Have lunch', 'Go to work', 'Go to bed'], correct: 'Go to bed',
      expl: 'Хоб рафтан = Go to bed.' },
  ],
};

const norm = s => s.replace(/[«»'’"]/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
let inserted = 0;

for (const mo of MODULES) {
  const [ex] = await q(
    `SELECT ce.id, ce.title, ce.passage, m."order" mo, l.title ltitle
       FROM "Lesson" l
       JOIN "Module" m ON m.id = l."moduleId"
       JOIN "ComprehensionExercise" ce ON ce.id = l."comprehensionId"
      WHERE m."courseId" = $1 AND m."order" = $2 AND l."skillType" = 'test'`,
    [COURSE, mo]);
  if (!ex) { console.log(`⚠ Модули ${mo + 1}: имтиҳон ёфт нашуд`); continue; }

  const have = await q(`SELECT question, "order" FROM "ComprehensionQuestion" WHERE "exerciseId"=$1 ORDER BY "order"`, [ex.id]);
  console.log(`\n── Модули ${mo + 1} · «${ex.title}» (${ex.id})`);
  console.log(`   матн: ${ex.passage.slice(0, 90)}…`);
  console.log(`   саволҳо: ${have.length} / ${TARGET}`);

  const need = TARGET - have.length;
  if (need <= 0) { console.log(`   ✓ аллакай ${have.length} — тағйир лозим нест`); continue; }

  const seen = new Set(have.map(h => norm(h.question)));
  const add = BANK[mo].filter(b => !seen.has(norm(b.en))).slice(0, need);
  if (add.length < need) console.log(`   ⚠ дар захира танҳо ${add.length} саволи нав ҳаст, ${need} лозим`);

  let order = have.length ? Math.max(...have.map(h => h.order)) + 1 : 0;
  for (const b of add) {
    const ci = b.opts.indexOf(b.correct);
    if (ci < 0) throw new Error(`ҷавоби дуруст дар вариантҳо нест: ${b.en}`);
    console.log(`   + [${order}] ${b.en}  → ${b.correct} (${ci})`);
    if (!DRY) {
      await q(
        `INSERT INTO "ComprehensionQuestion"
           (id, "exerciseId", question, "questionTranslated", options, "correctIndex", explanation, "order")
         VALUES (gen_random_uuid()::text, $1, $2, $3, $4::jsonb, $5, $6, $7)`,
        [ex.id, b.en, b.tg, JSON.stringify(b.opts), ci, b.expl, order]);
    }
    order++; inserted++;
  }
}

if (!DRY && inserted) {
  await q(`UPDATE "AppSetting" SET "updatedAt"=NOW() WHERE key='content_version'`);
  console.log('\ncontent_version ламс шуд (кэши муштариён нав мешавад).');
}

// Худсанҷӣ — ҳамеша, ҳатто вақте ки чизе илова нашуд.
console.log(DRY ? `\n[--dry] ${inserted} савол ИЛОВА МЕШУД.` : `\n${inserted} савол илова шуд.`);
const check = await q(
  `SELECT m."order" mo, COUNT(cq.id)::int qn
     FROM "Lesson" l JOIN "Module" m ON m.id = l."moduleId"
     LEFT JOIN "ComprehensionQuestion" cq ON cq."exerciseId" = l."comprehensionId"
    WHERE m."courseId" = $1 AND l."skillType" = 'test'
    GROUP BY m."order", l.id ORDER BY m."order"`, [COURSE]);
const bad = check.filter(r => r.qn !== TARGET);
console.log(`ҳолати ниҳоӣ: ${check.map(r => `M${r.mo + 1}=${r.qn}`).join(' ')}`);
console.log(bad.length ? `✗ ${bad.length} имтиҳон ба ${TARGET} нарасид` : `✓ ҳар ${check.length} имтиҳони A1 дақиқан ${TARGET} савол дорад (6/8 = 75%, ду хато иҷозат)`);
