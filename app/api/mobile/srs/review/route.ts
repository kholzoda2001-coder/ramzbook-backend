import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { reviewCard, initialSrsState, isGrade } from '@/lib/srs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/mobile/srs/review
 * Grade one item. Creates the card on first review (lazy enrolment), then
 * applies the SM-2 update and persists the new schedule.
 * Body: { itemId, grade, itemType?, courseId? }
 *   grade ∈ "again" | "hard" | "good" | "easy"
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = await req.json() as {
      itemId?: string; grade?: string; itemType?: string; courseId?: string;
    };

    const itemId = (body.itemId ?? '').trim();
    const itemType = (body.itemType ?? 'word').trim() || 'word';
    if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 });
    if (!isGrade(body.grade)) {
      return NextResponse.json({ error: 'grade must be one of again|hard|good|easy' }, { status: 400 });
    }

    const existing = await prisma.srsCard.findUnique({
      where: { userId_itemType_itemId: { userId, itemType, itemId } },
    });

    const state = existing
      ? { easeFactor: existing.easeFactor, intervalDays: existing.intervalDays, repetitions: existing.repetitions, lapses: existing.lapses }
      : initialSrsState();

    const next = reviewCard(state, body.grade);

    const card = await prisma.srsCard.upsert({
      where: { userId_itemType_itemId: { userId, itemType, itemId } },
      create: {
        userId,
        itemType,
        itemId,
        courseId: body.courseId?.trim() || null,
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueAt: next.dueAt,
        lastReviewedAt: new Date(),
      },
      update: {
        ...(body.courseId !== undefined && { courseId: body.courseId?.trim() || null }),
        easeFactor: next.easeFactor,
        intervalDays: next.intervalDays,
        repetitions: next.repetitions,
        lapses: next.lapses,
        dueAt: next.dueAt,
        lastReviewedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      card: {
        id: card.id,
        itemType: card.itemType,
        itemId: card.itemId,
        easeFactor: card.easeFactor,
        intervalDays: card.intervalDays,
        repetitions: card.repetitions,
        lapses: card.lapses,
        dueAt: card.dueAt,
      },
    });
  } catch (err) {
    console.error('[mobile/srs/review]', err);
    return apiError('Failed to record review');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
