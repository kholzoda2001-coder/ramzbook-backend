import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { checkAndUpdatePremium } from '@/lib/premium';
import {
  FREE_PREVIEW_PAGES,
  canPreviewPages,
  unlockedIds,
} from '@/lib/libraryAccess';

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
 * GET /api/mobile/library/[id]
 * One item with its full page content — what the reader screen opens.
 *
 * This is the endpoint that actually serves book/page CONTENT, so it is where
 * the entitlement check has to be exact. The list endpoint is deliberately open
 * (a free learner should see the shelf and the locks); this one is not.
 *
 * The check runs against the SAME rule the list uses to set `locked`
 * (lib/libraryAccess.ts), so a free learner can open precisely the items whose
 * cards were not showing a lock — no item that looked open turns out to be shut,
 * and nothing that looked shut can be prised open by calling the API directly.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const isPremium = await checkAndUpdatePremium(userId);

    const item = await prisma.libraryItem.findFirst({
      where: { id: params.id, isActive: true },
      include: {
        pages: {
          orderBy: { order: 'asc' },
          select: { id: true, order: true, title: true, content: true, imageUrl: true },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: CORS });
    }

    // The free quota is defined across the whole shelf ("the first three
    // books"), so answering "is THIS item free" needs the shelf, not just the
    // row we fetched. Ids + the ordering fields only — no page content.
    const shelf = await prisma.libraryItem.findMany({
      where: { isActive: true },
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      select: { id: true, type: true, isPremium: true, order: true, createdAt: true },
    });

    if (!unlockedIds(shelf, isPremium).has(item.id)) {
      // ── Пешнамоиш: чанд саҳифаи аввал ба ҷои девори холӣ ────────────────
      //
      // 🔴 БОГЕ, ки ин ҷо баста мешавад: барнома кайҳо коди пурраи
      // пешнамоиш дошт (`kFreePreviewPages = 5`, саҳифаи пейвол, нишони
      // «пешнамоиш», ҳатто матни «боз N саҳифа мондааст»), вале ин роут
      // ҳама-ё-ҳеҷ буд. Хонанда `403` мегирифт, `fetchOne` онро мебалъид ва
      // бармегардонд `null` — ва корбар ба ҷои 5 саҳифа экрани «мазмун
      // нест»-ро медид. Ҳамаи он код ҳеҷ гоҳ иҷро намешуд.
      //
      // ⚠️ Танҳо китоби САҲИФАДОР. Аудио, видео, шаблон ва EPUB ҳамон
      // тавре ки буданд, `403` мегиранд — ниг. `canPreviewPages`.
      if (canPreviewPages(item)) {
        return NextResponse.json(
          {
            ...item,
            pages: item.pages.slice(0, FREE_PREVIEW_PAGES),
            // Барнома аз рӯи ин ду майдон қарор мегирад, на аз рӯи тахмин:
            // `pages.length` акнун 5 аст, пас «чанд саҳифа мондааст»-ро аз
            // он ҳисоб кардан ХАТО медод (5 − 5 = 0).
            preview: true,
            totalPages: item.pages.length,
          },
          { headers: CORS },
        );
      }

      return NextResponse.json(
        { error: 'Premium required', locked: true },
        { status: 403, headers: CORS },
      );
    }

    return NextResponse.json(
      { ...item, preview: false, totalPages: item.pages.length },
      { headers: CORS },
    );
  } catch (error) {
    console.error('[mobile/library/[id]]', error);
    return NextResponse.json({ error: 'Failed to load item' }, { status: 500, headers: CORS });
  }
}
