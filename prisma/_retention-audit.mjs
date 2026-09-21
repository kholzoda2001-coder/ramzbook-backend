// ТАҲЛИЛИ RETENTION ва ОБУНА — аз базаи ЗИНДА.
//
//   node prisma/_retention-audit.mjs
//
// ⚠️ Вақт ҳамеша бо PrismaClient хонда мешавад (наи драйвери HTTP-и Neon):
// сутунҳо `timestamp without time zone`-и UTC-анд ва танҳо Prisma онҳоро
// дуруст мехонад. Рӯзҳо дар ХУДИ SQL бо `+ interval '5 hours'` (Душанбе)
// ҳисоб мешаванд.
//
// ⚠️ Доми таърихӣ: дарси «камиҷро» = рафтани корбар НЕСТ — шояд он дарс
// ДЕРТАР илова шуда бошад. Ҳамеша `MIN(completedAt)`-и худи дарс санҷида
// мешавад (ниг. [[ramz-retention]]).
import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
const q = (s, ...v) => p.$queryRawUnsafe(s, ...v);

const REAL = `((u."name" IS NULL OR (u."name" NOT LIKE 'Test User%' AND u."name" NOT LIKE '%@%'))
              AND (u."email" IS NULL OR u."email" NOT LIKE '%@cloudtestlabaccounts.com'))`;
const H = (t) => console.log(`\n${'═'.repeat(72)}\n${t}\n${'═'.repeat(72)}`);
const T = (rows) => console.log(rows.map((r) => '  ' + JSON.stringify(r)).join('\n'));

// ── A. Аҳолӣ ва воронкаи фаъолшавӣ ─────────────────────────────────────────
H('A. ВОРОНКА: сабт → аввалин дарс → одат');
T(await q(`
  WITH base AS (
    SELECT u.id, u."createdAt",
           (SELECT COUNT(*) FROM "UserProgress" up WHERE up."userId"=u.id AND up."isCompleted") les,
           (SELECT COUNT(DISTINCT date_trunc('day', d."date")) FROM "DailyXp" d WHERE d."userId"=u.id) days
    FROM "User" u WHERE ${REAL}
  )
  SELECT COUNT(*)::int AS "сабт",
         COUNT(*) FILTER (WHERE les >= 1)::int  AS "1+ дарс",
         COUNT(*) FILTER (WHERE les >= 5)::int  AS "5+",
         COUNT(*) FILTER (WHERE les >= 10)::int AS "10+",
         COUNT(*) FILTER (WHERE les >= 25)::int AS "25+",
         COUNT(*) FILTER (WHERE les >= 50)::int AS "50+",
         COUNT(*) FILTER (WHERE days >= 2)::int AS "2+ рӯз",
         COUNT(*) FILTER (WHERE days >= 7)::int AS "7+ рӯз"
  FROM base`));

H('A2. Онҳое, ки ҲЕҶ дарс накарданд — кай сабт шуданд?');
T(await q(`
  SELECT to_char(u."createdAt" + interval '5 hours', 'YYYY-MM') AS moh,
         COUNT(*)::int AS sabt,
         COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM "UserProgress" up WHERE up."userId"=u.id AND up."isCompleted"))::int AS "0 дарс",
         ROUND(100.0 * COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM "UserProgress" up WHERE up."userId"=u.id AND up."isCompleted")) / COUNT(*), 1) AS "% мурда"
  FROM "User" u WHERE ${REAL}
  GROUP BY 1 ORDER BY 1`));

// ── B. Аз кадом ДАРС мераванд ──────────────────────────────────────────────
H('B. ДАРСҲОИ АВВАЛ: чанд нафар то ин ҷо расид (танҳо дарсҳои кӯҳна)');
T(await q(`
  WITH l AS (
    SELECT le.id, m."order" AS m_ord, le."order" AS l_ord, le."titleTranslated" AS title,
           le."skillType" AS skill, tl.code AS lang,
           MIN(up."completedAt") AS first_seen,
           COUNT(DISTINCT up."userId") FILTER (WHERE up."isCompleted") AS users
    FROM "Lesson" le
    JOIN "Module" m ON m.id = le."moduleId"
    JOIN "Course" c ON c.id = m."courseId"
    JOIN "Language" tl ON tl.id = c."targetLanguageId"
    LEFT JOIN "UserProgress" up ON up."lessonId" = le.id
    JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE c.level = 'A1' AND tl.code = 'en' AND m."order" <= 2 AND le."isActive"
    GROUP BY le.id, m."order", le."order", le."titleTranslated", le."skillType", tl.code
  )
  SELECT m_ord, l_ord, LEFT(title, 34) AS title, skill, users::int,
         to_char(first_seen, 'MM-DD') AS "аввал"
  FROM l WHERE first_seen < now() - interval '30 days'
  ORDER BY m_ord, l_ord LIMIT 40`));

H('B2. Дар кадом МОДУЛ меистанд (охирин модули дастрасшуда)');
T(await q(`
  WITH last AS (
    SELECT up."userId", MAX(m."order") AS m_ord, c.level, tl.code AS lang
    FROM "UserProgress" up
    JOIN "Lesson" le ON le.id = up."lessonId"
    JOIN "Module" m ON m.id = le."moduleId"
    JOIN "Course" c ON c.id = m."courseId"
    JOIN "Language" tl ON tl.id = c."targetLanguageId"
    JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE up."isCompleted" GROUP BY up."userId", c.level, tl.code
  )
  SELECT lang, level, m_ord + 1 AS "модул", COUNT(*)::int AS "корбар"
  FROM last GROUP BY lang, level, m_ord HAVING COUNT(*) > 1
  ORDER BY lang, level, m_ord`));

// ── C. Ретеншн ─────────────────────────────────────────────────────────────
H('C. КОГОРТҲОИ ҲАФТАИНА: чанд фоиз баргашт');
T(await q(`
  WITH c AS (
    SELECT u.id, date_trunc('week', u."createdAt" + interval '5 hours') AS wk,
           (SELECT COUNT(DISTINCT date_trunc('day', d."date")) FROM "DailyXp" d WHERE d."userId"=u.id) days,
           (SELECT MAX(d."date") FROM "DailyXp" d WHERE d."userId"=u.id) last_day
    FROM "User" u WHERE ${REAL}
  )
  SELECT to_char(wk, 'MM-DD') AS "ҳафта", COUNT(*)::int AS "сабт",
         COUNT(*) FILTER (WHERE days >= 1)::int AS "фаъол шуд",
         COUNT(*) FILTER (WHERE days >= 2)::int AS "2+ рӯз",
         COUNT(*) FILTER (WHERE days >= 5)::int AS "5+ рӯз",
         COUNT(*) FILTER (WHERE last_day > now() - interval '14 days')::int AS "ҳоло зинда"
  FROM c GROUP BY wk ORDER BY wk`));

H('C2. Фосилаи байни рӯзҳои хониш (одати ҳаррӯза ҳаст?)');
T(await q(`
  WITH d AS (
    SELECT up."userId", date_trunc('day', up."completedAt" + interval '5 hours') AS day
    FROM "UserProgress" up JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE up."isCompleted" GROUP BY 1, 2
  ), g AS (
    SELECT "userId", day, day - LAG(day) OVER (PARTITION BY "userId" ORDER BY day) AS gap FROM d
  )
  SELECT CASE WHEN gap IS NULL THEN 'аввалин рӯз'
              WHEN gap = interval '1 day' THEN '1 рӯз (пайдарпай)'
              WHEN gap <= interval '3 days' THEN '2–3 рӯз'
              WHEN gap <= interval '7 days' THEN '4–7 рӯз'
              ELSE '8+ рӯз' END AS "фосила",
         COUNT(*)::int AS n
  FROM g GROUP BY 1 ORDER BY 2 DESC`));

// ── D. Сохтори сессия ва мазмун ────────────────────────────────────────────
H('D. ДАРС: вақт, дақиқӣ, чанд дарс дар як сессия');
T(await q(`
  SELECT ROUND(AVG(up."timeSpent"))::int AS "сония миёна",
         percentile_disc(0.5) WITHIN GROUP (ORDER BY up."timeSpent")::int AS "медиана",
         percentile_disc(0.9) WITHIN GROUP (ORDER BY up."timeSpent")::int AS "p90",
         ROUND(AVG(up.accuracy))::int AS "дақиқӣ%",
         COUNT(*) FILTER (WHERE up.accuracy = 100)::int AS "100%",
         COUNT(*) FILTER (WHERE up.accuracy < 70)::int AS "<70%",
         COUNT(*)::int AS "ҳама"
  FROM "UserProgress" up JOIN "User" u ON u.id = up."userId" AND ${REAL}
  WHERE up."isCompleted"`));

T(await q(`
  SELECT "дарс дар рӯз", COUNT(*)::int AS "чанд рӯз" FROM (
    SELECT up."userId", date_trunc('day', up."completedAt" + interval '5 hours') AS d,
           CASE WHEN COUNT(*) = 1 THEN '1' WHEN COUNT(*) <= 3 THEN '2–3'
                WHEN COUNT(*) <= 7 THEN '4–7' WHEN COUNT(*) <= 15 THEN '8–15'
                ELSE '16+' END AS "дарс дар рӯз"
    FROM "UserProgress" up JOIN "User" u ON u.id = up."userId" AND ${REAL}
    WHERE up."isCompleted" GROUP BY 1, 2
  ) x GROUP BY 1 ORDER BY 1`));

H('D2. Вақт аз рӯи НАВЪИ машқ (кадомаш дилгиркунанда/дароз аст)');
T(await q(`
  SELECT le."skillType" AS skill, COUNT(*)::int AS n,
         ROUND(AVG(up."timeSpent"))::int AS "сония",
         ROUND(AVG(up.accuracy))::int AS "дақиқӣ%"
  FROM "UserProgress" up
  JOIN "Lesson" le ON le.id = up."lessonId"
  JOIN "User" u ON u.id = up."userId" AND ${REAL}
  WHERE up."isCompleted" GROUP BY 1 ORDER BY n DESC`));

// ── E. Пейвол ва обуна ─────────────────────────────────────────────────────
H('E. ПЕЙВОЛ: кӣ дид, кӣ пахш кард');
T(await q(`
  SELECT pe.action, pe.trigger, COUNT(*)::int AS n, COUNT(DISTINCT pe."userId")::int AS "корбар"
  FROM "PaywallEvent" pe JOIN "User" u ON u.id = pe."userId" AND ${REAL}
  GROUP BY 1, 2 ORDER BY n DESC LIMIT 20`));

H('E2. Обуна ва пардохт');
T(await q(`
  SELECT COUNT(*) FILTER (WHERE u."isPremium")::int AS "premium",
         COUNT(*) FILTER (WHERE u."premiumPlan" = 'promo')::int AS "промо",
         COUNT(*) FILTER (WHERE u."premiumPlan" IN ('monthly','sixmonths','yearly','lifetime'))::int AS "пулакӣ",
         (SELECT COUNT(*)::int FROM "PaymentTransaction" pt WHERE pt.status='success') AS "пардохти муваффақ",
         (SELECT COUNT(*)::int FROM "PaymentTransaction") AS "ҳама пардохт"
  FROM "User" u WHERE ${REAL}`));

H('E3. Пейволро дидагон баъдтар чӣ карданд');
T(await q(`
  WITH seen AS (
    SELECT DISTINCT pe."userId" FROM "PaywallEvent" pe
    JOIN "User" u ON u.id = pe."userId" AND ${REAL} WHERE pe.action = 'shown'
  )
  SELECT COUNT(*)::int AS "пейволро диданд",
         COUNT(*) FILTER (WHERE u."isPremium")::int AS "premium шуданд",
         COUNT(*) FILTER (WHERE EXISTS (
            SELECT 1 FROM "UserProgress" up WHERE up."userId"=u.id AND up."isCompleted"
              AND up."completedAt" > (SELECT MAX(pe2."createdAt") FROM "PaywallEvent" pe2 WHERE pe2."userId"=u.id)
         ))::int AS "баъди пейвол боз хонданд"
  FROM seen s JOIN "User" u ON u.id = s."userId"`));

// ── F. Овози корбар ────────────────────────────────────────────────────────
H('F. ФИКРИ ХОНАНДАГОН');
T(await q(`
  SELECT f.rating, COUNT(*)::int AS n FROM "Feedback" f
  JOIN "User" u ON u.id = f."userId" AND ${REAL} GROUP BY 1 ORDER BY 1`));
const msgs = await q(`
  SELECT f.rating, f."lessonsCompleted" AS les, LEFT(f.message, 160) AS msg
  FROM "Feedback" f JOIN "User" u ON u.id = f."userId" AND ${REAL}
  WHERE f.message IS NOT NULL AND length(trim(f.message)) > 1
  ORDER BY f.rating, f."createdAt" DESC LIMIT 30`);
for (const m of msgs) console.log(`  ${'★'.repeat(m.rating)}${'·'.repeat(5 - m.rating)} (${m.les} дарс) ${m.msg}`);

// ── G. Пуш ва баргардонӣ ───────────────────────────────────────────────────
H('G. ПУШ: фиристода шуд ↔ кушода шуд');
T(await q(`
  SELECT ps.status, COUNT(*)::int AS n,
         COUNT(*) FILTER (WHERE ps."openedAt" IS NOT NULL)::int AS "кушод",
         COUNT(DISTINCT ps."userId")::int AS "корбар"
  FROM "PushSend" ps JOIN "User" u ON u.id = ps."userId" AND ${REAL}
  GROUP BY 1 ORDER BY n DESC`));
T(await q(`
  SELECT COUNT(*)::int AS "корбари воқеӣ",
         COUNT(*) FILTER (WHERE EXISTS (SELECT 1 FROM "DeviceToken" dt WHERE dt."userId"=u.id))::int AS "дастгоҳ дорад",
         COUNT(*) FILTER (WHERE u."pushEnabled")::int AS "пуш фаъол"
  FROM "User" u WHERE ${REAL}`));

// ── H. Бахшҳои дигар ───────────────────────────────────────────────────────
H('H. Кадом бахшҳо умуман истифода мешаванд');
T(await q(`
  SELECT
    (SELECT COUNT(DISTINCT up."userId")::int FROM "UserProgress" up JOIN "User" u ON u.id=up."userId" AND ${REAL}) AS "дарс",
    (SELECT COUNT(DISTINCT sp."userId")::int FROM "SpeakingProgress" sp JOIN "User" u ON u.id=sp."userId" AND ${REAL}) AS "гуфтор",
    (SELECT COUNT(DISTINCT lp."userId")::int FROM "LibraryProgress" lp JOIN "User" u ON u.id=lp."userId" AND ${REAL}) AS "китобхона",
    (SELECT COUNT(DISTINCT sc."userId")::int FROM "SrsCard" sc JOIN "User" u ON u.id=sc."userId" AND ${REAL}) AS "такрор",
    (SELECT COUNT(DISTINCT dt."userId")::int FROM "DailyTask" dt JOIN "User" u ON u.id=dt."userId" AND ${REAL}) AS "вазифаи рӯз",
    (SELECT COUNT(DISTINCT lm."userId")::int FROM "LeagueMember" lm JOIN "User" u ON u.id=lm."userId" AND ${REAL}) AS "лига"`));

await p.$disconnect();
