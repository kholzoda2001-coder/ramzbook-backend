import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/lessons?unitId=X — lessons for a unit
 * GET /api/admin/lessons?courseId=X — all lessons for a course
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const unitId = searchParams.get('unitId');
    const courseId = searchParams.get('courseId');

    if (unitId) {
      const lessons = await prisma.lesson.findMany({
        where: { unitId },
        orderBy: { sortOrder: 'asc' },
        include: {
          _count: { select: { words: true } },
        },
      });
      return NextResponse.json({ lessons });
    }

    if (courseId) {
      const units = await prisma.unit.findMany({
        where: { courseId },
        orderBy: { sortOrder: 'asc' },
        include: {
          lessons: {
            orderBy: { sortOrder: 'asc' },
            include: { _count: { select: { words: true } } },
          },
        },
      });
      const lessons = units.flatMap(u => u.lessons.map(l => ({ ...l, unitTitle: u.title })));
      return NextResponse.json({ lessons });
    }

    // Return all lessons (limited)
    const lessons = await prisma.lesson.findMany({
      take: 200,
      orderBy: { sortOrder: 'asc' },
      include: {
        unit: { select: { title: true, course: { select: { title: true, level: true } } } },
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
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      unitId: string;
      title: string;
      emoji?: string;
      xpReward?: number;
      estimatedMin?: number;
      sortOrder?: number;
      isPremium?: boolean;
    };

    if (!body.unitId || !body.title) {
      return NextResponse.json({ error: 'unitId and title are required' }, { status: 400 });
    }

    const lesson = await prisma.lesson.create({
      data: {
        unitId: body.unitId,
        title: body.title.trim(),
        titleTranslations: {
          tg: body.title.trim(),
          ru: body.title.trim(),
          en: body.title.trim(),
          uz: body.title.trim(),
        },
        emoji: body.emoji ?? '📝',
        xpReward: body.xpReward ?? 60,
        estimatedMin: body.estimatedMin ?? 5,
        sortOrder: body.sortOrder ?? 0,
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
