import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/** GET /api/admin/comprehensions/:id — full exercise with its ordered questions */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const comprehension = await prisma.comprehensionExercise.findUnique({
      where: { id: params.id },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: { select: { id: true, level: true } },
      },
    });
    if (!comprehension) return NextResponse.json({ error: 'Comprehension not found' }, { status: 404 });
    return NextResponse.json({ comprehension });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/comprehensions/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.comprehensionExercise.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleTranslated !== undefined && { titleTranslated: body.titleTranslated.trim() }),
        ...(body.passage !== undefined && { passage: body.passage.trim() }),
        ...(body.passageTranslated !== undefined && { passageTranslated: body.passageTranslated?.trim() || null }),
        ...(body.kind !== undefined && { kind: body.kind === 'listening' ? 'listening' : 'reading' }),
        ...(body.audioUrl !== undefined && { audioUrl: body.audioUrl?.trim() || null }),
        ...(body.cefrLevel !== undefined && { cefrLevel: normalizeCefrLevel(body.cefrLevel) ?? null }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() || '📖' }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ success: true, comprehension: updated });
  } catch (err: any) {
    console.error('[admin/comprehensions PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/comprehensions/:id — cascades its questions */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.comprehensionExercise.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/comprehensions DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
