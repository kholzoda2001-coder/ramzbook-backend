import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

/** GET /api/admin/languages/:id */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const language = await prisma.language.findUnique({
      where: { id: params.id },
      include: { _count: { select: { coursesAsTarget: true, coursesAsNative: true } } },
    });
    if (!language) return NextResponse.json({ error: 'Language not found' }, { status: 404 });
    return NextResponse.json({ language });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** PUT /api/admin/languages/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const updated = await prisma.language.update({
      where: { id: params.id },
      data: {
        ...(body.name !== undefined && { name: body.name.trim() }),
        ...(body.nativeName !== undefined && { nativeName: body.nativeName.trim() }),
        ...(body.code !== undefined && { code: body.code.trim().toLowerCase() }),
        ...(body.flag !== undefined && { flag: body.flag.trim() }),
        ...(body.canBeNative !== undefined && { canBeNative: body.canBeNative }),
        ...(body.canBeTarget !== undefined && { canBeTarget: body.canBeTarget }),
        ...(body.badge !== undefined && { badge: body.badge?.trim() || null }),
        ...(body.learnerCount !== undefined && { learnerCount: body.learnerCount?.trim() || null }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });
    revalidatePath('/admin/languages');
    return NextResponse.json({ success: true, language: updated });
  } catch (err: any) {
    console.error('[admin/languages PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/languages/:id — blocked if courses reference it */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const inUse = await prisma.course.count({
      where: { OR: [{ targetLanguageId: params.id }, { nativeLanguageId: params.id }] },
    });
    if (inUse > 0) {
      return NextResponse.json(
        { error: `Cannot delete: ${inUse} course(s) still use this language.` },
        { status: 409 }
      );
    }
    await prisma.language.delete({ where: { id: params.id } });
    revalidatePath('/admin/languages');
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/languages DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
