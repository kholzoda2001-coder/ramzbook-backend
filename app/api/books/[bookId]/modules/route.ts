import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    if (!params.bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400, headers: corsHeaders });
    }

    const modules = await prisma.module.findMany({
      where: { productId: params.bookId },
      orderBy: { orderIndex: 'asc' },
      include: {
        _count: {
          select: { pages: true },
        },
      },
    });

    return NextResponse.json(
      modules.map((m) => ({
        id: m.id,
        title: m.title,
        orderIndex: m.orderIndex,
        isFreePreview: m.isFreePreview,
        _count: {
          words: Math.floor(m._count.pages / 2),
          quizzes: Math.ceil(m._count.pages / 2),
        },
      })),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('[GET /api/books/[bookId]/modules]', err);
    return apiError('Failed to fetch modules');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
