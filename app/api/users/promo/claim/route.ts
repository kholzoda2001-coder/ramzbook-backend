import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { grantPromo } from '@/lib/promo';
import { logPaywallEvent } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/promo/claim
 *
 * Activates the free-Premium gift for the caller. Eligibility is re-checked
 * server-side inside grantPromo — the client is never trusted — and the claim
 * is one-per-user forever (tracked by the `type: 'promo'` PaymentTransaction).
 */
export async function POST(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await grantPromo(prisma, me.id);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, alreadyClaimed: result.alreadyClaimed ?? false, reason: result.reason },
        { status: 409 },
      );
    }

    // Same funnel as a real purchase, so the gift's conversion is measurable
    // next to the paid triggers. Best-effort — never fail the claim over it.
    try {
      await logPaywallEvent(me.id, 'promo_gift', 'purchased', null, { days: result.days });
    } catch {/* analytics only */}

    return NextResponse.json({
      ok: true,
      days: result.days,
      expiresAt: result.expiresAt,
      subscriptionTier: 'premium',
    });
  } catch (error) {
    console.error('[users/promo/claim]', error);
    return NextResponse.json({ error: 'Failed to activate promo' }, { status: 500 });
  }
}
