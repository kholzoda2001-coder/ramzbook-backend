import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

const ACTIVE_EVENTS = [1, 2, 4, 6, 7];
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
      return NextResponse.json({ ok: true });
    }

    if (!notification.subscriptionNotification) {
      return NextResponse.json({ ok: true });
    }

    const { purchaseToken, subscriptionId, notificationType } = notification.subscriptionNotification;
    const packageName = notification.packageName || 'com.ramzbook.tj';

    if (![...ACTIVE_EVENTS, ...CANCELLED_EVENTS].includes(notificationType)) {
      return NextResponse.json({ ok: true });
    }

    const playCredentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    if (!playCredentialsStr) {
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

    const subscription = await prisma.subscription.findUnique({
      where: { googlePurchaseToken: purchaseToken },
      include: { user: true }
    });

    if (!subscription) {
      return NextResponse.json({ ok: true });
    }

    const userId = subscription.userId;
    const expiryTimeMillis = parseInt(purchase.expiryTimeMillis || '0', 10);
    const now = new Date();

    if (ACTIVE_EVENTS.includes(notificationType)) {
      if (expiryTimeMillis > 0) {
        const newExpiry = new Date(expiryTimeMillis);
        await prisma.$transaction([
          prisma.user.update({
            where: { id: userId },
            data: { isPremium: true, premiumExpiresAt: newExpiry },
          }),
          prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'active', expiresAt: newExpiry, autoRenew: purchase.autoRenewing || false },
          })
        ]);
      }
    } else if (CANCELLED_EVENTS.includes(notificationType)) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: userId },
          data: { isPremium: false, premiumExpiresAt: now },
        }),
        prisma.subscription.update({
          where: { id: subscription.id },
          data: { status: 'cancelled', autoRenew: false, cancelledAt: now },
        })
      ]);
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('[Webhook/google-play]', err);
    return NextResponse.json({ error: 'Server error processing RTDN' }, { status: 500 });
  }
}
