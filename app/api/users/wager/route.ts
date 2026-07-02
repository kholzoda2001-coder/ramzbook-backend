import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { resolveActiveWager } from '@/lib/wager';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/wager
 * Current "Double or Nothing" streak-wager status for the caller. Resolution
 * (win/loss detection) happens lazily inside resolveActiveWager — this route
 * is safe to poll on every app open.
 */
export async function GET(req: Request) {
  try {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await resolveActiveWager(auth.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[wager GET]', error);
    return NextResponse.json({ error: 'Хатогӣ ҳангоми гирифтани ҳолати гарав.' }, { status: 500 });
  }
}
