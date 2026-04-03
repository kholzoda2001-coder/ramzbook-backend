import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, getUserId } from '@/lib/auth';

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
    const bookId = params.bookId;
    const userId = getUserId(req);

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400, headers: corsHeaders });
    }

    const product = await prisma.product.findUnique({
      where: { id: bookId, isActive: true },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            _count: { select: { pages: true } },
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404, headers: corsHeaders });
    }

    let progress = null;
    if (userId !== 'guest') {
      progress = await prisma.userProgress.findUnique({
        where: { userId_productId: { userId, productId: bookId } },
      });
    }

    const parseJsonArray = (raw: string | null | undefined) => {
      if (!raw) return [];
      try { return JSON.parse(raw) as unknown[]; }
      catch { return []; }
    };
    
    const parseJsonObject = (raw: string | null | undefined) => {
      if (!raw) return null;
      try { return JSON.parse(raw); }
      catch { return null; }
    }

    const totalPages = 4 + product.modules.length * 2;
    const lastReadPageIndex = progress?.lastReadPageIndex ?? 0;
    const progressRatio = totalPages > 0 ? Math.min(lastReadPageIndex / totalPages, 1.0) : 0;

    const response = {
      id: product.id,
      title: product.title,
      author: product.author,
      coverUrl: product.coverUrl ?? '',
      rating: product.rating,
      category: product.category ?? '',
      description: product.description ?? '',
      preface: product.preface ?? '',
      alphabet: parseJsonArray(product.alphabet as string | null),
      guide: product.guide ?? '',
      readingSteps: parseJsonArray(product.readingSteps as string | null),
      proTip: parseJsonObject(product.proTip as string | null),
      isOwned: progress?.isPurchased ?? product.isFree,
      isLocked: !(progress?.isPurchased ?? product.isFree),
      isFree: product.isFree,
      priceSixMonths: product.priceSixMonths,
      priceLifetime: product.priceLifetime,
      progress: progressRatio,
      lastReadPageIndex,
      modules: product.modules.map((m) => ({
        id: m.id,
        title: m.title,
        orderIndex: m.orderIndex,
        isFreePreview: m.isFreePreview,
        _count: {
          words: Math.floor(m._count.pages / 2),
          quizzes: Math.ceil(m._count.pages / 2),
        },
      })),
    };

    return NextResponse.json(response, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[GET /api/books/[bookId]]', err);
    return apiError('Failed to fetch book details');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
