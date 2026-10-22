import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { pickLandingLang, renderItemLandingHtml, renderNotFoundHtml } from '@/lib/library/landing';

export const dynamic = 'force-dynamic';

/**
 * GET /l/<id> — саҳифаи пайванди воҳиди Китобхона (ниг. `lib/library/landing.ts`).
 *
 * ПУБЛИК аст: ягон токен, ягон савол. Танҳо маълумоти витрина (ном, муаллиф,
 * ковер, нарх) — на `mediaUrl`, на саҳифаҳо. Воҳиди ғайрифаъол «ёфт нашуд».
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const lang = pickLandingLang(
    req.headers.get('accept-language'),
    req.nextUrl.searchParams.get('l'),
  );
  const headers = {
    'Content-Type': 'text/html; charset=utf-8',
    // Каме кэш (WhatsApp/Telegram бисёр дархост мекунанд), вале нарх зуд нав шавад.
    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  };

  try {
    const item = await prisma.libraryItem.findFirst({
      where: { id: params.id, isActive: true },
      select: {
        id: true, type: true, title: true, author: true, description: true,
        coverUrl: true, priceTjs: true, durationMin: true,
      },
    });
    if (!item) {
      return new Response(renderNotFoundHtml(lang), { status: 404, headers });
    }
    return new Response(renderItemLandingHtml(item, lang), { status: 200, headers });
  } catch (e) {
    console.error('[l/[id]]', e);
    return new Response(renderNotFoundHtml(lang), { status: 500, headers });
  }
}
