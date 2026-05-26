import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { activatePremium } from '@/lib/premium';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

const PACKAGE_NAME = 'tj.ramz.app'; // ваш package name

const auth = new google.auth.GoogleAuth({
  keyFile: 'google-service-account.json',
  scopes: ['https://www.googleapis.com/auth/androidpublisher'],
});

const androidPublisher = google.androidpublisher({ version: 'v3', auth });

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { productId, purchaseToken, orderId } = await req.json();
    
    if (!productId || !purchaseToken) {
      return NextResponse.json({ error: 'Missing params' }, { status: 400 });
    }
    
    // Check if token already used (prevent double-activation)
    const existing = await prisma.subscription.findUnique({
      where: { googlePurchaseToken: purchaseToken },
    });
    
    if (existing && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Token already used' }, { status: 400 });
    }
    
    // Verify with Google
    if (productId === 'ramz_lifetime') {
      // One-time product
      const result = await androidPublisher.purchases.products.get({
        packageName: PACKAGE_NAME,
        productId,
        token: purchaseToken,
      });
      
      // purchaseState: 0 = Purchased, 1 = Cancelled, 2 = Pending
      if (result.data.purchaseState !== 0) {
        return NextResponse.json({ error: 'Purchase not valid' }, { status: 400 });
      }
      
      // Activate Lifetime
      await activatePremium(
        user.id,
        'lifetime',
        null,
        purchaseToken,
        orderId || result.data.orderId || '',
        productId,
      );
      
      // Acknowledge to prevent refund
      if (result.data.acknowledgementState === 0) {
        await androidPublisher.purchases.products.acknowledge({
          packageName: PACKAGE_NAME,
          productId,
          token: purchaseToken,
          requestBody: {},
        });
      }
      
      return NextResponse.json({ success: true, plan: 'lifetime' });
      
    } else {
      // Subscription (monthly/yearly)
      const result = await androidPublisher.purchases.subscriptions.get({
        packageName: PACKAGE_NAME,
        subscriptionId: productId,
        token: purchaseToken,
      });
      
      // paymentState: 0 = Pending, 1 = Paid, 2 = Free trial, 3 = Pending deferred
      const paymentState = result.data.paymentState;
      if (paymentState !== 1 && paymentState !== 2) {
        return NextResponse.json({ error: 'Subscription not valid' }, { status: 400 });
      }
      
      const expiresAt = result.data.expiryTimeMillis 
        ? new Date(parseInt(result.data.expiryTimeMillis))
        : null;
      
      const plan = productId === 'vip_monthly' ? 'monthly' : 'yearly';
      
      await activatePremium(
        user.id,
        plan,
        expiresAt,
        purchaseToken,
        orderId || result.data.orderId || '',
        productId,
      );
      
      // Acknowledge
      if (result.data.acknowledgementState === 0) {
        await androidPublisher.purchases.subscriptions.acknowledge({
          packageName: PACKAGE_NAME,
          subscriptionId: productId,
          token: purchaseToken,
          requestBody: {},
        });
      }
      
      return NextResponse.json({ success: true, plan });
    }
  } catch (error: any) {
    console.error('Verify purchase error:', error);
    return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
  }
}
