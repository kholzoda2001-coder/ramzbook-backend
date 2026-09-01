import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/admin/speaking/:id — категория бо дарсҳо ва воҳидҳои ҳар дарс */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const category = await prisma.speakingCategory.findUnique({
      where: { id: params.id },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { items: { orderBy: { order: 'asc' } } },
        },
        targetLanguage: { select: { id: true, flag: true, name: true } },
        nativeLanguage: { select: { id: true, flag: true, nativeName: true } },
      },
    });
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    return NextResponse.json({ category });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}

/** PUT /api/admin/speaking/:id */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();
    const updated = await prisma.speakingCategory.update({
      where: { id: params.id },
      data: {
        ...(body.title !== undefined && { title: body.title.trim() }),
        ...(body.titleTranslated !== undefined && {
          titleTranslated: body.titleTranslated.trim(),
        }),
        ...(body.scenario !== undefined && {
          scenario: body.scenario?.trim() || null,
        }),
        ...(body.emoji !== undefined && { emoji: body.emoji.trim() || '🎙️' }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isPremium !== undefined && { isPremium: body.isPremium }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.requiresCategoryId !== undefined && {
          // Гейти қулф (M8). Сатри холӣ = «озод».
          requiresCategoryId: body.requiresCategoryId || null,
        }),
      },
    });
    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    console.error('[admin/speaking PUT]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/speaking/:id — воҳидҳояшро низ мебарад (cascade) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.speakingCategory.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/speaking DELETE]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
