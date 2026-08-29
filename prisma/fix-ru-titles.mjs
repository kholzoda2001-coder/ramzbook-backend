// ФАЗАИ 3 · ВАЗИФАИ 2 — тозакунии унвонҳои МОДУЛ ва ДАРСи курси русӣ (M7, M8).
//
// ─── M7 · Модулҳо ───────────────────────────────────────────────────────────
//  (a) Префикси «Модуль 5: » / «Модули 5: » аз ҲАР ДУ сутун бардошта мешавад.
//      ЧАРО аз сутуни русӣ ҳам: `continue_lesson_card.dart:229` маҳз
//      `module.title`-и ХОМро дар корти «Идома» чоп мекунад — хонанда он ҷо
//      «Модуль 5: Распорядок дня» медид. (Дар `course_roadmap_screen.dart:657`
//      аллакай як тозакунии муваққатии тарафи мизоҷ ҳаст; баъди ин скрипт вай
//      бе зарар бекор мешавад ва барои курсҳои дигар мемонад.)
//  (b) Ҳарфи калон: M0–M3 бо услуби англисии Title Case буданд
//      («Оила ва Одамон»), M4–M11 бо ҳарфи хурд. Ҳама ба SENTENCE CASE оварда
//      мешаванд — банди №14-и Farzona: тоҷикӣ Title Case надорад.
//
// ─── M8 · Дарсҳо (танҳо се унвони мушаххас) ─────────────────────────────────
//  L0 — мазмунаш хайрбод ҳам дорад (До свидания, Пока), пас ТОҶИКӢ дуруст буд
//       ва РУСӢ нопурра: `Приветствия` → `Приветствия и прощания`.
//  L5 — мазмунаш саломи вақти рӯз аст, пас РУСӢ дуруст буд ва ТОҶИКӢ суст:
//       «Вақтҳои Рӯз» → «Саломҳо аз рӯи вақти рӯз».
//  L7 — истилоҳи грамматикӣ: «фоилӣ» → «шахсӣ».
//
// ─── БЕХАТАРӢ ───────────────────────────────────────────────────────────────
// Норматори КӮР-КӮРОНАИ Title Case (`fixTajik` дар `p0-phase3-normalize.mjs`)
// ИСТИФОДА НАМЕШАВАД: вай «душанбе»-и рӯзи ҳафтаро ба «Душанбе»-и шаҳр табдил
// медиҳад ва баръакс (ниг. [[ramz-db-scripts-local]]). Ин ҷо ба ҷои он:
//   • рӯйхати СИЁҲИ исмҳои хос — ҳеҷ гоҳ хурд намешаванд;
//   • матни дохили «…» тамоман даст намехӯрад;
//   • калимаи ҲАМА-КАЛОН (ОАЭ) даст намехӯрад;
//   • калимаи аввали ҳар ҷумла калон мемонад (дупартоб ҷумла НАМЕКУШОЯД);
//   • ҳарфи ЯКТА (Ғ, Ӯ) — иқтибос ё сарҳарфи ном — даст намехӯрад;
//   • ҳар тағйирот пеш аз навиштан сатр-ба-сатр чоп мешавад.
//
//   node prisma/fix-ru-titles.mjs            # намоиш
//   node prisma/fix-ru-titles.mjs --apply    # иҷро
//   node prisma/fix-ru-titles.mjs --selftest # танҳо санҷиши табдил
//   node prisma/fix-ru-titles.mjs --lessons  # ҳарфи калони унвони ДАРСҳо низ
//   node prisma/fix-ru-titles.mjs --lesson-prefix  # префикси «Дарси N:»/«Урок N:»
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';

const LESSONS_CASE = process.argv.includes('--lessons');
const LESSON_PREFIX = process.argv.includes('--lesson-prefix');

import { sentenceCase, stripModulePrefix, stripLessonPrefix } from './_ru-title-case.mjs';

// ── Худсанҷӣ ────────────────────────────────────────────────────────────────
if (process.argv.includes('--selftest')) {
  const CASES = [
    ['Модули 5: Корҳои рӯзмарра ва Амалҳо', 'Корҳои рӯзмарра ва амалҳо'],
    ['Модуль 12: Природа, школа и чувства', 'Природа, школа и чувства'],
    ['Салом ва Муоширати Ибтидоӣ', 'Салом ва муоширати ибтидоӣ'],
    ['Дар бораи Ман', 'Дар бораи ман'],
    ['Оила ва Одамон', 'Оила ва одамон'],
    ['Шаҳрҳо ва самтҳо', 'Шаҳрҳо ва самтҳо'], // аллакай дуруст
    ['Грамматика: Феъли «Будан»', 'Грамматика: феъли «Будан»'], // дохили «» даст нахӯрд
    ['Шунавоӣ: Шиносоӣ', 'Шунавоӣ: шиносоӣ'],
    // Домҳо:
    ['Сафар ба Душанбе', 'Сафар ба Душанбе'], // шаҳр — калон мемонад
    ['Кишвари ОАЭ', 'Кишвари ОАЭ'], // ихтисор
    ['Забони Русӣ ва Тоҷикӣ', 'Забони Русӣ ва Тоҷикӣ'], // номи забон ҳифз
    ['Дӯсти ман Алӣ', 'Дӯсти ман Алӣ'],
    ['Ҳарфҳои Ғ ва Ӯ', 'Ҳарфҳои Ғ ва Ӯ'], // якҳарфа: rest холӣ → ҳама-калон
  ];
  const LESSON_CASES = [
    ['Дарси 7: калимаҳои самт', 'Калимаҳои самт'],
    ['Дарси 8: феълҳои бозгашта (-ся)', 'Феълҳои бозгашта (-ся)'],
    ['Урок 1: Числа 1-10', 'Числа 1-10'],
    ['Дарси 14: шунавоӣ: чор фасли сол', 'Шунавоӣ: чор фасли сол'],
    ['Рақамҳои 1-10', 'Рақамҳои 1-10'], // префикс надорад — даст намехӯрад
    ['Салом ва хайрбод', 'Салом ва хайрбод'],
    ['Дарси 3:', 'Дарси 3:'], // танҳо префикс — бехатар: даст намезанем
    ['Дарси хониш', 'Дарси хониш'], // «Дарси» бе рақам — префикс НЕСТ
  ];
  let pass = 0, fail = 0;

  console.log('');
  console.log('  Худсанҷии табдили ҲАРФИ КАЛОН:');
  console.log('');
  for (const [inp, want] of CASES) {
    const got = sentenceCase(stripModulePrefix(inp));
    const ok = got === want;
    ok ? pass++ : fail++;
    console.log(`  ${ok ? '✓' : '✗'} «${inp}»`);
    if (!ok) {
      console.log(`      интизор: «${want}»`);
      console.log(`      натиҷа:  «${got}»`);
    }
  }

  console.log('');
  console.log('  Худсанҷии буридани префикси ДАРС:');
  console.log('');
  for (const [inp, want] of LESSON_CASES) {
    const got = stripLessonPrefix(inp);
    const ok = got === want;
    ok ? pass++ : fail++;
    console.log(`  ${ok ? '✓' : '✗'} «${inp}»`);
    if (!ok) {
      console.log(`      интизор: «${want}»`);
      console.log(`      натиҷа:  «${got}»`);
    }
  }

  console.log('');
  console.log(`  ${pass} гузашт · ${fail} афтод`);
  console.log('');
  process.exit(fail ? 1 : 0);
}

// ── Иҷро ────────────────────────────────────────────────────────────────────
const sql = connect();
banner('ФАЗАИ 3 · Т2 — унвонҳои модул ва дарси русӣ (M7, M8)');

let changed = 0;

// ═══ M7 · Модулҳо ═════════════════════════════════════════════════════════
console.log('  ─── M7 · Модулҳо: префикс + ҳарфи калон ───\n');

const modules = await sql`
  SELECT id, title, "titleTranslated", "order" FROM "Module"
  WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;

for (const m of modules) {
  // Русӣ: танҳо префикс. Ҳарфи калони русӣ қоидаи ХУДАШро дорад — даст намезанем.
  const nextTitle = stripModulePrefix(m.title);
  // Тоҷикӣ: префикс + sentence case.
  const nextTt = sentenceCase(stripModulePrefix(m.titleTranslated));

  if (nextTitle === m.title && nextTt === m.titleTranslated) {
    console.log(`  ✓ M${m.order} аллакай тоза (идемпотент)`);
    continue;
  }
  console.log(`  ● M${m.order}`);
  if (nextTitle !== m.title) console.log(`      ru: «${m.title}»\n        → «${nextTitle}»`);
  if (nextTt !== m.titleTranslated) console.log(`      tg: «${m.titleTranslated}»\n        → «${nextTt}»`);
  if (APPLY) {
    await sql`UPDATE "Module" SET title=${nextTitle}, "titleTranslated"=${nextTt} WHERE id=${m.id}`;
  }
  changed++;
}

// ═══ M8 · Се унвони мушаххаси дарс ════════════════════════════════════════
console.log('\n  ─── M8 · Унвонҳои дарси Модули 0 ───\n');

// Ҳадаф аз рӯи унвони ҶОРӢ ёфта мешавад, на аз рӯи `order` — то агар тартиб
// дигар шавад, скрипт дарси НОДУРУСТро иваз накунад.
const LESSON_FIXES = [
  {
    match: 'Приветствия',
    exact: true, // «Приветствия по времени» набояд ин ҷо афтад
    title: 'Приветствия и прощания',
    titleTranslated: null,
    why: 'мазмун хайрбод ҳам дорад (До свидания, Пока) — унвони русӣ нопурра буд',
  },
  {
    match: 'Приветствия по времени',
    exact: true,
    title: null,
    titleTranslated: 'Саломҳо аз рӯи вақти рӯз',
    why: '«Вақтҳои Рӯз» мафҳуми САЛОМро гум карда буд',
  },
  {
    match: 'Грамматика: Личные местоимения',
    exact: true,
    title: null,
    titleTranslated: 'Грамматика: ҷонишинҳои шахсӣ',
    why: 'истилоҳи дурусти тоҷикӣ «шахсӣ» аст, на «фоилӣ»',
  },
];

const m0 = modules.find((m) => m.order === 0);
const lessons = await sql`
  SELECT id, title, "titleTranslated", "order" FROM "Lesson"
  WHERE "moduleId"=${m0.id} ORDER BY "order"`;

for (const fix of LESSON_FIXES) {
  const hits = lessons.filter((l) => (fix.exact ? l.title === fix.match : l.title.includes(fix.match)));
  if (hits.length !== 1) {
    console.log(`  ⚠️  «${fix.match}»: ${hits.length} мувофиқат — ГУЗАШТ (бехатарӣ)`);
    continue;
  }
  const l = hits[0];
  const nextTitle = fix.title ?? l.title;
  const nextTt = fix.titleTranslated ?? l.titleTranslated;
  if (nextTitle === l.title && nextTt === l.titleTranslated) {
    console.log(`  ✓ L${l.order} аллакай дуруст (идемпотент)`);
    continue;
  }
  console.log(`  ● L${l.order} — ${fix.why}`);
  if (nextTitle !== l.title) console.log(`      ru: «${l.title}»\n        → «${nextTitle}»`);
  if (nextTt !== l.titleTranslated) console.log(`      tg: «${l.titleTranslated}»\n        → «${nextTt}»`);
  if (APPLY) {
    await sql`UPDATE "Lesson" SET title=${nextTitle}, "titleTranslated"=${nextTt} WHERE id=${l.id}`;
  }
  changed++;
}

// ═══ Ихтиёрӣ · ҳарфи калони унвони ҲАМАИ дарсҳо ═══════════════════════════
if (LESSONS_CASE) {
  console.log('\n  ─── (--lessons) Sentence case барои унвони ҲАМАИ дарсҳо ───\n');
  const all = await sql`
    SELECT l.id, l."titleTranslated", l."order" lo, m."order" mo
    FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
    WHERE m."courseId"=${COURSE_RU_A1} ORDER BY m."order", l."order"`;
  let n = 0;
  for (const l of all) {
    const next = sentenceCase(l.titleTranslated);
    if (next === l.titleTranslated) continue;
    console.log(`  ● M${l.mo}L${l.lo}  «${l.titleTranslated}» → «${next}»`);
    if (APPLY) {
      await sql`UPDATE "Lesson" SET "titleTranslated"=${next} WHERE id=${l.id}`;
    }
    n++;
  }
  changed += n;
  console.log(`\n  ${n} унвони дарс`);
}

// ═══ Ихтиёрӣ · префикси «Дарси N:» / «Урок N:» аз унвони дарс ══════════════
//
// Роҳнамо дарсҳоро ХУДАШ рақам мезанад, пас рақами дохили унвон дубора мешавад:
// корбар «Дарси 9: Дарси 8: феълҳои бозгашта» мебинад. Бадтараш, рақамҳои
// сабтшуда ҷой-ҷой ғалатанд — M4 ду «Дарси 8» дорад ва рақами префикс ба
// `order`-и воқеӣ намемонад (M3L1 = «Дарси 2»).
//
// Ҳар ду сутун ҶУДОГОНА коркард мешавад: баъзе дарсҳо префиксро танҳо дар як
// тараф доранд (M3L0 русӣ «Урок 1: …», тоҷикӣ бе префикс).
if (LESSON_PREFIX) {
  console.log('');
  console.log('  ─── (--lesson-prefix) Буридани «Дарси N:» / «Урок N:» ───');
  console.log('');
  const all = await sql`
    SELECT l.id, l.title, l."titleTranslated", l."order" lo, m."order" mo
    FROM "Lesson" l JOIN "Module" m ON m.id=l."moduleId"
    WHERE m."courseId"=${COURSE_RU_A1} ORDER BY m."order", l."order"`;
  let n = 0;
  const seen = new Map(); // барои ёфтани унвони ТАКРОРӢ дар як модул
  for (const l of all) {
    const nextTitle = stripLessonPrefix(l.title);
    const nextTt = stripLessonPrefix(l.titleTranslated);
    if (nextTitle === l.title && nextTt === l.titleTranslated) continue;

    console.log(`  ● M${l.mo}L${l.lo}`);
    if (nextTitle !== l.title) console.log(`      ru: «${l.title}» → «${nextTitle}»`);
    if (nextTt !== l.titleTranslated) console.log(`      tg: «${l.titleTranslated}» → «${nextTt}»`);
    if (APPLY) {
      await sql`UPDATE "Lesson" SET title=${nextTitle}, "titleTranslated"=${nextTt} WHERE id=${l.id}`;
    }
    n++;
    const key = `${l.mo}::${nextTt}`;
    seen.set(key, (seen.get(key) ?? 0) + 1);
  }
  changed += n;
  // Баъди буридани рақам ду дарси ЯК модул метавонанд як унвон гиранд — он гоҳ
  // рӯйхат ду сатри якхела нишон медиҳад ва бояд ДАСТӢ ҳал шавад.
  const dups = [...seen.entries()].filter(([, c]) => c > 1);
  console.log('');
  console.log(`  ${n} унвони дарс`);
  if (dups.length) {
    console.log(`  ⚠️  унвони ТАКРОРӢ дар як модул: ${dups.map(([k]) => k).join(' | ')}`);
  } else {
    console.log('  · унвони такрорӣ дар як модул нест ✓');
  }
} else {
  console.log('');
  console.log('  ℹ️  Барои буридани префикси «Дарси N:» → --lesson-prefix');
}

// ── Тасдиқ ────────────────────────────────────────────────────────────────
const left = await sql`
  SELECT count(*)::int c FROM "Module"
  WHERE "courseId"=${COURSE_RU_A1}
    AND (title ~ '^Модул' OR "titleTranslated" ~ '^Модул')`;
console.log(`\n  Модулҳое ки ҳанӯз префикс доранд: ${left[0].c}`);

done(changed);
