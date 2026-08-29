// ─────────────────────────────────────────────────────────────────────────────
// 01 — Рӯзҳои ҳафта ва моҳҳои сол бо ҳарфи ХУРД
//
// ЧАРО. Дар имлои тоҷикӣ рӯзҳои ҳафта ва моҳҳои сол ҳамеша бо ҳарфи хурд
// навишта мешаванд. Дар курс 24 корт бо ҳарфи калонанд, дар ҳоле ки мисоли
// ХУДИ ҳамон корт бо ҳарфи хурд аст:
//
//   M4·Д6  `Monday` = «Душанбе»  ·  мисол: «Имрӯз душанбе аст.»
//
// Ва як ҳолати вазнинтар: «Душанбе» бо ҳарфи калон дигар рӯзи ҳафта НЕСТ —
// он НОМИ ШАҲР аст. Матни хониши M4·Д12 ҳоло чунин аст:
//
//   EN: "Today is Monday."
//   TG: «Имрӯз Душанбе аст.»   ← «Имрӯз шаҳри Душанбе аст»
//
// Ҳамон ҷумла дар M4·Д13 ва M4·Д15 дуруст навишта шудааст.
//
// ФОИДАИ ИЛОВАГӢ: баъди ин ислоҳ `Monday` = «душанбе» ва `Dushanbe` =
// «Душанбе» ду сатри ГУНОГУН мешаванд, пас `_distractTg` ва навбати SRS
// дигар онҳоро як калима намешуморанд.
//
// Иҷро:  node 01-days-months-case.mjs           (dry-run)
//        node 01-days-months-case.mjs --apply
// ─────────────────────────────────────────────────────────────────────────────
import { connect, loadCourse, loc, Changes, wordRe } from './_lib.mjs';

const DAYS = ['душанбе', 'сешанбе', 'чоршанбе', 'панҷшанбе', 'ҷумъа', 'шанбе', 'якшанбе'];
const MONTHS = ['январ', 'феврал', 'март', 'апрел', 'май', 'июн',
                'июл', 'август', 'сентябр', 'октябр', 'ноябр', 'декабр'];

// Калимаҳои англисие, ки маҳз рӯз/моҳ мефаҳмонанд. Танҳо кортҳои ИНҲО хурд
// карда мешаванд — «Dushanbe» (шаҳр) даст нахӯрда мемонад.
const DAY_MONTH_WORDS = new Set([
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
]);

const cap = (s) => s[0].toUpperCase() + s.slice(1);
const lower = (s) => s[0].toLowerCase() + s.slice(1);

// «Душанбе» ЯГОНА калимаест, ки ҳам рӯзи ҳафта, ҳам номи ШАҲР аст. Ҳамаи
// дигар рӯзҳо ва моҳҳо якмаъноанд. Барои он ишораҳои контекстӣ лозим аст —
// вагарна скрипт «Ӯ дар Душанбе зиндагӣ мекунад»-ро ҳам вайрон мекунад
// (маҳз ҳамин дар кӯшиши аввал рӯй дод).
const AMBIGUOUS = new Set(['душанбе']);
// Пеш аз он рӯзи ҳафта меистад: «Имрӯз душанбе аст», «Рӯзи душанбе…»
const DAY_CUE = /(имрӯз|фардо|дирӯз|рӯзи|рӯзҳои|ҳар|пасфардо)\s*$/iu;
// Пеш аз он ШАҲР меистад: «дар Душанбе», «аз Душанбе», «ба Душанбе»
const CITY_CUE = /(дар|аз|ба|то|шаҳри)\s*$/iu;

/**
 * Шакли КАЛОНИ рӯз/моҳро ба хурд мебарад — танҳо он ҷо, ки маъно равшан аст.
 * Ҳар ҳолати шубҳанокро ба [manual] мегузорад, на ки худсарона ҳал кунад.
 */
function lowerDayMonth(text, manual, tag) {
  if (!text) return text;
  let out = text;
  for (const w of [...DAYS, ...MONTHS]) {
    const Cap = cap(w);
    out = out.replace(
      new RegExp(`(^|[^\p{L}])(${Cap})(?=[^\p{L}]|$)`, 'gu'),
      (m, before, hit, offset) => {
        const head = out.slice(0, offset + before.length);
        const atStart = /(^|[.!?»]\s*)$/u.test(head);

        if (AMBIGUOUS.has(w)) {
          if (CITY_CUE.test(head)) return m;                 // шаҳр — даст нарасон
          if (DAY_CUE.test(head)) return before + lower(hit); // рӯзи ҳафта
          manual.push(`${tag}: «${text.slice(0, 90)}»  ← Душанбе: шаҳр ё рӯз?`);
          return m;
        }
        // Моҳҳо ва дигар рӯзҳо якмаъноанд — ҳатто дар аввали ҷумла.
        if (atStart) return before + lower(hit);
        return before + lower(hit);
      }
    );
  }
  return out;
}

const sql = connect();
const modules = await loadCourse(sql);
const ch = new Changes('01 — Рӯзҳо ва моҳҳо бо ҳарфи хурд');
const manual = [];

for (const mod of modules) {
  for (const L of mod.lessons) {
    const where = loc(mod, L);

    // ── 1. Кортҳои калима: танҳо рӯз/моҳ ───────────────────────────────────
    for (const w of L.words) {
      if (!DAY_MONTH_WORDS.has(w.word.trim().toLowerCase())) continue;
      const tr = (w.translation || '').trim();
      if (!tr || !/^\p{Lu}/u.test(tr)) continue;
      const fixed = lower(tr);
      ch.add({ table: 'Word', id: w.id, field: 'translation',
               from: tr, to: fixed, where: `${where} · корти «${w.word}»` });
    }

    // ── 2. Матн, мисол ва тарҷумаҳо ────────────────────────────────────────
    const texts = [
      ...L.words.flatMap((w) => [
        { table: 'Word', id: w.id, field: 'exampleTrans', val: w.exampleTrans,
          tag: `мисоли «${w.word}»` },
      ]),
      ...(L.grammarTopic?.examples ?? []).map((e) => ({
        table: 'GrammarExample', id: e.id, field: 'translation', val: e.translation,
        tag: 'мисоли грамматика' })),
      ...(L.grammarTopic?.exercises ?? []).flatMap((e) => [
        { table: 'GrammarExercise', id: e.id, field: 'promptTranslated',
          val: e.promptTranslated, tag: 'машқи грамматика' },
        { table: 'GrammarExercise', id: e.id, field: 'explanation',
          val: e.explanation, tag: 'тавзеҳи грамматика' },
      ]),
      ...(L.dialogue?.lines ?? []).map((x) => ({
        table: 'DialogueLine', id: x.id, field: 'translation', val: x.translation,
        tag: 'муколама' })),
      ...(L.comprehension ? [
        { table: 'ComprehensionExercise', id: L.comprehension.id,
          field: 'passageTranslated', val: L.comprehension.passageTranslated,
          tag: 'матни хониш' },
      ] : []),
      ...(L.comprehension?.questions ?? []).flatMap((q) => [
        { table: 'ComprehensionQuestion', id: q.id, field: 'questionTranslated',
          val: q.questionTranslated, tag: 'савол' },
        { table: 'ComprehensionQuestion', id: q.id, field: 'explanation',
          val: q.explanation, tag: 'тавзеҳи савол' },
      ]),
    ];

    for (const t of texts) {
      if (typeof t.val !== 'string' || !t.val) continue;
      const fixed = lowerDayMonth(t.val, manual, `${where} · ${t.tag}`);
      ch.add({ table: t.table, id: t.id, field: t.field,
               from: t.val, to: fixed, where: `${where} · ${t.tag}` });
    }
  }
}

ch.print();

if (manual.length) {
  console.log(`\n  ⚠️  ${manual.length} ҷои ШУБҲАНОК — қарори дастӣ лозим:`);
  console.log('     («дар Душанбе зиндагӣ мекунам» = шаҳр, калон мемонад;');
  console.log('      «Имрӯз душанбе аст» = рӯзи ҳафта, хурд мешавад)');
  for (const m of [...new Set(manual)]) console.log(`       • ${m}`);
}

ch.writeSql(new URL('./out/01-days-months-case.sql', import.meta.url).pathname.replace(/^\//, ''));
await ch.apply(sql);
