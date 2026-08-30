import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { markStudied } from '@/lib/activity';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { awardXp } from '@/lib/xp';
import { updateDailyTasks } from '@/lib/dailyTasks';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/review/complete
 * body: { lessonIds: string[], sentencesSpoken, seconds }
 *
 * Нишасти такрор тамом шуд.
 *
 * Ду кор мекунад:
 *  1. `lastReviewedAt`-и ҳамон дарсҳоро имрӯз мегузорад — навбати такрор
 *     худаш давр мезанад (ниг. `GET /review`);
 *  2. XP медиҳад — вале КАМТАР аз дарси нав.
 *
 * ⚠️ XP-и клиент қабул НАМЕШАВАД. Дар такрор ҳеҷ «дарси нав» нест, ки сақфи
 * табиӣ диҳад, пас сервер худаш аз рӯи шумораи ибораҳои ВОҚЕАН гуфташуда
 * ҳисоб мекунад ва бо як сақфи сахт маҳдуд менамояд. Ин ҳамон модели
 * эътимодест, ки дар `xpDoubledAt` ва `adGems` истифода мешавад.
 *
 * ⚠️ Ба `UserProgress` даст намезанад — прогресси спикинг ҷудост.
 */

/** XP барои як ибораи такроршуда — нисфи дарси нав. */
const XP_PER_SENTENCE = 5;

/** Сақфи як нишасти такрор. */
const MAX_XP = 60;

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json()) as {
      lessonIds?: string[];
      sentencesSpoken?: number;
      seconds?: number;
    };

    const lessonIds = (body.lessonIds ?? [])
      .filter((id): id is string => typeof id === 'string' && id.trim() !== '')
      .slice(0, 20);

    if (lessonIds.length === 0) {
      return NextResponse.json(
        { error: 'lessonIds is required.' },
        { status: 400 },
      );
    }

    const spoken = Math.max(0, Math.round(body.sentencesSpoken ?? 0));
    const seconds = Math.max(0, Math.round(body.seconds ?? 0));

    // Танҳо дарсҳое, ки ХУДИ ҳамин корбар гузаштааст — вагарна як дархости
    // сохта метавонист вақти такрори дарси каси дигарро нав кунад.
    const { count } = await prisma.speakingProgress.updateMany({
      where: { userId, lessonId: { in: lessonIds } },
      data: { lastReviewedAt: new Date(), timeSpent: { increment: seconds } },
    });

    if (count === 0) {
      return NextResponse.json(
        { error: 'No finished lessons matched.' },
        { status: 404 },
      );
    }

    await markStudied(userId);

    const amount = Math.min(spoken * XP_PER_SENTENCE, MAX_XP);
    let award: Awaited<ReturnType<typeof awardXp>> | null = null;

    if (amount > 0) {
      award = await awardXp(userId, amount, 'speaking_review');
      await updateDailyTasks(userId, { xp: amount });
    }

    return NextResponse.json({
      ok: true,
      reviewed: count,
      xpEarned: amount,
      totalXp: award?.totalXp,
      weeklyXp: award?.weeklyXp,
      streak: award?.streak,
      newAchievements: award?.newAchievements ?? [],
    });
  } catch (err) {
    console.error('[ai/speaking/review/complete] POST failed:', err);
    return apiError('Failed to save the review session.');
  }
}
