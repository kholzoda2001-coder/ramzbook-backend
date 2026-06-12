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
      ttsLocale?: string | null;
      sttLocale?: string | null;
      direction?: string;
      fontFamily?: string | null;
      hasIPA?: boolean;
      exerciseConfig?: any;
    };

    const name = (body.name ?? '').trim();
    const code = (body.code ?? '').trim().toLowerCase();
    if (!name || !code) {
      return NextResponse.json({ error: 'name and code are required' }, { status: 400 });
    }

    const existing = await prisma.language.findUnique({ where: { code } });
    if (existing) {
      const updateData: Record<string, any> = {};
      if (body.canBeNative === true && !existing.canBeNative) updateData.canBeNative = true;
      if (body.canBeTarget === true && !existing.canBeTarget) updateData.canBeTarget = true;
      if (body.isActive === true && !existing.isActive) updateData.isActive = true;
      if (body.ttsLocale?.trim()) updateData.ttsLocale = body.ttsLocale.trim();
      if (body.sttLocale?.trim()) updateData.sttLocale = body.sttLocale.trim();
      if (body.direction === 'rtl') updateData.direction = 'rtl';
      if (body.fontFamily?.trim()) updateData.fontFamily = body.fontFamily.trim();
      if (body.exerciseConfig !== undefined) updateData.exerciseConfig = body.exerciseConfig;

      const language = Object.keys(updateData).length
        ? await prisma.language.update({ where: { id: existing.id }, data: updateData })
        : existing;

      revalidatePath('/admin/languages');
      revalidatePath('/admin/courses');
      revalidatePath(`/admin/courses/${language.id}`);
      return NextResponse.json({ success: true, language, updatedExisting: true });
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
        ttsLocale: body.ttsLocale?.trim() || null,
        sttLocale: body.sttLocale?.trim() || null,
        direction: body.direction === 'rtl' ? 'rtl' : 'ltr',
        fontFamily: body.fontFamily?.trim() || null,
        hasIPA: body.hasIPA ?? true,
        ...(body.exerciseConfig !== undefined && { exerciseConfig: body.exerciseConfig }),
      },
    });

    revalidatePath('/admin/languages');
    revalidatePath('/admin/courses');
    return NextResponse.json({ success: true, language });
  } catch (error: any) {
    console.error('[languages POST] Error:', error);
    return NextResponse.json({ error: error?.message ?? 'Server error' }, { status: 500 });
  }
}
