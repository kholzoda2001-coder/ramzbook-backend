// ВАЗИФАИ 4 — пур кардани `Word.ipaTajik` барои курси русӣ (боги C2).
//
// ҲОЛАТ: русӣ 0 / 683 (англисӣ 100%, арабӣ 97%). Хонанда танҳо `/zdrɐˈstvujtʲɪ/`
// мебинад — хати бегона. Муҳаррик ба IPA бармегардад (`unit_lesson_screen.dart:4351`).
//
// ҲУДУД: тибқи дархост танҳо МОДУЛҲОИ 0 ва 1 (санҷиши мантиқ).
// Барои тамоми курс: --all
//
// Мантиқ дар `_ru-phonetics.mjs`, луғати зада дар `_ru-stress-lexicon.mjs`,
// санҷиш дар `_ru-phonetics-test.mjs` (24 санҷиш аз рӯи қоидаҳои АЛИФБО).
//
// ДУ ҚОИДАИ ЭҲТИЁТ:
//   1) зада дар русӣ луғатист, аз навишт ҳосил намешавад → калимаи
//      бисёрҳиҷогии НОМАЪЛУМ холӣ мемонад ва ҷудо рӯйхат мешавад (на тахмин);
//   2) агар талаффуз АЙНАН ба навишт баробар барояд, майдон холӣ мемонад —
//      «да» → «да» чизе намеомӯзонад ва танҳо шавшув мекунад.
//
//   node prisma/_ru-fix4-ipatajik.mjs            # намоиш (M0+M1)
//   node prisma/_ru-fix4-ipatajik.mjs --apply    # иҷро
//   node prisma/_ru-fix4-ipatajik.mjs --all      # тамоми курс
import { connect, COURSE_RU_A1, APPLY, banner, done } from './_ru-fix-lib.mjs';
import { respellPhrase } from './_ru-phonetics.mjs';
import { S, S_EXTRA } from './_ru-stress-lexicon.mjs';

const sql = connect();
const ALL = process.argv.includes('--all');
banner(`ВАЗИФАИ 4 · Word.ipaTajik — ${ALL ? 'ТАМОМИ курси русӣ' : 'Модулҳои 0 ва 1'}`);

const stressOf = (bare) => S[bare] ?? S_EXTRA[bare] ?? null;

const rows = ALL
  ? await sql`
      SELECT w.id, w.word, w."ipaTajik", m."order" mo, l."order" lo
      FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
      WHERE m."courseId"=${COURSE_RU_A1} ORDER BY m."order", l."order", w."order"`
  : await sql`
      SELECT w.id, w.word, w."ipaTajik", m."order" mo, l."order" lo
      FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
      WHERE m."courseId"=${COURSE_RU_A1} AND m."order" IN (0,1)
      ORDER BY m."order", l."order", w."order"`;

console.log(`  ${rows.length} сатри Word дида мешавад\n`);

let changed = 0, already = 0, identical = 0;
const unknownWords = new Map(); // калима → чанд бор
const preview = [];

for (const r of rows) {
  const res = respellPhrase(r.word, stressOf);

  if (res.unknown) {
    unknownWords.set(res.unknown, (unknownWords.get(res.unknown) ?? 0) + 1);
    continue;
  }
  if (res.identical) { identical++; continue; }
  if (!res.text) continue;
  if ((r.ipaTajik ?? '') === res.text) { already++; continue; } // идемпотент

  preview.push(`  ${r.word.padEnd(22)} → ${res.text}`);
  if (APPLY) {
    await sql`UPDATE "Word" SET "ipaTajik"=${res.text} WHERE id=${r.id}`;
  }
  changed++;
}

console.log('  ─── Талаффузи сохташуда ───');
// Ҳар калима як бор нишон дода мешавад (M0 L12 ҳамонҳоро такрор мекунад).
for (const line of [...new Set(preview)]) console.log(line);

console.log(`\n  ─── Ҷамъбаст ───`);
console.log(`    навишта мешавад:                 ${changed}`);
console.log(`    аллакай дуруст (идемпотент):     ${already}`);
console.log(`    қасдан холӣ (талаффуз = навишт): ${identical}`);
console.log(`    зада НОМАЪЛУМ → холӣ монд:       ${[...unknownWords.values()].reduce((a, b) => a + b, 0)}`);

if (unknownWords.size) {
  console.log(`\n  ⚠️  ${unknownWords.size} калима зада надорад — ҚАСДАН холӣ монд (тахмин намекунем).`);
  console.log('     Барои пур кардан: ба _ru-stress-lexicon.mjs илова кунед ва аз нав иҷро кунед.');
  console.log('     ' + [...unknownWords.keys()].sort().join(', '));
}

// ── Тасдиқ ────────────────────────────────────────────────────────────────
const cov = await sql`
  SELECT count(*)::int total, count(w."ipaTajik")::int filled
  FROM "Word" w JOIN "Lesson" l ON l.id=w."lessonId" JOIN "Module" m ON m.id=l."moduleId"
  WHERE m."courseId"=${COURSE_RU_A1}`;
console.log(`\n  Фарогирии ipaTajik дар ТАМОМИ курси русӣ: ${cov[0].filled} / ${cov[0].total}`);

done(changed);
