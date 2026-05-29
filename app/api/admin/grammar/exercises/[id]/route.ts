import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isGrammarExerciseType, normalizeOptions } from '@/lib/grammar';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/grammar/exercises/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.grammarExercise.update({
      where: { id: params.id },
      data: {
        ...(body.type !== undefined && isGrammarExerciseType(body.type) && { type: body.type }),
        ...(body.prompt !== undefined && { prompt: body.prompt.trim() }),
        ...(body.answer !== undefined && { answer: body.answer.trim() }),
        ...(body.promptTranslated !== undefined && { promptTranslated: body.promptTranslated?.trim() || null }),
        ...(body.options !== undefined && { options: normalizeOptions(body.options) ?? undefined }),
        ...(body.explanation !== undefined && { explanation: body.explanation?.trim() || null }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json({ success: true, exercise: updated });
  } catch (err: any) {
    console.error('[admin/grammar/exercises PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/grammar/exercises/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.grammarExercise.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/grammar/exercises DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
