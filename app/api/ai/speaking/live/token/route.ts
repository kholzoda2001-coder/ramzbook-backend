import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { languageName } from '@/lib/speaking/judge';
import { CHAT_LEVEL, FREE_TURNS, PREMIUM_TURNS } from '@/lib/speaking/chat';
import {
  AUTH_TOKENS_URL,
  CLOSING_SIGNAL,
  dayStart,
  INPUT_SAMPLE_RATE,
  LIVE_FREE_STARTS_PER_DAY,
  LIVE_PREMIUM_STARTS_PER_DAY,
  LIVE_WS_URL,
  MONTH_MS,
  OUTPUT_SAMPLE_RATE,
  RESUME_SIGNAL,
  START_SIGNAL,
  buildLivePrompt,
  buildLiveSetup,
  buildTokenRequest,
  cleanResumeHandle,
  freeLimits,
  grantFor,
  liveConfig,
  liveEnabledFor,
  premiumLimits,
  reconnectSeconds,
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
 *       outputSampleRate, expiresAt, maxTurns, sessionSeconds, signals }
 *   403 { code: 'live_free_used' } — 5 free minutes (whole lifetime) used.
 *   429 { code: 'live_day' | 'live_month' } — Premium: 10 min/day or 60 min/30 d used
 *       (or too many conversations started today).
 *   410 { reason: 'expired' } — this conversation's time is over.
 *   502 { reason: 'ai' }    — Google refused to mint a token.
 *
 * Limits count LIVE conversations only (`liveGrantSeconds > 0`); the old chat is
 * unaffected. The token expires with the conversation → Google ends it (hard cap).
 *
 * The permanent GEMINI_API_KEY is only used here, server-side. The app gets a
 * single-use token whose Live setup is locked (see lib/speaking/live.ts).
 */

const SESSION_RE = /^[a-zA-Z0-9-]{8,64}$/;

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

    const maxTurns = user.isPremium ? PREMIUM_TURNS : FREE_TURNS;
    const now = Date.now();

    // ── Сессия ва лимитҳои дақиқа ─────────────────────────────────────────
    // Лимитҳо (ройгон 5 дақиқа дар умр; Premium 60/30 рӯз ва 10/рӯз) танҳо
    // ба суҳбатҳои LIVE дахл доранд (`liveGrantSeconds > 0`); чати кӯҳна — не.
    let session = await prisma.speakingChatSession.findUnique({ where: { id: sessionId } });
    if (session && session.userId !== userId) {
      return NextResponse.json({ error: 'Foreign session.', reason: 'invalid' }, { status: 403 });
    }
    let sessionSeconds: number;
    if (session) {
      // Пайвасти дубораи суҳбати ҷорӣ: то охири ҳамон вақти додашуда, на бештар.
      const grant = session.liveGrantSeconds > 0 ? session.liveGrantSeconds : 5 * 60;
      sessionSeconds = reconnectSeconds(session.startedAt, grant, now);
      if (sessionSeconds <= 0) {
        return NextResponse.json({ error: 'Session over.', reason: 'expired' }, { status: 410 });
      }
    } else {
      const rows = await prisma.speakingChatSession.findMany({
        where: {
          userId,
          liveGrantSeconds: { gt: 0 },
          // Ройгон — аз ҳама вақт; Premium — 30 рӯзи охир.
          ...(user.isPremium ? { startedAt: { gte: new Date(now - MONTH_MS) } } : {}),
        },
        select: { liveGrantSeconds: true, turns: true, startedAt: true, completedAt: true },
      });
      const verdict = grantFor(user.isPremium ? premiumLimits : freeLimits, rows, now);
      if (!verdict.ok) {
        // `code` — барномаро мегӯяд, кадом паём нишон диҳад (ApiException.code).
        return NextResponse.json(
          {
            error: 'Live minutes used.',
            reason: 'limit',
            code: { free_used: 'live_free_used', day: 'live_day', month: 'live_month' }[verdict.reason],
          },
          { status: verdict.reason === 'free_used' ? 403 : 429 },
        );
      }
      const startedToday = rows.filter((r) => r.startedAt.getTime() >= dayStart(now)).length;
      const perDay = user.isPremium ? LIVE_PREMIUM_STARTS_PER_DAY : LIVE_FREE_STARTS_PER_DAY;
      if (startedToday >= perDay) {
        return NextResponse.json(
          { error: 'Too many conversations today.', reason: 'limit', code: 'live_day' },
          { status: 429 },
        );
      }
      sessionSeconds = verdict.seconds;
      session = await prisma.speakingChatSession.create({
        data: { id: sessionId, userId, languageId: langId, liveGrantSeconds: sessionSeconds },
      });
    }

    // ── Locked Live setup → single-use ephemeral token ────────────────────
    const name = (memRow?.name || user.name || '').trim().split(/\s+/)[0] ?? '';
    // Суҳбат КОМИЛАН озод аст: на роҳ, на ниша, на мавзӯи таъиншуда — ва ҳамеша сатҳи A1.
    const prompt = buildLivePrompt(
      { language: languageName(language.code), level: CHAT_LEVEL, name, facts: memRow?.facts ?? [] },
      cfg.promptOverride,
    );
    const resumeHandle = cleanResumeHandle(body.resumeHandle);
    const setup = buildLiveSetup({ model: cfg.model, voice: cfg.voice, prompt, resumeHandle });
    // Токен бо ҳамон вақт мемирад — Google суҳбатро худаш мебандад (ҳадди сахт).
    const tokenReq = buildTokenRequest({ setup, now, sessionSeconds });

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
      sessionSeconds,
      sessionMinutes: Math.ceil(sessionSeconds / 60),
      signals: { start: START_SIGNAL, resume: RESUME_SIGNAL, closing: CLOSING_SIGNAL },
    });
  } catch (e) {
    console.error('[speaking/live] token failed:', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Failed.', reason: 'error' }, { status: 500 });
  }
}
