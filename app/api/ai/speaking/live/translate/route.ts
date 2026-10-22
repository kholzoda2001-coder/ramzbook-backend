import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { translateTexts } from '@/lib/ai/translate';
import { cleanTranslateRequest } from '@/lib/speaking/live-translate';

export const dynamic = 'force-dynamic';

/**
 * POST /api/ai/speaking/live/translate — тарҷумаи як паёми Рамз (бо зарба).
 *
 * Body: { text, target?, source? }  → 200 { translation }
 *   400 — матн холӣ ё аз 500 ҳарф дароз; 401 — бе вуруд;
 *   503 — тарҷума дастнорас (калиди Google нест/баста) — барнома матнро бе тарҷума мегузорад.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { nativeLang: true } });
    const parsed = cleanTranslateRequest(body, user?.nativeLang);
    if (!parsed.ok) {
      return NextResponse.json({ error: 'Invalid text.', reason: parsed.reason }, { status: 400 });
    }

    const out = await translateTexts([parsed.text], parsed.target, parsed.source);
    const translation = out?.[0]?.trim();
    if (!translation) return NextResponse.json({ error: 'Translation unavailable.' }, { status: 503 });
    return NextResponse.json({ translation, target: parsed.target });
  } catch (e) {
    console.error('[speaking/live/translate]', e instanceof Error ? e.message : 'unknown');
    return NextResponse.json({ error: 'Failed.' }, { status: 500 });
  }
}
