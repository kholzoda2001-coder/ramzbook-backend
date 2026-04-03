/**
 * GET /api/public/books/[bookId]/modules
 *
 * Legacy endpoint consumed by the existing Flutter modulesProvider.
 * Returns modules for a book — shape matches Module.fromJson().
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const modules = await prisma.module.findMany({
      where: { productId: params.bookId },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { pages: true },
        },
      },
    });

    return Response.json(
      modules.map((m) => ({
        id: m.id,
        title: m.title,
        orderIndex: m.orderIndex,
        isFreePreview: m.isFreePreview,
        // Flutter Module.fromJson reads _count.words / _count.quizzes.
        // Approximate: half of pages are VOCAB, half are QUIZ.
        _count: {
          words: Math.floor(m._count.pages / 2),
          quizzes: Math.ceil(m._count.pages / 2),
        },
      }))
    );
  } catch (err) {
    console.error('[public/books/[bookId]/modules]', err);
    return apiError('Failed to fetch modules');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
