import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/dialogues?courseId=X — dialogues for a course (or all).
 * Returns light rows with line counts for the admin list.
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId') || undefined;
    const dialogues = await prisma.dialogue.findMany({
      where: { courseId },
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { lines: true } },
        course: {
          select: {
            id: true, level: true, emoji: true,
            targetLanguage: { select: { flag: true, name: true } },
            nativeLanguage: { select: { flag: true, nativeName: true } },
          },
        },
      },
    });
    return NextResponse.json({ dialogues });
  } catch (err: any) {
    console.error('[admin/dialogues GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/dialogues — create a dialogue.
 * Body: { courseId, title, titleTranslated, scenario?, cefrLevel?, emoji?, order?, isPremium? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      courseId?: string;
      title?: string;
      titleTranslated?: string;
      scenario?: string;
      cefrLevel?: string;
      emoji?: string;
      order?: number;
      isPremium?: boolean;
    };

    const title = (body.title ?? '').trim();
    if (!body.courseId || !title) {
      return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 });
    }

    const order = body.order ?? (await prisma.dialogue.count({ where: { courseId: body.courseId } }));

    const dialogue = await prisma.dialogue.create({
      data: {
        courseId: body.courseId,
        title,
        titleTranslated: (body.titleTranslated ?? title).trim(),
        scenario: body.scenario?.trim() || null,
        cefrLevel: normalizeCefrLevel(body.cefrLevel) ?? null,
        emoji: body.emoji?.trim() || '🎙️',
        order,
        isPremium: body.isPremium ?? false,
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, dialogue });
  } catch (err: any) {
    console.error('[admin/dialogues POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
