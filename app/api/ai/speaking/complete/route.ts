import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { awardXp } from '@/lib/xp';
import { updateDailyTasks } from '@/lib/dailyTasks';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/complete
 * body: { categoryId, sentencesSpoken, newWords, seconds, xpEarned }
 *
 * Боби гуфтор тамом шуд.
 *
 * ⚠️ Ба `UserProgress` ЧИЗЕ НАМЕНАВИСАД — вагарна машқи гуфтор дарсҳои роҳнамои
 * A1–B1-ро «гузашта» мекард ва қулфҳоро бе дидани дарс мекушод. Прогресси
 * спикинг дар `SpeakingProgress` алоҳида нигоҳ дошта мешавад.
 *
 * XP/streak/вазифаҳои рӯзона бошанд, ҳамон қубури УМУМИИ мавҷуда мемонанд
 * (`awardXp` + `updateDailyTasks`) — то ҳисоби ягона вайрон нашавад.
 *
 * XP-и клиент ТАВСИЯ аст, на ҳукм: он бо шумораи ибораҳои худи боб маҳдуд
 * мешавад, то такрор ё дархости сохта XP-ро сунъӣ насозад.
 */

/** Ҳадди XP барои як ҷумла — ҳамон қимате, ки клиент истифода мебарад. */
const XP_PER_SENTENCE = 10;

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json()) as {
      categoryId?: string;
      sentencesSpoken?: number;
      newWords?: number;
      seconds?: number;
      xpEarned?: number;
    };

    const categoryId = body.categoryId?.trim();
    if (!categoryId) {
      return NextResponse.json(
        { error: 'categoryId is required.' },
        { status: 400 },
      );
    }

    const sentencesSpoken = Math.max(0, Math.round(body.sentencesSpoken ?? 0));
    const newWords = Math.max(0, Math.round(body.newWords ?? 0));
    const seconds = Math.max(0, Math.round(body.seconds ?? 0));

    const category = await prisma.speakingCategory.findUnique({
      where: { id: categoryId },
      select: { id: true, _count: { select: { items: true } } },
    });
    if (!category) {
      return NextResponse.json(
        { error: 'Speaking category not found.' },
        { status: 404 },
      );
    }

    // Сақфи XP = чанд ибора дар боб ҳаст. Бештар аз ин кас гирифта наметавонад.
    const ceiling = category._count.items * XP_PER_SENTENCE;
    const requestedXp = Math.max(0, Math.round(body.xpEarned ?? 0));
    const awardAmount = Math.min(requestedXp || ceiling, ceiling);

    const prior = await prisma.speakingProgress.findUnique({
      where: { userId_categoryId: { userId, categoryId } },
      select: { id: true },
    });
    const firstCompletion = !prior;

    await prisma.speakingProgress.upsert({
      where: { userId_categoryId: { userId, categoryId } },
      create: {
        userId,
        categoryId,
        timesCompleted: 1,
        xpEarned: awardAmount,
        timeSpent: seconds,
      },
      update: {
        timesCompleted: { increment: 1 },
        // Танҳо бори АВВАЛ XP менависем — такрор XP намедиҳад.
        xpEarned: { increment: firstCompletion ? awardAmount : 0 },
        timeSpent: { increment: seconds },
        completedAt: new Date(),
      },
    });

    let award: Awaited<ReturnType<typeof awardXp>> | null = null;

    if (firstCompletion) {
      award = await awardXp(userId, awardAmount, 'speaking');
      await updateDailyTasks(userId, {
        lessons: 1,
        words: newWords,
        xp: awardAmount,
      });
    }

    return NextResponse.json({
      ok: true,
      firstCompletion,
      sentencesSpoken,
      xpEarned: firstCompletion ? awardAmount : 0,
      totalXp: award?.totalXp,
      weeklyXp: award?.weeklyXp,
      streak: award?.streak,
      newAchievements: award?.newAchievements ?? [],
    });
  } catch (err) {
    console.error('[ai/speaking/complete] POST failed:', err);
    return apiError('Failed to save the speaking lesson.');
  }
}
