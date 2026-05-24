import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: {
        isActive: true,
        canBeTarget: true,
      },
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { coursesAsTarget: true }
        }
      }
    });

    // Map Language to a Category shape for the legacy catalog screens.
    const activeCategories = languages
      .filter(lang => lang._count.coursesAsTarget > 0)
      .map(lang => ({
        id: lang.id,
        name: lang.name,
        slug: lang.code,
        icon: lang.flag,
        isActive: lang.isActive,
        _count: {
          products: lang._count.coursesAsTarget
        }
      }));

    return NextResponse.json(activeCategories);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server Error' }, { status: 500 });
  }
}
