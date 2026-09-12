// Версияи мазмуни ЯК модули курси русиро боло мебарад (+ парчами глобалии кэш),
// то хонандаи кэшдор ислоҳҳои SQL-и мустақимро бигирад.
//   node prisma/_ru-mod-bump.mjs <индекси модул, 0-асос>
import { connect, COURSE_RU_A1 } from './_ru-fix-lib.mjs';
const sql = connect();
const idx = Number(process.argv[2]);
const mods = await sql`SELECT id,"titleTranslated" t,"contentVersion" v FROM "Module" WHERE "courseId"=${COURSE_RU_A1} ORDER BY "order"`;
const m = mods[idx];
if (!m) throw new Error(`модули ${idx} нест`);
await sql`UPDATE "Module" SET "contentVersion"="contentVersion"+1 WHERE id=${m.id}`;
const [a] = await sql`SELECT "contentVersion" v FROM "Module" WHERE id=${m.id}`;
if (a.v !== m.v + 1) throw new Error(`contentVersion ${m.v} → ${a.v}`);
console.log(`Модули ${idx + 1} «${m.t}»: contentVersion ${m.v} → ${a.v}`);
const [g] = await sql`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`;
const next = String(Number(String(g?.v ?? '0').replace(/"/g, '')) + 1);
await sql`UPDATE "AppSetting" SET "valueJson"=${next}, "updatedAt"=now() WHERE key='content_version'`;
const [g2] = await sql`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`;
if (String(g2.v).replace(/"/g, '') !== next) throw new Error('content_version тасдиқ нашуд');
console.log(`Глобалӣ: content_version ${g?.v} → ${next}`);
