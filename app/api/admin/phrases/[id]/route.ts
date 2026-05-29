import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/** GET /api/admin/phrases/:id — full collection with its phrases */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const collection = await prisma.phraseCollection.findUnique({
      where: { id: params.id },
      include: {
        phrases: { orderBy: { order: 'asc' } },
        course: { select: { id: true, level: true } },
      },
    });
    if (!collection) return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    return NextResponse.json({ collection });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/phrases/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.phraseCollection.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleTranslated !== undefined && { titleTranslated: body.titleTranslated.trim() }),
        ...(body.category !== undefined && { category: body.category?.trim() || null }),
        ...(body.cefrLevel !== undefined && { cefrLevel: normalizeCefrLevel(body.cefrLevel) ?? null }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() || '💬' }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ success: true, collection: updated });
  } catch (err: any) {
    console.error('[admin/phrases PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/phrases/:id — cascades its phrases */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.phraseCollection.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/phrases DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
