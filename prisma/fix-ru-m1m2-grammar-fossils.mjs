// ИСЛОҲИ ду фоссили матнӣ дар `GrammarTopic` — курси русӣ A1.
// Манбаъ: `Russian_A1_M1_M2_Final_Verification.md` §6, бандҳои 6 ва 7 (🟠).
//
// ─── G1 · «фоилӣ» → «шахсӣ» (триггери Farzona / Sabina) ────────────────────
//     Ислоҳи C1 ТАНҲО унвонҳоро ҷуфт кард (Lesson / GrammarTopic.titleTranslated).
//     Вале ҷумлаи АВВАЛИ худи тавзеҳ ҳанӯз истилоҳи кӯҳнаро мегӯяд, пас сарлавҳа
//     «шахсӣ» менависад ва сатри якум «фоилӣ» — маҳз ҳамон ихтилофе, ки C1
//     нест карданӣ буд, як сатр поёнтар.
//
//     ⚠️ Калимаи «фоил» дар ҳамон ҷумла БОЗ меояд («дар аввали ҷумла фоил
//     мешаванд») — он ҷо ДУРУСТ аст (subject = фоил) ва даст намерасад.
//     Танҳо таркиби «Ҷонишинҳои фоилӣ» иваз мешавад.
//
// ─── G2 · ҷумлаи фантомии «артикл» (триггери Zero / Hasan) ─────────────────
//     «Дар русӣ, мисли тоҷикӣ, артикл вуҷуд НАДОРАД.» — фоссили матни курси
//     АНГЛИСӢ. Барои тоҷикзабон ин ҷумла мафҳумеро муаррифӣ мекунад, ки худаш
//     онро надорад, ва фавран мегӯяд, ки он нест. Сирф исрофи диққат аст —
//     пас ПУРРА нест мешавад, на иваз.
//
// ИДЕМПОТЕНТӢ: ҳар як тағйирот бо шакли ниҳоии худ санҷида мешавад. Агар матн
// аллакай тоза бошад — 0 тағйирот. Агар матн ба ҳеҷ намуна мувофиқ наояд —
// ОГОҲӢ ва ГУЗАШТ, ҳеҷ гоҳ навиштани кӯр-кӯрона.
//
//   node prisma/fix-ru-m1m2-grammar-fossils.mjs            # намоиш
//   node prisma/fix-ru-m1m2-grammar-fossils.mjs --apply    # иҷро
import { connect, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('GrammarTopic — фоссилҳои матнӣ · G1, G2');

const PRONOUN_ID = 'cmsc0rm25001lulfrn9cz9oo1'; // Личные местоимения
const GENDER_ID = 'cmsc41zyf0017558f08q1hkko';  // Род существительных

/**
 * Ҷумлаи фантомии «артикл» бо ҳама вариантҳои эҳтимолӣ.
 * Фосилаи боқимонда ҷамъ карда мешавад, то сарсатр бо фосила оғоз нашавад.
 */
const ARTICLE_RE =
  /Дар\s+русӣ,?\s*(мисли\s+тоҷикӣ,?\s*)?артикл\s+вуҷуд\s+НАДОРАД\.?\s*/iu;

const JOBS = [
  {
    t: 'G1',
    id: PRONOUN_ID,
    label: 'Ҷонишинҳои шахсӣ — «фоилӣ» дар ҷумлаи якум',
    apply: (ex) => ex.replace(/Ҷонишинҳои\s+фоилӣ/gu, 'Ҷонишинҳои шахсӣ'),
    isClean: (ex) => !/Ҷонишинҳои\s+фоилӣ/u.test(ex),
  },
  {
    t: 'G2',
    id: GENDER_ID,
    label: 'Ҷинси исм — ҷумлаи фантомии «артикл»',
    apply: (ex) => {
      let out = ex.replace(ARTICLE_RE, '');
      // «Вале як чизи…» дигар ба ҷумлаи пешина такя намекунад — сарҳарфро калон
      // мекунем, то банд бо «Вале» сар нашавад.
      out = out.replace(/^\s*Вале\s+як\s+чизи\s+тамоман\s+НАВ\s+ҳаст/u,
        'Дар русӣ як чизи тамоман НАВ ҳаст');
      return out.replace(/^[ \t]+/u, '');
    },
    isClean: (ex) => !/артикл/iu.test(ex),
  },
];

let changed = 0;
let already = 0;
const drift = [];

for (const J of JOBS) {
  const rows = await sql`
    SELECT id, "titleTranslated" tt, explanation FROM "GrammarTopic" WHERE id=${J.id}`;
  if (rows.length === 0) {
    drift.push(J);
    console.log(`  ❌ [${J.t}] ${J.label}\n        сатр ёфт нашуд — ${J.id}`);
    continue;
  }
  const cur = rows[0].explanation;

  if (J.isClean(cur)) {
    already++;
    console.log(`  ✓ [${J.t}] ${J.label}\n        аллакай тоза — гузашт`);
    continue;
  }

  const next = J.apply(cur);
  if (next === cur || !J.isClean(next)) {
    drift.push(J);
    console.log(`  ⚠️  [${J.t}] ${J.label}`);
    console.log(`        НАМУНА МУТОБИҚ НАШУД — даст нарасонд. Матни ҷорӣ:`);
    console.log(`        ${JSON.stringify(cur.slice(0, 220))}`);
    continue;
  }

  console.log(`  → [${J.t}] ${J.label}`);
  console.log(`        пеш : ${JSON.stringify(cur.split('\n')[0].slice(0, 150))}`);
  console.log(`        баъд: ${JSON.stringify(next.split('\n')[0].slice(0, 150))}`);
  if (APPLY) {
    await sql`UPDATE "GrammarTopic" SET explanation=${next} WHERE id=${J.id}`;
  }
  changed++;
}

// ── Тасдиқи мустақил. Драйвери HTTP барои UPDATE `rowCount` намедиҳад, пас
//    ҳар сатр ДУБОРА хонда мешавад. Ниг. [[ramz-db-scripts-local]].
console.log('\n  ─── Тасдиқи мустақил (SELECT-и дубора) ───\n');
let ok = 0;
for (const J of JOBS) {
  const rows = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${J.id}`;
  if (rows.length && J.isClean(rows[0].explanation)) {
    ok++;
    console.log(`  ✅ [${J.t}] ${J.label}`);
  } else {
    console.log(`  ❌ [${J.t}] ${J.label}`);
  }
}
console.log(`\n  ${ok}/${JOBS.length} ҳадаф тоза.`);

// Санҷиши фарогирии тамоми курс — ягон фоссили боқимонда ҳаст?
const C = 'cmq95o7ic0001qsy5l76202bw';
const left = await sql`
  SELECT "titleTranslated" tt FROM "GrammarTopic"
  WHERE "courseId"=${C} AND (explanation ~* 'Ҷонишинҳои\\s+фоилӣ' OR explanation ~* 'артикл')`;
console.log(`  Дар тамоми курси русӣ боқӣ: ${left.length}${left.length ? ' → ' + left.map((r) => r.tt).join(' | ') : ''}`);

if (drift.length) console.log(`\n  ⚠️  ${drift.length} ҳадаф даст нарасид.`);

done(changed, already ? `${already} ҳадаф аллакай тоза буд (идемпотентӣ).` : '');
