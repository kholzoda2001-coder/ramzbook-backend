/**
 * Сиёсати `streak freeze` — чанд дона корбар дошта метавонад ва кай пур мешавад.
 *
 * ── Чаро ин ислоҳ лозим шуд ───────────────────────────────────────────────
 * Ҳангоми додани Premium/промо `streakFreezesAvailable: 999` навишта мешуд —
 * коди тӯҳфаи промо коди Premium-ро нусхабардорӣ карда буд, ва он ҷо 999
 * ҳамчун «беохир» гузошта шуда буд. Оқибат: барои 46 нафар аз 48 корбари
 * Premium силсила аслан ШИКАСТА НАМЕТАВОНИСТ. Рақами 🔥 барои онҳо кӯшишро
 * чен намекард — `Furkat` бо 🔥31 шаш маротиба шикаста буд ва ҳар дафъа
 * freeze онро хомӯшона часпонда буд, `Муҳаммад` — 26 маротиба.
 *
 * ── Сиёсати нав ───────────────────────────────────────────────────────────
 * Маҳдудият «чанд дона ДАР ЯК ВАҚТ», на «чанд дона дар умр»:
 *   • ройгон  — 1, ҳар моҳ пур мешавад, илова бар ин бо 200 гем харида мешавад
 *   • Premium — 2, ҳар моҳ пур мешавад
 * Ҳимоя мемонад (сафар, беморӣ, имтиҳон), вале ғоиби дуҳафтаина силсиларо
 * наҷот дода наметавонад — пас рақам боз маъно пайдо мекунад.
 *
 * Пуркунӣ КАСАЛ аст (lazy): ҳангоми кушодани барнома иҷро мешавад, на бо cron.
 * Барои ин як cron-и нав сохтан лозим намеояд ва корбари ғоиб бесабаб пур
 * намешавад.
 */

import { prisma } from './prisma';
import { DEFAULT_TZ_OFFSET_MIN } from './localDay';

/** Ҳадди нигоҳдорӣ барои корбари ройгон. */
export const FREE_FREEZE_CAP = 1;
/** Ҳадди нигоҳдорӣ барои Premium/промо. */
export const PREMIUM_FREEZE_CAP = 2;

export function freezeCap(isPremium: boolean): number {
  return isPremium ? PREMIUM_FREEZE_CAP : FREE_FREEZE_CAP;
}

/**
 * Ҳадди мутлақи нигоҳдорӣ — ба ҲАМА баробар, харид ҳам аз он нагузарад.
 * Бе ин, корбари ройгон бо 1000 гем панҷ freeze мехарид ва қоидаи «силсила
 * бояд шикаста тавонад» бо пул убур мешуд.
 */
export const MAX_FREEZES_HELD = PREMIUM_FREEZE_CAP;

/** Калиди `YYYY-MM` дар вақти маҳаллии корбар. */
function monthKey(d: Date, tzOffsetMin: number): string {
  return new Date(d.getTime() + tzOffsetMin * 60_000).toISOString().slice(0, 7);
}

/**
 * Оё ин корбар дар моҳи ҷорӣ пуркунӣ гирифтааст?
 * Функсияи пок — барои тест.
 */
export function needsRefill(
  u: { freezesRefilledAt: Date | null; tzOffsetMin?: number | null },
  now: Date,
): boolean {
  if (!u.freezesRefilledAt) return true;
  const tz = u.tzOffsetMin ?? DEFAULT_TZ_OFFSET_MIN;
  return monthKey(u.freezesRefilledAt, tz) !== monthKey(now, tz);
}

/**
 * Ҳисоби нави freeze пас аз пуркунии моҳона.
 * Функсияи пок — ҳеҷ гоҳ рақамро КАМ намекунад: агар корбар бо гем харида
 * бошад ва аз ҳад зиёд дошта бошад, харидаш нест намешавад.
 */
export function refilledCount(current: number, isPremium: boolean): number {
  return Math.max(current, freezeCap(isPremium));
}

type FreezeUser = {
  streak: number;
  lastActiveDate: Date | null;
  tzOffsetMin: number | null;
  streakFreezesAvailable: number;
  streakFreezesUsed: number;
};

/**
 * Пуркунии моҳонаро иҷро мекунад ва корбари НАВШУДА-ро бармегардонад
 * (ё `null`, агар корбар набошад ё пуркунӣ лозим набошад — он гоҳ даъваткунанда
 * худаш мехонад).
 */
export async function refillMonthlyFreezes(
  userId: string,
  now = new Date(),
): Promise<FreezeUser | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streak: true, lastActiveDate: true, tzOffsetMin: true,
      streakFreezesAvailable: true, streakFreezesUsed: true,
      freezesRefilledAt: true, isPremium: true, premiumPlan: true, premiumExpiresAt: true,
    },
  });
  if (!u) return null;
  if (!needsRefill(u, now)) return u;

  const isPremium =
    u.isPremium && (u.premiumPlan === 'lifetime' || (!!u.premiumExpiresAt && u.premiumExpiresAt >= now));
  const streakFreezesAvailable = refilledCount(u.streakFreezesAvailable, isPremium);

  await prisma.user.update({
    where: { id: userId },
    data: { streakFreezesAvailable, freezesRefilledAt: now },
  });
  return { ...u, streakFreezesAvailable };
}
