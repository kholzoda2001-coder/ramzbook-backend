import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ensureDefaultCampaigns } from '@/lib/pushDefaults';
import { countSegment } from '@/lib/pushSegments';
import { isDue, segmentOf } from '@/lib/pushRunner';
import { PLACEHOLDERS } from '@/lib/pushTemplate';
import { isPushConfigured } from '@/lib/push';
import { bodyToData } from '@/lib/pushCampaignInput';

/**
 * /api/admin/push/campaigns — кампанияҳои автоматӣ (ҳимоя: middleware-и админ).
 *
 * GET  — рӯйхат бо ҳисоби «чанд нафар ҳозир ба сегмент мувофиқанд». Агар ҷадвал
 *        холӣ бошад, кампанияҳои оғозӣ як бор сохта мешаванд.
 * POST — кампанияи нав.
 */
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const seeded = await ensureDefaultCampaigns();
    const rows = await prisma.pushCampaign.findMany({ orderBy: [{ priority: 'asc' }, { hour: 'asc' }] });
    const now = new Date();

    // Барои ҳар кампания ҳозир чанд нафар мувофиқанд — админ фавран мебинад,
    // ки сегменташ холӣ нест.
    const items = [];
    for (const c of rows) {
      let audience = 0;
      try {
        audience = await countSegment(segmentOf(c), c.tzOffsetMin, now);
      } catch (_) {/* ҳисоб набояд рӯйхатро вайрон кунад */}
      items.push({ ...c, audience, due: isDue(c, now) });
    }

    return NextResponse.json({
      items,
      seeded,
      placeholders: PLACEHOLDERS,
      pushConfigured: isPushConfigured(),
      serverTime: now.toISOString(),
    });
  } catch (e: any) {
    console.error('[admin/push/campaigns] GET', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body?.name?.trim()) {
      return NextResponse.json({ error: 'Ном лозим аст' }, { status: 400 });
    }
    if (!body?.texts || Object.keys(body.texts).length === 0) {
      return NextResponse.json({ error: 'Матн ҳадди ақал барои як забон лозим аст' }, { status: 400 });
    }
    const data = bodyToData(body, true);
    const created = await prisma.pushCampaign.create({ data: data as any });
    return NextResponse.json({ item: created });
  } catch (e: any) {
    console.error('[admin/push/campaigns] POST', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
