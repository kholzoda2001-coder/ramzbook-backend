import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Achievement definitions (source of truth). Seeded idempotently by `code`.
// conditionType is matched against the metrics computed in computeMetrics().
// ─────────────────────────────────────────────────────────────────────────────

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
    name: 'Қадами аввал',
    nameTranslations: { tg: 'Қадами аввал', ru: 'Первый шаг', en: 'First Step', uz: 'Birinchi qadam' },
    emoji: '👶',
    description: 'Аввалин дарсро хатм кунед',
    descriptionTranslations: { tg: 'Аввалин дарсро хатм кунед', ru: 'Завершите первый урок', en: 'Complete your first lesson', uz: 'Birinchi darsni tugating' },
    rarity: 'common', conditionType: 'lessons', conditionValue: 1, xpReward: 0, gemsReward: 10,
  },
  {
    code: 'streak_7',
    name: 'Шогирди ҷидӣ',
    nameTranslations: { tg: 'Шогирди ҷидӣ', ru: 'Усердный ученик', en: 'Dedicated Learner', uz: 'Tirishqoq shogird' },
    emoji: '🔥',
    description: '7 рӯзи паиҳам омӯзед',
    descriptionTranslations: { tg: '7 рӯзи паиҳам омӯзед', ru: '7 дней подряд', en: '7-day streak', uz: '7 kun ketma-ket' },
    rarity: 'rare', conditionType: 'streak', conditionValue: 7, xpReward: 0, gemsReward: 50,
  },
  {
    code: 'xp_100',
    name: '100 XP',
    nameTranslations: { tg: '100 XP', ru: '100 XP', en: '100 XP', uz: '100 XP' },
    emoji: '⭐',
    description: '100 XP ҷамъ кунед',
    descriptionTranslations: { tg: '100 XP ҷамъ кунед', ru: 'Наберите 100 XP', en: 'Earn 100 XP', uz: '100 XP to‘plang' },
    rarity: 'common', conditionType: 'xp', conditionValue: 100, xpReward: 0, gemsReward: 20,
  },
  {
    code: 'lessons_10',
    name: '10 дарс',
    nameTranslations: { tg: '10 дарс', ru: '10 уроков', en: '10 Lessons', uz: '10 dars' },
    emoji: '📚',
    description: '10 дарсро хатм кунед',
    descriptionTranslations: { tg: '10 дарсро хатм кунед', ru: 'Завершите 10 уроков', en: 'Complete 10 lessons', uz: '10 darsni tugating' },
    rarity: 'rare', conditionType: 'lessons', conditionValue: 10, xpReward: 0, gemsReward: 50,
  },
  {
    code: 'words_50',
    name: '50 калима',
    nameTranslations: { tg: '50 калима', ru: '50 слов', en: '50 Words', uz: '50 so‘z' },
    emoji: '📖',
    description: '50 калима омӯзед',
    descriptionTranslations: { tg: '50 калима омӯзед', ru: 'Выучите 50 слов', en: 'Learn 50 words', uz: '50 so‘z o‘rganing' },
    rarity: 'rare', conditionType: 'words', conditionValue: 50, xpReward: 0, gemsReward: 30,
  },
  {
    code: 'perfect_lesson',
    name: 'Камолот',
    nameTranslations: { tg: 'Камолот', ru: 'Совершенство', en: 'Perfection', uz: 'Mukammallik' },
    emoji: '💎',
    description: 'Дарсро бе хато хатм кунед',
    descriptionTranslations: { tg: 'Дарсро бе хато хатм кунед', ru: 'Завершите урок без ошибок', en: 'Complete a lesson with no mistakes', uz: 'Darsni xatosiz tugating' },
    rarity: 'rare', conditionType: 'perfect_lessons', conditionValue: 1, xpReward: 0, gemsReward: 25,
  },
  {
    code: 'streak_30',
    name: '30 рӯзи Streak',
    nameTranslations: { tg: '30 рӯзи Streak', ru: 'Серия 30 дней', en: '30-Day Streak', uz: '30 kunlik seriya' },
    emoji: '🏆',
    description: '30 рӯзи паиҳам омӯзед',
    descriptionTranslations: { tg: '30 рӯзи паиҳам омӯзед', ru: '30 дней подряд', en: '30-day streak', uz: '30 kun ketma-ket' },
    rarity: 'epic', conditionType: 'streak', conditionValue: 30, xpReward: 0, gemsReward: 200,
  },
  {
    code: 'course_complete',
    name: 'Курс тамом',
    nameTranslations: { tg: 'Курс тамом', ru: 'Курс завершён', en: 'Course Complete', uz: 'Kurs tugadi' },
    emoji: '🎓',
    description: 'Тамоми дарсҳои як курсро хатм кунед',
    descriptionTranslations: { tg: 'Тамоми дарсҳои як курсро хатм кунед', ru: 'Завершите все уроки курса', en: 'Complete every lesson in a course', uz: 'Kursning barcha darslarini tugating' },
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
 * Awards gems (and xp, if any) directly — does NOT call awardXp to avoid recursion.
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
        continue; // unique race — already earned
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
