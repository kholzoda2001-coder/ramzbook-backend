import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/review?langId=<targetLanguageId>
 *
 * Нишасти ТАКРОР: ҷумлаҳое, ки хонанда аллакай омӯхтааст, аз нав пурсида
 * мешаванд — ҳамон ҷадвали «Practice»-и Falou.
 *
 * ЧАРО лозим: дарс як бор гузашта мешавад ва дигар ҳеҷ гоҳ барнамегардад.
 * Бе такрор ҷумлаҳо баъди ду ҳафта фаромӯш мешаванд ва тамоми боб бекор.
 *
 * **Такрори фосиладори сабук, бе ҷадвали алоҳида:** навбат аз
 * `SpeakingProgress.lastReviewedAt` сохта мешавад — аввал дарсҳое, ки ҳеҷ гоҳ
 * такрор нашудаанд (`null`), баъд кӯҳнатаринҳо. Ҳар нишаст ин майдонро
 * навсозӣ мекунад, пас навбат худаш давр мезанад.
 *
 * ⚠️ Ба роҳнамои курс даст намезанад — танҳо ҷадвалҳои `Speaking*`.
 */

/** Чанд дарси гузашта як нишасти такрорро пур мекунад. */
const LESSONS_PER_REVIEW = 3;

/** Аз ҳар дарс чанд ҷумла гирифта шавад. */
const ITEMS_PER_LESSON = 3;

/** Ҷумлаи дароз ба слотҳо намеғунҷад — ҳамон қоидаи `/lesson`. */
const MAX_SLOT_WORDS = 8;

/**
 * Чанд ҷои нишаст ба ХАТОҲО дода мешавад.
 *
 * Тамоми нишастро аз хатоҳо пур накардан ҚАСДАН аст: агар хонанда 20 хато
 * дошта бошад, нишасте, ки танҳо аз душвортарин ҷумлаҳо иборат аст,
 * ноумедкунанда мешавад — маҳз ҳамон ҳиссиёте, ки мо аз он мегурезем.
 * Ҳамеша чанд ҷумлаи «мегузарам» дар байн мемонад.
 */
const MISTAKE_SLOTS = 4;

/** Тавсифи як воҳид, тавре ки экран интизор аст. */
type ReviewItem = {
  id: string;
  kind: string;
  text: string;
  translation: string;
  literal: string | null;
  note: string | null;
  audioUrl: string | null;
  cue: string | null;
  cueTranslation: string | null;
};

/** Воҳид барои такрор мувофиқ аст? Ҳамон қоидаҳои дар ҳарду роҳ. */
function reviewable(i: ReviewItem) {
  return (
    i.kind !== 'word' &&
    i.text.trim() !== '' &&
    i.translation.trim() !== '' &&
    i.text.trim().split(/\s+/).filter(Boolean).length <= MAX_SLOT_WORDS
  );
}

/** Воҳидро ба машқи «аз хотира» табдил медиҳад. */
function toRecall(i: ReviewItem) {
  const text = i.text.trim();
  return {
    // «Аз хотира»: матн пинҳон ва овоз хомӯш — вагарна такрор ба
    // хондани матн табдил меёбад.
    kind: 'recall',
    badge: 'remember',
    itemId: i.id,
    prompt: i.translation.trim(),
    target: text,
    targetWords: text.split(/\s+/).filter(Boolean),
    translit: i.literal?.trim() ?? '',
    meaning: i.translation.trim(),
    grammar: i.note?.trim() ?? '',
    audioUrl: i.audioUrl ?? '',
    cue: i.cue?.trim() ?? '',
    cueTranslation: i.cueTranslation?.trim() ?? '',
  };
}

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
      select: { nativeLang: true },
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

    // Дарсҳои ГУЗАШТАи ҳамин ҷуфти забон, кӯҳнатарин такрор — аввал.
    const done = await prisma.speakingProgress.findMany({
      where: {
        userId,
        lesson: {
          category: {
            targetLanguageId: langId,
            nativeLanguageId: nativeLanguage.id,
            isActive: true,
          },
        },
      },
      orderBy: [{ lastReviewedAt: { sort: 'asc', nulls: 'first' } }, { completedAt: 'asc' }],
      take: LESSONS_PER_REVIEW,
      select: {
        lessonId: true,
        lesson: {
          select: {
            title: true,
            category: { select: { titleTranslated: true, emoji: true } },
            items: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                kind: true,
                text: true,
                translation: true,
                literal: true,
                note: true,
                audioUrl: true,
                cue: true,
                cueTranslation: true,
              },
            },
          },
        },
      },
    });

    // ── Қабати 1: ХАТОҲОИ ХУДИ ХОНАНДА ────────────────────────────────────
    //
    // Ин ҳамон чизест, ки то ин ҷо намерасид. `lastReviewedAt` танҳо
    // медонист, ки кадом ДАРС кайҳо боз такрор нашудааст — на он ки хонанда
    // маҳз дар КАДОМ ҷумла ғалат кард.
    //
    // Тартиб: аввал он ҷумлаҳое, ки кайҳо боз пурсида нашудаанд
    // (`lastAskedAt` null = ҳеҷ гоҳ), баъд онҳое, ки бештар ғалат шудаанд.
    // Яъне навбат ҳам гардиш дорад, ҳам душвортаринҳоро дар боло нигоҳ
    // медорад.
    const mistakes = await prisma.speakingMistake.findMany({
      where: {
        userId,
        item: {
          lesson: {
            category: {
              targetLanguageId: langId,
              nativeLanguageId: nativeLanguage.id,
              isActive: true,
            },
          },
        },
      },
      orderBy: [
        { lastAskedAt: { sort: 'asc', nulls: 'first' } },
        { misses: 'desc' },
      ],
      take: MISTAKE_SLOTS,
      select: {
        id: true,
        item: {
          select: {
            id: true,
            kind: true,
            text: true,
            translation: true,
            literal: true,
            note: true,
            audioUrl: true,
            cue: true,
            cueTranslation: true,
          },
        },
      },
    });

    const mistakeExercises = mistakes
      .filter((m) => reviewable(m.item))
      .map((m) => toRecall(m.item));

    // Ин воҳидҳо дигар аз қабати вақтӣ гирифта намешаванд — вагарна як
    // ҷумла дар як нишаст ду бор пурсида мешуд.
    const usedItemIds = new Set(mistakeExercises.map((e) => e.itemId));

    // Хатоҳо пурсида шуданд → соати онҳо нав мешавад, то дафъаи оянда
    // ҷумлаҳои ДИГАР ба навбат оянд.
    if (mistakes.length > 0) {
      await prisma.speakingMistake.updateMany({
        where: { id: { in: mistakes.map((m) => m.id) }, userId },
        data: { lastAskedAt: new Date() },
      });
    }

    if (done.length === 0 && mistakeExercises.length === 0) {
      return NextResponse.json(
        { error: 'Nothing to review yet — finish a speaking lesson first.' },
        { status: 404 },
      );
    }

    // ── Қабати 2: такрори вақтӣ (ҳамон мантиқи пештара) ───────────────────
    const exercises = [...mistakeExercises];
    for (const row of done) {
      // Танҳо ҶУМЛАҲО: калимаи ҷудогона такрори сусттар медиҳад, ва ҳадафи
      // такрор нигоҳ доштани тамоми ибора аст, на як калима.
      const usable = row.lesson.items.filter(
        (i) => reviewable(i) && !usedItemIds.has(i.id),
      );

      // Аз охири дарс мегирем — он ҷо ҷумлаҳои пурратар ва мураккабтаранд.
      for (const item of usable.slice(-ITEMS_PER_LESSON)) {
        exercises.push(toRecall(item));
      }
    }

    if (exercises.length === 0) {
      return NextResponse.json(
        { error: 'No reviewable sentences in the finished lessons.' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      lessonId: '', // такрор дарси алоҳида нест
      reviewLessonIds: done.map((d) => d.lessonId),
      // Чанд машқи ин нишаст аз ХАТОҲОИ худи хонанда омад — экран бо ин
      // ба ӯ мегӯяд, ки такрор шахсӣ аст, на тасодуфӣ.
      mistakeCount: mistakeExercises.length,
      lessonTitle: '',
      lessonNumber: 1,
      firstEver: false,
      chapter: {
        number: 0,
        title: '',
        emoji: '🔁',
        scenario: '',
        lessonsToNext: 0,
        progress: 0,
      },
      exercises,
    });
  } catch (err) {
    console.error('[ai/speaking/review] GET failed:', err);
    return apiError('Failed to build the review session.');
  }
}
