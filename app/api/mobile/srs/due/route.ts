import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/srs/due?courseId=&limit=&itemType=
 * The review queue: cards whose dueAt has passed, oldest-due first. Word cards
 * are hydrated with their content (word/translation/ipa/example/audio) so the
 * client can render the review without extra round-trips.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const sp = req.nextUrl.searchParams;
    const courseId = sp.get('courseId') || undefined;
    const itemType = sp.get('itemType') || undefined;
    const limit = Math.min(Math.max(parseInt(sp.get('limit') || '20', 10) || 20, 1), 100);

    const cards = await prisma.srsCard.findMany({
      where: { userId, courseId, itemType, dueAt: { lte: new Date() } },
      orderBy: { dueAt: 'asc' },
      take: limit,
    });

    // Hydrate "word" cards in one query.
    const wordIds = cards.filter((c) => c.itemType === 'word').map((c) => c.itemId);
    const words = wordIds.length
      ? await prisma.word.findMany({
          where: { id: { in: wordIds } },
          select: {
            id: true, word: true, translation: true, emoji: true, ipa: true, ipaTajik: true,
            example: true, exampleTrans: true, audioUrl: true,
          },
        })
      : [];
    const wordMap = new Map(words.map((w) => [w.id, w]));

    const result = cards.map((c) => {
      const w = c.itemType === 'word' ? wordMap.get(c.itemId) : undefined;
      return {
        id: c.id,
        itemType: c.itemType,
        itemId: c.itemId,
        intervalDays: c.intervalDays,
        repetitions: c.repetitions,
        dueAt: c.dueAt,
        content: w
          ? {
              word: w.word,
              translation: w.translation,
              emoji: w.emoji ?? '',
              ipa: w.ipa ?? '',
              ipaTajik: w.ipaTajik ?? '',
              example: w.example ?? '',
              exampleTrans: w.exampleTrans ?? '',
              audioUrl: w.audioUrl ?? '',
            }
          : null,
      };
    });

    // Drop word cards whose underlying word was deleted (orphaned).
    const cleaned = result.filter((r) => r.itemType !== 'word' || r.content !== null);

    return NextResponse.json({ cards: cleaned, count: cleaned.length });
  } catch (err) {
    console.error('[mobile/srs/due]', err);
    return apiError('Failed to load review queue');
  }
}
