import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/courses?targetLanguageId=XXX&nativeLanguageId=YYY
 * Returns the full course → module → lesson tree for one language pair.
 * Words are NOT included here (fetched per-lesson) to keep the payload light.
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

    const courses = await prisma.course.findMany({
      where: {
        targetLanguageId,
        nativeLanguageId,
        isActive: true,
        // Забони модарӣ аз админ хомӯш шуда бошад, тамоми мазмуни ба он
        // тааллуқдошта пинҳон мешавад. Санҷиш ин ҷо — ҳангоми ХОНДАН — аст,
        // на бо навиштани `Course.isActive = false`: вагарна баргардонидан
        // курсҳоеро, ки админ ҶУДОГОНА хомӯш карда буд, зинда мекард.
        nativeLanguage: { isActive: true, canBeNative: true },
      },
      orderBy: { order: 'asc' },
      include: {
        modules: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: { _count: { select: { words: true } } },
            },
          },
        },
      },
    });

    const result = courses.map((c) => ({
      id: c.id,
      level: c.level,
      title: c.title,
      description: c.description,
      emoji: c.emoji,
      color: c.color,
      order: c.order,
      modules: c.modules.map((m) => ({
        id: m.id,
        title: m.title,
        titleTranslated: m.titleTranslated,
        emoji: m.emoji,
        color: m.color,
        order: m.order,
        isPremium: m.isPremium,
        isBoss: m.isBoss,
        // Per-section "can-do" line on the path. Empty string (not null) so the
        // client can treat "no copy yet" and "field missing" identically.
        canDoStatement: m.canDoStatement ?? '',
        // Версияи мазмуни бахш — барнома онро дар паҳлӯи бахши зеркашишуда
        // нигоҳ медорад ва ҳангоми кушодан муқоиса мекунад. Бе ин, сатри
        // ислоҳшуда дар телефон кӯҳна мемонад ва хонанда пас аз огоҳии
        // «ислоҳ шуд» ҳамон хаторо мебинад.
        contentVersion: m.contentVersion,
        lessonCount: m.lessons.length,
        lessons: m.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          titleTranslated: l.titleTranslated,
          type: l.type,
          cefrLevel: l.cefrLevel ?? c.level,
          skillType: l.skillType,
          emoji: l.emoji,
          xpReward: l.xpReward,
          duration: l.duration,
          order: l.order,
          isPremium: l.isPremium,
          wordCount: l._count.words,
        })),
      })),
    }));

    return NextResponse.json({ courses: result });
  } catch (err: any) {
    console.error('[mobile/courses]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
