import { prisma } from './prisma';
import { PREMIUM_FREEZE_CAP } from './streakFreezes';
import { getPublisher, PACKAGE_NAME, PRODUCT_PLAN, type Plan } from './googlePlay';

/**
 * Обунаи Google Play ҳоло ҳақ медиҳад? СОФ.
 *
 * `expiryTimeMillis` ҳамаро дар бар мегирад: тамдид (renew), давраи имтиёзӣ (grace —
 * Google мӯҳлатро то охири он дароз мекунад), барқароршавӣ аз «account hold» (пул
 * дертар гирифта шуд → мӯҳлати нав). Hold, бекоркунӣ ва revoke → мӯҳлат дар гузашта.
 */
export function googleSubActive(s: { expiryTimeMillis?: string | null }, now: number): Date | null {
  const ms = parseInt(s.expiryTimeMillis || '0', 10);
  return ms > now ? new Date(ms) : null;
}

/**
 * Обунаи тамомшуда то ин қадар баъд аз мӯҳлат дар Google аз нав санҷида мешавад.
 * Grace + hold дар Google то 60 рӯз аст; захира барои хонандае, ки баъди барқароршавӣ
 * барномаро дертар мекушояд (мас. пул рӯзи 55 гирифта шуд, барнома рӯзи 90 кушода шуд).
 */
export const RESYNC_WINDOW_MS = 120 * 24 * 60 * 60 * 1000;
/** Як корбар дар як инстанс на бештар аз як бор дар ин муддат ба Google мепурсад. */
export const RESYNC_EVERY_MS = 60 * 60 * 1000;
const lastResync = new Map<string, number>();

/** Фаъол кардан/тамдиди Premium аз обунаи Google (вебхук ва санҷиши такрорӣ). */
export async function applyGoogleRenewal(o: {
  userId: string;
  subscriptionId: string;
  plan: Plan;
  expiresAt: Date;
  autoRenew: boolean;
}): Promise<void> {
  await prisma.$transaction([
    prisma.user.update({
      where: { id: o.userId },
      data: {
        subscriptionTier: 'premium',
        subscriptionPlan: o.plan,
        subscriptionEndsAt: o.expiresAt,
        isPremium: true,
        premiumPlan: o.plan,
        premiumExpiresAt: o.expiresAt,
        // Баъди downgrade (hearts 5) Premium бояд ҳамон имтиёзҳоро баргардонад.
        hearts: 999,
        maxHearts: 999,
      },
    }),
    prisma.subscription.update({
      where: { id: o.subscriptionId },
      data: { status: 'active', expiresAt: o.expiresAt, autoRenew: o.autoRenew, cancelledAt: null },
    }),
  ]);
}

/**
 * 🔴 23.10.2026 (ҳисоби kholzoda10): обуна тамом шуд (корт пул надошт), баъд аз
 * чанд рӯз Google пулро гирифт, вале Premium барнагашт. Мо танҳо ба вебхуки RTDN
 * такя мекардем; агар он нарасад (домен, Pub/Sub), Premium то абад хомӯш мемонд,
 * ва барнома «Барқарор кардан»-ро худаш намезад.
 *
 * Акнун пеш аз downgrade (ва барои обунаи наздикан тамомшуда) худи Google пурсида
 * мешавад. `true` = Premium фаъол аст (тамдид шуд).
 */
async function resyncFromGoogle(userId: string): Promise<boolean> {
  const now = Date.now();
  const last = lastResync.get(userId) ?? 0;
  if (now - last < RESYNC_EVERY_MS) return false;
  lastResync.set(userId, now);

  const sub = await prisma.subscription.findFirst({
    where: {
      userId,
      googlePurchaseToken: { not: null },
      OR: [{ expiresAt: null }, { expiresAt: { gte: new Date(now - RESYNC_WINDOW_MS) } }],
    },
    orderBy: { startedAt: 'desc' },
  });
  const plan = sub ? PRODUCT_PLAN[sub.googleProductId] : undefined;
  if (!sub || !sub.googlePurchaseToken || !plan || plan === 'lifetime') return false;
  const publisher = getPublisher();
  if (!publisher) return false;

  try {
    const res = await publisher.purchases.subscriptions.get({
      packageName: PACKAGE_NAME,
      subscriptionId: sub.googleProductId,
      token: sub.googlePurchaseToken,
    });
    const expiresAt = googleSubActive(res.data, now);
    if (!expiresAt) return false;
    await applyGoogleRenewal({
      userId,
      subscriptionId: sub.id,
      plan,
      expiresAt,
      autoRenew: res.data.autoRenewing || false,
    });
    console.log('[premium] resynced from Google', userId, expiresAt.toISOString());
    return true;
  } catch (e) {
    console.error('[premium] resync failed:', e instanceof Error ? e.message : 'unknown');
    return false;
  }
}

export async function checkAndUpdatePremium(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return false;

  if (!user.isPremium) {
    // Обунаи тамомшуда метавонад дар Google барқарор шуда бошад (hold → пул гирифта шуд).
    return resyncFromGoogle(userId);
  }
  if (user.premiumPlan === 'lifetime') return true;

  // Check expiration
  if (user.premiumExpiresAt && user.premiumExpiresAt < new Date()) {
    if (await resyncFromGoogle(userId)) return true;
    // Downgrade
    await prisma.user.update({
      where: { id: userId },
      data: {
        isPremium: false,
        premiumPlan: null,
        premiumExpiresAt: null,
        hearts: 5,
        maxHearts: 5,
        streakFreezesAvailable: 1,
      },
    });
    return false;
  }

  return true;
}

export async function activatePremium(
  userId: string,
  plan: 'monthly' | 'yearly' | 'lifetime',
  expiresAt: Date | null,
  purchaseToken: string,
  orderId: string,
  productId: string,
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isPremium: true,
      premiumPlan: plan,
      premiumStartedAt: new Date(),
      premiumExpiresAt: expiresAt,
      hearts: 999,
      maxHearts: 999,
      // ⚠️ 999 НЕ: freeze-и беохир силсиларо шикастанашаванда мекунад ва
      // рақами 🔥-ро бемаъно. Ҳадди нигоҳдорӣ — lib/streakFreezes.ts
      // (Premium 2, ҳар моҳ пур мешавад).
      streakFreezesAvailable: PREMIUM_FREEZE_CAP,
    },
  });

  await prisma.subscription.upsert({
    where: { googlePurchaseToken: purchaseToken },
    create: {
      userId,
      plan,
      status: 'active',
      googlePurchaseToken: purchaseToken,
      googleOrderId: orderId,
      googleProductId: productId,
      expiresAt,
    },
    update: {
      status: 'active',
      expiresAt,
    },
  });
}
