/**
 * GET /api/public/books
 *
 * Legacy endpoint consumed by the existing Flutter api_providers.dart.
 * Returns all active books — same shape as Book.fromJson() expects.
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

export async function GET(_req: NextRequest) {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        title: true,
        author: true,
        coverUrl: true,
        description: true,
        category: true,
        rating: true,
        preface: true,
        alphabet: true,
        guide: true,
        isFree: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to the shape Book.fromJson() expects
    return Response.json(
      products.map((p) => ({
        id: p.id,
        title: p.title,
        author: p.author,
        coverUrl: p.coverUrl ?? '',
        rating: p.rating,
        category: p.category ?? '',
        description: p.description ?? '',
        preface: p.preface ?? '',
        alphabet: p.alphabet ?? [],
        guide: p.guide ?? '',
        isOwned: p.isFree,
        isLocked: !p.isFree,
        progress: 0.0,
        lastReadPageIndex: 0,
      }))
    );
  } catch (err) {
    console.error('[public/books]', err);
    return apiError('Failed to fetch books');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
