// Ислоҳи ПУРРАИ Модули 2-и арабии A1 («Дар бораи Ман»).
//
// ⚠️ ҚОИДАИ АУДИО (ҳамон қоидаи Модули 1): матни арабие ки аудио дорад танҳо
// бо ҲАРАКАТ пурра карда мешавад — талаффуз ҳамон мемонад, аудио дуруст.
// Ҳар ҷое ки КАЛИМА иваз мешавад, аудиои он бояд аз нав тавлид шавад
// (`_ar-m2-audio.mjs`). Мисоли калима, тарҷума, эмоҷӣ ва варианти ҷавоб
// аудио НАДОРАНД — онҳо озоданд.
//
// ҚАРОРИ АСОСӢ — рақамҳо: чор рақами синну сол ба дарси «Синну сол» илова
// мешаванд (на он ки саволҳои рақамӣ бароварда шаванд). Сабаб: худи дарс
// `كَم عُمْرُك؟` меомӯзонад — саволе ки бе рақам ҷавоб надорад.
//
//   node prisma/_ar-m2-fix.mjs --dry
//   node prisma/_ar-m2-fix.mjs
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
  if (DRY) { console.log(`  [dry] ${label}`); n++; return 1; }
  const r = await sql.query(text + ' RETURNING 1 AS x', params).catch(async (e) => {
    if (!/RETURNING/i.test(e.message ?? '')) throw e;
    await sql.query(text, params); return [{ x: 1 }];
  });
  console.log(`  ${r.length ? '✓' : '·'} ${label}${r.length ? '' : '  (ёфт нашуд)'}`);
  n += r.length;
  return r.length;
};

const [course] = await sql.query(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" nn ON nn.id=c."nativeLanguageId"
 WHERE t.code='ar' AND nn.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=1`, [course.id]);
const lessons = await sql.query(
  `SELECT id, "order", "skillType", "dialogueId", "comprehensionId", "grammarTopicId"
     FROM "Lesson" WHERE "moduleId"=$1 ORDER BY "order"`, [mod.id]);
const L = (o) => lessons.find((l) => l.order === o).id;
const lids = lessons.map((l) => l.id);
const compIds = lessons.map((l) => l.comprehensionId).filter(Boolean);

console.log(DRY ? '── DRY RUN ──' : '── ИСЛОҲИ МОДУЛИ 2 ──');

// ═══ 1. РАҚАМҲО — ҷони дарси «Синну сол» ═══════════════════════════════
console.log('\n1 · рақамҳо (Д0)');
const NEW = [
  { l: 0, w: 'عَشَرَة', tr: 'Даҳ', tg: 'ашара', ipa: '/ˈʕaʃara/', e: '🔟',
    ex: 'عُمْرِي عَشَرَةُ سَنَوَاتٍ.', exTr: 'Ман даҳсола ҳастам.' },
  { l: 0, w: 'خَمْسَةَ عَشَرَ', tr: 'Понздаҳ', tg: 'хамсата ашара', ipa: '/ˈxamsata ˈʕaʃara/', e: '1️⃣5️⃣',
    ex: 'عُمْرِي خَمْسَةَ عَشَرَ سَنَةً.', exTr: 'Ман понздаҳсола ҳастам.' },
  { l: 0, w: 'تِسْعَةَ عَشَرَ', tr: 'Нуздаҳ', tg: 'тисъата ашара', ipa: '/ˈtisʕata ˈʕaʃara/', e: '1️⃣9️⃣',
    ex: 'عُمْرِي تِسْعَةَ عَشَرَ سَنَةً.', exTr: 'Ман нуздаҳсола ҳастам.' },
  { l: 0, w: 'عِشْرُونَ', tr: 'Бист', tg: 'ишрун', ipa: '/ʕiʃˈruːna/', e: '2️⃣0️⃣',
    ex: 'عُمْرِي عِشْرُونَ سَنَةً.', exTr: 'Ман бистсола ҳастам.' },
  // Кишвар/шаҳре ки дар матн ва дарси навиштан истифода мешуданд, вале
  // ҳеҷ ҷо таълим дода намешуданд.
  { l: 4, w: 'مِصْر', tr: 'Миср', tg: 'миср', ipa: '/misˤr/', e: '🇪🇬',
    ex: 'صَدِيقِي مِنْ مِصْر.', exTr: 'Дӯсти ман аз Миср аст.' },
  { l: 4, w: 'رُوسِيَا', tr: 'Русия', tg: 'русия', ipa: '/ruːsjaː/', e: '🇷🇺',
    ex: 'رُوسِيَا بَلَدٌ كَبِيرٌ.', exTr: 'Русия кишвари калон аст.' },
  { l: 5, w: 'لَنْدَن', tr: 'Лондон', tg: 'лондон', ipa: '/landan/', e: '🏙️',
    ex: 'لَنْدَن فِي إِنْجِلْتِرَا.', exTr: 'Лондон дар Англия аст.' },
];
for (const w of NEW) {
  const [ex] = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 AND word=$2`, [L(w.l), w.w]);
  if (ex) { console.log(`  = ${w.w} аллакай ҳаст`); continue; }
  await run(`${w.w} → Д${w.l} («${w.tr}»)`,
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,ipa,"ipaTajik",example,"exampleTrans","order",difficulty)
     VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,999,1)`,
    [L(w.l), w.w, w.tr, w.e, w.ipa, w.tg, w.ex, w.exTr]);
}

// ═══ 2. Мисол ва корт ЯК шакл (D13) ════════════════════════════════════
console.log('\n2 · калима ва мисоли он як шакл');
const EXFIX = [
  ['يَعِيش', 'هُوَ يَعِيشُ فِي دُوشَنْبِه.', 'Ӯ дар Душанбе зиндагӣ мекунад.'],
  ['يَتَحَدَّث', 'هُوَ يَتَحَدَّثُ الإِنْجِلِيزِيَّةَ.', 'Ӯ бо англисӣ гап мезанад.'],
  ['يَتَعَلَّم', 'هُوَ يَتَعَلَّمُ الرُّوسِيَّةَ.', 'Ӯ забони русиро меомӯзад.'],
  ['صَغِير', 'هُوَ صَغِيرٌ.', 'Ӯ ҷавон аст.'],
  ['بَائِع', 'هُوَ بَائِعٌ.', 'Ӯ фурӯшанда аст.'],
  ['عِيدُ مِيلَاد', 'اليَوْمَ عِيدُ مِيلَادِي.', 'Имрӯз зодрӯзи ман аст.'],
  ['الاِسْمُ الكَامِل', 'مَا الاِسْمُ الكَامِل؟', 'Ному насаб чист?'],
];
for (const [w, ex, tr] of EXFIX) {
  await run(`${w} → «${ex}»`,
    `UPDATE "Word" SET example=$2, "exampleTrans"=$3 WHERE "lessonId"=ANY($1) AND word=$4`,
    [lids, ex, tr, w]);
}

// ═══ 3. Эмоҷиҳо (D15 + маънои нодуруст) ════════════════════════════════
console.log('\n3 · эмоҷӣ');
for (const [w, e, why] of [
  ['ضَيْف', '🧳', 'дар → меҳмон'],
  ['مِن', '➡️', 'хона → пешоянд'],
  ['بَائِع', '🧑‍💼', 'деҳқон → фурӯшанда'],
  ['الإِنْجِلِيزِيَّة', '🗣', 'парчам → забон'],
  ['الطَّاجِيكِيَّة', '💬', 'парчам → забон'],
  ['الرُّوسِيَّة', '🈯', 'парчам → забон'],
]) {
  await run(`${w}: ${e} (${why})`,
    `UPDATE "Word" SET emoji=$2 WHERE "lessonId"=ANY($1) AND word=$3`, [lids, e, w]);
}

// ═══ 4. Тарҷумаҳо: ҳарфи калон, «Ӯ», забони дуруст ═════════════════════
console.log('\n4 · тоҷикӣ');
for (const [w, tr] of [
  ['يَعِيش', 'Зиндагӣ кардан'],
  ['هُنَا', 'Ин ҷо'],
  ['يَتَحَدَّث', 'Гап задан'],
  ['مُدِير', 'Роҳбар / Мудир'],
]) {
  await run(`${w} → «${tr}»`,
    `UPDATE "Word" SET translation=$2 WHERE "lessonId"=ANY($1) AND word=$3`, [lids, tr, w]);
}
await run('«Оё шумо бо англисӣ гап мезанед?» → «ту»',
  `UPDATE "Word" SET "exampleTrans"='Оё ту бо англисӣ гап мезанӣ?'
    WHERE "lessonId"=ANY($1) AND "exampleTrans" LIKE 'Оё шумо%'`, [lids]);

// ═══ 5. Ҳаракат — муколама (аудио бехатар) ═════════════════════════════
console.log('\n5 · ҳаракати муколама');
const DLG = [
  [0, 'مَرْحَباً!', 'Салом!'],
  [1, 'مَرْحَباً!', 'Салом!'],
  [2, 'مَا اسْمُكِ؟', 'Номат чист?'],
  [3, 'اِسْمِي عُمَر. مَا اسْمُكِ؟', 'Номи ман Умар аст. Номат чист?'],
  [4, 'اِسْمِي لَيْلَى. تَشَرَّفْنَا!', 'Номи ман Лайло аст. Аз шиносоӣ шодам!'],
  [5, 'تَشَرَّفْنَا أَيْضاً! مِنْ أَيْنَ أَنْتِ؟', 'Ман ҳам шодам! Ту аз куҷоӣ?'],
  [6, 'أَنَا مِنْ مِصْر. وَأَنْتَ؟', 'Ман аз Миср ҳастам. Ва ту?'],
  [7, 'أَنَا مِنْ طَاجِيكِسْتَان. أَنَا فِي دُوشَنْبِه.', 'Ман аз Тоҷикистон ҳастам. Ман дар Душанбе ҳастам.'],
  [8, 'كَمْ عُمْرُكَ؟', 'Ту чандсола ҳастӣ?'],
  [9, 'عُمْرِي عِشْرُونَ سَنَةً. وَأَنْتِ؟', 'Ман бистсола ҳастам. Ва ту?'],
  [10, 'عُمْرِي تِسْعَةَ عَشَرَ سَنَةً. أَتَحَدَّثُ العَرَبِيَّةَ.', 'Ман нуздаҳсола ҳастам. Ман бо арабӣ гап мезанам.'],
  [11, 'أَتَحَدَّثُ الطَّاجِيكِيَّةَ وَالعَرَبِيَّةَ. مَعَ السَّلَامَة!', 'Ман бо тоҷикӣ ва арабӣ гап мезанам. Хайр!'],
  [12, 'مَعَ السَّلَامَة!', 'Хайр!'],
];
const dlgId = lessons.find((l) => l.dialogueId)?.dialogueId;
const dlgRows = await sql.query(`SELECT id, "order" FROM "DialogueLine" WHERE "dialogueId"=$1`, [dlgId]);
for (const [o, text, tr] of DLG) {
  const row = dlgRows.find((r) => r.order === o);
  if (!row) { console.log(`  ⚠ сатри ${o} нест`); continue; }
  await run(`сатри ${o}`, `UPDATE "DialogueLine" SET text=$2, translation=$3 WHERE id=$1`, [row.id, text, tr]);
}

// ═══ 6. Ҳаракат — мисолҳои грамматика (аудио бехатар) ══════════════════
console.log('\n6 · ҳаракати мисолҳои грамматика');
const GEX = [
  ['ما اسمك؟', 'مَا اسْمُكَ؟'],
  ['من أين أنتَ؟', 'مِنْ أَيْنَ أَنْتَ؟'],
  ['من ذلك الرجل؟', 'مَنْ ذَلِكَ الرَّجُلُ؟'],
  ['كم عمرك؟', 'كَمْ عُمْرُكَ؟'],
  ['متى الدرس؟', 'مَتَى الدَّرْسُ؟'],
  ['عندي بيتٌ.', 'عِنْدِي بَيْتٌ.'],
  ['البيتُ كبيرٌ.', 'البَيْتُ كَبِيرٌ.'],
  ['الشمسُ حارةٌ.', 'الشَّمْسُ حَارَّةٌ.'],
  ['هذا كتابٌ.', 'هَذَا كِتَابٌ.'],
  ['افتح البابَ، من فضلك.', 'اِفْتَحِ البَابَ، مِنْ فَضْلِكَ.'],
];
const gids = lessons.map((l) => l.grammarTopicId).filter(Boolean);
for (const [from, to] of GEX) {
  await run(`${from} → ${to}`,
    `UPDATE "GrammarExample" SET sentence=$2 WHERE "topicId"=ANY($1) AND sentence=$3`, [gids, to, from]);
}

// ═══ 7. canDoStatement ═════════════════════════════════════════════════
console.log('\n7 · ваъдаи бахш');
await run('canDoStatement',
  `UPDATE "Module" SET "canDoStatement"=$2 WHERE id=$1`,
  [mod.id, 'Пас аз ин бахш дар бораи худатон нақл карда метавонед: ном, синну сол, кишвар, шаҳр, касб ва забон.']);

// ═══ 8. Тартиби калимаҳо 1..N (ОХИРИН — баъди иловаҳо) ═════════════════
console.log('\n8 · тартиби калимаҳо');
for (const l of lessons) {
  const ws = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 ORDER BY "order", id`, [l.id]);
  if (!ws.length) continue;
  if (!DRY) for (let i = 0; i < ws.length; i++) {
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [ws[i].id, i + 1]);
  }
  console.log(`  ${DRY ? '[dry] ' : '✓ '}Д${l.order}: ${ws.length} калима → 1..${ws.length}`);
  n++;
}

console.log(`\n${DRY ? '[dry] ' : ''}${n} амал.`);
