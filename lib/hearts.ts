import { prisma } from './prisma';

const DEFAULT_REGEN_MIN = 30;
const MAX_HEARTS_FREE = 5;
const MAX_HEARTS_PREMIUM = 999;

/**
 * Суръати барқароршавии дил (дақиқа) вобаста ба сатҳ ва модул. Ҳадаф:
 * сатҳи болотар → фишори бештар барои реклама/обуна (даромад барои сервер).
 *   • A1 M1 → 1 дақ (амалан бемаҳдуд — навомӯз азоб намебинад)
 *   • A1 M2 → 30 дақ
 *   • A1 M3+ → 60 дақ
 *   • A2 → 5 соат, B1 → 12 соат, B2 → 18 соат, C1+ → 24 соат
 */
export function regenMinutesFor(level: string, moduleIndex: number): number {
  const lvl = (level || 'a1').toLowerCase();
  const idx = Number.isFinite(moduleIndex) ? moduleIndex : 0;
  switch (lvl) {
    case 'a1':
      if (idx <= 0) return 1;
      if (idx === 1) return 30;
      return 60;
    case 'a2':
      return 300;
    case 'b1':
      return 720;
    case 'b2':
      return 1080;
    default: // c1, c2 ва болотар
      return 1440;
  }
}

export async function getHearts(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  
  if (user.isPremium) {
    return {
      hearts: MAX_HEARTS_PREMIUM,
      maxHearts: MAX_HEARTS_PREMIUM,
      nextRegenSeconds: 0,
      isPremium: true,
    };
  }
  
  // Regenerate — интервал вобаста ба сатҳ+модули охирини корбар (динамикӣ).
  const regenMin = user.heartsRegenMinutes > 0 ? user.heartsRegenMinutes : DEFAULT_REGEN_MIN;
  const now = new Date();
  const lastRegen = new Date(user.lastHeartRegen);
  const minutesPassed = Math.floor((now.getTime() - lastRegen.getTime()) / 1000 / 60);
  const heartsToAdd = Math.floor(minutesPassed / regenMin);

  let newHearts = user.hearts;
  let newLastRegen = user.lastHeartRegen;

  if (heartsToAdd > 0 && user.hearts < MAX_HEARTS_FREE) {
    newHearts = Math.min(MAX_HEARTS_FREE, user.hearts + heartsToAdd);
    const remainingMin = minutesPassed - (heartsToAdd * regenMin);
    newLastRegen = new Date(now.getTime() - remainingMin * 60 * 1000);

    await prisma.user.update({
      where: { id: userId },
      data: { hearts: newHearts, lastHeartRegen: newLastRegen },
    });
  }

  // Calculate time to next heart
  let nextRegenSeconds = 0;
  if (newHearts < MAX_HEARTS_FREE) {
    const sinceLastRegen = (now.getTime() - newLastRegen.getTime()) / 1000;
    nextRegenSeconds = Math.max(0, regenMin * 60 - sinceLastRegen);
  }

  return {
    hearts: newHearts,
    maxHearts: MAX_HEARTS_FREE,
    nextRegenSeconds: Math.ceil(nextRegenSeconds),
    isPremium: false,
    regenMinutes: regenMin,
  };
}

/**
 * Суръати regen-и корбарро вобаста ба сатҳ+модуле, ки ҳозир мехонад, нав
 * мекунад. Барномаи мобилӣ ҳангоми кушодани дарс инро даъват мекунад.
 */
export async function setRegenRate(userId: string, level: string, moduleIndex: number) {
  const minutes = regenMinutesFor(level, moduleIndex);
  await prisma.user.update({
    where: { id: userId },
    data: { heartsRegenMinutes: minutes },
  });
  return { regenMinutes: minutes };
}

export async function loseHeart(userId: string) {
  const status = await getHearts(userId);
  if (status.isPremium) return { ...status, canContinue: true };
  
  if (status.hearts <= 0) {
    return { ...status, canContinue: false };
  }
  
  const newHearts = status.hearts - 1;
  const updateData: any = { hearts: newHearts };
  
  // Reset timer if going from max
  if (status.hearts === MAX_HEARTS_FREE) {
    updateData.lastHeartRegen = new Date();
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
  
  return await getHearts(userId);
}

export async function refillHearts(userId: string) {
  const GEM_COST = 350;
  
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.isPremium) return await getHearts(userId);
  
  if (user.gems < GEM_COST) {
    throw new Error('Not enough gems');
  }
  
  await prisma.user.update({
    where: { id: userId },
    data: {
      hearts: MAX_HEARTS_FREE,
      gems: { decrement: GEM_COST },
      lastHeartRegen: new Date(),
    },
  });
  
  await prisma.gemTransaction.create({
    data: { userId, amount: -GEM_COST, reason: 'heart_refill' },
  });
  
  return await getHearts(userId);
}

/// Reward one heart for watching a rewarded ad.
///
/// Server-side on purpose. Two reasons:
///  1. Anti-cheat — a client-side grant is trivially faked, and it would also
///     be silently WIPED the next time the app fetches /users/stats, because
///     the server value always wins there.
///  2. Rate limit — an unlimited "watch → heart" loop removes the reason to
///     ever subscribe. AD_HEARTS_PER_DAY keeps the free tier generous but
///     still finite.
///
/// The daily counter reuses the GemTransaction ledger (amount 0, a dedicated
/// reason) so no schema migration is needed against the live database.
export const AD_HEARTS_PER_DAY = 15;
const AD_HEART_REASON = 'ad_heart';

export async function grantAdHeart(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Premium has unlimited hearts — nothing to grant, and no ads are shown.
  if (user.isPremium) return { ...(await getHearts(userId)), granted: false, remainingToday: 0 };

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const usedToday = await prisma.gemTransaction.count({
    where: { userId, reason: AD_HEART_REASON, createdAt: { gte: startOfDay } },
  });
  if (usedToday >= AD_HEARTS_PER_DAY) {
    return { ...(await getHearts(userId)), granted: false, remainingToday: 0 };
  }

  // getHearts() first so time-based regeneration is applied before we add on
  // top of it — otherwise a pending regen could push the total over the cap.
  const status = await getHearts(userId);
  if (status.hearts >= MAX_HEARTS_FREE) {
    return { ...status, granted: false, remainingToday: AD_HEARTS_PER_DAY - usedToday };
  }

  const newHearts = Math.min(MAX_HEARTS_FREE, status.hearts + 1);
  await prisma.user.update({ where: { id: userId }, data: { hearts: newHearts } });
  await prisma.gemTransaction.create({
    data: { userId, amount: 0, reason: AD_HEART_REASON },
  });

  return {
    ...(await getHearts(userId)),
    granted: true,
    remainingToday: AD_HEARTS_PER_DAY - usedToday - 1,
  };
}
