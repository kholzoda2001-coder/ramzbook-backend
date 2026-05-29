import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/comprehensions?courseId=XXX
 * Light list of active comprehension exercises for a course (reading/listening
 * cards). No passage/questions body — only metadata + a question count.
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const exercises = await prisma.comprehensionExercise.findMany({
      where: { courseId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        course: { select: { level: true } },
        _count: { select: { questions: true } },
      },
    });

    const result = exercises.map((e) => ({
      id: e.id,
      title: e.title,
      titleTranslated: e.titleTranslated,
      kind: e.kind,
      emoji: e.emoji,
      cefrLevel: e.cefrLevel ?? e.course.level,
      isPremium: e.isPremium,
      order: e.order,
      hasAudio: !!e.audioUrl,
      questionCount: e._count.questions,
    }));

    return NextResponse.json({ comprehensions: result });
  } catch (err: any) {
    console.error('[mobile/comprehensions]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
