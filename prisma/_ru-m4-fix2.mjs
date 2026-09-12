// МОДУЛИ 4-и РУСӢ — ислоҳи 2 (аз санҷиши такрории баъди `_ru-m4-fix.mjs` / `_ru-m4-media.mjs`).
//
//  1) Д9 «Время»: мисоли «Сколько сейчас времени?» БАРГАРДОНИДА мешавад. «Время — деньги» ба
//     «сохтани ҷумла» имкон медод, вале детектор нишон дод: ибораи «Сколько сейчас времени?» дар
//     Д12 (савол) ва Д14 (муколама) такрор меояд ва бе мисоли Д9 дар Д12 ношинос мемонад.
//     Ибораи зарурии ҳаётӣ аз зарбулмасал муҳимтар аст.
//  2) Д10: охири «в июле / в августе» (-е) ва «в пятницу» (-у) акнун дар худи қоида гуфта мешавад —
//     саволҳои Д12, Д13, Д15 вариантҳои «В июне / В августе / В марте»-ро доранд.
//
//   node prisma/_ru-m4-fix2.mjs           # dry-run
//   node prisma/_ru-m4-fix2.mjs --apply
import { connect, COURSE_RU_A1, APPLY, banner } from './_ru-fix-lib.mjs';

const sql = connect();
banner('RU · A1 · Модули 4 — ислоҳи 2');
const mods = await sql`SELECT id FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const lessons = await sql`SELECT id,"order","grammarTopicId" gid FROM "Lesson" WHERE "moduleId"=${mods[3].id} ORDER BY "order"`;
if (lessons.length !== 17) throw new Error(`Модули 4: ${lessons.length}`);
const L = Object.fromEntries(lessons.map((l) => [l.order, l]));
let changed = 0, already = 0;

async function setCols(table, id, want, label) {
  const cols = Object.keys(want);
  const sel = `SELECT ${cols.map((c) => `"${c}"`).join(',')} FROM "${table}" WHERE id=$1`;
  const [have] = await sql.query(sel, [id]);
  if (!have) throw new Error(`${table} ${id} нест`);
  if (cols.every((c) => have[c] === want[c])) { already++; return; }
  console.log(`  • ${label}`);
  for (const c of cols) if (have[c] !== want[c]) console.log(`      ${c}: ${JSON.stringify(have[c])}\n         → ${JSON.stringify(want[c])}`);
  changed++;
  if (!APPLY) return;
  await sql.query(`UPDATE "${table}" SET ${cols.map((c, i) => `"${c}"=$${i + 2}`).join(', ')} WHERE id=$1`, [id, ...cols.map((c) => want[c])]);
  const [a] = await sql.query(sel, [id]);
  if (!cols.every((c) => a[c] === want[c])) throw new Error(`ТАСДИҚ НАШУД: ${label}`);
}

// 1) Д9 «Время»
const w = await sql`SELECT id,example FROM "Word" WHERE "lessonId"=${L[8].id} AND word='Время'`;
if (w.length !== 1 || !['Время — деньги.', 'Сколько сейчас времени?'].includes(w[0].example)) throw new Error(`Д9 «Время»: ${JSON.stringify(w)}`);
await setCols('Word', w[0].id, { example: 'Сколько сейчас времени?', exampleTrans: 'Ҳоло соат чанд аст?' }, 'Д9 «Время»: мисоли ибораи Д12/Д14 баргардонида шуд');

// 2) Д10 — охири калима баъди «в»
const gid = L[9].gid;
const [t] = await sql`SELECT explanation FROM "GrammarTopic" WHERE id=${gid}`;
let ex = t.explanation;
const EDITS = [
  ['- **в** + рӯзи ҳафта: *в понедельник, в пятницу* (рӯзи душанбе, рӯзи ҷумъа)\n',
   '- **в** + рӯзи ҳафта: *в понедельник, в пятницу* (рӯзи душанбе, рӯзи ҷумъа) — «-а» → «-у»: *пятница → в пятницу*\n'],
  ['- **в** + моҳ / сол: *в июле, в 2026 году* (моҳи июл, соли 2026)\n',
   '- **в** + моҳ / сол: *в июле, в 2026 году* (моҳи июл, соли 2026) — охири моҳ «-е» мешавад: *июль → в июле, май → в мае, август → в августе*\n'],
];
for (const [oldP, newP] of EDITS) {
  if (ex.includes(newP)) continue;
  if (ex.split(oldP).length !== 2) throw new Error(`Д10: пора ёфт нашуд «${oldP.trim()}»`);
  ex = ex.replace(oldP, newP);
}
if ((ex.match(/⚡/g) || []).length !== 1) throw new Error('Д10: блоки ⚡ бояд ягона монад');
await setCols('GrammarTopic', gid, { explanation: ex }, 'Д10 тавзеҳ: охири «-е» (моҳ) ва «-у» (рӯз) баъди «в»');

const rules = await sql`SELECT id,pattern,note FROM "GrammarRule" WHERE "topicId"=${gid}`;
for (const [pat, oldN, newN] of [
  ['в + рӯзи ҳафта', 'в понедельник, в пятницу', 'в понедельник, в пятницу (пятница → в пятницу)'],
  ['в + моҳ / сол', 'в июле, в 2026 году', 'в июле, в мае, в августе, в 2026 году'],
]) {
  const r = rules.filter((x) => x.pattern === pat && [oldN, newN].includes(x.note));
  if (r.length !== 1) throw new Error(`Д10 қоидаи «${pat}»: ${r.length}`);
  await setCols('GrammarRule', r[0].id, { note: newN }, `Д10 қоида «${pat}»`);
}

console.log(`\n${APPLY ? 'ТАТБИҚ ШУД' : 'DRY-RUN'}: тағйир ${changed} · аллакай дуруст ${already}`);
