// Давоми таҳлил: фаъолшавӣ, сифати маълумот, «чанд дарс = одат».
//   node prisma/_retention-audit2.mjs
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const q = (s, ...v) => p.$queryRawUnsafe(s, ...v);
const REAL = `((u."name" IS NULL OR (u."name" NOT LIKE 'Test User%' AND u."name" NOT LIKE '%@%'))
              AND (u."email" IS NULL OR u."email" NOT LIKE '%@cloudtestlabaccounts.com'))`;
const H = (t) => console.log(`\n${'═'.repeat(72)}\n${t}\n${'═'.repeat(72)}`);
const T = (r) => console.log(r.map((x) => '  ' + JSON.stringify(x)).join('\n'));

H('1. timeSpent: оё вақт умуман сабт мешавад?');
T(await q(`
  SELECT COUNT(*)::int AS "ҳама",
         COUNT(*) FILTER (WHERE up."timeSpent" = 0)::int AS "сифр",
         COUNT(*) FILTER (WHERE up."timeSpent" BETWEEN 1 AND 30)::int AS "1–30 сония",
         COUNT(*) FILTER (WHERE up."timeSpent" > 30)::int AS "30+ сония",
         COUNT(*) FILTER (WHERE up."xpEarned" = 0)::int AS "XP сифр"
  FROM "UserProgress" up JOIN "User" u ON u.id = up."userId" AND ${REAL} WHERE up."isCompleted"`));

H('2. Вақт ва дақиқӣ аз рӯи НАВЪИ дарс (танҳо сатрҳои вақтдор)');
T(await q(`
  SELECT le."skillType" AS skill, COUNT(*)::int AS n,
         ROUND(AVG(up."timeSpent"))::int AS "сония", ROUND(AVG(up.accuracy))::int AS "дақиқӣ%",
         COUNT(*) FILTER (WHERE up.accuracy = 100)::int AS "бехато"
  FROM "UserProgress" up JOIN "Lesson" le ON le.id = up."lessonId"
  JOIN "User" u ON u.id = up."userId" AND ${REAL}
  WHERE up."isCompleted" AND up."timeSpent" > 0 GROUP BY 1 ORDER BY n DESC`));

H('3. ФАЪОЛШАВӢ: аз сабт то аввалин дарс чанд вақт мегузарад');
T(await q(`
  WITH f AS (
    SELECT u.id, u."createdAt" AS reg,
           (SELECT MIN(up."completedAt") FROM "UserProgress" up WHERE up."userId"=u.id AND up."isCompleted") AS first
    FROM "User" u WHERE ${REAL}
  )
  SELECT CASE WHEN first IS NULL THEN 'ҳеҷ гоҳ'
              WHEN first - reg < interval '10 minutes' THEN '< 10 дақиқа'
              WHEN first - reg < interval '1 hour'    THEN '10–60 дақиқа'
              WHEN first - reg < interval '1 day'     THEN 'ҳамон рӯз'
              ELSE 'дертар' END AS "кай", COUNT(*)::int AS n
  FROM f GROUP BY 1 ORDER BY n DESC`));

H('4. РӮЗИ ЯКУМ: чанд дарс кардан = баргаштан (метрикаи фаъолшавӣ)');
T(await q(`
  WITH d1 AS (
    SELECT up."userId",
           COUNT(*) FILTER (WHERE up."completedAt" < (SELECT MIN(x."completedAt") FROM "UserProgress" x WHERE x."userId"=up."userId" AND x."isCompleted") + interval '24 hours') AS les1
    FROM "UserProgress" up JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE up."isCompleted" GROUP BY 1
  ), ret AS (
    SELECT d1."userId", d1.les1,
           (SELECT COUNT(DISTINCT date_trunc('day', dx."date")) FROM "DailyXp" dx WHERE dx."userId"=d1."userId") days
    FROM d1
  )
  SELECT CASE WHEN les1 = 1 THEN '1 дарс' WHEN les1 <= 3 THEN '2–3' WHEN les1 <= 6 THEN '4–6'
              WHEN les1 <= 12 THEN '7–12' ELSE '13+' END AS "дар рӯзи 1",
         COUNT(*)::int AS "корбар",
         ROUND(100.0 * COUNT(*) FILTER (WHERE days >= 2) / COUNT(*))::int AS "% баргашт",
         ROUND(100.0 * COUNT(*) FILTER (WHERE days >= 5) / COUNT(*))::int AS "% 5+ рӯз"
  FROM ret GROUP BY 1 ORDER BY 1`));

H('5. Пас аз КАДОМ дарс дигар барнагаштанд (охирин дарси ҳар корбар, EN A1)');
T(await q(`
  WITH last AS (
    SELECT up."userId", up."completedAt",
           ROW_NUMBER() OVER (PARTITION BY up."userId" ORDER BY up."completedAt" DESC) rn,
           m."order" AS m_ord, le."order" AS l_ord, le."titleTranslated" AS title, le."skillType" AS skill
    FROM "UserProgress" up
    JOIN "Lesson" le ON le.id = up."lessonId"
    JOIN "Module" m ON m.id = le."moduleId"
    JOIN "Course" c ON c.id = m."courseId"
    JOIN "Language" tl ON tl.id = c."targetLanguageId"
    JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE up."isCompleted" AND c.level='A1' AND tl.code='en'
  )
  SELECT m_ord + 1 AS "модул", l_ord + 1 AS "дарс", LEFT(title, 30) AS title, skill,
         COUNT(*)::int AS "ин ҷо мондаанд"
  FROM last WHERE rn = 1 AND "completedAt" < now() - interval '10 days'
  GROUP BY 1, 2, 3, 4 HAVING COUNT(*) >= 2 ORDER BY 5 DESC LIMIT 12`));

H('6. Вазифаҳои ҳаррӯза: иҷро мешаванд?');
T(await q(`
  SELECT dt.type, COUNT(*)::int AS n,
         COUNT(*) FILTER (WHERE dt."isCompleted")::int AS "иҷро",
         ROUND(100.0 * COUNT(*) FILTER (WHERE dt."isCompleted") / COUNT(*))::int AS "%"
  FROM "DailyTask" dt JOIN "User" u ON u.id = dt."userId" AND ${REAL}
  GROUP BY 1 ORDER BY n DESC LIMIT 10`));

H('7. Стрик: чанд нафар силсилаи ҲАҚИҚӢ доранд');
T(await q(`
  SELECT COUNT(*) FILTER (WHERE u.streak > 0)::int AS "streak>0 (яхбаста)",
         COUNT(*) FILTER (WHERE u."lastActiveDate" > now() - interval '2 days')::int AS "дирӯз/имрӯз фаъол",
         COUNT(*) FILTER (WHERE u."longestStreak" >= 3)::int AS "3+ рӯзи пайдарпай доштанд",
         COUNT(*) FILTER (WHERE u."longestStreak" >= 7)::int AS "7+"
  FROM "User" u WHERE ${REAL}`));

H('8. Курсҳо: кадом забон чанд дарси ФАЪОЛ дорад (мазмун кофист?)');
T(await q(`
  SELECT tl.code, c.level, COUNT(DISTINCT m.id)::int AS "модул", COUNT(le.id)::int AS "дарс"
  FROM "Course" c JOIN "Language" tl ON tl.id = c."targetLanguageId"
  LEFT JOIN "Module" m ON m."courseId" = c.id AND m."isActive"
  LEFT JOIN "Lesson" le ON le."moduleId" = m.id AND le."isActive"
  WHERE c."isActive" GROUP BY 1, 2 ORDER BY 1, 2`));

await p.$disconnect();
