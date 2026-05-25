import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { ensureAchievementsSeeded, computeMetrics } from '@/lib/achievements';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/achievements
 * Returns every achievement with the user's earned status + live progress
 * toward the unlock condition (so the UI can render progress bars on locked ones).
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await ensureAchievementsSeeded();

    const [all, earned, metrics] = await Promise.all([
      prisma.achievement.findMany(),
      prisma.userAchievement.findMany({ where: { userId: me.id } }),
      computeMetrics(me.id),
    ]);

    const earnedMap = new Map(earned.map((e) => [e.achievementId, e.earnedAt]));

    const achievements = all
      .map((a) => {
        const metric = (metrics as Record<string, number>)[a.conditionType] ?? 0;
        const isEarned = earnedMap.has(a.id);
        return {
          code: a.code,
          name: a.name,
          nameTranslations: a.nameTranslations,
          emoji: a.emoji,
          description: a.description,
          descriptionTranslations: a.descriptionTranslations,
          rarity: a.rarity,
          conditionType: a.conditionType,
          conditionValue: a.conditionValue,
          gemsReward: a.gemsReward,
          xpReward: a.xpReward,
          earned: isEarned,
          earnedAt: earnedMap.get(a.id) ?? null,
          progress: Math.min(metric, a.conditionValue),
          target: a.conditionValue,
        };
      })
      // earned first, then by how close to unlocking, then by reward size
      .sort((a, b) => {
        if (a.earned !== b.earned) return a.earned ? -1 : 1;
        const ra = a.progress / a.target;
        const rb = b.progress / b.target;
        if (rb !== ra) return rb - ra;
        return a.conditionValue - b.conditionValue;
      });

    return NextResponse.json({
      achievements,
      earnedCount: earned.length,
      total: all.length,
    });
  } catch (error) {
    console.error('[achievements]', error);
    return NextResponse.json({ error: 'Failed to load achievements' }, { status: 500 });
  }
}
