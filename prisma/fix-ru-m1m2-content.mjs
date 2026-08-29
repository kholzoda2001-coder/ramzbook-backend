// ИСЛОҲИ МУНДАРИҶА — Модулҳои 1 ва 2-и курси русӣ (аз `Russian_A1_M1_M2_Audit.md`).
//
// ─── P0 ─────────────────────────────────────────────────────────────────────
// F1  Унвони ҷадвалҳои ПАЙВАСТ (GrammarTopic / Dialogue / ComprehensionExercise):
//     sentence case + буридани префикси «Дарси N:» + «фоилӣ» → «шахсӣ».
//     Фазаи 3 танҳо `Module` ва `Lesson`-ро тоза карда буд; ин ҷадвалҳо сутуни
//     `titleTranslated`-и ХУДро доранд ва экрани грамматика маҳз онро мекашад
//     (`grammar_topic_screen.dart:116`) — пас корт ва экран ду ном мегуфтанд.
//
// F2  Ихтилофи «ты ↔ Шумо»: русӣ бетакаллуф, тоҷикӣ расмӣ. Фазаи 1 `Word`-ро
//     ислоҳ кард («Ты» = «Ту»), вале `DialogueLine` ва мисолҳо мондаанд.
//     ⚠️ ҲАДАФНОК, на кӯр-кӯрона: «Шумо» дар ҷои дигар метавонад ДУРУСТ бошад
//     (вақте русӣ «вы» дорад), пас танҳо сатрҳои номбаршуда иваз мешаванд.
//
// F3  Ҷинси Сара дар имтиҳони ниҳоии Модули 1. ⚠️ Матн ТАНҲО нест — саволи
//     «Кто такая Сара?» варианти «Мой друг» дорад, ки бояд ҳамроҳ иваз шавад,
//     вагарна имтиҳон ба матни худаш зид мешавад.
//
// ─── P1 ─────────────────────────────────────────────────────────────────────
// F4  Бартараф кардани ишора ба забони АНГЛИСӢ аз 10 мавзӯи грамматикӣ.
// F5  Корти «⚡ Фарқ аз тоҷикӣ» барои 4 мавзӯи M1/M2.
// F6  Истилоҳи ҷинс: дарс тоҷикӣ меомӯзонад, машқ русӣ мепурсад → ҷуфт мешавад.
//
//   node prisma/fix-ru-m1m2-content.mjs            # намоиш
//   node prisma/fix-ru-m1m2-content.mjs --apply    # иҷро
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';
import { sentenceCase, stripLessonPrefix } from './_ru-title-case.mjs';

const sql = connect();
banner('Мундариҷаи Модулҳои 1–2-и русӣ — F1…F6');

let changed = 0;
const C = COURSE_RU_A1;

/** Ҷойивазкунии ҲАДАФНОК: агар матни кӯҳна ёфт нашавад, ГУЗАШТ + огоҳӣ. */
function swap(text, pairs, label) {
  let out = text;
  const missed = [];
  for (const [oldS, newS] of pairs) {
    if (out.includes(newS) && !out.includes(oldS)) continue; // аллакай иваз шуда
    if (!out.includes(oldS)) { missed.push(oldS.slice(0, 40)); continue; }
    out = out.replace(oldS, newS);
  }
  if (missed.length) console.log(`      ⚠️  ${label}: ${missed.length} порча ёфт нашуд — ${missed.join(' | ')}`);
  return out;
}

// ═══════════════════════════════════════════════════════════════════════════
// F1 · Унвонҳои ҷадвалҳои пайваст
// ═══════════════════════════════════════════════════════════════════════════
console.log('  ─── F1 · Унвони GrammarTopic / Dialogue / ComprehensionExercise ───\n');

for (const table of ['GrammarTopic', 'Dialogue', 'ComprehensionExercise']) {
  const rows = await sql`
    SELECT id, title, "titleTranslated" FROM ${sql.unsafe(`"${table}"`)}
    WHERE "courseId"=${C} ORDER BY "order"`;
  let n = 0;
  for (const r of rows) {
    // Русӣ: танҳо префикс (ҳарфи калони русӣ қоидаи ХУДашро дорад).
    const nextTitle = stripLessonPrefix(r.title);
    // Тоҷикӣ: префикс + sentence case + истилоҳи «фоилӣ».
    let nextTt = sentenceCase(stripLessonPrefix(r.titleTranslated));
    nextTt = nextTt.replace(/фоилӣ/gi, 'шахсӣ');

    if (nextTitle === r.title && nextTt === r.titleTranslated) continue;
    console.log(`  ● [${table}]`);
    if (nextTitle !== r.title) console.log(`      ru: «${r.title}» → «${nextTitle}»`);
    if (nextTt !== r.titleTranslated) console.log(`      tg: «${r.titleTranslated}» → «${nextTt}»`);
    if (APPLY) {
      await sql`UPDATE ${sql.unsafe(`"${table}"`)} SET title=${nextTitle}, "titleTranslated"=${nextTt} WHERE id=${r.id}`;
    }
    n++;
  }
  console.log(`    ${table}: ${n} унвон\n`);
  changed += n;
}

// ═══════════════════════════════════════════════════════════════════════════
// F2 · «ты» бетакаллуф → тоҷикии бетакаллуф
// ═══════════════════════════════════════════════════════════════════════════
console.log('  ─── F2 · Ихтилофи «ты ↔ Шумо» ───\n');

// Сатрҳои МУКОЛАМА: матни русӣ → тарҷумаи нави тоҷикӣ.
// Феъл ҳам ба шакли бетакаллуф мегузарад: ҳастед→ҳастӣ, мезанед→мезанӣ.
const DIALOGUE_FIX = [
  ['Как дела?', 'Ту чӣ хелӣ?'],
  ['Как тебя зовут?', 'Номи ту чист?'],
  ['Меня зовут Али. Как тебя зовут?', 'Номи ман Алӣ аст. Номи ту чист?'],
  ['Мне тоже приятно познакомиться! Откуда ты?', 'Ман ҳам аз шиносоӣ шодам! Ту аз куҷоӣ?'],
  ['Я из Англии. А ты?', 'Ман аз Англия ҳастам. Ва ту?'],
  ['Сколько тебе лет?', 'Ту чандсолаӣ?'],
  ['Мне двадцать лет. А тебе?', 'Ман бистсола ҳастам. Ва ту?'],
  ['Когда у тебя день рождения?', 'Зодрӯзи ту кай аст?'],
];

for (const [ru, tg] of DIALOGUE_FIX) {
  const rows = await sql`
    SELECT l.id, l.text, l.translation FROM "DialogueLine" l
    JOIN "Dialogue" d ON d.id=l."dialogueId"
    WHERE d."courseId"=${C} AND l.text=${ru}`;
  if (rows.length === 0) { console.log(`  ⚠️  сатр ёфт нашуд: «${ru}»`); continue; }
  for (const r of rows) {
    if (r.translation === tg) { continue; } // идемпотент
    console.log(`  ● «${r.text}»`);
    console.log(`      «${r.translation}» → «${tg}»`);
    if (APPLY) await sql`UPDATE "DialogueLine" SET translation=${tg} WHERE id=${r.id}`;
    changed++;
  }
}

// Мисолҳои КАЛИМА
//
// ⚠️ Мувофиқат бо матни КӮҲНА ҳатмист, на танҳо бо калима: «Старый» дар чанд
// дарс такрор мешавад ва мисолҳои ГУНОГУН дорад («Ин пойафзолҳо кӯҳна
// ҳастанд»). Мувофиқати танҳо аз рӯи калима он сатрҳоро нобуд мекард.
const WORD_EX_FIX = [
  ['Говорить', 'Оё шумо бо русӣ гап мезанед?', 'Оё ту бо русӣ гап мезанӣ?'],
  ['Старый',   'Шумо чандсолаед?',             'Ту чандсолаӣ?'],
  ['Возраст',  'Шумо чандсолаед?',             'Ту чандсолаӣ?'],
];
for (const [word, oldTg, tg] of WORD_EX_FIX) {
  const rows = await sql`
    SELECT w.id, w.word, w.example, w."exampleTrans" FROM "Word" w
    JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
    WHERE m."courseId"=${C} AND w.word=${word} AND w."exampleTrans"=${oldTg}`;
  if (rows.length === 0) {
    const already = await sql`
      SELECT count(*)::int c FROM "Word" w
      JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
      WHERE m."courseId"=${C} AND w.word=${word} AND w."exampleTrans"=${tg}`;
    if (already[0].c === 0) console.log(`  ⚠️  ${word}: матни кӯҳна ёфт нашуд — ГУЗАШТ`);
    continue;
  }
  for (const r of rows) {
    console.log(`  ● ${r.word}: «${r.exampleTrans}» → «${tg}»`);
    if (APPLY) await sql`UPDATE "Word" SET "exampleTrans"=${tg} WHERE id=${r.id}`;
    changed++;
  }
}

// Саволи такрори Модули 2 (матни тоҷикӣ ДАРУНИ савол)
{
  const rows = await sql`
    SELECT q.id, q.question FROM "ComprehensionQuestion" q
    JOIN "ComprehensionExercise" e ON e.id=q."exerciseId"
    WHERE e."courseId"=${C} AND q.question LIKE '%Шумо аз куҷо ҳастед%'`;
  for (const r of rows) {
    const next = r.question.replace('Шумо аз куҷо ҳастед?', 'Ту аз куҷо ҳастӣ?');
    console.log(`  ● савол: «${r.question}» → «${next}»`);
    if (APPLY) await sql`UPDATE "ComprehensionQuestion" SET question=${next} WHERE id=${r.id}`;
    changed++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// F3 · Ҷинси Сара (матн + варианти савол)
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n  ─── F3 · Имтиҳони Модули 1 — «мой друг Сара» ───\n');

const SARA_RU_OLD = 'Это мой друг Сара. Она девочка. Сара мой друг.';
const SARA_RU_NEW = 'Это моя подруга Сара. Она девочка.';
const SARA_TG_OLD = 'Ин дӯсти ман Сара аст. Ӯ духтар аст. Сара дӯсти ман аст.';
const SARA_TG_NEW = 'Ин дӯстдухтари ман Сара аст. Ӯ духтар аст.';

const saraEx = await sql`
  SELECT id, passage, "passageTranslated" FROM "ComprehensionExercise"
  WHERE "courseId"=${C} AND passage LIKE ${'%' + SARA_RU_OLD + '%'}`;
if (saraEx.length === 0) {
  console.log('  ✓ матни Сара аллакай ислоҳ шудааст (идемпотент)');
} else {
  for (const e of saraEx) {
    const p = e.passage.replace(SARA_RU_OLD, SARA_RU_NEW);
    const pt = (e.passageTranslated ?? '').replace(SARA_TG_OLD, SARA_TG_NEW);
    console.log(`  ● матн:\n      ru: …${SARA_RU_OLD} → ${SARA_RU_NEW}`);
    console.log(`      tg: …${SARA_TG_OLD} → ${SARA_TG_NEW}`);
    if (APPLY) {
      await sql`UPDATE "ComprehensionExercise" SET passage=${p}, "passageTranslated"=${pt} WHERE id=${e.id}`;
    }
    changed++;
  }
}
// Варианти саволи вобаста — вагарна имтиҳон ба матни худаш зид мешавад.
{
  const qs = await sql`
    SELECT q.id, q.question, q.options, q."correctIndex" FROM "ComprehensionQuestion" q
    JOIN "ComprehensionExercise" e ON e.id=q."exerciseId"
    WHERE e."courseId"=${C} AND q.question='Кто такая Сара?'`;
  for (const q of qs) {
    const opts = (q.options ?? []).map((o) => (o === 'Мой друг' ? 'Моя подруга' : o));
    if (JSON.stringify(opts) === JSON.stringify(q.options)) continue;
    console.log(`  ● савол «${q.question}»: ${JSON.stringify(q.options)} → ${JSON.stringify(opts)}`);
    if (APPLY) {
      await sql`UPDATE "ComprehensionQuestion" SET options=${JSON.stringify(opts)}::jsonb WHERE id=${q.id}`;
    }
    changed++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// F4 · Бартараф кардани ишора ба АНГЛИСӢ
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n  ─── F4 · Ишораҳои англисӣ → муқоиса бо ТОҶИКӢ ───\n');

const EN_FIX = {
  // Ҷонишинҳои шахсӣ
  cmsc0rm25001lulfrn9cz9oo1: [[
    'Баръакси англисӣ, дар русӣ баъди ин ҷонишинҳо дар замони ҳозира ҳеҷ феъл лозим нест (ниг. дарси қаблӣ).',
    'Баръакси тоҷикӣ, дар русӣ баъди ин ҷонишинҳо дар замони ҳозира ҳеҷ феъл лозим нест: мо «ман ҳастам» мегӯем, вале русӣ танҳо «Я» мегирад (ниг. дарси қаблӣ).',
  ]],
  // Феъли «быть»
  cmsc0ripz000lulfrc9ye1km7: [[
    'Дар тоҷикӣ мегӯем «ман ҳастам», «ту ҳастӣ», «ӯ аст». Дар англисӣ ба ҷои инҳо феъли to be (am/is/are) меояд. Дар **русӣ** бошад — қоида хеле СОДДАТАР аст: дар замони ҳозира ба ҳеҷ феъл ниёз нест!',
    'Дар тоҷикӣ мегӯем «ман ҳастам», «ту ҳастӣ», «ӯ аст» — бе ин калимаҳо ҷумла нопурра мемонад. Дар **русӣ** қоида хеле СОДДАТАР аст: дар замони ҳозира ба ҳеҷ феъл ниёз нест!',
  ]],
  // Калимаҳои саволӣ
  cmsc41w6l0007558fm6ri53bz: [[
    '«Where are you from?»-и англисӣ маҳз ба Откуда рост меояд, на Где.',
    'Дар тоҷикӣ ҳарду «куҷо» мешаванд: «Ту дар куҷоӣ?» → **Где**, «Ту аз куҷоӣ?» → **Откуда**.',
  ]],
  // Ҷинси исм
  cmsc41zyf0017558f08q1hkko: [[
    'Дар русӣ артикл (a/an/the) вуҷуд НАДОРАД — ба ҷои он, ҳар исм ЯКЕ аз се ҷинс дорад, ки аз ҳарфи охираш маълум мешавад:',
    'Дар русӣ, мисли тоҷикӣ, артикл вуҷуд НАДОРАД. Вале як чизи тамоман НАВ ҳаст: ҳар исм ЯКЕ аз се ҷинс дорад, ки аз ҳарфи охираш маълум мешавад:',
  ]],
  // Исми ҷамъ
  cmsc4r44c002q84901alax3zb: [[
    '**Истисноҳо** (мисли man→men, child→children дар англисӣ): **брат→братья**, **ребёнок→дети**.',
    '**Истисноҳо** — инҳоро бояд ҳамчун калимаи алоҳида ёд гирифт: **брат→братья**, **ребёнок→дети**.',
  ]],
  // Есть / нет
  cmscdzqo5005jiy3lm6h9z7h2: [[
    '**Фарқи муҳим аз англисӣ:** англисӣ is/are-ро иваз мекунад, вале русӣ ҳамеша як калима — **есть** — новобаста аз танҳо ё ҷамъ будан.',
    '**Диққат:** русӣ ҳамеша ҳамон як калима — **есть** — мегирад, новобаста аз он ки чиз танҳост ё ҷамъ.',
  ]],
  // Вақт: пешоянди «в»
  cmsp4fxb20001e87sbsykh6p8: [[
    'Фарқ аз англисӣ: русӣ барои соат ва рӯз ҳамон **в**-ро истифода мебарад (на at/on-и алоҳида), вале барои қисми рӯз тамоман пешоянд намемонад.',
    '⚡ **Фарқ аз тоҷикӣ:** дар тоҷикӣ «**соати** 5», «**рӯзи** душанбе» мегӯем; русӣ барои ҳарду ҳамон **в**-ро мегирад, вале барои қисми рӯз (субҳ, шом) тамоман пешоянд намемонад.',
  ]],
  // Зарфҳои басомад
  cmsp5vjkg0007130gdb5jvwj0: [[
    '**Диққат — баръакси англисӣ:**',
    '**Диққат — инкори ДУКАРАТА:**',
  ]],
  // Сколько
  cmsrcdpbb004kqkq6e8jf4fvd: [[
    'Дар русӣ барои пурсидани миқдор **ЯК** калима кифоя аст — фарқи "how much/how many"-и англисӣ вуҷуд надорад:',
    'Дар русӣ барои пурсидани миқдор **ЯК** калима кифоя аст — айнан мисли «чанд»-и тоҷикӣ:',
  ]],
  // Замони ҳозираи давомдор
  cmsreixe7004potn53art0wl6: [
    [
      'Русский **НЕ ИМЕЕТ** отдельной формы "давомдор" (continuous) мисли англисӣ (be + -ing) — замони ҳозираи оддии феъли номукаммал АЛЛАКАЙ маънои амали ҳозиразамонро дорад:',
      'Дар русӣ шакли ҷудогонаи «давомдор» ТАМОМАН НЕСТ — замони ҳозираи оддии феъли номукаммал АЛЛАКАЙ маънои амали ҳозиразамонро дорад:',
    ],
    [
      'Ҳамин феъли якхела ҳам «одат» ва ҳам «ҳозир» — контекст фарқ мекунад, бар хилофи англисӣ ки ду шакли ҷудогона дорад.',
      'Ҳамин феъли якхела ҳам «одат» ва ҳам «ҳозир» — контекст фарқ мекунад. Дар тоҷикӣ «мехонам» ва «дар ҳоли хондан ҳастам» ду шакланд; дар русӣ ҳарду **читаю**.',
    ],
  ],
};

for (const [id, pairs] of Object.entries(EN_FIX)) {
  const rows = await sql`SELECT id,"titleTranslated" tt, explanation FROM "GrammarTopic" WHERE id=${id}`;
  if (rows.length === 0) { console.log(`  ⚠️  мавзӯъ ёфт нашуд: ${id}`); continue; }
  const r = rows[0];
  const next = swap(r.explanation, pairs, r.tt);
  if (next === r.explanation) { console.log(`  ✓ ${r.tt}: аллакай тоза`); continue; }
  console.log(`  ● ${r.tt}`);
  if (APPLY) await sql`UPDATE "GrammarTopic" SET explanation=${next} WHERE id=${id}`;
  changed++;
}

// Унвони англисии мавзӯи «Есть / нет»
{
  const rows = await sql`SELECT id,"titleTranslated" tt FROM "GrammarTopic" WHERE id='cmscdzqo5005jiy3lm6h9z7h2'`;
  const want = 'Ҳаст / нест';
  if (rows.length && rows[0].tt !== want) {
    console.log(`  ● унвон: «${rows[0].tt}» → «${want}»  (унвон ҳам англисӣ буд)`);
    if (APPLY) await sql`UPDATE "GrammarTopic" SET "titleTranslated"=${want} WHERE id=${rows[0].id}`;
    changed++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// F6 · Истилоҳи ҷинс — тоҷикӣ ва русӣ ҷуфт мешаванд
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n  ─── F6 · Истилоҳи ҷинс (дарс ↔ машқ) ───\n');

const GENDER_ID = 'cmsc41zyf0017558f08q1hkko';
const GENDER_PAIRS = [
  ['- **Ҳамсадо** дар охир → **муздаккар** (он): стол, дом, друг',
   '- **Ҳамсадо** дар охир → **муздаккар** = **мужской род** (он): стол, дом, друг'],
  ['- **-а / -я** дар охир → **муаннас** (она): книга, семья',
   '- **-а / -я** дар охир → **муаннас** = **женский род** (она): книга, семья'],
  ['- **-о / -е** дар охир → **бетараф** (оно): окно, море',
   '- **-о / -е** дар охир → **бетараф** = **средний род** (оно): окно, море'],
];
{
  const r = (await sql`SELECT id, explanation FROM "GrammarTopic" WHERE id=${GENDER_ID}`)[0];
  let next = swap(r.explanation, GENDER_PAIRS, 'ҷинси исм');
  const NOTE = '\n\nДар машқҳо истилоҳи РУСӢ пурсида мешавад — **мужской / женский / средний**. Онҳоро ҳамроҳи тоҷикиаш ёд гиред.';
  if (!next.includes('Дар машқҳо истилоҳи РУСӢ')) next += NOTE;
  if (next === r.explanation) console.log('  ✓ аллакай ҷуфт шудааст');
  else {
    console.log('  ● истилоҳи русӣ ба дарс ҷуфт шуд + эзоҳи машқ илова гардид');
    if (APPLY) await sql`UPDATE "GrammarTopic" SET explanation=${next} WHERE id=${GENDER_ID}`;
    changed++;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// F5 · Кортҳои «⚡ Фарқ аз тоҷикӣ»
// ═══════════════════════════════════════════════════════════════════════════
console.log('\n  ─── F5 · Кортҳои «⚡ Фарқ аз тоҷикӣ» ───\n');

const CONTRAST = {
  // Феъли «быть»
  cmsc0ripz000lulfrc9ye1km7:
    '⚡ **Фарқ аз тоҷикӣ:** дар тоҷикӣ «ҳастам / ҳастӣ / аст» ҲАТМист — бе онҳо ҷумла нопурра мемонад. '
    + 'Дар русӣ баръакс: дар замони ҳозира гузоштани онҳо ХАТОст. «Я **есть** студент» намегӯянд, танҳо «Я студент».',
  // Ҷонишинҳои шахсӣ
  cmsc0rm25001lulfrn9cz9oo1:
    '⚡ **Фарқ аз тоҷикӣ:** тоҷикӣ ЯК «ӯ» дорад — ҳам барои мард, ҳам барои зан. '
    + 'Дар русӣ СЕ шакл ҳаст: **Он** (мард), **Она** (зан), **Оно** (ашё). '
    + 'Интихоб аз ҷинси шахс ё ашё вобаста аст, на аз хоҳиши гӯянда.',
  // Калимаҳои саволӣ
  cmsc41w6l0007558fm6ri53bz:
    '⚡ **Фарқ аз тоҷикӣ:** тоҷикӣ як «куҷо» дорад, русӣ ДУ: **Где** (дар куҷо) ва **Откуда** (аз куҷо). '
    + 'Ҳамчунин барои саволи «ҳа/не» тоҷикӣ «**оё**» мегирад — русӣ ҳеҷ калимаи иловагӣ намегирад, танҳо оҳанг иваз мешавад.',
  // Ҷинси исм
  cmsc41zyf0017558f08q1hkko:
    '⚡ **Фарқ аз тоҷикӣ:** дар забони тоҷикӣ ҷинси грамматикӣ ТАМОМАН вуҷуд надорад — «китоб», «миз», «тиреза» ҳама якхелаанд. '
    + 'Дар русӣ ин мафҳум муҳим аст: ҷинси исм муайян мекунад, ки сифат ва ҷонишин кадом шакл гиранд '
    + '(**мой** дом, **моя** книга, **моё** окно). Ин чизи навест, ки аз забони модарии шумо ёрӣ намегирад — '
    + 'пас ҳар исми навро ҲАМРОҲИ ҷинсаш ёд гиред.',
};

for (const [id, note] of Object.entries(CONTRAST)) {
  const rows = await sql`SELECT id,"titleTranslated" tt, explanation FROM "GrammarTopic" WHERE id=${id}`;
  if (rows.length === 0) { console.log(`  ⚠️  мавзӯъ ёфт нашуд: ${id}`); continue; }
  const r = rows[0];
  if (r.explanation.includes('Фарқ аз тоҷикӣ')) { console.log(`  ✓ ${r.tt}: корт аллакай ҳаст`); continue; }
  const next = r.explanation.trimEnd() + '\n\n' + note;
  console.log(`  ● ${r.tt}: корти ⚡ илова шуд`);
  if (APPLY) await sql`UPDATE "GrammarTopic" SET explanation=${next} WHERE id=${id}`;
  changed++;
}

done(changed);
