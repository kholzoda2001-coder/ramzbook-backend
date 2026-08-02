/**
 * Admin-only manual Premium subscription management for a single user.
 *
 * Grants one of the four REAL plans the app sells (see PlanIds in
 * frontend/lib/services/billing_service.dart / PRODUCT_PLAN in
 * lib/googlePlay.ts): monthly, sixmonths, yearly, lifetime — same plan
 * keys, so an admin-granted subscription looks identical to a real
 * Google Play one everywhere else in the app. For support/promo/trial
 * cases only — not a substitute for real sales (Google Play policy).
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const PLAN_DURATION_DAYS: Record<string, number> = {
  monthly: 30,
  sixmonths: 182,
  yearly: 365,
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true,
        isPremium: true, premiumPlan: true,
        premiumStartedAt: true, premiumExpiresAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const now = new Date();
    const isReallyPremium = user.isPremium && (user.premiumPlan === 'lifetime' || (!!user.premiumExpiresAt && user.premiumExpiresAt >= now));

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({
      user: { ...user, isPremium: isReallyPremium, vipExpiresAt: user.premiumExpiresAt, subscriptionPlan: isReallyPremium ? user.premiumPlan : null },
      subscriptions,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: userId } = await params;
  try {
    const body = await req.json();
    const { action } = body as { action?: string };
    if (!action) return NextResponse.json({ error: 'Action required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Grants Premium with every real perk (same as a Google Play purchase —
    // see lib/googlePlay.ts activateVerifiedPurchase) + an audit Subscription
    // row. Sets BOTH the legacy (isPremium/premiumPlan/premiumExpiresAt) and
    // canonical (subscriptionTier/subscriptionPlan/subscriptionEndsAt) fields
    // — a real purchase only sets the legacy ones, which is exactly the gap
    // that made the Dashboard/Analytics "Premium" counts unreliable; an
    // admin grant shouldn't repeat that mistake.
    const grant = async (plan: 'monthly' | 'sixmonths' | 'yearly' | 'lifetime') => {
      const expiresAt = plan === 'lifetime' ? null : new Date(Date.now() + PLAN_DURATION_DAYS[plan] * 86400000);
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumPlan: plan,
          premiumStartedAt: new Date(),
          premiumExpiresAt: expiresAt,
          subscriptionTier: 'premium',
          subscriptionPlan: plan,
          subscriptionEndsAt: expiresAt,
          hearts: 999,
          maxHearts: 999,
          streakFreezesAvailable: 999,
        },
      });
      try {
        await prisma.subscription.create({
          data: {
            userId,
            plan,
            status: 'active',
            googlePurchaseToken: `admin_${userId}_${Date.now()}`,
            googleProductId: 'admin_grant',
            expiresAt,
            autoRenew: false,
          },
        });
      } catch (_) { /* duplicate token collision — ignore, User row is the source of truth */ }
      await prisma.paymentTransaction.create({
        data: {
          userId, type: 'subscription', provider: 'mock', amount: 0, currency: 'USD',
          status: 'success', plan, metadata: { adminGrant: true, grantedAt: new Date().toISOString() },
        },
      });
    };

    const PLAN_LABEL: Record<string, string> = { monthly: 'моҳона', sixmonths: 'шашмоҳа', yearly: 'солона', lifetime: 'якумра' };

    if (action === 'grant_monthly' || action === 'grant_sixmonths' || action === 'grant_yearly' || action === 'grant_lifetime') {
      const plan = action.replace('grant_', '') as 'monthly' | 'sixmonths' | 'yearly' | 'lifetime';
      await grant(plan);
      return NextResponse.json({ ok: true, message: `Premium (${PLAN_LABEL[plan]}) дода шуд.` });
    }

    if (action === 'revoke') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false, premiumPlan: null, premiumStartedAt: null, premiumExpiresAt: null,
          subscriptionTier: 'free', subscriptionPlan: null, subscriptionEndsAt: null,
          hearts: 5, maxHearts: 5, streakFreezesAvailable: 1,
        },
      });
      await prisma.subscription.updateMany({
        where: { userId, status: 'active' },
        data: { status: 'cancelled', cancelledAt: new Date() },
      });
      return NextResponse.json({ ok: true, message: 'Premium бекор шуд.' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
