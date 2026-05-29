import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** POST /api/admin/dialogues/lines — add a line to a dialogue.
 *  Body: { dialogueId, speaker, text, translation, audioUrl?, isUser?, order? } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      dialogueId?: string; speaker?: string; text?: string; translation?: string;
      audioUrl?: string; isUser?: boolean; order?: number;
    };
    const speaker = (body.speaker ?? '').trim();
    const text = (body.text ?? '').trim();
    const translation = (body.translation ?? '').trim();
    if (!body.dialogueId || !speaker || !text || !translation) {
      return NextResponse.json({ error: 'dialogueId, speaker, text and translation are required' }, { status: 400 });
    }
    const order = body.order ?? (await prisma.dialogueLine.count({ where: { dialogueId: body.dialogueId } }));
    const line = await prisma.dialogueLine.create({
      data: {
        dialogueId: body.dialogueId,
        speaker,
        text,
        translation,
        audioUrl: body.audioUrl?.trim() || null,
        isUser: body.isUser ?? false,
        order,
      },
    });
    return NextResponse.json({ success: true, line });
  } catch (err: any) {
    console.error('[admin/dialogues/lines POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
