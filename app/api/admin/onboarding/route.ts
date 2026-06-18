import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiError('Unauthorized', 401);

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
    const admin = await requireAdmin();
    if (!admin) return apiError('Unauthorized', 401);

    const body = await req.json();
    const { targetLanguageId, nativeLanguageId, word, translation, transcription, transcriptionTajik, emoji, example, exampleTrans, options, audioUrl, order } = body;

    const newWord = await prisma.onboardingWord.create({
      data: {
        targetLanguageId,
        nativeLanguageId,
        word,
        translation,
        transcription,
        transcriptionTajik,
        emoji,
        example,
        exampleTrans,
        options: options || [],
        audioUrl,
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
    const admin = await requireAdmin();
    if (!admin) return apiError('Unauthorized', 401);

    const body = await req.json();
    const { id, targetLanguageId, nativeLanguageId, word, translation, transcription, transcriptionTajik, emoji, example, exampleTrans, options, audioUrl, order } = body;

    const updated = await prisma.onboardingWord.update({
      where: { id },
      data: {
        targetLanguageId,
        nativeLanguageId,
        word,
        translation,
        transcription,
        transcriptionTajik,
        emoji,
        example,
        exampleTrans,
        options: options || [],
        audioUrl,
        order,
      },
    });

    return NextResponse.json({ word: updated });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    if (!admin) return apiError('Unauthorized', 401);

    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return apiError('Missing id', 400);

    await prisma.onboardingWord.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
