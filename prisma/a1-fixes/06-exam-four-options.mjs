// ─────────────────────────────────────────────────────────────────────────────
// 06 — Ягонагии имтиҳонҳо: ҳамаи саволҳо 4 вариант
//
// ҲОЛАТИ ҲОЗИРА (аз базаи воқеӣ):
//   • 181 саволи фаҳмиш 3 вариант дорад, 38-тоаш 4 вариант
//   • дохили ЯК имтиҳон ҳам иваз мешавад — M4·Д17: 3/3/3/3/3/3/4/4
//     (эҳтимоли тахмин дар миёнаи имтиҳон аз 33% ба 25% мегузарад)
//   • M11·Д16 ягона имтиҳонест, ки ҳамаи 8 саволаш 4 вариант дорад
//   • M12·Д19 — 15 савол, 4 вариант
//
// ҚАРОР (аз ду роҳи пешниҳодшуда роҳи ДУЮМ интихоб шуд):
//   ҳамаи ИМТИҲОНҲО ба 4 вариант оварда мешаванд, шумораи саволҳо (8) ва
//   остона даст намехӯранд.
//
//   Чаро на «M12-ро ба 8 савол хурд кунем»: он 7 саволро НЕСТ мекунад, дар
//   ҳоле ки илова кардани як варианти нодуруст ҳеҷ мазмунро намебарад.
//   Ва остонаи 80%-и M12 акнун бо `allowedWrongFor(15) = 3` ҳал шудааст —
//   `StepScore` дар `lesson_stage.dart` (се хато барои 15 савол).
//
// ⚠️ ИН СКРИПТ ХУДКОР ТАТБИҚ НАМЕКУНАД.
//    Варианти нодурусти НАВ мазмуни таълимист: он бояд боварибахш бошад,
//    вале НАДУРУСТ, ва набояд ҷавоби дурусти дигарро такрор кунад. Скрипт
//    номзадҳоро аз луғати ҲАМОН модул пешниҳод мекунад ва ба JSON менависад;
//    қарори ниҳоӣ аз они методист аст.
//
// Иҷро:  node 06-exam-four-options.mjs                (гузориш + номзадҳо)
//        node 06-exam-four-options.mjs --from-json --apply
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs';
import { connect, loadCourse, loc, APPLY } from './_lib.mjs';

const JSON_PATH = new URL('./out/06-exam-options.json', import.meta.url).pathname.replace(/^\//, '');
const FROM_JSON = process.argv.includes('--from-json');

const sql = connect();
const modules = await loadCourse(sql);

// ── Гузориши ҳолати ҷорӣ ───────────────────────────────────────────────────
console.log('\n══ Ҳолати ҷории имтиҳонҳо ══');
const exams = [];
for (const mod of modules) {
  for (const L of mod.lessons) {
    if (L.skillType !== 'test' || !L.comprehension) continue;
    const qs = L.comprehension.questions;
    const shape = qs.map((q) => (q.options ?? []).length).join('/');
    exams.push({ mod, L, qs });
    console.log(
      `  ${loc(mod, L).padEnd(46)} ${String(qs.length).padStart(2)} савол · ` +
      `вариантҳо ${shape}` + (new Set(shape.split('/')).size > 1 ? '  ← номунтазам' : '')
    );
  }
}

// ── Номзадҳо барои варианти чорум ──────────────────────────────────────────
/** Луғати ҳамон модул — манбаи табиии дистрактор. */
function poolFor(mod) {
  const en = new Set(), tg = new Set();
  for (const L of mod.lessons) for (const w of L.words) {
    en.add(w.word.trim());
    tg.add(w.translation.trim());
  }
  return { en: [...en], tg: [...tg] };
}

/** Вариантҳо тоҷикӣ ҳастанд ё англисӣ? Дистрактор бояд ҳамон хат бошад. */
const isCyr = (s) => /[Ѐ-ӿ]/.test(String(s));

let proposals = [];
if (FROM_JSON) {
  proposals = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`\n  Аз JSON: ${proposals.length} савол`);
} else {
  for (const { mod, L, qs } of exams) {
    const pool = poolFor(mod);
    for (const q of qs) {
      const opts = (q.options ?? []).map(String);
      if (opts.length >= 4) continue;
      const cyr = isCyr(opts[0]);
      const source = cyr ? pool.tg : pool.en;
      const taken = new Set(opts.map((o) => o.toLowerCase()));
      // Номзадҳо: аз ҳамон модул, ҳамон хат, дарозии наздик ба вариантҳои
      // мавҷуда (то дистрактор бо чашм фарқ накунад).
      const avgLen = opts.reduce((a, o) => a + o.length, 0) / opts.length;
      const cands = source
        .filter((s) => !taken.has(s.toLowerCase()) && isCyr(s) === cyr)
        .sort((a, b) => Math.abs(a.length - avgLen) - Math.abs(b.length - avgLen))
        .slice(0, 5);
      proposals.push({
        id: q.id,
        where: loc(mod, L),
        question: q.question,
        correct: opts[q.correctIndex],
        options: opts,
        candidates: cands,
        chosen: cands[0] ?? null,   // ← ин сатрро дастӣ тағйир диҳед
      });
    }
  }
  fs.writeFileSync(JSON_PATH, JSON.stringify(proposals, null, 2), 'utf8');
  console.log(`\n  Номзадҳо навишта шуданд: ${JSON_PATH}`);
}

console.log(`\n══ ${proposals.length} савол варианти чорумро мехоҳад ══`);
for (const p of proposals.slice(0, 20)) {
  console.log(`\n  ${p.where}`);
  console.log(`    Q: ${p.question}`);
  console.log(`    ҳозира: ${JSON.stringify(p.options)}  (дуруст: «${p.correct}»)`);
  console.log(`    номзадҳо: ${p.candidates.join(' · ') || '—'}`);
  console.log(`    интихоб:  ${p.chosen ?? '— (дастӣ пур кунед)'}`);
}
if (proposals.length > 20) console.log(`\n  … ва боз ${proposals.length - 20} савол дар JSON`);

const empty = proposals.filter((p) => !p.chosen);
if (empty.length) console.log(`\n  ⚠️  ${empty.length} савол номзад наёфт — дастӣ пур кунед.`);

if (!APPLY || !FROM_JSON) {
  console.log(`
  ⚠️  ҲЕҶ ЧИЗ НАВИШТА НАШУД.
     Варианти нодуруст мазмуни таълимист: он бояд боварибахш, вале НОДУРУСТ
     бошад. Тартиб:
       1. \`out/06-exam-options.json\`-ро кушоед
       2. майдони "chosen"-и ҳар саволро санҷед/тағйир диҳед
       3. node 06-exam-four-options.mjs --from-json --apply`);
  process.exit(0);
}

// ── Татбиқ ─────────────────────────────────────────────────────────────────
// ⚠️ `options` сутуни jsonb аст — драйвери HTTP массиви JS-ро ҳамчун массиви
//    Postgres мефиристад ва «invalid input syntax for type json» медиҳад.
//    Бинобар ин ҳатман `JSON.stringify(...)::jsonb`.
let n = 0;
for (const p of proposals) {
  if (!p.chosen) continue;
  const next = [...p.options, p.chosen];
  const correctIndex = next.findIndex((o) => o === p.correct);
  if (correctIndex < 0) { console.log(`  ✗ ${p.where}: ҷавоби дуруст гум шуд — гузашт`); continue; }
  await sql`
    UPDATE "ComprehensionQuestion"
       SET options = ${JSON.stringify(next)}::jsonb,
           "correctIndex" = ${correctIndex}
     WHERE id = ${p.id}`;
  n++;
}
console.log(`\n  ✓ ${n} савол ба 4 вариант оварда шуд`);
