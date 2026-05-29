import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/comprehensions?courseId=X — comprehension exercises for a
 * course (or all). Returns light rows with question counts for the admin list.
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId') || undefined;
    const comprehensions = await prisma.comprehensionExercise.findMany({
      where: { courseId },
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { questions: true } },
        course: {
          select: {
            id: true, level: true, emoji: true,
            targetLanguage: { select: { flag: true, name: true } },
            nativeLanguage: { select: { flag: true, nativeName: true } },
          },
        },
      },
    });
    return NextResponse.json({ comprehensions });
  } catch (err: any) {
    console.error('[admin/comprehensions GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/comprehensions — create a comprehension exercise.
 * Body: { courseId, title, titleTranslated?, passage, passageTranslated?, kind?,
 *         audioUrl?, cefrLevel?, emoji?, order?, isPremium? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      courseId?: string;
      title?: string;
      titleTranslated?: string;
      passage?: string;
      passageTranslated?: string;
      kind?: string;
      audioUrl?: string;
      cefrLevel?: string;
      emoji?: string;
      order?: number;
      isPremium?: boolean;
    };

    const title = (body.title ?? '').trim();
    const passage = (body.passage ?? '').trim();
    if (!body.courseId || !title || !passage) {
      return NextResponse.json({ error: 'courseId, title and passage are required' }, { status: 400 });
    }

    const kind = body.kind === 'listening' ? 'listening' : 'reading';
    const order = body.order ?? (await prisma.comprehensionExercise.count({ where: { courseId: body.courseId } }));

    const comprehension = await prisma.comprehensionExercise.create({
      data: {
        courseId: body.courseId,
        title,
        titleTranslated: (body.titleTranslated ?? title).trim(),
        passage,
        passageTranslated: body.passageTranslated?.trim() || null,
        kind,
        audioUrl: body.audioUrl?.trim() || null,
        cefrLevel: normalizeCefrLevel(body.cefrLevel) ?? null,
        emoji: body.emoji?.trim() || '📖',
        order,
        isPremium: body.isPremium ?? false,
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, comprehension });
  } catch (err: any) {
    console.error('[admin/comprehensions POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
