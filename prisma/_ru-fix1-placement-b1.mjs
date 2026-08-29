// ВАЗИФАИ 1 — доми B1-и сатҳсанҷӣ (боги C1).
//
// МУШКИЛ: сатҳсанҷии русӣ 30 савол дорад (A1=10, A2=10, B1=10), вале курси
// русӣ ТАНҲО A1 дорад. Хонандае, ки B1 мегирад:
//   1) нишони калони «Сатҳи шумо — B1»-ро мебинад,
//   2) дарси шиносоиро аз даст медиҳад (`onboarding_screen.dart:87`),
//   3) `placedIndex = -1` мешавад ва хомӯшона ба A1 Дарси 1 бармегардад.
//
// ҲАЛ: 10 саволи B1 ХОМӮШ карда мешаванд (`isActive = false`), НА нест.
// Ҳамон намунае, ки курси АРАБӢ дорад: он ҳам танҳо A1 дорад ва саволҳояш
// дуруст дар A2 қатъ мешаванд (`ar -> A1=10 A2=10`).
//
// ЧАРО хомӯш, на DELETE: вақте курси B1-и русӣ сохта шуд, як `isActive = true`
// кофист — 10 саволи дастнавис нигоҳ дошта мешавад.
//
//   node prisma/_ru-fix1-placement-b1.mjs            # намоиш
//   node prisma/_ru-fix1-placement-b1.mjs --apply    # иҷро
import { connect, RU, TG, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('ВАЗИФАИ 1 · Сатҳсанҷии русӣ 30 → 20 савол (хомӯш кардани B1)');

// ── 1. Ҳолати ҳозира ──────────────────────────────────────────────────────
const before = await sql`
  SELECT "cefrLevel", "isActive", count(*)::int c
  FROM "PlacementQuestion"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG}
  GROUP BY "cefrLevel", "isActive" ORDER BY "cefrLevel"`;
console.log('  Пеш аз ислоҳ:');
for (const r of before) console.log(`    ${r.cefrLevel}  isActive=${r.isActive}  → ${r.c} савол`);

const targets = await sql`
  SELECT id, prompt FROM "PlacementQuestion"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG}
    AND "cefrLevel"='B1' AND "isActive"=true
  ORDER BY "order"`;

if (targets.length === 0) {
  done(0, 'Ҳеҷ саволи фаъоли B1 нест — аллакай ислоҳ шудааст (идемпотент).');
  process.exit(0);
}

console.log(`\n  ${targets.length} саволи B1 хомӯш карда мешавад:`);
for (const q of targets) console.log(`    · ${q.prompt.replace(/\n/g, ' ').slice(0, 62)}`);

// ── 2. Навиштан ───────────────────────────────────────────────────────────
if (APPLY) {
  await sql`
    UPDATE "PlacementQuestion" SET "isActive"=false
    WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG}
      AND "cefrLevel"='B1' AND "isActive"=true`;
}

// ── 3. Тасдиқ ─────────────────────────────────────────────────────────────
// Драйвери HTTP аз UPDATE `rowCount` намедиҳад — бо SELECT-и ҷудогона месанҷем.
const after = await sql`
  SELECT "cefrLevel", count(*)::int c
  FROM "PlacementQuestion"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} AND "isActive"=true
  GROUP BY "cefrLevel" ORDER BY "cefrLevel"`;
const total = after.reduce((a, r) => a + r.c, 0);
console.log(`\n  Баъд аз ислоҳ (саволҳои ФАЪОЛ): ${after.map((r) => `${r.cefrLevel}=${r.c}`).join(' ')} → ҳамагӣ ${total}`);

done(targets.length, APPLY
  ? `Сатҳсанҷӣ акнун ${total} савол дорад. Барои баргардонидан: isActive=true барои cefrLevel='B1'.`
  : '');
