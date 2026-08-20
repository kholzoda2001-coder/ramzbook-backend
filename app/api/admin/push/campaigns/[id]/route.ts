import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bodyToData } from '@/lib/pushCampaignInput';

/**
 * PATCH/DELETE /api/admin/push/campaigns/:id
 * Таҳрир ё нест кардани як кампания (ҳимоя: middleware-и админ).
 */
export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const data = bodyToData(body, false);
    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Ҳеҷ чиз барои тағйир нест' }, { status: 400 });
    }
    const updated = await prisma.pushCampaign.update({
      where: { id: params.id },
      data: data as any,
    });
    return NextResponse.json({ item: updated });
  } catch (e: any) {
    console.error('[admin/push/campaigns/:id] PATCH', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.pushCampaign.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (e: any) {
    console.error('[admin/push/campaigns/:id] DELETE', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
