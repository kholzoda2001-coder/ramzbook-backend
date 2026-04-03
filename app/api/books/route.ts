import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, getUserId } from '@/lib/auth';

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
        rating: true,
        isFree: true,
        priceSixMonths: true,
        priceLifetime: true,
        createdAt: true,
        _count: {
          select: { modules: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(products, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[GET /api/books]', err);
    return apiError('Failed to fetch books');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
