import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/speaking/lessons — дарси нав дар категория.
 * Body: { categoryId, title?, order? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      categoryId?: string;
      title?: string;
      order?: number;
    };

    if (!body.categoryId) {
      return NextResponse.json(
        { error: 'categoryId is required' },
        { status: 400 },
      );
    }

    // Тартиби нав = дар охири ҳамин категория.
    const order =
      body.order ??
      (await prisma.speakingLesson.count({
        where: { categoryId: body.categoryId },
      }));

    const lesson = await prisma.speakingLesson.create({
      data: {
        categoryId: body.categoryId,
        title: body.title?.trim() || null,
        order,
        isActive: true,
      },
      include: { items: true },
    });

    return NextResponse.json({ success: true, lesson });
  } catch (err: any) {
    console.error('[admin/speaking/lessons POST]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
