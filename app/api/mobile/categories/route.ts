import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: {
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    // Filter out logically empty categories if required
    // (This ensures Mobile App doesn't show "dead filters")
    const activeCategories = categories.filter(cat => cat._count.products > 0);

    return NextResponse.json(activeCategories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
