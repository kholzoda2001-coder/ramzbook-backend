import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/** GET /api/admin/modules/:id — module with lessons */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const module = await prisma.module.findUnique({
      where: { id: params.id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { words: true } } },
        },
      },
    });
    if (!module) return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    return NextResponse.json({ module });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/modules/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.module.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleTranslated !== undefined && { titleTranslated: body.titleTranslated.trim() }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() }),
        ...(body.color !== undefined && { color: body.color.trim() }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
        ...(body.isBoss !== undefined && { isBoss: body.isBoss }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    revalidatePath('/admin/courses');
    return NextResponse.json({ success: true, module: updated });
  } catch (err: any) {
    console.error('[admin/modules PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/modules/:id — cascades UserProgress, lessons, words */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Delete UserProgress for lessons in this module
      await tx.userProgress.deleteMany({
        where: { lesson: { moduleId: params.id } }
      });

      // 2. Delete module (Lesson → Word cascade via Prisma onDelete)
      await tx.module.delete({ where: { id: params.id } });
    });

    revalidatePath('/admin/courses');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/modules DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
