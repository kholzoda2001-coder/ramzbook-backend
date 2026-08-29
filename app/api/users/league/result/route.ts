import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { catchUpClosedWeeks } from '@/lib/league';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/league/result — натиҷаи ГИРИФТАНАШУДАИ ҳафтаи гузашта.
 *
 * Барнома инро ҳангоми кушодан, ПЕШ аз экрани асосӣ мепурсад. `result: null`
 * = чизе нест, рост ба Хона.
 *
 * `catchUpClosedWeeks` маҳз ин ҷо ҳам даъват мешавад: ҷадвали воқеӣ нест
 * (ниг. `lib/league.ts`), пас кушодани барнома яке аз ду лаҳзаест, ки ҳафтаи
 * гузаштаро мебандад.
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await catchUpClosedWeeks();

    const row = await prisma.leagueResult.findFirst({
      where: { userId: me.id, claimed: false },
      orderBy: { weekKey: 'desc' },
    });
    if (!row) return NextResponse.json({ result: null });

    return NextResponse.json({
      result: {
        id: row.id,
        weekKey: row.weekKey,
        tier: row.tier,
        newTier: row.newTier,
        finalRank: row.finalRank,
        memberCount: row.memberCount,
        weeklyXp: row.weeklyXp,
        outcome: row.outcome,
        gemsReward: row.gemsReward,
      },
    });
  } catch (error) {
    console.error('[league/result]', error);
    return NextResponse.json({ error: 'Failed to load result' }, { status: 500 });
  }
}
