import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getPublisher, PACKAGE_NAME, PRODUCT_PLAN, planPrice, type Plan } from '@/lib/googlePlay';
import { applyGoogleRenewal } from '@/lib/premium';

export const dynamic = 'force-dynamic';

// Google Play RTDN subscriptionNotification types.
// https://developer.android.com/google/play/billing/rtdn-reference
// 1 RECOVERED (аз hold — пул гирифта шуд), 2 RENEWED, 4 PURCHASED, 6 IN_GRACE_PERIOD
// (дастрасӣ то охири grace боқӣ), 7 RESTARTED.
const ACTIVE_EVENTS = [1, 2, 4, 6, 7];
// 3 CANCELED = автотамдид хомӯш шуд, вале пул то мӯҳлат пардохт шудааст.
// 🔴 23.10.2026: пештар 3 Premium-ро ФАВРАН мегирифт — хонанда рӯзҳои пардохташударо гум мекард.
const RENEW_OFF_EVENTS = [3];
const CANCELLED_EVENTS = [5, 12, 13]; // on-hold, revoked, expired

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
    if (![...ACTIVE_EVENTS, ...RENEW_OFF_EVENTS, ...CANCELLED_EVENTS].includes(notificationType)) {
      return NextResponse.json({ ok: true });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { googlePurchaseToken: purchaseToken },
      select: { id: true, userId: true },
    });
    if (!subscription) return NextResponse.json({ ok: true }); // unknown token — ignore

    const userId = subscription.userId;
    const now = new Date();

    if (RENEW_OFF_EVENTS.includes(notificationType)) {
      // Premium то `premiumExpiresAt` мемонад; `checkAndUpdatePremium` баъд хомӯш мекунад.
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { autoRenew: false, cancelledAt: now },
      });
      return NextResponse.json({ ok: true });
    }

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

    // Ҳамон роҳи санҷиши такрорӣ (lib/premium.ts): `premiumPlan` ва дилҳо ҳам бармегарданд —
    // пештар баъди hold → recovered хонанда Premium буд, вале бо 5 дил.
    await applyGoogleRenewal({
      userId,
      subscriptionId: subscription.id,
      plan,
      expiresAt: newExpiry,
      autoRenew: p.autoRenewing || false,
    });
    await prisma.$transaction(async (tx) => {
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
