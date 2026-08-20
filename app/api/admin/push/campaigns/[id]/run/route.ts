import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { runCampaign } from '@/lib/pushRunner';
import { isPushConfigured } from '@/lib/push';

/**
 * POST /api/admin/push/campaigns/:id/run — «Ҳозир иҷро кун».
 *
 * Body: { dryRun?: boolean, limit?: number, force?: boolean }
 *   dryRun (пешфарз TRUE) — ҳеҷ чиз намефиристад, танҳо мегӯяд чанд нафар
 *   мегиранд ва матни аслии аввалин корбарро нишон медиҳад.
 *
 * Пешфарз ҳатман dryRun аст — то тасодуфан ба ҳазор нафар паём нарасад.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dryRun !== false;

    const campaign = await prisma.pushCampaign.findUnique({ where: { id: params.id } });
    if (!campaign) return NextResponse.json({ error: 'Кампания ёфт нашуд' }, { status: 404 });

    if (!dryRun && !isPushConfigured()) {
      return NextResponse.json(
        { error: 'FIREBASE_SERVICE_ACCOUNT дар Vercel гузошта нашудааст' },
        { status: 400 },
      );
    }

    const result = await runCampaign(campaign, {
      dryRun,
      limit: body?.limit ? Number(body.limit) : undefined,
      force: body?.force === true,
    });

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    console.error('[admin/push/campaigns/:id/run]', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
