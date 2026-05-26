import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const TRIAL_DAYS = 7;

/**
 * POST /api/users/subscription/start-trial
 * Body: { plan: 'monthly' | 'yearly' }
 *
 * @deprecated DEPRECATED — use google-verify instead
 * (POST /api/users/subscription/google-verify, real Google Play Billing).
 * Kept only for non-production testing. The Flutter app no longer calls this;
 * trials now flow through Google Play's free-trial period + server verification.
 *
 * MOCK trial activation (no real gateway). Grants 7 days of premium and records
 * a mock PaymentTransaction. Idempotent while already premium.
 */
export async function POST(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { plan?: string };
    const plan = body.plan === 'monthly' ? 'monthly' : 'yearly';

    const user = await prisma.user.findUnique({
      where: { id: me.id },
      select: { subscriptionTier: true, subscriptionEndsAt: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const now = new Date();
    // Already premium → no-op (don't stack trials).
    if (user.subscriptionTier === 'premium' && user.subscriptionEndsAt && user.subscriptionEndsAt > now) {
      return NextResponse.json({
        ok: true,
        alreadyPremium: true,
        subscriptionTier: 'premium',
        trialEndsAt: user.subscriptionEndsAt,
        plan,
      });
    }

    const trialEndsAt = new Date(now.getTime() + TRIAL_DAYS * 86400000);

    await prisma.user.update({
      where: { id: me.id },
      data: {
        subscriptionTier: 'premium',
        subscriptionPlan: plan,
        trialEndsAt,
        subscriptionEndsAt: trialEndsAt,
        // keep legacy premium flags in sync so existing perks (hearts, etc.) apply
        isPremium: true,
        premiumPlan: plan,
        premiumStartedAt: now,
        premiumExpiresAt: trialEndsAt,
        trialUsed: true,
        trialStartedAt: now,
        hearts: 999,
        maxHearts: 999,
        streakFreezesAvailable: 999,
      },
    });

    await prisma.paymentTransaction.create({
      data: {
        userId: me.id,
        type: 'trial',
        provider: 'mock',
        amount: 0,
        currency: 'USD',
        status: 'success',
        plan,
        metadata: { mock: true, trialDays: TRIAL_DAYS },
      },
    });

    return NextResponse.json({
      ok: true,
      subscriptionTier: 'premium',
      trialEndsAt,
      plan,
    });
  } catch (error) {
    console.error('[start-trial]', error);
    return NextResponse.json({ error: 'Failed to start trial' }, { status: 500 });
  }
}
