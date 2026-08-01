import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { checkAndUpdatePremium } from '@/lib/premium';
import { loadAiSettingsConfig, resolveApiKey } from '@/lib/ai/ai-settings';
import { openAiChat } from '@/lib/ai/openai';

export const dynamic = 'force-dynamic';

const LANG_NAMES: Record<string, string> = {
  en: 'English', ru: 'Russian', tg: 'Tajik', ar: 'Arabic', tr: 'Turkish',
  zh: 'Chinese', de: 'German', fr: 'French', es: 'Spanish', it: 'Italian',
  ko: 'Korean', ja: 'Japanese', pt: 'Portuguese', hi: 'Hindi', fa: 'Persian',
};
const langName = (code?: string | null) =>
  (code && LANG_NAMES[code.split('-')[0]]) || 'English';

function startOfTodayUtc(): Date {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

/**
 * Strips the punctuation a tapped word drags along ("world." → "world").
 * Written without the `u` flag / `\p{L}` on purpose — this project's TS target
 * predates them — so the classes are spelled out for Latin + Cyrillic.
 */
const EDGE_JUNK = /^[^0-9A-Za-zЀ-ӿ'-]+|[^0-9A-Za-zЀ-ӿ'-]+$/g;

function normalize(raw: string): string {
  return raw.trim().replace(EDGE_JUNK, '').slice(0, 48);
}

/**
 * GET /api/mobile/lookup?word=hello
 *
 * Word meaning for the in-book reader: tapping a word in an EPUB should explain
 * it without leaving the page.
 *
 * Two tiers, in this order:
 *   1. The app's OWN vocabulary (`Word`) — instant, free, and already carries
 *      IPA, a Tajik respelling, an example and studio audio. Most taps land here.
 *   2. The AI tutor, for words the courses do not cover yet.
 *
 * The AI tier spends the SAME daily quota as the chat tutor, on purpose: it is
 * the same paid resource, and premium already buys a bigger allowance. When the
 * quota is gone the endpoint still answers `{ found: false, reason: 'limit' }`
 * so the reader can say so calmly instead of showing an error.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const word = normalize(req.nextUrl.searchParams.get('word') ?? '');
    if (!word) return NextResponse.json({ error: 'word is required' }, { status: 400 });

    // ── 1. Our own vocabulary ────────────────────────────────────────────────
    const hit = await prisma.word.findFirst({
      where: { word: { equals: word, mode: 'insensitive' } },
      select: {
        word: true, translation: true, emoji: true, ipa: true, ipaTajik: true,
        example: true, exampleTrans: true, audioUrl: true, partOfSpeech: true,
      },
      // A word can appear in several lessons; the richest row is the useful one.
      orderBy: [{ audioUrl: 'desc' }, { example: 'desc' }],
    });

    if (hit) {
      return NextResponse.json({ found: true, source: 'dictionary', ...hit });
    }

    // ── 2. AI fallback ───────────────────────────────────────────────────────
    const cfg = await loadAiSettingsConfig(prisma);
    const apiKey = resolveApiKey(cfg);
    if (!cfg.enabled || !apiKey) {
      return NextResponse.json({ found: false, word, reason: 'unavailable' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        targetLang: true, nativeLang: true,
        aiConversationsToday: true, aiConversationsResetAt: true,
      },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const isPremium = await checkAndUpdatePremium(userId);
    const limit = isPremium ? cfg.premiumLimit : cfg.freeLimit;
    const todayStart = startOfTodayUtc();
    let used = user.aiConversationsToday;
    if (!user.aiConversationsResetAt || user.aiConversationsResetAt < todayStart) used = 0;

    if (used >= limit) {
      return NextResponse.json({ found: false, word, reason: 'limit', limit });
    }

    const target = langName(user.targetLang);
    const native = langName(user.nativeLang);

    const result = await openAiChat({
      apiKey,
      model: cfg.model,
      baseUrl: cfg.baseUrl,
      messages: [
        {
          role: 'system',
          content:
            `You are a bilingual dictionary. The user taps a ${target} word while reading. ` +
            `Answer with STRICT JSON only, no markdown, no commentary, using exactly these keys: ` +
            `{"translation": "<short ${native} meaning, 1-4 words>", ` +
            `"partOfSpeech": "<noun|verb|adjective|adverb|phrase|other>", ` +
            `"example": "<one short ${target} sentence using the word>", ` +
            `"exampleTrans": "<that sentence in ${native}>"}. ` +
            `Keep it simple enough for a beginner.`,
        },
        { role: 'user', content: word },
      ],
    });

    if (!result.ok || !result.reply) {
      // Never charge the learner for our provider's bad day.
      console.error('[mobile/lookup] AI failed:', result.error);
      return NextResponse.json({ found: false, word, reason: 'unavailable' });
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      // Models sometimes wrap JSON in prose or a code fence — take the object.
      const m = result.reply.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : null;
    } catch {
      parsed = null;
    }
    if (!parsed || typeof parsed.translation !== 'string') {
      return NextResponse.json({ found: false, word, reason: 'unavailable' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { aiConversationsToday: used + 1, aiConversationsResetAt: todayStart },
    });

    return NextResponse.json({
      found: true,
      source: 'ai',
      word,
      translation: String(parsed.translation).slice(0, 200),
      partOfSpeech: typeof parsed.partOfSpeech === 'string' ? parsed.partOfSpeech.slice(0, 32) : null,
      example: typeof parsed.example === 'string' ? parsed.example.slice(0, 300) : null,
      exampleTrans: typeof parsed.exampleTrans === 'string' ? parsed.exampleTrans.slice(0, 300) : null,
      remaining: Math.max(0, limit - used - 1),
    });
  } catch (err) {
    console.error('[mobile/lookup]', err);
    return NextResponse.json({ error: 'Lookup failed' }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
