// A-сохт · Нӯҳ дарси луғат паси ҳам → дарозтарин силсила 4.
//
// Zero, Nigina ва Faridun маҳз аз ин силсила рафтанд. Модул ду дарси
// грамматика дорад — бо онҳо танҳо силсилаи 11 калимаро ба се пора кардан
// мумкин аст. Пораи сеюмро дарси НАВИШТАН медиҳад: он навъи ДИГАРИ машқ
// аст, яъне танаффуси воқеӣ.
//
// Модули 4 дар зинаи `LessonStage.growing` аст (`lesson_stage.dart`:
// `moduleIndex <= 6`), яъне навиштан ва сохтани ҷумла аллакай фаъоланд —
// дарси дуюми навиштан ба ремп зид нест (дар Модули 3 мебуд).
//
// БУД:  V V V V V V V V V | G G | R S L Rv W T          силсила 9
// ШУД:  V V V V W V V V G V V V V G W | R S L Rv T      силсила 4
//
// Кортҳои дарси навиштан аз корти АСЛӢ нусхабардорӣ мешаванд — ҳамин
// A12-ро низ ислоҳ мекунад (`عُمْرُهُ سَبْعُون عَاماً.` ду тарҷума дошт:
// «Ӯ ҳафтод сола аст.» дар Д4 ва «Ӯ ҳафтодсола аст.» дар дарси навиштан).
//
//   node prisma/_ar-m4-fix3.mjs --dry
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
// Дарсҳо БО УНВОН гирифта мешаванд, ПЕШ аз ҳар тағйири ном.
const rows = await sql.query(
  `SELECT id, "titleTranslated" t FROM "Lesson" WHERE "moduleId"=$1 AND "isActive"`, [mod.id]);
const byT = Object.fromEntries(rows.map((r) => [r.t, r.id]));

console.log(DRY ? '── DRY RUN ──' : '── сохти нав ──');

// ═══ 1. Дарси нави навиштан ════════════════════════════════════════════
console.log('\n1 · дарси «Машқи навиштан: рақамҳо»');
let w1 = byT['Машқи навиштан: рақамҳо'];
if (w1) console.log('  = аллакай ҳаст');
else if (DRY) console.log('  [dry] сохта мешавад');
else {
  const [r] = await sql.query(
    `INSERT INTO "Lesson" (id,"moduleId",title,"titleTranslated",type,"skillType",emoji,"xpReward",duration,"order")
     VALUES (gen_random_uuid()::text,$1,'تدريب الكتابة: الأرقام','Машқи навиштан: рақамҳо','vocab','writing','✍️',15,5,902) RETURNING id`,
    [mod.id]);
  w1 = r.id;
  console.log('  ✓ сохта шуд');
}
const w2 = byT['Машқи навиштан'] ?? byT['Машқи навиштан: вақт'];

// ═══ 2. Кортҳои дарсҳои навиштан аз корти АСЛӢ ════════════════════════
console.log('\n2 · кортҳои машқи навиштан (нусха аз корти аслӣ)');
const W1 = ['وَاحِد', 'خَمْسَة', 'سَبْعَة', 'عَشَرَة', 'ثَلَاثَةَ عَشَرَ', 'ثَمَانِيَةَ عَشَرَ'];
const W2 = ['سَبْعُون', 'مِئَة', 'الأَرْبِعَاء', 'الجُمُعَة', 'فِبْرَايِر', 'أَغُسْطُس', 'العَاشِرَة'];
if (!DRY) {
  // Кортҳои кӯҳнаи ҳарду дарси навиштан пок мешаванд — баъд аз нав
  // сохта мешаванд, то АЙНАН ба корти аслӣ баробар бошанд.
  for (const lid of [w1, w2]) if (lid) await sql.query(`DELETE FROM "Word" WHERE "lessonId"=$1`, [lid]);
  for (const [lid, list] of [[w1, W1], [w2, W2]]) {
    for (let i = 0; i < list.length; i++) {
      const [src] = await sql.query(
        `SELECT w.word, w.translation, w.emoji, w.ipa, w."ipaTajik", w.example, w."exampleTrans", w."audioUrl"
           FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId"
          WHERE l."moduleId"=$1 AND l."skillType"<>'writing' AND w.word=$2 LIMIT 1`, [mod.id, list[i]]);
      if (!src) { console.log(`  ✗ ${list[i]} — корти аслӣ ёфт нашуд`); continue; }
      await sql.query(
        `INSERT INTO "Word" (id,"lessonId",word,translation,emoji,ipa,"ipaTajik",example,"exampleTrans","audioUrl","order",difficulty)
         VALUES (gen_random_uuid()::text,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,1)`,
        [lid, src.word, src.translation, src.emoji, src.ipa, src.ipaTajik, src.example, src.exampleTrans, src.audioUrl, i + 1]);
    }
  }
}
console.log(`  ${DRY ? '[dry] ' : '✓ '}рақамҳо: ${W1.length} корт · вақт: ${W2.length} корт`);

// ═══ 3. Унвони дарси навиштани кӯҳна ══════════════════════════════════
console.log('\n3 · унвон');
if (!DRY && w2) {
  await sql.query(
    `UPDATE "Lesson" SET title='تدريب الكتابة: الوقت', "titleTranslated"='Машқи навиштан: вақт' WHERE id=$1`, [w2]);
}
console.log(`  ${DRY ? '[dry] ' : '✓ '}«Машқи навиштан» → «Машқи навиштан: вақт»`);

// ═══ 4. Тартиби дарсҳо ════════════════════════════════════════════════
console.log('\n4 · тартиб');
const PLAN = [
  ['Рақамҳои 1-5', 'V'], ['Рақамҳои 6-10', 'V'], ['Рақамҳои 11-15', 'V'], ['Рақамҳои 16-20', 'V'],
  ['Машқи навиштан: рақамҳо', 'W'],
  ['Рақамҳои 30-100', 'V'], ['Рӯзҳои ҳафта', 'V'], ['Моҳҳои сол', 'V'],
  ['Грамматика: Гузаштаи كان', 'G'],
  ['Моҳҳои сол (2)', 'V'], ['Гуфтани вақт', 'V'],
  ['Соат чанд аст? (1–6)', 'V'], ['Соатҳо (7–12)', 'V'],
  ['Грамматика: Пешояндҳои вақт', 'G'],
  ['Машқи навиштан: вақт', 'W'],
  ['Вақт ва рақамҳо', 'R'], ['Муколама ва Амалия', 'S'], ['Шунавоӣ: Вақт ва рақамҳо', 'L'],
  ['Такрор', 'Rv'], ['Имтиҳони ниҳоӣ', 'T'],
];
const cur = await sql.query(`SELECT id, "titleTranslated" t FROM "Lesson" WHERE "moduleId"=$1 AND "isActive"`, [mod.id]);
const now = Object.fromEntries(cur.map((r) => [r.t, r.id]));
const missing = PLAN.map(([t]) => t).filter((t) => !now[t]);
if (missing.length) { console.error('  ✗ ЁФТ НАШУД:', missing); process.exit(1); }
for (let i = 0; i < PLAN.length; i++) {
  if (!DRY) await sql.query(`UPDATE "Lesson" SET "order"=$2 WHERE id=$1`, [now[PLAN[i][0]], i]);
  console.log(`  ${DRY ? '[dry] ' : '✓ '}${String(i).padStart(2)} ${PLAN[i][1].padEnd(2)} ${PLAN[i][0]}`);
}

// ═══ 5. Тартиби кортҳо 1..N (A4) ══════════════════════════════════════
console.log('\n5 · тартиби кортҳо дар ҳар дарс');
// Рақамҳо бояд аз рӯи ҚИМАТ истанд, на аз рӯи `id`: Д3 «16, 17, 20, 18, 19»
// ва Д4 «30, 40, 50, 90, 60, 70, 80, 100» медод.
const VALUE = {
  'وَاحِد': 1, 'اِثْنَان': 2, 'ثَلَاثَة': 3, 'أَرْبَعَة': 4, 'خَمْسَة': 5,
  'سِتَّة': 6, 'سَبْعَة': 7, 'ثَمَانِيَة': 8, 'تِسْعَة': 9, 'عَشَرَة': 10,
  'أَحَدَ عَشَرَ': 11, 'اِثْنَا عَشَرَ': 12, 'ثَلَاثَةَ عَشَرَ': 13,
  'أَرْبَعَةَ عَشَرَ': 14, 'خَمْسَةَ عَشَرَ': 15, 'سِتَّةَ عَشَرَ': 16,
  'سَبْعَةَ عَشَرَ': 17, 'ثَمَانِيَةَ عَشَرَ': 18, 'تِسْعَةَ عَشَرَ': 19,
  'عِشْرُون': 20, 'ثَلَاثُون': 30, 'أَرْبَعُون': 40, 'خَمْسُون': 50,
  'سِتُّون': 60, 'سَبْعُون': 70, 'ثَمَانُون': 80, 'تِسْعُون': 90, 'مِئَة': 100,
};
const DAYS = ['الاِثْنَيْن', 'الثُّلَاثَاء', 'الأَرْبِعَاء', 'الخَمِيس', 'الجُمُعَة', 'السَّبْت', 'الأَحَد'];
const MONTHS = ['يَنَايِر', 'فِبْرَايِر', 'مَارِس', 'أَبْرِيل', 'مَايُو', 'يُونْيُو',
  'يُولْيُو', 'أَغُسْطُس', 'سِبْتَمْبِر', 'أُكْتُوبَر', 'نُوفَمْبِر', 'دِيسَمْبِر'];
const rank = (w) => {
  if (VALUE[w] != null) return VALUE[w];
  const d = DAYS.indexOf(w); if (d >= 0) return d;
  const m = MONTHS.indexOf(w); if (m >= 0) return m;
  return null;
};
if (!DRY) {
  const all = await sql.query(`SELECT id, "order" o FROM "Lesson" WHERE "moduleId"=$1 AND "isActive" ORDER BY "order"`, [mod.id]);
  for (const l of all) {
    const ws = await sql.query(`SELECT id, word, "order" o FROM "Word" WHERE "lessonId"=$1`, [l.id]);
    if (!ws.length) continue;
    // Агар ҲАМАИ кортҳои дарс қимати табиӣ дошта бошанд — аз рӯи он чида
    // мешаванд; вагарна тартиби мавҷуда нигоҳ дошта, танҳо 1..N мешавад.
    const ranked = ws.every((w) => rank(w.word) !== null);
    const sorted = ranked
      ? [...ws].sort((a, b) => rank(a.word) - rank(b.word))
      : [...ws].sort((a, b) => a.o - b.o || (a.id < b.id ? -1 : 1));
    for (let i = 0; i < sorted.length; i++)
      await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [sorted[i].id, i + 1]);
    console.log(`  ✓ Д${l.o}: ${sorted.length} корт${ranked ? ' (аз рӯи қимат)' : ''}`);
  }
}
console.log(`\n${DRY ? '[dry] ' : ''}тамом.`);
