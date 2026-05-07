import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

/**
 * POST /api/webhooks/google-play
 *
 * Google Cloud Pub/Sub push endpoint for Real-Time Developer Notifications (RTDN).
 * Handles subscription renewals, cancellations, and expirations.
 *
 * notificationType reference:
 *  1 = SUBSCRIPTION_RECOVERED
 *  2 = SUBSCRIPTION_RENEWED
 *  3 = SUBSCRIPTION_CANCELED          ← immediately revoke
 *  4 = SUBSCRIPTION_PURCHASED         ← grant
 *  5 = SUBSCRIPTION_ON_HOLD           ← immediately revoke
 *  6 = SUBSCRIPTION_IN_GRACE_PERIOD   ← keep active until expiry
 * 12 = SUBSCRIPTION_REVOKED           ← immediately revoke
 * 13 = SUBSCRIPTION_EXPIRED           ← immediately revoke
 */

// Active/renewing events — set expiry to whatever Google says
const ACTIVE_EVENTS = [1, 2, 4, 6];
// Cancellation events — immediately block access right now
const CANCELLED_EVENTS = [3, 5, 12, 13];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.message || !body.message.data) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const dataBuffer = Buffer.from(body.message.data, 'base64');
    const dataString = dataBuffer.toString('utf-8');
    const notification = JSON.parse(dataString);

    if (!notification.subscriptionNotification) {
      // Not a subscription event (e.g. test notification)
      return NextResponse.json({ ok: true });
    }

    const { purchaseToken, subscriptionId, notificationType } =
      notification.subscriptionNotification;
    const packageName = notification.packageName || 'com.ramzbook.tj';

    // Only handle known event types
    if (![...ACTIVE_EVENTS, ...CANCELLED_EVENTS].includes(notificationType)) {
      return NextResponse.json({ ok: true });
    }

    const playCredentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    if (!playCredentialsStr) {
      console.error('[Google Play Webhook] Missing GOOGLE_PLAY_CREDENTIALS env var.');
      return NextResponse.json({ ok: true });
    }

    const credentials = JSON.parse(playCredentialsStr);
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/androidpublisher'],
    });

    const androidPublisher = google.androidpublisher({ version: 'v3', auth });

    const response = await androidPublisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token: purchaseToken,
    });

    const purchase = response.data;

    // ── Find the user who owns this purchase token ──────────────────────────
    let user = null;
    if (purchase.obfuscatedExternalAccountId) {
      user = await prisma.user.findUnique({
        where: { id: purchase.obfuscatedExternalAccountId },
      });
    }

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
      console.warn('[Google Play Webhook] No user found for token:', purchaseToken);
      // Return 200 so Google doesn't retry unnecessarily
      return NextResponse.json({ ok: true });
    }

    const expiryTimeMillis = parseInt(purchase.expiryTimeMillis || '0', 10);

    // ── ACTIVE EVENT: update expiry from Google ─────────────────────────────
    if (ACTIVE_EVENTS.includes(notificationType)) {
      if (expiryTimeMillis > 0) {
        const newExpiry = new Date(expiryTimeMillis);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            vipExpiresAt: newExpiry,
            vipPurchaseToken: purchaseToken, // keep latest token for future lookups
          },
        });
        console.log(
          `[Google Play Webhook] ✅ ACTIVE (type=${notificationType}): ` +
          `user ${user.id} → vipExpiresAt=${newExpiry.toISOString()}`
        );
      }
    }

    // ── CANCELLATION EVENT: immediately revoke access ───────────────────────
    else if (CANCELLED_EVENTS.includes(notificationType)) {
      // Set vipExpiresAt to NOW so the mobile app denies access on the very
      // next API call, without waiting for Google's stated expiry timestamp.
      // The purchase token is kept for audit trail purposes.
      const now = new Date();
      await prisma.user.update({
        where: { id: user.id },
        data: {
          vipExpiresAt: now,
        },
      });
      console.log(
        `[Google Play Webhook] ❌ CANCELLED (type=${notificationType}): ` +
        `user ${user.id} → vipExpiresAt set to NOW (${now.toISOString()})`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[Google Play Webhook Error]', err);
    // Return 500 so Google retries on transient DB/network errors
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
