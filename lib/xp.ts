import { prisma } from './prisma';
import { evaluateAchievements, type UnlockedAchievement } from './achievements';
import { addWeeklyXp } from './league';
import { DEFAULT_TZ_OFFSET_MIN, localDayKey } from './localDay';
import { decayStreak } from './streakDisplay';
import { refillMonthlyFreezes } from './streakFreezes';

// ─────────────────────────────────────────────────────────────────────────────
// Central XP award pipeline. EVERY place XP is earned must call awardXp() so that
// totalXp, weeklyXp, the per-day DailyXp log, the streak, and achievements all
// stay consistent.
// ─────────────────────────────────────────────────────────────────────────────

/** Midnight (UTC) of the given day — matches Prisma `@db.Date` storage. */
function dateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

// `dateString` (рӯзи UTC) бардошта шуд — силсила акнун бо рӯзи МАҲАЛЛӢ ҳисоб
// мешавад (ниг. `localDayKey`). `dateOnly` мемонад: он калиди сатри `DailyXp`
// аст (`@db.Date`) ва сатрҳои мавҷуда бо ҳамон UTC навишта шудаанд — иваз
// кардани он графики ҳафтаинаро ҷобаҷо мекунад, ки кори алоҳидаи муҳоҷират аст.

// `DEFAULT_TZ_OFFSET_MIN` ва `localDayKey` ба `lib/localDay.ts` кӯчиданд, то
// ҳамин як таъриф ҳам ин ҷо, ҳам дар `lib/streakDisplay.ts` кор кунад.

export type AwardXpResult = {
  totalXp: number;
  weeklyXp: number;
  streak: number;
  newAchievements: UnlockedAchievement[];
};

/**
 * Awards XP to a user and keeps all derived state in sync.
 * @param source  XP source label for the daily breakdown (lesson | perfect | achievement | daily_goal | streak_bonus)
 */
export async function awardXp(
  userId: string,
  amount: number,
  source = 'lesson',
): Promise<AwardXpResult> {
  const safeAmount = Math.max(0, Math.round(amount || 0));
  const now = new Date();
  const today = dateOnly(now);

  // 1. Increment running totals
  await prisma.user.update({
    where: { id: userId },
    data: {
      totalXp: { increment: safeAmount },
      weeklyXp: { increment: safeAmount },
      lastActiveAt: now,
      // Корбар боз фаъол шуд → занҷири win-back (3/7/14/30) аз сар оғоз меёбад.
      // Бе ин, касе ки як бор баргашт, дигар ҳеҷ гоҳ win-back намегирифт.
      winbackStage: 0,
    },
  });

  // 2. Upsert today's DailyXp row (read-modify-write to merge the source breakdown)
  if (safeAmount > 0) {
    const existing = await prisma.dailyXp.findUnique({
      where: { userId_date: { userId, date: today } },
    });
    const prevSource = (existing?.source as Record<string, number> | null) ?? {};
    const mergedSource = { ...prevSource, [source]: (prevSource[source] ?? 0) + safeAmount };

    await prisma.dailyXp.upsert({
      where: { userId_date: { userId, date: today } },
      create: { userId, date: today, xp: safeAmount, source: mergedSource },
      update: { xp: { increment: safeAmount }, source: mergedSource },
    });
  }

  // 3. Лига — ҳисобкунаки XP-и ҳафтаинаи узвият.
  //
  // ⚠️ Ин ҷо ЗИЁД мешавад, на ҳангоми хондан аз таърих ҷамъ карда мешавад:
  // ҷамъи `DailyXp` дар ҳар дархости ҷадвал барои когортаи 30-нафара 30 ҷамъи
  // алоҳида мешуд. `addWeeklyXp` ҳеҷ гоҳ намепартояд — лига набояд мукофоти
  // XP-и дарсро вайрон кунад.
  await addWeeklyXp(userId, safeAmount, now);

  // 4. Advance streak (only the first XP of the day moves it)
  const streak = await advanceStreak(userId, now);

  // 5. Evaluate achievements
  const newAchievements = await evaluateAchievements(userId);

  const fresh = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true, weeklyXp: true },
  });

  return {
    totalXp: fresh?.totalXp ?? 0,
    weeklyXp: fresh?.weeklyXp ?? 0,
    streak,
    newAchievements,
  };
}

/**
 * Advances the streak when the user earns XP.
 *  - already active today  → unchanged
 *  - otherwise             → (streak after decay) + 1
 *
 * ⚠️ Пеш ин ҷо `last === yesterday ? streak + 1 : 1` буд — яъне ҳар танаффус
 * силсиларо ба 1 мепартофт. Акнун қоида зинапоя аст (ҳар рӯзи холӣ −1), пас
 * шумораи нав аз рақами КОҲИШЁФТА оғоз мешавад, на аз сифр. Мисол: 🔥10, чор
 * рӯз нахонд, рӯзи панҷум омад → 10−4 = 6, +1 = 🔥7.
 *
 * Ҳамин ҷо freeze низ сарф мешавад: агар корбар рост ба дарс дарояд ва
 * `GET /users/stats` даъват нашавад, ҳимоя бояд ҳамон тавр кор кунад.
 */
export async function advanceStreak(userId: string, now = new Date()): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      streak: true, longestStreak: true, lastActiveDate: true, tzOffsetMin: true,
      streakFreezesAvailable: true, streakFreezesUsed: true,
    },
  });
  if (!user) return 0;

  const tz = user.tzOffsetMin ?? DEFAULT_TZ_OFFSET_MIN;
  const today = localDayKey(now, tz);
  const last = user.lastActiveDate ? localDayKey(user.lastActiveDate, tz) : null;
  if (last === today) return user.streak; // already counted today

  const decayed = decayStreak(user, now);
  const newStreak = decayed.streak + 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastActiveDate: new Date(),
      ...(decayed.freezesSpent > 0 && {
        streakFreezesAvailable: user.streakFreezesAvailable - decayed.freezesSpent,
        streakFreezesUsed: user.streakFreezesUsed + decayed.freezesSpent,
      }),
    },
  });
  return newStreak;
}

/**
 * Streak DECAY check, called when the app opens (GET /users/stats).
 * Never advances the streak — only applies the day-by-day decay for missed
 * days (spending freezes first, one per day). Keeps the stored streak honest.
 */
export async function checkStreakDecay(userId: string, now = new Date()): Promise<number> {
  return (await checkStreakDecayDetailed(userId, now)).streak;
}

/**
 * Ҳамон мантиқ, вале мегӯяд ки ЧӢ рӯй дод.
 *
 * Чаро лозим шуд: freeze хомӯшона сарф мешуд — корбар ҳеҷ гоҳ намедонист, ки
 * streak-и 12-рӯзааш наҷот ёфт. Ин яке аз қавитарин лаҳзаҳои нигоҳдорӣ аст ва
 * бе он арзиши freeze (ва Premium, ки онро мефурӯшад) ноаён мемонад.
 *
 * `streakLost` акнун «чанд ЗИНА гум шуд» аст (қоидаи зинапоя), на «силсилаи
 * пурра сӯхт» — қоидаҳо дар `lib/streakDisplay.ts`.
 */
export async function checkStreakDecayDetailed(
  userId: string,
  now = new Date(),
): Promise<{ streak: number; freezeUsed: boolean; streakLost: number }> {
  const fresh = await refillMonthlyFreezes(userId, now);
  const user = fresh ?? await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActiveDate: true, streakFreezesAvailable: true, streakFreezesUsed: true, tzOffsetMin: true },
  });
  if (!user) return { streak: 0, freezeUsed: false, streakLost: 0 };

  const decayed = decayStreak(user, now);
  if (decayed.missedDays === 0) {
    return { streak: user.streak, freezeUsed: false, streakLost: 0 };
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: decayed.streak,
      ...(decayed.freezesSpent > 0 && {
        streakFreezesAvailable: user.streakFreezesAvailable - decayed.freezesSpent,
        streakFreezesUsed: user.streakFreezesUsed + decayed.freezesSpent,
      }),
      // «Гӯё дирӯз фаъол буд» — то ҳамин рӯзҳо дубора коҳиш надиҳанд. Ин
      // майдонро `pushSegments`/`paywall` танҳо барои «ИМРӮЗ хондааст?»
      // мехонанд, пас дирӯз гузоштан онҳоро гумроҳ намекунад.
      lastActiveDate: new Date(now.getTime() - 86400000),
    },
  });
  return { streak: decayed.streak, freezeUsed: decayed.freezesSpent > 0, streakLost: decayed.daysLost };
}
