import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { loseHeart } from '@/lib/hearts';

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const heartsData = await loseHeart(user.id);

    return NextResponse.json({
      ok: true,
      hearts: heartsData.hearts,
      maxHearts: heartsData.maxHearts,
      nextRegenSeconds: heartsData.nextRegenSeconds,
      isPremium: heartsData.isPremium,
      canContinue: heartsData.hearts > 0,
    });
  } catch (error: any) {
    console.error('Lose heart error:', error);
    return NextResponse.json({ error: error.message || 'Failed to process heart loss' }, { status: 400 });
  }
}
