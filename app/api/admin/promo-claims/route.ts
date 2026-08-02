/**
 * Admin-only read of every free-Premium gift claim (the "2-month promo").
 * Guarded by middleware.ts (`/api/admin` requires an admin token).
 *
 * The claim itself is a `PaymentTransaction{type:'promo'}` row (see
 * lib/promo.ts grantPromo()) — it records WHEN and how many days were
 * granted, but not the CURRENT expiry, since an admin adjustment (see the
 * [userId] route) or a later real purchase can move that. Current status
 * always comes from the live `User` row.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  try {
    const claims = await prisma.paymentTransaction.findMany({
      where: { type: 'promo' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true, name: true, email: true, phone: true,
            isPremium: true, premiumPlan: true, premiumExpiresAt: true,
          },
        },
      },
    });

    const now = new Date();
    const rows = claims
      .filter((c) => c.user)
      .map((c) => {
        const u = c.user!;
        const meta = (c.metadata as { days?: number } | null) ?? {};
        const stillPromo = u.premiumPlan === 'promo';
        const isActive = stillPromo && u.isPremium && !!u.premiumExpiresAt && u.premiumExpiresAt > now;
        return {
          userId: u.id,
          name: u.name,
          email: u.email,
          phone: u.phone,
          claimedAt: c.createdAt,
          grantedDays: meta.days ?? null,
          expiresAt: u.premiumExpiresAt,
          // False once a real purchase or admin cancel has overwritten the promo plan —
          // still shown in the history, just no longer "the current" promo state.
          stillPromo,
          isActive,
        };
      });

    return NextResponse.json({
      total: rows.length,
      active: rows.filter((r) => r.isActive).length,
      expired: rows.filter((r) => r.stillPromo && !r.isActive).length,
      claims: rows,
    });
  } catch (error) {
    console.error('[admin/promo-claims]', error);
    return NextResponse.json({ error: 'Failed to load promo claims' }, { status: 500 });
  }
}
