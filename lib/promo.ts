/**
 * Launch promo — a GIFT of Premium for new users, stored in AppSetting (`promo_settings`).
 *
 * Why this is not a Google Play free trial: Play's trial length lives in the
 * base-plan offer inside Play Console and cannot be changed from our admin.
 * This promo is granted directly by our own server (no purchase, no payment
 * method), which is what makes "2 months → 1 month → off" controllable from the
 * admin panel at runtime.
 *
 * Claim tracking uses a PaymentTransaction row (`type: 'promo'`) so no schema
 * migration is needed and the gift shows up in the revenue/audit trail. Once a
 * user has claimed, they are never eligible again — even after it expires.
 *
 * Mirrors the settings pattern in lib/ai/ai-settings.ts.
 */

import type { PrismaClient } from '@prisma/client';

export const SETTING_KEY = 'promo_settings';

export interface PromoConfig {
  /** Master switch — false hides the gift everywhere, instantly. */
  enabled: boolean;
  /** Length of the gift in days (60 = 2 months, 30 = 1 month). */
  days: number;
  /**
   * How many days after registration a user still counts as "new".
   * 0 = no window (every non-premium user who hasn't claimed is eligible).
   */
  eligibleWithinDays: number;
  /** Copy (Tajik) — `{days}` and `{months}` are substituted before sending. */
  badge: string;
  title: string;
  message: string;
  cta: string;
}

export const defaultPromoConfig: PromoConfig = {
  enabled: true,
  days: 60,
  // 0 = ҳар корбаре ки ҳанӯз тӯҳфаро нагирифтааст (талаби маҳсулот). Тиреза
  // танҳо ҳамчун абзори ихтиёрии админ мемонад — пешфарз маҳдудият нест.
  eligibleWithinDays: 0,
  badge: 'ДАСТРАСИИ ОЗМОИШӢ',
  title: 'Тӯҳфаи Махсус',
  message: 'Premium-и пурра барои {months} моҳ — ройгон ва бе ягон шарт.',
  cta: '{months} МОҲРО РОЙГОН ГИРЕД',
};

function deepClone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T;
}

export async function loadPromoConfig(prisma: PrismaClient): Promise<PromoConfig> {
  const row = await prisma.appSetting.findUnique({ where: { key: SETTING_KEY } });
  if (!row?.valueJson) return deepClone(defaultPromoConfig);
  try {
    const parsed = JSON.parse(row.valueJson) as Partial<PromoConfig>;
    return { ...deepClone(defaultPromoConfig), ...parsed };
  } catch {
    return deepClone(defaultPromoConfig);
  }
}

export async function savePromoConfig(prisma: PrismaClient, cfg: PromoConfig): Promise<void> {
  await prisma.appSetting.upsert({
    where: { key: SETTING_KEY },
    create: { key: SETTING_KEY, valueJson: JSON.stringify(cfg) },
    update: { valueJson: JSON.stringify(cfg) },
  });
}

/** Merge a partial admin update, clamping the numeric fields to sane ranges. */
export function mergePromoUpdate(current: PromoConfig, partial: Partial<PromoConfig>): PromoConfig {
  const next = deepClone(current);
  if (partial.enabled !== undefined) next.enabled = !!partial.enabled;
  if (partial.days !== undefined) {
    next.days = Math.min(365, Math.max(1, Math.floor(Number(partial.days) || 0) || 1));
  }
  if (partial.eligibleWithinDays !== undefined) {
    next.eligibleWithinDays = Math.min(365, Math.max(0, Math.floor(Number(partial.eligibleWithinDays) || 0)));
  }
  if (partial.badge !== undefined) next.badge = partial.badge;
  if (partial.title !== undefined) next.title = partial.title;
  if (partial.message !== undefined) next.message = partial.message;
  if (partial.cta !== undefined) next.cta = partial.cta;
  return next;
}

/**
 * Substitute `{days}` / `{months}` so the copy always matches the configured
 * length — an admin who drops 60 → 30 must not be left with text saying
 * "2 моҳ". Months are rounded to the nearest whole month (min 1).
 */
export function renderPromoCopy(cfg: PromoConfig): Pick<PromoConfig, 'badge' | 'title' | 'message' | 'cta'> {
  const months = Math.max(1, Math.round(cfg.days / 30));
  const sub = (s: string) => s.replace(/\{days\}/g, String(cfg.days)).replace(/\{months\}/g, String(months));
  return { badge: sub(cfg.badge), title: sub(cfg.title), message: sub(cfg.message), cta: sub(cfg.cta) };
}

function isPremiumNow(u: {
  subscriptionTier: string;
  isPremium: boolean;
  subscriptionEndsAt: Date | null;
  premiumExpiresAt: Date | null;
}): boolean {
  const now = new Date();
  if (u.subscriptionTier === 'premium' && (!u.subscriptionEndsAt || u.subscriptionEndsAt > now)) return true;
  if (u.isPremium && (!u.premiumExpiresAt || u.premiumExpiresAt > now)) return true;
  return false;
}

export interface PromoState {
  eligible: boolean;
  days: number;
  months: number;
  badge: string;
  title: string;
  message: string;
  cta: string;
  /** Why the gift is not offered — for debugging/admin, never shown to users. */
  reason?: 'disabled' | 'already_premium' | 'already_claimed' | 'not_new' | 'no_user';
}

/**
 * Whether this user may claim the gift right now, plus the rendered copy.
 * Returns `eligible: false` (with a reason) rather than throwing, so callers
 * can always render something.
 */
export async function getPromoStateFor(prisma: PrismaClient, userId: string): Promise<PromoState> {
  const cfg = await loadPromoConfig(prisma);
  const copy = renderPromoCopy(cfg);
  const months = Math.max(1, Math.round(cfg.days / 30));
  const base: PromoState = { eligible: false, days: cfg.days, months, ...copy };

  if (!cfg.enabled) return { ...base, reason: 'disabled' };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      subscriptionTier: true,
      isPremium: true,
      subscriptionEndsAt: true,
      premiumExpiresAt: true,
    },
  });
  if (!user) return { ...base, reason: 'no_user' };
  if (isPremiumNow(user)) return { ...base, reason: 'already_premium' };

  const claimed = await prisma.paymentTransaction.findFirst({
    where: { userId, type: 'promo' },
    select: { id: true },
  });
  if (claimed) return { ...base, reason: 'already_claimed' };

  if (cfg.eligibleWithinDays > 0) {
    const ageDays = (Date.now() - user.createdAt.getTime()) / 86400000;
    if (ageDays > cfg.eligibleWithinDays) return { ...base, reason: 'not_new' };
  }

  return { ...base, eligible: true };
}

export interface PromoGrantResult {
  ok: boolean;
  alreadyClaimed?: boolean;
  expiresAt?: Date;
  days?: number;
  reason?: PromoState['reason'];
}

/**
 * Grants the gift: full premium for `cfg.days` days, with the same perks the
 * paid flow sets (unlimited hearts + streak freezes), and an audit row.
 * Re-checks eligibility server-side — the client is never trusted.
 */
export async function grantPromo(prisma: PrismaClient, userId: string): Promise<PromoGrantResult> {
  const state = await getPromoStateFor(prisma, userId);
  if (!state.eligible) {
    return { ok: false, alreadyClaimed: state.reason === 'already_claimed', reason: state.reason };
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + state.days * 86400000);

  await prisma.user.update({
    where: { id: userId },
    data: {
      // canonical subscription fields
      subscriptionTier: 'premium',
      subscriptionPlan: 'promo',
      subscriptionEndsAt: expiresAt,
      // legacy premium flags (kept in sync — perks read these)
      isPremium: true,
      premiumPlan: 'promo',
      premiumStartedAt: now,
      premiumExpiresAt: expiresAt,
      // premium perks, same as the paid path in lib/googlePlay.ts
      hearts: 999,
      maxHearts: 999,
      streakFreezesAvailable: 999,
    },
  });

  // Audit + the "already claimed" marker (no schema migration needed).
  await prisma.paymentTransaction.create({
    data: {
      userId,
      type: 'promo',
      provider: 'mock',
      amount: 0,
      currency: 'TJS',
      status: 'success',
      plan: 'promo',
      metadata: { gift: true, days: state.days, grantedAt: now.toISOString() },
    },
  });

  return { ok: true, expiresAt, days: state.days };
}
