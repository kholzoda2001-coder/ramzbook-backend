import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Helper to safely parse base64 Google Pub/Sub message
const decodeBase64 = (data: string) => Buffer.from(data, 'base64').toString('utf8');

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Google Pub/Sub sends data in message.data as base64
    if (!body.message || !body.message.data) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const decodedData = decodeBase64(body.message.data);
    const notification = JSON.parse(decodedData);

    // RTDN (Real-time developer notifications) structure
    if (notification.subscriptionNotification) {
      const subNotif = notification.subscriptionNotification;
      const purchaseToken = subNotif.purchaseToken;
      const notificationType = subNotif.notificationType;

      // Find subscription by token
      const subscription = await prisma.subscription.findUnique({
        where: { googlePurchaseToken: purchaseToken },
        include: { user: true }
      });

      if (!subscription) {
        console.warn('Received webhook for unknown purchaseToken:', purchaseToken);
        return NextResponse.json({ success: true }); // Acknowledge anyway so Google stops retrying
      }

      /*
        Notification Types:
        1: SUBSCRIPTION_RECOVERED
        2: SUBSCRIPTION_RENEWED
        3: SUBSCRIPTION_CANCELED (user turned off auto-renew)
        4: SUBSCRIPTION_PURCHASED
        5: SUBSCRIPTION_ON_HOLD
        6: SUBSCRIPTION_IN_GRACE_PERIOD
        7: SUBSCRIPTION_RESTARTED
        12: SUBSCRIPTION_REVOKED (expired / cancelled by Google)
        13: SUBSCRIPTION_EXPIRED
      */

      if (notificationType === 2 || notificationType === 1 || notificationType === 4 || notificationType === 7) {
        // Renewed or recovered -> we should theoretically verify with Google API to get new expiry, 
        // but for now we just mark as active. (A real app would fetch new expiryDate from Google APIs).
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'active', autoRenew: true }
        });
      } else if (notificationType === 3) {
        // Cancelled (will expire at the end of period)
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { autoRenew: false, cancelledAt: new Date() }
        });
      } else if (notificationType === 12 || notificationType === 13) {
        // Expired or revoked immediately
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'expired', autoRenew: false }
        });
        
        // Remove premium from user
        await prisma.user.update({
          where: { id: subscription.userId },
          data: {
            isPremium: false,
            premiumPlan: null,
            premiumExpiresAt: null,
            hearts: 5,
            maxHearts: 5,
            streakFreezesAvailable: 1,
          }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Google Play Webhook Error:', error);
    // Always return 200 or 202 to Pub/Sub to avoid endless retries, unless it's a transient server error.
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
