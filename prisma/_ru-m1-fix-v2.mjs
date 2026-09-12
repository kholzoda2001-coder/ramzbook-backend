// ФАЗАИ 1 — ислоҳи МАЗМУНи Модули 1-и русӣ (A1). Ба аудио даст НАМЕЗАНАД.
//
// Асос: `Digital_Students_Report_RU_A1_Module1_v2.md` (даври 2, 9.09.2026).
// Скрипт ИДЕМПОТЕНТ аст: дубора иҷро кардан «0 тағйирот» медиҳад. Ҳар навиштан
// фавран бо SELECT-и алоҳида тасдиқ мешавад (драйвери HTTP rowCount намедиҳад).
//
//   node prisma/_ru-m1-fix-v2.mjs           # dry-run
//   node prisma/_ru-m1-fix-v2.mjs --apply
//
// ⚠️ Матни РУСИИ дорои аудио (passage, DialogueLine.text, GrammarExample.sentence,
//    Word.word) ин ҷо ИВАЗ НАМЕШАВАД — вагарна садо ба матн рост намеояд.
//    Муколама (Здравствуйте→Привет) дар `_ru-m1-audio-v2.mjs` бо аудиояш якҷоя
//    иваз мешавад. Савол, вариант, тарҷума, мисоли калима ва қоида аудио
//    надоранд — онҳоро озод иваз кардан мумкин (ниг. [[ramz-ar-m1-qa]]).
import { randomBytes } from 'crypto';
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 1 — ислоҳи мазмун (Фазаи 1)');

const [M1] = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order" LIMIT 1`;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid,"comprehensionId" cid
  FROM "Lesson" WHERE "moduleId"=${M1.id} ORDER BY "order"`;
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
if (lessons.length !== 14) throw new Error(`Модули 1 бояд 14 дарс дошта бошад, ${lessons.length} ёфт шуд`);

let changed = 0;
let already = 0;

const TABLES = new Set(['ComprehensionQuestion', 'Word', 'GrammarExample', 'GrammarRule']);
const COLS = new Set(['question', 'questionTranslated', 'explanation', 'translation', 'example',
  'exampleTrans', 'ipaTajik', 'emoji', 'note', 'correctIndex']);

function guard(table, col) {
  if (!TABLES.has(table) || !COLS.has(col)) throw new Error(`Ҷадвал/сутуни иҷозатнашуда: ${table}.${col}`);
}

async function read(table, col, id) {
  const rows = await sql.query(`SELECT "${col}" AS v FROM "${table}" WHERE id=$1`, [id]);
  if (rows.length !== 1) throw new Error(`${table} ${id}: ${rows.length} сатр (бояд 1)`);
  return rows[0].v;
}

/** Як майдон (сатр ё рақам). Танҳо ҳангоми фарқ менависад ва баъд месанҷад. */
async function set(table, id, col, want, label) {
  guard(table, col);
  const have = await read(table, col, id);
  if (have === want) { already++; return; }
  console.log(`  • ${label}\n      буд : ${JSON.stringify(have)}\n      шуд : ${JSON.stringify(want)}`);
  changed++;
  if (!APPLY) return;
  await sql.query(`UPDATE "${table}" SET "${col}"=$1 WHERE id=$2`, [want, id]);
  const after = await read(table, col, id);
  if (after !== want) throw new Error(`ТАСДИҚ НАШУД: ${label} (ҳоло ${JSON.stringify(after)})`);
}

/** `ComprehensionQuestion.options` — jsonb; массив ҳамчун JSON + ::jsonb. */
async function setOptions(id, want, label) {
  const have = await read('ComprehensionQuestion', 'options', id).catch(() => null)
    ?? (await sql`SELECT options AS v FROM "ComprehensionQuestion" WHERE id=${id}`)[0]?.v;
  if (JSON.stringify(have) === JSON.stringify(want)) { already++; return; }
  console.log(`  • ${label}\n      буд : ${JSON.stringify(have)}\n      шуд : ${JSON.stringify(want)}`);
  changed++;
  if (!APPLY) return;
  await sql`UPDATE "ComprehensionQuestion" SET options=${JSON.stringify(want)}::jsonb WHERE id=${id}`;
  const [after] = await sql`SELECT options AS v FROM "ComprehensionQuestion" WHERE id=${id}`;
  if (JSON.stringify(after.v) !== JSON.stringify(want)) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}

async function questions(lessonOrder, expectCount) {
  const q = await sql`SELECT id,question,options,"correctIndex" ci FROM "ComprehensionQuestion"
    WHERE "exerciseId"=${L[lessonOrder].cid} ORDER BY "order", id`;
  if (q.length !== expectCount) throw new Error(`Дарси #${lessonOrder}: ${q.length} савол (интизор ${expectCount})`);
  return q;
}

/** Муҳофизат: пеш аз иваз мутмаин мешавем, ки савол ҳамон аст (ё аллакай иваз шудааст). */
function expectQuestion(q, oneOf, label) {
  if (!oneOf.includes(q.question)) {
    throw new Error(`${label}: саволи ғайричашмдошт «${q.question}» — скрипт боздошта шуд`);
  }
}

async function word(lessonOrder, ru) {
  const w = await sql`SELECT id FROM "Word" WHERE "lessonId"=${L[lessonOrder].id} AND word=${ru}`;
  if (w.length !== 1) throw new Error(`Калимаи «${ru}» дар дарси #${lessonOrder}: ${w.length} сатр`);
  return w[0].id;
}

// Шакли cuid (c + 24 аломат), ҳамон ки Prisma медиҳад — то валидатсияи `z.cuid()`
// дар админ ин сатрро рад накунад.
function cuidLike() {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz';
  const ts = Date.now().toString(36).padStart(8, '0').slice(-8);
  let rnd = '';
  for (const b of randomBytes(16)) rnd += alphabet[b % 36];
  return `c${ts}${rnd}`;
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R2/R3 · саволҳо ва вариантҳои калимаи НАОМӮХТА ──');
{
  const q8 = await questions(8, 2);
  expectQuestion(q8[1], ['Кто такой Карим?', 'Кто Карим?'], '#8 Q2');
  await set('ComprehensionQuestion', q8[1].id, 'question', 'Кто Карим?', '#8 Q2 question');
  // Дистрактор аз ҷинси МУҚОБИЛ: Карим «Он» аст, пас «Девочка» бешубҳа хатост.
  // («Мальчик» барои калонсол баҳсбарангез буд — хонанда метавонист далел оварад.)
  await setOptions(q8[1].id, ['Студент', 'Учитель', 'Девочка'], '#8 Q2 options («Врач» → «Девочка»)');
  await set('ComprehensionQuestion', q8[1].id, 'correctIndex', 1, '#8 Q2 correctIndex');

  const q9 = await questions(9, 4);
  expectQuestion(q9[1], ['Кем работает Анна?', 'Кто Анна?'], '#9 Q2');
  await set('ComprehensionQuestion', q9[1].id, 'question', 'Кто Анна?', '#9 Q2 question («Кем работает» — падежи творительный)');
  await set('ComprehensionQuestion', q9[1].id, 'questionTranslated', 'Анна кист?', '#9 Q2 questionTranslated');
  await setOptions(q9[1].id, ['Студент', 'Учитель', 'Мальчик'], '#9 Q2 options («Врач» → «Мальчик»: Анна зан аст)');
  await set('ComprehensionQuestion', q9[1].id, 'correctIndex', 1, '#9 Q2 correctIndex');

  expectQuestion(q9[2], ['Кто такой Том?', 'Кто Том?'], '#9 Q3');
  await set('ComprehensionQuestion', q9[2].id, 'question', 'Кто Том?', '#9 Q3 question');
  await setOptions(q9[2].id, ['Друг', 'Учитель', 'Девочка'], '#9 Q3 options («Её друг/брат/учитель»)');
  await set('ComprehensionQuestion', q9[2].id, 'correctIndex', 0, '#9 Q3 correctIndex');

  // «Врач» ин ҷо ҳам буд. Детектори аввал онро «омӯхташуда» шумурд, чунки «врач»
  // дар машқи `transform`-и дарси #7 ҳаст — вале `transform` дар зинаи gentle
  // (A1 М1–М3) ФИЛТР мешавад (`grammar_topic_screen.dart` `_stageFiltered`),
  // яъне хонанда онро ҳеҷ гоҳ намебинад.
  expectQuestion(q9[3], ['Анна учитель. А Том?'], '#9 Q4');
  await setOptions(q9[3].id, ['Учитель', 'Девочка', 'Студент'], '#9 Q4 options («Врач» → «Девочка»)');
  await set('ComprehensionQuestion', q9[3].id, 'correctIndex', 2, '#9 Q4 correctIndex');

  const q11 = await questions(11, 2);
  expectQuestion(q11[0], ['Кто такой Карим?', 'Кто Карим?'], '#11 Q1');
  await set('ComprehensionQuestion', q11[0].id, 'question', 'Кто Карим?', '#11 Q1 question');
  await setOptions(q11[0].id, ['Учитель', 'Девочка', 'Студент'], '#11 Q1 options («Врач» → «Девочка»)');
  await set('ComprehensionQuestion', q11[0].id, 'correctIndex', 0, '#11 Q1 correctIndex');
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R17 · саволи 3-юми ИМТИҲОН (такрори Q2 + «подруга»-и наомӯхта) ──');
{
  const q13 = await questions(13, 8);
  expectQuestion(q13[2], ['Кто такая Сара?', 'Дополните: ___, учитель!'], '#13 Q3');
  // Нав: дарси «Саломҳо аз рӯи вақти рӯз» (#5) дар имтиҳон умуман санҷида намешуд.
  await set('ComprehensionQuestion', q13[2].id, 'question', 'Дополните: ___, учитель!', '#13 Q3 question');
  await set('ComprehensionQuestion', q13[2].id, 'questionTranslated', 'Аз матн пур кунед: ___, муаллим!', '#13 Q3 questionTranslated');
  await setOptions(q13[2].id, ['Доброе утро', 'Спокойной ночи', 'До свидания'], '#13 Q3 options');
  await set('ComprehensionQuestion', q13[2].id, 'correctIndex', 0, '#13 Q3 correctIndex');
  await set('ComprehensionQuestion', q13[2].id, 'explanation',
    'Ҷумлаи охирини матн: «Доброе утро, учитель!» — Субҳ ба хайр, муаллим!', '#13 Q3 explanation');
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R1 · тавзеҳи хато бо ТОҶИКӢ (дарсҳои #8 ва #9) ──');
{
  const q8 = await questions(8, 2);
  await set('ComprehensionQuestion', q8[0].id, 'explanation',
    'Дар матн: «Его зовут Карим» — номи ӯ Карим аст.', '#8 Q1 explanation');
  await set('ComprehensionQuestion', q8[1].id, 'explanation',
    'Дар матн: «Он учитель» — Карим муаллим аст.', '#8 Q2 explanation');

  const q9 = await questions(9, 4);
  await set('ComprehensionQuestion', q9[0].id, 'explanation',
    'Дар матн: «Меня зовут Анна» — номи ӯ Анна аст.', '#9 Q1 explanation');
  await set('ComprehensionQuestion', q9[1].id, 'explanation',
    'Дар матн: «Я учитель» — Анна муаллим аст.', '#9 Q2 explanation');
  await set('ComprehensionQuestion', q9[2].id, 'explanation',
    'Дар матн: «Это мой друг Том» — Том дӯсти Анна аст.', '#9 Q3 explanation');
  await set('ComprehensionQuestion', q9[3].id, 'explanation',
    'Дар матн: «Он студент» — Том донишҷӯ аст.', '#9 Q4 explanation');
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R10 · қоидаи нав «Его зовут… / Её зовут…» (дарси #7, пеш аз матнҳои #8–#9) ──');
{
  const topicId = L[7].gid;
  const PATTERN = 'Его зовут … / Её зовут …';
  const NOTE = 'Номи каси ДИГАРРО чунин мегӯем: барои мард — «Его зовут Карим» (Номи ӯ Карим аст), '
    + 'барои зан — «Её зовут Анна» (Номи ӯ Анна аст). Дар бораи худ: «Меня зовут Али».';
  const have = await sql`SELECT id FROM "GrammarRule" WHERE "topicId"=${topicId} AND pattern=${PATTERN}`;
  if (have.length > 1) throw new Error('Қоидаи «Его/Её» такрорӣ аст');
  if (have.length === 1) {
    await set('GrammarRule', have[0].id, 'note', NOTE, '#7 қоидаи «Его/Её зовут».note');
  } else {
    const [{ max }] = await sql`SELECT COALESCE(MAX("order"),-1)::int AS max FROM "GrammarRule" WHERE "topicId"=${topicId}`;
    console.log(`  • #7 қоидаи НАВ (order=${max + 1}): «${PATTERN}»\n      note: ${NOTE}`);
    changed++;
    if (APPLY) {
      await sql`INSERT INTO "GrammarRule" (id,"topicId",pattern,note,"order")
        VALUES (${cuidLike()},${topicId},${PATTERN},${NOTE},${max + 1})`;
      const chk = await sql`SELECT id FROM "GrammarRule" WHERE "topicId"=${topicId} AND pattern=${PATTERN}`;
      if (chk.length !== 1) throw new Error('ТАСДИҚ НАШУД: қоидаи нав');
    }
  }
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R5 · «Спасибо» дар як дарс ду тарҷума дошт (Ташаккур / Раҳмат) ──');
await set('Word', await word(1, 'Не за что'), 'exampleTrans', 'Ташаккур! Хоҳиш мекунам.', '#1 «Не за что».exampleTrans');

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R6/R7 · тарҷумаи корт дар мисоли худаш дида намешуд ──');
{
  await set('Word', await word(2, 'Мой'), 'translation', 'Аз они ман (-и ман)', '#2 «Мой».translation');

  const kak = await word(3, 'Как');
  await set('Word', kak, 'translation', 'Чӣ тавр, чӣ хел', '#3 «Как».translation');
  await set('Word', kak, 'example', 'Как дела?', '#3 «Как».example');
  await set('Word', kak, 'exampleTrans', 'Ту чӣ хелӣ?', '#3 «Как».exampleTrans');

  await set('Word', await word(3, 'Тебя'), 'exampleTrans',
    'Номи ту чист? (айнан: туро чӣ меноманд?)', '#3 «Тебя».exampleTrans');
  await set('Word', await word(3, 'Зовут'), 'exampleTrans',
    'Номи ман Алӣ аст. (айнан: маро Алӣ меноманд)', '#3 «Зовут».exampleTrans');

  // «Кто этот человек? = Он мард кист?» — «человек» ≠ «мард», ва «этот/человек»
  // ҳеҷ ҷо таълим дода нашудаанд. Мисоли нав танҳо аз калимаҳои ОМӮХТА аст.
  const kto = await word(3, 'Кто');
  await set('Word', kto, 'example', 'Кто это?', '#3 «Кто».example');
  await set('Word', kto, 'exampleTrans', 'Ин кист?', '#3 «Кто».exampleTrans');
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R9 · «Оно большое = Он калон аст» — «Он»-и тоҷикӣ бо «Он»-и русӣ омехта ──');
{
  const ex = await sql`SELECT id FROM "GrammarExample" WHERE "topicId"=${L[7].gid} AND sentence=${'Вот окно. Оно большое.'}`;
  if (ex.length !== 1) throw new Error(`Мисоли «Вот окно…»: ${ex.length} сатр`);
  await set('GrammarExample', ex[0].id, 'translation', 'Ана тиреза. Вай калон аст.', '#7 мисоли «Вот окно. Оно большое.».translation');
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R11 · транскрипсияи тоҷикии холӣ (конвенсия: ы→и, ниг. «до́брий») ──');
for (const [lo, ru, tg] of [
  [0, 'Да', 'да'], [0, 'Нет', 'нет'],
  [2, 'Ты', 'ти'], [2, 'Мой', 'мой'],
  [3, 'Как', 'как'], [3, 'Кто', 'кто'],
  [12, 'Да', 'да'], [12, 'Ты', 'ти'],
]) {
  await set('Word', await word(lo, ru), 'ipaTajik', tg, `#${lo} «${ru}».ipaTajik`);
}

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R12 · эмоҷии такрорӣ дар як дарс ──');
await set('Word', await word(1, 'Пожалуйста'), 'emoji', '🤲', '#1 «Пожалуйста».emoji (🙏 бо «Спасибо» якхела буд)');
await set('Word', await word(2, 'Я'), 'emoji', '🙋', '#2 «Я».emoji');
await set('Word', await word(2, 'Ты'), 'emoji', '👉', '#2 «Ты».emoji (👤 бо «Я», «Мой» якхела буд)');

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── R5/R12 (нусхаҳо) · дарси навиштан (#12) ҳамон калимаҳоро дорад ──');
// Бе ин хонанда «Не за что»-ро дар дарси #1 бо «Ташаккур!» ва дар #12 боз бо
// «Раҳмат!» медид, ва «Ты» дар ду дарс ду эмоҷии гуногун дошт.
await set('Word', await word(12, 'Не за что'), 'exampleTrans', 'Ташаккур! Хоҳиш мекунам.', '#12 «Не за что».exampleTrans');
await set('Word', await word(12, 'Пожалуйста'), 'emoji', '🤲', '#12 «Пожалуйста».emoji (ҳамон ки дар #1)');
await set('Word', await word(12, 'Ты'), 'emoji', '👉', '#12 «Ты».emoji (ҳамон ки дар #2)');

// ═════════════════════════════════════════════════════════════════════════════
console.log('\n── Тарҷумаи саволҳои имтиҳон ба луғати модул (писарбача/духтарча) ──');
{
  const q13 = await questions(13, 8);
  expectQuestion(q13[0], ['Как зовут мальчика?'], '#13 Q1');
  await set('ComprehensionQuestion', q13[0].id, 'questionTranslated', 'Номи писарбача чист?', '#13 Q1 questionTranslated');
  expectQuestion(q13[1], ['Сара мальчик или девочка?'], '#13 Q2');
  await set('ComprehensionQuestion', q13[1].id, 'questionTranslated', 'Сара писарбача аст ё духтарча?', '#13 Q2 questionTranslated');
}

// ═════════════════════════════════════════════════════════════════════════════
console.log(`\n  Аллакай дуруст (даст нахӯрд): ${already}`);
done(changed, APPLY ? 'Навбатӣ: _ru-m1-audio-v2.mjs (аудио + муколама), баъд санҷиш.' : '');
