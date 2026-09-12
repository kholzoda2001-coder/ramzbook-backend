// A6 · Модул «Гуфтани вақт» дарс дорад, вале гуфтани соатро НАМЕОМӮЗОНАД.
//
// Ҳар матн, муколама ва саволи имтиҳон аз `الثَّالِثَة`, `العَاشِرَة`,
// `التَّاسِعَة`… иборат аст — вале ин шаклҳо ҳеҷ ҷо таълим намешаванд.
// Аудит онҳоро дар 5 дарс ҳамчун «калимаи наомӯхта» ёфт.
//
// Ҳал: ду дарси нав (соатҳои 1–6 ва 7–12). ЧАРО ҳамаи 12-то, на танҳо
// ҳафттои дар матн истифодашуда: хонандае ки 3, 4, 6, 7, 8, 9, 10-ро
// медонад вале 1, 2, 5, 11, 12-ро не, соатро гуфта НАМЕТАВОНАД.
//
// `مَتَى` («кай») ба дарси «Гуфтани вақт» илова мешавад — он ҳам дар
// муколама ва имтиҳон истифода мешуд, вале таълим намешуд.
//
// `صَبَاحاً` КОРТ намешавад: он шакли зарфист, на калимаи алоҳида, ва дар
// як дарс бо `الصَّبَاح` истодан хонандаро печида мекунад. Ҷои дурусташ
// грамматикаи «Пешояндҳои вақт» аст, ки аллакай `لَيْلاً`-ро ҳамин тавр
// меомӯзонад — як мисоли нав илова мешавад.
//
// ⚠️ 13 калимаи нав → `_ar-m4-audio.mjs` ҳатмист.
//
//   node prisma/_ar-m4-fix2.mjs --dry
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
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=3`, [course.id]);
const rows = await sql.query(
  `SELECT id, "order" o, "titleTranslated" t, "grammarTopicId" g FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
const byT = Object.fromEntries(rows.map((r) => [r.t, r]));

// Соат: шакли тартибии МУАННАС. Эмоҷӣ — рӯи соати ҳамон вақт, пас ҳар
// корт тасвири беназири худро дорад (мушкили 📅-и такрории Д5 ин ҷо нест).
const HOURS = [
  ['الوَاحِدَة', 'Соати як', 'аль-воҳида', '🕐', 'السَّاعَة الوَاحِدَة.', 'Соат як аст.'],
  ['الثَّانِيَة', 'Соати ду', 'ас-сания', '🕑', 'السَّاعَة الثَّانِيَة.', 'Соат ду аст.'],
  ['الثَّالِثَة', 'Соати се', 'ас-салиса', '🕒', 'تَنْتَهِي المَدْرَسَة فِي السَّاعَة الثَّالِثَة.', 'Мактаб соати се тамом мешавад.'],
  ['الرَّابِعَة', 'Соати чор', 'ар-рабиа', '🕓', 'السَّاعَة الرَّابِعَة.', 'Соат чор аст.'],
  ['الخَامِسَة', 'Соати панҷ', 'аль-хамиса', '🕔', 'السَّاعَة الخَامِسَة.', 'Соат панҷ аст.'],
  ['السَّادِسَة', 'Соати шаш', 'ас-садиса', '🕕', 'السَّاعَة السَّادِسَة.', 'Соат шаш аст.'],
  ['السَّابِعَة', 'Соати ҳафт', 'ас-сабиа', '🕖', 'السَّاعَة السَّابِعَة.', 'Соат ҳафт аст.'],
  ['الثَّامِنَة', 'Соати ҳашт', 'ас-самина', '🕗', 'تَبْدَأ المَدْرَسَة فِي السَّاعَة الثَّامِنَة.', 'Мактаб соати ҳашт сар мешавад.'],
  ['التَّاسِعَة', 'Соати нӯҳ', 'ат-тасиа', '🕘', 'السَّاعَة التَّاسِعَة.', 'Соат нӯҳ аст.'],
  ['العَاشِرَة', 'Соати даҳ', 'аль-ашира', '🕙', 'الدَّرْس فِي السَّاعَة العَاشِرَة.', 'Дарс соати даҳ аст.'],
  ['الحَادِيَةَ عَشْرَةَ', 'Соати ёздаҳ', 'аль-ҳадия ашра', '🕚', 'السَّاعَة الحَادِيَةَ عَشْرَةَ.', 'Соат ёздаҳ аст.'],
  ['الثَّانِيَةَ عَشْرَةَ', 'Соати дувоздаҳ', 'ас-сания ашра', '🕛', 'السَّاعَة الثَّانِيَةَ عَشْرَةَ.', 'Соат дувоздаҳ аст.'],
];

console.log(DRY ? '── DRY RUN ──' : '── A6: соатҳо ──');
const mkLesson = async (title, tj, emoji, order) => {
  const ex = rows.find((r) => r.t === tj);
  if (ex) { console.log(`  = «${tj}» аллакай ҳаст`); return ex.id; }
  if (DRY) { console.log(`  [dry] дарси «${tj}» сохта мешавад`); return null; }
  const [r] = await sql.query(
    `INSERT INTO "Lesson" (id,"moduleId",title,"titleTranslated",type,"skillType",emoji,"xpReward",duration,"order")
     VALUES (gen_random_uuid()::text,$1,$2,$3,'vocab','vocab',$4,15,5,$5) RETURNING id`,
    [mod.id, title, tj, emoji, order]);
  console.log(`  ✓ дарси «${tj}» сохта шуд`);
  return r.id;
};
const a = await mkLesson('كَم السَّاعَة؟ (١–٦)', 'Соат чанд аст? (1–6)', '🕐', 900);
const b = await mkLesson('كَم السَّاعَة؟ (٧–١٢)', 'Соатҳо (7–12)', '🕖', 901);

for (let i = 0; i < HOURS.length; i++) {
  const [w, tr, ipa, e, ex, exTr] = HOURS[i];
  const lid = i < 6 ? a : b;
  const ord = (i % 6) + 1;
  if (DRY) { console.log(`  [dry] ${e} ${w} = ${tr}`); continue; }
  const [dup] = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 AND word=$2`, [lid, w]);
  if (dup) { console.log(`  = ${w} аллакай ҳаст`); continue; }
  await sql.query(
    `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,"ipaTajik",example,"exampleTrans","order",difficulty)
     VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,1)`,
    [lid, w, tr, e, ipa, ex, exTr, ord]);
  console.log(`  ✓ ${e} ${w} = ${tr}`);
}

// ═══ مَتَى ба «Гуфтани вақт» ════════════════════════════════════════════
console.log('\nمَتَى («кай»)');
const tell = byT['Гуфтани вақт'];
if (DRY) console.log('  [dry] مَتَى илова мешавад');
else {
  const [dup] = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 AND word='مَتَى'`, [tell.id]);
  if (dup) console.log('  = аллакай ҳаст');
  else {
    await sql.query(
      `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,"ipaTajik",example,"exampleTrans","order",difficulty)
       VALUES (gen_random_uuid()::text,$1,'مَتَى','Кай','❓','мата','مَتَى عِيدُ مِيلَادِك؟','Зодрӯзи ту кай аст?',900,1)`,
      [tell.id]);
    console.log('  ✓ مَتَى = «Кай»  («ту», на «Шумо» — A11)');
  }
  // Эмоҷии السَّاعَة бо соати 1-и дарси нав хӯрдан мегирад — соати мизӣ мешавад.
  const r = await sql.query(`UPDATE "Word" SET emoji='🕰' WHERE "lessonId"=$1 AND word='السَّاعَة' RETURNING 1 x`, [tell.id]);
  console.log(`  ${r.length ? '✓' : '·'} السَّاعَة 🕐 → 🕰`);
}

// ═══ صَبَاحاً ҳамчун ГРАММАТИКА ════════════════════════════════════════
console.log('\nصَبَاحاً (шакли зарфӣ — грамматика, на корт)');
const prep = byT['Грамматика: Пешояндҳои вақт'];
if (DRY) console.log('  [dry] мисоли صَبَاحاً илова мешавад');
else if (!prep?.g) console.log('  ✗ мавзӯи грамматика ёфт нашуд');
else {
  const [dup] = await sql.query(
    `SELECT id FROM "GrammarExample" WHERE "topicId"=$1 AND sentence LIKE '%صَبَاحاً%'`, [prep.g]);
  if (dup) console.log('  = аллакай ҳаст');
  else {
    const [mx] = await sql.query(`SELECT COALESCE(MAX("order"),0)+1 n FROM "GrammarExample" WHERE "topicId"=$1`, [prep.g]);
    await sql.query(
      `INSERT INTO "GrammarExample" (id,"topicId",sentence,translation,"order")
       VALUES (gen_random_uuid()::text,$1,$2,$3,$4)`,
      [prep.g, 'الدَّرْس فِي السَّاعَة العَاشِرَة صَبَاحاً.', 'Дарс соати даҳи субҳ аст.', mx.n]);
    console.log('  ✓ «الدَّرْس فِي السَّاعَة العَاشِرَة صَبَاحاً.»');
  }
}
console.log(`\n${DRY ? '[dry] ' : ''}тамом.`);
