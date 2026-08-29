// ─────────────────────────────────────────────────────────────────────────────
// 05 — Тавзеҳ барои саволҳои фаҳмиш (`ComprehensionQuestion.explanation`)
//
// ЧАРО. 100 савол аз 219-то баъди ҷавоб ҳеҷ чиз шарҳ намедиҳанд. Дар
// имтиҳонҳои ниҳоии M4–M10 аз 8 савол 6–7-тоаш бе тавзеҳанд: хонанда хато
// мекунад, як дил медиҳад ва ЧАРО-ро намедонад. Ҳамаи дарсҳои «Такрор»-и
// M1–M10 низ 0 тавзеҳ доранд — маҳз дарсе, ки бояд холигиро пур кунад.
//
// УСУЛ. Тавзеҳ аз мазмуни ВОҚЕӢ бароварда мешавад, на аз ҳаво:
//
//   • савол ба матн такя мекунад → ҷумлаи матн, ки ҷавобро дар бар мегирад:
//       «Матн: He goes to the clinic.»
//     (маҳз ҳамон услубе, ки M11 ва M12 аллакай доранд)
//   • савол луғавист («Чӣ тавр мегӯед…», «… чӣ маъно дорад?») → баробарӣ:
//       «Ташаккур = Thank you.»
//   • савол грамматикист (холигӣ) → ҷавоб + қоида аз худи савол.
//
// ⚠️ ИН МАТНИ ХУДКОР АСТ. Ҳар сатр ба забони тоҷикӣ хонда мешавад ва пеш аз
//    `--apply` бояд аз назари як соҳибзабон гузарад. Барои ҳамин скрипт
//    ҳамаро ба `out/05-explanations.json` менависад — он ҷо тағйир диҳед ва
//    бо `--from-json` дубора иҷро кунед.
//
// Иҷро:  node 05-question-explanations.mjs                 (dry-run + JSON)
//        node 05-question-explanations.mjs --from-json     (JSON-и таҳриршуда)
//        node 05-question-explanations.mjs --from-json --apply
// ─────────────────────────────────────────────────────────────────────────────
import fs from 'fs';
import { connect, loadCourse, loc, Changes } from './_lib.mjs';

const JSON_PATH = new URL('./out/05-explanations.json', import.meta.url).pathname.replace(/^\//, '');
const FROM_JSON = process.argv.includes('--from-json');

/** Ҷумлаи матн, ки ҷавобро дар бар мегирад. */
function sentenceWith(passage, answer) {
  if (!passage || !answer) return null;
  const needle = String(answer)
    .toLowerCase()
    .replace(/^(a|an|the|to)\s+/i, '')
    .replace(/[.!?,]/g, '')
    .trim();
  if (needle.length < 2) return null;
  const sentences = passage.split(/(?<=[.!?])\s+/);
  // Ҷумлаи КӮТОҲТАРИНе, ки ҳамаи калимаҳои ҷавобро дорад — вагарна тавзеҳ
  // тамоми параграфро нақл мекунад.
  const parts = needle.split(/\s+/).filter((w) => w.length > 1);
  let best = null;
  for (const s of sentences) {
    const low = s.toLowerCase();
    if (!parts.every((w) => low.includes(w))) continue;
    if (!best || s.length < best.length) best = s;
  }
  return best?.trim() ?? null;
}

/** Навъи савол аз матни он. */
function kindOf(q) {
  const t = `${q.question} ${q.questionTranslated ?? ''}`.toLowerCase();
  if (/\b(complete|fill)\b|холигӣ|пур кунед|пур кун/.test(t)) return 'grammar';
  // «What is 'Ошхона' in English?» ва «How do you ask '…'?» низ луғавианд —
  // онҳо ба матн такя намекунанд, пас ҷустуҷӯи ҷумла дар матн бефоида аст.
  if (/how do you (say|ask)|what is\s*['«].+['»]\s*in english|what does .* mean|translate|тарҷума|чӣ маъно|ба англисӣ|кадом калима|чӣ тавр мепурсед/.test(t)) return 'lexical';
  return 'passage';
}

const sql = connect();
const modules = await loadCourse(sql);
const ch = new Changes('05 — Тавзеҳ барои саволҳои фаҳмиш');

let proposals = [];
if (FROM_JSON) {
  if (!fs.existsSync(JSON_PATH)) {
    console.error(`  ✗ ${JSON_PATH} ёфт нашуд. Аввал скриптро бе --from-json иҷро кунед.`);
    process.exit(1);
  }
  proposals = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8'));
  console.log(`  Аз JSON хонда шуд: ${proposals.length} тавзеҳ`);
} else {
  for (const mod of modules) {
    for (const L of mod.lessons) {
      const c = L.comprehension;
      if (!c) continue;
      for (const q of c.questions) {
        if ((q.explanation ?? '').trim()) continue;   // аллакай ҳаст — даст намерасем
        const opts = Array.isArray(q.options) ? q.options : [];
        const answer = opts[q.correctIndex];
        if (answer == null) continue;

        const kind = kindOf(q);
        let text = null;

        if (kind === 'passage') {
          const s = sentenceWith(c.passage, answer);
          if (s) text = `Матн: ${s}`;
        }
        if (!text && kind === 'lexical') {
          // «How do you say 'Зодрӯз' in English?» → «Зодрӯз = Birthday.»
          const tj = (q.question.match(/'([^']+)'/) ?? q.question.match(/«([^»]+)»/))?.[1];
          // Нуқтаи дубора: «… = Where are you from?.» — агар ҷавоб аллакай
          // аломати китобатӣ дошта бошад, аломати нав илова намешавад.
          const dot = /[.!?]$/.test(String(answer)) ? '' : '.';
          text = tj ? `${tj} = ${answer}${dot}` : `Ҷавоби дуруст: ${answer}${dot}`;
        }
        if (!text && kind === 'grammar') {
          text = `Ҷавоби дуруст: ${answer}. Ҷумлаи пурра: ` +
                 `${q.question.replace(/^.*?:\s*/, '').replace('___', answer)}`;
        }
        // Захира: ҷумлаи матн наёфт шуд → танҳо ҷавоб.
        text ??= `Ҷавоби дуруст: ${answer}.`;

        proposals.push({
          id: q.id,
          where: `${loc(mod, L)}`,
          kind,
          question: q.question,
          questionTranslated: q.questionTranslated ?? '',
          answer: String(answer),
          explanation: text,
        });
      }
    }
  }
  fs.writeFileSync(JSON_PATH, JSON.stringify(proposals, null, 2), 'utf8');
  console.log(`  Пешниҳодҳо навишта шуданд: ${JSON_PATH}`);
}

const byId = new Map();
for (const mod of modules) for (const L of mod.lessons)
  for (const q of L.comprehension?.questions ?? []) byId.set(q.id, { q, where: loc(mod, L) });

for (const p of proposals) {
  const hit = byId.get(p.id);
  if (!hit) { console.log(`  ⚠️  id ${p.id} дигар вуҷуд надорад`); continue; }
  ch.add({
    table: 'ComprehensionQuestion', id: p.id, field: 'explanation',
    from: hit.q.explanation ?? '(холӣ)', to: p.explanation,
    where: `${hit.where} · [${p.kind}] «${p.question}»`,
  });
}

ch.print();

const byKind = {};
for (const p of proposals) byKind[p.kind] = (byKind[p.kind] ?? 0) + 1;
console.log(`\n  Аз рӯи навъ: ${JSON.stringify(byKind)}`);
const weak = proposals.filter((p) => p.explanation.startsWith('Ҷавоби дуруст:'));
if (weak.length) {
  console.log(`\n  ⚠️  ${weak.length} тавзеҳ танҳо ҷавобро такрор мекунад (ҷумлаи матн ёфт нашуд).`);
  console.log('     Инҳо аз ҳама бештар таҳрири дастиро мехоҳанд:');
  for (const w of weak.slice(0, 15)) console.log(`       • ${w.where} «${w.question}»`);
  if (weak.length > 15) console.log(`       … ва боз ${weak.length - 15}`);
}
console.log('\n  ⚠️  Матни худкор аст — пеш аз --apply аз назари соҳибзабон гузаронед.');

ch.writeSql(new URL('./out/05-explanations.sql', import.meta.url).pathname.replace(/^\//, ''));
await ch.apply(sql);
