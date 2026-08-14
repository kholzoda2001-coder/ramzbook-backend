import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/lesson?langId=<targetLanguageId>&level=<A1…C2>
 *
 * Дарси навбатии «Устоди AI · Speaking» → `{ lessonId, chapter, exercises[] }`.
 *
 * Машқҳо аз МУНДАРИҶАИ МАВҶУДА сохта мешаванд (Word + Lesson), на аз як
 * генератори нав: ҳар калима як машқи «бигӯед» медиҳад, ва ҳар калимае, ки
 * мисоли ҷумладор дорад — боз як машқи «тарҷума кунед». Нишонҳо (нав /
 * душвор / ба ёд оред) аз ҳамон SRS-и мавҷуда хонда мешаванд.
 */

const MAX_EXERCISES = 10;

type Badge = 'none' | 'newWord' | 'hard' | 'remember';

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const { searchParams } = req.nextUrl;
    const langId = searchParams.get('langId')?.trim();
    const levelParam = searchParams.get('level')?.trim();

    if (!langId) {
      return NextResponse.json({ error: 'langId is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nativeLang: true, level: true },
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

    const level = levelParam || user.level || 'A1';

    // Курси дархостшуда; агар набошад — аввалин курси фаъоли ҳамин ҷуфт.
    const course =
      (await prisma.course.findFirst({
        where: {
          targetLanguageId: langId,
          nativeLanguageId: nativeLanguage.id,
          level,
          isActive: true,
        },
        select: { id: true },
      })) ??
      (await prisma.course.findFirst({
        where: {
          targetLanguageId: langId,
          nativeLanguageId: nativeLanguage.id,
          isActive: true,
        },
        orderBy: { order: 'asc' },
        select: { id: true },
      }));

    if (!course) {
      return NextResponse.json(
        { error: 'No course for this language pair.' },
        { status: 404 },
      );
    }

    const modules = await prisma.module.findMany({
      where: { courseId: course.id, isActive: true },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        titleTranslated: true,
        order: true,
        lessons: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: { id: true },
        },
      },
    });

    const allLessonIds = modules.flatMap((m) => m.lessons.map((l) => l.id));
    if (allLessonIds.length === 0) {
      return NextResponse.json({ error: 'Course has no lessons.' }, { status: 404 });
    }

    const completed = await prisma.userProgress.findMany({
      where: { userId, lessonId: { in: allLessonIds }, isCompleted: true },
      select: { lessonId: true },
    });
    const completedIds = new Set(completed.map((p) => p.lessonId));

    // Аввалин дарси нагузашта; агар ҳама гузашта бошанд — охиринаш такрор.
    let moduleIndex = modules.findIndex((m) =>
      m.lessons.some((l) => !completedIds.has(l.id)),
    );
    if (moduleIndex < 0) moduleIndex = modules.length - 1;

    const activeModule = modules[moduleIndex];
    const nextLesson =
      activeModule.lessons.find((l) => !completedIds.has(l.id)) ??
      activeModule.lessons[activeModule.lessons.length - 1];

    const lesson = await prisma.lesson.findUnique({
      where: { id: nextLesson.id },
      select: {
        id: true,
        words: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            word: true,
            translation: true,
            ipa: true,
            ipaTajik: true,
            example: true,
            exampleTrans: true,
          },
        },
      },
    });

    if (!lesson || lesson.words.length === 0) {
      return NextResponse.json(
        { error: 'Lesson has no words to practise.' },
        { status: 404 },
      );
    }

    // Нишонҳо аз SRS-и мавҷуда — на аз ҳисоби нав.
    const cards = await prisma.srsCard.findMany({
      where: {
        userId,
        itemType: 'word',
        itemId: { in: lesson.words.map((w) => w.id) },
      },
      select: { itemId: true, lapses: true, dueAt: true },
    });
    const cardByWord = new Map(cards.map((c) => [c.itemId, c]));
    const now = new Date();

    const badgeFor = (wordId: string): Badge => {
      const card = cardByWord.get(wordId);
      if (!card) return 'newWord';
      if (card.lapses >= 2) return 'hard';
      if (card.dueAt <= now) return 'remember';
      return 'none';
    };

    const exercises: Array<Record<string, unknown>> = [];

    for (const w of lesson.words) {
      if (exercises.length >= MAX_EXERCISES) break;

      const translit = w.ipaTajik?.trim() || w.ipa?.trim() || '';

      exercises.push({
        kind: 'say',
        badge: badgeFor(w.id),
        target: w.word,
        translit,
        meaning: w.translation,
        grammar:
          w.example && w.exampleTrans
            ? `${w.example} — ${w.exampleTrans}`
            : '',
      });

      // Ҷумлаи мисол → машқи тарҷума бо слотҳо.
      const example = w.example?.trim();
      const exampleTrans = w.exampleTrans?.trim();
      if (
        example &&
        exampleTrans &&
        exercises.length < MAX_EXERCISES &&
        example.split(/\s+/).length <= 6
      ) {
        exercises.push({
          kind: 'translate',
          badge: 'none',
          prompt: exampleTrans,
          targetWords: example.split(/\s+/).filter(Boolean),
          translit: '',
          meaning: exampleTrans,
          grammar: '',
        });
      }
    }

    // Прогресси боб = дарсҳои гузашта дар ҳамин модул.
    const moduleLessonCount = activeModule.lessons.length;
    const moduleDone = activeModule.lessons.filter((l) =>
      completedIds.has(l.id),
    ).length;

    return NextResponse.json({
      lessonId: lesson.id,
      chapter: {
        number: moduleIndex + 1,
        title: activeModule.titleTranslated,
        lessonsToNext: Math.max(0, moduleLessonCount - moduleDone),
        progress: moduleLessonCount ? moduleDone / moduleLessonCount : 0,
      },
      exercises,
    });
  } catch (err) {
    console.error('[ai/speaking/lesson] GET failed:', err);
    return apiError('Failed to build the speaking lesson.');
  }
}
