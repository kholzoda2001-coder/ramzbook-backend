import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';
import { publicName } from '@/lib/profile/publicProfile';
import { validateReport } from '@/lib/profile/report';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/[id]/report — шикоят ба як корбар.
 *
 * Ҷасад: `{ reason, note? }`. Сабабҳо дар `lib/profile/report.ts`.
 *
 * ── Ду қарори ғайриоддӣ ────────────────────────────────────────────────────
 * 1. Шикояти ТАКРОРӢ хато НЕСТ. `upsert` сатри мавҷударо навсозӣ мекунад ва
 *    ҳамон `202`-ро бармегардонад. Хонандае, ки ду бор зер кард, набояд
 *    «Шумо аллакай шикоят кардед»-и сурхро бинад — вай ғазаб дорад, на
 *    ҳавсалаи фаҳмидани ҳолати система.
 * 2. Ҷавоб ҳеҷ гоҳ намегӯяд, ки бо шикоят чӣ шуд. Ин қасдан аст: ҷавоби
 *    «ин корбар аллакай 5 шикоят дорад» худаш маълумоти шахсист ва роҳи
 *    санҷидани дигаронро мекушояд.
 */
export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  try {
    const me = await authenticate(req);
    if (!me) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

    const check = validateReport({
      reporterId: me.id,
      reportedId: id,
      reason: body.reason,
      note: body.note,
    });
    if (!check.ok) {
      return NextResponse.json(
        { error: 'Invalid report', refusal: check.refusal },
        { status: 400 },
      );
    }

    // Сурати лаҳза: корбари бад номро баъди шикоят иваз мекунад, ва бе ин
    // ду сатр админ номи тозаро мебинад ва шикоятро беасос меҳисобад.
    const target = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, avatarUrl: true, isActive: true },
    });
    if (!target || !target.isActive) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.userReport.upsert({
      where: {
        reporterId_reportedId: { reporterId: me.id, reportedId: id },
      },
      create: {
        reporterId: me.id,
        reportedId: id,
        reason: check.reason,
        note: check.note,
        snapshotName: publicName(target.name),
        snapshotAvatar: target.avatarUrl,
        uiLanguage: typeof body.uiLanguage === 'string' ? body.uiLanguage : null,
        appVersion: typeof body.appVersion === 'string' ? body.appVersion : null,
      },
      update: {
        reason: check.reason,
        note: check.note,
        // Шикояти нав сатри аллакай ҳалшударо аз нав мекушояд — вагарна
        // корбаре, ки як бор «рад» гирифт, дигар ҳеҷ гоҳ дида намешуд.
        status: 'new',
        resolvedAt: null,
        snapshotName: publicName(target.name),
        snapshotAvatar: target.avatarUrl,
      },
    });

    return NextResponse.json({ ok: true }, { status: 202 });
  } catch (error) {
    console.error('[user report]', error);
    return NextResponse.json({ error: 'Failed to report' }, { status: 500 });
  }
}
