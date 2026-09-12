// B5 + B6 · Сохти модул.
//
// БУД:  V5 V4 V8 V4 V6 V6 V6 | G G G | R S L W Rv T
//       ↑ ҳафт дарси луғат паси ҳам, яке аз онҳо 8 калима
//
// ШУД:  V5 V4 V4 G V5 V3 G V6 V6 G V6 | R S L W Rv T
//       ↑ силсилаи дарозтарин 3, калимаи максималӣ 6
//
// Ду тағйир:
//   B5 · Д2 ҳашт калима дошт (رقам + хешованд якҷо). العَمّ ба дарси
//        «Хешовандон (2)» мегузарад — он ҷо العَمَّة ҳаст, ҷуфти табиӣ.
//        Рақамҳо дарси ХУДРО мегиранд.
//   B6 · Грамматика байни луғат пахш мешавад, на се дарс паси ҳам дар охир.
//        Тартиб аз рӯи ЭҲТИЁҶ чида шуд:
//          «Пасвандҳои соҳибӣ» → баъди хешовандон (أَخِي, اِسْمُهَا)
//          «Молкият бо عند»    → баъди рақамҳо (عِنْدَهُمْ ثَلَاثَةُ أَوْلَادٍ)
//          «Ҷамъи исмҳо»       → баъди тавсиф (المُعَلِّمَاتُ لَطِيفَاتٌ)
//
// ⚠️ Ин кор танҳо барои он бехатар аст, ки `completedLessons` дар клиент
// маҷмӯи РАҚАМИ ТАРТИБ аст (`Set<int>`, `unit_progress.dart:5`) — на id.
// Санҷида шуд: ин модул 0 корбар ва 0 сабти `UserProgress` дорад, пас
// прогресси ҳеҷ кас вайрон намешавад. Дар модуле ки хонанда дорад, ин
// корро БЕ кӯчонидани сабтҳо кардан мумкин нест.
//
//   node prisma/_ar-m3-fix5.mjs --dry
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
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 AND "order"=2`, [course.id]);

// Дарсҳо БО УНВОН гирифта мешаванд, пеш аз ҳар гуна тағйирдиҳии ном —
// вагарна калиди ҷустуҷӯ дар нимаи роҳ иваз мешавад (доми шинохта).
const rows = await sql.query(
  `SELECT id, "order" o, "titleTranslated" t FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
const byTitle = Object.fromEntries(rows.map((r) => [r.t, r.id]));
const need = ['Оилаи ман', 'Оилаи ман (2)', 'Хешовандон ва рақамҳо', 'Хешовандон (2)',
  'Одамони атрофам', 'Тавсифи одамон', 'Синну сол ва оила',
  'Грамматика: Молкият бо «عند»', 'Грамматика: Пасвандҳои соҳибӣ', 'Грамматика: Ҷамъи исмҳо',
  'Оила ва хешовандон', 'Муколама ва Амалия', 'Шунавоӣ: Оилаи дӯстам',
  'Машқи навиштан', 'Такрор', 'Имтиҳони ниҳоӣ'];
const missing = need.filter((t) => !byTitle[t]);
if (missing.length) { console.error('ЁФТ НАШУД:', missing); process.exit(1); }

console.log(DRY ? '── DRY RUN ──' : '── B5 + B6: сохти нав ──');

// ═══ 1. Дарси нави рақамҳо ═════════════════════════════════════════════
console.log('\n1 · дарси нави «Рақамҳо»');
let numId = rows.find((r) => r.t === 'Рақамҳо: 1, 2, 3')?.id;
if (numId) console.log('  = аллакай ҳаст');
else if (DRY) console.log('  [dry] сохта мешавад');
else {
  const [r] = await sql.query(
    `INSERT INTO "Lesson" (id,"moduleId",title,"titleTranslated",type,"skillType",emoji,"xpReward",duration,"order")
     VALUES (gen_random_uuid()::text,$1,$2,$3,'vocab','vocab','🔢',15,5,900) RETURNING id`,
    [mod.id, 'الأرقام: ١، ٢، ٣', 'Рақамҳо: 1, 2, 3']);
  numId = r.id;
  console.log(`  ✓ сохта шуд (${numId})`);
}

// ═══ 2. Кӯчонидани кортҳо ══════════════════════════════════════════════
console.log('\n2 · кӯчонидани кортҳо');
const move = async (word, toId, label) => {
  if (DRY) { console.log(`  [dry] ${label}`); return; }
  const r = await sql.query(
    `UPDATE "Word" SET "lessonId"=$1 WHERE word=$2
      AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "moduleId"=$3) RETURNING 1 AS x`,
    [toId, word, mod.id]);
  console.log(`  ${r.length ? '✓' : '·'} ${label}${r.length ? '' : '  ЁФТ НАШУД'}`);
};
await move('العَمّ', byTitle['Хешовандон (2)'], 'العَمّ (Амак) → «Хешовандон (2)», ҷуфти العَمَّة');
for (const w of ['وَاحِد', 'اِثْنَان', 'ثَلَاثَة']) await move(w, numId, `${w} → «Рақамҳо»`);

// ═══ 3. Унвони Д2 ва эмоҷии грамматика ═════════════════════════════════
console.log('\n3 · унвон ва эмоҷӣ');
const upd = async (label, text, params) => {
  if (DRY) { console.log(`  [dry] ${label}`); return; }
  const r = await sql.query(text + ' RETURNING 1 AS x', params);
  console.log(`  ${r.length ? '✓' : '·'} ${label}${r.length ? '' : '  ЁФТ НАШУД'}`);
};
// Рақамҳо баромаданд — унвон боз танҳо «Хешовандон» мешавад.
await upd('Д2 → «Хешовандон» (رақамҳо баромаданд)',
  `UPDATE "Lesson" SET title='الأقارب', "titleTranslated"='Хешовандон' WHERE id=$1`,
  [byTitle['Хешовандон ва рақамҳо']]);
// 🔢 ба дарси рақамҳо мегузарад; ҷамъи исмҳо 📚 мегирад (китобҳо — мисоли худаш).
await upd('«Ҷамъи исмҳо» 🔢 → 📚',
  `UPDATE "Lesson" SET emoji='📚' WHERE id=$1`, [byTitle['Грамматика: Ҷамъи исмҳо']]);
// `لَطِيفَة` дар дарси 4 истифода мешуд, вале دар дарси 8 таълим мешавад.
await upd('мисоли بِنْتُ الأَخ → «هَذِهِ بِنْتُ الأَخ.» (لطيف ҳанӯз таълим нашуда)',
  `UPDATE "Word" SET example=$2, "exampleTrans"=$3 WHERE word=$4
     AND "lessonId" IN (SELECT id FROM "Lesson" WHERE "moduleId"=$1)`,
  [mod.id, 'هَذِهِ بِنْتُ الأَخ.', 'Ин ҷиян (духтари бародар) аст.', 'بِنْتُ الأَخ']);

// ═══ 4. Тартиби нави дарсҳо ════════════════════════════════════════════
console.log('\n4 · тартиби дарсҳо');
const PLAN = [
  ['Оилаи ман', 'V'], ['Оилаи ман (2)', 'V'], ['Хешовандон ва рақамҳо', 'V'],
  ['Грамматика: Пасвандҳои соҳибӣ', 'G'],
  ['Хешовандон (2)', 'V'], [null, 'V'],                    // null = дарси нави рақамҳо
  ['Грамматика: Молкият бо «عند»', 'G'],
  ['Одамони атрофам', 'V'], ['Тавсифи одамон', 'V'],
  ['Грамматика: Ҷамъи исмҳо', 'G'],
  ['Синну сол ва оила', 'V'],
  ['Оила ва хешовандон', 'R'], ['Муколама ва Амалия', 'S'],
  ['Шунавоӣ: Оилаи дӯстам', 'L'], ['Машқи навиштан', 'W'],
  ['Такрор', 'Rv'], ['Имтиҳони ниҳоӣ', 'T'],
];
for (let i = 0; i < PLAN.length; i++) {
  const [t, kind] = PLAN[i];
  const id = t === null ? numId : byTitle[t];
  if (!DRY) await sql.query(`UPDATE "Lesson" SET "order"=$2 WHERE id=$1`, [id, i]);
  console.log(`  ${DRY ? '[dry] ' : '✓ '}${String(i).padStart(2)} ${kind.padEnd(2)} ${t ?? 'Рақамҳо: 1, 2, 3'}`);
}

// ═══ 5. Тартиби кортҳо дар ҳар дарс (ОХИРИН) ═══════════════════════════
console.log('\n5 · тартиби кортҳо');
const WORD_ORDER = {
  'Хешовандон ва рақамҳо': ['الأَخ', 'الأُخْت', 'الجَدّ', 'الجَدَّة'],
  'Хешовандон (2)': ['العَمّ', 'العَمَّة', 'اِبْنُ العَم', 'اِبْنُ الأَخ', 'بِنْتُ الأَخ'],
};
if (!DRY) {
  for (const [t, order] of Object.entries(WORD_ORDER))
    for (let i = 0; i < order.length; i++)
      await sql.query(`UPDATE "Word" SET "order"=$2 WHERE "lessonId"=$1 AND word=$3`,
        [byTitle[t], i + 1, order[i]]);
  for (let i = 0; i < 3; i++)
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE "lessonId"=$1 AND word=$3`,
      [numId, i + 1, ['وَاحِد', 'اِثْنَان', 'ثَلَاثَة'][i]]);
  // Ҳар дарси дигар ҳам 1..N шавад (D8).
  const all = await sql.query(`SELECT id FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
  for (const l of all) {
    const ws = await sql.query(`SELECT id FROM "Word" WHERE "lessonId"=$1 ORDER BY "order", id`, [l.id]);
    for (let i = 0; i < ws.length; i++)
      await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [ws[i].id, i + 1]);
  }
}
console.log(`  ${DRY ? '[dry] ' : '✓ '}Хешовандон 1..4 · Хешовандон (2) 1..5 · Рақамҳо Як, Ду, Се`);

console.log(`\n${DRY ? '[dry] ' : ''}тамом.`);
