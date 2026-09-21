// Тартиби НАВИ модули 1 (EN A1): навъҳои дарс ОМЕХТА мешаванд.
//
//   node prisma/_reorder-en-m1.mjs --dry       # нақша + санҷиши вобастагӣ
//   node prisma/_reorder-en-m1.mjs             # татбиқ
//   node prisma/_reorder-en-m1.mjs --revert    # бозгашт ба тартиби кӯҳна
//
// ── ЧАРО ────────────────────────────────────────────────────────────────────
// Ченаки продакшн (танҳо хонандагони баъди 12.08, то доми «дарси дертар
// иловашуда» ба натиҷа нарасад):
//     Д1 43 → Д2 33 (77%) → Д3 30 → Д4 25 (83%) → … → Д7 18
//     аз Д8 то охири модул: 95–100%
// Яъне 58% дар модули 1 гум мешавад, ва маҳз дар шаш дарси аввал, ки
// ҲАМААШОН `vocab`-и як хеланд. Аввалин навъи ДИГАР дарси 7 аст — ва маҳз
// аз он ҷо партофтан қатъ мешавад.
//
// ── ВОБАСТАГӢ (хондашуда аз мазмуни воқеии дарсҳо) ─────────────────────────
// Дарсҳои компонентӣ калимаҳои дарсҳои луғатро истифода мебаранд:
//   шунавоӣ  «Hello! My name is Anna… Good morning… my friend Tom»
//            → Салом(Д1) + Муаррифӣ(Д3)
//   муколама «Hello… I am fine, thank you… What is your name?»
//            → Д1 + Муомила(Д2) + Муаррифӣ(Д3) + Пурсидани ном(Д4)
//   грамматика «I am Ali. You are my friend…» → Д3 + Одамон(Д5)
// Тартиби нав ҳамаи ин пайдарпайиро нигоҳ медорад.
//
// ⚠️ ШАРТИ ҲАТМӢ: ин скрипт ТАНҲО баъди он иҷро мешавад, ки билди нави
// барнома (прогресс бо ID-и дарс, на бо рақами тартибӣ) нашр шуда бошад.
// Дар билди КӮҲНА прогресс ҳамчун рақам нигоҳ дошта мешавад ва ҳар тағйири
// тартиб онро ба дарси НОДУРУСТ мечаспонад.
// Ниг. `frontend/lib/providers/state_providers.dart` ва
// `frontend/test/progress_survives_reorder_test.dart`.
import { PrismaClient } from '@prisma/client';

const p = new PrismaClient();
const DRY = process.argv.includes('--dry');
const REVERT = process.argv.includes('--revert');

// ── ҚУЛФИ БЕХАТАРӢ ─────────────────────────────────────────────────────────
//
// Ченаки 21.09.2026: **30 хонанда** дар мобайни модули 1-анд ва дар 14 рӯзи
// охир фаъол буданд (яке ҳамон рӯз хонда буд). Дар билди НАСБШУДА прогресс
// ҳамчун РАҚАМИ ТАРТИБӢ нигоҳ дошта мешавад — тартиби нав онро ба дарси
// нодуруст мечаспонад ва «union — never removes» онро ҳеҷ гоҳ ислоҳ
// намекунад.
//
// Пас: то он даме ки билди нави барнома (прогресс бо ID-и дарс) НАШР нашавад,
// ин скрипт кор намекунад. Баъди нашр:
//     node prisma/_reorder-en-m1.mjs --build-is-live
const ARMED = process.argv.includes('--build-is-live');
if (!DRY && !ARMED) {
  console.error('QATL: тартиби нав танҳо баъди нашри билде татбиқ мешавад,');
  console.error('ки прогрессро бо ID-и дарс нигоҳ медорад:');
  console.error('  frontend/lib/providers/state_providers.dart');
  console.error('  frontend/test/progress_survives_reorder_test.dart');
  console.error('Дар билди кӯҳна ин 30 хонандаи нимкораро вайрон мекунад.');
  console.error('');
  console.error('  нақшаро дидан:  node prisma/_reorder-en-m1.mjs --dry');
  console.error('  баъди нашр:     node prisma/_reorder-en-m1.mjs --build-is-live');
  process.exit(1);
}

/** Тартиби НАВ: рақами КӮҲНАИ дарс (1-based) бо тартиби нав. */
const NEW_ORDER = [
  1,  // Салом ва хайрбод        vocab      — аввалин ғалаба, бетағйир
  3,  // Муаррифӣ                vocab      — «I / My / Name / Is»
  10, // Шунавоӣ: Шиносоӣ        listening  ← навъи ДИГАР дар ҷои 3 (буд 10)
  6,  // Вақтҳои рӯз             vocab      — «Good morning» ҷуфти Д1
  2,  // Муомилаи хуб            vocab      — «Thank you» барои муколама
  4,  // Пурсидани ном           vocab      — «What / Your»
  11, // Муколама ва амалия      speaking   ← навъи дигар дар ҷои 7 (буд 11)
  5,  // Одамон                  vocab
  7,  // Грамматика: Феъли To Be grammar
  9,  // Сохтани ҷумлаҳо         reading
  8,  // Грамматика: Ҷонишинҳо   grammar
  13, // Машқи навиштан          writing
  12, // Такрор                  review
  14, // Имтиҳони ниҳоӣ          test       — охирин, бетағйир
];

const mod = await p.module.findFirst({
  where: { order: 0, isActive: true, course: { targetLanguage: { code: 'en' }, level: 'A1' } },
  select: {
    id: true, titleTranslated: true,
    lessons: {
      where: { isActive: true }, orderBy: { order: 'asc' },
      select: { id: true, order: true, titleTranslated: true, skillType: true },
    },
  },
});
if (!mod) { console.error('⛔ модул ёфт нашуд'); process.exit(1); }

const cur = mod.lessons;
console.log(`модул: «${mod.titleTranslated}» · ${cur.length} дарс\n`);

if (REVERT) {
  // Тартиби кӯҳна = ҳамон рақамҳое, ки дар NEW_ORDER навишта шудаанд.
  for (let i = 0; i < NEW_ORDER.length; i++) {
    const lesson = cur.find((l) => l.order === i); // ҷои ҶОРИИ он
    if (!lesson) continue;
    const back = NEW_ORDER[i] - 1;
    console.log(`  ↩ «${lesson.titleTranslated}» ${i + 1} → ${back + 1}`);
    if (!DRY) await p.lesson.update({ where: { id: lesson.id }, data: { order: back } });
  }
  if (!DRY) await p.module.update({ where: { id: mod.id }, data: { contentVersion: { increment: 1 } } });
  console.log('\n↩ тартиби кӯҳна баргардонида шуд');
  await p.$disconnect();
  process.exit(0);
}

if (NEW_ORDER.length !== cur.length) {
  console.error(`⛔ NEW_ORDER ${NEW_ORDER.length} дарс дорад, модул ${cur.length}`);
  process.exit(1);
}
const uniq = new Set(NEW_ORDER);
if (uniq.size !== NEW_ORDER.length) { console.error('⛔ такрор дар NEW_ORDER'); process.exit(1); }

// ── Санҷиши вобастагӣ: ҳар дарси компонентӣ баъди пешшартҳояш биёяд ───────
const DEPENDS = {   // рақами кӯҳна → пешшартҳо (рақамҳои кӯҳна)
  7: [3, 5], 8: [3, 5], 9: [1, 3, 5], 10: [1, 3], 11: [1, 2, 3, 4],
  12: [1, 2, 3, 4, 5, 6], 13: [1, 2, 3, 5], 14: [1, 2, 3, 4, 5, 6],
};
const posOf = new Map(NEW_ORDER.map((old, i) => [old, i]));
let broken = 0;
for (const [oldNo, needs] of Object.entries(DEPENDS)) {
  for (const need of needs) {
    if (posOf.get(need) > posOf.get(Number(oldNo))) {
      const a = cur[Number(oldNo) - 1], b = cur[need - 1];
      console.error(`  ⛔ «${a.titleTranslated}» пеш аз пешшарташ «${b.titleTranslated}» меафтад`);
      broken++;
    }
  }
}
if (broken) { console.error(`\n⛔ ${broken} вобастагӣ вайрон — татбиқ қатъ шуд`); process.exit(1); }
console.log('✅ вобастагиҳо: ҳамаи пешшартҳо пеш аз дарсҳои компонентӣ меоянд\n');

// ── Нақша ────────────────────────────────────────────────────────────────
let prevSkill = null, switches = 0;
for (let i = 0; i < NEW_ORDER.length; i++) {
  const l = cur[NEW_ORDER[i] - 1];
  const moved = NEW_ORDER[i] - 1 !== i;
  const sw = prevSkill !== null && l.skillType !== prevSkill;
  if (sw) switches++;
  prevSkill = l.skillType;
  console.log(`  ${String(i + 1).padStart(2)}. ${l.skillType.padEnd(10)} ${(l.titleTranslated ?? '').slice(0, 26).padEnd(28)}` +
              `${moved ? ` ← буд ${NEW_ORDER[i]}` : ''}${sw ? '  ◆ навъи нав' : ''}`);
}
const before = cur.reduce((n, l, i) => n + (i > 0 && l.skillType !== cur[i - 1].skillType ? 1 : 0), 0);
console.log(`\nивази навъ: буд ${before} → шуд ${switches}`);
console.log(`аввалин навъи ғайри-vocab: буд дарси 7 → шуд дарси ${NEW_ORDER.findIndex((o) => cur[o - 1].skillType !== 'vocab') + 1}`);

if (DRY) { console.log('\n[dry] ҳеҷ чиз навишта нашуд'); await p.$disconnect(); process.exit(0); }

// ── Татбиқ: ду марҳила, то `order` бархӯрд накунад ────────────────────────
await p.$transaction(async (tx) => {
  for (const l of cur) {
    await tx.lesson.update({ where: { id: l.id }, data: { order: l.order + 1000 } });
  }
  for (let i = 0; i < NEW_ORDER.length; i++) {
    await tx.lesson.update({ where: { id: cur[NEW_ORDER[i] - 1].id }, data: { order: i } });
  }
  await tx.module.update({ where: { id: mod.id }, data: { contentVersion: { increment: 1 } } });
});
await p.appSetting.upsert({
  where: { key: 'content_version' },
  create: { key: 'content_version', valueJson: '"1"' },
  update: { valueJson: String(Date.now()) },
});
console.log('\n✅ тартиби нав татбиқ шуд');
await p.$disconnect();
