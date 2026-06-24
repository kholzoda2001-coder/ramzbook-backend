import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { checkAndUpdatePremium } from '@/lib/premium';
import { loadAiSettingsConfig, resolveApiKey } from '@/lib/ai/ai-settings';
import { openAiChat, type ChatMessage } from '@/lib/ai/openai';

export const dynamic = 'force-dynamic';

// Code → English language name for the system prompt.
const LANG_NAMES: Record<string, string> = {
  en: 'English', ru: 'Russian', tg: 'Tajik', ar: 'Arabic', tr: 'Turkish',
  zh: 'Chinese', de: 'German', fr: 'French', es: 'Spanish', it: 'Italian',
  ko: 'Korean', ja: 'Japanese', pt: 'Portuguese', hi: 'Hindi', fa: 'Persian',
};
const langName = (code?: string | null) =>
  (code && LANG_NAMES[code.split('-')[0]]) || 'English';

const MAX_HISTORY = 12;      // last N turns sent to the model
const MAX_CONTENT_LEN = 1000; // per-message char cap (abuse guard)

function startOfTodayUtc(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * POST /api/mobile/ai/chat
 * Body: { messages: [{ role: 'user'|'assistant', content }] }
 * Returns: { reply, remaining, limit } — or 429 when the daily limit is reached.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const cfg = await loadAiSettingsConfig(prisma);
    if (!cfg.enabled) {
      return NextResponse.json({ error: 'AI tutor is currently disabled.' }, { status: 503 });
    }

    const apiKey = resolveApiKey(cfg);
    if (!apiKey) {
      return NextResponse.json({ error: 'AI tutor is not configured.' }, { status: 503 });
    }

    const body = (await req.json()) as { messages?: Array<{ role?: string; content?: string }> };
    const incoming = Array.isArray(body.messages) ? body.messages : [];
    const history: ChatMessage[] = incoming
      .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-MAX_HISTORY)
      .map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content!.trim().slice(0, MAX_CONTENT_LEN) }));

    if (history.length === 0 || history[history.length - 1].role !== 'user') {
      return NextResponse.json({ error: 'A user message is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        targetLang: true, nativeLang: true, level: true,
        aiConversationsToday: true, aiConversationsResetAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // ── Daily rate limit (reset at UTC midnight) ──────────────────────────────
    const isPremium = await checkAndUpdatePremium(userId);
    const limit = isPremium ? cfg.premiumLimit : cfg.freeLimit;

    const todayStart = startOfTodayUtc();
    let used = user.aiConversationsToday;
    if (!user.aiConversationsResetAt || user.aiConversationsResetAt < todayStart) {
      used = 0; // new day → reset
    }

    if (used >= limit) {
      return NextResponse.json(
        { error: 'limit_reached', remaining: 0, limit },
        { status: 429 },
      );
    }

    // ── Build prompt & call OpenAI ────────────────────────────────────────────
    const systemContent = cfg.systemPrompt
      .replaceAll('{target}', langName(user.targetLang))
      .replaceAll('{native}', langName(user.nativeLang))
      .replaceAll('{level}', user.level || 'A1');

    const result = await openAiChat({
      apiKey,
      model: cfg.model,
      baseUrl: cfg.baseUrl,
      messages: [{ role: 'system', content: systemContent }, ...history],
    });

    if (!result.ok) {
      // Do NOT consume the user's quota when the provider failed.
      console.error('[ai/chat] OpenAI failed:', result.error);
      return NextResponse.json({ error: 'AI service unavailable. Please try again.' }, { status: 502 });
    }

    // ── Consume one message from the daily quota ──────────────────────────────
    const newUsed = used + 1;
    await prisma.user.update({
      where: { id: userId },
      data: { aiConversationsToday: newUsed, aiConversationsResetAt: todayStart },
    });

    return NextResponse.json({
      reply: result.reply,
      remaining: Math.max(0, limit - newUsed),
      limit,
    });
  } catch (err: any) {
    console.error('[ai/chat]', err);
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
