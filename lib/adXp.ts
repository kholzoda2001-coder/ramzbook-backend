import { prisma } from './prisma';
import { awardXp } from './xp';

// ─────────────────────────────────────────────────────────────────────────────
// «Реклама бин → XP-и дарс ДУЧАНД».
//
// Дар экрани «Дарс тамом шуд» тугмаи ихтиёрӣ: хонанда видеои мукофотиро
// мебинад ва ҳамон қадар XP, ки дар ҳамин дарс кор кард, бори дуюм мегирад.
//
// ЧАРО ДАР СЕРВЕР ҲИСОБ МЕШАВАД, на дар барнома:
// Тадқиқоти саноат як қоида дорад — «never trust client-side claims». Агар
// барнома `xpEarned: xp * 2` мефиристод, ҳар кас метавонист `999999`
// фиристад: `progress/route.ts` рақами клиентро БЕ ҲАДДИ БОЛО қабул мекунад
// ва он рост ба ҷамъ, ҳафтаина, силсила ва ҷадвали пешсаф меравад.
// Ин ҷо сервер рақами ХУДАШРО мегирад — `UserProgress.xpEarned`, ки дар
// ҳамон транзаксияи анҷоми дарс навишта шудааст.
//
// СЕ МУҲОФИЗ:
//  1. `xpDoubledAt` — як дарс, як бонус. Бе он даъвати такрорӣ 2× → 4× мекард.
//  2. `AD_XP_WINDOW_MIN` — бонус танҳо ФАВРАН баъди дарс. Хонанда наметавонад
//     дарсҳои кӯҳнаро ҷамъ карда, баъд ҳамаашро якбора дучанд кунад.
//  3. `AD_XP_PER_DAY` — сақфи рӯзона. Ҳамон модели эътимод, ки `adGems` дорад:
//     дурӯғи муваффақ ҳам аз он чи хонандаи ҳалол ройгон мегирад, зиёд
//     намедиҳад.
//
// Ҳисоби рӯзона аз `DailyXp.source` гирифта мешавад (калиди `AD_XP_SOURCE`),
// пас ҷадвали нав лозим нест.
// ─────────────────────────────────────────────────────────────────────────────

/// Чанд бор дар як рӯз XP дучанд шуда метавонад.
export const AD_XP_PER_DAY = 5;

/// Баъди анҷоми дарс чанд дақиқа бонус дастрас аст.
export const AD_XP_WINDOW_MIN = 15;

/// Ҳадди боло барои ЯК бонус. Муҳаррики дарс ~50–80 XP медиҳад; 300 фазои
/// васеъ мемонад, вале рақами бемаънӣ (мас. аз боги ҳисоб) намегузарад.
export const AD_XP_MAX_PER_LESSON = 300;

/// Калиди сарчашма дар `DailyXp.source` — ҳам барои ҳисоби рӯзона, ҳам барои
/// он ки дар таҳлил XP-и реклама аз XP-и дарс ҷудо намоён бошад.
export const AD_XP_SOURCE = 'ad_double';

export type AdXpResult = {
  granted: boolean;
  /// Чанд XP маҳз ҳозир илова шуд.
  xpAwarded: number;
  /// Ҷамъи нави корбар — то барнома онро бе дархости дуюм нишон диҳад.
  totalXp: number;
  /// Имрӯз чанд бор боқӣ мондааст.
  remainingToday: number;
  /// Чаро рад шуд — барои лог ва матни дурусти хатогӣ дар барнома.
  reason?: 'premium' | 'not_found' | 'not_completed' | 'already' | 'expired' | 'limit' | 'no_xp';
};

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/// Имрӯз чанд бонус истифода шудааст (аз тақсимоти `DailyXp.source`).
async function usedToday(userId: string): Promise<number> {
  const row = await prisma.dailyXp.findFirst({
    where: { userId, date: { gte: startOfToday() } },
    select: { source: true },
  });
  const source = (row?.source as Record<string, number> | null) ?? {};
  // Дар `source` ҶАМЪИ XP нигоҳ дошта мешавад, на шумораи дафъаҳо. Барои
  // ҳисоби дафъаҳо калиди ҷудогонаи ҳисобкунак истифода мешавад.
  return source[`${AD_XP_SOURCE}_count`] ?? 0;
}

/// Ҳолати имрӯза БЕ додани чизе — то барнома тугмаро пеш аз пахш дуруст
/// нишон диҳад («имрӯз 2 аз 5 боқӣ»).
export async function getAdXpStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, totalXp: true },
  });
  if (!user) throw new Error('User not found');
  if (user.isPremium) {
    return { remainingToday: 0, maxPerDay: AD_XP_PER_DAY, totalXp: user.totalXp };
  }
  const used = await usedToday(userId);
  return {
    remainingToday: Math.max(0, AD_XP_PER_DAY - used),
    maxPerDay: AD_XP_PER_DAY,
    totalXp: user.totalXp,
  };
}

/**
 * XP-и як дарси анҷомёфтаро дучанд мекунад.
 *
 * Барнома МИҚДОРро намефиристад — танҳо `lessonId`. Ҳамаи рақамҳо аз база
 * гирифта мешаванд.
 */
export async function grantAdXp(userId: string, lessonId: string): Promise<AdXpResult> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true, totalXp: true },
  });
  if (!user) throw new Error('User not found');

  const deny = (reason: AdXpResult['reason'], remaining = 0): AdXpResult => ({
    granted: false,
    xpAwarded: 0,
    totalXp: user.totalXp,
    remainingToday: remaining,
    reason,
  });

  // Premium реклама намебинад — пас бонуси реклама ҳам надорад. (XP-и ӯ
  // аллакай бе реклама меояд; ниг. lib/adGems.ts барои ҳамон мантиқ.)
  if (user.isPremium) return deny('premium');

  const progress = await prisma.userProgress.findUnique({
    where: { userId_lessonId: { userId, lessonId } },
    select: { isCompleted: true, xpEarned: true, completedAt: true, xpDoubledAt: true },
  });

  if (!progress) return deny('not_found');
  if (!progress.isCompleted) return deny('not_completed');
  if (progress.xpDoubledAt) return deny('already');

  // Панҷарраи вақт: бонус ба ҳамин дарс, ҳамин ҳозир тааллуқ дорад.
  // `completedAt` метавонад null бошад дар сатрҳои кӯҳна — он гоҳ рад
  // мекунем, на «беохир иҷозат», вагарна тамоми таърих кушода мешуд.
  const completedAt = progress.completedAt;
  if (!completedAt) return deny('expired');
  const ageMin = (Date.now() - completedAt.getTime()) / 60_000;
  if (ageMin > AD_XP_WINDOW_MIN) return deny('expired');

  const used = await usedToday(userId);
  if (used >= AD_XP_PER_DAY) return deny('limit');

  // Худи миқдор — аз БАЗА, на аз барнома.
  const bonus = Math.min(Math.max(0, progress.xpEarned), AD_XP_MAX_PER_LESSON);
  if (bonus <= 0) return deny('no_xp', AD_XP_PER_DAY - used);

  // Аввал парчамро мегузорем, БАЪД XP медиҳем. Тартиб муҳим аст: агар
  // `awardXp` ноком шавад, хонанда бонусро нагирифт ва метавонад такрор
  // кунад — вале агар тартиб баръакс мебуд, ду дархости ҳамзамон ҳарду
  // XP мегирифтанд. `updateMany` бо шарти `xpDoubledAt: null` ин мусобиқаро
  // атомӣ мебандад: танҳо якумаш `count = 1` мегирад.
  const claimed = await prisma.userProgress.updateMany({
    where: { userId, lessonId, xpDoubledAt: null },
    data: { xpDoubledAt: new Date() },
  });
  if (claimed.count === 0) return deny('already', AD_XP_PER_DAY - used);

  const result = await awardXp(userId, bonus, AD_XP_SOURCE);

  // Ҳисобкунаки дафъаҳо — ҷудо аз ҷамъи XP, вагарна «5 бор дар рӯз»-ро
  // фарқ карда наметавонистем (як бонуси 80 XP ва даҳ бонуси 8 XP дар
  // `source` як хел менамуданд).
  await bumpDailyCount(userId);

  return {
    granted: true,
    xpAwarded: bonus,
    totalXp: result.totalXp,
    remainingToday: Math.max(0, AD_XP_PER_DAY - used - 1),
  };
}

/// Калиди `<source>_count`-ро дар тақсимоти имрӯза +1 мекунад.
async function bumpDailyCount(userId: string): Promise<void> {
  const today = startOfToday();
  const row = await prisma.dailyXp.findFirst({
    where: { userId, date: { gte: today } },
    select: { id: true, source: true },
  });
  if (!row) return; // `awardXp` онро месозад; агар набошад, ҳисоб маъно надорад
  const source = (row.source as Record<string, number> | null) ?? {};
  const key = `${AD_XP_SOURCE}_count`;
  await prisma.dailyXp.update({
    where: { id: row.id },
    data: { source: { ...source, [key]: (source[key] ?? 0) + 1 } },
  });
}
