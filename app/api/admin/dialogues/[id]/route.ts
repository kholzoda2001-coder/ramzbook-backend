import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/** GET /api/admin/dialogues/:id — full dialogue with its ordered lines */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const dialogue = await prisma.dialogue.findUnique({
      where: { id: params.id },
      include: {
        lines: { orderBy: { order: 'asc' } },
        course: { select: { id: true, level: true } },
      },
    });
    if (!dialogue) return NextResponse.json({ error: 'Dialogue not found' }, { status: 404 });
    return NextResponse.json({ dialogue });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/dialogues/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.dialogue.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleTranslated !== undefined && { titleTranslated: body.titleTranslated.trim() }),
        ...(body.scenario !== undefined && { scenario: body.scenario?.trim() || null }),
        ...(body.cefrLevel !== undefined && { cefrLevel: normalizeCefrLevel(body.cefrLevel) ?? null }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() || '🎙️' }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ success: true, dialogue: updated });
  } catch (err: any) {
    console.error('[admin/dialogues PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/dialogues/:id — cascades its lines */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.dialogue.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/dialogues DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
