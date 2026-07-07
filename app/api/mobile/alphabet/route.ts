import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/alphabet?targetLanguageId=X&nativeLanguageId=Y
 * The target language's script, one row per letter (admin-managed). Replaces
 * the old hardcoded English/Russian-only alphabet in the Flutter app — any
 * language now shows its real alphabet once an admin fills it in, and shows
 * nothing (empty state) for a language that hasn't been filled in yet.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetId = searchParams.get('targetLanguageId');
    const nativeId = searchParams.get('nativeLanguageId');

    if (!targetId || !nativeId) {
      return NextResponse.json({ error: 'targetLanguageId and nativeLanguageId are required' }, { status: 400 });
    }

    const letters = await prisma.alphabetLetter.findMany({
      where: { targetLanguageId: targetId, nativeLanguageId: nativeId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({
      letters: letters.map((l) => ({
        id: l.id,
        uppercase: l.uppercase,
        lowercase: l.lowercase,
        ipa: l.ipa ?? '',
        tajikTranscription: l.tajikTranscription ?? '',
        category: l.category,
        audioUrl: l.audioUrl ?? '',
        order: l.order,
      })),
    });
  } catch (err: any) {
    console.error('[mobile/alphabet]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
