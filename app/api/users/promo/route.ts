import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPromoStateFor } from '@/lib/promo';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/promo
 *
 * The free-Premium gift state for the caller: whether they may claim it, how
 * long it lasts, and the copy to render. Used by BOTH sell screens (the
 * auto-triggered paywall and the Premium "shop"), so the gift appears
 * everywhere without each screen re-deriving eligibility.
 */
export async function GET(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const state = await getPromoStateFor(prisma, me.id);
    return NextResponse.json(state);
  } catch (error) {
    console.error('[users/promo GET]', error);
    // Never break a sell screen because the gift lookup failed.
    return NextResponse.json({ eligible: false }, { status: 200 });
  }
}
