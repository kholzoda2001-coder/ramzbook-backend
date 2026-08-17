// Ҷои ҷавоби дурустро дар саволҳои хониш/шунавоӣ/такрор/имтиҳон паҳн мекунад.
//
// ЧАРО: барнома вариантҳои ин саволҳоро омехта НАМЕКУНАД (фарқ аз машқи
// грамматика ва сатҳсанҷӣ, ки `stableShuffle` доранд) — ҷои ҷавоб ҳамон аст,
// ки дар база навишта шудааст. Ҳангоми навиштани мазмун ҷавоби дуруст табиатан
// якум навишта мешавад, ва натиҷа: 97% ҷавобҳои олмонӣ дар ҷои 1 буданд.
// Хонанда инро дар ду дарс мефаҳмад ва дигар намехонад — танҳо якумро мезанад.
// Барои муқоиса: англисӣ 36%, русӣ 35%, арабӣ 33%.
//
// Тақсим ҳатмист ва такроршаванда: ҷои ҷавоб = рақами савол % шумораи вариант.
// Ҳамин тартиб дар `_de-module-build.mjs` ҳам ҳаст, пас модули нав аз аввал
// дуруст сохта мешавад.
//
// ⚠️ ТАНҲО ОЛМОНӢ — ҳеҷ забони дигар даст намехӯрад.
//
//   node prisma/_de-spread-answers.mjs [--dry]
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter(l => l.includes('=') && !l.trim().startsWith('#'))
    .map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const BASE = 'https://admin.ramz.tj';
const COURSE = 'cmqdhwb5q00021z597df2767m';
const DRY = process.argv.includes('--dry');

const token = await new SignJWT({ username: 'admin', role: 'admin' })
  .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('2h')
  .sign(new TextEncoder().encode(env.JWT_SECRET));
const H = { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` };

/** Ҷавоби дурустро ба ҷои [target] мебарад, тартиби боқимондаро вайрон намекунад. */
export function moveAnswerTo(options, correctIndex, target) {
  const rest = options.filter((_, i) => i !== correctIndex);
  const out = [...rest];
  out.splice(target, 0, options[correctIndex]);
  return { options: out, correctIndex: target };
}

const rows = await sql.query(`
  SELECT q.id, q.question, q.options, q."correctIndex", q."order", e.title
  FROM "ComprehensionQuestion" q
  JOIN "ComprehensionExercise" e ON q."exerciseId" = e.id
  WHERE e."courseId" = '${COURSE}'
  ORDER BY e.title, q."order"`);

console.log(`Саволҳо: ${rows.length}`);
const before = {};
for (const r of rows) before[r.correctIndex] = (before[r.correctIndex] ?? 0) + 1;
console.log(`Пеш: ${Object.entries(before).map(([k, v]) => `#${+k + 1}=${v}`).join('  ')}`);

let n = 0, i = 0;
const after = {};
for (const r of rows) {
  const opts = r.options ?? [];
  const target = i++ % opts.length;      // 0,1,2,0,1,2… — паҳни ҳатмӣ
  after[target] = (after[target] ?? 0) + 1;
  if (target === r.correctIndex) continue;
  const moved = moveAnswerTo(opts, r.correctIndex, target);
  if (DRY) { console.log(`  «${r.question.slice(0, 40)}» ${r.correctIndex} → ${target}`); n++; continue; }
  const res = await fetch(`${BASE}/api/admin/comprehensions/questions/${r.id}`, {
    method: 'PUT', headers: H, body: JSON.stringify(moved),
  });
  if (res.ok) n++; else console.log(`  ✗ ${r.question.slice(0, 40)}: ${(await res.text()).slice(0, 90)}`);
}
console.log(`Баъд: ${Object.entries(after).map(([k, v]) => `#${+k + 1}=${v}`).join('  ')}`);
console.log(`${DRY ? 'Тағйир мешуд' : 'Тағйир шуд'}: ${n}`);

// Санҷиш: ҷавоби дуруст ҳанӯз дар вариантҳо ҳаст ва матнаш дуруст аст.
if (!DRY) {
  const chk = await sql.query(`
    SELECT q.question, q.options, q."correctIndex" FROM "ComprehensionQuestion" q
    JOIN "ComprehensionExercise" e ON q."exerciseId"=e.id WHERE e."courseId"='${COURSE}'`);
  let bad = 0;
  for (const c of chk) {
    const o = c.options ?? [];
    if (c.correctIndex < 0 || c.correctIndex >= o.length) { console.log(`  ✗ ${c.question}: индекс берун аз доира`); bad++; }
    if (new Set(o).size !== o.length) { console.log(`  ✗ ${c.question}: варианти такрорӣ`); bad++; }
  }
  console.log(`Санҷиш: ${chk.length} савол · мушкил ${bad}`);
}
