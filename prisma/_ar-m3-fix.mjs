// Ислоҳи ПУРРАИ Модули 3-и арабии A1 («Оила ва Одамон»).
//
// ⚠️ Ҳамон қоидаи аудио: ҲАРАКАТ бехатар аст (талаффуз ҳамон), иваз кардани
// КАЛИМА аудиои навро талаб мекунад (`_ar-m3-audio.mjs`).
//
// Қарорҳои асосӣ:
//   • Рақамҳои 1–3 ба дарси «Хешовандон» илова мешаванд. Модул мепурсад
//     «чанд бародар дорӣ?» бо вариантҳои واحد/اثنان/ثلاثة, вале рақам дар
//     Модули 4 таълим дода мешавад. Мисоли ҳамон дарс аллакай `أخ وَاحِد`
//     дорад — пас ҷои табиии онҳо ҳамин ҷост.
//   • Истилоҳи бобою бибӣ ЯКХЕЛА мешавад. Ҳозир се вариант: «Падаркалон»
//     (Д2), «Бобо» (мисоли Д13 ва саволи Д14), «Бобову бибӣ» (Д6).
//   • `لَطِيف` = «Нағз» → «Меҳрубон» (нағз гуфтугӯист ва бо «хуб» омехта мешавад).
//   • `رَضِيع` ва `طِفْل` ҳарду «Кӯдак» буданд — ду калима, як тарҷума.
//
//   node prisma/_ar-m3-fix.mjs --dry
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
  const r = await sql.query(text + ' RETURNING 1 AS x', params);
  console.log(`  ${r.length ? '✓' : '·'} ${label}${r.length ? '' : '  (ёфт нашуд)'}`);
  n += r.length;
};

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" nn ON nn.id=c."nativeLanguageId"
 WHERE t.code='ar' AND nn.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=2`, [course.id]);
const lessons = await sql.query(
  `SELECT id, "order", "skillType", "dialogueId", "grammarTopicId"
     FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [mod.id]);
const L = (o) => lessons.find((l) => l.order === o).id;
const lids = lessons.map((l) => l.id);
const gids = lessons.map((l) => l.grammarTopicId).filter(Boolean);

console.log(DRY ? '── DRY RUN ──' : '── ИСЛОҲИ МОДУЛИ 3 ──');

// ═══ 1. Рақамҳои 1–3 ═══════════════════════════════════════════════════
console.log('\n1 · рақамҳои 1–3 (Д2 «Хешовандон»)');
const NEW = [
  { w: 'وَاحِد', tr: 'Як', tg: 'ваҳид', ipa: '/ˈwaːħid/', e: '1️⃣',
    ex: 'عِنْدِي أَخٌ وَاحِد.', exTr: 'Ман як бародар дорам.' },
  { w: 'اِثْنَان', tr: 'Ду', tg: 'иснан', ipa: '/iθˈnaːn/', e: '2️⃣',
    ex: 'عِنْدِي أَخَوَانِ اِثْنَان.', exTr: 'Ман ду бародар дорам.' },
  { w: 'ثَلَاثَة', tr: 'Се', tg: 'саласа', ipa: '/θaˈlaːθa/', e: '3️⃣',
    ex: 'عِنْدَهُمْ ثَلَاثَةُ أَوْلَاد.', exTr: 'Онҳо се фарзанд доранд.' },
];
for (const w of NEW) {
  const [ex] = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 AND word=$2`, [L(2), w.w]);
  if (ex) { console.log(`  = ${w.w} аллакай ҳаст`); continue; }
  await run(`${w.w} («${w.tr}»)`,
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,ipa,"ipaTajik",example,"exampleTrans","order",difficulty)
     VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,999,1)`,
    [L(2), w.w, w.tr, w.e, w.ipa, w.tg, w.ex, w.exTr]);
}

// ═══ 2. Истилоҳи ЯКХЕЛА ва тарҷумаҳои дуруст ═══════════════════════════
console.log('\n2 · истилоҳ ва тарҷума');
for (const [w, tr] of [
  ['الجَدّ', 'Бобо'],
  ['الجَدَّة', 'Бибӣ'],
  ['الجَدَّان', 'Бобо ва бибӣ'],
  ['لَطِيف', 'Меҳрубон'],
  ['رَضِيع', 'Навзод'],       // буд «Кӯдак» — айнан мисли طِفْل
  ['مُسِنّ', 'Солхӯрда'],      // «Куҳансол» камистеъмол аст
]) {
  await run(`${w} → «${tr}»`,
    `UPDATE "Word" SET translation=$2 WHERE "lessonId"=ANY($1) AND word=$3`, [lids, tr, w]);
}

// ═══ 3. Мисол бояд худи калимаро дошта бошад (D13) ═════════════════════
console.log('\n3 · мисол ва калима як шакл');
const EX = [
  ['رَضِيع', 'هَذَا رَضِيعٌ صَغِيرٌ.', 'Ин навзоди хурд аст.'],
  ['قَوِيّ', 'أَخِي قَوِيّ.', 'Бародари ман қувватманд аст.'],
  ['طِفْل', 'هَذَا طِفْلٌ سَعِيدٌ.', 'Ин кӯдаки хушбахт аст.'],
  ['الجَدّ', 'جَدِّي رَجُلٌ حَكِيمٌ.', 'Бобои ман марди доно аст.'],
  ['الجَدَّة', 'جَدَّتِي تَطْبُخُ جَيِّداً.', 'Бибиям хуб мепазад.'],
  ['لَطِيف', 'هُوَ لَطِيفٌ.', 'Ӯ меҳрубон аст.'],
  ['حَزِين', 'لِمَاذَا أَنْتَ حَزِينٌ؟', 'Чаро ту ғамгинӣ?'],
  ['زَمِيل', 'هُوَ زَمِيلِي.', 'Ӯ ҳамкори ман аст.'],
  ['بِنْتُ الأَخ', 'بِنْتُ الأَخ لَطِيفَةٌ.', 'Ҷиян меҳрубон аст.'],
  ['اِبْنُ الأَخ', 'اِبْنُ الأَخ صَغِيرٌ.', 'Ҷиян хурд аст.'],
  ['اِبْنُ العَم', 'هُوَ اِبْنُ العَم.', 'Ӯ амакбача аст.'],
  ['العَمَّة', 'هِيَ العَمَّة.', 'Ӯ амма аст.'],
  ['العَمّ', 'هُوَ العَمّ.', 'Ӯ амак аст.'],
  ['تَوْأَم', 'هُمَا تَوْأَم.', 'Онҳо дугоникҳоянд.'],
  ['الجَدَّان', 'الجَدَّان هُنَا.', 'Бобо ва бибӣ ин ҷоянд.'],
];
for (const [w, ex, tr] of EX) {
  await run(`${w} → «${ex}»`,
    `UPDATE "Word" SET example=$2, "exampleTrans"=$3 WHERE "lessonId"=ANY($1) AND word=$4`,
    [lids, ex, tr, w]);
}

// ═══ 4. Эмоҷиҳои беназир (D15) ═════════════════════════════════════════
console.log('\n4 · эмоҷӣ');
for (const [w, e, why] of [
  ['اِبْنُ الأَخ', '🧒', 'буд 👦 — мисли Амакбача'],
  ['قَصِير', '📐', 'буд 📏 — мисли Қадбаланд'],
  ['لَطِيف', '🤗', 'буд 😎 — айнак ба «меҳрубон» намезебад'],
]) {
  await run(`${w} → ${e} (${why})`,
    `UPDATE "Word" SET emoji=$2 WHERE "lessonId"=ANY($1) AND word=$3`, [lids, e, w]);
}

// ═══ 5. Ҳаракати мисолҳои грамматика (аудио бехатар) ═══════════════════
console.log('\n5 · ҳаракати мисолҳои грамматика');
const GEX = [
  ['عندي أخٌ.', 'عِنْدِي أَخٌ.'],
  ['عندها قطتان.', 'عِنْدَهَا قِطَّتَانِ.'],
  ['عندنا بيتٌ كبيرٌ.', 'عِنْدَنَا بَيْتٌ كَبِيرٌ.'],
  ['ما عنده سيارةٌ.', 'مَا عِنْدَهُ سَيَّارَةٌ.'],
  ['عندهم ثلاثة أولادٍ.', 'عِنْدَهُمْ ثَلَاثَةُ أَوْلَادٍ.'],
  ['هذا أخي.', 'هَذَا أَخِي.'],
  ['اسمها سارة.', 'اِسْمُهَا سَارَة.'],
  ['سيارته حمراءُ.', 'سَيَّارَتُهُ حَمْرَاءُ.'],
  ['بيتنا كبيرٌ.', 'بَيْتُنَا كَبِيرٌ.'],
  ['أولادهم هنا.', 'أَوْلَادُهُمْ هُنَا.'],
  ['عندي كتابان، وعنده كتبٌ كثيرةٌ.', 'عِنْدِي كِتَابَانِ، وَعِنْدَهُ كُتُبٌ كَثِيرَةٌ.'],
  ['المعلمون هنا.', 'المُعَلِّمُونَ هُنَا.'],
  ['المعلمات لطيفاتٌ.', 'المُعَلِّمَاتُ لَطِيفَاتٌ.'],
  ['عندي أخوان.', 'عِنْدِي أَخَوَانِ.'],
  ['الأطفال يلعبون.', 'الأَطْفَالُ يَلْعَبُونَ.'],
];
for (const [from, to] of GEX) {
  await run(`${from} → ${to}`,
    `UPDATE "GrammarExample" SET sentence=$2 WHERE "topicId"=ANY($1) AND sentence=$3`, [gids, to, from]);
}

// ═══ 6. canDoStatement ═════════════════════════════════════════════════
console.log('\n6 · ваъдаи бахш');
await run('canDoStatement',
  `UPDATE "Module" SET "canDoStatement"=$2 WHERE id=$1`,
  [mod.id, 'Пас аз ин бахш дар бораи оила ва хешовандони худ нақл карда, одамонро тасвир карда метавонед.']);

// ═══ 7. Тартиби калимаҳо 1..N (ОХИРИН) ═════════════════════════════════
console.log('\n7 · тартиби калимаҳо');
for (const l of lessons) {
  const ws = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 ORDER BY "order", id`, [l.id]);
  if (!ws.length) continue;
  if (!DRY) for (let i = 0; i < ws.length; i++) {
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [ws[i].id, i + 1]);
  }
  console.log(`  ${DRY ? '[dry] ' : '✓ '}Д${l.order}: ${ws.length} → 1..${ws.length}`);
  n++;
}

console.log(`\n${DRY ? '[dry] ' : ''}${n} амал.`);
