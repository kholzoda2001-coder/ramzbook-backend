import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/progress?courseId=<id>
 *
 * Returns course-level progress for the authenticated user:
 * - completedLessonIds: string[]
 * - totalLessons: number
 * - completedLessons: number
 * - percentComplete: number (0–100)
 * - modules: { id, title, completedLessons, totalLessons, percentComplete }[]
 */
export async function GET(req: NextRequest) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    // Fetch the course with its modules and lessons
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              select: { id: true, title: true, order: true },
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Gather all lesson IDs in this course
    const allLessonIds = course.modules.flatMap((m) => m.lessons.map((l) => l.id));

    // Fetch user progress for all lessons in this course
    const progressRecords = await prisma.userProgress.findMany({
      where: {
        userId: user.id,
        lessonId: { in: allLessonIds },
        isCompleted: true,
      },
      select: { lessonId: true, accuracy: true, xpEarned: true, completedAt: true },
    });

    const completedLessonIds = new Set(progressRecords.map((p) => p.lessonId));

    // Build per-module stats
    const modules = course.modules.map((module) => {
      const totalLessons = module.lessons.length;
      const completedLessons = module.lessons.filter((l) => completedLessonIds.has(l.id)).length;
      return {
        id: module.id,
        title: module.title,
        totalLessons,
        completedLessons,
        percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      };
    });

    const totalLessons = allLessonIds.length;
    const completedLessons = completedLessonIds.size;

    return NextResponse.json({
      courseId,
      completedLessonIds: Array.from(completedLessonIds),
      totalLessons,
      completedLessons,
      percentComplete: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      modules,
    });
  } catch (error: any) {
    console.error('[users/progress]', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
