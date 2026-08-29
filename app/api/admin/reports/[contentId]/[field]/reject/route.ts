import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/reports/:contentId/:field/reject
 *
 * Тамоми гурӯҳ → `rejected`. Ҳеҷ алмос, ҳеҷ огоҳӣ.
 *
 * ⚠️ ХОМӮШӢ ҚАСДАН АСТ. Ба одам гуфтан «шумо хато кардед» аз хомӯшӣ бадтар
 * аст: хонанда кӯшиш кард кӯмак кунад ва рад шудан ӯро дигар ҳеҷ гоҳ гузориш
 * фиристодан намемонад. Пас ин ҷо на push, на нишона — гузориш танҳо аз
 * навбат мебарояд.
 *
 * `rewarded` ДАСТ НАМЕХӮРАД: агар гузориш пештар (дар ҳалли қаблӣ) мукофот
 * гирифта бошад, алмос пас гирифта намешавад.
 */
export async function PATCH(
  _req: NextRequest,
  { params }: { params: { contentId: string; field: string } },
) {
  try {
    const contentId = decodeURIComponent(params.contentId);
    const field = decodeURIComponent(params.field);

    const res = await prisma.contentReport.updateMany({
      where: { contentId, field, status: 'new' },
      data: { status: 'rejected', resolvedAt: new Date() },
    });

    if (res.count === 0) {
      return NextResponse.json({ error: 'group not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, rejected: res.count });
  } catch (err: any) {
    console.error('[admin/reports reject]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
