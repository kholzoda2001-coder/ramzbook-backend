/**
 * Admin-only adjustment of a single learner's promo Premium.
 * Guarded by middleware.ts (`/api/admin` requires an admin token).
 *
 * Body: { action: 'extend' | 'shorten' | 'cancel', days?: number }
 * `days` is required for extend/shorten. Only ever touches accounts whose
 * CURRENT plan is the promo gift (`premiumPlan === 'promo'`) — deliberately
 * refuses to touch a real Google Play subscription through this tool.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const DAY_MS = 86400000;

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const body = (await req.json().catch(() => ({}))) as { action?: string; days?: number };
    const action = body.action;

    if (!action || !['extend', 'shorten', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'action must be extend, shorten, or cancel' }, { status: 400 });
    }
    if (action !== 'cancel' && (!body.days || body.days <= 0)) {
      return NextResponse.json({ error: 'days must be a positive number' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.premiumPlan !== 'promo') {
      return NextResponse.json(
        { error: 'This account is not currently on the promo plan — refusing to touch a real subscription.' },
        { status: 400 },
      );
    }

    const now = new Date();
    let newExpiresAt: Date | null = null;
    let cancelled = false;

    if (action === 'cancel') {
      cancelled = true;
    } else {
      const base = user.premiumExpiresAt && user.premiumExpiresAt > now ? user.premiumExpiresAt : now;
      const deltaMs = (action === 'extend' ? 1 : -1) * (body.days as number) * DAY_MS;
      newExpiresAt = new Date(base.getTime() + deltaMs);
      if (newExpiresAt <= now) cancelled = true; // shortened into the past → same as cancelling
    }

    if (cancelled) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false,
          premiumPlan: null,
          premiumStartedAt: null,
          premiumExpiresAt: null,
          subscriptionTier: 'free',
          subscriptionPlan: null,
          subscriptionEndsAt: null,
          hearts: 5,
          maxHearts: 5,
          streakFreezesAvailable: 1,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: userId },
        data: { premiumExpiresAt: newExpiresAt, subscriptionEndsAt: newExpiresAt },
      });
    }

    // Audit trail — a separate type from the original claim so the claims
    // list (type:'promo') still reflects one row per actual grant.
    await prisma.paymentTransaction.create({
      data: {
        userId,
        type: 'promo_adjust',
        provider: 'mock',
        amount: 0,
        currency: 'TJS',
        status: 'success',
        metadata: { action, days: body.days ?? null, adjustedAt: now.toISOString(), result: cancelled ? 'cancelled' : 'adjusted' },
      },
    });

    const updated = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, isPremium: true, premiumPlan: true, premiumExpiresAt: true },
    });

    return NextResponse.json({ ok: true, user: updated });
  } catch (error) {
    console.error('[admin/promo-claims/:userId]', error);
    return NextResponse.json({ error: 'Failed to adjust promo' }, { status: 500 });
  }
}
