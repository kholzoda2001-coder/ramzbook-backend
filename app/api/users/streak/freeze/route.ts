import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const FREEZE_COST = 200; // Cost of one streak freeze

    if (user.isPremium) {
      // Premium users get unlimited freezes, but we just set it high
      return NextResponse.json({ success: true, streakFreezesAvailable: 999 });
    }

    if (user.gems < FREEZE_COST) {
      return NextResponse.json({ error: 'Not enough gems' }, { status: 400 });
    }

    // Purchase freeze
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        gems: { decrement: FREEZE_COST },
        streakFreezesAvailable: { increment: 1 },
      },
    });

    await prisma.gemTransaction.create({
      data: { userId: user.id, amount: -FREEZE_COST, reason: 'streak_freeze_purchase' },
    });

    return NextResponse.json({ 
      success: true, 
      streakFreezesAvailable: updatedUser.streakFreezesAvailable,
      gems: updatedUser.gems 
    });
  } catch (error: any) {
    console.error('Streak freeze purchase error:', error);
    return NextResponse.json({ error: 'Failed to purchase freeze' }, { status: 500 });
  }
}
