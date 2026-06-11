import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/courses
 *   ?targetLanguageId= &nativeLanguageId= &level=   (all optional filters)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetLanguageId = searchParams.get('targetLanguageId') || undefined;
    const nativeLanguageId = searchParams.get('nativeLanguageId') || undefined;
    const level = searchParams.get('level') || undefined;

    const courses = await prisma.course.findMany({
      where: { targetLanguageId, nativeLanguageId, level },
      orderBy: [{ order: 'asc' }, { level: 'asc' }],
      include: {
        targetLanguage: { select: { id: true, name: true, code: true, flag: true } },
        nativeLanguage: { select: { id: true, name: true, nativeName: true, code: true, flag: true } },
        _count: { select: { modules: true } },
      },
    });
    return NextResponse.json({ courses });
  } catch (err: any) {
    console.error('[admin/courses GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/courses
 * Body: { targetLanguageId?, targetName?, targetCode?, targetFlag?, nativeLanguageId, level, title, description, emoji, color, order, isActive }
 * Validates: both languages exist & have correct capability; no duplicate (target,native,level).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      targetName?: string;
      targetCode?: string;
      targetFlag?: string;
      targetLanguageId?: string;
      nativeLanguageId?: string;
      level?: string;
      title?: string;
      description?: string;
      emoji?: string;
      color?: string;
      order?: number;
      isActive?: boolean;
    };

    const { targetName, targetCode, targetFlag, targetLanguageId, nativeLanguageId, level } = body;
    if ((!targetLanguageId && (!targetName || !targetCode || !targetFlag)) || !nativeLanguageId || !level || !body.title) {
      return NextResponse.json(
        { error: 'targetLanguageId or targetName/targetCode/targetFlag, plus nativeLanguageId, level and title are required' },
        { status: 400 }
      );
    }

    let target = targetLanguageId
      ? await prisma.language.findUnique({ where: { id: targetLanguageId } })
      : await prisma.language.findUnique({ where: { code: targetCode!.toLowerCase() } });

    if (!target && !targetLanguageId) {
      target = await prisma.language.create({
        data: {
          code: targetCode!.toLowerCase(),
          name: targetName!.trim(),
          nativeName: targetName!.trim(),
          flag: targetFlag!.trim(),
          canBeNative: false,
          canBeTarget: true,
          isActive: true
        }
      });
    }

    if (!target) {
      return NextResponse.json({ error: 'Target language not found' }, { status: 404 });
    }

    if (!target.canBeTarget) {
      target = await prisma.language.update({
        where: { id: target.id },
        data: { canBeTarget: true }
      });
    }

    const native = await prisma.language.findUnique({ where: { id: nativeLanguageId } });
    if (!native || !native.canBeNative) {
      return NextResponse.json({ error: 'Invalid native language (must have canBeNative=true)' }, { status: 400 });
    }

    const dup = await prisma.course.findUnique({
      where: { targetLanguageId_nativeLanguageId_level: { targetLanguageId: target.id, nativeLanguageId, level } },
    });
    if (dup) {
      return NextResponse.json(
        { error: `A ${target.name} → ${native.name} course already exists at level ${level}` },
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        targetLanguageId: target.id,
        nativeLanguageId,
        level,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        emoji: body.emoji?.trim() || '📚',
        color: body.color?.trim() || '#4F46E5',
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    revalidatePath('/admin/courses');
    revalidatePath(`/admin/courses/${target.id}`);
    return NextResponse.json({ success: true, course });
  } catch (err: any) {
    console.error('[admin/courses POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
