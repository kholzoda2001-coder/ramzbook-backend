import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** POST /api/admin/grammar/examples — add an example to a topic.
 *  Body: { topicId, sentence, translation, audioUrl?, highlight?, order? } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      topicId?: string; sentence?: string; translation?: string;
      audioUrl?: string; highlight?: string; order?: number;
    };
    const sentence = (body.sentence ?? '').trim();
    if (!body.topicId || !sentence) {
      return NextResponse.json({ error: 'topicId and sentence are required' }, { status: 400 });
    }
    const order = body.order ?? (await prisma.grammarExample.count({ where: { topicId: body.topicId } }));
    const example = await prisma.grammarExample.create({
      data: {
        topicId: body.topicId,
        sentence,
        translation: (body.translation ?? '').trim(),
        audioUrl: body.audioUrl?.trim() || null,
        highlight: body.highlight?.trim() || null,
        order,
      },
    });
    return NextResponse.json({ success: true, example });
  } catch (err: any) {
    console.error('[admin/grammar/examples POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
