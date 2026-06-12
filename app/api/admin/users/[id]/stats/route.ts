import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users/[id]/stats
 * Returns detailed stats for a single user: progress, XP history, achievements.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isPremium: true,
        subscriptionTier: true,
        subscriptionPlan: true,
        subscriptionEndsAt: true,
        totalXp: true,
        weeklyXp: true,
        gems: true,
        level: true,
        hearts: true,
        streak: true,
        longestStreak: true,
        lastActiveAt: true,
        createdAt: true,
        aiConversationsToday: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const [progressCount, completedCount, achievements, xpHistory, payments] =
      await Promise.all([
        prisma.userProgress.count({ where: { userId: id } }),
        prisma.userProgress.count({ where: { userId: id, isCompleted: true } }),
        prisma.userAchievement.findMany({
          where: { userId: id },
          include: { achievement: { select: { code: true, name: true, emoji: true, rarity: true } } },
          orderBy: { earnedAt: 'desc' },
        }),
        prisma.dailyXp.findMany({
          where: { userId: id },
          orderBy: { date: 'desc' },
          take: 30,
          select: { date: true, xp: true, source: true },
        }),
        prisma.paymentTransaction.findMany({
          where: { userId: id, status: 'success' },
          orderBy: { createdAt: 'desc' },
          select: { id: true, amount: true, currency: true, plan: true, provider: true, createdAt: true },
        }),
      ]);

    return NextResponse.json({
      user,
      progress: {
        lessonsStarted: progressCount,
        lessonsCompleted: completedCount,
        completionRate: progressCount > 0
          ? ((completedCount / progressCount) * 100).toFixed(1)
          : '0.0',
      },
      achievements: achievements.map(ua => ({
        ...ua.achievement,
        earnedAt: ua.earnedAt,
      })),
      xpHistory,
      payments,
    });
  } catch (err: any) {
    console.error('[admin/users/[id]/stats GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
