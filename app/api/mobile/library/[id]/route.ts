import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { checkAndUpdatePremium } from '@/lib/premium';

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
 * Premium-only, same as the list endpoint (see /api/mobile/library) — this is
 * the one that actually leaks book/page CONTENT, so it needs the check even
 * more than the list does.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const isPremium = await checkAndUpdatePremium(userId);
    if (!isPremium) {
      return NextResponse.json({ error: 'Premium required' }, { status: 403, headers: CORS });
    }

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

    return NextResponse.json(item, { headers: CORS });
  } catch (error) {
    console.error('[mobile/library/[id]]', error);
    return NextResponse.json({ error: 'Failed to load item' }, { status: 500, headers: CORS });
  }
}
