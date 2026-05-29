import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/srs/stats?courseId=
 * Summary counters for the SRS dashboard: how many cards are due now, how many
 * are still being learned (interval < 21d), how many are "mature", the total
 * deck size and how many were reviewed today.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const courseId = req.nextUrl.searchParams.get('courseId') || undefined;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const baseWhere = { userId, courseId };

    const [total, due, learning, mature, reviewedToday] = await Promise.all([
      prisma.srsCard.count({ where: baseWhere }),
      prisma.srsCard.count({ where: { ...baseWhere, dueAt: { lte: now } } }),
      prisma.srsCard.count({ where: { ...baseWhere, intervalDays: { lt: 21 } } }),
      prisma.srsCard.count({ where: { ...baseWhere, intervalDays: { gte: 21 } } }),
      prisma.srsCard.count({ where: { ...baseWhere, lastReviewedAt: { gte: startOfToday } } }),
    ]);

    return NextResponse.json({ total, due, learning, mature, reviewedToday });
  } catch (err) {
    console.error('[mobile/srs/stats]', err);
    return apiError('Failed to load SRS stats');
  }
}
