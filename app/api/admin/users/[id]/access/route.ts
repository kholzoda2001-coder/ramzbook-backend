import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
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

    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json({ user: { ...user, vipExpiresAt: user.premiumExpiresAt, subscriptionPlan: user.premiumPlan }, books: [], subscriptions });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  try {
    const body = await req.json();
    const { action } = body as { action?: string };

    if (!action) return NextResponse.json({ error: 'Action required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Premium-ро бо ҳамаи имтиёзҳо медиҳад (мисли activatePremium) + сабти Subscription.
    const grant = async (plan: 'monthly' | 'yearly' | 'lifetime', expiresAt: Date | null) => {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: true,
          premiumPlan: plan,
          premiumStartedAt: new Date(),
          premiumExpiresAt: expiresAt,
          // имтиёзҳои premium
          hearts: 999,
          maxHearts: 999,
          streakFreezesAvailable: 999,
        },
      });
      // сабти обуна барои пайгирӣ (токени синтетикии админ — ягона)
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
      } catch (_) {/* агар такрор шавад, нодида мегирем */}
    }

    if (action === 'grant_vip' || action === 'grant_vip_monthly') {
      const e = new Date(); e.setMonth(e.getMonth() + 1);
      await grant('monthly', e);
      return NextResponse.json({ ok: true, message: 'Premium (моҳона) дода шуд — 1 моҳ.' });
    }

    if (action === 'grant_vip_1y' || action === 'grant_vip_yearly') {
      const e = new Date(); e.setFullYear(e.getFullYear() + 1);
      await grant('yearly', e);
      return NextResponse.json({ ok: true, message: 'Premium (солона) дода шуд — 1 сол.' });
    }

    if (action === 'grant_vip_lifetime') {
      await grant('lifetime', null);
      return NextResponse.json({ ok: true, message: 'Premium (якумра) дода шуд — доимӣ.' });
    }

    if (action === 'revoke_vip') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isPremium: false, premiumPlan: null, premiumExpiresAt: null,
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
