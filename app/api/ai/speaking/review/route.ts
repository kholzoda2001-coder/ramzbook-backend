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

    if (done.length === 0) {
      return NextResponse.json(
        { error: 'Nothing to review yet — finish a speaking lesson first.' },
        { status: 404 },
      );
    }

    const exercises = [];
    for (const row of done) {
      // Танҳо ҶУМЛАҲО: калимаи ҷудогона такрори сусттар медиҳад, ва ҳадафи
      // такрор нигоҳ доштани тамоми ибора аст, на як калима.
      const usable = row.lesson.items.filter(
        (i) =>
          i.kind !== 'word' &&
          i.text.trim() &&
          i.translation.trim() &&
          i.text.trim().split(/\s+/).filter(Boolean).length <= MAX_SLOT_WORDS,
      );

      // Аз охири дарс мегирем — он ҷо ҷумлаҳои пурратар ва мураккабтаранд.
      for (const item of usable.slice(-ITEMS_PER_LESSON)) {
        const text = item.text.trim();
        exercises.push({
          // «Аз хотира»: матн пинҳон ва овоз хомӯш — вагарна такрор ба
          // хондани матн табдил меёбад.
          kind: 'recall',
          badge: 'remember',
          prompt: item.translation.trim(),
          target: text,
          targetWords: text.split(/\s+/).filter(Boolean),
          translit: item.literal?.trim() ?? '',
          meaning: item.translation.trim(),
          grammar: item.note?.trim() ?? '',
          audioUrl: item.audioUrl ?? '',
          cue: item.cue?.trim() ?? '',
          cueTranslation: item.cueTranslation?.trim() ?? '',
        });
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
