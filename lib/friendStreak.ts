import { randomInt } from 'crypto';
import { prisma } from './prisma';

// "Friend Streak" — a joint streak shared with exactly one other user.
// Duolingo reports users with an active friend streak are 22% more likely
// to complete their daily lesson — the second-most concretely-proven
// individual retention number found in the retention research pass (after
// the wager's +14% Day-7). v1 deliberately skips a full social graph
// (discovery/search, friend requests, push-to-other-device) in favor of the
// smallest version that still delivers the mechanic — see the scope
// reasoning in the P3 plan doc.

export const INVITE_CODE_LENGTH = 6;
export const INVITE_EXPIRY_HOURS = 24;
// Unambiguous alphabet: excludes 0/O and 1/I/L so a code shared as a photo,
// screenshot, or read aloud doesn't get mistyped.
export const INVITE_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/**
 * Generates a random invite code. Deliberately dependency-free (no prisma
 * import) so it can be unit-tested directly via ts-node without hitting the
 * ESM/extensionless-relative-import issue that `./prisma` imports cause.
 */
export function generateInviteCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_ALPHABET[randomInt(INVITE_CODE_ALPHABET.length)];
  }
  return code;
}

export type FriendStreakStatus =
  | { status: 'none' }
  | { status: 'invited'; code: string; expiresAt: string }
  | { status: 'broken'; friendName: string; jointDays: number }
  | { status: 'active'; friend: { id: string; name: string }; jointDays: number };

const ALREADY_PAIRED_MESSAGE = 'Шумо аллакай бо дӯстон силсила доред.';

/**
 * Resolves (or reports) a user's current friend-streak pairing, lazily on
 * every read — same pattern as resolveActiveWager in lib/wager.ts, for the
 * identical reason: no scheduled job, no day-by-day activity log. Each
 * user's User.streak already only moves +1/active-day or drops on a missed
 * day (streak-freezes already handled upstream in lib/xp.ts) — that
 * invariant is what makes lazy break-detection correct here too, just
 * evaluated independently for both sides of the pairing.
 *
 * Given an active FriendStreak row where the caller is user1 or user2:
 *   - if EITHER side's live streak < that side's lastSeenStreak → BROKEN
 *     (flip status once here; the next call finds no active row → 'none',
 *     exactly mirroring how a resolved wager disappears from future reads)
 *   - otherwise jointDays = min(user1.streak-startStreak1, user2.streak-startStreak2),
 *     and whichever lastSeenStreakN values moved forward get advanced.
 *
 * If there's no active FriendStreak row, falls back to reporting an
 * outstanding (unconsumed, unexpired) FriendInvite the caller created, so
 * the "waiting for my friend to redeem the code" screen has something to
 * show. Otherwise 'none'.
 */
export async function resolveFriendStreak(userId: string): Promise<FriendStreakStatus> {
  const streak = await prisma.friendStreak.findFirst({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: 'active' },
    orderBy: { createdAt: 'desc' },
  });

  if (streak) {
    const isUser1 = streak.user1Id === userId;
    const [user1, user2] = await Promise.all([
      prisma.user.findUnique({ where: { id: streak.user1Id }, select: { streak: true, name: true } }),
      prisma.user.findUnique({ where: { id: streak.user2Id }, select: { streak: true, name: true } }),
    ]);
    const s1 = user1?.streak ?? 0;
    const s2 = user2?.streak ?? 0;
    const friendName = isUser1 ? (user2?.name ?? '') : (user1?.name ?? '');

    if (s1 < streak.lastSeenStreak1 || s2 < streak.lastSeenStreak2) {
      const jointDaysAtBreak = Math.max(
        0,
        Math.min(streak.lastSeenStreak1 - streak.startStreak1, streak.lastSeenStreak2 - streak.startStreak2),
      );
      await prisma.friendStreak.update({
        where: { id: streak.id },
        data: { status: 'broken', brokenAt: new Date() },
      });
      return { status: 'broken', friendName, jointDays: jointDaysAtBreak };
    }

    const jointDays = Math.max(0, Math.min(s1 - streak.startStreak1, s2 - streak.startStreak2));
    if (s1 > streak.lastSeenStreak1 || s2 > streak.lastSeenStreak2) {
      await prisma.friendStreak.update({
        where: { id: streak.id },
        data: { lastSeenStreak1: s1, lastSeenStreak2: s2 },
      });
    }
    const friendId = isUser1 ? streak.user2Id : streak.user1Id;
    return { status: 'active', friend: { id: friendId, name: friendName }, jointDays };
  }

  const invite = await prisma.friendInvite.findFirst({
    where: { creatorUserId: userId, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (invite) {
    return { status: 'invited', code: invite.code, expiresAt: invite.expiresAt.toISOString() };
  }

  return { status: 'none' };
}

/**
 * Returns the caller's currently-valid outstanding invite code, creating one
 * if none exists. Idempotent by design — repeated taps of "invite a friend"
 * must not spawn a pile of dead codes, which would make "which code is
 * live" ambiguous for the user.
 */
export async function getOrCreateInvite(userId: string): Promise<{ code: string; expiresAt: Date }> {
  const existingStreak = await prisma.friendStreak.findFirst({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: 'active' },
  });
  if (existingStreak) throw new Error(ALREADY_PAIRED_MESSAGE);

  const existingInvite = await prisma.friendInvite.findFirst({
    where: { creatorUserId: userId, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (existingInvite) return { code: existingInvite.code, expiresAt: existingInvite.expiresAt };

  // Retry on the (astronomically unlikely) unique-code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateInviteCode();
    const expiresAt = new Date(Date.now() + INVITE_EXPIRY_HOURS * 3600 * 1000);
    try {
      const invite = await prisma.friendInvite.create({
        data: { code, creatorUserId: userId, expiresAt },
      });
      return { code: invite.code, expiresAt: invite.expiresAt };
    } catch (e) {
      if (attempt === 4) throw e;
    }
  }
  throw new Error('Хатогӣ ҳангоми сохтани рамз.');
}

/**
 * Redeems a code: validates it, then creates the FriendStreak row. Wrapped
 * in a transaction for the invite-consume + streak-create pair (does NOT
 * fully close the race where two people redeem the same code in the same
 * instant — acceptable for v1 at this app's scale, same tradeoff the wager
 * routes already make by not using serializable transactions).
 */
export async function redeemInviteCode(userId: string, rawCode: string): Promise<FriendStreakStatus> {
  const code = (rawCode || '').trim().toUpperCase();
  if (!code) throw new Error('Лутфан рамзи дӯстро ворид кунед.');

  const invite = await prisma.friendInvite.findUnique({ where: { code } });
  if (!invite) throw new Error('Рамз нодуруст аст.');
  if (invite.consumedAt) throw new Error('Ин рамз аллакай истифода шудааст.');
  if (invite.expiresAt.getTime() < Date.now()) throw new Error('Мӯҳлати рамз тамом шудааст.');
  if (invite.creatorUserId === userId) throw new Error('Шумо наметавонед бо рамзи худ ҳамроҳ шавед.');

  const [callerStreak, creatorStreak] = await Promise.all([
    prisma.friendStreak.findFirst({ where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: 'active' } }),
    prisma.friendStreak.findFirst({
      where: { OR: [{ user1Id: invite.creatorUserId }, { user2Id: invite.creatorUserId }], status: 'active' },
    }),
  ]);
  if (callerStreak) throw new Error(ALREADY_PAIRED_MESSAGE);
  if (creatorStreak) throw new Error('Ин корбар аллакай бо дигаре ҳамроҳ шудааст.');

  const [caller, creator] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { streak: true, name: true } }),
    prisma.user.findUnique({ where: { id: invite.creatorUserId }, select: { streak: true, name: true } }),
  ]);
  if (!caller || !creator) throw new Error('Рамз нодуруст аст.');

  const [, streak] = await prisma.$transaction([
    prisma.friendInvite.update({
      where: { id: invite.id },
      data: { consumedAt: new Date(), consumedByUserId: userId },
    }),
    prisma.friendStreak.create({
      data: {
        user1Id: invite.creatorUserId,
        user2Id: userId,
        startStreak1: creator.streak,
        startStreak2: caller.streak,
        lastSeenStreak1: creator.streak,
        lastSeenStreak2: caller.streak,
      },
    }),
  ]);

  return {
    status: 'active',
    friend: { id: invite.creatorUserId, name: creator.name },
    jointDays: 0,
  };
}

/** Voluntary unpair — sets status='broken' immediately, no lazy check needed. */
export async function unpairFriendStreak(userId: string): Promise<void> {
  await prisma.friendStreak.updateMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: 'active' },
    data: { status: 'broken', brokenAt: new Date() },
  });
}
