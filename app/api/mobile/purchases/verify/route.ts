import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { google } from 'googleapis';

/**
 * POST /api/mobile/purchases/verify
 * 
 * Verifies a Google Play receipt and updates the UserProgress or User (for VIP).
 * Body: { productId: string, purchaseToken: string, isVip: boolean }
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = await req.json();
    const { productId, purchaseToken, isVip, targetBookId } = body;

    if (!purchaseToken) {
      return NextResponse.json({ error: 'Missing purchase token' }, { status: 400 });
    }

    // Google Play Developer API Verification Step
    const playCredentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    const packageName = process.env.ANDROID_PACKAGE_NAME || 'com.ramzbook.tj'; // Assuming 'com.ramzbook.tj' from previous context

    let parsedExpiryTime: Date | null = null;

    if (playCredentialsStr) {
      try {
        const credentials = JSON.parse(playCredentialsStr);
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        
        const androidPublisher = google.androidpublisher({ version: 'v3', auth });
        
        let isValid = false;

        if (productId === 'standard_single_book') {
          const response = await androidPublisher.purchases.products.get({
            packageName,
            productId,
            token: purchaseToken,
          });
          const purchase = response.data;
          // purchaseState 0 = PURCHASED
          if (purchase.purchaseState !== 0) {
            return NextResponse.json({ error: 'Purchase not successful on Google Play' }, { status: 400 });
          }
          isValid = true;
        } else {
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

          // Acknowledge the subscription if it hasn't been acknowledged yet
          if (purchase.acknowledgementState === 0) {
            try {
              await androidPublisher.purchases.subscriptions.acknowledge({
                packageName,
                subscriptionId: productId,
                token: purchaseToken,
              });
              console.log('[Billing] Server acknowledged subscription:', productId);
            } catch (ackErr: any) {
              console.error('[Billing] Failed to acknowledge subscription on server:', ackErr.message);
              // Non-fatal, client might have completed the purchase
            }
          }

          isValid = true;
        }
      } catch (err: any) {
        console.error('[Billing] Verification failed:', err.message);
        return NextResponse.json({ error: 'Invalid Google Play receipt' }, { status: 400 });
      }
    } else {
      if (process.env.NODE_ENV === 'production') {
        console.error('[Billing] CRITICAL: GOOGLE_PLAY_CREDENTIALS missing in production!');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
      }
      console.warn('[Billing] Bypassing strict Google Play validation due to missing GOOGLE_PLAY_CREDENTIALS in development. Token:', purchaseToken);
    }

    if (isVip) {
      // Use parsedExpiryTime if available, else fallback to manual calculation
      let vipExpiresAt = parsedExpiryTime || new Date();
      let subscriptionPlan = 'monthly';
      
      if (productId === 'vip_yearly') {
        if (!parsedExpiryTime) vipExpiresAt.setFullYear(vipExpiresAt.getFullYear() + 1);
        subscriptionPlan = 'yearly';
      } else {
        if (!parsedExpiryTime) vipExpiresAt.setMonth(vipExpiresAt.getMonth() + 1);
      }

      await prisma.user.update({
        where: { id: userId },
        data: { 
          vipExpiresAt, 
          vipPurchaseToken: purchaseToken,
          subscriptionPlan,
          vipGrantReason: null
        }
      });

      return NextResponse.json({ ok: true, message: 'VIP granted.' });
    }

    if (!targetBookId) {
      return NextResponse.json({ error: 'targetBookId is required for book purchases' }, { status: 400 });
    }

    // Grant lifetime access to the specific book
    await prisma.userProgress.upsert({
      where: { userId_productId: { userId, productId: targetBookId } },
      create: {
        userId,
        productId: targetBookId,
        isPurchased: true,
        isManualGrant: false,
        expiresAt: null, // Lifetime access
        purchaseToken,
        lastReadPageIndex: 0,
      },
      update: {
        isPurchased: true,
        isManualGrant: false,
        purchaseToken,
        expiresAt: null,
      },
    });

    return NextResponse.json({ ok: true, message: 'Purchase verified and granted.' });

  } catch (err) {
    console.error('[purchases/verify POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
