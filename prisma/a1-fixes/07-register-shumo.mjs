// ─────────────────────────────────────────────────────────────────────────────
// 07 — Оҳанг: «ту» ↔ «шумо»  ·  ГУЗОРИШ, НА ИСЛОҲИ ХУДКОР
//
// ⛔️ ИН СКРИПТ ҲЕҶ ГОҲ ЧИЗЕ НАМЕНАВИСАД. `--apply` надорад.
//
// ЧАРО. Кӯшиши аввал маҳз ҳамин буд: ҷадвали шаклҳо («ту»→«шумо»,
// «ҳастӣ»→«ҳастед», «рав»→«равед» …) ва як гузариш рӯи ҳамаи 2 043 майдон.
// Диффи dry-run зарари онро фавран нишон дод:
//
//     «Ӯ ЗАН аст.»                    → «Ӯ ЗАНЕД аст.»        ← исм феъл шуд
//     «She = ӯ — барои ЗАН»           → «… барои ЗАНЕД»       ← тавзеҳи
//                                                                грамматика вайрон
//     «**You** — ту / шумо»           → «шумо / шумо»         ← мавзӯи дарс нобуд
//     «Ту дӯсти ман ҳастӣ.»           → «Ту дӯсти ман ҳастед.» ← нимкора
//
// Сабабҳо:
//   • «зан», «гир», «рав», «бин», «пӯш» ҳам феъли амрӣ, ҳам ИСМи маъмуланд;
//   • тавзеҳи грамматика худи калимаи «ту»-ро ҳамчун МАВЗӮИ таълим меорад —
//     иваз кардани он дарсро нест мекунад;
//   • «Ту» бо ҳарфи калон аз шакли хурд ҷудо коркард мешавад ва ҷумла
//     нимкора мемонад.
//
// Хулоса: ин корро як ҷадвали қоида иҷро карда НАМЕТАВОНАД. Ин ҷо рӯйхати
// АНИҚИ ҷойҳо ва пешниҳоди матни нав дода мешавад — қарор ва таҳрир аз они
// методист/муҳаррир.
//
// Иҷро:  node 07-register-shumo.mjs
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs';
import { connect, loadCourse, loc, wordRe, BOLD, DIM, RED, GREEN } from './_lib.mjs';

/** Шаклҳое, ки БЕХАТАР нишонаи «ту» ҳастанд (исмҳои ҳамгун надоранд). */
const TU = 'ту|туро|ҳастӣ|нестӣ|дорӣ|надорӣ|мебинӣ|мекунӣ|мехоҳӣ|менӯшӣ|мехӯрӣ|меравӣ|медиҳӣ|метавонӣ|мегӯӣ|мешавӣ';
const SHUMO = 'шумо|шуморо|ҳастед|нестед|доред|надоред|мебинед|мекунед|мехоҳед|менӯшед|мехӯред|меравед|медиҳед|метавонед|мегӯед|мешавед';

/**
 * Ҷойҳое, ки «ту» ҚАСДАН аст ва даст нахӯрад.
 * Тавзеҳи грамматика калимаи «ту»-ро ҳамчун МАЗМУНИ таълим меорад:
 * «You — ту / шумо» ва «дар тоҷикӣ мегӯем "ту ҳастӣ"». Ин мисоли забонист,
 * на муроҷиат ба хонанда.
 */
const INTENTIONAL = [
  { field: 'grammar.explanation', why: 'калимаи «ту» ҳамчун МИСОЛИ забонӣ меояд, на муроҷиат' },
  { field: 'word.translation', why: '«Шумо / Ту» ҳарду вариантро ҳамчун тарҷума нишон медиҳад' },
];

const sql = connect();
const modules = await loadCourse(sql);

const findings = [];
for (const mod of modules) {
  for (const L of mod.lessons) {
    const where = loc(mod, L);
    const fields = [
      ...L.words.flatMap((w) => [
        { f: 'word.translation', id: w.id, table: 'Word', col: 'translation',
          v: w.translation, tag: `корти «${w.word}»` },
        { f: 'word.exampleTrans', id: w.id, table: 'Word', col: 'exampleTrans',
          v: w.exampleTrans, tag: `мисоли «${w.word}»` },
      ]),
      ...(L.grammarTopic ? [{ f: 'grammar.explanation', id: L.grammarTopic.id,
          table: 'GrammarTopic', col: 'explanation', v: L.grammarTopic.explanation,
          tag: 'тавзеҳи грамматика' }] : []),
      ...(L.grammarTopic?.examples ?? []).map((e) => ({ f: 'grammar.example',
          id: e.id, table: 'GrammarExample', col: 'translation', v: e.translation,
          tag: 'мисоли грамматика' })),
      ...(L.grammarTopic?.exercises ?? []).map((e) => ({ f: 'grammar.prompt',
          id: e.id, table: 'GrammarExercise', col: 'promptTranslated',
          v: e.promptTranslated, tag: 'машқи грамматика' })),
      ...(L.dialogue?.lines ?? []).map((x) => ({ f: 'dialogue', id: x.id,
          table: 'DialogueLine', col: 'translation', v: x.translation, tag: 'муколама' })),
      ...(L.comprehension ? [{ f: 'comp.passage', id: L.comprehension.id,
          table: 'ComprehensionExercise', col: 'passageTranslated',
          v: L.comprehension.passageTranslated, tag: 'матни хониш' }] : []),
      ...(L.comprehension?.questions ?? []).map((q) => ({ f: 'comp.question',
          id: q.id, table: 'ComprehensionQuestion', col: 'questionTranslated',
          v: q.questionTranslated, tag: 'савол' })),
    ];

    const lessonHits = { tu: [], shumo: [] };
    for (const fl of fields) {
      if (typeof fl.v !== 'string' || !fl.v) continue;
      if (wordRe(TU).test(fl.v)) lessonHits.tu.push(fl);
      if (wordRe(SHUMO).test(fl.v)) lessonHits.shumo.push(fl);
    }
    if (lessonHits.tu.length && lessonHits.shumo.length) {
      findings.push({ where, mod, L, ...lessonHits });
    }
  }
}

console.log('\n' + BOLD('═'.repeat(78)));
console.log(BOLD('07 — Омехтани «ту» ва «шумо»  ·  ГУЗОРИШ (ҳеҷ чиз навишта намешавад)'));
console.log(BOLD('═'.repeat(78)));
console.log(`\n  ${findings.length} дарс ҳарду оҳангро дар як саҳифа доранд.\n`);

const review = [];
for (const f of findings) {
  console.log(`  ${BOLD(f.where)}`);
  for (const t of f.tu.slice(0, 4)) {
    const intentional = INTENTIONAL.find((i) => i.field === t.f);
    const mark = intentional ? DIM('  [қасдан: ' + intentional.why + ']') : RED('  ← ислоҳ лозим');
    console.log(`     ту   ${DIM(t.tag)}: «${String(t.v).replace(/\n/g, ' ').slice(0, 72)}»${mark}`);
    if (!intentional) {
      review.push({ where: f.where, table: t.table, id: t.id, column: t.col,
                    tag: t.tag, current: t.v, suggested: null });
    }
  }
  for (const s of f.shumo.slice(0, 2)) {
    console.log(`     шумо ${DIM(s.tag)}: «${String(s.v).replace(/\n/g, ' ').slice(0, 72)}»`);
  }
  console.log('');
}

// ── Ҳолати аз ҳама равшан: як ҷумлаи англисӣ — ду тарҷума ─────────────────
console.log(BOLD('  Ҷумлаҳои ЯКХЕЛАИ англисӣ бо тарҷумаи ҳарду оҳанг:'));
const byEn = {};
for (const mod of modules) for (const L of mod.lessons) {
  for (const w of L.words) if (w.example)
    (byEn[w.example.trim()] ??= []).push({ tr: (w.exampleTrans ?? '').trim(), at: loc(mod, L), tag: `корти «${w.word}»` });
  for (const e of L.grammarTopic?.examples ?? [])
    (byEn[e.sentence.trim()] ??= []).push({ tr: e.translation.trim(), at: loc(mod, L), tag: 'мисоли грамматика' });
  for (const x of L.dialogue?.lines ?? [])
    (byEn[x.text.trim()] ??= []).push({ tr: x.translation.trim(), at: loc(mod, L), tag: 'муколама' });
}
for (const [en, arr] of Object.entries(byEn)) {
  const set = new Set(arr.map((a) => a.tr));
  if (set.size < 2) continue;
  const hasTu = arr.some((a) => wordRe(TU).test(a.tr));
  const hasShumo = arr.some((a) => wordRe(SHUMO).test(a.tr));
  if (!hasTu || !hasShumo) continue;
  console.log(`\n    «${en}»`);
  for (const a of arr) {
    const mark = wordRe(TU).test(a.tr) ? RED('ТУ  ') : GREEN('ШУМО');
    console.log(`      ${mark} ${a.at} ${DIM(a.tag)} → «${a.tr}»`);
  }
}

const OUT = new URL('./out/07-register-review.json', import.meta.url).pathname.replace(/^\//, '');
fs.writeFileSync(OUT, JSON.stringify(review, null, 2), 'utf8');

console.log(`

  ${BOLD('ЧӢ БОЯД КАРД')}
    1. Файли ${OUT} кушода шавад.
    2. Барои ҳар сатр майдони "suggested"-ро бо матни ДУРУСТ пур кунед.
       (Ҷадвали қоида кор намекунад — ниг. сарлавҳаи ин файл.)
    3. Баъд аз пур кардан скрипти 08 онро татбиқ мекунад.

  ${BOLD('ТАВСИЯ')}
    Дар тавзеҳи грамматика калимаи «ту» ҚАСДАН аст — «You — ту / шумо» худи
    мавзӯи дарс аст. Онҳоро даст нарасонед. Танҳо МИСОЛҲО ва МАТНҲО
    (exampleTrans, dialogue, passage) ба «шумо» гузаранд.

  ${BOLD('АВВАЛИН ДУ ИСЛОҲ')} (аз ҳама намоён):
    • M1·Д4  «Номи ту чист?»  → «Номи шумо чист?»   (корти Your)
    • M1·Д7  «Ту дӯсти ман ҳастӣ.» → «Шумо дӯсти ман ҳастед.» (мисоли to be)
`);
