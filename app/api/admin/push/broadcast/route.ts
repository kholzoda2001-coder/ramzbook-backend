import { NextRequest, NextResponse } from 'next/server';
import { sendBroadcast } from '@/lib/pushRunner';
import { isPushConfigured } from '@/lib/push';
import type { Segment } from '@/lib/pushSegments';
import type { CampaignTexts } from '@/lib/pushTemplate';

/**
 * POST /api/admin/push/broadcast — фиристодани ДАСТӢ ба сегмент.
 *
 * Матн ҳамон шаблон аст ({name}, {streak}, {lesson}…), пас ҳатто паёми дастӣ
 * барои ҳар хонанда шахсӣ мебарояд ва бо забони худи ӯ мерасад.
 *
 * Body: { segment, texts, route?, dryRun?, force?, limit?, label?, tzOffsetMin? }
 *   dryRun пешфарз TRUE — то тасодуфан ба ҳама нарасад.
 *   force — лимити рӯзонаи корбарро мешиканад (танҳо барои эълони муҳим).
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const dryRun = body?.dryRun !== false;
    const texts = (body?.texts ?? {}) as CampaignTexts;

    if (Object.keys(texts).length === 0) {
      return NextResponse.json({ error: 'Матн ҳадди ақал барои як забон лозим аст' }, { status: 400 });
    }
    if (!dryRun && !isPushConfigured()) {
      return NextResponse.json(
        { error: 'FIREBASE_SERVICE_ACCOUNT дар Vercel гузошта нашудааст' },
        { status: 400 },
      );
    }

    const s = body?.segment ?? {};
    const segment: Segment = {
      langs: s.langs ?? null,
      tier: s.tier ?? null,
      studiedToday: s.studiedToday ?? null,
      minStreak: s.minStreak ?? null,
      maxStreak: s.maxStreak ?? null,
      minInactiveDays: s.minInactiveDays ?? null,
      maxInactiveDays: s.maxInactiveDays ?? null,
      levels: s.levels ?? null,
      countries: s.countries ?? null,
    };

    const result = await sendBroadcast(segment, texts, {
      route: body?.route ?? 'home',
      dryRun,
      force: body?.force === true,
      limit: body?.limit ? Number(body.limit) : undefined,
      tzOffsetMin: Number(body?.tzOffsetMin ?? 300),
      countdownToHour: body?.countdownToHour ?? null,
      label: body?.label || 'broadcast',
    });

    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    console.error('[admin/push/broadcast]', e);
    return NextResponse.json({ error: e.message || 'Failed' }, { status: 500 });
  }
}
