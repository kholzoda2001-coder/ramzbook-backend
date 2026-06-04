import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/languages/target?nativeLanguageId=XXX
 * Learnable languages that actually have at least one course for the given
 * native language. Languages with no course for this native are omitted, so a
 * native language with no content yet returns an empty list.
 */
export async function GET(req: NextRequest) {
  try {
    const nativeLanguageId = req.nextUrl.searchParams.get('nativeLanguageId');
    if (!nativeLanguageId) {
      return NextResponse.json({ error: 'nativeLanguageId is required' }, { status: 400 });
    }

    const targets = await prisma.language.findMany({
      where: { 
        isActive: true, 
        canBeTarget: true,
        id: { not: nativeLanguageId } // Exclude the native language itself
      },
      orderBy: { order: 'asc' },
      select: {
        id: true, code: true, name: true, nativeName: true,
        flag: true, badge: true, learnerCount: true,
        ttsLocale: true, sttLocale: true, direction: true,
        fontFamily: true, hasIPA: true,
      },
    });

    // Count active courses per target for this native language.
    const counts = await prisma.course.groupBy({
      by: ['targetLanguageId'],
      where: { nativeLanguageId, isActive: true },
      _count: { _all: true },
    });
    const countMap = new Map(counts.map(c => [c.targetLanguageId, c._count._all]));

    const languages = targets
      .map(t => {
        const courseCount = countMap.get(t.id) ?? 0;
        return { ...t, courseCount, available: courseCount > 0 };
      })
      // Only show target languages that actually have a course for this native
      // language. A native with no courses yet shows an empty list (the app then
      // displays its "no course yet" message) instead of unbuilt teaser options.
      .filter(l => l.courseCount > 0);

    return NextResponse.json({ languages });
  } catch (err: any) {
    console.error('[mobile/languages/target]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
