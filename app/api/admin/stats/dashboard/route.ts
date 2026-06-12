import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats/dashboard
 * Returns aggregate platform statistics for the admin dashboard.
 */
export async function GET() {
  try {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOf30DaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOf7DaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

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
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { createdAt: { gte: startOf7DaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: startOf30DaysAgo } } }),
      prisma.user.count({ where: { OR: [{ isPremium: true }, { subscriptionTier: 'premium' }] } }),
      prisma.user.count({ where: { lastActiveAt: { gte: startOfToday } } }),
      prisma.user.count({ where: { lastActiveAt: { gte: startOf7DaysAgo } } }),
      prisma.lesson.count({ where: { isActive: true } }),
      prisma.word.count(),
      prisma.course.count({ where: { isActive: true } }),
      prisma.module.count({ where: { isActive: true } }),
      prisma.userProgress.count({ where: { completedAt: { gte: startOfToday } } }),
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
