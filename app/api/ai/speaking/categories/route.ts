import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import {
  unlockedSpeakingLessonIds,
  FREE_SPEAKING_LESSONS,
  FREE_SESSIONS_PER_SITUATION,
} from '@/lib/speaking/access';
import { asGoal, isSituation, orderChapters } from '@/lib/speaking/situations';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/categories?langId=<targetLanguageId>
 *
 * Ҳамаи бобҳои спикинги ин ҷуфти забон бо прогресси корбар.
 *
 * ЧАРО ҷудо аз `/lesson`: он ҷо ҳамеша ЯК боби ҷорӣ бармегардад (дарси
 * навбатӣ). Барои рӯйхати бобҳо — то ки хонанда худаш мавзӯъро интихоб кунад —
 * ҳамаи бобҳо бо шумораи дарси гузашта лозиманд.
 *
 * ⚠️ Ба роҳнамои курс (Course/Module/Lesson/UserProgress) даст намезанад.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const langId = req.nextUrl.searchParams.get('langId')?.trim();
    if (!langId) {
      return NextResponse.json({ error: 'langId is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nativeLang: true, isPremium: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

    const nativeLanguage = await prisma.language.findFirst({
      where: { code: user.nativeLang },
      select: { id: true },
    });
    if (!nativeLanguage) {
      return NextResponse.json(
        { error: `No language row for native code "${user.nativeLang}".` },
        { status: 404 },
      );
    }

    const categories = await prisma.speakingCategory.findMany({
      where: {
        targetLanguageId: langId,
        nativeLanguageId: nativeLanguage.id,
        isActive: true,
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        titleTranslated: true,
        scenario: true,
        emoji: true,
        isPremium: true,
        order: true,
        goals: true,
        lessons: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            // Барои рӯйхати дарсҳои боб (`lessonList`).
            title: true,
            stage: true,
            // Дарси бе воҳид машқ дода наметавонад — ҳамон қоидаи `/lesson`.
            _count: { select: { items: true } },
          },
        },
      },
    });

    // Вазъиятҳо аввал (аз рӯи ҳадафи хонанда), бобҳои кӯҳна дар охир.
    const goal = asGoal(req.nextUrl.searchParams.get('goal'));
    const usable = orderChapters(
      categories
        .map((c) => ({
          ...c,
          lessons: c.lessons.filter((l) => l._count.items > 0),
        }))
        .filter((c) => c.lessons.length > 0),
      goal,
    );

    const allLessonIds = usable.flatMap((c) => c.lessons.map((l) => l.id));
    const done = await prisma.speakingProgress.findMany({
      where: { userId, lessonId: { in: allLessonIds } },
      select: { lessonId: true },
    });
    const doneIds = new Set(done.map((d) => d.lessonId));

    // ── Гейти премиум ────────────────────────────────────────────────────
    //
    // ⚠️ ҲАМОН функсия, ки роути `/lesson` истифода мебарад. Ду нусхаи
    // қоида маънои онро дошт, ки экран бобро кушода нишон медиҳад ва
    // сервер онро рад мекунад — бадтарин ҳолати мумкин.
    //
    // Боби қулф аз рӯйхат НЕСТ намешавад: хонанда бояд бубинад, ки чӣ
    // интизор аст (қарори соҳиби маҳсулот, 2026-09-06).
    const openIds = unlockedSpeakingLessonIds({
      chapters: usable,
      completedIds: doneIds,
      isPremium: user.isPremium,
    });

    return NextResponse.json({
      isPremium: user.isPremium,
      freeLessons: FREE_SPEAKING_LESSONS,
      freeSessionsPerSituation: FREE_SESSIONS_PER_SITUATION,
      categories: usable.map((c, i) => {
        const total = c.lessons.length;
        const finished = c.lessons.filter((l) => doneIds.has(l.id)).length;
        const open = c.lessons.filter((l) => openIds.has(l.id)).length;
        return {
          id: c.id,
          number: i + 1,
          title: c.titleTranslated,
          emoji: c.emoji,
          scenario: c.scenario ?? '',
          isPremium: c.isPremium,
          // «Гуфтор»-и нав: вазъият (бо зинаҳо) ё боби кӯҳна.
          isSituation: isSituation(c),
          goals: c.goals,
          lessons: total,
          lessonsDone: finished,
          progress: total ? finished / total : 0,
          // Чанд дарси ин боб кушода аст ва оё боб ПУРРА қулф аст.
          lessonsOpen: open,
          locked: open === 0,
          // Ҳамаи дарсҳои боб — зеркунии боб рӯйхатро нишон медиҳад
          // (дархости корбар, 2026-09-12). `open` аз ҲАМОН `openIds`, пас
          // экран ва роути `/lesson?lessonId=` ҳеҷ гоҳ ду ҷавоб намедиҳанд.
          // Майдони `lessons` (рақам) барои клиенти кӯҳна мемонад.
          lessonList: c.lessons.map((l, li) => ({
            id: l.id,
            number: li + 1,
            title: (l.title ?? '').trim(),
            done: doneIds.has(l.id),
            open: openIds.has(l.id),
            stage: l.stage ?? null,
          })),
        };
      }),
    });
  } catch (err) {
    console.error('[ai/speaking/categories] GET failed:', err);
    return apiError('Failed to list speaking chapters.', 500, err);
  }
}
