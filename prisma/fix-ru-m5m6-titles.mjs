// ЯКСОНСОЗИИ УНВОНҲО — Модулҳои 5 ва 6-и курси русӣ.
// Манбаъ: боқимондаи `Russian_A1_M5_M6_Audit.md` (5 номувофиқатии корт ↔ экран).
//
// МУАММО: `Lesson.titleTranslated` (корти роҳнамо) ва `GrammarTopic.titleTranslated`
// (сарлавҳаи экрани грамматика) ду сутуни ҶУДОянд. Вақте фарқ мекунанд, хонанда
// як дарсро бо ду ном мебинад — триггери Sabina.
//
// ШАКЛИ КАНОНӢ аз рӯи ХУДИ база интихоб шуд, на аз рӯи завқ:
//   • «содда» ↔ «оддӣ» — дар `GrammarTopic` «содда» 3 бор, «оддӣ» 0 бор.
//     Ҳамчунин `frontend/lib/utils/grammar_notes.dart` «Замони ҳозираи содда»
//     мегӯяд. → КАНОНӢ: «содда».
//   • Префикс — «Грамматика:» 19 бор, «Грамматика —» 1 бор (ҳамин M5 #8).
//     → КАНОНӢ: «Грамматика:» бо дунуқта.
//   • Глоси тоҷикӣ дар қавс нигоҳ дошта мешавад («каме / якчанд»), чунки барои
//     хонандаи тоҷик маҳз ҳамон қисм маъно медиҳад — намунаи «У меня есть
//     (доштан)» дар M3.
//
// Ҳар ду сутун ба ЯК арзиш оварда мешаванд, пас баъд аз ин фарқ сифр мешавад.
//
//   node prisma/fix-ru-m5m6-titles.mjs            # намоиш
//   node prisma/fix-ru-m5m6-titles.mjs --apply    # иҷро
import { connect, APPLY, banner, done } from './_ru-fix-lib.mjs';

const sql = connect();
banner('Модулҳои 5–6-и русӣ — яксонсозии унвонҳо');

/** [лейбл, lessonId, topicId, унвони КАНОНӢ] */
const PAIRS = [
  ['M5 #6 · I спряжение',
    'cmsc5rlri001zerdbzu9ecqdl', 'cmsc5r5xn000f8drj92kd1sc0',
    'Грамматика: замони ҳозираи содда 1'],
  ['M5 #7 · II спряжение',
    'cmsc5rlxu0021erdbzc921ngn', 'cmsc5r9mv001d8drjlwebd4n2',
    'Грамматика: замони ҳозираи содда 2'],
  ['M5 #8 · Наречия частотности',
    'cmsp5vncl0017130gp4qr1r0o', 'cmsp5vjkg0007130gdb5jvwj0',
    'Грамматика: зарфҳои басомад'],
  ['M6 #9 · Немного / несколько',
    'cmscdf819002giy3lm1iskmdm', 'cmscdeya50006iy3lo2rdx1rm',
    'Грамматика: немного / несколько (каме / якчанд)'],
  ['M6 #10 · Винительный падеж',
    'cmsswh52e002z3z7u1c1g0u1l', 'cmsswh1yk00213z7uep104oo7',
    'Грамматика: падежи винительнӣ (что?)'],
];

let changed = 0, already = 0;
const missing = [];

for (const [label, lid, gid, want] of PAIRS) {
  console.log(`  ─ ${label}`);
  for (const [table, id] of [['Lesson', lid], ['GrammarTopic', gid]]) {
    const r = await sql`
      SELECT "titleTranslated" t FROM ${sql.unsafe(`"${table}"`)} WHERE id=${id}`;
    if (!r.length) { missing.push(`${table} ${id}`); console.log(`      ❌ ${table} — сатр нест`); continue; }
    if (r[0].t === want) { already++; console.log(`      ✓ ${table.padEnd(13)} аллакай «${want}»`); continue; }
    console.log(`      → ${table.padEnd(13)} «${r[0].t}»`);
    console.log(`        ${' '.repeat(13)} → «${want}»`);
    if (APPLY) {
      await sql`UPDATE ${sql.unsafe(`"${table}"`)}
                SET "titleTranslated"=${want} WHERE id=${id}`;
    }
    changed++;
  }
}

// ── Тасдиқи мустақил: драйвери HTTP `rowCount` намедиҳад, пас ҳисоб аз SELECT.
console.log('\n  ─── Тасдиқи мустақил ───\n');
const M5 = 'cmqan1dwx00e5s2t1f345mm6i', M6 = 'cmqan1hbm00f5s2t11fvlnrp8';
const rows = await sql`
  SELECT l."moduleId" mid, l."order" lo, l."titleTranslated" lt, g."titleTranslated" gt
  FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
  WHERE l."moduleId" IN (${M5},${M6}) ORDER BY l."moduleId", l."order"`;
let bad = 0;
for (const r of rows) {
  const same = r.lt === r.gt;
  if (!same) bad++;
  console.log(`  ${same ? '✅' : '🔴'} [${r.mid === M5 ? 'M5' : 'M6'} #${r.lo}] «${r.lt}»${same ? '' : `  ↔  «${r.gt}»`}`);
}
console.log(`\n  Номувофиқатӣ: ${bad}/${rows.length}`);

// Дар тамоми курс чӣ қадар мондааст? (танҳо гузориш, ин скрипт даст намерасонад)
const all = await sql`
  SELECT count(*)::int c FROM "GrammarTopic" g JOIN "Lesson" l ON l."grammarTopicId"=g.id
  JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"='cmq95o7ic0001qsy5l76202bw' AND g."titleTranslated" <> l."titleTranslated"`;
console.log(`  Дар ТАМОМИ курси русӣ ҳанӯз номувофиқ: ${all[0].c} (берун аз ҳудуди ин скрипт)`);

if (missing.length) console.log(`\n  ❌ ${missing.length} сатр ёфт нашуд.`);
done(changed, already ? `${already} сутун аллакай дуруст буд (идемпотентӣ).` : '');
