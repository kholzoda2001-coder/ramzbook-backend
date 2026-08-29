// ВАЗИФАИ 2 — ислоҳи алифбои русӣ: лучшавии `toSound` (C3) + хатои фактӣ (H3, M12).
//
// ─── 2.1 · `tajikTranscription` (боги C3) ────────────────────────────────────
// МУШКИЛ: дар машқи `toSound` савол худи ҳарф аст («Б б») ва вариантҳо
// `tajikTranscription`-и 4 ҳарфанд. Дар русӣ 23 ҳарф транскрипсияашон АЙНАН
// худи ҳарф буд («Б» → «Б»), пас ҷавоб бо як нигоҳ ёфт мешуд. Боз 3-тоаш бо
// ҳамон ҳарф сар мешуд (Й, Щ, Ы) → 26 / 33 лучшуда.
//
// ҲАЛ — ДУ қабат:
//   1) МАЗМУН (ин скрипт): транскрипсия акнун НОМИ ҳарф аст бо хатти тоҷикӣ —
//      маҳз он чи аудио мегӯяд ва сутуни `ipa` сабт кардааст (Б = /bɛ/ = «бэ»).
//      Такрори худи ҳарф («Б» → «Б») тамоман нест шуд: 23 → 0.
//   2) МУҲАРРИК (`alphabet_mastery_service.toSoundIsUseful`, фазаи 2): агар
//      хатти ҳарфҳо ва хатти транскрипсияҳо ЯК бошад, саволи `toSound` тамоман
//      дода намешавад ва ба `sound` (садоро шунав → ҳарфро интихоб кун)
//      бармегардад. Барои РУСӢ маҳз ҳамин ҳолат аст.
//
// Танҳо қабати мазмун кофӣ НАБУД: номи русии аксари ҳамсадоҳо бо ҳамон ҳарф
// сар мешавад («бэ», «вэ»), пас мувофиқати ҳарфи аввал боқӣ мемонд. Гейти
// муҳаррик онро мебандад; ин ҷадвал акнун ТАНҲО дар корти ҳарф чоп мешавад.
//
// ─── 2.2 · Қоидаи #0 — «28» → «29 ҳарфи муштарак» (H3) ───────────────────────
// Тоҷикӣ 35 ҳарф, русӣ 33. Тоҷикӣ ц щ ы ь надорад (4) → 33 − 4 = 29.
// Русӣ ғ ӣ қ ӯ ҳ ҷ надорад (6) → 35 − 6 = 29. Ҳарду ҳисоб 29 медиҳад; фарқ Ъ буд.
//
// ─── 2.3 · Қоидаи #1 — Ъ аз «ҳарфҳои нав» бароварда мешавад (H3) ─────────────
// Ъ дар тоҷикӣ ҲАСТ: маърифат, таъриф, Саъдӣ. Барои он банди ҶУДОГОНА сохта
// мешавад, зеро вазифааш дар ду забон фарқ мекунад.
//
// ─── 2.4 · Қоидаи #2 — Ӣ ва Ӯ харита мешаванд (M12) ──────────────────────────
//
//   node prisma/_ru-fix2-alphabet.mjs            # намоиш
//   node prisma/_ru-fix2-alphabet.mjs --apply    # иҷро
import { connect, RU, TG, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('ВАЗИФАИ 2 · Алифбои русӣ — лучшавии toSound + хатои фактӣ');

let changed = 0;

// ═══ 2.1 · Транскрипсияи ҳарфҳо ═══════════════════════════════════════════
//
// Мазмун: НОМИ ҳарф бо хатти тоҷикӣ — маҳз он чи АУДИО мегӯяд ва маҳз он чи
// сутуни `ipa` аллакай сабт кардааст (Б = /bɛ/ = «бэ», Л = /ɛl/ = «эл»).
// Пеш ин ҷо худи ҳарф такрор мешуд («Б» → «Б») — на ба аудио мувофиқ буд, на
// ба IPA, ва дар машқи `toSound` ҷавобро луч мекард.
//
// ЧАРО КӮТОҲ: ин сатр дар корти ҳарф чоп мешавад (`alphabet_screen.dart:723`,
// fontSize 16) ва кортҳо дар шабакаи 2-сутуна бо `childAspectRatio: 0.9`
// нишастаанд. Ченкунӣ нишон дод, ки дар телефони 375px сатри
// «бэ — мисли «Бародар»» ба 4 сатр ва «садоноки нав — «и»-и ақибӣ» ба 6 сатр
// мешиканад — корт наметавонад ин қадар баланд шавад. Шакли кӯтоҳ ҳамеша
// ≤ 2 сатр аст. Тавзеҳи муфассали Ц/Щ/Ы/Ъ/Ь дар ҶОИ ДУРУСТи худ — дар
// `AlphabetRule` (қоидаҳои #1 ва банди нави Ъ) — аллакай ҳаст.
//
// ⚠️ Лучшавии `toSound` акнун дар қабати МУҲАРРИК баста шуд
// (`toSoundIsUseful` дар `alphabet_mastery_service.dart`): барои ҷуфти
// ҲАМХАТ савол тамоман дода намешавад. Пас ин сатр дигар ҳеҷ гоҳ ҳамчун
// варианти ҷавоб намебарояд — вазифааш танҳо корти ҳарф аст.
const TRANSCRIPTION = {
  А: 'а',
  Б: 'бэ',
  В: 'вэ',
  Г: 'гэ',
  Д: 'дэ',
  Е: 'йе',
  Ё: 'йо',
  Ж: 'жэ',
  З: 'зэ',
  И: 'и',
  Й: 'и-и кӯтоҳ',
  К: 'ка',
  Л: 'эл',
  М: 'эм',
  Н: 'эн',
  О: 'о',
  П: 'пэ',
  Р: 'эр',
  С: 'эс',
  Т: 'тэ',
  У: 'у',
  Ф: 'эф',
  Х: 'ха',
  Ц: 'цэ',
  Ч: 'че',
  Ш: 'ша',
  Щ: 'ща',
  Ъ: 'аломати сахт',
  Ы: 'садоноки нав',
  Ь: 'аломати нарм',
  Э: 'э',
  Ю: 'йу',
  Я: 'йа',
};

const letters = await sql`
  SELECT id, uppercase, lowercase, "tajikTranscription", category
  FROM "AlphabetLetter"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} ORDER BY "order"`;

console.log(`  ─── 2.1 · Транскрипсияи ${letters.length} ҳарф ───\n`);

const leaks = (letter, t) => t.trim().toLowerCase().startsWith(letter.toLowerCase());
let identBefore = 0, leakBefore = 0, leakAfter = 0, tChanged = 0;

for (const l of letters) {
  const want = TRANSCRIPTION[l.uppercase];
  if (!want) { console.log(`  ⚠️  ${l.uppercase}: дар ҷадвал нест — гузашт`); continue; }
  const cur = (l.tajikTranscription ?? '').trim();

  if (cur === l.uppercase.trim()) identBefore++;
  if (leaks(l.uppercase, cur)) leakBefore++;
  if (leaks(l.uppercase, want)) leakAfter++;

  if (cur === want) continue; // идемпотент
  tChanged++;
  console.log(`  ${l.uppercase} ${l.lowercase}  «${cur}»`);
  console.log(`         →  «${want}»`);
  if (APPLY) {
    await sql`UPDATE "AlphabetLetter" SET "tajikTranscription"=${want} WHERE id=${l.id}`;
  }
}
changed += tChanged;

console.log(`\n  Ҳисоби лучшавии toSound:`);
console.log(`    транскрипсия АЙНАН баробари ҳарф:  ${identBefore} → 0`);
console.log(`    бо ҳамон ҳарф сар мешавад (луч):   ${leakBefore} → ${leakAfter}`);
console.log(`    бо ҳамон ҳарф сар мешавад: ${leakAfter} — БЕЗАРАР аст, зеро`);
console.log(`    гейти муҳаррик (toSoundIsUseful) барои ҷуфти ҲАМХАТ саволи`);
console.log(`    toSound-ро тамоман хомӯш мекунад. Ин сатр танҳо дар корти ҳарф аст.`);

// ═══ 2.2–2.4 · Қоидаҳо ════════════════════════════════════════════════════
console.log(`\n  ─── 2.2–2.4 · Қоидаҳои алифбо ───\n`);

const rules = await sql`
  SELECT id, category, title, body, "order" FROM "AlphabetRule"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} ORDER BY "order"`;

/** Як қоидаро бо `title`-и ҷорӣ ёфта, сарлавҳа/матнашро иваз мекунад. */
async function patchRule(match, nextTitle, nextBody, label) {
  const r = rules.find((x) => x.title.includes(match));
  if (!r) { console.log(`  ⚠️  ${label}: қоида бо «${match}» ёфт нашуд — гузашт`); return 0; }
  if (r.title === nextTitle && r.body === nextBody) {
    console.log(`  ✓ ${label}: аллакай ислоҳ шудааст (идемпотент)`);
    return 0;
  }
  console.log(`  ● ${label}`);
  console.log(`      сарлавҳа: «${r.title}»`);
  if (r.title !== nextTitle) console.log(`             →  «${nextTitle}»`);
  if (APPLY) {
    await sql`UPDATE "AlphabetRule" SET title=${nextTitle}, body=${nextBody} WHERE id=${r.id}`;
  }
  return 1;
}

// 2.2 — қоидаи #0: 28 → 29, Ъ ба рӯйхати муштарак илова мешавад
changed += await patchRule(
  'Хабари хуш',
  'Хабари хуш: шумо аллакай кириллӣ мехонед',
  // Диққат: корти қоидаҳо `Text(r.body)`-и оддӣ аст (`alphabet_screen.dart:602`),
  // markdown РЕНДЕР НАМЕШАВАД — пас ҳеҷ `**bold**`, вагарна ситорачаҳо айнан чоп мешаванд.
  'Алифбои русӣ 33 ҳарф дорад ва ҳамон кириллики тоҷикист. Аз 33 ҳарф '
  + '29-тоаш ба ҳарфҳои тоҷикӣ мувофиқ аст — шумо онҳоро аз ҳозир мехонед: '
  + 'А Б В Г Д Е Ё Ж З И Й К Л М Н О П Р С Т У Ф Х Ч Ш Ъ Э Ю Я.',
  '2.2 · қоидаи #0 — «28» → «29 ҳарфи муштарак»',
);

// 2.3 — қоидаи #1: панҷ → чор, Ъ бароварда мешавад
changed += await patchRule(
  'ҳарфи НАВ барои шумо',
  'Чор ҳарфи НАВ барои шумо',
  'Ин чор ҳарф дар тоҷикӣ нест ва бояд аз нав омӯхта шавад:\n\n'
  + 'Ц — «тс» якҷоя: цена, центр\n'
  + 'Щ — «ш»-и дарозу нарм: борщ, ещё\n'
  + 'Ы — садоноки байни «и» ва «у», дар тоҷикӣ ҳамто надорад: мы, ты, сын\n'
  + 'Ь — аломати нарм, худаш садо надорад',
  '2.3 · қоидаи #1 — «Панҷ» → «Чор», Ъ бароварда шуд',
);

// 2.4 — қоидаи #2: Ӣ ва Ӯ харита мешаванд
changed += await patchRule(
  'Шаш ҳарфи тоҷикӣ',
  'Шаш ҳарфи тоҷикӣ дар русӣ НЕСТ',
  'Дар матни русӣ ин ҳарфҳоро ҳеҷ гоҳ намебинед: Ғ Ӣ Қ Ӯ Ҳ Ҷ.\n\n'
  + 'Ба ҷои онҳо:\n'
  + 'Ғ → Г · Қ → К · Ҳ → Х · Ӣ → И · Ӯ → У\n'
  + 'Ҷ → Дж (як ҳарф нест, ду ҳарф)\n\n'
  + 'Масалан: Ҷамол → Джамал · Рӯзӣ → Рузи · Ҳакимӣ → Хакими.',
  '2.4 · қоидаи #2 — Ӣ ва Ӯ харита шуданд',
);

// 2.3b — банди НАВ барои Ъ
const NEW_TITLE = 'Ъ — шумо инро доред, вале дар русӣ вазифаи ДИГАР дорад';
const NEW_BODY =
  'Аломати сахт (Ъ) дар тоҷикӣ ҲАСТ: маърифат, таъриф, Саъдӣ. Пас ҳарфи нав нест — '
  + 'вале вазифааш дар ду забон фарқ мекунад.\n\n'
  + 'Дар ТОҶИКӢ: садоро мебурад ё садонокро дароз мекунад (таъриф).\n'
  + 'Дар РУСӢ: худаш ҳеҷ садо надорад — танҳо ҶУДОКУНАНДА аст. Ҳамсадоро аз '
  + 'садоноки «й»-дор ҷудо мекунад:\n\n'
  + 'объявление («абйивление»)\n'
  + 'подъезд («падйезд»)\n'
  + 'съесть («сйест»)\n\n'
  + 'Бе Ъ ин калимаҳо якҷоя хонда мешуданд. Дар русӣ Ъ хеле кам вомехӯрад.';

const existing = rules.find((r) => r.title === NEW_TITLE);
if (existing) {
  console.log('  ✓ 2.3b · банди Ъ: аллакай мавҷуд аст (идемпотент)');
} else {
  console.log(`  ● 2.3b · банди НАВ илова мешавад: «${NEW_TITLE}»`);
  console.log('        (order=2; қоидаҳои order>=2 як зина поён тела дода мешаванд)');
  if (APPLY) {
    // Аввал ҷой холӣ мекунем, сипас мегузорем — то ду қоида як `order` нагиранд.
    await sql`
      UPDATE "AlphabetRule" SET "order"="order"+1
      WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} AND "order">=2`;
    await sql`
      INSERT INTO "AlphabetRule" (id,"targetLanguageId","nativeLanguageId",category,title,body,"order","createdAt")
      VALUES (${'ruarule_' + Math.random().toString(36).slice(2, 12)}, ${RU}, ${TG}, 'general', ${NEW_TITLE}, ${NEW_BODY}, 2, now())`;
  }
  changed++;
}

// ═══ Тасдиқ ═══════════════════════════════════════════════════════════════
const after = await sql`
  SELECT count(*)::int c FROM "AlphabetRule"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG}`;
const dupOrder = await sql`
  SELECT "order", count(*)::int c FROM "AlphabetRule"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG}
  GROUP BY "order" HAVING count(*) > 1`;
console.log(`\n  Қоидаҳо ҳамагӣ: ${after[0].c}${dupOrder.length ? `  ⚠️ order-и такрорӣ: ${JSON.stringify(dupOrder)}` : '  · order-и такрорӣ нест ✓'}`);

done(changed);
