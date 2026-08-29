// САНҶИШИ ТАВЗЕҲ ↔ ҶАВОБ барои `ComprehensionQuestion` (танҳо ХОНДАН).
//
// Се хатарро меҷӯяд:
//   1) тавзеҳи ХОЛӢ — `comprehension_screen.dart:384` панелро бо
//      `explanation.isNotEmpty` гейт мекунад, пас холӣ = хонанда ҳеҷ сабабе
//      намебинад (триггери Lola).
//   2) тавзеҳе, ки варианти ГАЛАТро ҳамчун ҷавоб номбар мекунад (триггери Olim).
//   3) тавзеҳе, ки матнро иқтибос меорад, вале он иқтибос дар `passage` НЕСТ
//      (фоссили ислоҳи қаблӣ — триггери Suhrob).
//
// ⚠️ ЭВРИСТИКА, на исбот. Ду намуди мусбати БАРГАШТА, ки қасдан ҳисоб НАМЕШАВАНД:
//   • тавзеҳ ҷавоби дурустро номбар мекунад ВА илова бар он дистракторро РАД
//     мекунад («Шаҳр = Город. Диққат: Страна = кишвар, НА шаҳр.») — ин методикаи
//     дуруст аст, на хато. Пас: агар ҷавоби дуруст ҳам номбар шуда бошад, огоҳӣ
//     дода намешавад.
//   • тавзеҳ иқтибос + ҷумлаи шарҳдиҳанда дорад («Матн: Х. Сара зан аст, пас…»)
//     — иқтибос бояд ҶУДО санҷида шавад, на тамоми сатр.
//
//   node prisma/_ru-m1m2-explcheck.mjs
import { connect } from './_ru-fix-lib.mjs';

const sql = connect();
const M1 = 'cmqan0wp90097s2t1slvquxj7', M2 = 'cmqan0zr4009qs2t1j4w7u49q';

const norm = (s) => (s || '').toLowerCase().replace(/[«»"'.,!?—–-]/g, ' ').replace(/\s+/g, ' ').trim();

/**
 * Порчаҳои аз МАТН иқтибосшуда: дохили «…» ё баъди «Матн:» то нуқтаи аввал.
 *
 * Ду истисно, вагарна эвристика бардурӯғ дод мезанад:
 *   • Агар тавзеҳ калимаи «Матн»-ро НАДОШТА бошад, «…» иқтибос НЕСТ — он ҷавоб ё
 *     тарҷума аст («Аз куҷо» → Откуда). Чунин тавзеҳро тамоман насанҷед.
 *   • Иқтибосе, ки пеш аз он «на » меояд, мисоли МУҚОБИЛ аст, на иқтибос:
 *     «моя подруга» (НА «мой друг») — набояд дар матн бошад, ин ҳадафи ислоҳ буд.
 */
function quotes(ex) {
  if (!/Матн/.test(ex)) return [];
  const out = [];
  for (const m of ex.matchAll(/(на\s*)?«([^»]+)»/g)) if (!m[1]) out.push(m[2]);
  const after = ex.match(/Матн:\s*([^.!?]+[.!?])/);
  if (after) out.push(after[1]);
  return out.filter((q) => /[а-яё]/i.test(q)); // танҳо иқтибоси РУСӢ маъно дорад
}

const rows = await sql`
  SELECT l."moduleId" mid, l."order" lo, ce."titleTranslated" ct, ce.passage p,
         q.question qq, q.options o, q."correctIndex" ci, q.explanation ex
  FROM "ComprehensionExercise" ce
  JOIN "Lesson" l ON l."comprehensionId"=ce.id
  JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id
  WHERE l."moduleId" IN (${M1},${M2})
  ORDER BY l."moduleId", l."order", q."order"`;

let blank = 0, wrongOpt = 0, badQuote = 0;

for (const r of rows) {
  const opts = Array.isArray(r.o) ? r.o : JSON.parse(r.o);
  const correct = opts[r.ci];
  const tag = `[${r.mid === M1 ? 'M1' : 'M2'}#${r.lo} ${r.ct}] ${r.qq}`;

  if (!r.ex || !r.ex.trim()) {
    blank++;
    console.log(`❌ NO-EXPL  ${tag}`);
    continue;
  }

  const ex = norm(r.ex);
  const namesCorrect = ex.includes(norm(correct));

  // (2) варианти ғалат — ТАНҲО агар ҷавоби дуруст номбар НАШУДА бошад.
  if (!namesCorrect) {
    const wrong = opts.filter((o, i) => i !== r.ci && norm(o).length > 4 && ex.includes(norm(o)));
    if (wrong.length) {
      wrongOpt++;
      console.log(`🔴 EXPL-NAMES-WRONG-OPTION  ${tag}`);
      console.log(`      correct="${correct}"  expl="${r.ex}"  names→${JSON.stringify(wrong)}`);
      continue;
    }
  }

  // (3) иқтибос, ки дар матн нест.
  if (r.p) {
    const pn = norm(r.p);
    const bad = quotes(r.ex).filter((q) => !pn.includes(norm(q)));
    if (bad.length) {
      badQuote++;
      console.log(`🔴 EXPL-QUOTES-MISSING-TEXT ${tag}`);
      console.log(`      quote(s) not in passage: ${JSON.stringify(bad)}`);
      console.log(`      passage="${r.p}"`);
    }
  }
}

console.log(`\n─── ${rows.length} савол санҷида шуд`);
console.log(`    тавзеҳи холӣ           : ${blank}`);
console.log(`    варианти ғалатро номид : ${wrongOpt}`);
console.log(`    иқтибоси нодуруст      : ${badQuote}`);
console.log(blank + wrongOpt + badQuote === 0 ? '    ✅ ТОЗА\n' : '    ⚠️  банди боло\n');
