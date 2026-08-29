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
        fontFamily: true, hasIPA: true, order: true,
      },
    });

    // `order` is shared with the TARGET picker, where 0 means "show first"
    // (English is the flagship course). For the NATIVE picker that is wrong:
    // it would put English above Tajik in onboarding. Treat order 0 as
    // "no position assigned" and sort those last, so the languages someone
    // actually numbered (tg = 1, ru = 2) lead the list.
    const ordered = languages
      .map(({ order, ...rest }) => ({ ...rest, _sort: order === 0 ? Number.MAX_SAFE_INTEGER : order }))
      .sort((a, b) => a._sort - b._sort)
      .map(({ _sort, ...rest }) => rest);

    return NextResponse.json({ languages: ordered });
  } catch (err: any) {
    console.error('[mobile/languages/native]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
