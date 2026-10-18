/**
 * Тасвири ЯКҶОЯИ ҳуқуқҳои хонанда: PRO + воҳидҳои харидашуда.
 *
 * ── Чаро ──────────────────────────────────────────────────────────────────
 * Барнома то имрӯз ҳолати дастрасиро аз се ҷои гуногун мехонд (рафи
 * Китобхона, профил, ҷавоби харид). Барои экрани нав («Харидҳои ман»,
 * плеери офлайн, нишони PRO) ва барои КЭШИ офлайн як тасвири ягона лозим
 * аст: сервер — манбаи ҳақиқат; барнома онро бо `serverTime` нигоҳ медорад
 * ва дар лаҳзаи офлайн ба он такя мекунад.
 *
 * ⚠️ Тасвир ҳеҷ чизро ҳал намекунад — он танҳо ҳолатро ХОНДА медиҳад.
 * Қарори «ин воҳид кушода аст?» ҳамоно `unlockedIds` (lib/libraryAccess.ts)
 * ва роутҳои мазмун мегиранд. Барнома набояд аз рӯи ин тасвир мазмун
 * кушояд; он барои нишон додани ҳолат ва кэш аст.
 *
 * ⚠️ Нарх дар ин ҷо НЕСТ. Нарх ва хариди воҳид ТАНҲО дар версияи веб ҳаст.
 */

/** Майдонҳои `User`, ки ин тасвир аз онҳо сохта мешавад. */
export interface EntitlementsUser {
  isPremium: boolean;
  premiumPlan: string | null;
  premiumExpiresAt: Date | null;
  subscriptionEndsAt: Date | null;
  trialEndsAt: Date | null;
  trialUsed: boolean;
}

export type ProPlan = 'monthly' | 'sixmonths' | 'yearly' | 'lifetime';

export interface EntitlementsSnapshot {
  /** Соати СЕРВЕР (ISO) — барномаи офлайн аз рӯи он «кэш чанд муддат кӯҳна аст»-ро мефаҳмад. */
  serverTime: string;
  /** Натиҷаи `checkAndUpdatePremium` (мӯҳлат ҳисоб шудааст), на майдони хоми `User`. */
  isPremium: boolean;
  /** Нақшаи ҷорӣ; `null` агар PRO фаъол нест. */
  proPlan: ProPlan | null;
  /** Мӯҳлати PRO (ISO). `null` — PRO нест ё lifetime. */
  proExpiresAt: string | null;
  /** Озмоиши ройгон ҳоло ҷорист. */
  inTrial: boolean;
  /** Анҷоми озмоиш (ISO), агар `inTrial`. */
  trialEndsAt: string | null;
  /** Озмоиш КАЙ ҚАБЛ истифода шудааст (на танҳо ҳоло). */
  trialUsed: boolean;
  /** ID-и воҳидҳои ХАРИДАШУДА (ҳуқуқи доимӣ, `revokedAt = null`), бо тартиби устувор. */
  ownedItemIds: string[];
}

const KNOWN_PLANS: readonly ProPlan[] = ['monthly', 'sixmonths', 'yearly', 'lifetime'];

function normalisePlan(raw: string | null): ProPlan | null {
  if (!raw) return null;
  const p = raw.trim().toLowerCase();
  // Номи кӯҳна дар ҳисобҳо: «6_months» / «six_months».
  if (p === '6_months' || p === 'six_months' || p === '6months') return 'sixmonths';
  return (KNOWN_PLANS as readonly string[]).includes(p) ? (p as ProPlan) : null;
}

/**
 * Тасвирро месозад.
 *
 * [isPremiumNow] — ҶАВОБИ `checkAndUpdatePremium`, на `user.isPremium`: ин
 * функсия мӯҳлати гузаштаро ҳам ба «не» мегардонад ва ҳисобро паст мекунад.
 */
export function buildEntitlementsSnapshot(params: {
  user: EntitlementsUser;
  isPremiumNow: boolean;
  ownedItemIds: Iterable<string>;
  now: Date;
}): EntitlementsSnapshot {
  const { user, isPremiumNow, now } = params;

  const plan = isPremiumNow ? normalisePlan(user.premiumPlan) : null;

  // lifetime — мӯҳлат нест. Вагарна мӯҳлати «legacy» (дар ҳама ҷо ҳамоҳанг
  // мешавад) ва ба сифати захира — майдони канонӣ.
  let proExpiresAt: Date | null = null;
  if (isPremiumNow && plan !== 'lifetime') {
    proExpiresAt = user.premiumExpiresAt ?? user.subscriptionEndsAt ?? null;
  }

  const trialActive =
    isPremiumNow && user.trialEndsAt !== null && user.trialEndsAt.getTime() > now.getTime();

  return {
    serverTime: now.toISOString(),
    isPremium: isPremiumNow,
    proPlan: plan,
    proExpiresAt: proExpiresAt ? proExpiresAt.toISOString() : null,
    inTrial: trialActive,
    trialEndsAt: trialActive && user.trialEndsAt ? user.trialEndsAt.toISOString() : null,
    // Дар роҳи Google Play `trialUsed` гузошта намешавад, танҳо `trialEndsAt` —
    // пас ҳарду ба назар гирифта мешаванд.
    trialUsed: user.trialUsed || user.trialEndsAt !== null,
    ownedItemIds: Array.from(new Set(params.ownedItemIds)).sort(),
  };
}
