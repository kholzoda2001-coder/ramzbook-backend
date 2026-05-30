import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

const PLACEMENT_SKILLS = ['overall', 'reading', 'writing', 'listening', 'speaking', 'grammar', 'vocab'];
function normOptions(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((o) => (typeof o === 'string' ? o.trim() : String(o ?? '').trim())).filter((o) => o.length > 0);
}

/** PUT /api/admin/placement/:id — partial update of one placement question. */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const level = body.cefrLevel !== undefined ? normalizeCefrLevel(body.cefrLevel) : undefined;

    // If options and/or answer change, keep them consistent.
    const options = body.options !== undefined ? normOptions(body.options) : undefined;
    if (options !== undefined && options.length < 2) {
      return NextResponse.json({ error: 'At least 2 options are required' }, { status: 400 });
    }
    const answer = body.answer !== undefined ? (body.answer ?? '').trim() : undefined;
    if (answer !== undefined && options !== undefined && !options.includes(answer)) {
      return NextResponse.json({ error: 'answer must be one of the options' }, { status: 400 });
    }

    const updated = await prisma.placementQuestion.update({
      where: { id: params.id },
      data: {
        ...(level && { cefrLevel: level }),
        ...(body.skill !== undefined && PLACEMENT_SKILLS.includes(body.skill) && { skill: body.skill }),
        ...(body.prompt !== undefined && { prompt: (body.prompt ?? '').trim() }),
        ...(body.promptTranslated !== undefined && { promptTranslated: (body.promptTranslated ?? '').trim() || null }),
        ...(options !== undefined && { options }),
        ...(answer !== undefined && { answer }),
        ...(body.explanation !== undefined && { explanation: (body.explanation ?? '').trim() || null }),
        ...(body.audioUrl !== undefined && { audioUrl: (body.audioUrl ?? '').trim() || null }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: !!body.isActive }),
      },
    });
    return NextResponse.json({ success: true, question: updated });
  } catch (err: any) {
    console.error('[admin/placement PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/placement/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.placementQuestion.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/placement DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
