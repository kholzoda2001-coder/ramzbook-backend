import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/words?langId=<targetLanguageId>
 *
 * «Калимаҳои ман» — ҳамон ҷадвали «Words»-и Falou.
 *
 * ⚠️ ҲАМАИ калимаҳо бармегарданд, на танҳо омӯхтаҳо. Дар Falou калимаи ҳанӯз
 * наомӯхта ҳам дида мешавад — вале хира ва бе тугмаи садо. Ин ду кор мекунад:
 * хонанда мебинад, ки дар пеш чӣ ҳаст, ва мебинад, ки чӣ қадар роҳ рафтааст.
 * Агар танҳо омӯхтаҳо бармегаштанд, экран дар рӯзи аввал холӣ мемонд.
 *
 * «Омӯхта» = дарсе, ки ин калима дар он аст, гузашта шудааст
 * (`SpeakingProgress`). Ҳеҷ ҷадвали алоҳида лозим нест.
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
        emoji: true,
        lessons: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
          select: {
            id: true,
            items: {
              where: { kind: 'word' },
              orderBy: { order: 'asc' },
              select: {
                id: true,
                text: true,
                translation: true,
                literal: true,
                audioUrl: true,
              },
            },
          },
        },
      },
    });

    const lessonIds = categories.flatMap((c) => c.lessons.map((l) => l.id));
    const done = await prisma.speakingProgress.findMany({
      where: { userId, lessonId: { in: lessonIds } },
      select: { lessonId: true },
    });
    const doneIds = new Set(done.map((d) => d.lessonId));

    let learned = 0;
    let total = 0;

    const chapters = categories
      .map((c) => {
        const words = c.lessons.flatMap((l) =>
          l.items
            .filter((i) => i.text.trim())
            .map((i) => {
              const isLearned = doneIds.has(l.id);
              total++;
              if (isLearned) learned++;
              return {
                id: i.id,
                text: i.text.trim(),
                translation: i.translation.trim(),
                // Талаффуз ва аудио ТАНҲО барои калимаи омӯхта — калимаи
                // қулфшуда набояд ҷавобро пеш аз дарс нишон диҳад.
                literal: isLearned ? (i.literal?.trim() ?? '') : '',
                audioUrl: isLearned ? (i.audioUrl ?? '') : '',
                learned: isLearned,
              };
            }),
        );

        return {
          id: c.id,
          title: c.titleTranslated,
          emoji: c.emoji,
          words,
        };
      })
      .filter((c) => c.words.length > 0);

    return NextResponse.json({ learned, total, chapters });
  } catch (err) {
    console.error('[ai/speaking/words] GET failed:', err);
    return apiError('Failed to list the learned words.');
  }
}
