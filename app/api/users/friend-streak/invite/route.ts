import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { getOrCreateInvite } from '@/lib/friendStreak';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/friend-streak/invite
 * Generates (or returns the existing) invite code for the caller to share
 * with a friend. Idempotent — see getOrCreateInvite's doc comment.
 */
export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { code, expiresAt } = await getOrCreateInvite(auth.id);
    return NextResponse.json({ ok: true, code, expiresAt: expiresAt.toISOString() });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Хатогӣ ҳангоми сохтани рамз.';
    const status = message === 'Шумо аллакай бо дӯстон силсила доред.' ? 400 : 500;
    if (status === 500) console.error('[friend-streak/invite POST]', error);
    return NextResponse.json({ error: message }, { status });
  }
}
