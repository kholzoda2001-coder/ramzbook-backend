import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** GET /api/admin/words/:id — single word */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const word = await prisma.word.findUnique({
      where: { id: params.id },
      include: { lesson: { select: { id: true, title: true } } },
    });
    if (!word) return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    return NextResponse.json({ word });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/words/:id — update word */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as {
      // Moving a word to another lesson has to keep the SAME record: the audio
      // file is named after the word id and the picture after its text, so a
      // delete-and-recreate would silently orphan both.
      lessonId?: string;
      word?: string;
      translation?: string;
      ipa?: string;
      ipaTajik?: string;
      emoji?: string;
      example?: string;
      exampleTrans?: string;
      audioUrl?: string;
      difficulty?: number;
      partOfSpeech?: string;
      frequencyRank?: number | null;
      order?: number;
    };

    if (body.lessonId !== undefined) {
      const target = await prisma.lesson.findUnique({ where: { id: body.lessonId }, select: { id: true } });
      if (!target) return NextResponse.json({ error: 'Target lesson not found' }, { status: 400 });
    }

    const updated = await prisma.word.update({
      where: { id: params.id },
      data: {
        ...(body.lessonId !== undefined && { lessonId: body.lessonId }),
        ...(body.word !== undefined && { word: body.word.trim() }),
        ...(body.translation !== undefined && { translation: body.translation.trim() }),
        ...(body.ipa !== undefined && { ipa: body.ipa.trim() || null }),
        ...(body.ipaTajik !== undefined && { ipaTajik: body.ipaTajik.trim() || null }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() || null }),
        ...(body.example !== undefined && { example: body.example.trim() || null }),
        ...(body.exampleTrans !== undefined && { exampleTrans: body.exampleTrans.trim() || null }),
        ...(body.audioUrl !== undefined && { audioUrl: body.audioUrl.trim() || null }),
        ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
        ...(body.partOfSpeech !== undefined && { partOfSpeech: body.partOfSpeech?.trim() || null }),
        ...(body.frequencyRank !== undefined && { frequencyRank: typeof body.frequencyRank === 'number' ? body.frequencyRank : null }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json({ success: true, word: updated });
  } catch (err: any) {
    console.error('[admin/words PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/words/:id */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.word.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/words DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
