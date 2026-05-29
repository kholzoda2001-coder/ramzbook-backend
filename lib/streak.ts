import { prisma } from './prisma';

function getDateString(date: Date): string {
  // Add 5 hours for Tajikistan (UTC+5) to get the correct local date string
  const tjDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
  return tjDate.toISOString().split('T')[0];
}

export async function updateStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  
  const today = getDateString(new Date());
  const lastActive = user.lastActiveDate ? getDateString(user.lastActiveDate) : null;
  
  if (lastActive === today) return { streak: user.streak };
  
  const yesterday = getDateString(new Date(Date.now() - 86400000));
  
  if (lastActive === yesterday) {
    const newStreak = user.streak + 1;
    await prisma.user.update({
      where: { id: userId },
      data: {
        streak: newStreak,
        longestStreak: Math.max(user.longestStreak, newStreak),
        lastActiveDate: new Date(),
      },
    });
    return { streak: newStreak };
  }
  
  // Missed day(s)
  if (lastActive && lastActive < yesterday) {
    if (user.streakFreezesAvailable > 0) {
      // Use freeze automatically
      await prisma.user.update({
        where: { id: userId },
        data: {
          streakFreezesAvailable: user.streakFreezesAvailable - 1,
          streakFreezesUsed: user.streakFreezesUsed + 1,
          lastActiveDate: new Date(),
        },
      });
      return { streak: user.streak, freezeUsed: true };
    }
    
    // Reset streak
    await prisma.user.update({
      where: { id: userId },
      data: { streak: 1, lastActiveDate: new Date() },
    });
    return { streak: 1, streakReset: true };
  }
  
  // First time
  await prisma.user.update({
    where: { id: userId },
    data: { streak: 1, lastActiveDate: new Date() },
  });
  return { streak: 1 };
}

export async function repairStreak(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.isPremium) throw new Error('Premium required');
  
  // Restore from longestStreak (only available for Premium)
  await prisma.user.update({
    where: { id: userId },
    data: {
      streak: user.longestStreak,
      lastActiveDate: new Date(),
    },
  });
  
  return { streak: user.longestStreak };
}
