import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { getMyLeague } from '@/lib/league';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/league/me — ҷадвали когортаи ҷории корбар.
 *
 * Ҳудудҳо (`promoteCutoff` / `demoteCutoff`) аз СЕРВЕР меоянд, на дар барнома
 * ҳамчун 10 ва 25 сахткод шудаанд: дар когортаи нопурра онҳо дигаранд ва
 * метри «болоравӣ / мемонед / поёнравӣ» бояд ҳақиқатро нишон диҳад.
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await getMyLeague(me.id));
  } catch (error) {
    console.error('[league/me]', error);
    return NextResponse.json({ error: 'Failed to load league' }, { status: 500 });
  }
}
