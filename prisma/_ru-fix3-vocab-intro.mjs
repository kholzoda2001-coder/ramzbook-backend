// ВАЗИФАИ 3 — ихтилофи луғавии Farzona (M1–M4) + васеъкунии дарси шиносоӣ (H4).
//
// ─── 3.1–3.4 · Ислоҳи `Word` ────────────────────────────────────────────────
//   Ты      «Шумо / Ту» → «Ту»   + мисол ба шакли БЕТАКАЛЛУФ мегузарад
//   Мой     «Ман (аз они ман)» → «-и ман / аз они ман»
//   Девочка «Духтарбача» → «Духтарча»  (бо тавзеҳи сатҳсанҷӣ ҳамоҳанг мешавад)
//   Да      мисол «Ҳа, ман тайёрам» → «Бале, ман тайёрам»
//
// Ҳар калима дар ЧАНД дарс такрор мешавад (L12 «Машқи навиштан» ҳамонҳоро
// дубора истифода мебарад), пас ислоҳ аз рӯи МАТНИ калима дар тамоми курс
// мегузарад — на аз рӯи як id.
//
// ─── 3.5 · Васеъкунии дарси шиносоӣ (H4) ────────────────────────────────────
// ⚠️ ТАВЗЕҲИ ҲУДУД: шумо навиштед «Модули 0, Дарси 0». Вале M0 L0 аллакай 6
// калима дорад ва «Пока» ва «Нет» аллакай ДАР ОНҲОЯНД. Ҳисоби худи шумо
// («ҳавз 5 калима шавад») ба ҷадвали ДИГАР мехӯрад: `OnboardingWord` — маҳз
// ҳамон «Дарси шиносоӣ»-и онбординг, ки 3 калима дорад (Привет/Спасибо/Да)
// ва боги H4 маҳз дар он аст. Пас 3 + 2 = 5 ин ҷо иҷро мешавад.
// Агар ба M0 L0 илова мекардем, дубора-калима пайдо мешуд.
//
// Аудио: барои «Пока» ва «Нет» файли МАВҶУДИ ҳамон калима аз `Word` дубора
// истифода мешавад (ҳамон овоз, ҳамон батч, ба commit SHA пин шудааст) —
// пас TTS-и нав лозим нест ва садо аз боқии курс фарқ намекунад.
//
// `transcriptionTajik` барои калимаи ЯКҲИҶОГӢ ҚАСДАН холӣ мемонад — ҳамон
// қоидае, ки `_ru-stress.mjs` муқаррар кардааст: «Калимаи якҳиҷогӣ (брат, дом,
// три) чизе намегирад». Пас «Нет» ва «Да» холӣ, «Пока» → «пока́».
//
//   node prisma/_ru-fix3-vocab-intro.mjs            # намоиш
//   node prisma/_ru-fix3-vocab-intro.mjs --apply    # иҷро
import { connect, RU, TG, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';
import { respellPhrase } from './_ru-phonetics.mjs';
import { S, S_EXTRA } from './_ru-stress-lexicon.mjs';

const sql = connect();
const stressOf = (bare) => S[bare] ?? S_EXTRA[bare] ?? null;
/** Ҳамон муҳаррики Вазифаи 4 — то ҳар 5 калимаи дарси шиносоӣ ЯК меъёр дошта бошанд. */
const tajikOf = (word) => respellPhrase(word, stressOf).text; // `null` = қасдан холӣ
banner('ВАЗИФАИ 3 · Ихтилофи луғавӣ + дарси шиносоӣ 3 → 5 калима');

let changed = 0;

// ═══ 3.1–3.4 · Word ═══════════════════════════════════════════════════════
// `null` = ин майдон тағйир намеёбад.
const WORD_FIXES = [
  {
    word: 'Ты',
    translation: 'Ту',
    exampleTrans: 'Ту дӯсти ман ҳастӣ.',
    why: 'M1 · «Шумо / Ту» ду сатҳи эҳтиром дар як корт буд; «ты»-и русӣ БЕТАКАЛЛУФ аст',
  },
  {
    word: 'Мой',
    translation: '-и ман / аз они ман',
    exampleTrans: null,
    why: 'M2 · «Ман» бо калимаи «Я» дар ҲАМОН дарс бархӯрд мекард',
  },
  {
    word: 'Девочка',
    translation: 'Духтарча',
    exampleTrans: 'Духтарча қадбаланд аст.',
    why: 'M3 · курс «Духтарбача» мегуфт, тавзеҳи сатҳсанҷӣ «духтарча» — ҳамоҳанг шуд',
  },
  {
    word: 'Да',
    translation: null,
    exampleTrans: 'Бале, ман тайёрам.',
    why: 'M4 · корт «Бале»-ро таълим медод, вале мисолаш «Ҳа» истифода мебурд',
  },
];

console.log('  ─── 3.1–3.4 · Ислоҳи калимаҳо (тамоми курси русӣ) ───\n');

for (const fix of WORD_FIXES) {
  const rows = await sql`
    SELECT w.id, w.word, w.translation, w."exampleTrans", m."order" mo, l."order" lo
    FROM "Word" w
    JOIN "Lesson" l ON l.id=w."lessonId"
    JOIN "Module" m ON m.id=l."moduleId"
    WHERE m."courseId"=${COURSE_RU_A1} AND w.word=${fix.word}
    ORDER BY m."order", l."order"`;

  console.log(`  ● ${fix.word}  (${rows.length} сатр)`);
  console.log(`      ${fix.why}`);

  let touched = 0;
  for (const r of rows) {
    const nextT = fix.translation ?? r.translation;
    const nextE = fix.exampleTrans ?? r.exampleTrans;
    if (r.translation === nextT && r.exampleTrans === nextE) {
      console.log(`      ✓ M${r.mo}L${r.lo} аллакай дуруст (идемпотент)`);
      continue;
    }
    console.log(`      M${r.mo}L${r.lo}  «${r.translation}» → «${nextT}»`);
    if (r.exampleTrans !== nextE) console.log(`              мисол: «${r.exampleTrans}» → «${nextE}»`);
    if (APPLY) {
      await sql`UPDATE "Word" SET translation=${nextT}, "exampleTrans"=${nextE} WHERE id=${r.id}`;
    }
    touched++;
  }
  changed += touched;
  console.log('');
}

// ═══ 3.5 · OnboardingWord: 3 → 5 ══════════════════════════════════════════
console.log('  ─── 3.5 · Дарси шиносоӣ (OnboardingWord) ───\n');

const current = await sql`
  SELECT id, word, "order" FROM "OnboardingWord"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} ORDER BY "order"`;
console.log(`  Ҳозир ${current.length} калима: ${current.map((w) => w.word).join(', ')}`);

// Аудиоро аз сатри МАВҶУДИ ҳамон калима дар `Word` мегирем — овози якхела.
const donors = await sql`
  SELECT DISTINCT w.word, w."audioUrl", w.ipa
  FROM "Word" w
  JOIN "Lesson" l ON l.id=w."lessonId"
  JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1} AND w.word IN ('Пока','Нет')`;
const donorOf = Object.fromEntries(donors.map((d) => [d.word, d]));

const NEW_WORDS = [
  {
    word: 'Пока',
    translation: 'Хайр',
    emoji: '🤙',
    example: 'Пока, увидимся позже.',
    exampleTrans: 'Хайр, то дидор.',
    options: ['Хайр', 'Салом', 'Ташаккур', 'Бале'],
    order: 4,
  },
  {
    word: 'Нет',
    translation: 'Не',
    emoji: '👎',
    example: 'Нет, спасибо.',
    exampleTrans: 'Не, ташаккур.',
    options: ['Не', 'Бале', 'Салом', 'Хайр'],
    order: 5,
  },
];

for (const nw of NEW_WORDS) {
  const exists = current.find((c) => c.word === nw.word);
  if (exists) { console.log(`  ✓ «${nw.word}» аллакай ҳаст (идемпотент)`); continue; }
  const donor = donorOf[nw.word];
  if (!donor?.audioUrl) {
    console.log(`  ⚠️  «${nw.word}»: аудиои донор ёфт нашуд — ГУЗАШТ (бе аудио илова намекунем)`);
    continue;
  }
  const tg = tajikOf(nw.word);
  console.log(`  ● илова: «${nw.word}» = «${nw.translation}»  ${nw.emoji}`);
  console.log(`      ipa=${donor.ipa}  tg=${tg ?? '(холӣ — талаффуз = навишт)'}`);
  console.log(`      аудио аз Word: …${donor.audioUrl.slice(-24)}`);
  if (APPLY) {
    await sql`
      INSERT INTO "OnboardingWord"
        (id,"targetLanguageId","nativeLanguageId",word,translation,transcription,
         "transcriptionTajik",emoji,example,"exampleTrans",options,"audioUrl","order","createdAt")
      VALUES (${'ruonb_' + Math.random().toString(36).slice(2, 12)}, ${RU}, ${TG},
         ${nw.word}, ${nw.translation}, ${donor.ipa}, ${tg}, ${nw.emoji},
         ${nw.example}, ${nw.exampleTrans}, ${JSON.stringify(nw.options)}::jsonb,
         ${donor.audioUrl}, ${nw.order}, now())`;
  }
  changed++;
}

// ── 3.6 · Ҳар 5 калима ба ЯК меъёри талаффуз оварда мешавад ───────────────
// Се сатри кӯҳна бо усули «танҳо зада» навишта шуда буданд («спаси́бо»), ду
// сатри нав бо муҳаррики Вазифаи 4 («спаси́ба» — бо редуксия). Дар як дарс ду
// меъёр будан хонандаро гумроҳ мекунад, пас ҳамаро аз ҳамон муҳаррик мегузаронем.
console.log('\n  ─── 3.6 · Як меъёри талаффуз барои ҳар 5 калима ───\n');
const all = await sql`
  SELECT id, word, "transcriptionTajik" FROM "OnboardingWord"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} ORDER BY "order"`;
for (const w of all) {
  const want = tajikOf(w.word);
  const cur = w.transcriptionTajik;
  if ((cur ?? null) === (want ?? null)) {
    console.log(`  ✓ ${w.word.padEnd(10)} «${cur ?? '(холӣ)'}» аллакай дуруст`);
    continue;
  }
  console.log(`  ● ${w.word.padEnd(10)} «${cur ?? '(холӣ)'}» → «${want ?? '(холӣ)'}»`);
  if (APPLY) {
    await sql`UPDATE "OnboardingWord" SET "transcriptionTajik"=${want} WHERE id=${w.id}`;
  }
  changed++;
}

// ═══ Тасдиқ ═══════════════════════════════════════════════════════════════
const after = await sql`
  SELECT word, translation, "order" FROM "OnboardingWord"
  WHERE "targetLanguageId"=${RU} AND "nativeLanguageId"=${TG} ORDER BY "order"`;
console.log(`\n  Дарси шиносоӣ акнун ${after.length} калима: ${after.map((w) => w.word).join(', ')}`);
if (after.length >= 4) {
  console.log('  → LessonStage.gentle 2 дистрактор мехоҳад; ҳавзи 5-калима акнун ХИЛОФ медиҳад ✓');
}

done(changed);
