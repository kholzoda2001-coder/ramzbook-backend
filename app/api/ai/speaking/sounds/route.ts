import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { buildSoundReport, type SoundRow } from '@/lib/speaking/sounds';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/sounds?langId=<targetLanguageId>
 *
 * «Кадом САДО ба шумо кор мехоҳад» — ҷамъбасти талаффузи ҳафтаи ҷорӣ.
 *
 * ⚠️ Гейти премиум ин ҷо ЛОЗИМ НЕСТ ва қасдан гузошта нашуд: маълумот
 * танҳо аз дарсҳое ҷамъ мешавад, ки корбар аллакай гузаштааст. Корбари
 * ройгон як дарс дорад — ҳисоботи ӯ табиатан кӯтоҳ мешавад, вале
 * пинҳон кардани он маънӣ надорад: маҳз ҳамин чиз обунаро мефурӯшад.
 *
 * ⚠️ Ҳисоб дар `lib/speaking/sounds.ts` аст — функсияи СОФ, ки тест дорад.
 * Ин роут танҳо сатрҳоро мехонад ва онро даъват мекунад.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const langId = req.nextUrl.searchParams.get('langId')?.trim();
    if (!langId) {
      return NextResponse.json(
        { error: 'langId is required.' },
        { status: 400 },
      );
    }

    const rows = await prisma.speakingSound.findMany({
      where: { userId, languageId: langId },
      select: {
        phoneme: true,
        curAttempts: true,
        curSum: true,
        curStart: true,
        prevAttempts: true,
        prevSum: true,
        examples: true,
      },
    });

    const report = buildSoundReport(rows as SoundRow[]);

    return NextResponse.json({
      // Экран танҳо чанд сатри аввалро мегирад, вале ҳисоб як ҷо мемонад.
      sounds: report,
      weak: report.filter((r) => r.weak).length,
    });
  } catch (err) {
    console.error('[ai/speaking/sounds] GET failed:', err);
    return apiError('Failed to build the pronunciation report.');
  }
}
