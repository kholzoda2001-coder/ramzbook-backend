import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { MAX_FREEZES_HELD } from '@/lib/streakFreezes';

/**
 * POST /api/users/streak/freeze — харидани як freeze бо гем.
 *
 * ⚠️ Ду чизи ислоҳшуда:
 *  1. Шохаи Premium `999` бармегардонд БЕ ягон навишт — рақами дурӯғ ба
 *     барнома мерафт, дар ҳоле ки дар база чизи дигар буд. Акнун Premium
 *     ҳиссаи худро ҳар моҳ мегирад (lib/streakFreezes.ts) ва ин ҷо ҳамон
 *     рақами ВОҚЕИИ худро мебинад.
 *  2. Харид ягон ҳад надошт — бо 500 гем 5 freeze гирифтан мумкин буд, яъне
 *     қоидаи «силсила бояд шикаста тавонад» бо пул убур мешуд. Акнун ҳадди
 *     нигоҳдорӣ ба ҳама баробар аст.
 */
export async function POST(req: Request) {
  try {
    const auth = await authenticate(req);
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: auth.id },
      select: { id: true, gems: true, streakFreezesAvailable: true },
    });
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const FREEZE_COST = 200; // Cost of one streak freeze

    if (user.streakFreezesAvailable >= MAX_FREEZES_HELD) {
      return NextResponse.json(
        {
          error: 'freeze_limit',
          message: `Шумо аллакай ${MAX_FREEZES_HELD} freeze доред — беш аз ин нигоҳ доштан мумкин нест.`,
          streakFreezesAvailable: user.streakFreezesAvailable,
        },
        { status: 400 },
      );
    }

    if (user.gems < FREEZE_COST) {
      return NextResponse.json({ error: 'Not enough gems' }, { status: 400 });
    }

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
      gems: updatedUser.gems,
    });
  } catch (error: any) {
    console.error('Streak freeze purchase error:', error);
    return NextResponse.json({ error: 'Failed to purchase freeze' }, { status: 500 });
  }
}
