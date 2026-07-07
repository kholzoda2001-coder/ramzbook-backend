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
    const { targetLanguageId, nativeLanguageId, uppercase, lowercase, ipa, tajikTranscription, category, order } = body;

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
    const { id, targetLanguageId, nativeLanguageId, uppercase, lowercase, ipa, tajikTranscription, category, order } = body;

    if (!id) return apiError('Missing id', 400);

    const updated = await prisma.alphabetLetter.update({
      where: { id },
      data: {
        targetLanguageId,
        nativeLanguageId,
        uppercase,
        lowercase,
        ipa: ipa || null,
        tajikTranscription: tajikTranscription || null,
        category,
        order: order ?? 0,
      },
    });

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
