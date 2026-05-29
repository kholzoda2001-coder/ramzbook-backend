import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel, isDescriptorSkill } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/** PUT /api/admin/cefr-descriptors/:id */
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json() as {
      cefrLevel?: string;
      skill?: string;
      canDo?: string;
      order?: number;
    };

    const level = body.cefrLevel !== undefined ? normalizeCefrLevel(body.cefrLevel) : undefined;

    const updated = await prisma.cefrDescriptor.update({
      where: { id: params.id },
      data: {
        ...(level && { cefrLevel: level }),
        ...(body.skill !== undefined && isDescriptorSkill(body.skill) && { skill: body.skill }),
        ...(body.canDo !== undefined && { canDo: body.canDo.trim() }),
        ...(body.order !== undefined && { order: body.order }),
      },
    });
    return NextResponse.json({ success: true, descriptor: updated });
  } catch (err: any) {
    console.error('[admin/cefr-descriptors PUT]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/cefr-descriptors/:id */
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.cefrDescriptor.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/cefr-descriptors DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
