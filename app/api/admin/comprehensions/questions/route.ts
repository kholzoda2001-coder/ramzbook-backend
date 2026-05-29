import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** POST /api/admin/comprehensions/questions — add a question to an exercise.
 *  Body: { exerciseId, question, questionTranslated?, options[], correctIndex?, explanation?, order? } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      exerciseId?: string; question?: string; questionTranslated?: string;
      options?: string[]; correctIndex?: number; explanation?: string; order?: number;
    };
    const question = (body.question ?? '').trim();
    const options = (body.options ?? []).map((o) => (o ?? '').trim()).filter((o) => o.length > 0);
    if (!body.exerciseId || !question || options.length < 2) {
      return NextResponse.json({ error: 'exerciseId, question and at least 2 options are required' }, { status: 400 });
    }
    const correctIndex = Math.min(Math.max(body.correctIndex ?? 0, 0), options.length - 1);
    const order = body.order ?? (await prisma.comprehensionQuestion.count({ where: { exerciseId: body.exerciseId } }));
    const created = await prisma.comprehensionQuestion.create({
      data: {
        exerciseId: body.exerciseId,
        question,
        questionTranslated: body.questionTranslated?.trim() || null,
        options,
        correctIndex,
        explanation: body.explanation?.trim() || null,
        order,
      },
    });
    return NextResponse.json({ success: true, question: created });
  } catch (err: any) {
    console.error('[admin/comprehensions/questions POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
