// ИСЛОҲИ МУНДАРИҶА — Модулҳои 7 ва 8-и русӣ (+ як фоссили M6, + як сатри M9).
// Манбаъ: `Russian_A1_M7_M8_Audit.md` §5.
//
// ─── T1 · Фоссилҳои англисӣ ────────────────────────────────────────────────
//   M6 #9  «Дар русӣ «some/any» вуҷуд НАДОРАД» — калимаи русиро бо АНГЛИСӢ
//          мефаҳмонад. Ин фоссил дар аудити M5/M6 аз назар афтод, чунки
//          детектори кӯҳна рӯйхати САБТШУДАи ибораҳо буд («to be», «article»)
//          ва ибораи нав дида наметавонист. Детектори нави баръакс
//          (`_ru-latin-scan.mjs`) онро ёфт.
//   M8 #10 «= How many books?» / «= How much water?»
//   M8 #11 «= This is a book» / «(These are books …)»
//          ⚠️ Ҳамчунин «Это китоб» → «Это книга»: ҷумлаи намунавӣ нимаш русӣ,
//          нимаш тоҷикӣ буд.
//   ⏭️ M10 #10 ҳам фоссили вазнин дорад — БЕРУН аз ҳудуди ин скрипт.
//
// ─── T2 · Тарҷума ва унвонҳо ───────────────────────────────────────────────
//   «Пожалуйста» → «**Меарзад**» дар M8 #14 ва M9 #13. «Меарзад» = «арзиш
//   дорад», яъне БАРЪАКСИ маънои дуруст. Луғати худи курс (M1) «Не за что» =
//   «Хоҳиш мекунам» мегӯяд, ва M10 «Марҳамат» истифода мебарад. → «Хоҳиш
//   мекунам» (шакли худи курс).
//
//   Унвонҳо: ҳамон қоидаи каноние, ки дар M5/M6 истифода шуд —
//   `Грамматика: <тоҷикӣ бо ҳарфи хурд>`. Ду қарори иловагӣ:
//     • M7 #10 корти дарс РУСӢ буд («есть / нет») — тибқи дархост ба тоҷикӣ.
//     • M8 #10/#11 унвонҳо дар ҲАР ДУ сутун пурра русӣ буданд. Ҳамон мушкил.
//       Тибқи намунаи мавҷуд («немного / несколько (каме / якчанд)») глоси
//       кӯтоҳи тоҷикӣ илова мешавад. Ин аз «яксонсозии» соф каме васеътар аст
//       ва дар гузориш ошкоро қайд шудааст.
//
// ─── T3 · 21 тавзеҳи ХОЛӢ ──────────────────────────────────────────────────
//   14-тояш дар ДУ имтиҳони ниҳоӣ. M8 #17 аз 8 савол танҳо 1 тавзеҳ дошт.
//   Ҳар иқтибос АЙНАН аз матн гирифта шудааст (санҷиши `D-CONTRADICT`), ва
//   ҳар тавзеҳ ҷавоби ДУРУСТро ном мебарад (санҷиши `D-LYING`).
//
// ─── T4 · Варақаҳои ⚡ ─────────────────────────────────────────────────────
//   M7 #9 — кӯҳпораи тезтарини курс: ДУ падежи ТАЪЛИМНАШУДА (предложный ва
//   творительный) дар як ҷумла. Варақа онҳоро ҳамчун ҚОЛАБИ ТАЙЁР мегузорад.
//   M7 #10, M8 #10, M8 #11 — варақаҳои муқоисавии нав.
//   ⚠️ M8 #11 аллакай блоки «⚡ Диққат» дорад, вале он ОГОҲИИ УМУМИст, на
//   муқоиса бо тоҷикӣ. Тибқи дархост он ДАСТ НАМЕХӮРАД; варақаи муқоисавии
//   ВОҚЕӢ дар паҳлӯяш илова мешавад. `splitContrastBlocks` ду блокро дастгирӣ
//   мекунад (тести «ДУ блоки ⚡ ҳарду ҷудо мешаванд»).
//
//   node prisma/fix-ru-m7m8-content.mjs            # намоиш
//   node prisma/fix-ru-m7m8-content.mjs --apply    # иҷро
import { connect, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('Модулҳои 7–8-и русӣ (+M6, +M9) — T1…T4');

const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';
const T = [];
const put = (t, table, col, id, label, before, after) =>
  T.push({ t, table, col, id, label, before, after });

// ═══════════════════════════════════ T1 · фоссилҳои англисӣ (ҷойивазкунӣ дар сатр)
/** Ивази ҳадафноки порча дар дохили матни калон. */
const SNIPPETS = [
  ['T1', 'cmscdeya50006iy3lo2rdx1rm', 'M6 #9 — «some/any»',
    'Дар русӣ «some/any» вуҷуд НАДОРАД. Барои миқдори номуайян ду калима ҳаст:',
    'Дар русӣ барои миқдори номуайян ду калима ҳаст:'],

  ['T1', 'cmsrcdpbb004kqkq6e8jf4fvd', 'M8 #10 — «How many books?»',
    '- **Сколько книг?** (родительныйи ҷамъ — шумурдашаванда) = How many books?',
    '- **Сколько книг?** (родительныйи ҷамъ — шумурдашаванда) — чанд китоб?'],
  ['T1', 'cmsrcdpbb004kqkq6e8jf4fvd', 'M8 #10 — «How much water?»',
    '- **Сколько воды?** (родительныйи танҳо — шумурданашаванда) = How much water?',
    '- **Сколько воды?** (родительныйи танҳо — шумурданашаванда) — чӣ қадар об?'],

  ['T1', 'cmsrcdt4k005kqkq691ywgzdj', 'M8 #11 — «This is a book» / «These are books»',
    '⚡ Диққат: вақте «это»/«то» ҳамчун ХАБАР меояд («Это китоб» = This is a book), он ҳатто бо ҷамъ ҳам ТАҒЙИР НАМЕЁБАД: **Это книги.** (These are books — на «Эти книги»-и хабарӣ).',
    '⚡ Диққат: вақте «это»/«то» ҳамчун ХАБАР меояд («Это книга» = ин китоб аст), он ҳатто бо ҷамъ ҳам ТАҒЙИР НАМЕЁБАД: **Это книги.** (ин китобҳо ҳастанд — на «Эти книги»-и хабарӣ).'],
];

// ═══════════════════════════════════ T2a · «Меарзад» → «Хоҳиш мекунам»
put('T2a', 'DialogueLine', 'translation', 'cmsrcdxzo006yqkq6wukv68p9',
  'M8 #14 «Пожалуйста.»', 'Меарзад.', 'Хоҳиш мекунам.');
put('T2a', 'DialogueLine', 'translation', 'cmsrdkqxo005f13pc1auo130n',
  'M9 #13 «Пожалуйста.»', 'Меарзад.', 'Хоҳиш мекунам.');

// ═══════════════════════════════════ T2b · унвонҳо (ҳар ду сутун ба ЯК арзиш)
const TITLES = [
  ['M7 #9',  'cmscdzxzm007tiy3lvnmdb8q0', 'cmscdznul004niy3luh3hyzji', 'Грамматика: пешояндҳои ҷой'],
  ['M7 #10', 'cmscdzy64007viy3ltt5df8bo', 'cmscdzqo5005jiy3lm6h9z7h2', 'Грамматика: ҳаст / нест'],
  ['M8 #10', 'cmsrcdsy2005iqkq6we0ajvig', 'cmsrcdpbb004kqkq6e8jf4fvd', 'Грамматика: сколько (чанд)'],
  ['M8 #11', 'cmsrcdw3v006gqkq6jusq35so', 'cmsrcdt4k005kqkq691ywgzdj', 'Грамматика: этот / тот / эти / те (ин / он)'],
];

// ═══════════════════════════════════ T3 · 21 тавзеҳ
const EXPL = [
  // ── M7 #11 ──
  ['cmsqh7p8l00092fx9d6gi133k', 'M7 #11 «Где большой стол?»',
    'Матн мегӯяд: «На кухне есть большой стол» — дар ошхона.'],
  // ── M7 #14 · такрор ──
  ['cmscdzvor0073iy3ltldw8d0p', 'M7 #14 «Где книга?»',
    'Матн мегӯяд: «Книга на столе» — дар болои миз.'],
  ['cmscdzvur0075iy3lj513cvs4', 'M7 #14 «Где сумка?»',
    'Матн мегӯяд: «Сумка под стулом» — дар зери курсӣ.'],
  // ── M7 #16 · ИМТИҲОН ──
  ['cmsqh7qhj000b2fx9ychtb1yx', 'M7 #16 «Где кровать?»',
    'Матн мегӯяд: «Кровать стоит рядом с окном» — дар паҳлӯи тиреза.'],
  ['cmsqh7qo2000d2fx9cq0pil0w', 'M7 #16 «Что на столе?»',
    'Матн мегӯяд: «На столе есть лампа и книга» — чароғ ва китоб.'],
  ['cmsqh7quc000f2fx9va4el8n7', 'M7 #16 «Сколько стульев?»',
    'Матн мегӯяд: «В комнате два стула» — ду курсӣ.'],
  ['cmscdzwba0079iy3l6r9dwfy5', 'M7 #16 «Хонаи ман тоза аст»',
    'Тоза = чистый. Пас: «Мой дом чистый». (чиркин = грязный.)'],
  ['cmscdzwng007diy3ltecztjvu', 'M7 #16 «Дар болои миз»',
    'Дар болои … = на … . Пас: «на столе». (дар зери = под, дар дохили = в.)'],
  ['cmscdzwte007fiy3lbf5a5dv3', 'M7 #16 «Ошхона»',
    'Ошхона = Кухня. (ҳаммом = ванная, ҳуҷраи хоб = спальня.)'],

  // ── M8 #12 · хониш ──
  ['cmsrcdypi0076qkq64nxiwng6', 'M8 #12 «Сколько стоит рубашка?»',
    'Матн мегӯяд: «Она стоит десять долларов» — даҳ доллар.'],
  ['cmsrcdyvi0078qkq60k2c8htf', 'M8 #12 «Где его деньги?»',
    'Матн мегӯяд: «У меня есть деньги в пакете» — дар пакет.'],
  ['cmsrcdz1t007aqkq6q5twgrcb', 'M8 #12 «Что даёт ему кассир?»',
    'Матн мегӯяд: «она даёт мне чек» — хазинадор чек медиҳад.'],
  // ── M8 #15 · такрор ──
  ['cmsrce0ny007sqkq6c7efqt6p', 'M8 #15 «Куда я иду?»',
    'Матн мегӯяд: «Я иду в магазин с деньгами» — ба мағоза.'],
  ['cmsrce0tx007uqkq657bze3hx', 'M8 #15 «Что я хочу купить?»',
    'Матн мегӯяд: «Я хочу купить красную рубашку и чёрные брюки» — курти сурх.'],
  // ── M8 #17 · ИМТИҲОН (7 аз 8 хомӯш буд) ──
  ['cmsrce1hi0080qkq6jkn58pls', 'M8 #17 «Что им нужно?»',
    'Матн мегӯяд: «Нам нужны хлеб, молоко и яйца» — нон, шир ва тухм.'],
  ['cmsrce1ni0082qkq6d12dt577', 'M8 #17 «Почему не покупает туфли?»',
    'Матн мегӯяд: «Я хочу те туфли, но они дорогие» — қиматанд.'],
  ['cmsrce1tn0084qkq6gncieydf', 'M8 #17 «Как платит мама?»',
    'Матн мегӯяд: «Мама платит картой» — бо корт пардохт мекунад.'],
  ['cmsrce1zv0086qkq6ftzmuenk', 'M8 #17 «Ин чанд пул меистад?»',
    'Чанд пул меистад = сколько стоит. Пас: «Сколько это стоит?»'],
  ['cmsrce2600088qkq6sh1c9ce4', 'M8 #17 «___ туфли»',
    '«Туфли» ҷамъ аст ва наздик — пас эти. (этот — мардонаи танҳо, эта — занонаи танҳо.)'],
  ['cmsrce2di008aqkq6x6frqkk6', 'M8 #17 «Ман бо корт пардохт мекунам»',
    'Пардохт кардан = платить, бо корт = картой. Пас: «Я плачу картой».'],
  ['cmsrce2lg008cqkq6xozd2vgi', 'M8 #17 «Хазинадор»',
    'Хазинадор = Кассир. (фурӯшанда = продавец, харидор = покупатель.)'],
];
for (const [id, label, after] of EXPL) {
  put('T3', 'ComprehensionQuestion', 'explanation', id, label, null, after);
}

// ═══════════════════════════════════ T4 · варақаҳои ⚡
const CARDS = [
  ['cmscdznul004niy3luh3hyzji', 'M7 #9 · Пешояндҳои ҷой (ПОЯБАНДӢ)',
    '⚡ **Фарқ аз тоҷикӣ:** дар тоҷикӣ пешоянд исмро ТАҒЙИР НАМЕДИҲАД — «дар болои **миз**», «дар зери **курсӣ**»: калима ҳамон тавр мемонад. Дар русӣ баъди пешояндҳо (**в**, **на**, **под**, **рядом с**) охири калима тағйир меёбад: стол → на стол**е**, под стол**ом**.\n\n**Дар сатҳи A1 ин қоидаҳоро пурра аз ёд кардан шарт нест** — фақат ҳамин ибораҳоро ҳамчун як қолаби тайёр дар хотир нигоҳ доред: «на столе», «под столом», «в комнате», «рядом с окном».'],

  ['cmscdzqo5005jiy3lm6h9z7h2', 'M7 #10 · Ҳаст / нест',
    '⚡ **Фарқ аз тоҷикӣ:** «ҳаст» ва «нест»-и тоҷикӣ ҳеҷ чизро тағйир намедиҳанд. Дар русӣ **есть** низ ҳамеша якхела аст — вале инкори **нет** охири исмро иваз мекунад: телевизор → в комнате **нет телевизора**. Пас «ҳаст» осон аст, «нест» диққат мехоҳад.'],

  ['cmsrcdpbb004kqkq6e8jf4fvd', 'M8 #10 · Сколько',
    '⚡ **Фарқ аз тоҷикӣ:** тоҷикӣ «чанд» мегӯяд ва исм ҳамон тавр мемонад — «чанд китоб», «чӣ қадар об». Дар русӣ баъди **сколько** охири исм ҲАМЕША иваз мешавад: книги → сколько книг, вода → сколько воды. Дар сатҳи A1 ҷадвали пурра лозим нест — танҳо ду қолабро ёд гиред: «Сколько + …?» ва «Сколько стоит …?».'],

  ['cmsrcdt4k005kqkq691ywgzdj', 'M8 #11 · Этот / Тот (варақаи ДУЮМ)',
    '⚡ **Фарқ аз тоҷикӣ:** тоҷикӣ ду калима дорад — «**ин**» (наздик) ва «**он**» (дур) — ва онҳо ҳеҷ гоҳ тағйир намеёбанд. Дар русӣ ҳамин ду мафҳум ШАШ шакл доранд: этот / эта / это / эти ва тот / та / то / те. Пеш аз интихоб ду савол диҳед: исм кадом ҷинс дорад, ва танҳост ё ҷамъ?'],
];

// ═══════════════════════════════════ ИҶРО
let changed = 0, already = 0;
const drift = [];

// ── T1: ивази порча дар дохили `explanation`.
for (const [t, id, label, oldS, newS] of SNIPPETS) {
  const r = await sql`SELECT explanation ex FROM "GrammarTopic" WHERE id=${id}`;
  if (!r.length) { drift.push({ label }); console.log(`  ❌ [${t}] ${label} — сатр нест`); continue; }
  const cur = r[0].ex;
  if (cur.includes(newS) && !cur.includes(oldS)) { already++; console.log(`  ✓ [${t}] ${label} — аллакай тоза`); continue; }
  if (!cur.includes(oldS)) {
    drift.push({ label });
    console.log(`  ⚠️  [${t}] ${label} — порчаи кӯҳна ЁФТ НАШУД, даст нарасонд`);
    continue;
  }
  console.log(`  → [${t}] ${label}`);
  if (APPLY) await sql`UPDATE "GrammarTopic" SET explanation=${cur.replace(oldS, newS)} WHERE id=${id}`;
  changed++;
}

// ── T2b: унвонҳо (ҳар ду сутун).
for (const [label, lid, gid, want] of TITLES) {
  for (const [table, id] of [['Lesson', lid], ['GrammarTopic', gid]]) {
    const r = await sql`SELECT "titleTranslated" t FROM ${sql.unsafe(`"${table}"`)} WHERE id=${id}`;
    if (!r.length) { drift.push({ label }); console.log(`  ❌ [T2b] ${label} ${table} — сатр нест`); continue; }
    if (r[0].t === want) { already++; console.log(`  ✓ [T2b] ${label} ${table} — аллакай «${want}»`); continue; }
    console.log(`  → [T2b] ${label} ${table}: «${r[0].t}» → «${want}»`);
    if (APPLY) await sql`UPDATE ${sql.unsafe(`"${table}"`)} SET "titleTranslated"=${want} WHERE id=${id}`;
    changed++;
  }
}

// ── T2a + T3: сатрҳои оддӣ.
for (const x of T) {
  const rows = await sql`
    SELECT ${sql.unsafe(`"${x.col}"`)} AS v FROM ${sql.unsafe(`"${x.table}"`)} WHERE id=${x.id}`;
  if (!rows.length) { drift.push(x); console.log(`  ❌ [${x.t}] ${x.label} — сатр нест`); continue; }
  const cur = rows[0].v;
  if (cur === x.after) { already++; console.log(`  ✓ [${x.t}] ${x.label} — аллакай тоза`); continue; }
  const ok = x.before === null ? isBlank(cur) : cur === x.before;
  if (!ok) {
    drift.push(x);
    console.log(`  ⚠️  [${x.t}] ${x.label} — ҲОЛАТИ ГАЙРИЧАШМДОШТ, даст нарасонд`);
    console.log(`        ҷорӣ: ${JSON.stringify(String(cur).slice(0, 90))}`);
    continue;
  }
  console.log(`  → [${x.t}] ${x.label}`);
  if (APPLY) {
    await sql`UPDATE ${sql.unsafe(`"${x.table}"`)}
              SET ${sql.unsafe(`"${x.col}"`)}=${x.after} WHERE id=${x.id}`;
  }
  changed++;
}

// ── T4: варақаҳо. M8 #11 аллакай «⚡ Диққат» дорад, пас санҷиш аз рӯи
//    «Фарқ аз тоҷикӣ» меравад, на аз рӯи худи «⚡».
console.log('');
for (const [id, label, card] of CARDS) {
  const r = await sql`SELECT explanation ex FROM "GrammarTopic" WHERE id=${id}`;
  if (!r.length) { drift.push({ label }); console.log(`  ❌ [T4] ${label} — сатр нест`); continue; }
  if (r[0].ex.includes('Фарқ аз тоҷикӣ')) { already++; console.log(`  ✓ [T4] ${label} — варақа аллакай ҳаст`); continue; }
  const next = r[0].ex.trimEnd() + '\n\n' + card;
  console.log(`  → [T4] ${label}  (+${card.length} ҳарф)`);
  if (APPLY) await sql`UPDATE "GrammarTopic" SET explanation=${next} WHERE id=${id}`;
  changed++;
}

// ═══════════════════════════════════ ТАСДИҚИ МУСТАҚИЛ
console.log('\n  ─── Тасдиқи мустақил ───\n');
const M7 = 'cmqan1jlx00fps2t1lbpwlqxw', M8 = 'cmqan1m8y00gls2t1wsthkb9k';
const cov = await sql`
  SELECT count(*)::int t, count(*) FILTER (WHERE q.explanation IS NOT NULL AND btrim(q.explanation)<>'')::int f
  FROM "ComprehensionExercise" ce JOIN "Lesson" l ON l."comprehensionId"=ce.id
  JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id WHERE l."moduleId" IN (${M7},${M8})`;
const zap = await sql`
  SELECT count(*)::int t, count(*) FILTER (WHERE g.explanation LIKE '%Фарқ аз тоҷикӣ%')::int f
  FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id WHERE l."moduleId" IN (${M7},${M8})`;
const mism = await sql`
  SELECT count(*)::int c FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
  WHERE l."moduleId" IN (${M7},${M8}) AND g."titleTranslated" <> l."titleTranslated"`;
const merz = await sql`SELECT count(*)::int c FROM "DialogueLine" WHERE translation ~ 'Меарзад'`;
console.log(`  Фарогирии тавзеҳ (M7+M8): ${cov[0].f}/${cov[0].t}`);
console.log(`  Варақаи «Фарқ аз тоҷикӣ» (M7+M8): ${zap[0].f}/${zap[0].t}`);
console.log(`  Номувофиқатии унвон (M7+M8): ${mism[0].c}`);
console.log(`  «Меарзад» дар тамоми база: ${merz[0].c}`);

if (drift.length) console.log(`\n  ⚠️  ${drift.length} ҳадаф даст нарасид.`);
done(changed, already ? `${already} ҳадаф аллакай тоза буд (идемпотентӣ).` : '');
