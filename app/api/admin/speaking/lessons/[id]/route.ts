import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/speaking/lessons/:id */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const updated = await prisma.speakingLesson.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title?.trim() || null }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ success: true, lesson: updated });
  } catch (err: any) {
    console.error('[admin/speaking/lessons PUT]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/speaking/lessons/:id — воҳидҳояшро низ мебарад (cascade) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.speakingLesson.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/speaking/lessons DELETE]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
