import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, getUserId } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const category = searchParams.get('category');
    // Using auth context if needed for user-specific catalog filtering
    const userId = getUserId(req); 

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
        languageCode: true,
        rating: true,
        isFree: true,
        pdfUrl: true,
        previewPdfUrl: true,
        createdAt: true,
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let purchasedProductIds = new Set<string>();
    let isVip = false;

    if (userId !== 'guest') {
      const [progressRecords, user] = await Promise.all([
        prisma.userProgress.findMany({
          where: {
            userId,
            OR: [{ isPurchased: true }, { isManualGrant: true }],
            AND: [{ OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] }],
          },
          select: { productId: true },
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { vipExpiresAt: true },
        }),
      ]);
      purchasedProductIds = new Set(progressRecords.map(p => p.productId));
      isVip = !!(user?.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now());
    }

    const modifiedProducts = products.map((product) => {
      const isPurchased = isVip || purchasedProductIds.has(product.id);
      return {
        ...product,
        isOwned: isPurchased || product.isFree,
        isLocked: !(isPurchased || product.isFree),
      };
    });

    
    return NextResponse.json(modifiedProducts, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[GET /api/books]', err);
    return apiError('Failed to fetch books');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
