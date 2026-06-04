import { prisma } from './prisma';

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Achievement definitions (source of truth). Seeded idempotently by `code`.
// conditionType is matched against the metrics computed in computeMetrics().
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type AchievementSeed = {
  code: string;
  name: string;
  nameTranslations: Record<string, string>;
  emoji: string;
  description: string;
  descriptionTranslations: Record<string, string>;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  conditionType: 'lessons' | 'streak' | 'xp' | 'words' | 'perfect_lessons' | 'course_complete' | 'premium';
  conditionValue: number;
  xpReward: number;
  gemsReward: number;
};

export const ACHIEVEMENTS: AchievementSeed[] = [
  {
    code: 'first_step',
    name: 'ÒšÐ°Ð´Ð°Ð¼Ð¸ Ð°Ð²Ð²Ð°Ð»',
    nameTranslations: { tg: 'ÒšÐ°Ð´Ð°Ð¼Ð¸ Ð°Ð²Ð²Ð°Ð»', ru: 'ÐŸÐµÑ€Ð²Ñ‹Ð¹ ÑˆÐ°Ð³', en: 'First Step'},
    emoji: 'ðŸ‘¶',
    description: 'ÐÐ²Ð²Ð°Ð»Ð¸Ð½ Ð´Ð°Ñ€ÑÑ€Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´',
    descriptionTranslations: { tg: 'ÐÐ²Ð²Ð°Ð»Ð¸Ð½ Ð´Ð°Ñ€ÑÑ€Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´', ru: 'Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ð¿ÐµÑ€Ð²Ñ‹Ð¹ ÑƒÑ€Ð¾Ðº', en: 'Complete your first lesson'},
    rarity: 'common', conditionType: 'lessons', conditionValue: 1, xpReward: 0, gemsReward: 10,
  },
  {
    code: 'streak_7',
    name: 'Ð¨Ð¾Ð³Ð¸Ñ€Ð´Ð¸ Ò·Ð¸Ð´Ó£',
    nameTranslations: { tg: 'Ð¨Ð¾Ð³Ð¸Ñ€Ð´Ð¸ Ò·Ð¸Ð´Ó£', ru: 'Ð£ÑÐµÑ€Ð´Ð½Ñ‹Ð¹ ÑƒÑ‡ÐµÐ½Ð¸Ðº', en: 'Dedicated Learner'},
    emoji: 'ðŸ”¥',
    description: '7 Ñ€Ó¯Ð·Ð¸ Ð¿Ð°Ð¸Ò³Ð°Ð¼ Ð¾Ð¼Ó¯Ð·ÐµÐ´',
    descriptionTranslations: { tg: '7 Ñ€Ó¯Ð·Ð¸ Ð¿Ð°Ð¸Ò³Ð°Ð¼ Ð¾Ð¼Ó¯Ð·ÐµÐ´', ru: '7 Ð´Ð½ÐµÐ¹ Ð¿Ð¾Ð´Ñ€ÑÐ´', en: '7-day streak'},
    rarity: 'rare', conditionType: 'streak', conditionValue: 7, xpReward: 0, gemsReward: 50,
  },
  {
    code: 'xp_100',
    name: '100 XP',
    nameTranslations: { tg: '100 XP', ru: '100 XP', en: '100 XP'},
    emoji: 'â­',
    description: '100 XP Ò·Ð°Ð¼ÑŠ ÐºÑƒÐ½ÐµÐ´',
    descriptionTranslations: { tg: '100 XP Ò·Ð°Ð¼ÑŠ ÐºÑƒÐ½ÐµÐ´', ru: 'ÐÐ°Ð±ÐµÑ€Ð¸Ñ‚Ðµ 100 XP', en: 'Earn 100 XP'},
    rarity: 'common', conditionType: 'xp', conditionValue: 100, xpReward: 0, gemsReward: 20,
  },
  {
    code: 'lessons_10',
    name: '10 Ð´Ð°Ñ€Ñ',
    nameTranslations: { tg: '10 Ð´Ð°Ñ€Ñ', ru: '10 ÑƒÑ€Ð¾ÐºÐ¾Ð²', en: '10 Lessons'},
    emoji: 'ðŸ“š',
    description: '10 Ð´Ð°Ñ€ÑÑ€Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´',
    descriptionTranslations: { tg: '10 Ð´Ð°Ñ€ÑÑ€Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´', ru: 'Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ 10 ÑƒÑ€Ð¾ÐºÐ¾Ð²', en: 'Complete 10 lessons'},
    rarity: 'rare', conditionType: 'lessons', conditionValue: 10, xpReward: 0, gemsReward: 50,
  },
  {
    code: 'words_50',
    name: '50 ÐºÐ°Ð»Ð¸Ð¼Ð°',
    nameTranslations: { tg: '50 ÐºÐ°Ð»Ð¸Ð¼Ð°', ru: '50 ÑÐ»Ð¾Ð²', en: '50 Words'},
    emoji: 'ðŸ“–',
    description: '50 ÐºÐ°Ð»Ð¸Ð¼Ð° Ð¾Ð¼Ó¯Ð·ÐµÐ´',
    descriptionTranslations: { tg: '50 ÐºÐ°Ð»Ð¸Ð¼Ð° Ð¾Ð¼Ó¯Ð·ÐµÐ´', ru: 'Ð’Ñ‹ÑƒÑ‡Ð¸Ñ‚Ðµ 50 ÑÐ»Ð¾Ð²', en: 'Learn 50 words'},
    rarity: 'rare', conditionType: 'words', conditionValue: 50, xpReward: 0, gemsReward: 30,
  },
  {
    code: 'perfect_lesson',
    name: 'ÐšÐ°Ð¼Ð¾Ð»Ð¾Ñ‚',
    nameTranslations: { tg: 'ÐšÐ°Ð¼Ð¾Ð»Ð¾Ñ‚', ru: 'Ð¡Ð¾Ð²ÐµÑ€ÑˆÐµÐ½ÑÑ‚Ð²Ð¾', en: 'Perfection'},
    emoji: 'ðŸ’Ž',
    description: 'Ð”Ð°Ñ€ÑÑ€Ð¾ Ð±Ðµ Ñ…Ð°Ñ‚Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´',
    descriptionTranslations: { tg: 'Ð”Ð°Ñ€ÑÑ€Ð¾ Ð±Ðµ Ñ…Ð°Ñ‚Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´', ru: 'Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ ÑƒÑ€Ð¾Ðº Ð±ÐµÐ· Ð¾ÑˆÐ¸Ð±Ð¾Ðº', en: 'Complete a lesson with no mistakes'},
    rarity: 'rare', conditionType: 'perfect_lessons', conditionValue: 1, xpReward: 0, gemsReward: 25,
  },
  {
    code: 'streak_30',
    name: '30 Ñ€Ó¯Ð·Ð¸ Streak',
    nameTranslations: { tg: '30 Ñ€Ó¯Ð·Ð¸ Streak', ru: 'Ð¡ÐµÑ€Ð¸Ñ 30 Ð´Ð½ÐµÐ¹', en: '30-Day Streak'},
    emoji: 'ðŸ†',
    description: '30 Ñ€Ó¯Ð·Ð¸ Ð¿Ð°Ð¸Ò³Ð°Ð¼ Ð¾Ð¼Ó¯Ð·ÐµÐ´',
    descriptionTranslations: { tg: '30 Ñ€Ó¯Ð·Ð¸ Ð¿Ð°Ð¸Ò³Ð°Ð¼ Ð¾Ð¼Ó¯Ð·ÐµÐ´', ru: '30 Ð´Ð½ÐµÐ¹ Ð¿Ð¾Ð´Ñ€ÑÐ´', en: '30-day streak'},
    rarity: 'epic', conditionType: 'streak', conditionValue: 30, xpReward: 0, gemsReward: 200,
  },
  {
    code: 'course_complete',
    name: 'ÐšÑƒÑ€Ñ Ñ‚Ð°Ð¼Ð¾Ð¼',
    nameTranslations: { tg: 'ÐšÑƒÑ€Ñ Ñ‚Ð°Ð¼Ð¾Ð¼', ru: 'ÐšÑƒÑ€Ñ Ð·Ð°Ð²ÐµÑ€ÑˆÑ‘Ð½', en: 'Course Complete'},
    emoji: 'ðŸŽ“',
    description: 'Ð¢Ð°Ð¼Ð¾Ð¼Ð¸ Ð´Ð°Ñ€ÑÒ³Ð¾Ð¸ ÑÐº ÐºÑƒÑ€ÑÑ€Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´',
    descriptionTranslations: { tg: 'Ð¢Ð°Ð¼Ð¾Ð¼Ð¸ Ð´Ð°Ñ€ÑÒ³Ð¾Ð¸ ÑÐº ÐºÑƒÑ€ÑÑ€Ð¾ Ñ…Ð°Ñ‚Ð¼ ÐºÑƒÐ½ÐµÐ´', ru: 'Ð—Ð°Ð²ÐµÑ€ÑˆÐ¸Ñ‚Ðµ Ð²ÑÐµ ÑƒÑ€Ð¾ÐºÐ¸ ÐºÑƒÑ€ÑÐ°', en: 'Complete every lesson in a course'},
    rarity: 'legendary', conditionType: 'course_complete', conditionValue: 1, xpReward: 0, gemsReward: 500,
  },
];

/** Insert any missing achievements (idempotent by `code`). Safe to call often. */
export async function ensureAchievementsSeeded(): Promise<void> {
  const existing = await prisma.achievement.findMany({ select: { code: true } });
  const have = new Set(existing.map((a) => a.code));
  const missing = ACHIEVEMENTS.filter((a) => !have.has(a.code));
  if (missing.length === 0) return;
  await prisma.achievement.createMany({
    data: missing.map((a) => ({
      code: a.code,
      name: a.name,
      nameTranslations: a.nameTranslations,
      emoji: a.emoji,
      description: a.description,
      descriptionTranslations: a.descriptionTranslations,
      rarity: a.rarity,
      conditionType: a.conditionType,
      conditionValue: a.conditionValue,
      xpReward: a.xpReward,
      gemsReward: a.gemsReward,
    })),
    skipDuplicates: true,
  });
}

export type AchievementMetrics = {
  lessons: number;
  streak: number;
  xp: number;
  words: number;
  perfect_lessons: number;
  course_complete: number;
  premium: number;
};

/** Compute all metrics the achievement conditions are evaluated against. */
export async function computeMetrics(userId: string): Promise<AchievementMetrics> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { totalXp: true, streak: true, longestStreak: true, isPremium: true },
  });

  const completed = await prisma.userProgress.findMany({
    where: { userId, isCompleted: true },
    select: { lessonId: true, accuracy: true },
  });

  const lessons = completed.length;
  const perfect_lessons = completed.filter((p) => p.accuracy >= 100).length;

  const lessonIds = completed.map((c) => c.lessonId);
  const words = lessonIds.length
    ? await prisma.word.count({ where: { lessonId: { in: lessonIds } } })
    : 0;

  // course_complete: any course whose every lesson is in the completed set
  let course_complete = 0;
  if (lessonIds.length > 0) {
    const completedSet = new Set(lessonIds);
    const courses = await prisma.course.findMany({
      select: { id: true, modules: { select: { lessons: { select: { id: true } } } } },
    });
    for (const c of courses) {
      const all = c.modules.flatMap((m) => m.lessons.map((l) => l.id));
      if (all.length > 0 && all.every((id) => completedSet.has(id))) {
        course_complete = 1;
        break;
      }
    }
  }

  return {
    lessons,
    streak: Math.max(user?.streak ?? 0, user?.longestStreak ?? 0),
    xp: user?.totalXp ?? 0,
    words,
    perfect_lessons,
    course_complete,
    premium: user?.isPremium ? 1 : 0,
  };
}

export type UnlockedAchievement = {
  code: string;
  name: string;
  emoji: string;
  gemsReward: number;
  xpReward: number;
};

/**
 * Evaluates all achievements for a user and unlocks any newly-earned ones.
 * Awards gems (and xp, if any) directly â€” does NOT call awardXp to avoid recursion.
 * Returns the list of newly-unlocked achievements (for client toasts).
 */
export async function evaluateAchievements(userId: string): Promise<UnlockedAchievement[]> {
  await ensureAchievementsSeeded();

  const [all, earned, metrics] = await Promise.all([
    prisma.achievement.findMany(),
    prisma.userAchievement.findMany({ where: { userId }, select: { achievementId: true } }),
    computeMetrics(userId),
  ]);

  const earnedSet = new Set(earned.map((e) => e.achievementId));
  const newly: UnlockedAchievement[] = [];
  let gemsToAdd = 0;
  let xpToAdd = 0;

  for (const a of all) {
    if (earnedSet.has(a.id)) continue;
    const metric = (metrics as Record<string, number>)[a.conditionType] ?? 0;
    if (metric >= a.conditionValue) {
      try {
        await prisma.userAchievement.create({ data: { userId, achievementId: a.id } });
      } catch {
        continue; // unique race â€” already earned
      }
      gemsToAdd += a.gemsReward;
      xpToAdd += a.xpReward;
      newly.push({ code: a.code, name: a.name, emoji: a.emoji, gemsReward: a.gemsReward, xpReward: a.xpReward });
    }
  }

  if (gemsToAdd > 0 || xpToAdd > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        gems: { increment: gemsToAdd },
        // xp reward added directly (no recursion into awardXp)
        ...(xpToAdd > 0 ? { totalXp: { increment: xpToAdd }, weeklyXp: { increment: xpToAdd } } : {}),
      },
    });
    if (gemsToAdd > 0) {
      await prisma.gemTransaction.create({
        data: { userId, amount: gemsToAdd, reason: 'achievement_unlock' },
      });
    }
  }

  return newly;
}

