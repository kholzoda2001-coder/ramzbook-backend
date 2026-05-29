import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/phrases?courseId=XXX
 * Light list of active phrase collections for a course (for a phrasebook tab).
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId');
    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
    }

    const collections = await prisma.phraseCollection.findMany({
      where: { courseId, isActive: true },
      orderBy: { order: 'asc' },
      include: {
        course: { select: { level: true } },
        _count: { select: { phrases: true } },
      },
    });

    const result = collections.map((col) => ({
      id: col.id,
      title: col.title,
      titleTranslated: col.titleTranslated,
      category: col.category ?? '',
      emoji: col.emoji,
      cefrLevel: col.cefrLevel ?? col.course.level,
      isPremium: col.isPremium,
      order: col.order,
      phraseCount: col._count.phrases,
    }));

    return NextResponse.json({ collections: result });
  } catch (err: any) {
    console.error('[mobile/phrases]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
