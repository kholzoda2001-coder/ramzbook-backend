import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { markStudied } from '@/lib/activity';
import { awardXp } from '@/lib/xp';
import { updateDailyTasks } from '@/lib/dailyTasks';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/chat/complete — «Сӯҳбат бо AI» тамом шуд.
 * Body: { sessionId }
 *
 * XP аз рӯи навбатҳое, ки СЕРВЕР коркард кард (`SpeakingChatSession.turns`),
 * на аз рақами клиент; як сессия — як бор. Силсила ҳамеша пеш меравад, агар
 * хонанда ҳадди ақал як бор гап зад.
 */
const XP_PER_TURN = 4;
const MAX_XP = 40;

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');
    const body = (await req.json().catch(() => ({}))) as { sessionId?: unknown };
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    const session = sessionId
      ? await prisma.speakingChatSession.findUnique({ where: { id: sessionId } })
      : null;
    if (!session || session.userId !== userId) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }
    if (session.turns === 0) {
      return NextResponse.json({ ok: true, xpEarned: 0 });
    }

    await markStudied(userId);
    const first = !session.completedAt;
    const amount = first ? Math.min(session.turns * XP_PER_TURN, MAX_XP) : 0;
    if (first) {
      await prisma.speakingChatSession.update({
        where: { id: sessionId },
        data: { completedAt: new Date() },
      });
    }
    const award = await awardXp(userId, amount, 'speaking_chat');
    if (amount > 0) await updateDailyTasks(userId, { xp: amount });

    return NextResponse.json({
      ok: true,
      xpEarned: amount,
      streak: award.streak,
      totalXp: award.totalXp,
    });
  } catch (err) {
    console.error('[ai/speaking/chat/complete] failed:', err);
    return apiError('Failed to save the chat.');
  }
}
