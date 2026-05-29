import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/phrases/:collectionId
 * Full phrase collection: every phrase with target text, native translation,
 * optional literal gloss, note and audio.
 */
export async function GET(_req: NextRequest, { params }: { params: { collectionId: string } }) {
  try {
    const collection = await prisma.phraseCollection.findUnique({
      where: { id: params.collectionId },
      include: {
        phrases: { orderBy: { order: 'asc' } },
        course: {
          select: {
            level: true,
            targetLanguage: { select: { code: true, name: true } },
            nativeLanguage: { select: { code: true } },
          },
        },
      },
    });

    if (!collection || !collection.isActive) {
      return NextResponse.json({ error: 'Phrase collection not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: collection.id,
      title: collection.title,
      titleTranslated: collection.titleTranslated,
      category: collection.category ?? '',
      emoji: collection.emoji,
      cefrLevel: collection.cefrLevel ?? collection.course.level,
      isPremium: collection.isPremium,
      targetLanguageCode: collection.course.targetLanguage.code,
      targetLanguageName: collection.course.targetLanguage.name,
      nativeLanguageCode: collection.course.nativeLanguage.code,
      phrases: collection.phrases.map((p) => ({
        id: p.id,
        text: p.text,
        translation: p.translation,
        literal: p.literal ?? '',
        note: p.note ?? '',
        audioUrl: p.audioUrl ?? '',
      })),
    });
  } catch (err: any) {
    console.error('[mobile/phrases/[collectionId]]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
