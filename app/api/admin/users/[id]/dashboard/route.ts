/**
 * GET /api/admin/users/[id]/dashboard
 *
 * ҲАМА чизи як хонанда дар ЯК ҷавоб: кадом забонҳоро мехонад, аз ҳар забон
 * чанд дарс, кадом китобро кушод ва чанд саҳифа хонд, кадом рӯз ва кадом
 * СОАТ машғул шуд, чанд калима ёд гирифт, гуфтор, дастовардҳо, пардохтҳо,
 * пушҳои фиристодашуда.
 *
 * ⚠️ Чаро на `stats`-и кӯҳна: он забонҳоро аз ҷадвали `UserLanguage`
 * мегирифт, ки дар продакшн 0 сатр дорад — яъне ҳамеша рӯйхати холӣ. Ҳақиқат
 * танҳо дар `UserProgress → Lesson → Module → Course → Language` аст
 * (ҳамон камбудие, ки филтрҳои рӯйхатро ҳам вайрон карда буд).
 *
 * Ҳисобҳо дар `lib/admin/userDashboard.ts` — он ҷо тестшавандаанд.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isTestAccount } from '@/lib/admin/realUser';
import { liveStreak, missedDays } from '@/lib/streakDisplay';
import {
  type LangRow, type DayRow, type BookRow,
  buildLanguages, buildDaily, buildHours, buildWeekdays, buildBooks,
  summarize, longestDayStreak, findSyncBursts, dayKey, TZ,
} from '@/lib/admin/userDashboard';

export const dynamic = 'force-dynamic';

type CountRow = { k: string; n: number };

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return NextResponse.json({ error: 'Корбар ёфт нашуд' }, { status: 404 });

    const [
      langRows, wordRows, stamps, dayRows, xpRows,
      books, speaking, speakMistakes, achievements, payments,
      pushes, tokens, paywall, recent, srs, invites,
    ] = await Promise.all([
      // ① Забон × сатҳ × маҳорат — ҳастаи тамоми дашборд
      prisma.$queryRaw<LangRow[]>`
        SELECT tl.code AS code, tl.name AS name, tl.flag AS flag,
               c.level AS level, le."skillType" AS "skillType",
               COUNT(*)::int                       AS lessons,
               COALESCE(SUM(up."xpEarned"),0)::int AS xp,
               COALESCE(SUM(up."timeSpent"),0)::int AS "timeSpent",
               COALESCE(SUM(up.accuracy),0)::int   AS "accuracySum",
               COALESCE(SUM(up."heartsLost"),0)::int AS "heartsLost",
               MAX(up."completedAt")               AS "lastAt"
        FROM "UserProgress" up
        JOIN "Lesson" le ON le.id = up."lessonId"
        JOIN "Module" m  ON m.id  = le."moduleId"
        JOIN "Course" c  ON c.id  = m."courseId"
        JOIN "Language" tl ON tl.id = c."targetLanguageId"
        WHERE up."userId" = ${id} AND up."isCompleted" = true
        GROUP BY 1,2,3,4,5`,

      // ② Калимаҳои ЁДГИРИФТА бо забон. `SrsCard.courseId` дар продакшн
      //    холист, пас забон аз худи калима гирифта мешавад.
      prisma.$queryRaw<CountRow[]>`
        SELECT tl.code AS k, COUNT(*)::int AS n
        FROM "SrsCard" sc
        JOIN "Word" w    ON w.id = sc."itemId"
        JOIN "Lesson" le ON le.id = w."lessonId"
        JOIN "Module" m  ON m.id  = le."moduleId"
        JOIN "Course" c  ON c.id  = m."courseId"
        JOIN "Language" tl ON tl.id = c."targetLanguageId"
        WHERE sc."userId" = ${id} AND sc."itemType" = 'word' AND sc."intervalDays" > 0
        GROUP BY 1`,

      // ③ Вақти ҲАР дарс — барои соат ва рӯзи ҳафта
      prisma.userProgress.findMany({
        where: { userId: id, isCompleted: true, completedAt: { not: null } },
        select: { completedAt: true },
        orderBy: { completedAt: 'desc' },
        take: 5000,
      }),

      // ④ Рӯзҳо (вақти Душанбе — ҳамин ҷо, то соати 23:00 ба рӯзи дигар наафтад)
      prisma.$queryRaw<DayRow[]>`
        SELECT to_char(up."completedAt" + make_interval(mins => ${TZ}::int), 'YYYY-MM-DD') AS day,
               COUNT(*)::int                        AS lessons,
               COALESCE(SUM(up."xpEarned"),0)::int  AS xp,
               COALESCE(SUM(up."timeSpent"),0)::int AS "timeSpent",
               MIN(up."completedAt")                 AS "firstAt",
               MAX(up."completedAt")                 AS "lastAt"
        FROM "UserProgress" up
        WHERE up."userId" = ${id} AND up."isCompleted" = true AND up."completedAt" IS NOT NULL
        GROUP BY 1`,

      prisma.dailyXp.findMany({
        where: { userId: id }, orderBy: { date: 'desc' }, take: 400,
        select: { date: true, xp: true, source: true },
      }),

      prisma.libraryProgress.findMany({
        where: { userId: id },
        include: { item: { select: { title: true, type: true, level: true, targetLang: true } } },
        orderBy: { lastReadAt: 'desc' },
      }),

      prisma.$queryRaw<{ code: string; lessons: number; xp: number; timeSpent: number; lastAt: string | null; category: string }[]>`
        SELECT tl.code AS code, sc.title AS category,
               COALESCE(SUM(sp."timesCompleted"),0)::int AS lessons,
               COALESCE(SUM(sp."xpEarned"),0)::int       AS xp,
               COALESCE(SUM(sp."timeSpent"),0)::int      AS "timeSpent",
               MAX(sp."completedAt")                     AS "lastAt"
        FROM "SpeakingProgress" sp
        JOIN "SpeakingLesson" sl  ON sl.id = sp."lessonId"
        JOIN "SpeakingCategory" sc ON sc.id = sl."categoryId"
        JOIN "Language" tl ON tl.id = sc."targetLanguageId"
        WHERE sp."userId" = ${id}
        GROUP BY 1,2`,

      prisma.speakingMistake.count({ where: { userId: id } }),

      prisma.userAchievement.findMany({
        where: { userId: id },
        include: { achievement: { select: { code: true, name: true, emoji: true, rarity: true } } },
        orderBy: { earnedAt: 'desc' },
      }),

      prisma.paymentTransaction.findMany({
        where: { userId: id },
        orderBy: { createdAt: 'desc' }, take: 50,
        select: { id: true, amount: true, currency: true, plan: true, provider: true, status: true, createdAt: true },
      }),

      prisma.pushSend.findMany({
        where: { userId: id }, orderBy: { createdAt: 'desc' }, take: 25,
        select: { title: true, body: true, status: true, reason: true, createdAt: true, openedAt: true },
      }),

      prisma.deviceToken.findMany({
        where: { userId: id }, orderBy: { updatedAt: 'desc' },
        select: { platform: true, updatedAt: true },
      }),

      prisma.paywallEvent.groupBy({
        by: ['action'], where: { userId: id }, _count: { _all: true },
      }),

      // Бистои охирин — «кадом дарсро кай хонд»
      prisma.$queryRaw<{ title: string; skill: string; level: string; code: string; accuracy: number; xp: number; sec: number; at: string }[]>`
        SELECT le."titleTranslated" AS title, le."skillType" AS skill, c.level AS level,
               tl.code AS code, up.accuracy AS accuracy, up."xpEarned" AS xp,
               up."timeSpent" AS sec, up."completedAt" AS at
        FROM "UserProgress" up
        JOIN "Lesson" le ON le.id = up."lessonId"
        JOIN "Module" m  ON m.id  = le."moduleId"
        JOIN "Course" c  ON c.id  = m."courseId"
        JOIN "Language" tl ON tl.id = c."targetLanguageId"
        WHERE up."userId" = ${id} AND up."isCompleted" = true
        ORDER BY up."completedAt" DESC NULLS LAST
        LIMIT 20`,

      prisma.srsCard.aggregate({
        where: { userId: id },
        _count: { _all: true },
        _sum: { lapses: true, repetitions: true },
      }),

      prisma.friendInvite.count({ where: { creatorUserId: id } }).catch(() => 0),
    ]);

    const now = new Date();
    const today = dayKey(now);

    const wordsByLang: Record<string, number> = {};
    for (const r of wordRows) wordsByLang[r.k] = r.n;

    // `$queryRaw` барои `timestamp` объекти `Date` бармегардонад, вале қабати
    // пок сатри ISO-ро муқоиса мекунад — бе ин мубаддал «фаъолияти охирин»-и
    // забон тасодуфӣ мешуд.
    const iso = (v: unknown) => (v ? new Date(v as string).toISOString() : null);
    const languages = buildLanguages(
      langRows.map((r) => ({ ...r, lastAt: iso(r.lastAt) })),
      wordsByLang,
    );
    const daily = buildDaily(
      dayRows,
      xpRows.map((r) => ({ day: dayKey(r.date), xp: r.xp })),
      today,
      90,
    );
    const marks = stamps.map((s) => s.completedAt!).filter(Boolean);
    const totals = summarize(languages, daily);

    return NextResponse.json({
      user: {
        id: user.id, name: user.name, email: user.email, phone: user.phone,
        avatarUrl: user.avatarUrl, country: user.country,
        interfaceLang: user.interfaceLang, targetLang: user.targetLang,
        isActive: user.isActive, isTest: isTestAccount(user),
        isPremium: user.isPremium && (user.premiumPlan === 'lifetime' ||
          (!!user.premiumExpiresAt && user.premiumExpiresAt >= now)),
        premiumPlan: user.premiumPlan,
        premiumStartedAt: user.premiumStartedAt, premiumExpiresAt: user.premiumExpiresAt,
        totalXp: user.totalXp, weeklyXp: user.weeklyXp, gems: user.gems,
        hearts: user.hearts, level: user.level,
        // Рақами ЗИНДА ва рақами ЯХБАСТА паҳлӯи ҳам — фарқашон худаш маълумот
        // аст (дар продакшн 135 корбар streak > 0 доштанд, зиндааш 33).
        streak: liveStreak(user, now), streakStored: user.streak,
        longestStreak: user.longestStreak,
        missedDays: missedDays(user, now),
        streakFreezesAvailable: user.streakFreezesAvailable,
        tzOffsetMin: user.tzOffsetMin,
        pushEnabled: user.pushEnabled, lastPushAt: user.lastPushAt,
        createdAt: user.createdAt, lastActiveAt: user.lastActiveAt,
        lastActiveDate: user.lastActiveDate, lastStudyAt: user.lastStudyAt,
        leagueTier: user.leagueTier,
        devices: tokens.map((t) => ({ platform: t.platform, updatedAt: t.updatedAt })),
      },
      totals: {
        ...totals,
        srsCards: srs._count._all,
        srsLapses: srs._sum.lapses ?? 0,
        srsReviews: srs._sum.repetitions ?? 0,
        achievements: achievements.length,
        invites,
        speakingMistakes: speakMistakes,
        bestDayStreak: longestDayStreak(marks.map((d) => dayKey(d))),
        firstLessonAt: marks.length ? marks[marks.length - 1] : null,
        lastLessonAt: marks.length ? marks[0] : null,
      },
      languages,
      speaking: speaking.map((s) => ({ ...s, lastAt: iso(s.lastAt), minutes: Math.round(s.timeSpent / 60) })),
      books: buildBooks(books.map((b): BookRow => ({
        title: b.item.title, type: b.item.type, level: b.item.level,
        position: b.position, total: b.total,
        lastReadAt: b.lastReadAt ? b.lastReadAt.toISOString() : null,
      }))),
      daily,
      // Рост гуфтан муҳимтар аз рақами зебо: агар 200 дарс дар 2 дақиқа
      // «анҷом» ёфта бошад, дашборд худаш инро мегӯяд.
      syncBursts: findSyncBursts(
        dayRows.map((r) => ({ ...r, firstAt: iso(r.firstAt), lastAt: iso(r.lastAt) })),
      ),
      hours: buildHours(marks),
      weekdays: buildWeekdays(marks),
      achievements: achievements.map((a) => ({ ...a.achievement, earnedAt: a.earnedAt })),
      payments,
      paywall: Object.fromEntries(paywall.map((p) => [p.action, p._count._all])),
      pushes,
      recent,
    });
  } catch (err: any) {
    console.error('[admin/users/[id]/dashboard]', err?.message);
    return NextResponse.json({ error: err?.message ?? 'Хатои сервер' }, { status: 500 });
  }
}
