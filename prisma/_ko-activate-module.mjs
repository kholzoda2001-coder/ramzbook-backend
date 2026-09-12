// Модули кореягиро ФАЪОЛ мекунад — танҳо баъди verify 0 ва аудит.
//
// Тавассути admin API (`PUT /api/admin/modules/:id {isActive:true}`) → `content_version`
// худкор (`lib/prisma.ts`); илова ба ин `AppSetting.updatedAt`, то телефони кэшдор фавран
// бинад (ҳамон қадами M2–M4). Баъд `/api/mobile/courses` месанҷад, ки модул воқеан меояд.
//
//   node prisma/_ko-activate-module.mjs <order>     # мас. 4 = Модули 5
import { SignJWT } from 'jose';
import { readFileSync } from 'fs';
import { connect } from './_ru-fix-lib.mjs';

const ORDER = Number(process.argv[2]);
if (!Number.isInteger(ORDER)) { console.error('Истифода: node prisma/_ko-activate-module.mjs <order>'); process.exit(1); }
const COURSE = 'cmtkb6vgg001lmgnbunb';
const BASE = 'https://admin.ramz.tj';
const env = Object.fromEntries(readFileSync(new URL('../.env', import.meta.url), 'utf8').split('\n')
  .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }));
const sql = connect();

const [mod] = await sql`SELECT id, title, "isActive" FROM "Module" WHERE "courseId" = ${COURSE} AND "order" = ${ORDER}`;
if (!mod) throw new Error(`модули order=${ORDER} нест`);
console.log(`Модул: ${mod.title} · isActive=${mod.isActive}`);
if (!mod.isActive) {
  const token = await new SignJWT({ username: 'admin', role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('1h')
    .sign(new TextEncoder().encode(env.JWT_SECRET));
  const res = await fetch(`${BASE}/api/admin/modules/${mod.id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: `admin_token=${token}` },
    body: JSON.stringify({ isActive: true }),
  });
  if (!res.ok) throw new Error(`PUT → ${res.status} ${(await res.text()).slice(0, 200)}`);
  await sql`UPDATE "AppSetting" SET "updatedAt" = now() WHERE key = 'content_version'`;
  console.log('✓ фаъол шуд');
}
// Санҷиши воқеӣ: ҳамон дархосте, ки барнома мефиристад.
const courses = await (await fetch(`${BASE}/api/mobile/courses`)).json();
const list = Array.isArray(courses) ? courses : courses.courses ?? [];
const ko = list.find((c) => c.id === COURSE);
const mods = ko?.modules ?? [];
console.log(`API /courses: курси кореягӣ ${ko ? 'ҳаст' : 'НЕСТ'} · модулҳо ${mods.length}: ${mods.map((m) => `${m.title ?? m.titleTranslated}(${(m.lessons ?? []).length})`).join(' · ')}`);
