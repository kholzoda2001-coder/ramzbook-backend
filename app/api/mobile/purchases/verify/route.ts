import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { verifyAndActivate, GooglePlayError } from '@/lib/googlePlay';

export const dynamic = 'force-dynamic';

/**
 * Legacy mobile endpoint kept for older app flows.
 * The real Google Play verification lives in lib/googlePlay.ts so every client
 * path uses the same package name, product mapping, and activation logic.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

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
    if (existing && existing.userId !== userId) {
      return NextResponse.json(
        { error: 'Purchase token already used by another account' },
        { status: 409 },
      );
    }

    const verified = await verifyAndActivate({
      userId,
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
    console.error('[mobile purchases/verify]', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
