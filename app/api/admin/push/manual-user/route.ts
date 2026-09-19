import { NextResponse } from 'next/server';
import { sendPushToUser, isPushConfigured } from '@/lib/push';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, title, body: text } = body;

    if (!userId || !title || !text) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    if (!isPushConfigured()) {
      return NextResponse.json({ error: 'Push not configured' }, { status: 500 });
    }

    const result = await sendPushToUser(userId, title, text, { route: 'home' }, { ignorePreference: true, ignoreFrequencyCap: true });
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
