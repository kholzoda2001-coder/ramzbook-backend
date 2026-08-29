// ИСЛОҲИ ҶАДВАЛИ `ComprehensionQuestion` — Модулҳои 1 ва 2-и курси русӣ.
// Манбаъ: `Russian_A1_M1_M2_Final_Verification.md` §6, бандҳои 1–4 (ҳамаи 🔴).
//
// Ҳар чор боги критикӣ дар ЯК ҷадвал нишастаанд, пас як гузариш кифоя аст.
//
// ─── T1 · Шаш тавзеҳи ХОЛӢ (триггери Lola) ─────────────────────────────────
//     `comprehension_screen.dart:384` панелро бо `explanation.isNotEmpty` гейт
//     мекунад — ҳангоми холӣ будан хонанда ФАҚАТ ранги сурхро мебинад ва ҳеҷ
//     сабабе намегирад. M2 #9 маҳз ду савол дорад ва ҳар дуяш хомӯшанд, яъне
//     сенарияи «ду хатои пай дар пай бе кӯмак»-и Лола пурра сохта мешавад.
//
// ─── T2 · Тавзеҳи ДУРӮҒГӮ (триггери Olim) ──────────────────────────────────
//     M2 #10 Q4: ҷавоби дуруст «Таджикский и русский», вале тавзеҳ варианти
//     ДИГАРро ном мебарад. Ин аз холӣ будан БАДТАР аст — ба хонандае, ки дуруст
//     ҷавоб дод, мегӯяд, ки гӯё хато кардааст.
//
// ─── T3 · Тавзеҳи ФОССИЛӢ (триггери Suhrob) ────────────────────────────────
//     Ислоҳи қаблии F3 `passage` ва `options`-ро нав кард, вале `explanation`
//     ҳанӯз ҷумлаеро иқтибос меорад, ки ДИГАР ДАР МАТН НЕСТ ва шакли МУЗАККАР
//     дорад («Сара мой друг») — маҳз ҳамон чизе, ки F3 нест карданӣ буд.
//
// ─── T4 · Ихтилофи «Ту ↔ Шумо» (триггери Farzona) ──────────────────────────
//     M2 #13 Q1: нимаи русӣ «Ту» мегӯяд, нимаи тоҷикӣ «Шумо» — дар ЯК корт.
//     Ислоҳи қаблии F2 танҳо `DialogueLine` ва `GrammarExample`-ро фаро гирифт;
//     `ComprehensionQuestion."questionTranslated"` ба рӯйхат надаромада буд.
//
// ЭҲТИЁТ (идемпотентӣ): ҳар сатр бо `id` ҳадафгирӣ мешавад ва арзиши ҶОРӢ пеш
// аз навиштан САНҶИДА мешавад. Се ҳолат:
//   • арзиш = `after`  → аллакай ислоҳ шудааст, ГУЗАШТ (0 тағйирот).
//   • арзиш = `before` → навишта мешавад.
//   • арзиши ДИГАР     → ДАСТ НАМЕРАСАД + огоҳии баланд. Ҳеҷ гоҳ кори касеро
//     кӯр-кӯрона напӯшонем; беҳтар аст скрипт ҳушдор диҳад, то маълумот занад.
//
//   node prisma/fix-ru-m1m2-comprehension.mjs            # намоиш (dry-run)
//   node prisma/fix-ru-m1m2-comprehension.mjs --apply    # иҷро
import { connect, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('ComprehensionQuestion — Модулҳои 1–2-и русӣ · T1…T4');

// ─────────────────────────────────────────────────────────────────────────────
// Ҳадафҳо. `before: null` = майдони холӣ (NULL ё сатри фосиладор).
// `label` танҳо барои гузориш аст.
// ─────────────────────────────────────────────────────────────────────────────
const TARGETS = [
  // ── T1 · шаш тавзеҳи холӣ ────────────────────────────────────────────────
  {
    t: 'T1', field: 'explanation',
    id: 'cmsn8u6jg0003k04zfnta0opt',
    label: 'M1 #11 такрор · «Кто такой Карим?» → Учитель',
    before: null,
    after: 'Матн мегӯяд: «Это мой друг Карим. Он учитель» — пас Карим муаллим аст. Офарин!',
  },
  {
    t: 'T1', field: 'explanation',
    id: 'cmsn8u6q50005k04znru92smi',
    label: 'M1 #11 такрор · «Что говорит Али в конце?» → До свидания',
    before: null,
    after: 'Ҷумлаи охирини матн: «Спасибо и до свидания!» — «До свидания» = Хайр.',
  },
  {
    t: 'T1', field: 'explanation',
    id: 'cmsc426fw0031558ffp10g0ws',
    label: 'M2 #9 хониш · «Откуда Рустам?» → Таджикистан',
    before: null,
    after: 'Матн мегӯяд: «Я из Таджикистана» — Рустам аз Тоҷикистон аст.',
  },
  {
    t: 'T1', field: 'explanation',
    id: 'cmsc426n10033558f3xogfbxs',
    label: 'M2 #9 хониш · «На каких языках он говорит?» → Таджикский и русский',
    before: null,
    after: 'Матн мегӯяд: «Я говорю на таджикском и русском» — тоҷикӣ ва русӣ.',
  },
  {
    t: 'T1', field: 'explanation',
    id: 'cmsc427xz003h558fu3v5mze2',
    label: 'M2 #13 такрор · «Как спросить: Ту аз куҷо ҳастӣ?» → Откуда ты?',
    before: null,
    after: '«Аз куҷо» → Откуда. Пас саволи дуруст: «Откуда ты?» (Где = дар куҷо, на аз куҷо.)',
  },
  {
    t: 'T1', field: 'explanation',
    id: 'cmsc4284r003j558f2h2rd1td',
    label: 'M2 #13 такрор · «Какое слово означает Шаҳр?» → Город',
    before: null,
    after: 'Шаҳр = Город. Диққат: Страна = кишвар, на шаҳр.',
  },

  // ── T2 · тавзеҳи дурӯғгӯ ─────────────────────────────────────────────────
  {
    t: 'T2', field: 'explanation',
    id: 'cmsc427l0003d558f7ey53t9v',
    label: 'M2 #10 шунавоӣ · «На каких языках говорит Карим?» → Таджикский и русский',
    before: 'Таджикский и английский.',
    after: 'Матн мегӯяд: «Я говорю на таджикском и русском» — тоҷикӣ ва русӣ.',
  },

  // ── T3 · тавзеҳи фоссилӣ (Сара) ──────────────────────────────────────────
  {
    t: 'T3', field: 'explanation',
    id: 'cmsc0rse6003julfrgbvg9dep',
    label: 'M1 #13 имтиҳон · «Кто такая Сара?» → Моя подруга',
    before: 'Матн: Сара мой друг. (друг/мальчик/мужчина — ҳама дар Модули 1 таълим шудаанд)',
    after: 'Матн: Это моя подруга Сара. Сара зан аст, пас «моя подруга» (на «мой друг»).',
  },

  // ── T4 · ихтилофи Ту ↔ Шумо ──────────────────────────────────────────────
  {
    t: 'T4', field: 'questionTranslated',
    id: 'cmsc427xz003h558fu3v5mze2',
    label: 'M2 #13 такрор · Q1 questionTranslated',
    before: 'Чӣ тавр мепурсед: «Шумо аз куҷо ҳастед?»',
    after: 'Чӣ тавр мепурсед: «Ту аз куҷо ҳастӣ?»',
  },
];

const isBlank = (v) => v === null || v === undefined || String(v).trim() === '';

let changed = 0;
let skippedDone = 0;
const drift = [];
const missing = [];

for (const T of TARGETS) {
  const rows = await sql`
    SELECT id, question, "questionTranslated" qt, explanation
    FROM "ComprehensionQuestion" WHERE id=${T.id}`;

  if (rows.length === 0) {
    missing.push(T);
    console.log(`  ❌ [${T.t}] ${T.label}\n        сатр бо ин id ЁФТ НАШУД — ${T.id}`);
    continue;
  }

  const cur = T.field === 'explanation' ? rows[0].explanation : rows[0].qt;

  // 1) Аллакай ислоҳшуда?
  if (cur === T.after) {
    skippedDone++;
    console.log(`  ✓ [${T.t}] ${T.label}\n        аллакай тоза — гузашт`);
    continue;
  }

  // 2) Ҳолати интизорӣ?
  const matchesBefore = T.before === null ? isBlank(cur) : cur === T.before;
  if (!matchesBefore) {
    drift.push({ T, cur });
    console.log(`  ⚠️  [${T.t}] ${T.label}\n        ҲОЛАТИ ГАЙРИЧАШМДОШТ — даст нарасонд.`);
    console.log(`        интизор : ${T.before === null ? '(холӣ)' : JSON.stringify(T.before)}`);
    console.log(`        ҷорӣ    : ${JSON.stringify(cur)}`);
    continue;
  }

  // 3) Навиштан.
  console.log(`  → [${T.t}] ${T.label}`);
  console.log(`        ${T.field}: ${T.before === null ? '(холӣ)' : JSON.stringify(T.before)}`);
  console.log(`                 → ${JSON.stringify(T.after)}`);
  if (APPLY) {
    if (T.field === 'explanation') {
      await sql`UPDATE "ComprehensionQuestion" SET explanation=${T.after} WHERE id=${T.id}`;
    } else {
      await sql`UPDATE "ComprehensionQuestion" SET "questionTranslated"=${T.after} WHERE id=${T.id}`;
    }
  }
  changed++;
}

// ─────────────────────────────────────────────────────────────────────────────
// Тасдиқи мустақил. Драйвери HTTP барои `UPDATE` массиви ХОЛӢ бармегардонад —
// `rowCount` НЕСТ, пас натиҷаро ҲЕҶ ГОҲ аз худи UPDATE нагиред. Ин ҷо ҳар сатр
// дубора хонда мешавад. Ниг. [[ramz-db-scripts-local]].
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n  ─── Тасдиқи мустақил (SELECT-и дубора) ───\n');
let ok = 0;
for (const T of TARGETS) {
  const rows = await sql`
    SELECT explanation, "questionTranslated" qt FROM "ComprehensionQuestion" WHERE id=${T.id}`;
  if (rows.length === 0) { console.log(`  ❌ ${T.t} ${T.id} — сатр нест`); continue; }
  const cur = T.field === 'explanation' ? rows[0].explanation : rows[0].qt;
  if (cur === T.after) { ok++; console.log(`  ✅ [${T.t}] ${T.label}`); }
  else console.log(`  ❌ [${T.t}] ${T.label}\n        ҷорӣ: ${JSON.stringify(cur)}`);
}
console.log(`\n  ${ok}/${TARGETS.length} ҳадаф дар ҳолати дилхоҳ.`);

// Фарогирии умумии тавзеҳ дар ҳар ду модул.
const M1 = 'cmqan0wp90097s2t1slvquxj7', M2 = 'cmqan0zr4009qs2t1j4w7u49q';
const cov = await sql`
  SELECT count(*)::int total,
         count(*) FILTER (WHERE q.explanation IS NOT NULL AND btrim(q.explanation) <> '')::int filled
  FROM "ComprehensionExercise" ce
  JOIN "Lesson" l ON l."comprehensionId"=ce.id
  JOIN "ComprehensionQuestion" q ON q."exerciseId"=ce.id
  WHERE l."moduleId" IN (${M1},${M2})`;
console.log(`  Фарогирии тавзеҳ (M1+M2): ${cov[0].filled}/${cov[0].total}`);

if (drift.length) console.log(`\n  ⚠️  ${drift.length} сатр дар ҳолати ғайричашмдошт буд ва ДАСТ НАРАСИД.`);
if (missing.length) console.log(`  ❌ ${missing.length} сатр ёфт нашуд.`);

done(changed, skippedDone ? `${skippedDone} ҳадаф аллакай тоза буд (идемпотентӣ).` : '');
