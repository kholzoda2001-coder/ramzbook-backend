import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/dialogues?courseId=XXX
 * Light list of active dialogues for a course (for a dialogue tab / list).
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const dialogues = await prisma.dialogue.findMany({
      where: { courseId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        course: { select: { level: true } },
        _count: { select: { lines: true } },
      },
    });

    const result = dialogues.map((d) => ({
      id: d.id,
      title: d.title,
      titleTranslated: d.titleTranslated,
      emoji: d.emoji,
      cefrLevel: d.cefrLevel ?? d.course.level,
      isPremium: d.isPremium,
      order: d.order,
      lineCount: d._count.lines,
    }));

    return NextResponse.json({ dialogues: result });
  } catch (err: any) {
    console.error('[mobile/dialogues]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
