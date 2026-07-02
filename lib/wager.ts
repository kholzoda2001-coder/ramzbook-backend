import { prisma } from './prisma';

// "Double or Nothing" streak wager. The single most concretely-proven
// individual retention mechanic found in the retention research pass —
// Duolingo reports +14% Day-7 retention from this exact feature. Config
// fixed at their most-proven numbers for v1 rather than inventing new ones.
export const WAGER_GEM_COST = 50;
export const WAGER_TARGET_DAYS = 7;
export const WAGER_PAYOUT_MULTIPLIER = 2;

export type WagerStatus =
  | { status: 'none' }
  | { status: 'lost' }
  | { status: 'won'; gemsWon: number }
  | {
      status: 'active';
      wager: {
        id: string;
        gemsWagered: number;
        targetDays: number;
        daysElapsed: number;
        daysRemaining: number;
      };
    };

/**
 * Resolves (or reports) a user's current wager, lazily on every read — there
 * is no scheduled job and no day-by-day activity log for wagers. Correctness
 * instead relies on one invariant already guaranteed by the existing streak
 * pipeline (lib/xp.ts + streak/freeze route): `user.streak` only ever moves
 * up by exactly 1 per active day, or drops (to 0 or 1) the moment a day is
 * missed — freezes are already handled upstream of this, so a frozen day
 * still shows as a normal streak increment here, not a drop.
 *
 * Given that:
 *   - currentStreak < lastSeenStreak        → dropped since we last looked → LOST
 *   - currentStreak >= startStreak+targetDays → climbed the full distance
 *     without ever being observed to drop → WON
 *   - otherwise                              → still in progress; advance the
 *     floor so the next check has an accurate baseline
 *
 * The only cost of lazy (vs. scheduled) resolution is a delayed WON/LOST
 * transition if the user doesn't open the app for a while — acceptable for v1.
 */
export async function resolveActiveWager(userId: string): Promise<WagerStatus> {
  const wager = await prisma.streakWager.findFirst({
    where: { userId, status: 'active' },
    orderBy: { createdAt: 'desc' },
  });
  if (!wager) return { status: 'none' };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { streak: true } });
  const currentStreak = user?.streak ?? 0;
  const targetStreak = wager.startStreak + wager.targetDays;

  if (currentStreak < wager.lastSeenStreak) {
    await prisma.streakWager.update({
      where: { id: wager.id },
      data: { status: 'lost', resolvedAt: new Date() },
    });
    return { status: 'lost' };
  }

  if (currentStreak >= targetStreak) {
    const payout = wager.gemsWagered * WAGER_PAYOUT_MULTIPLIER;
    await prisma.$transaction([
      prisma.streakWager.update({
        where: { id: wager.id },
        data: { status: 'won', resolvedAt: new Date(), lastSeenStreak: currentStreak },
      }),
      prisma.user.update({ where: { id: userId }, data: { gems: { increment: payout } } }),
      prisma.gemTransaction.create({
        data: { userId, amount: payout, reason: 'streak_wager_won' },
      }),
    ]);
    return { status: 'won', gemsWon: payout };
  }

  if (currentStreak > wager.lastSeenStreak) {
    await prisma.streakWager.update({ where: { id: wager.id }, data: { lastSeenStreak: currentStreak } });
  }
  const daysElapsed = Math.max(0, currentStreak - wager.startStreak);
  return {
    status: 'active',
    wager: {
      id: wager.id,
      gemsWagered: wager.gemsWagered,
      targetDays: wager.targetDays,
      daysElapsed,
      daysRemaining: Math.max(0, wager.targetDays - daysElapsed),
    },
  };
}
