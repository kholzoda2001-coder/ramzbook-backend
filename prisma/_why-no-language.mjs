// Чаро 65 корбар забон интихоб накарданд — ҷустуҷӯи САБАБ, на далел.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const q = (s) => p.$queryRawUnsafe(s);
const REAL = `((u."name" IS NULL OR (u."name" NOT LIKE 'Test User%' AND u."name" NOT LIKE '%@%')) AND (u."email" IS NULL OR u."email" NOT LIKE '%@cloudtestlabaccounts.com'))`;
const NOLANG = `${REAL} AND u."targetLang" IS NULL AND NOT EXISTS (SELECT 1 FROM "UserProgress" up WHERE up."userId"=u.id)`;
const H = (t) => console.log(`\n${'='.repeat(70)}\n${t}\n${'='.repeat(70)}`);
const T = (r) => console.log(r.map((x) => '  ' + JSON.stringify(x)).join('\n'));

H('1. Онҳо чанд бор ба барнома ДАРОМАДАНД?');
T(await q(`
  SELECT CASE WHEN n = 1 THEN '1 бор' WHEN n = 2 THEN '2 бор' WHEN n <= 4 THEN '3–4' ELSE '5+' END AS "вуруд",
         COUNT(*)::int AS "корбар"
  FROM (SELECT u.id, (SELECT COUNT(*) FROM "RefreshToken" r WHERE r."userId"=u.id) n
        FROM "User" u WHERE ${NOLANG}) x GROUP BY 1 ORDER BY 1`));

H('2. Чанд рӯз байни аввалин ва охирин вуруд гузашт?');
T(await q(`
  SELECT CASE WHEN span < interval '5 minutes' THEN 'ҳамон дақиқа'
              WHEN span < interval '1 day'    THEN 'ҳамон рӯз'
              ELSE 'рӯзҳои гуногун' END AS "фосила", COUNT(*)::int AS "корбар"
  FROM (SELECT u.id, MAX(r."createdAt") - MIN(r."createdAt") AS span
        FROM "User" u JOIN "RefreshToken" r ON r."userId"=u.id
        WHERE ${NOLANG} GROUP BY u.id) x GROUP BY 1 ORDER BY 2 DESC`));

H('3. 🔎 Забони МОДАРӢ интихоб шуд, вале ҳадаф не?');
T(await q(`
  SELECT u."interfaceLang" AS "забони интерфейс", COUNT(*)::int AS "корбар"
  FROM "User" u WHERE ${NOLANG} GROUP BY 1 ORDER BY 2 DESC`));

H('4. 🔎 Кадом забонҳо ҳамчун МОДАРӢ пешниҳод мешаванд ва чанд курс доранд?');
T(await q(`
  SELECT n.code AS "модарӣ", n.name, n."canBeNative", n."isActive",
         COUNT(c.id) FILTER (WHERE c."isActive")::int AS "курси фаъол",
         COUNT(DISTINCT t.code) FILTER (WHERE c."isActive")::int AS "забони омӯзиш"
  FROM "Language" n
  LEFT JOIN "Course" c ON c."nativeLanguageId" = n.id
  LEFT JOIN "Language" t ON t.id = c."targetLanguageId"
  WHERE n."canBeNative" = true AND n."isActive" = true
  GROUP BY 1,2,3,4 ORDER BY 5 DESC`));

H('5. Кишвар ва вақти сабт (шояд трафики бегона?)');
T(await q(`
  SELECT COALESCE(u.country,'—') AS "кишвар", COUNT(*)::int AS "корбар"
  FROM "User" u WHERE ${NOLANG} GROUP BY 1 ORDER BY 2 DESC LIMIT 8`));

H('6. Тарзи сабт: парол ё Google?');
T(await q(`
  SELECT CASE WHEN u.phone IS NOT NULL THEN 'телефон'
              WHEN u.email LIKE '%@ramzbook.tj' THEN 'телефон (почтаи соя)'
              WHEN u."passwordHash" IS NULL OR u."passwordHash" = '' THEN 'иҷтимоӣ (бе парол)'
              ELSE 'почта+парол ё Google' END AS "тарз",
         COUNT(*)::int AS "корбар"
  FROM "User" u WHERE ${NOLANG} GROUP BY 1 ORDER BY 2 DESC`));

H('7. Барои муқоиса: ҳамон рақамҳо барои онҳое, ки ЗАБОН интихоб карданд');
T(await q(`
  SELECT u."interfaceLang" AS "интерфейс", COUNT(*)::int AS "корбар"
  FROM "User" u WHERE ${REAL} AND u."targetLang" IS NOT NULL GROUP BY 1 ORDER BY 2 DESC`));
await p.$disconnect();
