/**
 * POST /api/mobile/progress
 *
 * Called by the Flutter BookReaderScreen every time the user swipes to a
 * new page in the PageView.  Uses an upsert so the first swipe creates
 * the record and subsequent swipes update it.
 *
 * Request body (JSON):
 *   {
 *     "productId":         "ramz-english-1",
 *     "lastReadPageIndex": 5
 *   }
 *
 * User identity: extracted from the `x-user-id` header (or `?userId=` param).
 *
 * Response (200):
 *   {
 *     "ok": true,
 *     "lastReadPageIndex": 5
 *   }
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = await req.json() as {
      productId?: string;
      lastReadPageIndex?: number;
    };

    const { productId, lastReadPageIndex } = body;

    if (!productId || typeof lastReadPageIndex !== 'number') {
      return Response.json(
        { error: 'productId (string) and lastReadPageIndex (number) are required.' },
        { status: 400 }
      );
    }

    if (lastReadPageIndex < 0) {
      return Response.json(
        { error: 'lastReadPageIndex must be >= 0.' },
        { status: 400 }
      );
    }

    // Verify the product exists before writing progress
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return Response.json({ error: 'Product not found.' }, { status: 404 });
    }

    // Upsert: create on first call, update on subsequent calls.
    // Only advance the page index — never go backwards — to avoid a race
    // condition where a stale request overwrites a newer position.
    const existing = await prisma.userProgress.findUnique({
      where: { userId_productId: { userId, productId } },
      select: { lastReadPageIndex: true },
    });

    const updatedProgress = await prisma.userProgress.upsert({
      where: { userId_productId: { userId, productId } },
      create: {
        userId,
        productId,
        lastReadPageIndex,
        isPurchased: false, // Purchase status is managed separately
      },
      update: {
        // Only advance — never regress
        lastReadPageIndex:
          (existing?.lastReadPageIndex ?? 0) < lastReadPageIndex
            ? lastReadPageIndex
            : existing?.lastReadPageIndex ?? 0,
      },
      select: { lastReadPageIndex: true },
    });

    return Response.json({
      ok: true,
      lastReadPageIndex: updatedProgress.lastReadPageIndex,
    });
  } catch (err) {
    console.error('[progress]', err);
    return apiError('Failed to update progress');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
