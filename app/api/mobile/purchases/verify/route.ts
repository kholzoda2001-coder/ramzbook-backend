import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { google } from 'googleapis';

export const dynamic = 'force-dynamic';

/**
 * POST /api/mobile/purchases/verify
 * 
 * Verifies a Google Play receipt and updates the User's Premium status and Subscription.
 * Body: { productId: string, purchaseToken: string }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = await req.json();
    const { productId, purchaseToken } = body;

    if (!purchaseToken || !productId) {
      return NextResponse.json({ error: 'Missing purchase token or productId' }, { status: 400 });
    }

    const playCredentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    const packageName = process.env.ANDROID_PACKAGE_NAME || 'com.ramzbook.tj';

    let parsedExpiryTime: Date | null = null;
    let autoRenewing = true;
    let orderId = '';

    if (playCredentialsStr) {
      let credentials: any;
      try {
        credentials = JSON.parse(playCredentialsStr);
      } catch (parseErr: any) {
        return NextResponse.json({ error: 'Server credentials misconfigured' }, { status: 500 });
      }

      try {
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        
        const androidPublisher = google.androidpublisher({ version: 'v3', auth });
        
        if (productId === 'ramz_lifetime') {
          // Lifetime is usually a one-time product
          const response = await androidPublisher.purchases.products.get({
            packageName,
            productId,
            token: purchaseToken,
          });
          const purchase = response.data;
          
          if (purchase.purchaseState !== 0) {
            return NextResponse.json({ error: 'Purchase not successful on Google Play' }, { status: 400 });
          }
          
          orderId = purchase.orderId || '';

          if (purchase.acknowledgementState === 0) {
            try {
              await androidPublisher.purchases.products.acknowledge({
                packageName,
                productId,
                token: purchaseToken,
              });
            } catch (ackErr) {}
          }
          
          parsedExpiryTime = new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000); // 100 years
          autoRenewing = false;
        } else {
          // Subscriptions (monthly, yearly)
          const response = await androidPublisher.purchases.subscriptions.get({
            packageName,
            subscriptionId: productId,
            token: purchaseToken,
          });

          const purchase = response.data;
          const expiryTimeMillis = parseInt(purchase.expiryTimeMillis || '0', 10);
          
          if (expiryTimeMillis < Date.now()) {
            return NextResponse.json({ error: 'Subscription expired on Google Play' }, { status: 400 });
          }
          
          parsedExpiryTime = new Date(expiryTimeMillis);
          autoRenewing = purchase.autoRenewing || false;
          orderId = purchase.orderId || '';

          if (purchase.acknowledgementState === 0) {
            try {
              await androidPublisher.purchases.subscriptions.acknowledge({
                packageName,
                subscriptionId: productId,
                token: purchaseToken,
              });
            } catch (ackErr) {}
          }
        }
      } catch (err: any) {
        console.error('[Billing]', err);
        return NextResponse.json({ error: 'Invalid Google Play receipt' }, { status: 400 });
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      // Dev fallback
      parsedExpiryTime = new Date();
      if (productId === 'vip_yearly') parsedExpiryTime.setFullYear(parsedExpiryTime.getFullYear() + 1);
      else if (productId === 'ramz_lifetime') parsedExpiryTime.setFullYear(parsedExpiryTime.getFullYear() + 100);
      else parsedExpiryTime.setMonth(parsedExpiryTime.getMonth() + 1);
      orderId = 'dev_order_' + Date.now();
    }

    const plan = productId === 'vip_yearly' ? 'yearly' : (productId === 'ramz_lifetime' ? 'lifetime' : 'monthly');

    // Save to database
    await prisma.$transaction(async (tx) => {
      // 1. Update User
      await tx.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumPlan: plan,
          premiumStartedAt: new Date(),
          premiumExpiresAt: parsedExpiryTime,
        }
      });

      // 2. Create or Update Subscription
      await tx.subscription.upsert({
        where: { googlePurchaseToken: purchaseToken },
        create: {
          userId,
          plan,
          status: 'active',
          googlePurchaseToken: purchaseToken,
          googleOrderId: orderId,
          googleProductId: productId,
          startedAt: new Date(),
          expiresAt: parsedExpiryTime,
          autoRenew: autoRenewing,
        },
        update: {
          status: 'active',
          expiresAt: parsedExpiryTime,
          autoRenew: autoRenewing,
        }
      });

      // 3. Create Payment Record (only if orderId is new)
      if (orderId) {
        const existingPayment = await tx.payment.findUnique({ where: { googleOrderId: orderId } });
        if (!existingPayment) {
           await tx.payment.create({
             data: {
               userId,
               amount: plan === 'yearly' ? 29.99 : (plan === 'lifetime' ? 99.99 : 4.99),
               currency: 'USD',
               plan,
               status: 'success',
               googleOrderId: orderId,
               googlePurchaseToken: purchaseToken,
             }
           });
        }
      }
    });

    return NextResponse.json({ ok: true, message: 'Premium granted successfully.' });

  } catch (err) {
    console.error('[purchases/verify POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
