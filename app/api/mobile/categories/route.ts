import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: {
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { courses: true }
        }
      }
    });

    // Map Language to look like a Category for backward compatibility with mobile app
    // until the Flutter app is updated
    const activeCategories = languages
      .filter(lang => lang._count.courses > 0)
      .map(lang => ({
        id: lang.id,
        name: lang.name,
        slug: lang.code,
        icon: lang.flag,
        isActive: lang.isActive,
        _count: {
          products: lang._count.courses
        }
      }));

    return NextResponse.json(activeCategories);
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Server Error' }, { status: 500 });
  }
}
