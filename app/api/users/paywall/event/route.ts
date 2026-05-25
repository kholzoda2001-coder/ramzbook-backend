import { NextRequest, NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { logPaywallEvent } from '@/lib/paywall';

export const dynamic = 'force-dynamic';

const VALID_ACTIONS = new Set(['shown', 'dismissed', 'started_trial', 'purchased']);

/**
 * POST /api/users/paywall/event
 * Body: { trigger, action, variant?, context? }
 * Records a paywall impression / outcome for cooldown + the conversion funnel.
 */
export async function POST(req: NextRequest) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json() as {
      trigger?: string;
      action?: string;
      variant?: string;
      context?: unknown;
    };

    if (!body.trigger) {
      return NextResponse.json({ error: 'trigger is required' }, { status: 400 });
    }
    const action = body.action && VALID_ACTIONS.has(body.action) ? body.action : 'shown';

    await logPaywallEvent(me.id, body.trigger, action, body.variant, body.context);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[paywall event POST]', error);
    return NextResponse.json({ error: 'Failed to log paywall event' }, { status: 500 });
  }
}
