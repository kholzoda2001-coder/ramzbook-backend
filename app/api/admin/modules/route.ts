import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/modules?courseId=X — modules for a specific course
 * GET /api/admin/modules             — all modules with course info
 */
export async function GET(req: NextRequest) {
  try {
    const courseId = req.nextUrl.searchParams.get('courseId');
    const modules = await prisma.module.findMany({
      where: courseId ? { courseId } : {},
      orderBy: [{ courseId: 'asc' }, { order: 'asc' }],
      include: {
        _count: { select: { lessons: true } },
        course: {
          select: {
            id: true, title: true, emoji: true, level: true,
            targetLanguage: { select: { flag: true, name: true } },
            nativeLanguage: { select: { flag: true, nativeName: true } },
          },
        },
      },
    });
    return NextResponse.json({ modules });
  } catch (err: any) {
    console.error('[admin/modules GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/modules
 * Body: { courseId, title, titleTranslated, emoji, color, order, isPremium, isBoss }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      courseId: string;
      title: string;
      titleTranslated?: string;
      emoji?: string;
      color?: string;
      order?: number;
      isPremium?: boolean;
      isBoss?: boolean;
    };

    if (!body.courseId || !body.title) {
      return NextResponse.json({ error: 'courseId and title are required' }, { status: 400 });
    }

    const order = body.order ?? (await prisma.module.count({ where: { courseId: body.courseId } }));

    const module = await prisma.module.create({
      data: {
        courseId: body.courseId,
        title: body.title.trim(),
        titleTranslated: (body.titleTranslated ?? body.title).trim(),
        emoji: body.emoji?.trim() || '🎯',
        color: body.color?.trim() || '#10B981',
        order,
        isPremium: body.isPremium ?? false,
        isBoss: body.isBoss ?? false,
        isActive: true,
      },
    });
    revalidatePath('/admin/courses');
    return NextResponse.json({ success: true, module });
  } catch (err: any) {
    console.error('[admin/modules POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
