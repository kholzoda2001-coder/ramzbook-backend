// 23 калимаи «ятим» аз чор модули ХОМӮШ ба дарсҳои ФАЪОЛ кӯчонида мешаванд.
//
// Ҳангоми кӯчонидан ҳар корт тоза мешавад:
//   • Матни арабӣ ва мисол ҲАРАКАТ мегиранд (манбаъ бе ҳаракат буд).
//   • Ғалатҳои тоҷикӣ: «мераввам»→«меравам», «Имтиҳонда»→«Дар имтиҳон»,
//     «маафаш кун»→«бубахш», «бинши»→«бинишин».
//   • Тарҷумаи қиякдор «Бозор / Дӯкон» → «Бозор».
//
// АУДИО аз нав сабт НАМЕШАВАД: ҳаракат талаффузро тағйир намедиҳад, пас
// клипи мавҷуда дуруст аст ва `audioUrl`-и корти манбаъ нусхабардорӣ мешавад.
//
// ⚠️ `خصم` («Тахфиф») кӯчонида НАМЕШАВАД: маҳз дар дарси мақсад
// (M7·Д2 «Дар мағоза») аллакай `تَخْفِيض` = «Тахфиф» ҳаст. Ду калимаи арабӣ
// бо ЯК тарҷумаи тоҷикӣ бозии мачро қулф мекунад.
//
// ⚠️ `مَاذَا` бо `مَا` («Чӣ», M0·Д3) бархӯрд мекард — акнун ҳар ду фарқи
// воқеии худро мегӯянд: `مَا` пеш аз ИСМ, `مَاذَا` пеш аз ФЕЪЛ меояд.
//
//   node prisma/_ar-rehome.mjs --dry
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');
const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" nn ON nn.id=c."nativeLanguageId"
 WHERE t.code='ar' AND nn.code='tg' AND c.level='A1'`);

const lessonId = async (mo, lo) => {
  const [m] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=$2`, [course.id, mo]);
  const [l] = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1 AND "order"=$2`, [m.id, lo]);
  return l?.id;
};
const srcAudio = async (bare) => {
  const [r] = await sql.query(
    `SELECT w."audioUrl" a FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
       JOIN "Module" m ON m.id=l."moduleId"
      WHERE m."courseId"=$1 AND m."order">=100 AND w.word=$2 LIMIT 1`, [course.id, bare]);
  return r?.a ?? null;
};

// [манбаъи бе ҳаракат, модул, дарс, калимаи ҳаракатдор, тарҷума, эмоҷӣ, транскрипсия, мисол, тарҷумаи мисол]
const MOVE = [
  // ── M8 «Ҷойҳо ва Самтҳо» ──
  ['السوق', 8, 2, 'السُّوق', 'Бозор', '🛒', 'ас-суқ', 'أَتَسَوَّقُ فِي السُّوق.', 'Ман дар бозор харидорӣ мекунам.'],
  ['المطار', 8, 8, 'المَطَار', 'Фурудгоҳ', '✈️', 'аль-матар', 'أَذْهَبُ إِلَى المَطَار.', 'Ман ба фурудгоҳ меравам.'],
  ['قريب', 8, 6, 'قَرِيب', 'Наздик', '📍', 'қариб', 'المُسْتَشْفَى قَرِيبٌ مِنْ هُنَا.', 'Беморхона аз ин ҷо наздик аст.'],
  // ── M4 «Корҳои рӯзмарра ва Амалҳо» ──
  ['يتكلم', 4, 1, 'يَتَكَلَّم', 'Сухан гуфтан', '💬', 'ятакаллам', 'أَتَكَلَّمُ العَرَبِيَّة.', 'Ман арабӣ ҳарф мезанам.'],
  ['يجلس', 4, 2, 'يَجْلِس', 'Нишастан', '🪑', 'яҷлис', 'اِجْلِسْ مِنْ فَضْلِك!', 'Илтимос бинишин!'],
  ['يسمع', 4, 3, 'يَسْمَع', 'Шунидан', '👂', 'ясмаъ', 'أَسْمَعُ المُوسِيقَى.', 'Ман мусиқӣ мешунавам.'],
  ['يرى', 4, 6, 'يَرَى', 'Дидан', '👁️', 'яра', 'أَرَاكَ فِي المَدْرَسَة.', 'Туро дар мактаб мебинам.'],
  ['يعرف', 4, 6, 'يَعْرِف', 'Донистан', '🧠', 'яъриф', 'أَعْرِفُ العَرَبِيَّةَ قَلِيلاً.', 'Ман каме арабӣ медонам.'],
  // ── M7 «Харид» ── (🛍️ ба 💳 иваз шуд: дарс аллакай 🛍 дорад ва ду
  //    эмоҷӣ танҳо бо «variation selector» фарқ мекунанд — чашм намебинад.)
  ['يشتري', 7, 2, 'يَشْتَرِي', 'Харидан', '💳', 'яштари', 'أَشْتَرِي تُفَّاحاً.', 'Ман себ мехарам.'],
  ['كم الثمن؟', 7, 8, 'كَم الثَّمَن؟', 'Нарх чанд аст?', '❓', 'кам ас-саман', 'كَمْ ثَمَنُ هَذَا؟', 'Нархи ин чанд аст?'],
  // ── M4·Д5 «Грамматика: Аломати саволӣ هل» — калимаҳои саволӣ ──
  ['ماذا؟', 4, 5, 'مَاذَا', 'Чӣ? (пеш аз феъл)', '❓', 'маза', 'مَاذَا تُرِيدُ؟', 'Чӣ мехоҳӣ?'],
  ['لماذا؟', 4, 5, 'لِمَاذَا', 'Чаро?', '❔', 'лимаза', 'لِمَاذَا لَمْ تَأْتِ؟', 'Чаро наомадӣ?'],
  ['كم؟', 4, 5, 'كَمْ', 'Чанд?', '🔢', 'кам', 'كَمْ عُمْرُكَ؟', 'Чандсола ҳастӣ?'],
  ['أيّ؟', 4, 5, 'أَيّ', 'Кадом?', '☝️', 'айю', 'أَيُّ كِتَابٍ تُرِيدُ؟', 'Кадом китобро мехоҳӣ?'],
  ['أين؟', 4, 5, 'أَيْنَ', 'Куҷо?', '📍', 'айна', 'أَيْنَ تَسْكُنُ؟', 'Куҷо зиндагӣ мекунӣ?'],
  ['كيف؟', 4, 5, 'كَيْفَ', 'Чӣ тавр?', '🤔', 'кайфа', 'كَيْفَ حَالُكَ؟', 'Чӣ ҳол дорӣ?'],
];

// ── M10: дарси НАВ «Ибораҳои ҳаррӯза» ──
// Унвони модул «Тандурустӣ ва Муоширати ҳаррӯза» аст, вале ҳар 16 дарсаш
// танҳо дар бораи саломатист — нимаи дуюми ваъда иҷро намешуд.
// (🤷 ду бор буд: `لا أفهم` акнун 😕 мегирад.)
const PHRASES = [
  ['لا أعرف', 'لَا أَعْرِف', 'Намедонам', '🤷', 'ла аъриф', 'لَا أَعْرِف، آسِف.', 'Намедонам, бубахш.'],
  ['لا أفهم', 'لَا أَفْهَم', 'Нафаҳмидам', '😕', 'ла афҳам', 'لَا أَفْهَم، هَلْ يُمْكِنُكَ الإِعَادَة؟', 'Нафаҳмидам, такрор карда метавонӣ?'],
  ['بالطبع', 'بِالطَّبْع', 'Албатта', '✅', 'бит-табъ', 'بِالطَّبْع، لَا مُشْكِلَة!', 'Албатта, мушкиле нест!'],
  ['لا مشكلة', 'لَا مُشْكِلَة', 'Мушкиле нест', '😊', 'ла мушкила', 'لَا مُشْكِلَة، يُسْعِدُنِي مُسَاعَدَتُك.', 'Мушкиле нест, ба шумо кӯмак кардан барои ман хурсандист.'],
  ['ساعدني من فضلك', 'سَاعِدْنِي مِنْ فَضْلِك', 'Кӯмак кун илтимос', '🆘', 'саъидни мин фазлак', 'سَاعِدْنِي مِنْ فَضْلِك!', 'Илтимос ба ман кӯмак кун!'],
  ['بالتوفيق', 'بِالتَّوْفِيق', 'Муваффақ бошӣ', '🍀', 'бит-тавфиқ', 'بِالتَّوْفِيق فِي الاِمْتِحَان!', 'Дар имтиҳон муваффақ бошӣ!'],
  ['أنا أتعلم العربية', 'أَنَا أَتَعَلَّمُ العَرَبِيَّة', 'Ман арабӣ меомӯзам', '📚', 'ана атаъаллам аль-арабийя', 'أَنَا أَتَعَلَّمُ العَرَبِيَّةَ مُنْذُ شَهْر.', 'Ман як моҳ боз арабӣ меомӯзам.'],
];

console.log(DRY ? '── DRY RUN ──' : '── кӯчонидан ──');
const add = async (lid, w, tr, e, ip, ex, exTr, bare) => {
  const [dup] = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 AND word=$2`, [lid, w]);
  if (dup) { console.log(`  = ${w} аллакай ҳаст`); return; }
  const audio = await srcAudio(bare);
  const [mx] = await sql.query(`SELECT COALESCE(MAX("order"),0)+1 n FROM "Word" WHERE "lessonId"=$1`, [lid]);
  await sql.query(
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,"ipaTajik",example,"exampleTrans","audioUrl","order",difficulty)
     VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,$9,1)`,
    [lid, w, tr, e, ip, ex, exTr, audio, mx.n]);
  console.log(`  ✓ ${e} ${w} = ${tr}${audio ? '' : '  ⚠️ БЕ АУДИО'}`);
};

for (const [bare, mo, lo, w, tr, e, ip, ex, exTr] of MOVE) {
  const lid = await lessonId(mo, lo);
  if (!lid) { console.log(`  ✗ M${mo}·Д${lo} ёфт нашуд`); continue; }
  if (DRY) { console.log(`  [dry] ${w} = ${tr} → M${mo}·Д${lo}`); continue; }
  process.stdout.write(`  M${mo}·Д${lo}`);
  await add(lid, w, tr, e, ip, ex, exTr, bare);
}

// ═══ M10 · дарси нав ═══════════════════════════════════════════════════
console.log('\n── M10: дарси «Ибораҳои ҳаррӯза» ──');
const [m10] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=10`, [course.id]);
const [ex10] = await sql.query(
  `SELECT id FROM "Lesson" WHERE "moduleId"=$1 AND "titleTranslated"='Ибораҳои ҳаррӯза'`, [m10.id]);
let newL = ex10?.id;
if (newL) console.log('  = аллакай ҳаст');
else if (DRY) console.log('  [dry] сохта ва ба Д9 гузошта мешавад');
else {
  // Дарсҳои 9+ як зина поён — модул 0 корбар дорад, пас бехатар аст.
  await sql.query(`UPDATE "Lesson" SET "order"="order"+1 WHERE "moduleId"=$1 AND "order">=9`, [m10.id]);
  const [r] = await sql.query(
    `INSERT INTO "Lesson" (id,"moduleId",title,"titleTranslated",type,"skillType",emoji,"xpReward",duration,"order")
     VALUES (gen_random_uuid()::text,$1,'عبارات يومية','Ибораҳои ҳаррӯза','vocab','vocab','💬',15,5,9) RETURNING id`,
    [m10.id]);
  newL = r.id;
  console.log('  ✓ дарси нав дар Д9 (дарсҳои баъдӣ як зина поён)');
}
for (const [bare, w, tr, e, ip, ex, exTr] of PHRASES) {
  if (DRY) { console.log(`  [dry] ${w} = ${tr}`); continue; }
  await add(newL, w, tr, e, ip, ex, exTr, bare);
}

// ═══ `مَا` бо `مَاذَا` наомезад ═════════════════════════════════════════
console.log('\n── бархӯрди «Чӣ» ──');
if (DRY) console.log('  [dry] مَا → «Чӣ? (пеш аз исм)»');
else {
  const l03 = await lessonId(0, 3);
  const r = await sql.query(
    `UPDATE "Word" SET translation='Чӣ? (пеш аз исм)' WHERE "lessonId"=$1 AND word='مَا' RETURNING 1 x`, [l03]);
  console.log(`  ${r.length ? '✓' : '·'} مَا → «Чӣ? (пеш аз исм)»  (مَاذَا → «Чӣ? (пеш аз феъл)»)`);
}

// ═══ Манбаъ пок мешавад ════════════════════════════════════════════════
console.log('\n── манбаъ ──');
const moved = [...MOVE.map((x) => x[0]), ...PHRASES.map((x) => x[0])];
if (DRY) console.log(`  [dry] ${moved.length} корт аз модулҳои хомӯш бароварда мешавад`);
else {
  const d = await sql.query(
    `DELETE FROM "Word" w USING "Lesson" l, "Module" m
      WHERE w."lessonId"=l.id AND l."moduleId"=m.id AND m."courseId"=$1
        AND m."order">=100 AND w.word=ANY($2) RETURNING 1 AS x`, [course.id, moved]);
  console.log(`  ✓ ${d.length} корт аз модулҳои хомӯш бароварда шуд`);
}

// ═══ Тартиби кортҳо 1..N дар ҳар дарси даст-расида ════════════════════
console.log('\n── тартиб ──');
if (!DRY) {
  const touched = [...new Set(MOVE.map((x) => `${x[1]}:${x[2]}`))];
  for (const t of touched) {
    const [mo, lo] = t.split(':').map(Number);
    const lid = await lessonId(mo, lo);
    const ws = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 ORDER BY "order", id`, [lid]);
    for (let i = 0; i < ws.length; i++)
      await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [ws[i].id, i + 1]);
  }
  const ws = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 ORDER BY "order", id`, [newL]);
  for (let i = 0; i < ws.length; i++)
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [ws[i].id, i + 1]);
  console.log(`  ✓ ${touched.length + 1} дарс 1..N шуд`);
}
console.log(`\n${DRY ? '[dry] ' : ''}тамом.`);
