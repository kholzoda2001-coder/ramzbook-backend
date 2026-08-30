import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { checkAndUpdatePremium } from '@/lib/premium';
import { unlockedIds } from '@/lib/libraryAccess';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * GET /api/mobile/library[?type=book&lang=en]
 *
 * Every active library item, newest-ordered within its type. Books/templates
 * carry a page count so the app can show "12 саҳифа" without loading content.
 *
 * Items with no `targetLang` are shown to everyone; a `lang` filter keeps those
 * plus the ones for that language — a learner should never lose general
 * material by picking a language.
 *
 * ── Access ─────────────────────────────────────────────────────────────────
 * This endpoint used to answer 403 to every non-premium user, which made the
 * whole shelf invisible to exactly the people we want to sell to: they could
 * not see what they were missing, and the per-item `isPremium` flag was dead
 * code. Now the LIST is open to any signed-in learner and each item carries a
 * `locked` flag; the content endpoint (`[id]`) is what actually withholds the
 * pages. See lib/libraryAccess.ts for the rule.
 *
 * Still auth-gated: reading progress, bookmarks and entitlement all hang off an
 * account, and an anonymous shelf would have nowhere to record them.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const isPremium = await checkAndUpdatePremium(userId);

    const sp = req.nextUrl.searchParams;
    const type = sp.get('type');
    const lang = sp.get('lang');

    const items = await prisma.libraryItem.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
        ...(lang ? { OR: [{ targetLang: lang }, { targetLang: null }] } : {}),
      },
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, type: true, title: true, author: true, description: true,
        coverUrl: true, level: true, targetLang: true, mediaUrl: true,
        durationMin: true, rating: true, isPremium: true,
        order: true, createdAt: true,
        _count: { select: { pages: true } },
      },
    });

    const open = unlockedIds(items, isPremium);

    return NextResponse.json(
      {
        isPremium,
        items: items.map(({ _count, order, createdAt, ...it }) => ({
          ...it,
          pageCount: _count.pages,
          // The ONE field the app gates on. Derived server-side so the client
          // cannot decide for itself that a book is open.
          locked: !open.has(it.id),
        })),
      },
      { headers: CORS },
    );
  } catch (error) {
    console.error('[mobile/library]', error);
    // An empty shelf is a better failure than a broken screen.
    return NextResponse.json({ items: [] }, { headers: CORS });
  }
}
