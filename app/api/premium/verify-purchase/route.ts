import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { verifyAndActivate, GooglePlayError } from '@/lib/googlePlay';

export const dynamic = 'force-dynamic';

/**
 * Legacy premium endpoint.
 * Kept for compatibility, but verification is delegated to the canonical
 * Google Play helper so package name/product handling stays consistent.
 */
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as {
      productId?: string;
      purchaseToken?: string;
    };

    if (!body.productId || !body.purchaseToken) {
      return NextResponse.json(
        { error: 'productId and purchaseToken are required' },
        { status: 400 },
      );
    }

    const existing = await prisma.subscription.findUnique({
      where: { googlePurchaseToken: body.purchaseToken },
      select: { userId: true },
    });
    if (existing && existing.userId !== user.id) {
      return NextResponse.json({ error: 'Token already used' }, { status: 409 });
    }

    const verified = await verifyAndActivate({
      userId: user.id,
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
    console.error('[premium verify-purchase]', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
