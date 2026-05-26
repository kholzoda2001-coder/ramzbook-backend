import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { verifyAndActivate, GooglePlayError } from '@/lib/googlePlay';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/subscription/google-verify
 * Body: { productId, purchaseToken, orderId? }
 *
 * Canonical purchase-verification endpoint for Google Play Billing (Phase 4A).
 * Server-side verification ONLY — the client purchase token is verified against
 * Google before any premium is granted. Writes a PaymentTransaction audit row.
 */
export async function POST(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as {
      productId?: string;
      purchaseToken?: string;
      orderId?: string;
    };

    if (!body.productId || !body.purchaseToken) {
      return NextResponse.json({ error: 'productId and purchaseToken are required' }, { status: 400 });
    }

    // Prevent a token from being claimed by a second account.
    const existing = await prisma.subscription.findUnique({
      where: { googlePurchaseToken: body.purchaseToken },
      select: { userId: true },
    });
    if (existing && existing.userId !== me.id) {
      return NextResponse.json({ error: 'Purchase token already used by another account' }, { status: 409 });
    }

    const verified = await verifyAndActivate({
      userId: me.id,
      productId: body.productId,
      purchaseToken: body.purchaseToken,
    });

    return NextResponse.json({
      success: true,
      plan: verified.plan,
      expiresAt: verified.expiresAt,
      isTrial: verified.isTrial,
    });
  } catch (error) {
    if (error instanceof GooglePlayError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('[google-verify]', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
