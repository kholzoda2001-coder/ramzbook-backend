import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { countSegment, segmentByLang, type Segment } from '@/lib/pushSegments';

/**
 * POST /api/admin/push/segment — «чанд нафар ин паёмро мегиранд?»
 *
 * Панел инро ҳангоми ҳар тағйири филтр даъват мекунад, то админ ПЕШ аз
 * фиристодан аудиторияи аслиро бинад (ва тасодуфан ба ҳама нафиристад).
 *
 * Body: сегмент (langs, tier, studiedToday, minStreak, …) + tzOffsetMin
 */
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const tz = Number(body?.tzOffsetMin ?? 300);

    const seg: Segment = {
      langs: body?.langs ?? null,
      tier: body?.tier ?? null,
      studiedToday: body?.studiedToday ?? null,
      minStreak: body?.minStreak ?? null,
      maxStreak: body?.maxStreak ?? null,
      minInactiveDays: body?.minInactiveDays ?? null,
      maxInactiveDays: body?.maxInactiveDays ?? null,
      levels: body?.levels ?? null,
      countries: body?.countries ?? null,
      friendStreak: body?.friendStreak ?? null,
      wager: body?.wager ?? null,
    };

    const [count, byLang, reachableTotal] = await Promise.all([
      countSegment(seg, tz),
      segmentByLang(seg, tz),
      prisma.user.count({ where: { pushEnabled: true, deviceTokens: { some: {} } } }),
    ]);

    return NextResponse.json({ count, byLang, reachableTotal });
  } catch (e: any) {
    console.error('[admin/push/segment]', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
