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

    const [items, sentToday, sentWeek, skippedToday, failedToday, byCampaign, openedWeek, openedByCampaign] = await Promise.all([
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
      // CTR: чанд паём воқеан КУШОДА шуд (`/mobile/push/opened`). Бе ин мо
      // танҳо «фиристодем»-ро медонем ва матни бекораро аз матни кордор
      // фарқ карда наметавонем.
      prisma.pushSend.count({
        where: { status: 'sent', createdAt: { gte: weekAgo }, openedAt: { not: null } },
      }),
      prisma.pushSend.groupBy({
        by: ['campaignKey'],
        where: { status: 'sent', createdAt: { gte: weekAgo }, openedAt: { not: null } },
        _count: { _all: true },
      }),
    ]);

    const openedMap = new Map(openedByCampaign.map((r) => [r.campaignKey ?? '—', r._count._all]));

    return NextResponse.json({
      items,
      stats: {
        sentToday,
        sentWeek,
        skippedToday,
        failedToday,
        openedWeek,
        /** Фоизи кушодашуда дар 7 рӯз — ягона ченаки «кор кард ё не». */
        openRateWeek: sentWeek > 0 ? Math.round((openedWeek / sentWeek) * 100) : 0,
        byCampaign: byCampaign
          .map((r) => {
            const campaign = r.campaignKey ?? '—';
            const count = r._count._all;
            const opened = openedMap.get(campaign) ?? 0;
            return {
              campaign,
              count,
              opened,
              openRate: count > 0 ? Math.round((opened / count) * 100) : 0,
            };
          })
          .sort((a, b) => b.count - a.count),
      },
    });
  } catch (e: any) {
    console.error('[admin/push/history]', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
