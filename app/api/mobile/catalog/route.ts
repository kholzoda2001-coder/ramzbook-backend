/**
 * GET /api/mobile/catalog
 *
 * Returns all active books for the HomeScreen "Latest" and "Popular" sections.
 * Does NOT include modules, pages, or per-user data — keep it lightweight.
 *
 * Optional query param:
 *   ?category=Бадеӣ   — filter by category
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(category ? { category } : {}),
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        description: true,
        category: true,
        rating: true,
        isFree: true,
        createdAt: true,
        // Count modules so Flutter can show "N lessons" without fetching detail
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json(products);
  } catch (err) {
    console.error('[catalog]', err);
    return apiError('Failed to fetch catalog');
  }
}

// Preflight support for mobile clients
export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
