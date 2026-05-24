import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/words/:id — get single word
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const word = await prisma.word.findUnique({
      where: { id: params.id },
      include: { lessons: { include: { lesson: { select: { id: true, title: true } } } } },
    });
    if (!word) return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    return NextResponse.json({ word });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * PUT /api/admin/words/:id — update word
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json() as {
      word?: string;
      translation?: string;
      ipa?: string;
      emoji?: string;
      example?: string;
      exampleTranslation?: string;
      audioUrl?: string;
      difficulty?: number;
    };

    const updated = await prisma.word.update({
      where: { id: params.id },
      data: {
        ...(body.word !== undefined && { word: body.word.trim() }),
        ...(body.translation !== undefined && { translation: body.translation.trim() }),
        ...(body.ipa !== undefined && { ipa: body.ipa.trim() || null }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() || null }),
        ...(body.example !== undefined && { example: body.example.trim() || null }),
        ...(body.exampleTranslation !== undefined && { exampleTranslation: body.exampleTranslation.trim() || null }),
        ...(body.audioUrl !== undefined && { audioUrl: body.audioUrl.trim() || null }),
        ...(body.difficulty !== undefined && { difficulty: body.difficulty }),
      },
    });
    return NextResponse.json({ success: true, word: updated });
  } catch (err: any) {
    console.error('[admin/words PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/words/:id — delete word and all its lesson links
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Remove all lesson links first (foreign key)
    await prisma.lessonWord.deleteMany({ where: { wordId: params.id } });
    await prisma.word.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/words DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
