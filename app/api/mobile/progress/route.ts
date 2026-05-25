import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { awardXp } from '@/lib/xp';
import { updateDailyTasks } from '@/lib/dailyTasks';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = await req.json() as {
      lessonId?: string;
      isCompleted?: boolean;
      accuracy?: number;
      xpEarned?: number;
      timeSpent?: number;
      heartsLost?: number;
      // Backward compatibility fields
      productId?: string;
      lastReadPageIndex?: number;
    };

    // If mobile app is still sending old format, just return success 
    // without crashing, until it's updated
    if (body.productId && !body.lessonId) {
       return NextResponse.json({ ok: true, backwardCompatible: true });
    }

    const { lessonId, isCompleted = true, accuracy = 100, xpEarned = 10, timeSpent = 60, heartsLost = 0 } = body;

    if (!lessonId) {
      return NextResponse.json(
        { error: 'lessonId is required.' },
        { status: 400 }
      );
    }

    // Verify the lesson exists (include word count for daily-task tracking)
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, xpReward: true, _count: { select: { words: true } } },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
    }

    // Was this lesson already completed before? (first completion drives streak/tasks)
    const prior = await prisma.userProgress.findUnique({
      where: { userId_lessonId: { userId, lessonId } },
      select: { isCompleted: true },
    });
    const firstCompletion = isCompleted && !prior?.isCompleted;

    const awardAmount = xpEarned || lesson.xpReward;

    // Upsert UserProgress
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        isCompleted,
        accuracy,
        xpEarned: isCompleted ? awardAmount : 0,
        timeSpent,
        heartsLost,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: isCompleted ? true : undefined,
        accuracy: isCompleted ? Math.max(accuracy, 0) : undefined,
        // Only credit XP on the FIRST completion to avoid farming by replaying.
        xpEarned: { increment: firstCompletion ? awardAmount : 0 },
        timeSpent: { increment: timeSpent },
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    let awardResult: Awaited<ReturnType<typeof awardXp>> | null = null;

    if (isCompleted) {
      // Hearts deduction (kept separate from XP pipeline)
      if (heartsLost > 0) {
        const currentUser = await prisma.user.findUnique({
          where: { id: userId },
          select: { hearts: true },
        });
        const currentHearts = currentUser?.hearts ?? 5;
        await prisma.user.update({
          where: { id: userId },
          data: { hearts: Math.max(0, currentHearts - heartsLost) },
        });
      }

      if (firstCompletion) {
        // Central XP pipeline: totals + daily log + streak + achievements
        awardResult = await awardXp(userId, awardAmount, 'lesson');

        // Daily quests: +1 lesson, +N words, +XP
        await updateDailyTasks(userId, {
          lessons: 1,
          words: lesson._count.words,
          xp: awardAmount,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      progress,
      totalXp: awardResult?.totalXp,
      weeklyXp: awardResult?.weeklyXp,
      streak: awardResult?.streak,
      newAchievements: awardResult?.newAchievements ?? [],
    });
  } catch (err) {
    console.error('[progress]', err);
    return apiError('Failed to update progress');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
