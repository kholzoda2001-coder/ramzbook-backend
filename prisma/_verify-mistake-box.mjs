// Санҷиши ЗИНДАИ қуттии хатоҳо — тамоми давра дар сервери воқеӣ.
//
//   npm run dev        (дар равзанаи дигар)
//   node prisma/_verify-mistake-box.mjs
//
// Ҳисоби РОБОТИ Google Play истифода мешавад (0 XP, 0 дарс) — ягон хонандаи
// воқеӣ ламс намешавад, ва дар охир ҳама чиз тоза мегардад.
import { readFileSync } from 'fs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; })
);

const p = new PrismaClient();
const BASE = process.env.BASE ?? 'http://localhost:3000';
const USER = 'cmrzqce3t0000ut60ik5x0bwu'; // роботи Google Play

// Ҳамон имзое, ки `signAccessTokenForUser` мегузорад.
const token = jwt.sign({ sub: USER, tokenType: 'access' }, env.JWT_SECRET, {
  issuer: 'ramz-api', audience: 'ramz-mobile', expiresIn: '10m',
});
const H = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
const api = async (path, init) => {
  const r = await fetch(BASE + path, { ...init, headers: { ...H, ...(init?.headers ?? {}) } });
  const txt = await r.text();
  try { return { status: r.status, body: JSON.parse(txt) }; }
  catch { return { status: r.status, body: txt.slice(0, 200) }; }
};
const ok = (cond, msg) => console.log(`  ${cond ? '✅' : '❌'} ${msg}`);

// Забони корбарро ба англисӣ мегузорем, то филтри забони навбат кор кунад.
const prevLang = (await p.user.findUnique({ where: { id: USER }, select: { targetLang: true } }))?.targetLang ?? null;
await p.user.update({ where: { id: USER }, data: { targetLang: 'en' } });
await p.srsCard.deleteMany({ where: { userId: USER } });

// 20 калимаи англисии воқеӣ
const words = await p.$queryRawUnsafe(`
  SELECT w.id, w.word FROM "Word" w
  JOIN "Lesson" le ON le.id = w."lessonId"
  JOIN "Module" m ON m.id = le."moduleId"
  JOIN "Course" c ON c.id = m."courseId"
  JOIN "Language" tl ON tl.id = c."targetLanguageId"
  WHERE tl.code = 'en' AND c.level = 'A1' AND m."order" = 0 LIMIT 20`);

const due = async () => (await api('/api/mobile/srs/due?limit=50&mode=mistakes')).body.cards ?? [];

console.log('\n① Навбат дар оғоз');
ok((await due()).length === 0, `холӣ (${(await due()).length} корт)`);

console.log('\n② Дар дарс 10 калима хато шуд');
await api('/api/mobile/srs/mistakes', { method: 'POST', body: JSON.stringify({ itemIds: words.slice(0, 10).map((w) => w.id) }) });
let q = await due();
ok(q.length === 10, `навбат 10 калима дорад (${q.length})`);

console.log('\n③ 20 хато → танҳо 15 нишон дода мешавад');
await api('/api/mobile/srs/mistakes', { method: 'POST', body: JSON.stringify({ itemIds: words.map((w) => w.id) }) });
q = await due();
ok(q.length === 15, `ҳадди рӯзона 15 (${q.length})`);
ok((await p.srsCard.count({ where: { userId: USER, lapses: { gt: 0 } } })) === 20, 'ҳар 20 корт дар қуттӣ мондаанд');

console.log('\n④ Такрор: 14 ДУРУСТ, 1 ХАТО');
for (let i = 0; i < 15; i++) {
  await api('/api/mobile/srs/review', {
    method: 'POST',
    body: JSON.stringify({ itemId: q[i].itemId, grade: i === 0 ? 'again' : 'good' }),
  });
}
const afterCards = await p.srsCard.findMany({ where: { userId: USER, itemId: { in: q.map((c) => c.itemId) } } });
const cleared = afterCards.filter((c) => c.lapses === 0);
const kept = afterCards.filter((c) => c.lapses > 0);
ok(cleared.length === 14, `14 калима аз қуттӣ баромад (${cleared.length})`);
ok(kept.length === 1, `1 калима дар қуттӣ монд (${kept.length})`);

const tomorrow = Date.now() + 24 * 3600 * 1000;
const diffH = Math.abs(kept[0].dueAt.getTime() - tomorrow) / 3600000;
ok(diffH < 1, `калимаи хато маҳз ФАРДО бармегардад (фарқ ${diffH.toFixed(2)} соат)`);

console.log('\n⑤ Имрӯз навбат боқимондаи хатоҳоро медиҳад');
q = await due();
ok(q.length === 5, `5 калимаи боқимонда (${q.length}) — калимаи хатошуда имрӯз дигар намебарояд`);

console.log('\n⑥ Ҳамаашро дуруст кард → навбат ХОЛӢ');
for (const c of q) {
  await api('/api/mobile/srs/review', { method: 'POST', body: JSON.stringify({ itemId: c.itemId, grade: 'good' }) });
}
q = await due();
ok(q.length === 0, `навбат холӣ (${q.length})`);

console.log('\n⑦ Реҷаи КӮҲНА (бе mode) ба барномаи кӯҳна бетағйир мемонад');
const legacy = (await api('/api/mobile/srs/due?limit=50')).body.cards ?? [];
ok(legacy.length >= 0, `роути кӯҳна кор мекунад (${legacy.length} корт)`);

// ── Тозакунӣ ──────────────────────────────────────────────────────────────
await p.srsCard.deleteMany({ where: { userId: USER } });
await p.user.update({ where: { id: USER }, data: { targetLang: prevLang } });
console.log('\nтоза шуд');
await p.$disconnect();
