import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const KINDS = ['word', 'sentence'] as const;

/** PUT /api/admin/speaking/items/:id */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const updated = await prisma.speakingItem.update({
      where: { id: params.id },
      data: {
        ...(body.text !== undefined && { text: body.text.trim() }),
        ...(body.translation !== undefined && {
          translation: body.translation.trim(),
        }),
        ...(KINDS.includes(body.kind) && { kind: body.kind }),
        ...(body.literal !== undefined && {
          literal: body.literal?.trim() || null,
        }),
        ...(body.note !== undefined && { note: body.note?.trim() || null }),
        ...(body.audioUrl !== undefined && {
          audioUrl: body.audioUrl?.trim() || null,
        }),
        ...(body.cue !== undefined && { cue: body.cue?.trim() || null }),
        ...(body.cueTranslation !== undefined && {
          cueTranslation: body.cueTranslation?.trim() || null,
        }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error('[admin/speaking/items PUT]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/speaking/items/:id */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.speakingItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/speaking/items DELETE]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
