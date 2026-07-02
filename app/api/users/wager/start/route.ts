import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { WAGER_GEM_COST, WAGER_TARGET_DAYS, resolveActiveWager } from '@/lib/wager';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/wager/start
 * Places a "Double or Nothing" streak wager: stakes WAGER_GEM_COST gems on
 * keeping the streak alive WAGER_TARGET_DAYS more days. Fixed stake/duration
 * for v1 — matches Duolingo's most-proven configuration rather than
 * inventing new numbers (see lib/wager.ts).
 */
export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Resolve any existing wager first so a just-won/lost wager doesn't
    // block starting a fresh one.
    const existing = await resolveActiveWager(auth.id);
    if (existing.status === 'active') {
      return NextResponse.json({ error: 'You already have an active wager.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { gems: true, streak: true },
    });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.gems < WAGER_GEM_COST) {
      return NextResponse.json({ error: 'Not enough gems' }, { status: 400 });
    }

    const [, wager] = await prisma.$transaction([
      prisma.user.update({ where: { id: auth.id }, data: { gems: { decrement: WAGER_GEM_COST } } }),
      prisma.streakWager.create({
        data: {
          userId: auth.id,
          gemsWagered: WAGER_GEM_COST,
          targetDays: WAGER_TARGET_DAYS,
          startStreak: user.streak,
          lastSeenStreak: user.streak,
        },
      }),
      prisma.gemTransaction.create({
        data: { userId: auth.id, amount: -WAGER_GEM_COST, reason: 'streak_wager_started' },
      }),
    ]);

    return NextResponse.json({
      ok: true,
      wager: {
        id: wager.id,
        gemsWagered: wager.gemsWagered,
        targetDays: wager.targetDays,
        daysElapsed: 0,
        daysRemaining: wager.targetDays,
      },
    });
  } catch (error) {
    console.error('[wager/start POST]', error);
    return NextResponse.json({ error: 'Failed to start wager' }, { status: 500 });
  }
}
