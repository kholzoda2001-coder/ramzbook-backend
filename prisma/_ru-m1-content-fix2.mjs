// Ислоҳи МАЗМУН — қисми 2: матнҳои фаҳмиш, саволҳо, унвони мавзӯъҳо, як машқ.
// Ҳамон қоидаҳо: доира = Модули 1-и курси русӣ, ҳар UPDATE идемпотент.
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 1 — ислоҳи мазмун, қисми 2');

const [m1] = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} AND "order"=0`;
const lessons = await sql`SELECT id,"order","titleTranslated" tt,"grammarTopicId" gid,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${m1.id} ORDER BY "order"`;
const byOrder = Object.fromEntries(lessons.map((l) => [l.order, l]));

let changed = 0;
const say = (s) => console.log(s);

async function step(label, current, next, run) {
  if (current === next) { say(`  ⏭  ${label} — аллакай ислоҳшуда`); return; }
  if (current === null || current === undefined) { say(`  ⚠️  ${label} — сатр ёфт нашуд, гузашт`); return; }
  say(`  ${APPLY ? '✏️ ' : '👀'} ${label}`);
  say(`       «${current}»\n         → «${next}»`);
  if (APPLY) await run();
  changed++;
}

// ── 1. Матни фаҳмиш (passageTranslated) ────────────────────────────────────
const PASSAGES = [
  [9, 'Салом! Номи ман Анна. Ман муаллим ҳастам. Субҳ ба хайр, ҳама. Ин дӯсти ман Том аст. Ӯ донишҷӯ аст. Аз шиносоӣ шодам. Хайр ва то дидор!',
      'Салом! Номи ман Анна аст. Ман муаллим ҳастам. Субҳ ба хайр, ҳама. Ин дӯсти ман Том аст. Ӯ донишҷӯ аст. Аз шиносоӣ шодам. Хайр ва то дидор!',
      'C4 · «аст» афтода буд'],
  [11, 'Биёед саломҳоро такрор кунем! Субҳ ба хайр! Номи ман Алӣ аст. Ман донишҷӯ ҳастам. Ин дӯсти ман аст. Номи ӯ Карим аст. Ӯ муаллим аст. Ташаккур ва хайр!',
       'Биёед саломҳоро такрор кунем! Субҳ ба хайр! Номи ман Алӣ аст. Ман донишҷӯ ҳастам. Ин дӯсти ман Карим аст. Ӯ муаллим аст. Ташаккур ва хайр!',
       'C3 · дар тоҷикӣ як ҷумлаи иловагӣ буд, ки дар русӣ нест'],
  [13, 'Салом! Номи ман Алӣ аст. Ман писар ҳастам. Ин дӯстдухтари ман Сара аст. Ӯ духтар аст. Субҳ ба хайр, муаллим!',
       'Салом! Номи ман Алӣ аст. Ман писар ҳастам. Ин дугонаи ман Сара аст. Ӯ духтар аст. Субҳ ба хайр, муаллим!',
       'C5 · «дӯстдухтар» дар тоҷикӣ маънои ишқӣ дорад'],
];
for (const [order, oldV, newV, note] of PASSAGES) {
  const cid = byOrder[order]?.cid;
  const [row] = cid ? await sql`SELECT "passageTranslated" pt FROM "ComprehensionExercise" WHERE id=${cid}` : [];
  await step(`Матн (дарси ${order + 1}) — ${note}`, row?.pt ?? null, newV,
    () => sql`UPDATE "ComprehensionExercise" SET "passageTranslated"=${newV} WHERE id=${cid} AND "passageTranslated"=${oldV}`);
}

// ── 2. Саволҳо ─────────────────────────────────────────────────────────────
const QUESTIONS = [
  ['cmsc0rrp3003bulfr88rp5bxt', 'question', 'Кем является Том?', 'Анна учитель. А Том?',
    'C15 · «Кем является» барои A1 китобист'],
  ['cmsc0rrp3003bulfr88rp5bxt', 'questionTranslated', 'Касби Том чист?', 'Анна муаллим аст. Ва Том?', 'C15'],
  ['cmsc0rskf003lulfrtx0zmud9', 'question', "Как сказать 'Салом' по-русски?", 'Как сказать «Салом» по-русски?',
    'C17 · нохунаки лотинӣ дар матни русӣ'],
  ['cmsc0rsqq003nulfr7e8i7le9', 'question', "'Ташаккур' по-русски:", '«Ташаккур» по-русски:', 'C17'],
  ['cmsc0rtaj003tulfr3h1gbx11', 'question', "Что означает 'До свидания'?", 'Что означает «До свидания»?', 'C17'],
];
for (const [id, col, oldV, newV, note] of QUESTIONS) {
  const [row] = await sql`SELECT question q,"questionTranslated" qt FROM "ComprehensionQuestion" WHERE id=${id}`;
  const cur = col === 'question' ? row?.q : row?.qt;
  await step(`Савол ${id.slice(-6)}.${col} — ${note}`, cur ?? null, newV, () =>
    col === 'question'
      ? sql`UPDATE "ComprehensionQuestion" SET question=${newV} WHERE id=${id} AND question=${oldV}`
      : sql`UPDATE "ComprehensionQuestion" SET "questionTranslated"=${newV} WHERE id=${id} AND "questionTranslated"=${oldV}`);
}

// ── 3. Унвони мавзӯъҳои грамматикӣ ─────────────────────────────────────────
// Пешванди «Грамматика:» ба унвони МАВЗӮЪ намезебад (он дар сарлавҳаи экран
// такрор мешавад) ва нохунаки дарунӣ («Будан» дар дохили «…») хатои орфографист.
// Корти роҳнамо (Lesson.titleTranslated) ва экран (GrammarTopic.titleTranslated)
// бояд ЗИД набошанд — ниг. боги кӯҳнаи «фоилӣ ↔ шахсӣ».
const TOPICS = [
  [6, 'Грамматика: феъли «Будан»', 'Феъли будан — дар замони ҳозира лозим нест', 'C12/C13'],
  [7, 'Грамматика: ҷонишинҳои шахсӣ', 'Ҷонишинҳои шахсӣ', 'C12'],
];
for (const [order, oldV, newV, note] of TOPICS) {
  const gid = byOrder[order]?.gid;
  const [row] = gid ? await sql`SELECT "titleTranslated" tt FROM "GrammarTopic" WHERE id=${gid}` : [];
  await step(`Унвони мавзӯъ (дарси ${order + 1}) — ${note}`, row?.tt ?? null, newV,
    () => sql`UPDATE "GrammarTopic" SET "titleTranslated"=${newV} WHERE id=${gid} AND "titleTranslated"=${oldV}`);
}
// Унвони ДАРС бе нохунаки дарунӣ, то бо унвони мавзӯъ як хел бошад.
{
  const l = byOrder[6];
  await step('Унвони дарси 7 (корти роҳнамо)', l?.tt ?? null, 'Грамматика: феъли будан',
    () => sql`UPDATE "Lesson" SET "titleTranslated"='Грамматика: феъли будан' WHERE id=${l.id} AND "titleTranslated"=${'Грамматика: феъли «Будан»'}`);
}

// ── 4. Машқи «Мы ___ друзья.» ──────────────────────────────────────────────
// Ду ислоҳ дар як ҷо:
//   • тарҷума: «Мо дӯстонем» ↔ «Мо дӯст ҳастем» дар ҳамон модул ду хел буд (C14);
//   • ҷавоб «—» кафчаи ҲАРФ месохт (як тире + ҳарфҳои тасодуфӣ) — бемаънӣ буд.
//     Бо вариантҳо он ба интихоби оддӣ табдил меёбад, мисли ҳамтоёни худ.
{
  const id = 'cmsc513fy00012ck1n37qm9ja';
  const [row] = await sql`SELECT "promptTranslated" pt, options FROM "GrammarExercise" WHERE id=${id}`;
  await step('Машқ «Мы ___ друзья».promptTranslated — C14', row?.pt ?? null, 'Мо дӯст ҳастем.',
    () => sql`UPDATE "GrammarExercise" SET "promptTranslated"='Мо дӯст ҳастем.' WHERE id=${id} AND "promptTranslated"=${'Мо дӯстонем.'}`);
  const optsNow = JSON.stringify(row?.options ?? null);
  const optsNew = JSON.stringify(['—', 'есть', 'являемся']);
  await step('Машқ «Мы ___ друзья».options — ҷавоби «—» бояд интихобӣ бошад', optsNow, optsNew,
    // ДИҚҚАТ: сутун `jsonb` аст — драйвери HTTP массиви JS-ро ҳамчун массиви
    // Postgres мефиристад ва хатои «invalid input syntax for type json» медиҳад.
    // Сатри JSON + `::jsonb` ягона роҳи дурусти навиштан аст.
    () => sql`UPDATE "GrammarExercise" SET options=${optsNew}::jsonb WHERE id=${id} AND options IS NULL`);
}

done(changed);
