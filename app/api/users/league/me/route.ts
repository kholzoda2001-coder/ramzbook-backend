import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { getMyLeague } from '@/lib/league';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/league/me[?scope=all] — рейтинги ҳафта (пешфарз) ё рейтинги
 * тамоми XP. Ҷои ВОҚЕИИ корбар дар `you`, ҳатто берун аз 30-и боло.
 * Ниг. `lib/league.ts`.
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const scope = new URL(req.url).searchParams.get('scope') === 'all' ? 'all' : 'week';
    return NextResponse.json(await getMyLeague(me.id, new Date(), scope));
  } catch (error) {
    console.error('[league/me]', error);
    return NextResponse.json({ error: 'Failed to load league' }, { status: 500 });
  }
}
