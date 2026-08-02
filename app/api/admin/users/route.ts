import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        isPremium: true,
        premiumPlan: true,
        premiumExpiresAt: true,
        totalXp: true,
        streak: true,
        createdAt: true,
        lastActiveAt: true,
      },
    });

    const now = new Date();
    // Map to shape the client expects. `phone`/`isActive` used to be
    // hardcoded to null/true here with comments claiming the schema had no
    // such fields — it does; that was simply wrong, and hid every real
    // phone number and any deactivated account's true status. `isPremium`
    // is recomputed from the real expiry instead of passed through as-is,
    // since the stored flag isn't reliably cleared when a plan expires
    // (see lib/premium.ts checkAndUpdatePremium).
    const mapped = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      isActive: u.isActive,
      isPremium: u.isPremium && (u.premiumPlan === 'lifetime' || (!!u.premiumExpiresAt && u.premiumExpiresAt >= now)),
      premiumPlan: u.premiumPlan,
      totalXp: u.totalXp,
      streak: u.streak,
      createdAt: u.createdAt,
      lastActiveAt: u.lastActiveAt,
    }));

    return NextResponse.json(mapped);
  } catch (error: any) {
    console.error('USERS API ERROR:', error?.message);
    return NextResponse.json({ error: error?.message || 'Хатои сервер' }, { status: 500 });
  }
}
