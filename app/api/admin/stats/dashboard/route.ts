import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfDayTJ } from '@/lib/admin-time';
import { realUserWhere } from '@/lib/admin/realUser';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats/dashboard
 * Returns aggregate platform statistics for the admin dashboard.
 */
export async function GET() {
  try {
    const now = new Date();
    // Local (Dushanbe) midnight, not the UTC one this server would otherwise
    // compute — see lib/admin-time.ts.
    const startOfToday = startOfDayTJ(now);
    const startOf30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Ҳисобҳои санҷишӣ аз ҳар рақами «корбари воқеӣ» берун мемонанд — на
    // танҳо seed-и `Test User N`, балки роботҳои pre-launch-и Google низ
    // (41 ҳисоб дар 9 сентябри 2026). Таъриф: lib/admin/realUser.ts.
    const realUser = realUserWhere;

    const [
      totalUsers,
      newUsersToday,
      newUsersWeek,
      newUsersMonth,
      premiumUsers,
      activeUsersToday,
      activeUsersWeek,
      totalLessons,
      totalWords,
      totalCourses,
      totalModules,
      completedLessonsToday,
      revenueTotal,
      revenueMonth,
    ] = await Promise.all([
      prisma.user.count({ where: realUser }),
      prisma.user.count({ where: { ...realUser, createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { ...realUser, createdAt: { gte: startOf7DaysAgo } } }),
      prisma.user.count({ where: { ...realUser, createdAt: { gte: startOf30DaysAgo } } }),
      // "Premium" = CURRENTLY premium — `isPremium`/`subscriptionTier` alone
      // over-count anyone who has EVER had premium, since neither field gets
      // reliably cleared on expiry (see lib/premium.ts checkAndUpdatePremium).
      prisma.user.count({
        where: { ...realUser, isPremium: true, OR: [{ premiumPlan: 'lifetime' }, { premiumExpiresAt: { gte: now } }] },
      }),
      prisma.user.count({ where: { ...realUser, lastActiveAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { ...realUser, lastActiveAt: { gte: startOf7DaysAgo } } }),
      prisma.lesson.count({ where: { isActive: true } }),
      prisma.word.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.module.count({ where: { isActive: true } }),
      prisma.userProgress.count({ where: { isCompleted: true, completedAt: { gte: startOfToday }, user: realUser } }),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'success' },
      }),
      prisma.paymentTransaction.aggregate({
        _sum: { amount: true },
        where: { status: 'success', createdAt: { gte: startOf30DaysAgo } },
      }),
    ]);

    return NextResponse.json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisWeek: newUsersWeek,
        newThisMonth: newUsersMonth,
        premium: premiumUsers,
        premiumRate: totalUsers > 0 ? ((premiumUsers / totalUsers) * 100).toFixed(1) : '0.0',
        activeToday: activeUsersToday,
        activeThisWeek: activeUsersWeek,
      },
      content: {
        courses: totalCourses,
        modules: totalModules,
        lessons: totalLessons,
        words: totalWords,
        completedLessonsToday,
      },
      revenue: {
        total: revenueTotal._sum.amount ?? 0,
        lastMonth: revenueMonth._sum.amount ?? 0,
      },
      generatedAt: now.toISOString(),
    });
  } catch (err: any) {
    console.error('[admin/stats/dashboard GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
