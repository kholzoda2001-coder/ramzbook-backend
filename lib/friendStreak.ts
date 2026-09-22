import { randomInt } from 'crypto';
import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import {
  FRIEND_CODE_ALPHABET,
  FRIEND_CODE_LENGTH,
  FRIEND_MESSAGES,
  PERSONAL_CODE_EXPIRES_AT,
  PERSONAL_CODE_MIN_EXPIRY,
  friendRedeemError,
  normalizeFriendCode,
} from './friendCode';

// "Friend Streak" — a joint streak shared with exactly one other user.
// Duolingo reports users with an active friend streak are 22% more likely
// to complete their daily lesson — the second-most concretely-proven
// individual retention number found in the retention research pass (after
// the wager's +14% Day-7). v1 deliberately skips a full social graph
// (discovery/search, friend requests, push-to-other-device) in favor of the
// smallest version that still delivers the mechanic — see the scope
// reasoning in the P3 plan doc.
//
// 🔴 2026-09-14: ДАЪВАТИ ДӮСТ аз «силсилаи муштарак» ҷудо шуд — ниг.
// `lib/friendCode.ts` (рамзи доимӣ, дӯстон бе маҳдудият, 100 алмос).
// `resolveFriendStreak` / `unpairFriendStreak` бетағйиранд.

export const INVITE_CODE_LENGTH = FRIEND_CODE_LENGTH;
/** Даъватҳои КӮҲНА 24-соата буданд; рамзи нав доимист (`PERSONAL_CODE_EXPIRES_AT`). */
export const INVITE_EXPIRY_HOURS = 24;
export const INVITE_CODE_ALPHABET = FRIEND_CODE_ALPHABET;

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
 * Рамзи ДОИМИИ шахсии корбар — ҳамон як рамз дар ҳар зарба, сохта мешавад
 * танҳо бори аввал.
 *
 * 🔴 2026-09-14: пештар рамз 24 соат зинда буд ва агар корбар аллакай «силсилаи
 * муштарак» дошт, `400` мепартофт. Ҳар ду бардошта шуданд: рамз намесӯзад ва
 * дӯстон бе маҳдудиятанд. Даъватҳои кӯҳнаи 24-соата нодида гирифта мешаванд.
 */
export async function getOrCreateInvite(userId: string): Promise<{ code: string; expiresAt: Date }> {
  const existing = await prisma.friendInvite.findFirst({
    where: { creatorUserId: userId, consumedAt: null, expiresAt: { gte: PERSONAL_CODE_MIN_EXPIRY } },
    orderBy: { createdAt: 'asc' },
  });
  if (existing) return { code: existing.code, expiresAt: existing.expiresAt };

  // Retry on the (astronomically unlikely) unique-code collision.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const invite = await prisma.friendInvite.create({
        data: { code: generateInviteCode(), creatorUserId: userId, expiresAt: PERSONAL_CODE_EXPIRES_AT },
      });
      return { code: invite.code, expiresAt: invite.expiresAt };
    } catch (e) {
      if (attempt === 4) throw e;
    }
  }
  throw new Error('Хатогӣ ҳангоми сохтани рамз.');
}

/** Сатри дӯстӣ байни `a` ва `b` дар ҲАР ДУ самт. */
function friendEdgeWhere(a: string, b: string): Prisma.FriendInviteWhereInput {
  return {
    consumedByUserId: { not: null },
    OR: [
      { creatorUserId: a, consumedByUserId: b },
      { creatorUserId: b, consumedByUserId: a },
    ],
  };
}

export type AddFriendResult = {
  ok: true;
  friend: { id: string; name: string };
  /** Ҳамеша 0 — алмос нест шуд (2026-09-14); майдон барои барномаи кӯҳна мемонад. */
  gemsAwarded: number;
};

/**
 * Рамзи дӯстро ворид мекунад: ҷуфт ДӮСТ мешаванд.
 *
 * Рамзи шахсӣ ИСТИФОДА НАМЕШАВАД — ҳар дӯстӣ сатри алоҳидаи `FriendInvite` бо
 * `consumedByUserId` мегирад (ниг. `lib/friendCode.ts`). «Силсилаи муштарак»
 * (`FriendStreak`) дигар сохта намешавад: он танҳо ЯК ҷуфтро иҷозат медод ва
 * маҳз ҳамин дӯсти дуюмро манъ мекард.
 *
 * ⚠️ Такрор дар ДОХИЛИ транзаксия аз нав санҷида мешавад, то ду зарбаи
 * ҳамзамон ду бор алмос надиҳанд. Пурра serializable нест — ҳамон мубодилаи
 * қабулшудаи роҳҳои wager барои миқёси ҳозира.
 */
export async function redeemInviteCode(userId: string, rawCode: string): Promise<AddFriendResult> {
  const code = normalizeFriendCode(rawCode);
  const invite = code ? await prisma.friendInvite.findUnique({ where: { code } }) : null;
  const friendId = invite?.creatorUserId ?? '';

  const alreadyFriends =
    !!invite &&
    friendId !== userId &&
    !!(await prisma.friendInvite.findFirst({ where: friendEdgeWhere(userId, friendId), select: { id: true } }));

  const error = friendRedeemError({ code, userId, invite, alreadyFriends });
  if (error) throw new Error(error);

  const creator = await prisma.user.findUnique({
    where: { id: friendId },
    select: { name: true, isActive: true },
  });
  if (!creator || !creator.isActive) throw new Error(FRIEND_MESSAGES.invalid);

  await prisma.$transaction(async (tx) => {
    const duplicate = await tx.friendInvite.findFirst({
      where: friendEdgeWhere(userId, friendId),
      select: { id: true },
    });
    if (duplicate) throw new Error(FRIEND_MESSAGES.alreadyFriends);

    let edgeCode = '';
    for (let attempt = 0; attempt < 5 && !edgeCode; attempt++) {
      const candidate = generateInviteCode();
      const taken = await tx.friendInvite.findUnique({ where: { code: candidate }, select: { id: true } });
      if (!taken) edgeCode = candidate;
    }
    if (!edgeCode) throw new Error('Хатогӣ ҳангоми ҳамроҳшавӣ.');

    const now = new Date();
    await tx.friendInvite.create({
      data: {
        code: edgeCode,
        creatorUserId: friendId,
        consumedByUserId: userId,
        consumedAt: now,
        expiresAt: now,
      },
    });
    // 🔴 2026-09-14: алмос аз барнома нест шуд — мукофоти «+100 ба ҳарду» ҳам.
  });

  return { ok: true, friend: { id: friendId, name: creator.name }, gemsAwarded: 0 };
}

/** Voluntary unpair — sets status='broken' immediately, no lazy check needed. */
export async function unpairFriendStreak(userId: string): Promise<void> {
  await prisma.friendStreak.updateMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }], status: 'active' },
    data: { status: 'broken', brokenAt: new Date() },
  });
}
