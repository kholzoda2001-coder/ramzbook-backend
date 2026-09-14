import { NextResponse } from 'next/server';
import { getLeaguePreview, MIN_TIER, secondsUntilWeekEnd, weekKeyFor } from '@/lib/league';

export const dynamic = 'force-dynamic';

/**
 * GET /api/league/preview — БЕ auth.
 *
 * 🔴 2026-09-14: меҳмон (логин накарда) ҳам дар Хона рақобати ҳафтаро мебинад —
 * ҳамон шакли `/api/users/league/me` бо `placed: false` ва `preview`. Зинаи
 * аввал, чунки меҳмон ба он ҳамроҳ мешавад. `id` ва акс холӣ (`publicView`).
 */
export async function GET() {
  try {
    const now = new Date();
    const weekKey = weekKeyFor(now);
    const preview = await getLeaguePreview(MIN_TIER, now, { publicView: true });
    return NextResponse.json(
      {
        weekKey,
        secondsUntilEnd: secondsUntilWeekEnd(weekKey, now),
        tier: MIN_TIER,
        placed: false,
        members: [],
        you: null,
        memberCount: 0,
        preview,
      },
      { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } },
    );
  } catch (error) {
    console.error('[league/preview]', error);
    return NextResponse.json({ error: 'Failed to load league' }, { status: 500 });
  }
}
