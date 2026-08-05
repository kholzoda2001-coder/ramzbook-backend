import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { grantAdGems, getAdGemsStatus } from '@/lib/adGems';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/gems/ad-reward
 *
 * Today's state without granting anything — lets the app show
 * "3 of 5 left today" before the user taps.
 */
export async function GET(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({ success: true, ...(await getAdGemsStatus(user.id)) });
  } catch (error: any) {
    console.error('[gems/ad-reward GET]', error);
    return NextResponse.json({ error: 'Failed to load status' }, { status: 400 });
  }
}

/**
 * POST /api/users/gems/ad-reward
 *
 * Called after the user finished watching a rewarded video. Grants
 * GEMS_PER_AD gems, capped at AD_GEMS_PER_DAY per day.
 *
 * Same trust model as /users/hearts/ad-reward: this believes the client's
 * "the ad completed" claim, and the daily cap is what limits the damage — a
 * forged call can at most gain what an honest user gets for free. The proper
 * fix, if ad revenue ever justifies it, is server-side verification (SSV):
 * the ad network calls OUR signed callback and we grant from that instead.
 */
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await grantAdGems(user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[gems/ad-reward POST]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grant gems' },
      { status: 400 },
    );
  }
}
