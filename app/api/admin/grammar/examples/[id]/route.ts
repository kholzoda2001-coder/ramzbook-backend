import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/grammar/examples/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.grammarExample.update({
      where: { id: params.id },
      data: {
        ...(body.sentence !== undefined && { sentence: body.sentence.trim() }),
        ...(body.translation !== undefined && { translation: body.translation.trim() }),
        ...(body.audioUrl !== undefined && { audioUrl: body.audioUrl?.trim() || null }),
        ...(body.highlight !== undefined && { highlight: body.highlight?.trim() || null }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json({ success: true, example: updated });
  } catch (err: any) {
    console.error('[admin/grammar/examples PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/grammar/examples/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.grammarExample.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/grammar/examples DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
