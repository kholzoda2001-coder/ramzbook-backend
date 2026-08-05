import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// «Реклама бин → алмос гир».
//
// Дуюмин роҳи ба даст овардани алмос барои корбари РОЙГОН. Аввалин —
// вазифаҳои рӯзона (20 алмос/рӯз, ниг. lib/dailyTasks.ts).
//
// ЧАРО ДАР СЕРВЕР, на дар барнома — ҳамон ду сабабе, ки дар grantAdHeart:
//  1. Зидди қаллобӣ — доданӣ дар клиент осон сохта мешавад, ва ба ҳар ҳол
//     ҳангоми дархости навбатии /users/stats қимати сервер ғолиб меояд.
//  2. Маҳдудият — ҳалқаи бепоёни «тамошо → алмос» сабаби обуна шуданро нест
//     мекунад. AD_GEMS_PER_DAY доираи ройгонро саховатманд, вале МАҲДУД
//     нигоҳ медорад.
//
// Ҳисоби рӯзона аз дафтари GemTransaction гирифта мешавад (бо сабаби
// ҷудогона) — пас ба миграцияи схема эҳтиёҷ нест.
// ─────────────────────────────────────────────────────────────────────────────

/// Чанд реклама дар як рӯз алмос медиҳад.
export const AD_GEMS_PER_DAY = 5;

/// Барои ҳар реклама чанд алмос.
export const GEMS_PER_AD = 10;

const AD_GEMS_REASON = 'ad_gems';

export type AdGemsResult = {
  granted: boolean;
  gems: number; // тавозуни НАВ
  gemsAwarded: number;
  remainingToday: number;
};

export async function grantAdGems(userId: string): Promise<AdGemsResult> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  // Premium реклама намебинад — пас чизе намегирад.
  if (user.isPremium) {
    return { granted: false, gems: user.gems, gemsAwarded: 0, remainingToday: 0 };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const usedToday = await prisma.gemTransaction.count({
    where: { userId, reason: AD_GEMS_REASON, createdAt: { gte: startOfDay } },
  });

  if (usedToday >= AD_GEMS_PER_DAY) {
    return { granted: false, gems: user.gems, gemsAwarded: 0, remainingToday: 0 };
  }

  // Як транзаксия: тавозун ва дафтар ҳамеша мувофиқ мемонанд. Агар яке
  // ноком шавад, дигаре низ бекор мешавад — вагарна ҳисоби рӯзона аз
  // алмоси воқеан додашуда ҷудо мешуд.
  const [updated] = await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { gems: { increment: GEMS_PER_AD } },
    }),
    prisma.gemTransaction.create({
      data: { userId, amount: GEMS_PER_AD, reason: AD_GEMS_REASON },
    }),
  ]);

  return {
    granted: true,
    gems: updated.gems,
    gemsAwarded: GEMS_PER_AD,
    remainingToday: AD_GEMS_PER_DAY - usedToday - 1,
  };
}

/// Ҳолати имрӯза БЕ додани чизе — барои нишон додани «боқӣ: 3 аз 5».
export async function getAdGemsStatus(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');
  if (user.isPremium) {
    return { gems: user.gems, remainingToday: 0, perAd: GEMS_PER_AD, maxPerDay: AD_GEMS_PER_DAY };
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const usedToday = await prisma.gemTransaction.count({
    where: { userId, reason: AD_GEMS_REASON, createdAt: { gte: startOfDay } },
  });

  return {
    gems: user.gems,
    remainingToday: Math.max(0, AD_GEMS_PER_DAY - usedToday),
    perAd: GEMS_PER_AD,
    maxPerDay: AD_GEMS_PER_DAY,
  };
}
