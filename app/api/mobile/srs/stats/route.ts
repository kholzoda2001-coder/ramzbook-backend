import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/srs/stats?courseId=
 * Summary counters for the SRS dashboard: how many cards are due now, learning
 * (interval < 21d), mature, total, and reviewed today — RESTRICTED to the
 * language the user is currently learning (User.targetLang), matching the
 * /due queue so the "N due" counter can't disagree with the actual queue.
 *
 * SrsCard.itemId isn't a Prisma relation to Word, so we can't count with a
 * DB-level language join; instead we pull the (small) deck and its word
 * languages, filter, then tally in JS.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const courseId = req.nextUrl.searchParams.get('courseId') || undefined;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const me = await prisma.user.findUnique({ where: { id: userId }, select: { targetLang: true } });
    const targetLang = me?.targetLang ?? null;

    const cards = await prisma.srsCard.findMany({
      where: { userId, courseId },
      select: { itemType: true, itemId: true, dueAt: true, intervalDays: true, lastReviewedAt: true },
    });

    // Resolve word languages so we can drop other-language cards from the tally.
    const wordIds = cards.filter((c) => c.itemType === 'word').map((c) => c.itemId);
    const words = wordIds.length
      ? await prisma.word.findMany({
          where: { id: { in: wordIds } },
          select: { id: true, lesson: { select: { module: { select: { course: { select: { targetLanguage: { select: { code: true } } } } } } } } },
        })
      : [];
    const langByWord = new Map(
      words.map((w) => [w.id, w.lesson?.module?.course?.targetLanguage?.code ?? null]),
    );

    const inScope = cards.filter((c) => {
      if (c.itemType !== 'word') return true;
      const wordLang = langByWord.get(c.itemId);
      if (wordLang === undefined) return false; // orphaned word
      if (targetLang && wordLang && wordLang !== targetLang) return false;
      return true;
    });

    const total = inScope.length;
    const due = inScope.filter((c) => c.dueAt <= now).length;
    const learning = inScope.filter((c) => c.intervalDays < 21).length;
    const mature = inScope.filter((c) => c.intervalDays >= 21).length;
    const reviewedToday = inScope.filter((c) => c.lastReviewedAt && c.lastReviewedAt >= startOfToday).length;

    return NextResponse.json({ total, due, learning, mature, reviewedToday });
  } catch (err) {
    console.error('[mobile/srs/stats]', err);
    return apiError('Failed to load SRS stats');
  }
}
