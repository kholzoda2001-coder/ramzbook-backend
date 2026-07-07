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

    const letters = await prisma.alphabetLetter.findMany({
      where: { targetLanguageId: targetId, nativeLanguageId: nativeId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ letters });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetLanguageId, nativeLanguageId, uppercase, lowercase, ipa, tajikTranscription, category, audioUrl, order } = body;

    if (!targetLanguageId || !nativeLanguageId || !uppercase || !lowercase || !category) {
      return apiError('Missing required fields', 400);
    }

    const letter = await prisma.alphabetLetter.create({
      data: {
        targetLanguageId,
        nativeLanguageId,
        uppercase,
        lowercase,
        ipa: ipa || null,
        tajikTranscription: tajikTranscription || null,
        category,
        audioUrl: audioUrl || null,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ letter });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, targetLanguageId, nativeLanguageId, uppercase, lowercase, ipa, tajikTranscription, category, audioUrl, order } = body;

    if (!id) return apiError('Missing id', 400);

    // Only touch fields actually present in the body — lets callers (e.g. the
    // audio-generation script) send a partial `{ id, audioUrl }` update
    // without wiping the rest of the letter's data back to null.
    const data: Record<string, unknown> = {};
    if (targetLanguageId !== undefined) data.targetLanguageId = targetLanguageId;
    if (nativeLanguageId !== undefined) data.nativeLanguageId = nativeLanguageId;
    if (uppercase !== undefined) data.uppercase = uppercase;
    if (lowercase !== undefined) data.lowercase = lowercase;
    if (ipa !== undefined) data.ipa = ipa || null;
    if (tajikTranscription !== undefined) data.tajikTranscription = tajikTranscription || null;
    if (category !== undefined) data.category = category;
    if (audioUrl !== undefined) data.audioUrl = audioUrl || null;
    if (order !== undefined) data.order = order ?? 0;

    const updated = await prisma.alphabetLetter.update({ where: { id }, data });

    return NextResponse.json({ letter: updated });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return apiError('Missing id', 400);

    await prisma.alphabetLetter.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
