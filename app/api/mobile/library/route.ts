/**
 * GET /api/mobile/library
 *
 * Returns the books purchased / owned by the current user, enriched with
 * their reading progress.  Powers the "My Books" and "Continue Reading"
 * sections on the HomeScreen.
 *
 * User identity: extracted from the `x-user-id` header (or `?userId=` param).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const progressRecords = await prisma.userProgress.findMany({
      where: { userId, isPurchased: true },
      include: {
        product: {
          select: {
            id: true,
            title: true,
            author: true,
            coverUrl: true,
            description: true,
            category: true,
            rating: true,
            isFree: true,
            _count: { select: { modules: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Shape the response to match what the Flutter Book model expects.
    const library = progressRecords.map((p) => ({
      ...p.product,
      isOwned: true,
      isLocked: false,
      progress: calculateProgress(p.lastReadPageIndex, p.product._count.modules),
      lastReadPageIndex: p.lastReadPageIndex,
    }));

    return Response.json(library);
  } catch (err) {
    console.error('[library]', err);
    return apiError('Failed to fetch library');
  }
}

/**
 * Rough progress ratio: 4 fixed pages (TOC/Preface/Alphabet/Guide) +
 * 2 pages per module (VOCAB + QUIZ).
 */
function calculateProgress(lastPageIndex: number, moduleCount: number): number {
  const totalPages = 4 + moduleCount * 2;
  if (totalPages === 0) return 0;
  return Math.min(lastPageIndex / totalPages, 1.0);
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
