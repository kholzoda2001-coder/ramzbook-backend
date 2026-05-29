import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/** GET /api/admin/grammar/:id — full topic with examples, rules, exercises */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const topic = await prisma.grammarTopic.findUnique({
      where: { id: params.id },
      include: {
        examples: { orderBy: { order: 'asc' } },
        rules: { orderBy: { order: 'asc' } },
        exercises: { orderBy: { order: 'asc' } },
        course: { select: { id: true, level: true } },
      },
    });
    if (!topic) return NextResponse.json({ error: 'Topic not found' }, { status: 404 });
    return NextResponse.json({ topic });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/grammar/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.grammarTopic.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleTranslated !== undefined && { titleTranslated: body.titleTranslated.trim() }),
        ...(body.explanation !== undefined && { explanation: body.explanation.trim() }),
        ...(body.cefrLevel !== undefined && { cefrLevel: normalizeCefrLevel(body.cefrLevel) ?? null }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() || '🔤' }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    return NextResponse.json({ success: true, topic: updated });
  } catch (err: any) {
    console.error('[admin/grammar PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/grammar/:id — cascades examples/rules/exercises; unlinks lessons */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Lessons referencing this topic get grammarTopicId set to null (onDelete: SetNull).
    await prisma.grammarTopic.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/grammar DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
