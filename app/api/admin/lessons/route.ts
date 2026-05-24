import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Full module→course→languages shape used by the admin lessons UI
const LESSON_INCLUDE = {
  _count: { select: { words: true } },
  module: {
    select: {
      id: true,
      title: true,
      course: {
        select: {
          id: true,
          title: true,
          emoji: true,
          level: true,
          targetLanguage: { select: { flag: true, name: true } },
          nativeLanguage: { select: { flag: true, nativeName: true } },
        },
      },
    },
  },
} as const;

/**
 * GET /api/admin/lessons?moduleId=X — lessons for a module
 * GET /api/admin/lessons?courseId=X — all lessons across a course's modules
 * GET /api/admin/lessons            — all lessons (limited to 500)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const moduleId = searchParams.get('moduleId');
    const courseId = searchParams.get('courseId');

    const where = moduleId ? { moduleId } : courseId ? { module: { courseId } } : {};

    const lessons = await prisma.lesson.findMany({
      where,
      orderBy: { order: 'asc' },
      take: 500,
      include: LESSON_INCLUDE,
    });

    return NextResponse.json({ lessons });
  } catch (err: any) {
    console.error('[admin/lessons GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/lessons — create a lesson
 * Body: { moduleId, title, titleTranslated, type, emoji, xpReward, duration, order, isPremium }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      moduleId: string;
      title: string;
      titleTranslated?: string;
      type?: string;
      emoji?: string;
      xpReward?: number;
      duration?: number;
      order?: number;
      isPremium?: boolean;
    };

    if (!body.moduleId || !body.title) {
      return NextResponse.json({ error: 'moduleId and title are required' }, { status: 400 });
    }

    const order = body.order ?? (await prisma.lesson.count({ where: { moduleId: body.moduleId } }));

    const lesson = await prisma.lesson.create({
      data: {
        moduleId: body.moduleId,
        title: body.title.trim(),
        titleTranslated: (body.titleTranslated ?? body.title).trim(),
        type: body.type ?? 'vocab',
        emoji: body.emoji ?? '📝',
        xpReward: body.xpReward ?? 60,
        duration: body.duration ?? 5,
        order,
        isPremium: body.isPremium ?? false,
        isActive: true,
      },
    });
    return NextResponse.json({ success: true, lesson });
  } catch (err: any) {
    console.error('[admin/lessons POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
