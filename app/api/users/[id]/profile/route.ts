import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import {
  WEEK_DAYS,
  coursePercent,
  presence,
  publicName,
  weekStrip,
} from '@/lib/profile/publicProfile';
import { liveStreak } from '@/lib/streakDisplay';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/[id]/profile — профили ҶАМЪИЯТИИ як хонанда.
 *
 * Клик ба ном дар рейтинг ин ҷо меояд. Ҷавоб маҳз он чизест, ки варақаи
 * профил мекашад: сарлавҳа, се рақами калон, муқоисаи ҳафтагӣ, курсҳо,
 * навори ҳафта ва мукофотҳо.
 *
 * ── Махфият ────────────────────────────────────────────────────────────────
 * `select` ошкоро аст ва `email`/`phone`/`passwordHash`/обуна/пардохт ба он
 * НАМЕДАРОЯД. Ном тавассути `publicName` мегузарад, то корбаре, ки ба ҷои
 * ном почта навиштааст, онро ба ҳама нишон надиҳад.
 *
 * ⚠️ Даромад танҳо бо логин. Бе `authenticate` ин роут рӯйхати ҳамаи
 * корбарони барномаро барои ҳар каси интернет мекушод.
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const me = await authenticate(req);
    if (!me) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const now = new Date();

    // ── 1. Худи корбар ────────────────────────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        avatarUrl: true,
        country: true,
        nativeLang: true,
        targetLang: true,
        level: true,
        totalXp: true,
        weeklyXp: true,
        streak: true,
        // Ҳамон сабаб, ки дар рейтинг — силсила ҳангоми хондан ҳисоб мешавад.
        lastActiveDate: true,
        tzOffsetMin: true,
        streakFreezesAvailable: true,
        longestStreak: true,
        isPremium: true,
        isActive: true,
        createdAt: true,
        lastStudyAt: true,
      },
    });

    // Корбари ғайрифаъол (худпоккарда ё басташуда) барои дигарон вуҷуд
    // надорад — ҳамон 404, то «ин id ҳаст, вале баста аст» маълум нашавад.
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const since = new Date(now.getTime());
    since.setUTCDate(since.getUTCDate() - (WEEK_DAYS - 1));
    since.setUTCHours(0, 0, 0, 0);

    // ── 2. Он чизе, ки ба ҳам вобаста НЕСТ — якҷоя ────────────────────────
    const [meRow, daily, langs, earned, totalAchievements] = await Promise.all([
      // Барои сатри «Шумо ва Ӯ — ин ҳафта».
      prisma.user.findUnique({
        where: { id: me.id },
        select: { weeklyXp: true, nativeLang: true },
      }),
      prisma.dailyXp.findMany({
        where: { userId: id, date: { gte: since } },
        select: { date: true, xp: true },
        orderBy: { date: 'asc' },
      }),
      prisma.userLanguage.findMany({
        where: { userId: id },
        select: {
          currentLevel: true,
          xp: true,
          isCurrent: true,
          language: {
            select: { code: true, nativeName: true, flag: true, isActive: true },
          },
        },
        orderBy: [{ isCurrent: 'desc' }, { xp: 'desc' }],
      }),
      prisma.userAchievement.findMany({
        where: { userId: id },
        select: {
          earnedAt: true,
          achievement: {
            select: {
              code: true,
              emoji: true,
              nameTranslations: true,
              name: true,
              rarity: true,
            },
          },
        },
        orderBy: { earnedAt: 'desc' },
      }),
      prisma.achievement.count(),
    ]);

    // ── 3. Фоизи ҳар курс ─────────────────────────────────────────────────
    // Курс ба ҶУФТИ забон вобаста аст, пас забони модарии ХУДИ соҳиби профил
    // гирифта мешавад — на аз бинанда. Вагарна корбари русзабон профили
    // тоҷикзабонро бо фоизи бегона мебинад.
    const active = langs.filter((l) => l.language?.isActive !== false);
    const courses = await Promise.all(
      active.map(async (l) => {
        const scope = {
          module: {
            course: {
              targetLanguage: { code: l.language.code },
              nativeLanguage: { code: user.nativeLang },
            },
          },
        };
        const [done, total] = await Promise.all([
          prisma.userProgress.count({
            where: { userId: id, isCompleted: true, lesson: scope },
          }),
          prisma.lesson.count({
            where: {
              isActive: true,
              module: {
                isActive: true,
                course: { isActive: true, ...scope.module.course },
              },
            },
          }),
        ]);
        return {
          code: l.language.code,
          name: l.language.nativeName,
          flag: l.language.flag,
          level: l.currentLevel,
          xp: l.xp,
          percent: coursePercent(done, total),
          isCurrent: l.isCurrent,
        };
      }),
    );

    return NextResponse.json({
      id: user.id,
      name: publicName(user.name),
      avatarUrl: user.avatarUrl,
      country: user.country,
      isPro: user.isPremium,
      isYou: user.id === me.id,
      joinedAt: user.createdAt.toISOString(),
      presence: presence(user.lastStudyAt, now),

      // Се рақами калон. `level` дар RAMZ CEFR аст (A1/A2/B1) — сатҳи
      // рақамӣ дар ин барнома вуҷуд надорад.
      // `streak` — силсилаи ЗИНДА (0, агар имрӯз/дирӯз фаъол набошад);
      // `longestStreak` рекорди таърихист ва бетағйир мемонад.
      streak: liveStreak(user, now),
      longestStreak: user.longestStreak,
      level: user.level,
      totalXp: user.totalXp,

      week: {
        // Муқоиса ҳамеша ҷуфт аст: бе рақами БИНАНДА сутуни «Шумо» холӣ
        // мемонад ва блоки муқоиса маъно надорад.
        you: meRow?.weeklyXp ?? 0,
        them: user.weeklyXp,
        days: weekStrip(daily, now),
      },

      courses,

      achievements: {
        earned: earned.length,
        total: totalAchievements,
        items: earned.slice(0, 8).map((a) => ({
          code: a.achievement.code,
          emoji: a.achievement.emoji,
          name: a.achievement.name,
          nameTranslations: a.achievement.nameTranslations,
          rarity: a.achievement.rarity,
          earnedAt: a.earnedAt.toISOString(),
        })),
      },
    });
  } catch (error) {
    console.error('[user profile]', error);
    return NextResponse.json({ error: 'Failed to load profile' }, { status: 500 });
  }
}
