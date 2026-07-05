import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Fetch a generous window of oldest-due cards, then filter by language in JS
// and take `limit` from what's left. SrsCard.itemId is a plain string, not a
// Prisma relation to Word, so the language filter can't be a DB-level join —
// hence hydrate-then-filter. 500 is far more than any real user's due deck,
// so it never truncates a legitimately-large same-language queue.
const DUE_FETCH_CAP = 500;

/**
 * GET /api/mobile/srs/due?courseId=&limit=&itemType=
 * The review queue: cards whose dueAt has passed, oldest-due first, RESTRICTED
 * to the language the user is currently learning (User.targetLang). Without
 * that restriction the queue leaked words from every language the user ever
 * tried — e.g. Chinese cards showing up for an English learner. Word cards are
 * hydrated with their content so the client can render the review without
 * extra round-trips.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const sp = req.nextUrl.searchParams;
    const courseId = sp.get('courseId') || undefined;
    const itemType = sp.get('itemType') || undefined;
    const limit = Math.min(Math.max(parseInt(sp.get('limit') || '15', 10) || 15, 1), 100);

    const me = await prisma.user.findUnique({ where: { id: userId }, select: { targetLang: true } });
    const targetLang = me?.targetLang ?? null;

    const cards = await prisma.srsCard.findMany({
      where: { userId, courseId, itemType, dueAt: { lte: new Date() } },
      orderBy: { dueAt: 'asc' },
      take: DUE_FETCH_CAP,
    });

    // Hydrate "word" cards in one query, including the language chain so we can
    // filter to the current course's language.
    const wordIds = cards.filter((c) => c.itemType === 'word').map((c) => c.itemId);
    const words = wordIds.length
      ? await prisma.word.findMany({
          where: { id: { in: wordIds } },
          select: {
            id: true, word: true, translation: true, emoji: true, ipa: true, ipaTajik: true,
            example: true, exampleTrans: true, audioUrl: true,
            lesson: { select: { module: { select: { course: { select: { targetLanguage: { select: { code: true } } } } } } } },
          },
        })
      : [];
    const wordMap = new Map(words.map((w) => [w.id, w]));

    const result = [];
    for (const c of cards) {
      if (c.itemType === 'word') {
        const w = wordMap.get(c.itemId);
        if (!w) continue; // orphaned — word deleted
        const wordLang = w.lesson?.module?.course?.targetLanguage?.code ?? null;
        // Only surface words in the language the user is currently learning.
        // If targetLang is somehow unset, fall back to showing everything
        // rather than an empty queue.
        if (targetLang && wordLang && wordLang !== targetLang) continue;
        result.push({
          id: c.id,
          itemType: c.itemType,
          itemId: c.itemId,
          intervalDays: c.intervalDays,
          repetitions: c.repetitions,
          dueAt: c.dueAt,
          content: {
            word: w.word,
            translation: w.translation,
            emoji: w.emoji ?? '',
            ipa: w.ipa ?? '',
            ipaTajik: w.ipaTajik ?? '',
            example: w.example ?? '',
            exampleTrans: w.exampleTrans ?? '',
            audioUrl: w.audioUrl ?? '',
          },
        });
      } else {
        result.push({
          id: c.id, itemType: c.itemType, itemId: c.itemId,
          intervalDays: c.intervalDays, repetitions: c.repetitions, dueAt: c.dueAt, content: null,
        });
      }
      if (result.length >= limit) break;
    }

    return NextResponse.json({ cards: result, count: result.length });
  } catch (err) {
    console.error('[mobile/srs/due]', err);
    return apiError('Failed to load review queue');
  }
}
