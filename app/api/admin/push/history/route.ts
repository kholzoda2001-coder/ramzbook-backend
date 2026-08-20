import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/push/history — таърих ва статистикаи фиристодан.
 *
 * Query: ?campaignId=…&status=sent|skipped|failed&limit=100
 *
 * Ин ҷадвал ягона манбаи ҳақиқат аст дар бораи он, ки воқеан чӣ фиристода шуд
 * (Firebase Console танҳо кампанияҳои худашро мебинад, на паёмҳои серверии моро).
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const campaignId = searchParams.get('campaignId');
    const status = searchParams.get('status');
    const limit = Math.min(Number(searchParams.get('limit') ?? 100), 500);

    const where: any = {};
    if (campaignId) where.campaignId = campaignId;
    if (status) where.status = status;

    const dayAgo = new Date(Date.now() - 86_400_000);
    const weekAgo = new Date(Date.now() - 7 * 86_400_000);

    const [items, sentToday, sentWeek, skippedToday, failedToday, byCampaign] = await Promise.all([
      prisma.pushSend.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { user: { select: { id: true, name: true, email: true, interfaceLang: true } } },
      }),
      prisma.pushSend.count({ where: { status: 'sent', createdAt: { gte: dayAgo } } }),
      prisma.pushSend.count({ where: { status: 'sent', createdAt: { gte: weekAgo } } }),
      prisma.pushSend.count({ where: { status: 'skipped', createdAt: { gte: dayAgo } } }),
      prisma.pushSend.count({ where: { status: 'failed', createdAt: { gte: dayAgo } } }),
      prisma.pushSend.groupBy({
        by: ['campaignKey'],
        where: { status: 'sent', createdAt: { gte: weekAgo } },
        _count: { _all: true },
      }),
    ]);

    return NextResponse.json({
      items,
      stats: {
        sentToday,
        sentWeek,
        skippedToday,
        failedToday,
        byCampaign: byCampaign
          .map((r) => ({ campaign: r.campaignKey ?? '—', count: r._count._all }))
          .sort((a, b) => b.count - a.count),
      },
    });
  } catch (e: any) {
    console.error('[admin/push/history]', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
