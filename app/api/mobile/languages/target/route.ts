import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { MIN_READY_LESSONS, isCourseReady } from '@/lib/courseReadiness';

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

    // Забони модарӣ аз панели админ хомӯш карда шудааст? Пас ҳамаи забонҳои
    // ОМӮЗИШИИ тобеи он низ бояд нопадид шаванд.
    //
    // Танҳо аз рӯйхати `/languages/native` бароварданаш кифоя НЕСТ: хонандае,
    // ки ин забонро аллакай интихоб кардааст, id-и онро дар телефонаш нигоҳ
    // медорад ва рост ба ҳамин endpoint муроҷиат мекунад — бе ин санҷиш ӯ
    // курсҳоро мисли пештара мегирифт.
    const native = await prisma.language.findUnique({
      where: { id: nativeLanguageId },
      select: { isActive: true, canBeNative: true },
    });
    if (!native || !native.isActive || !native.canBeNative) {
      return NextResponse.json({ languages: [] });
    }

    const targets = await prisma.language.findMany({
      where: {
        isActive: true,
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

    // 🔴 «Курс ҳаст» ≠ «курс ТАЙЁР аст».
    //
    // То ин ҷо як курси нимкора ҳам ҳамчун LIVE нишон дода мешуд. Хитоӣ
    // (`zh`) маҳз ҳамин ҳолат буд: 9 модул, вале ҳамагӣ 25 дарс — модули
    // якум 9 дарс ва боқӣ 2-тогӣ. Хонанда онро интихоб мекард, чанд дарс
    // мехонд ва ба девор мерасид. Курсҳои воқеан тайёр 197–252 дарс доранд.
    //
    // Қоида дар `lib/courseReadiness.ts` (ҳадди MIN_READY_LESSONS дарс) — он ҷо тестшаванда.
    // Акнун шумораи ДАРСИ фаъол ҳисоб мешавад: камтар аз ҳад → забон ҳамчун
    // «Ба зудӣ» (SOON) намоиш дода мешавад ва интихоб намешавад. Ин ба
    // курси нави нимсохта ҳам худкор татбиқ мегардад.
    const lessonRows = await prisma.$queryRaw<{ id: string; n: number }[]>`
      SELECT c."targetLanguageId" AS id, COUNT(le.id)::int AS n
      FROM "Course" c
      JOIN "Module" m  ON m."courseId" = c.id AND m."isActive" = true
      JOIN "Lesson" le ON le."moduleId" = m.id AND le."isActive" = true
      WHERE c."nativeLanguageId" = ${nativeLanguageId} AND c."isActive" = true
      GROUP BY 1`;
    const lessonMap = new Map(lessonRows.map((r) => [r.id, r.n]));

    const languages = targets
      .map(t => {
        const courseCount = countMap.get(t.id) ?? 0;
        const lessonCount = lessonMap.get(t.id) ?? 0;
        return {
          ...t,
          courseCount,
          lessonCount,
          available: isCourseReady(courseCount, lessonCount),
        };
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
