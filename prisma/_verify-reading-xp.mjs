// Санҷиши ЗИНДА: «хондан ҳисоб мешавад».
//
//   npm run dev            (дар равзанаи дигар)
//   node prisma/_verify-reading-xp.mjs
//
// Ҳисоби РОБОТ истифода мешавад — хонандаи воқеӣ ламс намешавад ва дар охир
// ҳама чиз ба ҳолати аввал бармегардад.
//
// ⚠️ Prisma аз ин мошин ба Neon намерасад (порти 5432 баста) — пас база бо
// драйвери HTTP хонда мешавад. Ҳисоби санаро дар ХУДИ SQL мекунем: сутунҳои
// вақт `timestamp WITHOUT time zone`-анд ва драйвери HTTP онҳоро ҳамчун вақти
// МАҲАЛЛИИ ин компютер мехонад (ниг. `ramz-db-scripts-local`).
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);
const sql = neon(env.DATABASE_URL);
const BASE = process.env.BASE ?? 'http://localhost:3000';

let pass = 0, fail = 0;
const ok = (c, m) => { c ? pass++ : fail++; console.log(`  ${c ? '✅' : '❌'} ${m}`); };

// ── Ҳисоби санҷишӣ ────────────────────────────────────────────────────────
const [robot] = await sql`
  SELECT id, "totalXp", "weeklyXp", "lastStudyAt", "lastActiveAt"
  FROM "User" WHERE email LIKE '%robot%' OR email LIKE '%test%'
  ORDER BY "createdAt" DESC LIMIT 1`;
if (!robot) { console.error('⛔ ҳисоби санҷишӣ ёфт нашуд'); process.exit(1); }

const [item] = await sql`
  SELECT id, title FROM "LibraryItem" WHERE "isActive" = true LIMIT 1`;
if (!item) { console.error('⛔ ягон воҳиди китобхона нест'); process.exit(1); }

console.log(`ҳисоб: ${robot.id}\nкитоб: «${item.title}»\n`);

const token = jwt.sign({ sub: robot.id, tokenType: 'access' }, env.JWT_SECRET, {
  issuer: 'ramz-api', audience: 'ramz-mobile', expiresIn: '15m',
});
const post = async (position, total) => {
  const r = await fetch(BASE + '/api/mobile/library/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ itemId: item.id, position, total }),
  });
  return { status: r.status, body: await r.json().catch(() => null) };
};
const user = async () => (await sql`
  SELECT "totalXp", "lastStudyAt" FROM "User" WHERE id = ${robot.id}`)[0];
// `CURRENT_DATE` дар SQL — ҳамон калиде, ки `awardXp` менависад.
const readingToday = async () => Number(((await sql`
  SELECT source FROM "DailyXp"
  WHERE "userId" = ${robot.id} AND date = CURRENT_DATE`)[0]?.source ?? {}).reading ?? 0);

// ── Ҳолати тоза ───────────────────────────────────────────────────────────
await sql`DELETE FROM "LibraryProgress" WHERE "userId" = ${robot.id} AND "itemId" = ${item.id}`;
await sql`DELETE FROM "DailyXp" WHERE "userId" = ${robot.id} AND date = CURRENT_DATE`;
await sql`DELETE FROM "DailyTask" WHERE "userId" = ${robot.id}`;
await sql`UPDATE "User" SET "lastStudyAt" = NULL WHERE id = ${robot.id}`;
const xp0 = (await user()).totalXp;

console.log('① Се боби НАВ хонда шуд (0 → 3)');
let r = await post(3, 10);
ok(r.status === 200, `HTTP ${r.status}`);
ok(r.body?.xpEarned === 6, `xpEarned = ${r.body?.xpEarned} (интизор 6 = 3 боб × 2)`);
let u = await user();
ok(u.lastStudyAt !== null, 'фаъолият сабт шуд — силсила дигар намешиканад');
ok(Number(u.totalXp) === Number(xp0) + 6, `totalXp: ${xp0} → ${u.totalXp}`);

console.log('\n② Ҳамон боб дубора — XP НЕ, вале фаъолият ҲА');
await sql`UPDATE "User" SET "lastStudyAt" = NULL WHERE id = ${robot.id}`;
r = await post(3, 10);
ok(r.body?.xpEarned === 0, `xpEarned = ${r.body?.xpEarned}`);
ok((await user()).lastStudyAt !== null, 'фаъолият боз сабт шуд');

console.log('\n③ Ба қафо варақ гардонд — XP НЕ');
r = await post(1, 10);
ok(r.body?.xpEarned === 0, `xpEarned = ${r.body?.xpEarned}`);

console.log('\n④ Ҳадди рӯзона (20)');
r = await post(500, 500);
ok(r.body?.xpEarned === 14, `xpEarned = ${r.body?.xpEarned} (интизор 14 — то ҳадди 20)`);
r = await post(900, 900);
ok(r.body?.xpEarned === 0, `баъди ҳад xpEarned = ${r.body?.xpEarned}`);

console.log('\n⑤ Манбаи XP ва вазифаи рӯзона');
ok(await readingToday() === 20, `DailyXp.source.reading = ${await readingToday()}`);
const [task] = await sql`
  SELECT "taskType", "currentValue", "targetValue" FROM "DailyTask"
  WHERE "userId" = ${robot.id} AND "taskType" = 'earn_xp' ORDER BY date DESC LIMIT 1`;
ok(Number(task?.currentValue ?? 0) > 0,
   `вазифаи «earn_xp»: ${task?.currentValue ?? 0}/${task?.targetValue ?? '?'}`);

// ── Тозакунӣ ──────────────────────────────────────────────────────────────
await sql`DELETE FROM "LibraryProgress" WHERE "userId" = ${robot.id} AND "itemId" = ${item.id}`;
await sql`DELETE FROM "DailyXp" WHERE "userId" = ${robot.id} AND date = CURRENT_DATE`;
await sql`DELETE FROM "DailyTask" WHERE "userId" = ${robot.id}`;
await sql`
  UPDATE "User" SET "totalXp" = ${robot.totalXp}, "weeklyXp" = ${robot.weeklyXp},
    "lastStudyAt" = ${robot.lastStudyAt}, "lastActiveAt" = ${robot.lastActiveAt}
  WHERE id = ${robot.id}`;

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} дуруст · ${fail} хато — тоза шуд`);
process.exit(fail === 0 ? 0 : 1);
