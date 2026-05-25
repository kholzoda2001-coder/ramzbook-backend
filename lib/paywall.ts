import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Smart paywall trigger engine.
//
// Philosophy (per product rules): psychology over pressure. Every trigger has a
// cooldown so we never nag, and premium users are NEVER shown a paywall.
// ─────────────────────────────────────────────────────────────────────────────

export type PaywallTrigger =
  | 'streak_at_risk'
  | 'lives_empty'
  | 'lesson_5'
  | 'level_locked'
  | 'league_promoted'
  | 'weekly_recap'
  | 'inactive_14d';

export type OfferKind = 'trial' | 'discount';

export interface PaywallOffer {
  trigger: PaywallTrigger;
  priority: number; // higher = shown first
  cooldownHours: number; // min hours between two shows of this trigger
  offer: OfferKind;
  /** discount percent when offer === 'discount' */
  discountPercent?: number;
  /** countdown length for time-limited offers (hours) */
  timerHours?: number;
  title: string; // Tajik
  message: string; // Tajik
  cta: string; // Tajik
}

/// Centralized copy + offer config (A/B-overridable later via metadata).
export const PAYWALL_OFFERS: Record<PaywallTrigger, PaywallOffer> = {
  lives_empty: {
    trigger: 'lives_empty',
    priority: 100,
    cooldownHours: 3,
    offer: 'trial',
    title: 'Дилҳо тамом шуданд',
    message: '♾️ Lives бемаҳдуд гиред ва ҳозир ин дарсро тамом кунед',
    cta: 'Озмоиши ройгон',
  },
  lesson_5: {
    trigger: 'lesson_5',
    priority: 90,
    cooldownHours: 24 * 365, // effectively once
    offer: 'trial',
    title: 'Шумо беҳтарин 10%-ед! 🎉',
    message: '5 дарс тамом! Бо 7 рӯзи озмоиши ройгон тезтар пеш равед',
    cta: '7 рӯз ройгон',
  },
  level_locked: {
    trigger: 'level_locked',
    priority: 85,
    cooldownHours: 24 * 7,
    offer: 'trial',
    title: 'Табрик! A1 тамом шуд 🏆',
    message: 'Сатҳи A2–C1 бо Premium кушода мешавад',
    cta: 'Кушодани A2',
  },
  league_promoted: {
    trigger: 'league_promoted',
    priority: 80,
    cooldownHours: 24 * 7,
    offer: 'trial',
    title: 'Шумо дар Тop 3 ҳастед! 💎',
    message: 'Мақоми худро бо Premium нигоҳ доред',
    cta: 'Озмоиши ройгон',
  },
  streak_at_risk: {
    trigger: 'streak_at_risk',
    priority: 70,
    cooldownHours: 20, // ~once per day
    offer: 'trial',
    title: 'Streak-и шуморо нигоҳ дорем 🔥',
    message: 'Имрӯз ҳанӯз дарс накардаед — silsila дар хатар аст',
    cta: 'Идома додан',
  },
  weekly_recap: {
    trigger: 'weekly_recap',
    priority: 50,
    cooldownHours: 24 * 6,
    offer: 'trial',
    title: 'Ҳисоботи ҳафта 📊',
    message: '87% корбарон камтар вақт сарф мекунанд — Premium = 2× тезтар',
    cta: 'Санҷидани Premium',
  },
  inactive_14d: {
    trigger: 'inactive_14d',
    priority: 40,
    cooldownHours: 24 * 14,
    offer: 'discount',
    discountPercent: 50,
    timerHours: 24,
    title: 'Танҳо имрӯз: 50% тахфиф',
    message: 'Баргардед ва бо нархи нисф Premium гиред — 24 соат вақт',
    cta: '50% тахфифро гирифтан',
  },
};

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

function dateStr(d: Date): string {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().split('T')[0];
}

export interface PaywallContext {
  /** explicit moment from the client (lives_empty, lesson_completed, level_completed, league_promoted) */
  event?: string;
  /** lessons completed in the event (for lesson_5) */
  lessonsCompleted?: number;
  /** user's local hour 0-23 (for streak_at_risk's 4pm gate) */
  localHour?: number;
  /** leaderboard rank when the event is league_promoted */
  rank?: number;
}

/** Whether `trigger` is still inside its cooldown window for this user. */
async function inCooldown(userId: string, offer: PaywallOffer): Promise<boolean> {
  const since = new Date(Date.now() - offer.cooldownHours * 3600 * 1000);
  const recent = await prisma.paywallEvent.findFirst({
    where: { userId, trigger: offer.trigger, action: 'shown', createdAt: { gte: since } },
    select: { id: true },
  });
  return recent != null;
}

/**
 * Returns the single best paywall offer to show now, or null.
 * Evaluates every eligible trigger, drops any in cooldown, returns highest priority.
 */
export async function evaluatePaywall(
  userId: string,
  ctx: PaywallContext = {},
): Promise<PaywallOffer | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionTier: true, isPremium: true, subscriptionEndsAt: true, premiumExpiresAt: true,
      streak: true, lastActiveDate: true, lastActiveAt: true, hearts: true, createdAt: true,
    },
  });
  if (!user) return null;
  if (isPremiumNow(user)) return null; // never paywall a paying user

  const now = new Date();
  const today = dateStr(now);
  const activeToday = user.lastActiveDate ? dateStr(user.lastActiveDate) === today : false;

  const eligible: PaywallTrigger[] = [];

  // ── Event-driven triggers (the client tells us the moment) ──
  if (ctx.event === 'lives_empty' || user.hearts <= 0) eligible.push('lives_empty');
  if (ctx.event === 'lesson_completed' && ctx.lessonsCompleted === 5) eligible.push('lesson_5');
  if (ctx.event === 'level_completed') eligible.push('level_locked');
  if (ctx.event === 'league_promoted' || (ctx.rank != null && ctx.rank >= 1 && ctx.rank <= 3)) {
    eligible.push('league_promoted');
  }

  // ── Time / state-driven triggers ──
  // Streak at risk: 7+ streak, nothing done today, afternoon local time.
  if (user.streak >= 7 && !activeToday && (ctx.localHour == null || ctx.localHour >= 16)) {
    eligible.push('streak_at_risk');
  }
  // Weekly recap: Sundays (UTC getDay() === 0).
  if (now.getUTCDay() === 0) eligible.push('weekly_recap');
  // Inactive 14+ days.
  const daysInactive = Math.floor((now.getTime() - user.lastActiveAt.getTime()) / 86400000);
  if (daysInactive >= 14) eligible.push('inactive_14d');

  if (eligible.length === 0) return null;

  // Drop triggers still in cooldown, then pick the highest priority.
  const offers = eligible.map((t) => PAYWALL_OFFERS[t]);
  const fresh: PaywallOffer[] = [];
  for (const o of offers) {
    if (!(await inCooldown(userId, o))) fresh.push(o);
  }
  if (fresh.length === 0) return null;

  fresh.sort((a, b) => b.priority - a.priority);
  return fresh[0];
}

/** Records a paywall impression / outcome (cooldown + analytics). */
export async function logPaywallEvent(
  userId: string,
  trigger: string,
  action: string,
  variant?: string | null,
  context?: unknown,
): Promise<void> {
  await prisma.paywallEvent.create({
    data: {
      userId,
      trigger,
      action: action || 'shown',
      variant: variant ?? null,
      context: (context as object | undefined) ?? undefined,
    },
  });
}
