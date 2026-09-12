// Версияи мазмунро боло мебарад, то хонандаи КЭШДОР ислоҳҳоро бигирад.
//
// ⚠️ ЧАРО ҶУДОГОНА: ислоҳҳо бо SQL-и мустақим гузаронда шуданд, на аз болои
// API — пас `lib/contentVersion.ts` (ки одатан ҳангоми навиштан аз админ
// кор мекунад) иҷро НАШУД. Бе ин қадам хонандае ки бахшро офлайн зеркашӣ
// кардааст, ҳамон матни кӯҳнаро мебинад ва ҳамаи кор ба ӯ намерасад.
//
//   node prisma/_ar-mod-bump.mjs 1
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

const env = Object.fromEntries(
  readFileSync(new URL('../.env', import.meta.url), 'utf8')
    .split('\n').filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]; }),
);
const sql = neon(env.DATABASE_URL);
const q = (t, p) => sql.query(t, p);

const [course] = await q(`SELECT c.id FROM "Course" c
  JOIN "Language" t ON t.id=c."targetLanguageId"
  JOIN "Language" n ON n.id=c."nativeLanguageId"
 WHERE t.code='ar' AND n.code='tg' AND c.level='A1'`);
const [mod] = await q(
  `SELECT id, "order", "titleTranslated" t, "contentVersion" v
     FROM "Module" WHERE "courseId"=$1 AND "order"=$2`, [course.id, Number(process.argv[2] ?? 0)]);

await q(`UPDATE "Module" SET "contentVersion" = "contentVersion" + 1 WHERE id=$1`, [mod.id]);
const [after] = await q(`SELECT "contentVersion" v FROM "Module" WHERE id=$1`, [mod.id]);
console.log(`Бахш «${mod.t}»: contentVersion ${mod.v} → ${after.v}`);

// Парчами глобалӣ — барои кэши SWR ҳангоми оғози сарди барнома.
const [g] = await q(`SELECT "valueJson" v FROM "AppSetting" WHERE key='content_version'`);
const next = String(Number((g?.v ?? '0').replace(/"/g, '')) + 1);
if (g) await q(`UPDATE "AppSetting" SET "valueJson"=$1, "updatedAt"=now() WHERE key='content_version'`, [next]);
else await q(`INSERT INTO "AppSetting" (key,"valueJson") VALUES ('content_version',$1)`, [next]);
console.log(`Глобалӣ: content_version → ${next}`);
