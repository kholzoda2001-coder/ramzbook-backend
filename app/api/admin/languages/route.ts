import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/languages — all languages with usage counts.
 */
export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { coursesAsTarget: true, coursesAsNative: true } },
      },
    });
    return NextResponse.json({ success: true, languages });
  } catch (error) {
    console.error('[languages GET] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch languages' }, { status: 500 });
  }
}

/**
 * POST /api/admin/languages — create one language.
 * Body: { name, nativeName, code, flag, canBeNative, canBeTarget, badge, learnerCount, order, isActive }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      name?: string;
      nativeName?: string;
      code?: string;
      flag?: string;
      canBeNative?: boolean;
      canBeTarget?: boolean;
      badge?: string | null;
      learnerCount?: string | null;
      order?: number;
      isActive?: boolean;
    };

    const name = (body.name ?? '').trim();
    const code = (body.code ?? '').trim().toLowerCase();
    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
    }

    const existing = await prisma.language.findUnique({ where: { code } });
    if (existing) {
      return NextResponse.json({ error: `Language code "${code}" already exists` }, { status: 409 });
    }

    const language = await prisma.language.create({
      data: {
        name,
        nativeName: (body.nativeName ?? name).trim(),
        code,
        flag: (body.flag ?? '🏳️').trim(),
        canBeNative: body.canBeNative ?? false,
        canBeTarget: body.canBeTarget ?? true,
        badge: body.badge?.trim() || null,
        learnerCount: body.learnerCount?.trim() || null,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    revalidatePath('/admin/languages');
    return NextResponse.json({ success: true, language });
  } catch (error: any) {
    console.error('[languages POST] Error:', error);
    return NextResponse.json({ error: error?.message ?? 'Server error' }, { status: 500 });
  }
}
