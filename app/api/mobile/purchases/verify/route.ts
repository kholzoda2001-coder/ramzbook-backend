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
    const { productId, purchaseToken, isVip } = body;

    if (!purchaseToken) {
      return NextResponse.json({ error: 'Missing purchase token' }, { status: 400 });
    }

    // Google Play Developer API Verification Step
    const playCredentialsStr = process.env.GOOGLE_PLAY_CREDENTIALS;
    const packageName = process.env.ANDROID_PACKAGE_NAME || 'com.ramzbook.tj'; // Assuming 'com.ramzbook.tj' from previous context

    if (playCredentialsStr) {
      try {
        const credentials = JSON.parse(playCredentialsStr);
        const auth = new google.auth.GoogleAuth({
          credentials,
          scopes: ['https://www.googleapis.com/auth/androidpublisher'],
        });
        
        const androidPublisher = google.androidpublisher({ version: 'v3', auth });
        
        // Since we are using Subscriptions for all these tiers:
        const response = await androidPublisher.purchases.subscriptions.get({
          packageName,
          subscriptionId: productId,
          token: purchaseToken,
        });

        const purchase = response.data;
        // Check if paymentState indicates an active or pending subscription
        // For subscriptions: paymentState 1 (Payment received), or undefined if it's trial/active without explicit state in older APIs.
        // It's safer to check if the expiry time is in the future.
        const expiryTimeMillis = parseInt(purchase.expiryTimeMillis || '0', 10);
        if (expiryTimeMillis < Date.now()) {
          return NextResponse.json({ error: 'Subscription expired on Google Play' }, { status: 400 });
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
      // Grant VIP for 1 month
      let vipExpiresAt = new Date();
      vipExpiresAt.setMonth(vipExpiresAt.getMonth() + 1);

      await prisma.user.update({
        where: { id: userId },
        data: { vipExpiresAt, vipPurchaseToken: purchaseToken }
      });

      return NextResponse.json({ ok: true, message: 'VIP granted.' });
    }

    if (!productId) {
      return NextResponse.json({ error: 'Product ID required for non-VIP purchases' }, { status: 400 });
    }

    // Grant specific book access
    // We determine 6-month or 1-year based on the productId naming convention
    // e.g., 'book_1_6m' or 'book_1_1y'. If it ends with 1y, we grant 1 year.
    let expiresAt = new Date();
    if (productId.endsWith('_1y')) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      // Default to 6 months
      expiresAt.setMonth(expiresAt.getMonth() + 6);
    }

    await prisma.userProgress.upsert({
      where: { userId_productId: { userId, productId: productId.replace('_6m', '').replace('_1y', '') } },
      create: {
        userId,
        productId: productId.replace('_6m', '').replace('_1y', ''),
        isPurchased: true,
        isManualGrant: false,
        expiresAt,
        purchaseToken,
        lastReadPageIndex: 0,
      },
      update: {
        isPurchased: true,
        isManualGrant: false,
        purchaseToken,
        expiresAt,
      },
    });

    return NextResponse.json({ ok: true, message: 'Purchase verified and granted.' });

  } catch (err) {
    console.error('[purchases/verify POST]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
