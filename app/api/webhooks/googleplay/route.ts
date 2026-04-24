import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// import { google } from 'googleapis'; // Uncomment when fully implementing

/**
 * POST /api/webhooks/googleplay
 * 
 * Endpoint to receive Real-Time Developer Notifications (RTDN) from Google Cloud Pub/Sub.
 * You must configure Google Cloud Pub/Sub to push to this URL: https://yourdomain.com/api/webhooks/googleplay
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Pub/Sub messages are base64 encoded in body.message.data
    if (!body.message || !body.message.data) {
      return NextResponse.json({ error: 'Invalid Pub/Sub message format' }, { status: 400 });
    }

    const encodedData = body.message.data;
    const decodedData = Buffer.from(encodedData, 'base64').toString('utf8');
    const notification = JSON.parse(decodedData);

    // See Google Play Developer API documentation for DeveloperNotification structure
    // notification.subscriptionNotification contains info about renewals, cancellations, etc.
    if (notification.subscriptionNotification) {
      const subNotif = notification.subscriptionNotification;
      const purchaseToken = subNotif.purchaseToken;
      const subscriptionId = subNotif.subscriptionId;
      const notificationType = subNotif.notificationType;

      console.log(`[RTDN] Received subscription notification. Type: ${notificationType}, SubID: ${subscriptionId}, Token: ${purchaseToken}`);

      // Notification Types:
      // 1: SUBSCRIPTION_RECOVERED
      // 2: SUBSCRIPTION_RENEWED
      // 3: SUBSCRIPTION_CANCELED
      // 4: SUBSCRIPTION_PURCHASED
      // 5: SUBSCRIPTION_ON_HOLD
      // 6: SUBSCRIPTION_IN_GRACE_PERIOD
      // 7: SUBSCRIPTION_RESTARTED
      // 12: SUBSCRIPTION_REVOKED (expired/refunded)
      // 13: SUBSCRIPTION_EXPIRED

      // Note: Because Google Play RTDN does not reliably send your internal `userId` in the payload,
      // the standard implementation flow is:
      // 1. You receive this token.
      // 2. You look up the token in your own database to find the associated User/UserProgress.
      //    (Currently, our DB doesn't store purchaseToken. We should add it to UserProgress in a future schema migration if we want fully robust RTDN).
      // 3. You query Google Play API using `googleapis` with this token to get the exact expiry time.
      // 4. You update your database with the new expiry time.

      if (notificationType === 12 || notificationType === 13) {
        // Expired or Revoked. Revoke access.
        console.log(`[RTDN] Subscription ${subscriptionId} expired or revoked. Revoking access for token ${purchaseToken}...`);
        
        // 1. Check if it's a VIP token
        const user = await prisma.user.findFirst({ where: { vipPurchaseToken: purchaseToken } });
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { vipExpiresAt: new Date(Date.now() - 1000) } // Expire immediately
          });
          console.log(`[RTDN] VIP revoked for user ${user.id}`);
        } else {
          // 2. Check if it's a book token
          const progress = await prisma.userProgress.findFirst({ where: { purchaseToken } });
          if (progress) {
            await prisma.userProgress.update({
              where: { id: progress.id },
              data: { isPurchased: false, expiresAt: new Date(Date.now() - 1000) }
            });
            console.log(`[RTDN] Book access revoked for user ${progress.userId}`);
          }
        }
      } else if (notificationType === 2) {
        // Renewed
        console.log(`[RTDN] Subscription ${subscriptionId} renewed. Extending access for token ${purchaseToken}...`);
        
        // Note: For fully robust renewals, we should call the Google Play API to get the new `expiryTimeMillis`.
        // We will just log it here as "ready and documented" for when credentials are fully configured.
        /*
          const auth = new google.auth.GoogleAuth({ ... });
          const androidPublisher = google.androidpublisher({ version: 'v3', auth });
          const response = await androidPublisher.purchases.subscriptions.get({ ... });
          const expiryDate = new Date(parseInt(response.data.expiryTimeMillis, 10));
          
          await prisma.userProgress.update({
            where: { purchaseToken },
            data: { expiresAt: expiryDate, isPurchased: true }
          });
        */
        console.log('[RTDN] Code ready for fetching new expiry from Google API.');
      } else if (notificationType === 4) {
        console.log(`[RTDN] Subscription ${subscriptionId} purchased.`);
      }

    // Always return 200 OK to acknowledge receipt, otherwise Pub/Sub will retry
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[RTDN Error]', err.message);
    // Returning 500 will cause Pub/Sub to retry the message later
    return NextResponse.json({ error: 'Server error processing RTDN' }, { status: 500 });
  }
}
