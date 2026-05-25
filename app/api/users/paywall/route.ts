import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { evaluatePaywall, logPaywallEvent, type PaywallContext } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/paywall
 *   ?event=lives_empty|lesson_completed|level_completed|league_promoted
 *   &lessonsCompleted=5 &localHour=16 &rank=2 &log=1
 *
 * Returns the single best paywall offer to show now (or { trigger: null }).
 * Premium users always get null. Pass log=1 to record the impression.
 */
export async function GET(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const sp = req.nextUrl.searchParams;
    const ctx: PaywallContext = {
      event: sp.get('event') ?? undefined,
      lessonsCompleted: sp.get('lessonsCompleted') ? Number(sp.get('lessonsCompleted')) : undefined,
      localHour: sp.get('localHour') ? Number(sp.get('localHour')) : undefined,
      rank: sp.get('rank') ? Number(sp.get('rank')) : undefined,
    };

    const offer = await evaluatePaywall(me.id, ctx);

    if (!offer) return NextResponse.json({ trigger: null });

    // Optionally record the impression here (or the client logs it via POST).
    if (sp.get('log') === '1') {
      await logPaywallEvent(me.id, offer.trigger, 'shown', null, { ctx });
    }

    return NextResponse.json({
      trigger: offer.trigger,
      offer: offer.offer,
      discountPercent: offer.discountPercent ?? null,
      timerHours: offer.timerHours ?? null,
      title: offer.title,
      message: offer.message,
      cta: offer.cta,
    });
  } catch (error) {
    console.error('[paywall GET]', error);
    return NextResponse.json({ error: 'Failed to evaluate paywall' }, { status: 500 });
  }
}
