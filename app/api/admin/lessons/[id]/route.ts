import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/admin/lessons/:id — lesson with words */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.id },
      include: { words: { orderBy: { order: 'asc' } } },
    });
    if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    return NextResponse.json({ lesson });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/lessons/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.lesson.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleTranslated !== undefined && { titleTranslated: body.titleTranslated.trim() }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() }),
        ...(body.xpReward !== undefined && { xpReward: body.xpReward }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ success: true, lesson: updated });
  } catch (err: any) {
    console.error('[admin/lessons PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/lessons/:id — cascades UserProgress, words */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete UserProgress for this lesson
      await tx.userProgress.deleteMany({ where: { lessonId: params.id } });

      // 2. Delete lesson (Word cascade via Prisma onDelete)
      await tx.lesson.delete({ where: { id: params.id } });
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/lessons DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
