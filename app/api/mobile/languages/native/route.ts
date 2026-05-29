import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/languages/native
 * Languages a user can pick as their UI / interface language.
 */
export async function GET() {
  try {
    const languages = await prisma.language.findMany({
      where: { isActive: true, canBeNative: true },
      orderBy: { order: 'asc' },
      select: {
        id: true, code: true, name: true, nativeName: true,
        flag: true, badge: true, learnerCount: true,
        ttsLocale: true, sttLocale: true, direction: true,
        fontFamily: true, hasIPA: true,
      },
    });
    return NextResponse.json({ languages });
  } catch (err: any) {
    console.error('[mobile/languages/native]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
