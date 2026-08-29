// ─────────────────────────────────────────────────────────────────────────────
// 08 — Хатоҳои МАЪНОӢ, ки дар скриптҳои 01–05 набуданд
//
// ЧАРО ҶУДО. Скриптҳои 01–05 пеш аз аудити пурраи E2E (2026-08-23) навишта
// шуда буданд. Ду хатои БЛОКЕР маҳз дар ҳамон аудит пайдо шуданд ва дар ягон
// скрипти мавҷуда нестанд:
//
//   • «Меарзад» ба ҷои «You're welcome» — 2 сатри муколама
//   • `It is a book.` = «ИН китоб аст» — «ин» = *this*, на *it*
//
// Ҳар ду ба ҷадвалҳое даст мерасонанд, ки 01–05 умуман намебинанд
// (`DialogueLine.translation` ва `Word.exampleTrans`-и калимаи мушаххас).
//
// Илова бар ин, ду хатои дигар дар ҲАМОН ду сатри муколама ислоҳ мешаванд —
// нимкора гузоштани як сатри вайрон аз ислоҳ накардани он бадтар аст:
//   • «Вай» → «Он» (ҷонишине, ки курс ҳеҷ гоҳ таълим намедиҳад)
//   • ҳарфи хурд баъди нуқта
//
// Иҷро:  node 08-blocker-mistranslations.mjs           (dry-run)
//        node 08-blocker-mistranslations.mjs --apply
// ─────────────────────────────────────────────────────────────────────────────
import { connect, loadCourse, loc, Changes } from './_lib.mjs';

/**
 * Ҳар сатр дастӣ навишта ва бо мазмуни воқеӣ санҷида шудааст.
 * `match` — матни ДҚИҚИ ҷорӣ; агар мувофиқ наояд, сатр гузаронда мешавад
 * (то скрипт дар базаи аллакай ислоҳшуда чизе вайрон накунад).
 */
const DIALOGUE_FIXES = [
  {
    m: 8, l: 15, en: "You're welcome.",
    match: 'Меарзад.', to: 'Хоҳиш мекунам.',
    why: '«меарзад» = *it is worth / it costs*, на «you\'re welcome». ' +
         'M1·Д2 худи ҳамин ибораро «Хоҳиш мекунам» таълим медиҳад.',
  },
  {
    m: 9, l: 14, en: "You're welcome.",
    match: 'Меарзад.', to: 'Хоҳиш мекунам.',
    why: 'ҳамон хато дар муколамаи дуюм',
  },
  {
    m: 8, l: 15, en: 'It is twenty dollars.',
    match: 'Вай бист доллар аст.', to: 'Он бист доллар аст.',
    why: '«вай» дар тамоми курс ҳеҷ гоҳ таълим дода намешавад; грамматикаи ' +
         'M1·Д8 танҳо «ӯ/он»-ро медиҳад',
  },
  {
    m: 9, l: 14, en: 'Excuse me. Where is the hospital?',
    match: 'Мебахшед. беморхона дар куҷост?', to: 'Мебахшед. Беморхона дар куҷост?',
    why: 'ҳарфи хурд баъди нуқта',
  },
  {
    m: 9, l: 14, en: 'Yes. It is next to the bank.',
    match: 'Бале. он дар паҳлӯи бонк аст.', to: 'Бале. Он дар паҳлӯи бонк аст.',
    why: 'ҳарфи хурд баъди нуқта',
  },
];

/** `Word.exampleTrans` — калима + матни ҷорӣ → матни нав. */
const WORD_EXAMPLE_FIXES = [
  {
    word: 'Is',
    match: 'Ин китоб аст.', to: 'Он китоб аст.',
    why: '`It is a book.` — «ин» = *this*, «он» = *it*. Мисоли грамматикаи ' +
         'M1·Д8 ҳамон ҷумларо аллакай дуруст «Он китоб аст» медиҳад.',
  },
];

const sql = connect();
const modules = await loadCourse(sql);
const ch = new Changes('08 — Хатоҳои маъноии блокер');
const misses = [];

for (const mod of modules) {
  for (const L of mod.lessons) {
    // ── муколамаҳо ────────────────────────────────────────────────────────
    for (const line of L.dialogue?.lines ?? []) {
      for (const f of DIALOGUE_FIXES) {
        if (mod.order + 1 !== f.m || L.order + 1 !== f.l) continue;
        if (line.text.trim() !== f.en) continue;
        if (line.translation.trim() !== f.match) {
          misses.push(`M${f.m}·Д${f.l} «${f.en}»: интизор «${f.match}», ёфт «${line.translation}»`);
          continue;
        }
        ch.add({
          table: 'DialogueLine', id: line.id, field: 'translation',
          from: line.translation, to: f.to,
          where: `${loc(mod, L)} · «${f.en}»  ← ${f.why}`,
        });
      }
    }
    // ── мисоли калима ─────────────────────────────────────────────────────
    for (const w of L.words) {
      for (const f of WORD_EXAMPLE_FIXES) {
        if (w.word.trim() !== f.word) continue;
        if ((w.exampleTrans ?? '').trim() !== f.match) continue;
        ch.add({
          table: 'Word', id: w.id, field: 'exampleTrans',
          from: w.exampleTrans, to: f.to,
          where: `${loc(mod, L)} · «${w.word}» ("${w.example}")  ← ${f.why}`,
        });
      }
    }
  }
}

ch.print();
if (misses.length) {
  console.log(`\n  ⚠️  ${misses.length} сатр мувофиқ наомад (эҳтимол аллакай ислоҳ шудааст):`);
  for (const m of misses) console.log(`       • ${m}`);
}

ch.writeSql(new URL('./out/08-blocker-mistranslations.sql', import.meta.url).pathname.replace(/^\//, ''));
await ch.apply(sql);
