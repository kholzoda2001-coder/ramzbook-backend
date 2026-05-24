import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/mobile/languages/:id — single language (for provider hydration) */
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const language = await prisma.language.findUnique({
      where: { id: params.id },
      select: {
        id: true, code: true, name: true, nativeName: true,
        flag: true, badge: true, learnerCount: true,
        canBeNative: true, canBeTarget: true,
      },
    });
    if (!language) return NextResponse.json({ error: 'Language not found' }, { status: 404 });
    return NextResponse.json({ language });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
