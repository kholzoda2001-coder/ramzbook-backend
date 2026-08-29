import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { getFriendsLeague } from '@/lib/league';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/league/friends — ҳамон шакл, вале танҳо дӯстон.
 *
 * «Дӯст» = графи `FriendInvite` дар ҳар ду самт. Рӯйхати холӣ = корбар ҳанӯз
 * дӯст надорад; барнома ҳолати холии макетро бо тугмаи даъват нишон медиҳад.
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await getFriendsLeague(me.id));
  } catch (error) {
    console.error('[league/friends]', error);
    return NextResponse.json({ error: 'Failed to load friends league' }, { status: 500 });
  }
}
