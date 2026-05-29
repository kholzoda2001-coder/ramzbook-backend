import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/phrases?courseId=X — phrase collections for a course (or all).
 * Returns light rows with phrase counts for the admin list.
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId') || undefined;
    const collections = await prisma.phraseCollection.findMany({
      where: { courseId },
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { phrases: true } },
        course: {
          select: {
            id: true, level: true, emoji: true,
            targetLanguage: { select: { flag: true, name: true } },
            nativeLanguage: { select: { flag: true, nativeName: true } },
          },
        },
      },
    });
    return NextResponse.json({ collections });
  } catch (err: any) {
    console.error('[admin/phrases GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/phrases — create a phrase collection.
 * Body: { courseId, title, titleTranslated, category?, cefrLevel?, emoji?, order?, isPremium? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      courseId?: string;
      title?: string;
      titleTranslated?: string;
      category?: string;
      cefrLevel?: string;
      emoji?: string;
      order?: number;
      isPremium?: boolean;
    };

    const title = (body.title ?? '').trim();
    if (!body.courseId || !title) {
      return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 });
    }

    const order = body.order ?? (await prisma.phraseCollection.count({ where: { courseId: body.courseId } }));

    const collection = await prisma.phraseCollection.create({
      data: {
        courseId: body.courseId,
        title,
        titleTranslated: (body.titleTranslated ?? title).trim(),
        category: body.category?.trim() || null,
        cefrLevel: normalizeCefrLevel(body.cefrLevel) ?? null,
        emoji: body.emoji?.trim() || '💬',
        order,
        isPremium: body.isPremium ?? false,
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, collection });
  } catch (err: any) {
    console.error('[admin/phrases POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
