import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { awardXp } from '@/lib/xp';
import { updateDailyTasks } from '@/lib/dailyTasks';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/complete
 * body: { lessonId, sentencesSpoken, newWords, seconds, xpEarned }
 *
 * Дарси гуфтор тамом шуд. ҚАСДАН ҳамон қубури мавҷуди прогресс истифода
 * мешавад, ки `/api/mobile/progress` дорад — `UserProgress` + `awardXp`
 * (тотал, логи рӯзона, streak, дастовардҳо) + `updateDailyTasks`. Ҳеҷ
 * ҳисоби нави XP/streak ин ҷо сохта намешавад.
 *
 * XP-и клиент ТАВСИЯ аст, на ҳукм: он бо `lesson.xpReward` маҳдуд мешавад,
 * то такрори дарс XP-ро сунъӣ насозад.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json()) as {
      lessonId?: string;
      sentencesSpoken?: number;
      newWords?: number;
      seconds?: number;
      xpEarned?: number;
    };

    const lessonId = body.lessonId?.trim();
    if (!lessonId) {
      return NextResponse.json({ error: 'lessonId is required.' }, { status: 400 });
    }

    const sentencesSpoken = Math.max(0, Math.round(body.sentencesSpoken ?? 0));
    const newWords = Math.max(0, Math.round(body.newWords ?? 0));
    const seconds = Math.max(0, Math.round(body.seconds ?? 0));

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, xpReward: true },
    });
    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
    }

    const requestedXp = Math.max(0, Math.round(body.xpEarned ?? 0));
    const awardAmount = Math.min(requestedXp || lesson.xpReward, lesson.xpReward);

    const prior = await prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { isCompleted: true },
    });
    const firstCompletion = !prior?.isCompleted;

    await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        isCompleted: true,
        accuracy: 100,
        xpEarned: awardAmount,
        timeSpent: seconds,
        heartsLost: 0,
        completedAt: new Date(),
      },
      update: {
        isCompleted: true,
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
