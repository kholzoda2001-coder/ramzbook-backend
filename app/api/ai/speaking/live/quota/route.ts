import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { MONTH_MS, freeLimits, liveQuotaFor, premiumLimits } from '@/lib/speaking/live';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/live/quota — боқимондаи дақиқаҳои «Сӯҳбат бо AI» (Gemini Live).
 *
 * Барои корти «Бо Рамз гап занед»: ройгон 3 дақиқа/рӯз ва 9 дақиқа дар умр;
 * Premium 10 дақиқа/рӯз ва 100 дақиқа/30 рӯз. Ҳамон қоидаи `token`, ҳеҷ чиз сабт
 * намешавад (хондан танҳо).
 *
 *   200 { plan, dayLimit, dayLeft, totalLimit, totalLeft, totalKind, availableSeconds, blocked }
 *   401 — бе вуруд.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } });
    if (!user) return NextResponse.json({ error: 'Not found.' }, { status: 404 });

    const now = Date.now();
    const rows = await prisma.speakingChatSession.findMany({
      where: {
        userId,
        liveGrantSeconds: { gt: 0 },
        ...(user.isPremium ? { startedAt: { gte: new Date(now - MONTH_MS) } } : {}),
      },
      select: { liveGrantSeconds: true, turns: true, startedAt: true, completedAt: true },
    });
    return NextResponse.json(liveQuotaFor(user.isPremium ? premiumLimits : freeLimits, rows, now));
  } catch (e) {
    console.error('[speaking/live/quota]', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
