import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/leaderboard
 * Real users ranked by totalXp. Returns the top 50, the current user's row
 * (with true rank even if outside the top 50), and the total player count.
 * The client shows an "alone in league" empty state when totalPlayers <= 1.
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const select = {
      id: true,
      name: true,
      avatarUrl: true,
      totalXp: true,
      streak: true,
      level: true,
      isPremium: true,
    } as const;

    const top = await prisma.user.findMany({
      where: { isActive: true },
      orderBy: [{ totalXp: 'desc' }, { createdAt: 'asc' }],
      take: 50,
      select,
    });

    const toRow = (u: typeof top[number], rank: number) => ({
      rank,
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      xp: u.totalXp,
      streak: u.streak,
      level: u.level,
      isPro: u.isPremium,
      isYou: u.id === me.id,
    });

    const users = top.map((u, i) => toRow(u, i + 1));

    // Current user's row — compute true rank if they fell outside the top 50.
    let you = users.find((u) => u.isYou) ?? null;
    if (!you) {
      const meRow = await prisma.user.findUnique({ where: { id: me.id }, select });
      if (meRow) {
        const ahead = await prisma.user.count({
          where: { isActive: true, totalXp: { gt: meRow.totalXp } },
        });
        you = toRow(meRow, ahead + 1);
      }
    }

    const totalPlayers = await prisma.user.count({ where: { isActive: true } });

    return NextResponse.json({ users, you, totalPlayers });
  } catch (error) {
    console.error('[leaderboard]', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}
