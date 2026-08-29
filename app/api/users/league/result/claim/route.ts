import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/league/result/claim — мукофоти ҳафтаро медиҳад.
 *
 * ⚠️ БЕХАТАР барои даъвати такрорӣ. Тугма метавонад ду бор пахш шавад, шабака
 * метавонад дархостро такрор кунад — алмос бояд ЯК бор дода шавад.
 *
 * Гейт `updateMany({ claimed: false })` аст: он дар як амали атомӣ ҳам месанҷад
 * ҳам менависад. Танҳо агар маҳз ҳамин даъват сатрро иваз карда бошад
 * (`count === 1`), алмос илова мешавад. Даъвати дуюм 0 мегирад ва хомӯшона
 * ҳамон ҷавобро бармегардонад — на хато, чунки барои корбар ҳама чиз дуруст
 * рафт.
 */
export async function POST(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = (await req.json().catch(() => ({}))) as { resultId?: string };

    const row = body.resultId
      ? await prisma.leagueResult.findFirst({ where: { id: body.resultId, userId: me.id } })
      : await prisma.leagueResult.findFirst({
          where: { userId: me.id, claimed: false },
          orderBy: { weekKey: 'desc' },
        });

    if (!row) return NextResponse.json({ granted: false, reason: 'no_result' });

    const claimed = await prisma.leagueResult.updateMany({
      where: { id: row.id, userId: me.id, claimed: false },
      data: { claimed: true, claimedAt: new Date() },
    });

    if (claimed.count === 1 && row.gemsReward > 0) {
      await prisma.user.update({
        where: { id: me.id },
        data: { gems: { increment: row.gemsReward } },
      });
      await prisma.gemTransaction.create({
        data: { userId: me.id, amount: row.gemsReward, reason: 'league_reward' },
      });
    }

    const fresh = await prisma.user.findUnique({
      where: { id: me.id },
      select: { gems: true },
    });

    return NextResponse.json({
      granted: claimed.count === 1,
      gemsAwarded: claimed.count === 1 ? row.gemsReward : 0,
      gems: fresh?.gems ?? 0,
    });
  } catch (error) {
    console.error('[league/result/claim]', error);
    return NextResponse.json({ error: 'Failed to claim' }, { status: 500 });
  }
}
