// Санҷиши ЗИНДА: «як китоб барои як хонанда — доимӣ».
//
//   npm run dev                (дар равзанаи дигар)
//   node prisma/_verify-entitlements.mjs
//
// Ҳисоби роботи Play истифода мешавад ва дар охир ҳама чиз бармегардад.
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

const [user] = await sql`
  SELECT id, "isPremium", "premiumExpiresAt" FROM "User"
  WHERE email LIKE '%cloudtestlab%' ORDER BY "createdAt" DESC LIMIT 1`;
const [item] = await sql`
  SELECT id, title FROM "LibraryItem"
  WHERE "isActive" AND "isPremium" ORDER BY "order" LIMIT 1`;
const [other] = await sql`
  SELECT id, title FROM "LibraryItem"
  WHERE "isActive" AND "isPremium" AND id <> ${item.id} ORDER BY "order" LIMIT 1`;

console.log(`хонанда: ${user.id}\nкитоб A (медиҳем): «${item.title}»\nкитоб B (намедиҳем): «${other.title}»\n`);

const token = jwt.sign({ sub: user.id, tokenType: 'access' }, env.JWT_SECRET, {
  issuer: 'ramz-api', audience: 'ramz-mobile', expiresIn: '15m',
});
const shelf = async () => {
  const r = await fetch(BASE + '/api/mobile/library', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const j = await r.json();
  return Object.fromEntries((j.items ?? []).map((i) => [i.id, i.locked]));
};
const detail = async (id) => {
  const r = await fetch(BASE + `/api/mobile/library/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return r.status;
};
// ⚠️ Роутҳои админ аз `middleware.ts` мегузаранд ва cookie-и `admin_token`
// мехоҳанд. Барои скрипт роҳи дуюми ҳамон middleware истифода мешавад —
// сарлавҳаи `x-admin-api-key`.
const admin = (method, body) =>
  fetch(BASE + `/api/admin/users/${user.id}/entitlements`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-admin-api-key': env.ADMIN_API_KEY,
    },
    body: JSON.stringify(body),
  }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => null) }));

// ── Ҳолати тоза: бе обуна, бе ҳуқуқ ───────────────────────────────────────
await sql`DELETE FROM "Entitlement" WHERE "userId" = ${user.id}`;
await sql`UPDATE "User" SET "isPremium" = false, "premiumExpiresAt" = NULL WHERE id = ${user.id}`;

console.log('① То додан — ҳарду китоб қулф');
let s = await shelf();
ok(s[item.id] === true, `A қулф: ${s[item.id]}`);
ok(s[other.id] === true, `B қулф: ${s[other.id]}`);
ok(await detail(item.id) === 403, 'кушодани A рад мешавад');

console.log('\n② Админ китоби A-ро кушод');
let r = await admin('POST', { itemId: item.id, note: 'санҷиш' });
ok(r.status === 200, `HTTP ${r.status}`);
s = await shelf();
ok(s[item.id] === false, 'A кушода шуд');
ok(s[other.id] === true, '🔴 B ҳамоно қулф — танҳо ҲАМОН як китоб');
ok(await detail(item.id) === 200, 'A пурра кушода мешавад');
ok(await detail(other.id) === 403, 'B ҳамоно рад мешавад');

console.log('\n③ Такрори грант — сатри дуюм насозад');
await admin('POST', { itemId: item.id, note: 'дубора' });
const [{ n }] = await sql`
  SELECT count(*)::int n FROM "Entitlement"
  WHERE "userId" = ${user.id} AND "itemId" = ${item.id}`;
ok(n === 1, `сатрҳо: ${n}`);

console.log('\n④ Обуна ОМАД ва РАФТ — китоби додашуда мемонад');
await sql`
  UPDATE "User" SET "isPremium" = true,
    "premiumExpiresAt" = now() + interval '30 days' WHERE id = ${user.id}`;
s = await shelf();
ok(s[other.id] === false, 'бо обуна ҳама чиз кушода');
await sql`
  UPDATE "User" SET "isPremium" = false,
    "premiumExpiresAt" = now() - interval '1 day' WHERE id = ${user.id}`;
s = await shelf();
ok(s[item.id] === false, '🔴 баъди обуна китоби ДОДАШУДА кушода мемонад');
ok(s[other.id] === true, 'боқӣ боз қулф шуд');

console.log('\n⑤ Гирифтан');
r = await admin('DELETE', { itemId: item.id });
ok(r.status === 200, `HTTP ${r.status}`);
s = await shelf();
ok(s[item.id] === true, 'A боз қулф шуд');
const [{ kept }] = await sql`
  SELECT count(*)::int kept FROM "Entitlement"
  WHERE "userId" = ${user.id} AND "revokedAt" IS NOT NULL`;
ok(kept === 1, `сатр НЕСТ нашуд, таърих монд: ${kept}`);

console.log('\n⑥ Додани дубора сатри ҳамонро зинда мекунад');
await admin('POST', { itemId: item.id });
const [{ total, active }] = await sql`
  SELECT count(*)::int total, count(*) FILTER (WHERE "revokedAt" IS NULL)::int active
  FROM "Entitlement" WHERE "userId" = ${user.id} AND "itemId" = ${item.id}`;
ok(total === 1 && active === 1, `ҳамагӣ ${total}, фаъол ${active}`);

// ── Тозакунӣ ──────────────────────────────────────────────────────────────
await sql`DELETE FROM "Entitlement" WHERE "userId" = ${user.id}`;
await sql`
  UPDATE "User" SET "isPremium" = ${user.isPremium},
    "premiumExpiresAt" = ${user.premiumExpiresAt} WHERE id = ${user.id}`;

console.log(`\n${fail === 0 ? '✅' : '❌'} ${pass} дуруст · ${fail} хато — тоза шуд`);
process.exit(fail === 0 ? 0 : 1);
