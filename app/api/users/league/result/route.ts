import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/league/result — натиҷаи ҳафтаи гузашта бо мукофот.
 *
 * 12.10.2026: лига акнун РЕЙТИНГИ ҲАФТА аст — бе зина, бе боло/поён рафтан ва
 * бе мукофот (алмос 14.09 нест шуд). Ҳамеша `result: null`, то барнома ҳеҷ гоҳ
 * экрани «Мукофотро гиред»-ро нишон надиҳад — ҳатто барои сатрҳои кӯҳнаи
 * гирифтанашудаи `LeagueResult` аз давраи когортаҳо.
 */
export async function GET(req: Request) {
  const me = await authenticate(req);
  if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ result: null });
}
