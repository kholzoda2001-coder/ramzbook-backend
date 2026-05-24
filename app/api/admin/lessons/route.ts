import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/lessons?moduleId=X — lessons for a module
 * GET /api/admin/lessons?courseId=X — all lessons across a course's modules
 * GET /api/admin/lessons            — all lessons (limited)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const moduleId = searchParams.get('moduleId');
    const courseId = searchParams.get('courseId');

    if (moduleId) {
      const lessons = await prisma.lesson.findMany({
        where: { moduleId },
        orderBy: { order: 'asc' },
        include: { _count: { select: { words: true } } },
      });
      return NextResponse.json({ lessons });
    }

    if (courseId) {
      const modules = await prisma.module.findMany({
        where: { courseId },
        orderBy: { order: 'asc' },
        include: {
          lessons: {
            orderBy: { order: 'asc' },
            include: { _count: { select: { words: true } } },
          },
        },
      });
      const lessons = modules.flatMap(m => m.lessons.map(l => ({ ...l, moduleTitle: m.title })));
      return NextResponse.json({ lessons });
    }

    const lessons = await prisma.lesson.findMany({
      take: 200,
      orderBy: { order: 'asc' },
      include: {
        module: { select: { title: true, course: { select: { title: true, level: true } } } },
        _count: { select: { words: true } },
      },
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
