import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { languageName } from '@/lib/speaking/judge';
import { CHAT_LEVEL, FREE_TURNS, PREMIUM_TURNS, freeTalkAllowed } from '@/lib/speaking/chat';
import {
  AUTH_TOKENS_URL,
  CLOSING_SIGNAL,
  INPUT_SAMPLE_RATE,
  LIVE_FREE_MINUTES,
  LIVE_FREE_STARTS_PER_DAY,
  LIVE_PREMIUM_MINUTES,
  LIVE_PREMIUM_STARTS_PER_DAY,
  LIVE_WS_URL,
  OUTPUT_SAMPLE_RATE,
  RESUME_SIGNAL,
  START_SIGNAL,
  buildLivePrompt,
  buildLiveSetup,
  buildTokenRequest,
  cleanResumeHandle,
  liveConfig,
  liveEnabledFor,
  reconnectAllowed,
} from '@/lib/speaking/live';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/live/token — «Сӯҳбат бо AI» over Gemini Live.
 *
 * Body: { sessionId, langId, resumeHandle? }
 *
 *   Live OFF (flag, key or language) → 200 { enabled: false }
 *       The app then opens the OLD chat (`/api/ai/speaking/chat`) unchanged.
 *   Live ON → 200 { enabled: true, token, url, model, inputSampleRate,
 *       outputSampleRate, expiresAt, maxTurns, sessionMinutes, signals }
 *   403 { reason: 'limit' } — free talks used (same rule as the old chat).
 *   502 { reason: 'ai' }    — Google refused to mint a token.
 *
 * The permanent GEMINI_API_KEY is only used here, server-side. The app gets a
 * single-use token whose Live setup is locked (see lib/speaking/live.ts).
 */

const SESSION_RE = /^[a-zA-Z0-9-]{8,64}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json().catch(() => ({}))) as {
      sessionId?: unknown;
      langId?: unknown;
      resumeHandle?: unknown;
    };
    const sessionId = typeof body.sessionId === 'string' ? body.sessionId.trim() : '';
    const langId = typeof body.langId === 'string' ? body.langId.trim() : '';
    if (!SESSION_RE.test(sessionId) || !langId) {
      return NextResponse.json({ error: 'sessionId and langId are required.', reason: 'invalid' }, { status: 400 });
    }

    const cfg = liveConfig(process.env);
    // Cheap exit before any DB work: the flag is off → old pipeline.
    if (!cfg.enabled) return NextResponse.json({ enabled: false });

    const [user, language, memRow] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true, name: true } }),
      prisma.language.findUnique({ where: { id: langId }, select: { code: true } }),
      prisma.speakingChatMemory.findUnique({ where: { userId } }),
    ]);
    if (!user || !language) {
      return NextResponse.json({ error: 'Not found.', reason: 'invalid' }, { status: 404 });
    }
    if (!liveEnabledFor(cfg, language.code)) return NextResponse.json({ enabled: false });

    const sessionMinutes = user.isPremium ? LIVE_PREMIUM_MINUTES : LIVE_FREE_MINUTES;
    const maxTurns = user.isPremium ? PREMIUM_TURNS : FREE_TURNS;
    const now = Date.now();

    // ── Session + limits (same table and free-talk rule as the old chat) ──
    let session = await prisma.speakingChatSession.findUnique({ where: { id: sessionId } });
    if (session && session.userId !== userId) {
      return NextResponse.json({ error: 'Foreign session.', reason: 'invalid' }, { status: 403 });
    }
    if (session) {
      // Reconnect of a running conversation: only inside its time budget.
      if (!reconnectAllowed(session.startedAt, now, sessionMinutes)) {
        return NextResponse.json({ error: 'Session over.', reason: 'expired' }, { status: 410 });
      }
    } else {
      const [used, startedToday] = await Promise.all([
        user.isPremium
          ? Promise.resolve(0)
          : prisma.speakingChatSession.count({ where: { userId, turns: { gt: 0 } } }),
        prisma.speakingChatSession.count({ where: { userId, startedAt: { gte: new Date(now - DAY_MS) } } }),
      ]);
      if (!user.isPremium && !freeTalkAllowed(used, 0)) {
        return NextResponse.json({ error: 'Free talks used.', reason: 'limit' }, { status: 403 });
      }
      const perDay = user.isPremium ? LIVE_PREMIUM_STARTS_PER_DAY : LIVE_FREE_STARTS_PER_DAY;
      if (startedToday >= perDay) {
        return NextResponse.json({ error: 'Too many conversations today.', reason: 'limit' }, { status: 429 });
      }
      session = await prisma.speakingChatSession.create({
        data: { id: sessionId, userId, languageId: langId },
      });
    }

    // ── Locked Live setup → single-use ephemeral token ────────────────────
    const name = (memRow?.name || user.name || '').trim().split(/\s+/)[0] ?? '';
    const prompt = buildLivePrompt(
      { language: languageName(language.code), level: CHAT_LEVEL, name, facts: memRow?.facts ?? [] },
      cfg.promptOverride,
    );
    const resumeHandle = cleanResumeHandle(body.resumeHandle);
    const setup = buildLiveSetup({ model: cfg.model, voice: cfg.voice, prompt, resumeHandle });
    // The whole conversation must fit into the session's remaining budget.
    const remainingMin = Math.max(
      1,
      Math.ceil((session.startedAt.getTime() + sessionMinutes * 60_000 - now) / 60_000),
    );
    const tokenReq = buildTokenRequest({ setup, now, sessionMinutes: Math.min(sessionMinutes, remainingMin) });

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(AUTH_TOKENS_URL, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': cfg.apiKey },
        body: JSON.stringify(tokenReq),
        signal: ctrl.signal,
      });
    } finally {
      clearTimeout(timer);
    }
    const json = (await res.json().catch(() => ({}))) as { name?: unknown; error?: { status?: string; code?: number } };
    const token = typeof json.name === 'string' ? json.name : '';
    if (!res.ok || !token.startsWith('auth_tokens/')) {
      // Never log the key or the token — status only.
      console.error(`[speaking/live] token: ${res.status} ${json.error?.status ?? 'no token'}`);
      return NextResponse.json({ error: 'AI failed.', reason: 'ai' }, { status: 502 });
    }

    console.log(`[speaking/live] ${language.code} · ${cfg.model} · ${user.isPremium ? 'premium' : 'free'}${resumeHandle ? ' · resume' : ''}`);
    return NextResponse.json({
      enabled: true,
      token,
      url: LIVE_WS_URL,
      model: cfg.model,
      inputSampleRate: INPUT_SAMPLE_RATE,
      outputSampleRate: OUTPUT_SAMPLE_RATE,
      expiresAt: tokenReq.expireTime,
      maxTurns,
      sessionMinutes,
      signals: { start: START_SIGNAL, resume: RESUME_SIGNAL, closing: CLOSING_SIGNAL },
    });
  } catch (e) {
    console.error('[speaking/live] token failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Failed.', reason: 'error' }, { status: 500 });
  }
}
