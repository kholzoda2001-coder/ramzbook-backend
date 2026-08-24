import { prisma } from './prisma';
import { evaluateAchievements, type UnlockedAchievement } from './achievements';

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

/**
 * Минтақаи вақти пешфарз, вақте дастгоҳи корбар онро ҳанӯз нагуфтааст:
 * Душанбе (UTC+5). Аксарияти мутлақи хонандагон он ҷоянд, пас ин тахмин
 * барои онҳо АЙНАН дуруст аст, на тахмини бетараф.
 */
const DEFAULT_TZ_OFFSET_MIN = 300;

/**
 * «Рӯз» аз нигоҳи ХОНАНДА — калиди `YYYY-MM-DD` дар минтақаи вақти худи ӯ.
 *
 * ЧАРО ин лозим шуд: силсила бо рӯзи UTC ҳисоб мешуд, яъне барои хонандаи
 * тоҷик рӯз соати **05:00 бомдод** иваз мешуд, на дар нимишаб. Ду оқибати
 * воқеӣ дошт:
 *   • касе, ки соати 01:00-и шаб дарс мехонд, онро ба ДИРӮЗ навишта мешуд —
 *     яъне «имрӯз» ҳанӯз холӣ буд ва силсилааш метавонист бишканад;
 *   • огоҳии «то нимишаб фалон вақт монд» бо ҳақиқат мувофиқ намеомад.
 * Акнун нимишаби корбар ҳам дар матн, ҳам дар муҳаррик ҳамон як лаҳза аст.
 */
function localDayKey(d: Date, tzOffsetMin: number): string {
  return new Date(d.getTime() + tzOffsetMin * 60_000).toISOString().split('T')[0];
}

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

  // 3. Advance streak (only the first XP of the day moves it)
  const streak = await advanceStreak(userId, now);

  // 4. Evaluate achievements
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
 *  - first XP ever / after a break  → streak = 1
 *  - consecutive day                → streak + 1
 *  - already active today           → unchanged
 */
export async function advanceStreak(userId: string, now = new Date()): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, longestStreak: true, lastActiveDate: true, tzOffsetMin: true },
  });
  if (!user) return 0;

  const tz = user.tzOffsetMin ?? DEFAULT_TZ_OFFSET_MIN;
  const today = localDayKey(now, tz);
  const last = user.lastActiveDate ? localDayKey(user.lastActiveDate, tz) : null;
  if (last === today) return user.streak; // already counted today

  const yesterday = localDayKey(new Date(now.getTime() - 86400000), tz);
  const newStreak = last === yesterday ? user.streak + 1 : 1;

  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastActiveDate: today === last ? user.lastActiveDate : new Date(),
    },
  });
  return newStreak;
}

/**
 * Read-only-ish streak DECAY check, called when the app opens (GET /users/stats).
 * Never advances the streak — only resets it to 0 when days were missed
 * (consuming a freeze first, if available). Keeps the displayed streak honest.
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
 */
export async function checkStreakDecayDetailed(
  userId: string,
  now = new Date(),
): Promise<{ streak: number; freezeUsed: boolean; streakLost: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streak: true, lastActiveDate: true, streakFreezesAvailable: true, streakFreezesUsed: true, tzOffsetMin: true },
  });
  if (!user) return { streak: 0, freezeUsed: false, streakLost: 0 };
  if (!user.lastActiveDate || user.streak === 0) {
    return { streak: user.streak, freezeUsed: false, streakLost: 0 };
  }

  const tz = user.tzOffsetMin ?? DEFAULT_TZ_OFFSET_MIN;
  const today = localDayKey(now, tz);
  const yesterday = localDayKey(new Date(now.getTime() - 86400000), tz);
  const last = localDayKey(user.lastActiveDate, tz);

  if (last === today || last === yesterday) {
    return { streak: user.streak, freezeUsed: false, streakLost: 0 }; // still valid
  }

  // Missed 2+ days → use a freeze if available, else reset.
  if (user.streakFreezesAvailable > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        streakFreezesAvailable: user.streakFreezesAvailable - 1,
        streakFreezesUsed: user.streakFreezesUsed + 1,
        lastActiveDate: new Date(now.getTime() - 86400000), // treat as if active yesterday
      },
    });
    return { streak: user.streak, freezeUsed: true, streakLost: 0 };
  }

  await prisma.user.update({ where: { id: userId }, data: { streak: 0 } });
  // `streakLost` — барномаро имкон медиҳад пешниҳоди барқарорсозӣ нишон диҳад.
  return { streak: 0, freezeUsed: false, streakLost: user.streak };
}
