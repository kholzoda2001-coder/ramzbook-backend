import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { redeemInviteCode } from '@/lib/friendStreak';

export const dynamic = 'force-dynamic';

// Every message redeemInviteCode()/getOrCreateInvite() can throw is a known,
// user-facing validation failure (400), not a server error (500). Anything
// else thrown (a real bug/DB hiccup) falls through to 500.
const KNOWN_VALIDATION_MESSAGES = new Set([
  'Лутфан рамзи дӯстро ворид кунед.',
  'Рамз нодуруст аст.',
  'Ин рамз аллакай истифода шудааст.',
  'Мӯҳлати рамз тамом шудааст.',
  'Шумо наметавонед бо рамзи худ ҳамроҳ шавед.',
  'Шумо аллакай бо дӯстон силсила доред.',
  'Ин корбар аллакай бо дигаре ҳамроҳ шудааст.',
]);

/**
 * POST /api/users/friend-streak/join
 * Body: { code: string }
 * Redeems a friend's invite code, pairing the caller with its creator.
 */
export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { code?: string };
    const result = await redeemInviteCode(auth.id, body.code ?? '');
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Хатогӣ ҳангоми ҳамроҳшавӣ.';
    const status = KNOWN_VALIDATION_MESSAGES.has(message) ? 400 : 500;
    if (status === 500) console.error('[friend-streak/join POST]', error);
    return NextResponse.json({ error: status === 500 ? 'Хатогӣ ҳангоми ҳамроҳшавӣ.' : message }, { status });
  }
}
