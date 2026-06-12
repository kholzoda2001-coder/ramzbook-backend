import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/stats/revenue?period=30d|90d|1y
 * Returns daily revenue breakdown and plan/provider aggregates.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const period = searchParams.get('period') ?? '30d';

    const days = period === '90d' ? 90 : period === '1y' ? 365 : 30;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [transactions, byPlan, byProvider] = await Promise.all([
      prisma.paymentTransaction.findMany({
        where: { status: 'success', createdAt: { gte: since } },
        select: { amount: true, currency: true, createdAt: true, plan: true, provider: true },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.paymentTransaction.groupBy({
        by: ['plan'],
        _sum: { amount: true },
        _count: true,
        where: { status: 'success', createdAt: { gte: since } },
      }),
      prisma.paymentTransaction.groupBy({
        by: ['provider'],
        _sum: { amount: true },
        _count: true,
        where: { status: 'success', createdAt: { gte: since } },
      }),
    ]);

    // Aggregate daily totals
    const dailyMap = new Map<string, number>();
    for (const tx of transactions) {
      const day = tx.createdAt.toISOString().slice(0, 10);
      dailyMap.set(day, (dailyMap.get(day) ?? 0) + tx.amount);
    }
    const daily = Array.from(dailyMap.entries())
      .map(([date, amount]) => ({ date, amount: parseFloat(amount.toFixed(2)) }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const total = transactions.reduce((s, t) => s + t.amount, 0);

    return NextResponse.json({
      period,
      total: parseFloat(total.toFixed(2)),
      transactionCount: transactions.length,
      daily,
      byPlan: byPlan.map(r => ({
        plan: r.plan ?? 'unknown',
        total: parseFloat((r._sum.amount ?? 0).toFixed(2)),
        count: r._count,
      })),
      byProvider: byProvider.map(r => ({
        provider: r.provider,
        total: parseFloat((r._sum.amount ?? 0).toFixed(2)),
        count: r._count,
      })),
    });
  } catch (err: any) {
    console.error('[admin/stats/revenue GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
