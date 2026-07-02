import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { resolveFriendStreak, unpairFriendStreak } from '@/lib/friendStreak';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/friend-streak
 * Current friend-streak pairing status (none/invited/active/broken).
 * Resolution (break detection) happens lazily inside resolveFriendStreak —
 * this route is safe to poll on every app open.
 */
export async function GET(req: Request) {
  try {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const result = await resolveFriendStreak(auth.id);
    return NextResponse.json(result);
  } catch (error) {
    console.error('[friend-streak GET]', error);
    return NextResponse.json({ error: 'Хатогӣ ҳангоми гирифтани ҳолати силсилаи дӯстӣ.' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/friend-streak
 * Voluntary unpair. No-op success if there's no active pairing (idempotent).
 */
export async function DELETE(req: Request) {
  try {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await unpairFriendStreak(auth.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[friend-streak DELETE]', error);
    return NextResponse.json({ error: 'Хатогӣ ҳангоми ҷудошавӣ.' }, { status: 500 });
  }
}
