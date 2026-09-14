// Рамзи ДӮСТ — мантиқи пок (бе prisma), то vitest онро бе база санҷад.
//
// 🔴 2026-09-14 (дархости корбар): «Даъвати дӯст» ҳеҷ гоҳ кор накард — дар база
// 40 рамз аз 34 корбар, 0 истифода, 0 дӯстӣ. Сабабҳо:
//   1. ҷои ВОРИД КАРДАНИ рамз дар барнома набуд (`FriendStreakCard` дар ҳеҷ
//      экран намоиш дода намешуд);
//   2. рамз баъди 24 соат месӯхт;
//   3. як корбар танҳо ЯК дӯст дошта метавонист («силсилаи муштарак»);
//   4. экран «ҳарду 100 алмос мегиред» мегуфт, вале алмос дода намешуд.
// Қарори корбар: рамзи ДОИМИИ шахсӣ, дӯстон БЕ маҳдудият, 100 алмоси воқеӣ.
//
// ⚠️ БЕ тағйири сохтори база (build-и Vercel `prisma db push` мекунад):
//   • рамзи шахсӣ = сатри `FriendInvite` бо мӯҳлати абадӣ ва `consumedAt = null`
//     — ҳеҷ гоҳ «истифода» намешавад, пас ба ҳар шумораи дӯстон кор мекунад;
//   • ҳар дӯстӣ = сатри АЛОҲИДАИ истифодашуда (`consumedByUserId`), ки
//     `getFriendsLeague` (lib/league.ts) аллакай ҳамчун «дӯст» мехонад.

export const FRIEND_CODE_LENGTH = 6;

/** Бе 0/O ва 1/I/L — рамзи аз акс ё овоз хондашуда хато навишта нашавад. */
export const FRIEND_CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

/** Мӯҳлати «абадӣ»-и рамзи шахсӣ. */
export const PERSONAL_CODE_EXPIRES_AT = new Date('2100-01-01T00:00:00.000Z');

/** Аз ин санаи дуртар — рамзи шахсӣ (на даъвати кӯҳнаи 24-соата). */
export const PERSONAL_CODE_MIN_EXPIRY = new Date('2099-01-01T00:00:00.000Z');

/** Ба ҲАР ДУ тараф, як бор барои ҳар ҷуфт. */
export const FRIEND_INVITE_GEMS = 100;
export const FRIEND_INVITE_GEM_REASON = 'friend_invite';

/** Паёмҳои корбарӣ — роҳи `join` ҳамаро ҳамчун 400 бармегардонад. */
export const FRIEND_MESSAGES = {
  empty: 'Лутфан рамзи дӯстро ворид кунед.',
  invalid: 'Рамз нодуруст аст.',
  used: 'Ин рамз аллакай истифода шудааст.',
  expired: 'Мӯҳлати рамз тамом шудааст.',
  self: 'Шумо наметавонед бо рамзи худ ҳамроҳ шавед.',
  alreadyFriends: 'Шумо аллакай дӯст ҳастед.',
} as const;

/**
 * «pzu-edp », «PZUEDP» ва «p z u e d p» як рамзанд: ҳарфи хурд, фосила ва
 * аломат партофта мешаванд (хонанда рамзро аз паём нусха мекунад).
 */
export function normalizeFriendCode(raw: unknown): string {
  return String(raw ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

/** Сатр рамзи ДОИМИИ шахсӣ аст (на сатри дӯстӣ, на даъвати кӯҳна)? */
export function isPersonalCode(invite: { expiresAt: Date; consumedAt: Date | null }): boolean {
  return invite.consumedAt === null && invite.expiresAt.getTime() >= PERSONAL_CODE_MIN_EXPIRY.getTime();
}

export interface FriendRedeemInput {
  /** Аллакай `normalizeFriendCode` шуда. */
  code: string;
  userId: string;
  invite: { creatorUserId: string; expiresAt: Date; consumedAt: Date | null } | null;
  alreadyFriends: boolean;
  now?: Date;
}

/**
 * Хатои корбарӣ, ё `null` = метавон дӯст шуд.
 *
 * ⚠️ `consumedAt` пеш аз «худам»: сатри истифодашуда СӮРОҒАИ дӯстӣ аст, на рамзи
 * даъват — касе, ки онро нусха кунад, бояд «истифода шудааст» бигирад.
 * Даъвати кӯҳнаи 24-соатаи истифоданашуда то анҷоми мӯҳлаташ ҳамоно кор мекунад.
 */
export function friendRedeemError(i: FriendRedeemInput): string | null {
  if (!i.code) return FRIEND_MESSAGES.empty;
  if (!i.invite) return FRIEND_MESSAGES.invalid;
  if (i.invite.consumedAt) return FRIEND_MESSAGES.used;
  if (i.invite.creatorUserId === i.userId) return FRIEND_MESSAGES.self;
  if (i.invite.expiresAt.getTime() < (i.now ?? new Date()).getTime()) return FRIEND_MESSAGES.expired;
  if (i.alreadyFriends) return FRIEND_MESSAGES.alreadyFriends;
  return null;
}
