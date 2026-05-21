import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const REGEN_INTERVAL_MIN = 30;
const MAX_HEARTS_FREE = 5;

// Helper: Get Date String
function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

// 1. Hearts Regeneration (Runs every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  console.log('[CRON] Regenerating hearts...');
  try {
    const now = new Date();
    // Find users who have less than max hearts and aren't premium
    const users = await prisma.user.findMany({
      where: {
        isPremium: false,
        hearts: { lt: MAX_HEARTS_FREE }
      }
    });

    for (const user of users) {
      const lastRegen = new Date(user.lastHeartRegen);
      const minutesPassed = Math.floor((now.getTime() - lastRegen.getTime()) / 1000 / 60);
      const heartsToAdd = Math.floor(minutesPassed / REGEN_INTERVAL_MIN);
      
      if (heartsToAdd > 0) {
        const newHearts = Math.min(MAX_HEARTS_FREE, user.hearts + heartsToAdd);
        const remainingMin = minutesPassed - (heartsToAdd * REGEN_INTERVAL_MIN);
        const newLastRegen = new Date(now.getTime() - remainingMin * 60 * 1000);
        
        await prisma.user.update({
          where: { id: user.id },
          data: {
            hearts: newHearts,
            lastHeartRegen: newLastRegen
          }
        });
      }
    }
    console.log(`[CRON] Processed hearts for ${users.length} users.`);
  } catch (error) {
    console.error('[CRON] Error regenerating hearts:', error);
  }
});

// 2. Streak Checker & Freezer (Runs every day at 00:01)
cron.schedule('1 0 * * *', async () => {
  console.log('[CRON] Checking streaks...');
  try {
    const yesterdayDate = new Date(Date.now() - 86400000);
    const yesterday = getDateString(yesterdayDate);
    const dayBeforeYesterday = getDateString(new Date(Date.now() - 86400000 * 2));

    // Find users who haven't been active today or yesterday
    const usersToFreezeOrReset = await prisma.user.findMany({
      where: {
        streak: { gt: 0 },
      }
    });

    for (const user of usersToFreezeOrReset) {
      const lastActive = user.lastActiveDate ? getDateString(user.lastActiveDate) : null;
      
      // If last active was before yesterday, they missed a day
      if (lastActive && lastActive <= dayBeforeYesterday) {
        if (user.streakFreezesAvailable > 0) {
          // Auto use freeze
          await prisma.user.update({
            where: { id: user.id },
            data: {
              streakFreezesAvailable: user.streakFreezesAvailable - 1,
              streakFreezesUsed: user.streakFreezesUsed + 1,
              // Update lastActiveDate so we don't freeze them again tomorrow if they have another freeze
              lastActiveDate: yesterdayDate, 
            }
          });
          console.log(`[CRON] Used streak freeze for user ${user.id}`);
        } else {
          // Reset streak
          await prisma.user.update({
            where: { id: user.id },
            data: { streak: 0 }
          });
          console.log(`[CRON] Reset streak for user ${user.id}`);
        }
      }
    }
  } catch (error) {
    console.error('[CRON] Error checking streaks:', error);
  }
});

// 3. Premium Expiration Checker (Runs every hour)
cron.schedule('0 * * * *', async () => {
  console.log('[CRON] Checking premium expirations...');
  try {
    const now = new Date();
    
    // Find expired subscriptions
    const expiredUsers = await prisma.user.findMany({
      where: {
        isPremium: true,
        premiumExpiresAt: { lt: now },
        premiumPlan: { not: 'lifetime' }
      }
    });

    for (const user of expiredUsers) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          isPremium: false,
          premiumPlan: null,
          premiumExpiresAt: null,
          hearts: 5,
          maxHearts: 5,
          streakFreezesAvailable: 1
        }
      });
      console.log(`[CRON] Revoked premium for user ${user.id}`);
    }
  } catch (error) {
    console.error('[CRON] Error checking premium expirations:', error);
  }
});

// 4. Daily Task Reset (Runs every day at 00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('[CRON] Resetting Daily Tasks...');
  // Logic to assign new daily tasks to active users
});

console.log('[CRON] Scheduler started.');
