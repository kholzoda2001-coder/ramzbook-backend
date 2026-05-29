import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/grammar?courseId=XXX
 * Light list of active grammar topics for a course (for a grammar tab / list).
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const topics = await prisma.grammarTopic.findMany({
      where: { courseId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        course: { select: { level: true } },
        _count: { select: { examples: true, rules: true, exercises: true } },
      },
    });

    const result = topics.map((t) => ({
      id: t.id,
      title: t.title,
      titleTranslated: t.titleTranslated,
      emoji: t.emoji,
      cefrLevel: t.cefrLevel ?? t.course.level,
      isPremium: t.isPremium,
      order: t.order,
      exampleCount: t._count.examples,
      ruleCount: t._count.rules,
      exerciseCount: t._count.exercises,
    }));

    return NextResponse.json({ topics: result });
  } catch (err: any) {
    console.error('[mobile/grammar]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
