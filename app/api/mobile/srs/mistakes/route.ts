/**
 * POST /api/mobile/srs/mistakes   { itemIds: string[], courseId?, itemType? }
 *
 * «Ин калимаҳоро дар ДАРС хато кард» → онҳо ба қуттии хатоҳо меафтанд ва
 * ҲАМИН РӮЗ дар бахши «Такрор»-и экрани асосӣ пайдо мешаванд.
 *
 * ⚠️ То ин ҷо хатоҳои дарс ТАНҲО дар телефон мемонданд (`_mistakeWords` дар
 * `unit_lesson_screen.dart` — барои экрани анҷом ва барқарорсозӣ) ва ба
 * сервер ҲЕҶ ГОҲ намерасиданд. Яъне навбати такрор намедонист, ки хонанда
 * маҳз дар кадом калима лағжид.
 *
 * Қоидаҳо дар `lib/srs.ts` (`afterLessonMistake`) — он ҷо тестшавандаанд.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { afterLessonMistake, initialSrsState } from '@/lib/srs';

export const dynamic = 'force-dynamic';

/** Як дарс аз ин зиёд калима надорад; муҳофизат аз дархости вайрон. */
const MAX_PER_CALL = 60;

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = await req.json().catch(() => ({}));
    const itemType = typeof body.itemType === 'string' && body.itemType.trim()
      ? body.itemType.trim()
      : 'word';
    const courseId = typeof body.courseId === 'string' && body.courseId.trim()
      ? body.courseId.trim()
      : null;

    const raw: string[] = Array.isArray(body.itemIds)
      ? (body.itemIds as unknown[])
          .filter((x): x is string => typeof x === 'string')
          .map((x) => x.trim())
          .filter((x) => x.length > 0)
      : [];
    const ids: string[] = Array.from(new Set(raw)).slice(0, MAX_PER_CALL);

    if (ids.length === 0) return NextResponse.json({ ok: true, marked: 0 });

    const now = new Date();
    const existing = await prisma.srsCard.findMany({
      where: { userId, itemType, itemId: { in: ids } },
    });
    const byId = new Map(existing.map((c) => [c.itemId, c]));

    let marked = 0;
    for (const itemId of ids) {
      const prev = byId.get(itemId);
      // Калимае, ки ҳанӯз корт надорад (масалан қадами компонентӣ), ҳамин ҷо
      // сохта мешавад — вагарна хатои воқеӣ дар ҳеҷ ҷо сабт намешуд.
      const next = afterLessonMistake(prev ?? initialSrsState(), now);
      if (prev) {
        await prisma.srsCard.update({
          where: { id: prev.id },
          data: { lapses: next.lapses, dueAt: next.dueAt },
        });
      } else {
        await prisma.srsCard.create({
          data: {
            userId, itemType, itemId, courseId,
            easeFactor: next.easeFactor,
            intervalDays: next.intervalDays,
            repetitions: next.repetitions,
            lapses: next.lapses,
            dueAt: next.dueAt,
          },
        });
      }
      marked++;
    }

    return NextResponse.json({ ok: true, marked });
  } catch (err) {
    console.error('[mobile/srs/mistakes]', err);
    return apiError('Failed to record mistakes');
  }
}
