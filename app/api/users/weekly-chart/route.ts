import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function dateOnly(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
function dateString(d: Date): string {
  return dateOnly(d).toISOString().split('T')[0];
}

/**
 * GET /api/users/weekly-chart
 * Per-day XP for the trailing 14 days (this week + last week) from DailyXp.
 * thisWeek = last 7 days ending today; lastWeek = the 7 days before that.
 * changePercent is null when lastWeekTotal === 0 (client hides the badge).
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const now = new Date();
    const today = dateOnly(now);
    const start = new Date(today.getTime() - 13 * 86400000); // 14-day window

    const rows = await prisma.dailyXp.findMany({
      where: { userId: me.id, date: { gte: start } },
      select: { date: true, xp: true },
    });

    const xpByDate: Record<string, number> = {};
    for (const r of rows) xpByDate[dateString(r.date)] = r.xp;

    const todayStr = dateString(today);
    const days = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 86400000);
      const ds = dateString(d);
      days.push({ date: ds, xp: xpByDate[ds] ?? 0, isToday: ds === todayStr });
    }

    const lastWeek = days.slice(0, 7);
    const thisWeek = days.slice(7);
    const sum = (arr: { xp: number }[]) => arr.reduce((s, d) => s + d.xp, 0);
    const thisWeekTotal = sum(thisWeek);
    const lastWeekTotal = sum(lastWeek);
    const changePercent =
      lastWeekTotal > 0
        ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
        : null;

    return NextResponse.json({
      thisWeek,
      lastWeek,
      thisWeekTotal,
      lastWeekTotal,
      changePercent,
    });
  } catch (error) {
    console.error('[weekly-chart]', error);
    return NextResponse.json({ error: 'Failed to load weekly chart' }, { status: 500 });
  }
}
