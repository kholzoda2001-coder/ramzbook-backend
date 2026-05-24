import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

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

    // Verify the lesson exists
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, xpReward: true },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 });
    }

    // Upsert UserProgress
    const progress = await prisma.userProgress.upsert({
      where: { userId_lessonId: { userId, lessonId } },
      create: {
        userId,
        lessonId,
        isCompleted,
        accuracy,
        xpEarned: isCompleted ? (xpEarned || lesson.xpReward) : 0,
        timeSpent,
        heartsLost,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: isCompleted ? true : undefined,
        accuracy: isCompleted ? Math.max(accuracy, 0) : undefined, // keep highest accuracy? or latest
        xpEarned: { increment: isCompleted ? (xpEarned || lesson.xpReward) : 0 },
        timeSpent: { increment: timeSpent },
        completedAt: isCompleted ? new Date() : undefined,
      },
    });

    // Update user's total XP and hearts if they completed the lesson
    if (isCompleted) {
      // First fetch current hearts to compute safe deduction
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { hearts: true },
      });
      const currentHearts = currentUser?.hearts ?? 5;
      const newHearts = heartsLost > 0 ? Math.max(0, currentHearts - heartsLost) : currentHearts;

      await prisma.user.update({
        where: { id: userId },
        data: {
          totalXp: { increment: xpEarned || lesson.xpReward },
          weeklyXp: { increment: xpEarned || lesson.xpReward },
          hearts: newHearts,
          lastActiveAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      ok: true,
      progress
    });
  } catch (err) {
    console.error('[progress]', err);
    return apiError('Failed to update progress');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
