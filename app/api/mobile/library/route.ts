import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
 */
export async function GET(req: NextRequest) {
  try {
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
        _count: { select: { pages: true } },
      },
    });

    return NextResponse.json(
      {
        items: items.map(({ _count, ...it }) => ({ ...it, pageCount: _count.pages })),
      },
      { headers: CORS },
    );
  } catch (error) {
    console.error('[mobile/library]', error);
    // An empty shelf is a better failure than a broken screen.
    return NextResponse.json({ items: [] }, { headers: CORS });
  }
}
