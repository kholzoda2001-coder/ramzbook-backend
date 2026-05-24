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
 * Body: { targetLanguageId, nativeLanguageId, level, title, description, emoji, color, order, isActive }
 * Validates: both languages exist & have correct capability; no duplicate (target,native,level).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
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

    const { targetLanguageId, nativeLanguageId, level } = body;
    if (!targetLanguageId || !nativeLanguageId || !level || !body.title) {
      return NextResponse.json(
        { error: 'targetLanguageId, nativeLanguageId, level and title are required' },
        { status: 400 }
      );
    }

    const [target, native] = await Promise.all([
      prisma.language.findUnique({ where: { id: targetLanguageId } }),
      prisma.language.findUnique({ where: { id: nativeLanguageId } }),
    ]);
    if (!target || !target.canBeTarget) {
      return NextResponse.json({ error: 'Invalid target language (must have canBeTarget=true)' }, { status: 400 });
    }
    if (!native || !native.canBeNative) {
      return NextResponse.json({ error: 'Invalid native language (must have canBeNative=true)' }, { status: 400 });
    }

    const dup = await prisma.course.findUnique({
      where: { targetLanguageId_nativeLanguageId_level: { targetLanguageId, nativeLanguageId, level } },
    });
    if (dup) {
      return NextResponse.json(
        { error: `A ${target.name} → ${native.name} course already exists at level ${level}` },
        { status: 409 }
      );
    }

    const course = await prisma.course.create({
      data: {
        targetLanguageId,
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
    return NextResponse.json({ success: true, course });
  } catch (err: any) {
    console.error('[admin/courses POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
