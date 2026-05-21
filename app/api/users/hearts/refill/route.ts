import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { refillHearts } from '@/lib/hearts';

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const heartsData = await refillHearts(user.id);

    return NextResponse.json({ success: true, hearts: heartsData });
  } catch (error: any) {
    console.error('Heart refill error:', error);
    return NextResponse.json({ error: error.message || 'Failed to refill hearts' }, { status: 400 });
  }
}
