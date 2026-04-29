import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

/**
 * POST /api/webhooks/google-play
 * 
 * Google Cloud Pub/Sub push endpoint for Real-Time Developer Notifications (RTDN).
 * Handles subscription renewals, cancellations, and expirations.
 */
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

    const { purchaseToken, subscriptionId, notificationType } = notification.subscriptionNotification;
    const packageName = notification.packageName || 'com.ramzbook.tj';

    // We only care about events that might change expiration: 
    // 2 (Renewed), 3 (Canceled - doesn't change expiry, just autoRenewing state), 
    // 5 (Account Hold), 6 (Grace Period), 12 (Revoked), 13 (Expired)
    if (![2, 3, 5, 6, 12, 13].includes(notificationType)) {
      return NextResponse.json({ ok: true });
    }

    const playCredentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    if (!playCredentialsStr) {
      console.error('[Google Play Webhook] Missing credentials.');
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

    // Find the user who owns this purchase token
    let user = null;
    if (purchase.obfuscatedExternalAccountId) {
      user = await prisma.user.findUnique({
        where: { id: purchase.obfuscatedExternalAccountId }
      });
    }

    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          OR: [
            { vipPurchaseToken: purchaseToken },
            ...(purchase.linkedPurchaseToken ? [{ vipPurchaseToken: purchase.linkedPurchaseToken }] : [])
          ]
        }
      });
    }

    if (!user) {
      console.warn('[Google Play Webhook] No user found for token:', purchaseToken);
      // Return 200 anyway so Google doesn't retry
      return NextResponse.json({ ok: true });
    }

    const expiryTimeMillis = parseInt(purchase.expiryTimeMillis || '0', 10);
    
    if (expiryTimeMillis > 0) {
      const newExpiry = new Date(expiryTimeMillis);
      
      // Update the user's vipExpiresAt
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          vipExpiresAt: newExpiry,
          vipPurchaseToken: purchaseToken // keep latest token
        }
      });
      console.log(`[Google Play Webhook] Updated user ${user.id} expiry to ${newExpiry}`);
    }

    return NextResponse.json({ ok: true });

  } catch (err) {
    console.error('[Google Play Webhook Error]', err);
    // Always return 200 or 500? If 500, Google retries. 
    // We can return 500 if it's a DB error so it retries later.
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
