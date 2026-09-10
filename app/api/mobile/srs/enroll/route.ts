import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { SRS_NEW_PER_DAY, dueDayStart, initialSrsState, spreadNewCards } from '@/lib/srs';
import { DEFAULT_TZ_OFFSET_MIN, localDayIndex } from '@/lib/localDay';

export const dynamic = 'force-dynamic';

/** Барои як дарс беш аз ин қабул намекунем — муҳофизат аз дархости вайрон. */
const MAX_ITEMS_PER_CALL = 200;

/**
 * POST /api/mobile/srs/enroll
 * Body: { itemIds: string[], itemType?: 'word', courseId? }
 *
 * Калимаҳои нави дарсро ба навбати такрор ворид мекунад.
 *
 * ── Чаро ин роут ҷудо аз `/srs/review` аст ────────────────────────────────
 * Пеш барнома барои ҳар калима ба `/srs/review` `grade:'good'` мефиристод.
 * Ду оқибати вазнин дошт:
 *
 *  1. **Такрори дурӯғин.** SM-2 инро ҳамчун ҷавоби ДУРУСТ мешумурд, дар
 *     ҳоле ки хонанда ҳеҷ чизро ба ёд наоварда буд — вай танҳо дарсро тамом
 *     карда буд. Корт фавран ба `repetitions = 1` мегузашт, яъне саволи
 *     аввалини воқеӣ шакли НАВИШТАН мегирифт (ниг. нардбони шакли савол),
 *     дар ҳоле ки калима навтарин буд. Акнун корт бо `initialSrsState()`
 *     сохта мешавад — `repetitions = 0`, ва саволи аввал шинохт мешавад.
 *
 *  2. **Ҳамаи калимаҳо як рӯз мӯҳлат мегирифтанд.** Дар продакшн ин
 *     миёна 30 ва як бор **571 корти нав дар ЯК рӯз** дод; се хонандаи
 *     фаъоли мо 100% колодаашонро мӯҳлатрасида доранд (851, 740, 484).
 *     Акнун `spreadNewCards` онҳоро аз рӯи `SRS_NEW_PER_DAY` тақсим мекунад.
 *
 * Илова бар ин, як дархост ба ҷои N-то: дарси 10-калимагӣ пештар 10 дархости
 * HTTP мефиристод.
 *
 * Кортҳои МАВҶУДА даст намехӯранд — такрор кардани як дарс ҷадвали
 * омӯхташударо ақиб намепартояд.
 */
export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json()) as {
      itemIds?: unknown; itemType?: string; courseId?: string;
    };

    const itemType = (body.itemType ?? 'word').trim() || 'word';
    const courseId = body.courseId?.trim() || null;
    const itemIds = Array.isArray(body.itemIds)
      ? Array.from(new Set(body.itemIds.filter((v): v is string => typeof v === 'string' && v.trim() !== '').map((v) => v.trim())))
      : [];

    if (!itemIds.length) return NextResponse.json({ ok: true, added: 0, skipped: 0 });
    if (itemIds.length > MAX_ITEMS_PER_CALL) {
      return NextResponse.json({ error: `itemIds: беш аз ${MAX_ITEMS_PER_CALL} дона` }, { status: 400 });
    }

    // Кадомаш аллакай корт дорад — онҳоро тамоман даст намезанем.
    const existing = await prisma.srsCard.findMany({
      where: { userId, itemType, itemId: { in: itemIds } },
      select: { itemId: true },
    });
    const known = new Set(existing.map((c) => c.itemId));
    const fresh = itemIds.filter((id) => !known.has(id));
    if (!fresh.length) {
      return NextResponse.json({ ok: true, added: 0, skipped: itemIds.length });
    }

    const now = new Date();
    const tz = DEFAULT_TZ_OFFSET_MIN;
    const today = localDayIndex(now, tz);

    // Чанд корт аллакай ба ҳар рӯзи ОЯНДА таъин шудааст. Танҳо ояндаро
    // мешуморем: рӯзҳои гузашта аллакай як тӯда ҳастанд ва илова кардани
    // корти нав ба онҳо чизеро бадтар намекунад — вале рӯзҳои пешро бояд
    // холӣ нигоҳ дорем.
    const upcoming = await prisma.srsCard.findMany({
      where: { userId, dueAt: { gte: now } },
      select: { dueAt: true },
    });
    const perDay = new Map<number, number>();
    for (const c of upcoming) {
      const offset = localDayIndex(c.dueAt, tz) - today;
      if (offset >= 0) perDay.set(offset, (perDay.get(offset) ?? 0) + 1);
    }

    const offsets = spreadNewCards(fresh.length, perDay, SRS_NEW_PER_DAY);
    const base = initialSrsState();

    await prisma.srsCard.createMany({
      data: fresh.map((itemId, i) => ({
        userId,
        itemType,
        itemId,
        courseId,
        easeFactor: base.easeFactor,
        intervalDays: base.intervalDays,
        repetitions: base.repetitions,
        lapses: base.lapses,
        dueAt: dueDayStart(offsets[i], now, tz),
        // `lastReviewedAt` ҚАСДАН холӣ мемонад — ҳанӯз ягон такрор нашудааст.
        lastReviewedAt: null,
      })),
      skipDuplicates: true,
    });

    return NextResponse.json({
      ok: true,
      added: fresh.length,
      skipped: itemIds.length - fresh.length,
      // Барои дидан: калимаҳои нав ба чанд рӯз тақсим шуданд.
      spreadOverDays: offsets.length ? offsets[offsets.length - 1] : 0,
    });
  } catch (err) {
    console.error('[mobile/srs/enroll]', err);
    return apiError('Failed to enroll words');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
