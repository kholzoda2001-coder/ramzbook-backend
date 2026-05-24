import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/** GET /api/admin/courses/:id — course with module tree */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        targetLanguage: true,
        nativeLanguage: true,
        modules: {
          orderBy: { order: 'asc' },
          include: { _count: { select: { lessons: true } } },
        },
      },
    });
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    return NextResponse.json({ course });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/courses/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.course.update({
      where: { id: params.id },
      data: {
        ...(body.level !== undefined && { level: body.level }),
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.description !== undefined && { description: body.description?.trim() || null }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() }),
        ...(body.color !== undefined && { color: body.color.trim() }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    revalidatePath('/admin/courses');
    return NextResponse.json({ success: true, course: updated });
  } catch (err: any) {
    console.error('[admin/courses PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/courses/:id — cascades to modules/lessons/words */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.course.delete({ where: { id: params.id } });
    revalidatePath('/admin/courses');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/courses DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
