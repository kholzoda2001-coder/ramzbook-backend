// Пасди дуюм — номувофиқиҳое, ки танҳо ҳангоми ХОНДАН дида мешаванд.
//
// Аудити мошинӣ D1–D12 сабз буд, вале ҳангоми хондани мазмуни тайёр чор
// чизи дигар баромад:
//   1. Калима бо ҳаракати пурра, вале дар МИСОЛИ ХУДАШ бе ҳаракат
//      (اِسْمِي ↔ اسْمِي, صَبَاحُ الخَيْر ↔ صَبَاح الخَيْر, أَنْتَ ↔ أنتَ).
//      Хонанда ду шакли як калимаро дар ЯК корт мебинад.
//   2. `مَن` бе сукун, дар ҳоле ки мисолаш `مَنْ` дорад.
//   3. Мисоли `أَيْضاً` калимаи `تَشَرَّفْنَا`-ро истифода мебарад, вале
//      `تَشَرَّفْنَا` БАЪД аз он меояд — тартиб баръакс.
//   4. Ду корти Д0 айнан як тарҷумаи мисол доранд.
//
// ⚠️ Ҳама тағйир танҳо ҲАРАКАТ аст (талаффуз ҳамон) ё матни ТОҶИКӢ —
// пас ягон аудио аз матн ҷудо намешавад.
//
//   node prisma/_ar-m1-fix2.mjs --dry
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
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await sql.query(`SELECT id FROM "Module" WHERE "courseId"=$1 ORDER BY "order" LIMIT 1`, [course.id]);
const lessons = await sql.query(`SELECT id, "order" FROM "Lesson" WHERE "moduleId"=$1`, [mod.id]);
const lids = lessons.map((l) => l.id);
let n = 0;

// ── 1. Мисолҳо: ҳаракати пурра, ҳамон шакли калима ─────────────────────
const EX = [
  ['أنتَ صَدِيقِي.', 'أَنْتَ صَدِيقِي.'],
  ['اسْمِي أَحْمَد.', 'اِسْمِي أَحْمَد.'],
  ['اسْمِي رُسْتَم. وَأَنْتَ؟', 'اِسْمِي رُسْتَم. وَأَنْتَ؟'],
  ['السَّلَام عَلَيْكُم يَا صَدِيقِي!', 'السَّلَامُ عَلَيْكُم يَا صَدِيقِي!'],
  ['صَبَاح الخَيْر يَا أُسْتَاذ!', 'صَبَاحُ الخَيْر يَا أُسْتَاذ!'],
  ['مَسَاء الخَيْر يَا صَدِيقِي!', 'مَسَاءُ الخَيْر يَا صَدِيقِي!'],
  ['تُصْبِح عَلَى خَيْر وَأَحْلَام سَعِيدَة!', 'تُصْبِحُ عَلَى خَيْر وَأَحْلَام سَعِيدَة!'],
  ['الوَلَد سَعِيدٌ.', 'الوَلَدُ سَعِيدٌ.'],
  ['البِنْت طَوِيلَةٌ.', 'البِنْتُ طَوِيلَةٌ.'],
  ['تَعَال مِن فَضْلِكَ.', 'تَعَالَ مِنْ فَضْلِكَ.'],
  ['مَا اسْمُكَ مِن فَضْلِكَ؟', 'مَا اسْمُكَ مِنْ فَضْلِكَ؟'],
];
console.log('1 · ҳаракати мисолҳо');
for (const [from, to] of EX) {
  if (DRY) { console.log(`  [dry] ${from} → ${to}`); n++; continue; }
  const r = await sql.query(
    `UPDATE "Word" SET example=$2 WHERE "lessonId"=ANY($1) AND example=$3 RETURNING id`,
    [lids, to, from]);
  console.log(`  ${r.length ? '✓' : '·'} ${from} → ${to}${r.length ? '' : '  (ёфт нашуд)'}`);
  n += r.length;
}

// ── 2. `مَن` → `مَنْ` (шакли худи калима) ───────────────────────────────
console.log('\n2 · сукуни «Кӣ»');
if (DRY) { console.log('  [dry] مَن → مَنْ'); n++; }
else {
  const r = await sql.query(
    `UPDATE "Word" SET word='مَنْ' WHERE "lessonId"=ANY($1) AND word='مَن' RETURNING id`, [lids]);
  console.log(`  ${r.length ? '✓' : '·'} مَن → مَنْ`);
  n += r.length;
}

// ── 3. تَشَرَّفْنَا бояд ПЕШ аз أَيْضاً бошад ───────────────────────────
console.log('\n3 · тартиб: калима пеш аз мисоле ки ба он такя мекунад');
if (DRY) console.log('  [dry] تَشَرَّفْنَا ↔ أَيْضاً');
else {
  const [a] = await sql.query(`SELECT id,"order" o FROM "Word" WHERE "lessonId"=ANY($1) AND word='أَيْضاً'`, [lids]);
  const [t] = await sql.query(`SELECT id,"order" o FROM "Word" WHERE "lessonId"=ANY($1) AND word='تَشَرَّفْنَا'`, [lids]);
  if (a && t && a.o < t.o) {
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [t.id, a.o]);
    await sql.query(`UPDATE "Word" SET "order"=$2 WHERE id=$1`, [a.id, t.o]);
    console.log(`  ✓ تَشَرَّفْنَا ${t.o}→${a.o} · أَيْضاً ${a.o}→${t.o}`);
    n += 2;
  } else console.log('  · тартиб аллакай дуруст');
}

// ── 4. Ду мисол — як тарҷума ───────────────────────────────────────────
console.log('\n4 · тарҷумаи такрории мисол');
if (DRY) console.log('  [dry] أَهْلاً: тарҷумаи нав');
else {
  const r = await sql.query(
    `UPDATE "Word" SET example='أَهْلاً يَا صَدِيقِي!', "exampleTrans"='Салом, дӯстам!'
      WHERE "lessonId"=ANY($1) AND word='أَهْلاً' RETURNING id`, [lids]);
  console.log(`  ${r.length ? '✓' : '·'} أَهْلاً → «Салом, дӯстам!»`);
  n += r.length;
}

console.log(`\n${DRY ? '[dry] ' : ''}${n} тағйир.`);
