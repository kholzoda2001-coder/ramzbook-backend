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

    if (action === 'grant_vip') {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumPlan: 'monthly', premiumStartedAt: new Date(), premiumExpiresAt: expiresAt },
      });
      return NextResponse.json({ ok: true, message: 'Premium granted for 1 month.' });
    }

    if (action === 'grant_vip_1y') {
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: true, premiumPlan: 'yearly', premiumStartedAt: new Date(), premiumExpiresAt: expiresAt },
      });
      return NextResponse.json({ ok: true, message: 'Premium granted for 1 year.' });
    }

    if (action === 'revoke_vip') {
      await prisma.user.update({
        where: { id: userId },
        data: { isPremium: false, premiumPlan: null, premiumExpiresAt: null },
      });
      return NextResponse.json({ ok: true, message: 'Premium revoked.' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
