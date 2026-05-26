import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublisher, PACKAGE_NAME, PRODUCT_PLAN, planPrice, type Plan } from '@/lib/googlePlay';

export const dynamic = 'force-dynamic';

// Google Play RTDN subscriptionNotification types.
// https://developer.android.com/google/play/billing/rtdn-reference
const ACTIVE_EVENTS = [1, 2, 4, 6, 7]; // recovered, renewed, purchased, restarted, price-change-confirmed
const CANCELLED_EVENTS = [3, 5, 12, 13]; // canceled, on-hold, revoked, expired

/**
 * POST /api/webhooks/google-play
 * Real-time Developer Notifications (Pub/Sub push). Keeps subscription state in
 * sync on renewal / cancellation and writes a PaymentTransaction on each renewal.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = body?.message?.data;
    if (!data) {
      return NextResponse.json({ error: 'Invalid Pub/Sub message format' }, { status: 400 });
    }

    const notification = JSON.parse(Buffer.from(data, 'base64').toString('utf8'));
    if (notification.testNotification || !notification.subscriptionNotification) {
      return NextResponse.json({ ok: true });
    }

    const { purchaseToken, subscriptionId, notificationType } = notification.subscriptionNotification;
    if (![...ACTIVE_EVENTS, ...CANCELLED_EVENTS].includes(notificationType)) {
      return NextResponse.json({ ok: true });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { googlePurchaseToken: purchaseToken },
      select: { id: true, userId: true },
    });
    if (!subscription) return NextResponse.json({ ok: true }); // unknown token — ignore

    const userId = subscription.userId;
    const now = new Date();

    if (CANCELLED_EVENTS.includes(notificationType)) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionTier: 'free',
            subscriptionEndsAt: now,
            isPremium: false,
            premiumExpiresAt: now,
          },
        }),
        prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'cancelled', autoRenew: false, cancelledAt: now },
        }),
      ]);
      return NextResponse.json({ ok: true });
    }

    // ACTIVE: re-verify with Google to get the fresh expiry, then sync.
    const publisher = getPublisher();
    if (!publisher) return NextResponse.json({ ok: true }); // can't verify without creds

    const res = await publisher.purchases.subscriptions.get({
      packageName: PACKAGE_NAME,
      subscriptionId,
      token: purchaseToken,
    });
    const p = res.data;
    const expiryMs = parseInt(p.expiryTimeMillis || '0', 10);
    if (expiryMs <= 0) return NextResponse.json({ ok: true });

    const newExpiry = new Date(expiryMs);
    const plan: Plan = PRODUCT_PLAN[subscriptionId] ?? 'monthly';
    const orderId = p.orderId || '';

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: {
          subscriptionTier: 'premium',
          subscriptionPlan: plan,
          subscriptionEndsAt: newExpiry,
          isPremium: true,
          premiumExpiresAt: newExpiry,
        },
      });
      await tx.subscription.update({
        where: { id: subscription.id },
        data: { status: 'active', expiresAt: newExpiry, autoRenew: p.autoRenewing || false },
      });
      // Renewal audit row (idempotent on the Google order id).
      if (orderId) {
        const existing = await tx.paymentTransaction.findFirst({ where: { externalId: orderId } });
        if (!existing) {
          await tx.paymentTransaction.create({
            data: {
              userId,
              type: 'subscription',
              provider: 'google',
              amount: p.paymentState === 2 ? 0 : planPrice(plan),
              currency: 'USD',
              status: 'success',
              plan,
              externalId: orderId,
              metadata: { source: 'rtdn', notificationType, productId: subscriptionId },
            },
          });
        }
      }
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[webhook/google-play]', err);
    return NextResponse.json({ error: 'Server error processing RTDN' }, { status: 500 });
  }
}
