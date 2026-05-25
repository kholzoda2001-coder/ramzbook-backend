import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { getHearts } from '@/lib/hearts';
import { checkStreakDecay } from '@/lib/xp';
import { checkAndUpdatePremium } from '@/lib/premium';

export async function GET(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Update dynamic stats.
    // NOTE: streak is ADVANCED only when XP is earned (see lib/xp.ts awardXp).
    // Here we only DECAY a broken streak — opening the app must never fake a streak.
    await checkAndUpdatePremium(user.id);
    await checkStreakDecay(user.id);
    const heartsData = await getHearts(user.id);

    // Fetch fresh user data
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        totalXp: true,
        weeklyXp: true,
        gems: true,
        streak: true,
        longestStreak: true,
        streakFreezesAvailable: true,
        streakFreezesUsed: true,
        level: true,
        isPremium: true,
        premiumPlan: true,
        premiumExpiresAt: true,
      },
    });

    if (!freshUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...freshUser,
      hearts: heartsData.hearts,
      maxHearts: heartsData.maxHearts,
      nextRegenSeconds: heartsData.nextRegenSeconds,
    });
  } catch (error: any) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}
