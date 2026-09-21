import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import { isStaleRead, normaliseClientTime, readingXp } from '@/lib/libraryProgress';
import { markStudied } from '@/lib/activity';
import { awardXp, dailyXpDateKey } from '@/lib/xp';
import { updateDailyTasks } from '@/lib/dailyTasks';

export const dynamic = 'force-dynamic';

/**
 * Ҷои хониши хонанда дар Китобхона — ба ҲИСОБ баста, на ба телефон.
 *
 * ── Чаро ин роут лозим шуд ────────────────────────────────────────────────
 * Ҷои хониш танҳо дар `SharedPreferences` буд. Хонанда нисфи китобро мехонд,
 * баъд барномаро аз нав насб мекард (ё «Clear data» мезад, ё дар телефони
 * дигар ворид мешуд) — ва китоб аз аввал сар мешуд. Прогресси ДАРС аллакай
 * дар сервер буд; Китобхона аз ин берун монда буд.
 *
 * GET  → ҳамаи сатрҳои корбар: { items: [{ itemId, position, total, bookmarks, lastReadAt }] }
 * POST → як сатрро нав мекунад: { itemId, position, total?, bookmarks?, lastReadAt? }
 *
 * ⚠️ Қоидаи ҳалли низо: сатри НАВтар ғолиб меояд. Агар мизоҷ `lastReadAt`-и
 * КӮҲНАТАР фиристад (телефони офлайнмонда, соати нодуруст), сервер онро рад
 * мекунад ва қимати худро нигоҳ медорад. Пас ҳеҷ дастгоҳ прогресси
 * дастгоҳи дигарро ба ақиб партофта наметавонад — маҳз ҳамин талаби
 * «дар ягон ҳолат гум нашавад» аст.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const rows = await prisma.libraryProgress.findMany({
      where: { userId },
      select: { itemId: true, position: true, total: true, bookmarks: true, lastReadAt: true },
      orderBy: { lastReadAt: 'desc' },
    });

    return NextResponse.json({ items: rows });
  } catch (err) {
    console.error('[mobile/library/progress GET]', err);
    return apiError('Failed to load reading progress');
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const body = (await req.json()) as {
      itemId?: string; position?: number; total?: number;
      bookmarks?: unknown; lastReadAt?: string;
    };

    const itemId = (body.itemId ?? '').trim();
    if (!itemId) return NextResponse.json({ error: 'itemId is required' }, { status: 400 });

    const position = Math.max(0, Math.trunc(Number(body.position) || 0));
    const total = Math.max(0, Math.trunc(Number(body.total) || 0));
    const bookmarks = Array.isArray(body.bookmarks)
      ? Array.from(new Set(
          body.bookmarks
            .map((v) => Math.trunc(Number(v)))
            .filter((v) => Number.isFinite(v) && v >= 0),
        )).sort((a, b) => a - b)
      : undefined;

    // Соати мизоҷро бовар мекунем, вале аз ОЯНДА не — вагарна як телефони
    // бо соати нодуруст сатрро то абад «навтарин» мекард ва ҳеҷ дастгоҳи
    // дигар дигар онро нав карда наметавонист.
    const now = new Date();
    const lastReadAt = normaliseClientTime(body.lastReadAt ? new Date(body.lastReadAt) : null, now);

    const existing = await prisma.libraryProgress.findUnique({
      where: { userId_itemId: { userId, itemId } },
      select: { lastReadAt: true, position: true, total: true, bookmarks: true },
    });

    // Кӯҳнатар аз он чи мо дорем → рад мешавад, вале хато НЕ: мизоҷ бояд
    // қимати ҳақиқиро бигирад ва худро ислоҳ кунад.
    if (existing && isStaleRead(lastReadAt, existing.lastReadAt)) {
      return NextResponse.json({ ok: true, stale: true, current: existing });
    }

    const row = await prisma.libraryProgress.upsert({
      where: { userId_itemId: { userId, itemId } },
      create: {
        userId, itemId, position, total,
        bookmarks: bookmarks ?? [],
        lastReadAt,
      },
      update: {
        position,
        // `total` танҳо вақте нав мешавад, ки маънои дошта бошад — китоби
        // ҳанӯз кушоданашуда `0` мефиристад ва набояд рақами дурустро пок кунад.
        ...(total > 0 && { total }),
        ...(bookmarks !== undefined && { bookmarks }),
        lastReadAt,
      },
      select: { itemId: true, position: true, total: true, bookmarks: true, lastReadAt: true },
    });

    // ── Хондан ҲАМ таълим аст ─────────────────────────────────────────────
    //
    // 🔴 То 22.09.2026 ин роут танҳо ҷои хонишро нигоҳ медошт. Хонандае, ки
    // ним соат китоб мехонд: 0 XP, силсилааш МЕШИКАСТ, вазифаи рӯз пеш
    // намерафт — ва барои сервер ӯ «ғайрифаъол» буд, яъне push-и
    // баргардонӣ мегирифт. Барнома ба ӯ мегуфт: «хондани ту кор нест».
    //
    // `markStudied` ҳамеша (ҳатто такрорхонӣ — ин фаъолият аст), вале XP
    // ТАНҲО барои ҷои НАВ ва бо ҳадди рӯзона (`readingXp`).
    await markStudied(userId, now);

    let xp = 0;
    try {
      const prev = existing?.position ?? 0;
      const gained = position - prev;
      if (gained > 0) {
        // Чанд XP имрӯз аллакай аз ХОНДАН гирифта шудааст — `DailyXp.source`
        // онро бо номи манбаъ нигоҳ медорад.
        // Калид аз ХУДИ `lib/xp` — вагарна ҳад сатри дигарро мехонад.
        const today = dailyXpDateKey(now);
        const dx = await prisma.dailyXp.findUnique({
          where: { userId_date: { userId, date: today } },
          select: { source: true },
        });
        const earnedToday =
          ((dx?.source as Record<string, number> | null)?.reading ?? 0);
        xp = readingXp(prev, position, earnedToday);
        if (xp > 0) {
          await awardXp(userId, xp, 'reading');
          await updateDailyTasks(userId, { xp });
        }
      }
    } catch (e) {
      // XP ҳеҷ гоҳ набояд НИГОҲДОРИИ ҷои хонишро вайрон кунад.
      console.error('[library/progress xp]', e);
    }

    return NextResponse.json({ ok: true, stale: false, current: row, xpEarned: xp });
  } catch (err) {
    console.error('[mobile/library/progress POST]', err);
    return apiError('Failed to save reading progress');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
