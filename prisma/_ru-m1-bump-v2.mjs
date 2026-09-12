// Версияи мазмуни Модули 1-и русиро боло мебарад, то хонандаи КЭШДОР ислоҳҳоро
// бигирад. Ислоҳҳои 10.09.2026 бо SQL-и мустақим гузаронда шуданд, пас
// `lib/contentVersion.ts` (ки ҳангоми навиштан аз админ кор мекунад) иҷро
// НАШУД — бе ин қадам хонандае ки бахшро офлайн зеркашӣ кардааст, матн ва
// аудиои кӯҳнаро мебинад. Ҳамон тартиби `_ar-m1-bump.mjs`.
//
//   node prisma/_ru-m1-bump-v2.mjs
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';

const sql = connect();
const [mod] = await sql`SELECT id,"titleTranslated" t,"contentVersion" v FROM "Module"
  WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order" LIMIT 1`;
await sql`UPDATE "Module" SET "contentVersion"="contentVersion"+1 WHERE id=${mod.id}`;
const [after] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${mod.id}`;
if (after.v !== mod.v + 1) throw new Error(`contentVersion ${mod.v} → ${after.v} (интизор ${mod.v + 1})`);
console.log(`Бахш «${mod.t}»: contentVersion ${mod.v} → ${after.v}`);

const [g] = await sql`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`;
const next = String(Number(String(g?.v ?? '0').replace(/"/g, '')) + 1);
if (g) await sql`UPDATE "AppSetting" SET "valueJson"=${next}, "updatedAt"=now() WHERE key='content_version'`;
else await sql`INSERT INTO "AppSetting" (key,"valueJson","updatedAt") VALUES ('content_version',${next},now())`;
const [g2] = await sql`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`;
if (String(g2.v).replace(/"/g, '') !== next) throw new Error(`content_version тасдиқ нашуд: ${g2.v}`);
console.log(`Глобалӣ: content_version ${g?.v ?? '—'} → ${next}`);
