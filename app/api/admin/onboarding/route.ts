import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function apiError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetId = searchParams.get('targetLanguageId');
    const nativeId = searchParams.get('nativeLanguageId');

    if (!targetId || !nativeId) return apiError('Missing language IDs', 400);

    const words = await prisma.onboardingWord.findMany({
      where: { targetLanguageId: targetId, nativeLanguageId: nativeId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ words });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetLanguageId, nativeLanguageId, word, translation, transcription, transcriptionTajik, emoji, example, exampleTrans, options, audioUrl, order } = body;

    if (!targetLanguageId || !nativeLanguageId || !word || !translation) {
      return apiError('Missing required fields', 400);
    }

    const newWord = await prisma.onboardingWord.create({
      data: {
        targetLanguageId,
        nativeLanguageId,
        word,
        translation,
        transcription: transcription || null,
        transcriptionTajik: transcriptionTajik || null,
        emoji: emoji || null,
        example: example || null,
        exampleTrans: exampleTrans || null,
        options: options || [],
        audioUrl: audioUrl || null,
        order: order || 0,
      },
    });

    return NextResponse.json({ word: newWord });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, targetLanguageId, nativeLanguageId, word, translation, transcription, transcriptionTajik, emoji, example, exampleTrans, options, audioUrl, order } = body;

    if (!id) return apiError('Missing id', 400);

    const updated = await prisma.onboardingWord.update({
      where: { id },
      data: {
        targetLanguageId,
        nativeLanguageId,
        word,
        translation,
        transcription: transcription || null,
        transcriptionTajik: transcriptionTajik || null,
        emoji: emoji || null,
        example: example || null,
        exampleTrans: exampleTrans || null,
        options: options || [],
        audioUrl: audioUrl || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ word: updated });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return apiError('Missing id', 400);

    await prisma.onboardingWord.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
