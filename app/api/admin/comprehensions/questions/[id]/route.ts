import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/comprehensions/questions/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (body.question !== undefined) data.question = body.question.trim();
    if (body.questionTranslated !== undefined) data.questionTranslated = body.questionTranslated?.trim() || null;
    if (body.explanation !== undefined) data.explanation = body.explanation?.trim() || null;
    if (body.order !== undefined) data.order = body.order;
    if (body.options !== undefined) {
      const options = (body.options as string[]).map((o) => (o ?? '').trim()).filter((o) => o.length > 0);
      data.options = options;
      // keep correctIndex in range relative to the new options length
      if (body.correctIndex !== undefined) {
        data.correctIndex = Math.min(Math.max(body.correctIndex, 0), Math.max(options.length - 1, 0));
      }
    } else if (body.correctIndex !== undefined) {
      data.correctIndex = body.correctIndex;
    }
    const updated = await prisma.comprehensionQuestion.update({ where: { id: params.id }, data });
    return NextResponse.json({ success: true, question: updated });
  } catch (err: any) {
    console.error('[admin/comprehensions/questions PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/comprehensions/questions/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.comprehensionQuestion.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/comprehensions/questions DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
