// Чаро хонандагон ДАРСРО мепартоянд — таҳлили қадам ба қадам.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const q = (s) => p.$queryRawUnsafe(s);
const REAL = `((u."name" IS NULL OR (u."name" NOT LIKE 'Test User%' AND u."name" NOT LIKE '%@%')) AND (u."email" IS NULL OR u."email" NOT LIKE '%@cloudtestlabaccounts.com'))`;
const H = (t) => console.log(`\n${'='.repeat(74)}\n${t}\n${'='.repeat(74)}`);
const T = (r) => console.log(r.map((x) => '  ' + JSON.stringify(x)).join('\n'));

H('1. Дақиқӣ ва вақт аз рӯи НАВЪИ дарс (ҳамаи сатрҳо)');
T(await q(`
  SELECT le."skillType" AS skill, COUNT(*)::int AS n,
         ROUND(AVG(up.accuracy))::int AS "дақиқӣ%",
         COUNT(*) FILTER (WHERE up.accuracy < 80)::int AS "<80%",
         ROUND(AVG(NULLIF(up."timeSpent",0)))::int AS "сония",
         ROUND(AVG(up."heartsLost"),1) AS "дил гум"
  FROM "UserProgress" up JOIN "Lesson" le ON le.id = up."lessonId"
  JOIN "User" u ON u.id = up."userId" AND ${REAL}
  WHERE up."isCompleted" GROUP BY 1 ORDER BY n DESC`));

H('2. EN A1: суръати ГУЗАРИШ аз ҳар дарс ба дарси оянда');
T(await q(`
  WITH l AS (
    SELECT le.id, m."order" AS m_ord, le."order" AS l_ord,
           LEFT(le."titleTranslated",26) AS t, le."skillType" AS skill,
           (SELECT COUNT(*)::int FROM "Word" w WHERE w."lessonId"=le.id) AS words,
           MIN(up."completedAt") AS born,
           COUNT(DISTINCT up."userId") FILTER (WHERE up."isCompleted") AS users
    FROM "Lesson" le
    JOIN "Module" m ON m.id = le."moduleId"
    JOIN "Course" c ON c.id = m."courseId"
    JOIN "Language" tl ON tl.id = c."targetLanguageId"
    LEFT JOIN "UserProgress" up ON up."lessonId" = le.id
    LEFT JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE c.level='A1' AND tl.code='en' AND m."order" <= 3 AND le."isActive"
    GROUP BY le.id, m."order", le."order", le."titleTranslated", le."skillType"
  ), s AS (
    SELECT *, LAG(users) OVER (ORDER BY m_ord, l_ord) AS prev FROM l
    WHERE born < now() - interval '25 days'
  )
  SELECT m_ord+1 AS m, l_ord+1 AS d, t, skill, words, users::int,
         CASE WHEN prev IS NULL OR prev = 0 THEN NULL
              ELSE ROUND(100.0*users/prev)::int END AS "% гузашт"
  FROM s ORDER BY m_ord, l_ord`));

H('3. Оё дарси ДАРОЗ бештар партофта мешавад? (калима ↔ гузариш)');
T(await q(`
  SELECT CASE WHEN words = 0 THEN 'бе калима'
              WHEN words <= 5 THEN '1–5 калима'
              WHEN words <= 8 THEN '6–8'
              ELSE '9+' END AS "ҳаҷм",
         COUNT(*)::int AS "дарс", ROUND(AVG(users))::int AS "миёнаи хонанда",
         ROUND(AVG(sec))::int AS "сония"
  FROM (
    SELECT le.id, (SELECT COUNT(*)::int FROM "Word" w WHERE w."lessonId"=le.id) AS words,
           COUNT(DISTINCT up."userId") AS users, AVG(NULLIF(up."timeSpent",0)) AS sec
    FROM "Lesson" le
    JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId"
    JOIN "Language" tl ON tl.id=c."targetLanguageId"
    LEFT JOIN "UserProgress" up ON up."lessonId"=le.id AND up."isCompleted"
    LEFT JOIN "User" u ON u.id=up."userId" AND ${REAL}
    WHERE c.level='A1' AND tl.code IN ('en','ru') AND le."isActive"
    GROUP BY le.id
  ) x GROUP BY 1 ORDER BY 1`));

H('4. Дарсҳои ДАРОЗТАРИН, ки хонанда воқеан гузаштааст');
T(await q(`
  SELECT tl.code, c.level, m."order"+1 AS m, le."order"+1 AS d,
         LEFT(le."titleTranslated",24) AS t, le."skillType" AS skill,
         COUNT(*)::int AS n, ROUND(AVG(up."timeSpent"))::int AS "сония",
         ROUND(AVG(up."timeSpent")/60.0,1) AS "дақиқа"
  FROM "UserProgress" up JOIN "Lesson" le ON le.id=up."lessonId"
  JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId"
  JOIN "Language" tl ON tl.id=c."targetLanguageId"
  JOIN "User" u ON u.id=up."userId" AND ${REAL}
  WHERE up."isCompleted" AND up."timeSpent" > 0
  GROUP BY 1,2,3,4,5,6 HAVING COUNT(*) >= 5 ORDER BY 8 DESC LIMIT 10`));

H('5. Дарси ОХИРИН пеш аз рафтан — аз рӯи НАВЪ (ҳамаи забонҳо)');
T(await q(`
  WITH last AS (
    SELECT up."userId", le."skillType" AS skill, m."order" AS m_ord,
           ROW_NUMBER() OVER (PARTITION BY up."userId" ORDER BY up."completedAt" DESC) rn
    FROM "UserProgress" up JOIN "Lesson" le ON le.id=up."lessonId"
    JOIN "Module" m ON m.id=le."moduleId"
    JOIN "User" u ON u.id=up."userId" AND ${REAL}
    WHERE up."isCompleted" AND up."completedAt" < now() - interval '10 days'
  ), tot AS (
    SELECT le."skillType" AS skill, COUNT(*)::int AS done
    FROM "UserProgress" up JOIN "Lesson" le ON le.id=up."lessonId"
    JOIN "User" u ON u.id=up."userId" AND ${REAL}
    WHERE up."isCompleted" GROUP BY 1
  )
  SELECT l.skill, COUNT(*)::int AS "ин ҷо монданд", t.done AS "ҳамагӣ иҷро",
         ROUND(100.0*COUNT(*)/t.done, 1) AS "% рафтан"
  FROM last l JOIN tot t ON t.skill = l.skill
  WHERE l.rn = 1 GROUP BY l.skill, t.done ORDER BY 4 DESC`));
await p.$disconnect();
