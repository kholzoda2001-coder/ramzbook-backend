import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { FREE_TURNS, PREMIUM_TURNS } from '@/lib/speaking/chat';
import { clampReportedTurns } from '@/lib/speaking/live';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/live/turns — the Gemini Live chat reports how many
 * times the learner spoke. Body: { sessionId, turns } → { turns }
 *
 * With Live the audio goes app → Google directly, so the server can't count
 * turns itself. The app calls this after the learner's FIRST turn (so the
 * conversation counts toward the free-talk limit, exactly like the old chat)
 * and once more when the chat ends — never per turn. The value is clamped
 * (`clampReportedTurns`), then the UNCHANGED `/api/ai/speaking/chat/complete`
 * awards XP from it as before.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');
    const body = (await req.json().catch(() => ({}))) as { sessionId?: unknown; turns?: unknown };
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    const [session, user] = await Promise.all([
      sessionId ? prisma.speakingChatSession.findUnique({ where: { id: sessionId } }) : null,
      prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } }),
    ]);
    if (!session || session.userId !== userId || !user) {
      return NextResponse.json({ error: 'Session not found.' }, { status: 404 });
    }
    // XP already given — the count is final.
    if (session.completedAt) return NextResponse.json({ turns: session.turns });

    const now = Date.now();
    const turns = clampReportedTurns({
      reported: body.turns,
      current: session.turns,
      maxTurns: user.isPremium ? PREMIUM_TURNS : FREE_TURNS,
      startedAt: session.startedAt,
      now,
    });
    if (turns !== session.turns) {
      await prisma.speakingChatSession.update({
        where: { id: sessionId },
        data: { turns, lastAt: new Date(now) },
      });
    }
    return NextResponse.json({ turns });
  } catch (e) {
    console.error('[speaking/live/turns] failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
