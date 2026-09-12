// МОДУЛИ 6 — ислоҳи 2: се калимае, ки ХУДИ ислоҳи ман овард (детектори баъдӣ нишон дод).
//
//   Д12 Q2: «Какой напиток…» — «напиток» ҳеҷ гоҳ омӯзонида нашудааст (танҳо унвони дарс «Напитки»).
//   Д17 Q1: «Чего у них нет?» — «чего» (шакли саволии родительный) омӯзонида нашудааст.
//   Д17 Q3: варианти «Яйца и сыр» — «яйца» шакли ҷамъ аст, дарс «Яйцо»-ро медиҳад.
//
//   node prisma/_ru-m6-fix2.mjs           # dry-run
//   node prisma/_ru-m6-fix2.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 6 — ислоҳи 2');
const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","comprehensionId" cid FROM "Lesson" WHERE "moduleId"=${mods[5].id} ORDER BY "order"`;
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
let changed = 0, already = 0;

async function setQ(cid, idx, oldQ, want, label, passage) {
  const qs = await sql`SELECT id,question FROM "ComprehensionQuestion" WHERE "exerciseId"=${cid} ORDER BY "order", id`;
  const q = qs[idx];
  if (![oldQ, want.question].includes(q.question)) throw new Error(`${label}: «${q.question}»`);
  // ҷавоби дуруст бояд дар матн бошад ва калиди он дар вариантҳои нодуруст набошад
  const key = want.key, right = want.options[want.correctIndex].toLowerCase();
  if (!right.includes(key) || !passage.toLowerCase().includes(key)) throw new Error(`${label}: калиди «${key}» дар ҷавоб/матн нест`);
  if (want.options.some((o, j) => j !== want.correctIndex && o.toLowerCase().includes(key))) throw new Error(`${label}: калид дар варианти нодуруст`);
  const cols = ['question', 'questionTranslated', 'options', 'correctIndex', 'explanation'];
  const [have] = await sql`SELECT question,"questionTranslated" "questionTranslated",options,"correctIndex" "correctIndex",explanation FROM "ComprehensionQuestion" WHERE id=${q.id}`;
  const same = cols.every((c) => JSON.stringify(have[c]) === JSON.stringify(want[c]));
  if (same) { already++; return; }
  console.log(`  • ${label}\n      «${have.question}» → «${want.question}»\n      вариантҳо: ${JSON.stringify(have.options)} → ${JSON.stringify(want.options)}`);
  changed++;
  if (!APPLY) return;
  await sql`UPDATE "ComprehensionQuestion" SET question=${want.question}, "questionTranslated"=${want.questionTranslated},
    options=${JSON.stringify(want.options)}::jsonb, "correctIndex"=${want.correctIndex}, explanation=${want.explanation} WHERE id=${q.id}`;
  const [a] = await sql`SELECT question,options,"correctIndex" "correctIndex" FROM "ComprehensionQuestion" WHERE id=${q.id}`;
  if (a.question !== want.question || a.correctIndex !== want.correctIndex) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}

const [d12] = await sql`SELECT passage FROM "ComprehensionExercise" WHERE id=${L[11].cid}`;
await setQ(L[11].cid, 1, 'Какой напиток он не любит?', {
  question: 'Что он не любит?', questionTranslated: 'Ӯ чиро дӯст намедорад?',
  options: ['Чай', 'Сок', 'Кофе'], correctIndex: 2, key: 'кофе',
  explanation: 'Дар матн: «Я пью чай, но не люблю кофе» — қаҳваро дӯст намедорад.',
}, 'Д12 Q2: «напиток» (наомӯхта)', d12.passage);

const [d17] = await sql`SELECT passage FROM "ComprehensionExercise" WHERE id=${L[16].cid}`;
await setQ(L[16].cid, 0, 'Чего у них нет?', {
  question: 'У них есть мясо?', questionTranslated: 'Оё онҳо гӯшт доранд?',
  options: ['Да', 'Нет', 'Немного'], correctIndex: 1, key: 'нет',
  explanation: 'Дар матн: «Мяса нет» — гӯшт надоранд. (Баъди «нет» охири исм иваз мешавад: мясо → мяса.)',
}, 'Д17 Q1: «Чего» (наомӯхта)', d17.passage);
await setQ(L[16].cid, 2, 'Что они готовят вечером?', {
  question: 'Что они готовят вечером?', questionTranslated: 'Онҳо бегоҳӣ чӣ мепазанд?',
  options: ['Хлеб и сыр', 'Суп и рис', 'Яблоки'], correctIndex: 1, key: 'суп и рис',
  explanation: 'Дар матн: «Вечером мы готовим суп и рис» — шӯрбо ва биринҷ.',
}, 'Д17 Q3: варианти «Яйца» (шакли ҷамъи наомӯхта)', d17.passage);

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
