// Гузариши ҲАҚИҚӢ — танҳо хонандагоне, ки БАЪДИ пурра шудани курс омадаанд.
// Бе ин филтр «дарси дертар иловашуда» ҳамчун «партофтан» намоён мешавад.
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const q = (s) => p.$queryRawUnsafe(s);
const REAL = `((u."name" IS NULL OR (u."name" NOT LIKE 'Test User%' AND u."name" NOT LIKE '%@%')) AND (u."email" IS NULL OR u."email" NOT LIKE '%@cloudtestlabaccounts.com'))`;
const H = (t) => console.log(`\n${'='.repeat(74)}\n${t}\n${'='.repeat(74)}`);
const T = (r) => console.log(r.map((x) => '  ' + JSON.stringify(x)).join('\n'));
// Ҳамаи дарсҳои EN A1 M1–M4 то ин сана мавҷуд буданд.
const CUT = `'2026-08-12'`;

H(`1. EN A1 · танҳо хонандагони баъди ${CUT} — гузариш аз дарс ба дарс`);
T(await q(`
  WITH newbies AS (
    SELECT up."userId" FROM "UserProgress" up
    JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE up."isCompleted" GROUP BY 1 HAVING MIN(up."completedAt") >= ${CUT}
  ), l AS (
    SELECT m."order" AS m_ord, le."order" AS l_ord,
           LEFT(le."titleTranslated",26) AS t, le."skillType" AS skill,
           (SELECT COUNT(*)::int FROM "Word" w WHERE w."lessonId"=le.id) AS words,
           COUNT(DISTINCT up."userId") AS users
    FROM "Lesson" le
    JOIN "Module" m ON m.id = le."moduleId"
    JOIN "Course" c ON c.id = m."courseId"
    JOIN "Language" tl ON tl.id = c."targetLanguageId"
    LEFT JOIN "UserProgress" up ON up."lessonId" = le.id AND up."isCompleted"
         AND up."userId" IN (SELECT "userId" FROM newbies)
    WHERE c.level='A1' AND tl.code='en' AND m."order" <= 2 AND le."isActive"
    GROUP BY m."order", le."order", le."titleTranslated", le."skillType", le.id
  )
  SELECT m_ord+1 AS m, l_ord+1 AS d, t, skill, words, users::int,
         CASE WHEN LAG(users) OVER (ORDER BY m_ord, l_ord) IN (NULL, 0) THEN NULL
              ELSE ROUND(100.0*users/LAG(users) OVER (ORDER BY m_ord, l_ord))::int END AS "% гузашт"
  FROM l ORDER BY m_ord, l_ord`));

H('2. Вақти дарс: МИЁНА ↔ МЕДИАНА (миёна аз барномаи кушода вайрон мешавад)');
T(await q(`
  SELECT le."skillType" AS skill, c.level, COUNT(*)::int AS n,
         ROUND(AVG(up."timeSpent"))::int AS "миёна",
         percentile_disc(0.5) WITHIN GROUP (ORDER BY up."timeSpent")::int AS "медиана",
         percentile_disc(0.9) WITHIN GROUP (ORDER BY up."timeSpent")::int AS "p90"
  FROM "UserProgress" up JOIN "Lesson" le ON le.id=up."lessonId"
  JOIN "Module" m ON m.id=le."moduleId" JOIN "Course" c ON c.id=m."courseId"
  JOIN "User" u ON u.id=up."userId" AND ${REAL}
  WHERE up."isCompleted" AND up."timeSpent" > 0
  GROUP BY 1,2 ORDER BY 5 DESC`));

H('3. Кадом навъҳо УМУМАН дақиқӣ ва вақт намефиристанд');
T(await q(`
  SELECT le."skillType" AS skill, COUNT(*)::int AS n,
         COUNT(*) FILTER (WHERE up."timeSpent" = 0)::int AS "вақт сифр",
         COUNT(*) FILTER (WHERE up.accuracy = 100)::int AS "дақиқӣ 100",
         COUNT(DISTINCT up.accuracy)::int AS "қиматҳои гуногуни дақиқӣ"
  FROM "UserProgress" up JOIN "Lesson" le ON le.id=up."lessonId"
  JOIN "User" u ON u.id=up."userId" AND ${REAL}
  WHERE up."isCompleted" GROUP BY 1 ORDER BY n DESC`));
await p.$disconnect();
