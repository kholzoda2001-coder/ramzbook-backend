import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

/**
 * POST /api/webhooks/googleplay
 *
 * Google Cloud Pub/Sub push endpoint for Real-Time Developer Notifications (RTDN).
 * Handles subscription renewals, cancellations, and expirations.
 *
 * NOTE: This is a duplicate/legacy path. The canonical handler is at
 * /api/webhooks/google-play/route.ts — both are kept in sync here.
 *
 * notificationType reference:
 *  1 = SUBSCRIPTION_RECOVERED
 *  2 = SUBSCRIPTION_RENEWED
 *  3 = SUBSCRIPTION_CANCELED          ← immediately revoke
 *  4 = SUBSCRIPTION_PURCHASED         ← grant
 *  5 = SUBSCRIPTION_ON_HOLD           ← immediately revoke
 *  6 = SUBSCRIPTION_IN_GRACE_PERIOD   ← keep active until expiry
 *  7 = SUBSCRIPTION_RESTARTED
 * 12 = SUBSCRIPTION_REVOKED           ← immediately revoke
 * 13 = SUBSCRIPTION_EXPIRED           ← immediately revoke
 */

// Active/renewing events — update expiry to whatever Google says
const ACTIVE_EVENTS = [1, 2, 4, 6, 7];
// Cancellation events — immediately block access right now
const CANCELLED_EVENTS = [3, 5, 12, 13];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.message || !body.message.data) {
      return NextResponse.json({ error: 'Invalid Pub/Sub message format' }, { status: 400 });
    }

    const encodedData = body.message.data;
    const decodedData = Buffer.from(encodedData, 'base64').toString('utf8');
    const notification = JSON.parse(decodedData);

    if (notification.testNotification) {
      console.log('[Webhook/googleplay] Received test notification from Google Play.');
      return NextResponse.json({ ok: true });
    }

    if (!notification.subscriptionNotification) {
      return NextResponse.json({ ok: true });
    }

    const { purchaseToken, subscriptionId, notificationType } =
      notification.subscriptionNotification;
    const packageName = notification.packageName || 'com.ramzbook.tj';

    console.log(
      `[Webhook/googleplay] type=${notificationType} subId=${subscriptionId} token=${purchaseToken?.slice(0, 20)}…`
    );

    // Only handle known event types
    if (![...ACTIVE_EVENTS, ...CANCELLED_EVENTS].includes(notificationType)) {
      return NextResponse.json({ ok: true });
    }

    // ── Fetch purchase details from Google Play API ─────────────────────────
    const playCredentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    if (!playCredentialsStr) {
      console.error('[Webhook/googleplay] Missing GOOGLE_PLAY_CREDENTIALS env var.');
      return NextResponse.json({ ok: true });
    }

    const credentials = JSON.parse(playCredentialsStr);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });
    const androidPublisher = google.androidpublisher({ version: 'v3', auth });

    const gpResponse = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });
    const purchase = gpResponse.data;

    // ── Find the user who owns this purchase token ──────────────────────────
    let user = null;

    // 1. Try the obfuscated account ID that we embed at purchase time
    if (purchase.obfuscatedExternalAccountId) {
      user = await prisma.user.findUnique({
        where: { id: purchase.obfuscatedExternalAccountId },
      });
    }

    // 2. Fall back to stored token lookup
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { vipPurchaseToken: purchaseToken },
            ...(purchase.linkedPurchaseToken
              ? [{ vipPurchaseToken: purchase.linkedPurchaseToken }]
              : []),
          ],
        },
      });
    }

    if (!user) {
      console.warn('[Webhook/googleplay] No user found for token:', purchaseToken);
      return NextResponse.json({ ok: true });
    }

    const expiryTimeMillis = parseInt(purchase.expiryTimeMillis || '0', 10);

    // ── ACTIVE EVENT: extend access ─────────────────────────────────────────
    if (ACTIVE_EVENTS.includes(notificationType)) {
      if (expiryTimeMillis > 0) {
        const newExpiry = new Date(expiryTimeMillis);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            vipExpiresAt: newExpiry,
            vipPurchaseToken: purchaseToken,
          },
        });
        console.log(
          `[Webhook/googleplay] ✅ ACTIVE (type=${notificationType}): ` +
          `user ${user.id} → vipExpiresAt=${newExpiry.toISOString()}`
        );
      }
    }

    // ── CANCELLATION EVENT: immediately revoke access ───────────────────────
    else if (CANCELLED_EVENTS.includes(notificationType)) {
      const now = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          vipExpiresAt: now,
          // Keep vipPurchaseToken for audit trail
        },
      });

      // Also revoke any UserProgress rows that were tied to this token
      await prisma.userProgress.updateMany({
        where: { userId: user.id, purchaseToken, isPurchased: true },
        data: { isPurchased: false, expiresAt: now },
      });

      console.log(
        `[Webhook/googleplay] ❌ CANCELLED (type=${notificationType}): ` +
        `user ${user.id} → vipExpiresAt set to NOW (${now.toISOString()})`
      );
    }

    // Always return 200 so Pub/Sub doesn't retry
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Webhook/googleplay Error]', err.message);
    // Return 500 so Pub/Sub retries on transient errors
    return NextResponse.json({ error: 'Server error processing RTDN' }, { status: 500 });
  }
}
