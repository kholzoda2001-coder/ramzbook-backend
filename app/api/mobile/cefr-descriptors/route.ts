import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/cefr-descriptors?targetLanguageId=X&nativeLanguageId=Y
 * The "can-do" goals a learner sees per CEFR level for their language pair.
 * Grouped by level so the app can render a level-progress / goals screen.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetLanguageId = searchParams.get('targetLanguageId');
    const nativeLanguageId = searchParams.get('nativeLanguageId');

    if (!targetLanguageId || !nativeLanguageId) {
      return NextResponse.json(
        { error: 'targetLanguageId and nativeLanguageId are required' },
        { status: 400 }
      );
    }

    const rows = await prisma.cefrDescriptor.findMany({
      where: { targetLanguageId, nativeLanguageId },
      orderBy: [{ cefrLevel: 'asc' }, { order: 'asc' }],
      select: { id: true, cefrLevel: true, skill: true, canDo: true, order: true },
    });

    // Group by CEFR level for easy rendering.
    const byLevel: Record<string, typeof rows> = {};
    for (const r of rows) (byLevel[r.cefrLevel] ??= []).push(r);

    const levels = Object.entries(byLevel).map(([cefrLevel, descriptors]) => ({
      cefrLevel,
      descriptors,
    }));

    return NextResponse.json({ levels });
  } catch (err: any) {
    console.error('[mobile/cefr-descriptors]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
