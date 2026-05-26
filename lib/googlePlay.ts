import { google, androidpublisher_v3 } from 'googleapis';
import { prisma } from './prisma';

// ─────────────────────────────────────────────────────────────────────────────
// Canonical Google Play Billing verification (Phase 4A).
//
// Server-side verification ONLY — we never trust client-reported purchase state.
// Every successful activation writes a PaymentTransaction (audit trail) plus the
// canonical subscription fields on User and a Subscription row.
//
// Required env:
//   GOOGLE_PLAY_CREDENTIALS   service-account JSON (stringified)
//   GOOGLE_PLAY_PACKAGE_NAME  Android applicationId (default com.ramzbook.tj)
// ─────────────────────────────────────────────────────────────────────────────

export const PACKAGE_NAME = process.env.GOOGLE_PLAY_PACKAGE_NAME || 'com.ramzbook.tj';

export type Plan = 'monthly' | 'yearly' | 'lifetime';

export const PRODUCT_PLAN: Record<string, Plan> = {
  ramz_monthly: 'monthly',
  ramz_yearly: 'yearly',
  ramz_lifetime: 'lifetime',
};

/** USD list price per plan — used for the PaymentTransaction audit amount. */
export function planPrice(plan: Plan): number {
  switch (plan) {
    case 'yearly':
      return 29.99;
    case 'lifetime':
      return 99.99;
    default:
      return 4.99;
  }
}

let _publisher: androidpublisher_v3.Androidpublisher | null = null;

/** Returns an authenticated Android Publisher client, or null if creds absent. */
export function getPublisher(): androidpublisher_v3.Androidpublisher | null {
  if (_publisher) return _publisher;
  const raw = process.env.GOOGLE_PLAY_CREDENTIALS;
  if (!raw) return null;
  const credentials = JSON.parse(raw);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  });
  _publisher = google.androidpublisher({ version: 'v3', auth });
  return _publisher;
}

export interface VerifiedPurchase {
  plan: Plan;
  expiresAt: Date | null;
  autoRenew: boolean;
  orderId: string;
  /** true when the purchase is a Google free-trial period (paymentState === 2) */
  isTrial: boolean;
}

export class GooglePlayError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/**
 * Verifies a purchase token against Google Play and acknowledges it.
 * Throws GooglePlayError on any invalid/expired/misconfigured state.
 */
export async function verifyPurchase(productId: string, purchaseToken: string): Promise<VerifiedPurchase> {
  const plan = PRODUCT_PLAN[productId];
  if (!plan) throw new GooglePlayError(`Unknown productId: ${productId}`, 400);

  const publisher = getPublisher();

  // No credentials → only allowed outside production (internal dev/testing).
  if (!publisher) {
    if (process.env.NODE_ENV === 'production') {
      throw new GooglePlayError('Billing not configured on server', 500);
    }
    const expiresAt =
      plan === 'lifetime'
        ? null
        : new Date(Date.now() + (plan === 'yearly' ? 365 : 30) * 86400000);
    return { plan, expiresAt, autoRenew: plan !== 'lifetime', orderId: `dev_${Date.now()}`, isTrial: false };
  }

  if (plan === 'lifetime') {
    const res = await publisher.purchases.products.get({
      packageName: PACKAGE_NAME,
      productId,
      token: purchaseToken,
    });
    const p = res.data;
    if (p.purchaseState !== 0) throw new GooglePlayError('Purchase not valid', 400);
    if (p.acknowledgementState === 0) {
      await publisher.purchases.products.acknowledge({
        packageName: PACKAGE_NAME,
        productId,
        token: purchaseToken,
        requestBody: {},
      }).catch(() => {});
    }
    return { plan, expiresAt: null, autoRenew: false, orderId: p.orderId || '', isTrial: false };
  }

  // Subscriptions (monthly / yearly)
  const res = await publisher.purchases.subscriptions.get({
    packageName: PACKAGE_NAME,
    subscriptionId: productId,
    token: purchaseToken,
  });
  const s = res.data;
  // paymentState: 0 pending, 1 paid, 2 free trial, 3 pending deferred
  if (s.paymentState !== 1 && s.paymentState !== 2) {
    throw new GooglePlayError('Subscription not active', 400);
  }
  const expiryMs = parseInt(s.expiryTimeMillis || '0', 10);
  if (expiryMs > 0 && expiryMs < Date.now()) {
    throw new GooglePlayError('Subscription expired', 400);
  }
  if (s.acknowledgementState === 0) {
    await publisher.purchases.subscriptions.acknowledge({
      packageName: PACKAGE_NAME,
      subscriptionId: productId,
      token: purchaseToken,
      requestBody: {},
    }).catch(() => {});
  }
  return {
    plan,
    expiresAt: expiryMs > 0 ? new Date(expiryMs) : null,
    autoRenew: s.autoRenewing || false,
    orderId: s.orderId || '',
    isTrial: s.paymentState === 2,
  };
}

/**
 * Persists a verified purchase: updates User (canonical + legacy premium fields
 * + perks), upserts the Subscription, and writes a PaymentTransaction audit row.
 */
export async function activateVerifiedPurchase(params: {
  userId: string;
  productId: string;
  purchaseToken: string;
  verified: VerifiedPurchase;
}): Promise<void> {
  const { userId, productId, purchaseToken, verified } = params;
  const { plan, expiresAt, autoRenew, orderId, isTrial } = verified;
  const now = new Date();

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        // canonical subscription fields
        subscriptionTier: 'premium',
        subscriptionPlan: plan === 'lifetime' ? 'yearly' : plan,
        subscriptionEndsAt: expiresAt,
        trialEndsAt: isTrial ? expiresAt : undefined,
        // legacy premium flags (kept in sync)
        isPremium: true,
        premiumPlan: plan,
        premiumStartedAt: now,
        premiumExpiresAt: expiresAt,
        // premium perks
        hearts: 999,
        maxHearts: 999,
        streakFreezesAvailable: 999,
      },
    });

    await tx.subscription.upsert({
      where: { googlePurchaseToken: purchaseToken },
      create: {
        userId,
        plan,
        status: 'active',
        googlePurchaseToken: purchaseToken,
        googleOrderId: orderId,
        googleProductId: productId,
        startedAt: now,
        expiresAt,
        autoRenew,
      },
      update: { status: 'active', expiresAt, autoRenew },
    });

    // Audit trail — idempotent on externalId (orderId) when present.
    if (orderId) {
      const existing = await tx.paymentTransaction.findFirst({ where: { externalId: orderId } });
      if (existing) return;
    }
    await tx.paymentTransaction.create({
      data: {
        userId,
        type: 'subscription',
        provider: 'google',
        amount: isTrial ? 0 : planPrice(plan),
        currency: 'USD',
        status: 'success',
        plan: plan === 'lifetime' ? 'yearly' : plan,
        externalId: orderId || null,
        metadata: { productId, isTrial, autoRenew },
      },
    });
  });
}

/** One-call helper used by the google-verify route. */
export async function verifyAndActivate(params: {
  userId: string;
  productId: string;
  purchaseToken: string;
}): Promise<VerifiedPurchase> {
  const verified = await verifyPurchase(params.productId, params.purchaseToken);
  await activateVerifiedPurchase({ ...params, verified });
  return verified;
}
