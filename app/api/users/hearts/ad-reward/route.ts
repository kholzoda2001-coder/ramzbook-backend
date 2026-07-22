import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { grantAdHeart } from '@/lib/hearts';

/**
 * POST /api/users/hearts/ad-reward
 *
 * Called after the user has finished watching a rewarded AdMob video.
 * Grants one heart, capped at AD_HEARTS_PER_DAY per day.
 *
 * Note: this trusts the client's "the ad completed" claim. The daily cap is
 * what limits the damage; a forged call can at most gain the same hearts an
 * honest user gets for free. If ad revenue ever justifies it, the proper fix
 * is AdMob server-side verification (SSV) — AdMob calls OUR callback URL with
 * a signed payload, and we grant the heart from that request instead.
 */
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await grantAdHeart(user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error('Ad heart reward error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grant heart' },
      { status: 400 },
    );
  }
}
