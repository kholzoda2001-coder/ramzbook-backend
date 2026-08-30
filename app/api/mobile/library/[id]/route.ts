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
      return NextResponse.json(
        { error: 'Premium required', locked: true },
        { status: 403, headers: CORS },
      );
    }

    return NextResponse.json(item, { headers: CORS });
  } catch (error) {
    console.error('[mobile/library/[id]]', error);
    return NextResponse.json({ error: 'Failed to load item' }, { status: 500, headers: CORS });
  }
}
