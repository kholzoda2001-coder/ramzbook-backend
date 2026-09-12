// B8 · Ҳар саволи модул ШАРҲ мегирад + B9 · саволи ҷавобаш ройгон.
//
// `comprehension_screen.dart:546` шарҳро БАЪДИ ҷавоб нишон медиҳад, вале
// ҳар 19 саволи ин модул `explanation = NULL` дошт. Olim («ман қоида
// намехонам, танҳо аз хато меомӯзам») хато мекард ва чаро будани онро
// намедонист — яъне ягона роҳи омӯзиши ӯ баста буд.
//
// Ҳар шарҳ маҳз он ҷумлаи матнро меорад, ки ҷавобро исбот мекунад — на
// «дуруст» гуфтани холӣ.
//
// B9: Д15 саволи 5 матнаш `الأُخْت` буд ва ҲАМОН калима дар байни вариантҳо —
// хонанда бе донистан ҳам мезад. Акнун мисли Д14 арабӣ→тоҷикӣ мешавад.
//
//   node prisma/_ar-m3-fix4.mjs --dry
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
const ls = await sql.query(`SELECT "comprehensionId" k FROM "Lesson" WHERE "moduleId"=$1 AND "comprehensionId" IS NOT NULL`, [mod.id]);
const kids = ls.map((x) => x.k);

// [унвони машқ, тартиби савол, шарҳ]
const EXPL = [
  ['Оила ва хешовандон', 1, 'Дар матн навишта шудааст: «أَبِي طَوِيلٌ وَقَوِيّ» — падарам қадбаланд ва қувватманд аст.'],
  ['Оила ва хешовандон', 2, 'Матн мегӯяд: «عِنْدِي أَخٌ وَاحِد» — як бародар. وَاحِد = як.'],
  ['Оила ва хешовандон', 3, '«أَخِي عُمْرُهُ عَشَرَةُ سَنَوَاتٍ» — عَشَرَة = даҳ.'],

  ['Шунавоӣ: Оилаи дӯстам', 1, 'Дар аввали матн: «هَذِهِ صَدِيقَتِي سَارَة» — дӯсти ӯ Сара ном дорад.'],
  ['Шунавоӣ: Оилаи дӯстам', 2, '«عِنْدَهَا أُمٌّ مُعَلِّمَةٌ» — модараш муаллима. Падараш бошад طَبِيب (духтур) аст.'],
  ['Шунавоӣ: Оилаи дӯстам', 3, '«عِنْدَهَا أَخٌ وَاحِد» — як бародар.'],
  ['Шунавоӣ: Оилаи дӯстам', 4, '«أَخُوهَا طَوِيلٌ وَقَوِيّ» — бародараш қадбаланд ва қувватманд.'],

  ['Такрори модул: Оила', 1, 'الجَدّ = Бобо. Падар الأَب ва амак العَمّ аст.'],
  ['Такрори модул: Оила', 2, 'قَصِير = Қадпаст. Муқобили он طَوِيل (қадбаланд) аст.'],
  ['Такрори модул: Оила', 3, '«عِنْدِي أَخَوَانِ اِثْنَان» — أَخَوَانِ шакли ҷуфт аст, яъне ду бародар.'],
  ['Такрори модул: Оила', 4, '«جَدِّي مُسِنّ وَلَطِيفٌ» — бобо солхӯрда ва меҳрубон аст.'],

  ['Имтиҳони ниҳоӣ', 1, '«عِنْدِي أُسْرَةٌ كَبِيرَةٌ» — оилаи калон.'],
  ['Имтиҳони ниҳоӣ', 2, '«أَبِي مُعَلِّمٌ» — падар муаллим аст.'],
  ['Имтиҳони ниҳоӣ', 3, '«أُمِّي طَبِيبَةٌ» — модар духтур аст. Диққат: مُعَلِّمَة муаллима мебуд.'],
  ['Имтиҳони ниҳоӣ', 4, '«عِنْدِي أَخَوَانِ اِثْنَان» — ду бародар.'],
  ['Имтиҳони ниҳоӣ', 5, 'الأُخْت = Хоҳар. الأُمّ модар ва الأَخ бародар аст.'],
  ['Имтиҳони ниҳоӣ', 6, '«جَدِّي مُسِنّ وَلَطِيفٌ» — бобо солхӯрда ва меҳрубон.'],
  ['Имтиҳони ниҳоӣ', 7, 'عِنْدِي = «ман дорам». عِنْدَهَا «ӯ (зан) дорад», عِنْدَهُمْ «онҳо доранд».'],
  ['Имтиҳони ниҳоӣ', 8, 'تَوْأَم = Дугоникҳо — ду кӯдаки якбора таваллудшуда.'],
];

console.log(DRY ? '── DRY RUN ──' : '── B8: шарҳи саволҳо ──');
let n = 0;
for (const [title, order, ex] of EXPL) {
  if (DRY) { console.log(`  [dry] ${title} #${order}`); n++; continue; }
  const r = await sql.query(
    `UPDATE "ComprehensionQuestion" q SET explanation=$3
       FROM "ComprehensionExercise" e
      WHERE q."exerciseId"=e.id AND e.id=ANY($1)
        AND e."titleTranslated"=$2 AND q."order"=$4 RETURNING 1 AS x`,
    [kids, title, ex, order]);
  console.log(`  ${r.length ? '✓' : '·'} ${title} #${order}${r.length ? '' : '  ЁФТ НАШУД'}`);
  n += r.length;
}

// ═══ B9 · саволе ки ҷавобашро худаш нишон медод ════════════════════════
console.log(`\n${DRY ? '[dry] ' : ''}── B9: Д15 савол 5 ──`);
if (!DRY) {
  const r = await sql.query(
    `UPDATE "ComprehensionQuestion" q
        SET options=$3::jsonb, "correctIndex"=1, "questionTranslated"=$4
       FROM "ComprehensionExercise" e
      WHERE q."exerciseId"=e.id AND e.id=ANY($1)
        AND e."titleTranslated"='Имтиҳони ниҳоӣ' AND q."order"=5
        AND q.question=$2 RETURNING 1 AS x`,
    [kids, 'الأُخْت', JSON.stringify(['Модар', 'Хоҳар', 'Бародар']),
     '«الأُخْت» чӣ маъно дорад?']);
  console.log(`  ${r.length ? '✓' : '·'} вариантҳо арабӣ → тоҷикӣ: [Модар | Хоҳар | Бародар]`);
  n += r.length;
} else { console.log('  [dry] вариантҳо арабӣ → тоҷикӣ'); n++; }

console.log(`\n${DRY ? '[dry] ' : ''}${n} амал.`);
