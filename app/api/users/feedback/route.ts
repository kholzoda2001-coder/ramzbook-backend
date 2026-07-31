import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getFeedbackStateFor } from '@/lib/feedback';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/feedback
 *
 * Whether this learner may still be asked for feedback, plus the copy to show.
 * Fetched once per session — the client already knows the live lesson count and
 * picks the moment itself, so there is no per-lesson round-trip.
 */
export async function GET(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const state = await getFeedbackStateFor(prisma, me.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error('[users/feedback GET]', error);
    // Never break a lesson ending because the feedback lookup failed.
    return NextResponse.json({ eligible: false }, { status: 200 });
  }
}

/**
 * POST /api/users/feedback
 * Body: { rating: 1..5, message?: string, source?: 'lesson_milestone' | 'profile',
 *         lessonsCompleted?: number, level?: string, targetLang?: string, platform?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as {
      rating?: number;
      message?: string;
      source?: string;
      lessonsCompleted?: number;
      level?: string;
      targetLang?: string;
      platform?: string;
    };

    const rating = Math.round(Number(body.rating));
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'rating must be 1..5' }, { status: 400 });
    }

    const source = body.source === 'profile' ? 'profile' : 'lesson_milestone';
    // Trimmed and capped — a free-text field reaching the database should never
    // be able to arrive unbounded.
    const message = (body.message ?? '').trim().slice(0, 2000) || null;

    const created = await prisma.feedback.create({
      data: {
        userId: me.id,
        rating,
        message,
        source,
        lessonsCompleted: Math.max(0, Math.floor(Number(body.lessonsCompleted) || 0)),
        level: body.level?.slice(0, 16) ?? null,
        targetLang: body.targetLang?.slice(0, 16) ?? null,
        platform: body.platform?.slice(0, 32) ?? null,
      },
      select: { id: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, id: created.id, createdAt: created.createdAt });
  } catch (error) {
    console.error('[users/feedback POST]', error);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }
}
