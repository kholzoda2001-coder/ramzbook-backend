// Ислоҳи МАЗМУНИ Модули 1-и курси русӣ (A1) — аз рӯи
// `Digital_Students_Report_RU_Module1.md`, бахши 4 (Farzona) + бандҳои C.
//
// ДОИРА: ТАНҲО дарсҳои Модули 1-и курси `COURSE_RU_A1`. Ҳар UPDATE бо
// `WHERE <сутун> = <арзиши КӮҲНА>` баста шудааст, пас:
//   • ба курси англисӣ/арабӣ/олмонӣ ҳеҷ гоҳ намерасад (доира аз рӯи lessonId),
//   • дубора иҷро кардан «0 тағйирот» медиҳад, на хато (идемпотентӣ).
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 1 — ислоҳи мазмун (15 банд)');

const [m1] = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} AND "order"=0`;
if (!m1) throw new Error('Модули 1 ёфт нашуд');
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${m1.id} ORDER BY "order"`;
const LIDS = lessons.map((l) => l.id);
const byOrder = Object.fromEntries(lessons.map((l) => [l.order, l]));

let changed = 0;
const log = [];

/** Як ислоҳи сутуни матнӣ бо доираи қатъӣ. */
async function fix(label, run, check) {
  const before = await check();
  if (before.length === 0) {
    log.push(`  ⏭  ${label} — аллакай ислоҳшуда (0)`);
    return;
  }
  log.push(`  ${APPLY ? '✏️ ' : '👀'} ${label} — ${before.length} сатр`);
  for (const b of before) log.push(`       «${b.old}»\n         → «${b.neu}»`);
  if (APPLY) await run();
  changed += before.length;
}

// ── 1. Калимаҳо ────────────────────────────────────────────────────────────
const WORD_FIXES = [
  // [калима, сутун, кӯҳна, нав, эзоҳ]
  ['Привет', 'exampleTrans', 'Салом, шумо чӣ хел?', 'Салом, ту чӣ хелӣ?',
    'C1 · «как дела?» ғайрирасмист — дар муколама «ту» аст, ин ҷо «шумо» буд'],
  ['Привет', 'translation', 'Салом (кӯтоҳ)', 'Салом (ғайрирасмӣ)',
    'C2 · фарқ дарозӣ нест, расмият аст'],
  ['Пока', 'translation', 'Хайр (кӯтоҳ)', 'Хайр (ғайрирасмӣ)', 'C2'],
  ['Это', 'translation', 'Ин / Аст', 'Ин', 'C6 · «Аст» тарҷумаи «это» нест'],
  ['Как', 'translation', 'Чӣ тавр (дар ин ибора: чист)', 'Чӣ тавр',
    'C7 · дастури методӣ дар корти вариант чоп мешуд'],
  ['Зовут', 'translation', 'Меноманд (аз «звать»)', 'Меноманд',
    'C8 · нохунак дар дохили нохунак'],
  ['Мой', 'translation', '-и ман / аз они ман', 'Аз они ман',
    'C9 · ягона тарҷумае, ки бо дефис сар мешуд'],
  ['Хорошо', 'translation', 'Хуб / Майлаш', 'Хуб', 'C10 · каҷхат дар корти вариант'],
  ['Пожалуйста', 'translation', 'Лутфан / Илтимос', 'Лутфан', 'C10'],
  ['Извините', 'example', 'Извините.', 'Извините, я не понимаю.',
    'C11 · мисоли яккалимагӣ cloze намедиҳад; ибораи амалӣ илова шуд'],
  ['Извините', 'exampleTrans', 'Бубахшед. / Ман узр мехоҳам.', 'Бубахшед, ман намефаҳмам.', 'C11'],
  ['Пожалуйста', 'ipaTajik', 'пажа́луйста', 'пажа́луста', 'C16 · «й» талаффуз намешавад'],
  ['Мужчина', 'ipaTajik', 'мужчи́на', 'мущи́на', 'C16 · «жч» → «щ»'],
  ['Добрый день', 'ipaTajik', 'до́брый день', 'до́брый дэнь', 'C16 · ин имло буд, на талаффуз'],
  ['Здравствуйте', 'ipa', '/zdrɐˈstvujtʲɪ/', '/ˈzdrastvujtʲɪ/', 'C16 · зада ҷои нодуруст буд'],
];

for (const [word, col, oldV, newV, note] of WORD_FIXES) {
  await fix(
    `Word «${word}».${col}  (${note})`,
    async () => {
      if (col === 'exampleTrans') {
        await sql`UPDATE "Word" SET "exampleTrans"=${newV} WHERE "lessonId"=ANY(${LIDS}) AND word=${word} AND "exampleTrans"=${oldV}`;
      } else if (col === 'ipaTajik') {
        await sql`UPDATE "Word" SET "ipaTajik"=${newV} WHERE "lessonId"=ANY(${LIDS}) AND word=${word} AND "ipaTajik"=${oldV}`;
      } else if (col === 'translation') {
        await sql`UPDATE "Word" SET translation=${newV} WHERE "lessonId"=ANY(${LIDS}) AND word=${word} AND translation=${oldV}`;
      } else if (col === 'example') {
        await sql`UPDATE "Word" SET example=${newV} WHERE "lessonId"=ANY(${LIDS}) AND word=${word} AND example=${oldV}`;
      } else if (col === 'ipa') {
        await sql`UPDATE "Word" SET ipa=${newV} WHERE "lessonId"=ANY(${LIDS}) AND word=${word} AND ipa=${oldV}`;
      }
    },
    async () => {
      const rows = await sql`SELECT id FROM "Word" WHERE "lessonId"=ANY(${LIDS}) AND word=${word}
        AND (CASE ${col}
          WHEN 'translation' THEN translation
          WHEN 'example' THEN example
          WHEN 'exampleTrans' THEN "exampleTrans"
          WHEN 'ipaTajik' THEN "ipaTajik"
          ELSE ipa END) = ${oldV}`;
      return rows.map(() => ({ old: oldV, neu: newV }));
    },
  );
}

console.log(log.join('\n'));
done(changed, APPLY ? 'Қадами оянда: `_ru-m1-content-fix2.mjs` (матн, грамматика, савол)' : '');
