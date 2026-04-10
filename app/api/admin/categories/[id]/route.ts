import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { name, slug, icon, color, isActive } = body;
    const category = await prisma.category.update({
      where: { id },
      data: { name, slug, icon, color, isActive }
    });
    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === 'P2002') return NextResponse.json({ error: 'Name or slug already exists' }, { status: 400 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
