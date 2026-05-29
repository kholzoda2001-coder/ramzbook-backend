import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/dialogues/lines/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.dialogueLine.update({
      where: { id: params.id },
      data: {
        ...(body.speaker !== undefined && { speaker: body.speaker.trim() }),
        ...(body.text !== undefined && { text: body.text.trim() }),
        ...(body.translation !== undefined && { translation: body.translation.trim() }),
        ...(body.audioUrl !== undefined && { audioUrl: body.audioUrl?.trim() || null }),
        ...(body.isUser !== undefined && { isUser: body.isUser }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json({ success: true, line: updated });
  } catch (err: any) {
    console.error('[admin/dialogues/lines PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/dialogues/lines/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.dialogueLine.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/dialogues/lines DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
