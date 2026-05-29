import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isGrammarExerciseType, normalizeOptions } from '@/lib/grammar';

export const dynamic = 'force-dynamic';

/** POST /api/admin/grammar/exercises — add a practice exercise to a topic.
 *  Body: { topicId, type, prompt, answer, promptTranslated?, options?, explanation?, order? } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      topicId?: string; type?: string; prompt?: string; answer?: string;
      promptTranslated?: string; options?: unknown; explanation?: string; order?: number;
    };
    const prompt = (body.prompt ?? '').trim();
    const answer = (body.answer ?? '').trim();
    if (!body.topicId || !prompt || !answer) {
      return NextResponse.json({ error: 'topicId, prompt and answer are required' }, { status: 400 });
    }
    const order = body.order ?? (await prisma.grammarExercise.count({ where: { topicId: body.topicId } }));
    const exercise = await prisma.grammarExercise.create({
      data: {
        topicId: body.topicId,
        type: isGrammarExerciseType(body.type) ? body.type : 'fill_blank',
        prompt,
        answer,
        promptTranslated: body.promptTranslated?.trim() || null,
        options: normalizeOptions(body.options) ?? undefined,
        explanation: body.explanation?.trim() || null,
        order,
      },
    });
    return NextResponse.json({ success: true, exercise });
  } catch (err: any) {
    console.error('[admin/grammar/exercises POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
