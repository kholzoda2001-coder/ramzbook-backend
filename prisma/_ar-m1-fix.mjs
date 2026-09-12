// Ислоҳи ПУРРАИ Модули 1-и арабии A1 — аз рӯи гузориши «студентҳои рақамӣ».
//
// ⚠️ ҚОИДАИ АСОСӢ: матни арабие, ки АУДИО дорад, танҳо бо ҲАРАКАТ пурра
// карда мешавад. Ҳаракат талаффузро иваз намекунад, пас аудиои мавҷуда дуруст
// мемонад. Ҳар ҷое, ки калима ИВАЗ мешавад, он ҷо аудио надорад (вариантҳои
// ҷавоб, матни савол) — вагарна садо ва матн аз ҳам ҷудо мешуданд.
//
//   node prisma/_ar-m1-fix.mjs --dry
//   node prisma/_ar-m1-fix.mjs
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const DRY = process.argv.includes('--dry');
let n = 0;
const run = async (label, text, params = []) => {
  if (DRY) { console.log(`  [dry] ${label}`); n++; return; }
  await sql.query(text, params);
  console.log(`  ✓ ${label}`);
  n++;
};

const [course] = await sql.query(`
  SELECT c.id FROM "Course" c
    JOIN "Language" t ON t.id=c."targetLanguageId"
    JOIN "Language" nn ON nn.id=c."nativeLanguageId"
   WHERE t.code='ar' AND nn.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(
  `SELECT id FROM "Module" WHERE "courseId"=$1 ORDER BY "order" LIMIT 1`, [course.id]);
const lessons = await sql.query(
  `SELECT id, "order", "skillType", "titleTranslated", "dialogueId", "comprehensionId"
     FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [mod.id]);
const L = (o) => lessons.find((l) => l.order === o).id;
const lids = lessons.map((l) => l.id);
const W = async (where, params) =>
  (await sql.query(`SELECT id, word FROM "Word" WHERE "lessonId"=ANY($1) AND ${where}`,
    [lids, ...params]))[0];

console.log(DRY ? '── DRY RUN ──' : '── ИСЛОҲ ──');

// ═══ D1 — «Кӣ» бо مَنْ, на مِن ══════════════════════════════════════════
console.log('\nD1 · хатои маъноии арабӣ');
{
  const w = await W(`translation='Кӣ'`, []);
  await run('مِن هَذَا؟ → مَنْ هَذَا؟',
    `UPDATE "Word" SET example='مَنْ هَذَا؟', "exampleTrans"='Ин кист?' WHERE id=$1`, [w.id]);
}

// ═══ D7 — тоҷикии дуруст ═══════════════════════════════════════════════
console.log('\nD7 · тоҷикӣ');
await run('عَفْواً: «Маафаш кунед» бароварда шуд',
  `UPDATE "Word" SET translation='Хоҳиш мекунам' WHERE "lessonId"=ANY($1) AND word='عَفْواً'`, [lids]);
await run('آسِف: «Ман бубахшед мегӯям» → «Ман узр мехоҳам»',
  `UPDATE "Word" SET "exampleTrans"='Ман узр мехоҳам.' WHERE "lessonId"=ANY($1) AND word='آسِف'`, [lids]);
await run('هَذَا: «Ин (аст)» → «Ин»',
  `UPDATE "Word" SET translation='Ин' WHERE "lessonId"=ANY($1) AND word='هَذَا'`, [lids]);

// ═══ D5 — як ҷумла, як тарҷума ═════════════════════════════════════════
console.log('\nD5 · тарҷумаҳои такрорӣ');
for (const [ex, tr] of [
  ['مَعَ السَّلَامَة، إِلَى اللِّقَاء!', 'Хайр, то дидор!'],
  ['شُكْراً جَزِيلاً!', 'Бисёр ташаккур!'],
  ['صَبَاح الخَيْر يَا أُسْتَاذ!', 'Субҳ ба хайр, устод!'],
]) {
  await run(`«${ex}» → «${tr}»`,
    `UPDATE "Word" SET "exampleTrans"=$2 WHERE "lessonId"=ANY($1) AND example=$3`, [lids, tr, ex]);
}

// ═══ D6 — як калима, як шакл ═══════════════════════════════════════════
console.log('\nD6 · шакл, эмоҷӣ, транскрипсия');
await run('أنتَ → أَنْتَ',
  `UPDATE "Word" SET word='أَنْتَ' WHERE "lessonId"=ANY($1) AND word='أنتَ'`, [lids]);
await run('مَعَ السَّلَامَة: эмоҷӣ 🚪 → 👋',
  `UPDATE "Word" SET emoji='👋' WHERE "lessonId"=ANY($1) AND word='مَعَ السَّلَامَة'`, [lids]);
await run('مَا اسْمُكَ؟: «ма исмак» → «ма исмука»',
  `UPDATE "Word" SET "ipaTajik"='ма исмука' WHERE "lessonId"=ANY($1) AND word='مَا اسْمُكَ؟'`, [lids]);

// ═══ D10 — мисоли такрорӣ ══════════════════════════════════════════════
console.log('\nD10 · мисоли такрорӣ');
await run('اِسْمُكَ: мисоли нав',
  `UPDATE "Word" SET example='اِسْمُكَ رُسْتَم.', "exampleTrans"='Номи ту Рустам аст.'
     WHERE "lessonId"=ANY($1) AND word='اِسْمُكَ'`, [lids]);

// ═══ D9 — «Хуш омадед» ба дарси салом ══════════════════════════════════
console.log('\nD9 · ҷои калима');
await run('أَهْلاً وَسَهْلاً: Дарси 5 → Дарси 0',
  `UPDATE "Word" SET "lessonId"=$2 WHERE "lessonId"=ANY($1) AND word='أَهْلاً وَسَهْلاً'`, [lids, L(0)]);

// ═══ D2 — калимаҳои нав (аудио дар қадами дуюм) ════════════════════════
console.log('\nD2a · калимаҳои нав');
const NEW = [
  { lesson: 1, word: 'كَيْفَ حَالُكَ؟', tr: 'Чӣ ҳол дорӣ?', ipaTg: 'кайфа ҳалука',
    ipa: '/ˈkajfa ˈħaːluka/', emoji: '🙂', ex: 'مَرْحَباً، كَيْفَ حَالُكَ؟', exTr: 'Салом, чӣ ҳол дорӣ?' },
  { lesson: 1, word: 'تَشَرَّفْنَا', tr: 'Аз шиносоӣ шодам', ipaTg: 'ташаррафна',
    ipa: '/taʃarˈrafnaː/', emoji: '🤝', ex: 'تَشَرَّفْنَا يَا صَدِيقِي.', exTr: 'Аз шиносоӣ шодам, дӯстам.' },
  { lesson: 1, word: 'أَيْضاً', tr: 'Низ / ҳам', ipaTg: 'айзан',
    ipa: '/ˈʔajdˤan/', emoji: '➕', ex: 'تَشَرَّفْنَا بِكَ أَيْضاً.', exTr: 'Ман ҳам аз шиносоӣ шодам.' },
  { lesson: 4, word: 'مُعَلِّم', tr: 'Муаллим', ipaTg: 'муъаллим',
    ipa: '/muˈʕallim/', emoji: '👨‍🏫', ex: 'هُوَ مُعَلِّمٌ.', exTr: 'Ӯ муаллим аст.' },
  { lesson: 4, word: 'طَالِب', tr: 'Донишҷӯ', ipaTg: 'талиб',
    ipa: '/ˈtˤaːlib/', emoji: '🧑‍🎓', ex: 'أَنَا طَالِبٌ.', exTr: 'Ман донишҷӯ ҳастам.' },
];
for (const w of NEW) {
  const [exists] = await sql.query(
    `SELECT id FROM "Word" WHERE "lessonId"=$1 AND word=$2`, [L(w.lesson), w.word]);
  if (exists) { console.log(`  = ${w.word} аллакай ҳаст`); continue; }
  await run(`${w.word} → Дарси ${w.lesson} («${w.tr}»)`,
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,ipa,"ipaTajik",example,"exampleTrans","order",difficulty)
     VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,999,1)`,
    [L(w.lesson), w.word, w.tr, w.emoji, w.ipa, w.ipaTg, w.ex, w.exTr]);
}

// ═══ D3 — ҳаракат ба матнҳо ва муколама ════════════════════════════════
// Танҳо ҳаракат илова мешавад — талаффуз ҳамон, пас аудио дуруст мемонад.
console.log('\nD3 · ҳаракат');
const PASSAGES = [
  ['Сохтани ҷумлаҳои шиносоӣ',
    'مَرْحَباً! اِسْمِي أَحْمَد. أَنَا طَالِبٌ. هَذَا صَدِيقِي. اِسْمُهُ كَرِيم. هُوَ مُعَلِّمٌ. صَبَاحُ الخَيْر يَا كَرِيم!'],
  ['Шунавоӣ: Шиносоӣ',
    'مَرْحَباً! اِسْمِي سَارَة. أَنَا مُعَلِّمَةٌ. صَبَاحُ الخَيْر لِلْجَمِيع. هَذَا صَدِيقِي عُمَر. هُوَ طَالِبٌ. تَشَرَّفْنَا. مَعَ السَّلَامَة، إِلَى اللِّقَاء!'],
  ['Такрори модул: Саломпурсӣ',
    'لِنُرَاجِعِ التَّحِيَّة! صَبَاحُ الخَيْر! اِسْمِي أَحْمَد. أَنَا طَالِبٌ. هَذَا صَدِيقِي كَرِيم. هُوَ مُعَلِّمٌ. شُكْراً وَمَعَ السَّلَامَة!'],
  ['Имтиҳони ниҳоӣ',
    'مَرْحَباً! اِسْمِي أَحْمَد. أَنَا وَلَدٌ. هَذِهِ صَدِيقَتِي سَارَة. هِيَ بِنْتٌ. سَارَة صَدِيقَتِي. صَبَاحُ الخَيْر يَا مُعَلِّم!'],
];
const compIds = lessons.filter((l) => l.comprehensionId).map((l) => l.comprehensionId);
for (const [title, txt] of PASSAGES) {
  await run(`матни «${title}» ҳаракатдор шуд`,
    `UPDATE "ComprehensionExercise" SET passage=$2 WHERE id=ANY($1) AND "titleTranslated"=$3`,
    [compIds, txt, title]);
}

// ⚠️ `order` аз СИФР сар мешавад — санҷида шуд (0..7), на 1..8.
const DLG = [
  [0, 'السَّلَامُ عَلَيْكُم.', 'Ассалому алайкум.'],
  [1, 'وَعَلَيْكُمُ السَّلَام.', 'Ва алайкум ассалом.'],
  [2, 'كَيْفَ حَالُكَ؟', 'Чӣ ҳол дорӣ?'],
  [3, 'بِخَيْرٍ، شُكْراً.', 'Хубам, ташаккур.'],
  [4, 'مَا اسْمُكَ؟', 'Номат чист?'],
  [5, 'اِسْمِي أَحْمَد.', 'Номи ман Аҳмад аст.'],
  [6, 'تَشَرَّفْنَا.', 'Аз шиносоӣ шодам.'],
  [7, 'تَشَرَّفْنَا بِكَ أَيْضاً.', 'Ман ҳам аз шиносоӣ шодам.'],
];
const dlgId = lessons.find((l) => l.dialogueId)?.dialogueId;
const dlgLines = await sql.query(
  `SELECT id, "order" FROM "DialogueLine" WHERE "dialogueId"=$1 ORDER BY "order"`, [dlgId]);
for (const [ord, text, tr] of DLG) {
  const row = dlgLines.find((r) => r.order === ord);
  if (!row) { console.log(`  ⚠ сатри ${ord} ёфт нашуд`); continue; }
  await run(`муколама, сатри ${ord}: ҳаракат + «ту»`,
    `UPDATE "DialogueLine" SET text=$2, translation=$3 WHERE id=$1`, [row.id, text, tr]);
}

// ═══ D2b — саволҳо ва вариантҳо (аудио надоранд) ═══════════════════════
console.log('\nD2b · саволҳо ва вариантҳо');
const QFIX = {
  'Сохтани ҷумлаҳои шиносоӣ': [
    { q: 'مَا اسْمُهُ؟', qt: 'Номи ӯ чист?', o: ['أَحْمَد', 'كَرِيم', 'عُمَر'], c: 1 },
    { q: 'مَنْ هُوَ كَرِيم؟', qt: 'Карим кист?', o: ['وَلَدٌ', 'طَالِبٌ', 'مُعَلِّمٌ'], c: 2 },
  ],
  'Шунавоӣ: Шиносоӣ': [
    { q: 'مَا اسْمُهَا؟', qt: 'Номи ӯ чист?', o: ['سَارَة', 'لَيْلَى', 'عُمَر'], c: 0 },
    { q: 'مَنْ هِيَ سَارَة؟', qt: 'Сара кист?', o: ['بِنْتٌ', 'مُعَلِّمَةٌ', 'اِمْرَأَةٌ'], c: 1 },
    { q: 'مَا اسْمُ الرَّجُل؟', qt: 'Номи мард чист?', o: ['أَحْمَد', 'عُمَر', 'كَرِيم'], c: 1 },
  ],
  'Такрори модул: Саломпурсӣ': [
    { q: 'مَنْ هُوَ كَرِيم؟', qt: 'Карим кист?', o: ['طَالِبٌ', 'مُعَلِّمٌ', 'وَلَدٌ'], c: 1 },
    { q: 'مَنْ هُوَ أَحْمَد؟', qt: 'Аҳмад кист?', o: ['مُعَلِّمٌ', 'طَالِبٌ', 'رَجُلٌ'], c: 1 },
  ],
  'Имтиҳони ниҳоӣ': [
    { q: 'مَا اسْمُ الوَلَد؟', qt: 'Номи писар чист?', o: ['أَحْمَد', 'سَارَة', 'كَرِيم'], c: 0 },
    { q: 'مَنْ هِيَ سَارَة؟', qt: 'Сара кист?', o: ['رَجُلٌ', 'بِنْتٌ', 'وَلَدٌ'], c: 1 },
    { q: 'مَرْحَباً', qt: '«مَرْحَباً» чӣ маъно дорад?', o: ['Салом', 'Хайр', 'Ташаккур'], c: 0 },
    { q: 'شُكْراً', qt: '«شُكْراً» чӣ маъно дорад?', o: ['Бубахшед', 'Ташаккур', 'Лутфан'], c: 1 },
    { q: 'أَنَا ___ .', qt: 'Ман мард ҳастам.', o: ['رَجُلٌ', 'بِنْتٌ', 'اِمْرَأَةٌ'], c: 0 },
    { q: 'سَارَة بِنْتٌ. ___ صَدِيقَةٌ.', qt: 'Барои зан кадом ҷонишин?', o: ['هِيَ', 'هُوَ', 'أَنَا'], c: 0 },
    { q: 'مَعَ السَّلَامَة', qt: '«مَعَ السَّلَامَة» чӣ маъно дорад?', o: ['Бале', 'Хайр', 'Салом'], c: 1 },
    { q: '___ رَجُلٌ.', qt: 'Ин мард аст.', o: ['هَذَا', 'هَذِهِ', 'أَنْتِ'], c: 0 },
  ],
};
for (const [title, qs] of Object.entries(QFIX)) {
  const [ex] = await sql.query(
    `SELECT id FROM "ComprehensionExercise" WHERE id=ANY($1) AND "titleTranslated"=$2`, [compIds, title]);
  if (!ex) { console.log(`  ⚠ «${title}» ёфт нашуд`); continue; }
  await run(`«${title}»: саволҳои кӯҳна ҳазф`,
    `DELETE FROM "ComprehensionQuestion" WHERE "exerciseId"=$1`, [ex.id]);
  for (let i = 0; i < qs.length; i++) {
    const q = qs[i];
    await run(`  савол ${i + 1}: ${q.qt}`,
      `INSERT INTO "ComprehensionQuestion" (id,"exerciseId",question,"questionTranslated",options,"correctIndex","order")
       VALUES (gen_random_uuid()::text,$1,$2,$3,$4::jsonb,$5,$6)`,
      [ex.id, q.q, q.qt, JSON.stringify(q.o), q.c, i + 1]);
  }
}

// ═══ D12 — ваъдаи бахш ═════════════════════════════════════════════════
console.log('\nD12 · canDoStatement');
await run('canDoStatement навишта шуд',
  `UPDATE "Module" SET "canDoStatement"=$2 WHERE id=$1`,
  [mod.id, 'Пас аз ин бахш салом дода, худро муаррифӣ карда ва номи касро пурсида метавонед.']);

// ═══ D8 — тартиби калимаҳо (ОХИРИН: баъди ҳама кӯчонӣ ва иловаҳо) ══════
console.log('\nD8 · тартиби калимаҳо');
for (const l of lessons) {
  const ws = await sql.query(
    `SELECT id FROM "Word" WHERE "lessonId"=$1 ORDER BY "order", id`, [l.id]);
  if (!ws.length) continue;
  for (let i = 0; i < ws.length; i++) {
    if (DRY) continue;
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [ws[i].id, i + 1]);
  }
  console.log(`  ${DRY ? '[dry] ' : '✓ '}Дарси ${l.order}: ${ws.length} калима → 1..${ws.length}`);
  n++;
}

console.log(`\n${DRY ? '[dry] ' : ''}${n} амал.`);
