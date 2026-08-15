import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/lesson?langId=<targetLanguageId>
 *
 * Дарси навбатии «Устоди AI · Speaking» (услуби Falou).
 *
 * ⚠️ Ба РОҲНАМОИ курс (Course/Module/Lesson/Word/UserProgress) ТАМОМАН даст
 * намезанад. Занҷир: SpeakingCategory → SpeakingLesson → SpeakingItem,
 * прогресс дар `SpeakingProgress`.
 *
 * Категория = «боб» (мас. «Фармоиши нӯшокӣ»), дарс = як нишасти машқ.
 * Дарсҳо пай дар пай мераванд; вақте ҳамаи дарсҳои категория гузаштанд,
 * категорияи навбатӣ сар мешавад.
 */

/** Ҷумлаи дароз ба слотҳо тақсим намешавад — хонда намешавад. */
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

    // Ҳамаи бобҳо ва дарсҳои ин ҷуфти забон, бо тартиби худашон.
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
            title: true,
            items: {
              orderBy: { order: 'asc' },
              select: {
                kind: true,
                text: true,
                translation: true,
                literal: true,
                note: true,
                audioUrl: true,
              },
            },
          },
        },
      },
    });

    // Дарси бе воҳид машқ дода наметавонад — партофта мешавад.
    const chapters = categories
      .map((c) => ({
        ...c,
        lessons: c.lessons.filter((l) =>
          l.items.some((i) => i.text.trim() && i.translation.trim()),
        ),
      }))
      .filter((c) => c.lessons.length > 0);

    if (chapters.length === 0) {
      return NextResponse.json(
        { error: 'No speaking lessons for this language pair yet.' },
        { status: 404 },
      );
    }

    const allLessonIds = chapters.flatMap((c) => c.lessons.map((l) => l.id));
    const done = await prisma.speakingProgress.findMany({
      where: { userId, lessonId: { in: allLessonIds } },
      select: { lessonId: true },
    });
    const doneIds = new Set(done.map((d) => d.lessonId));

    // Аввалин дарси нагузашта дар тамоми занҷир; ҳама тамом → охиринаш такрор.
    let chapter = chapters[chapters.length - 1];
    let lesson = chapter.lessons[chapter.lessons.length - 1];
    let chapterIndex = chapters.length - 1;
    let lessonIndex = chapter.lessons.length - 1;

    outer: for (let ci = 0; ci < chapters.length; ci++) {
      for (let li = 0; li < chapters[ci].lessons.length; li++) {
        if (!doneIds.has(chapters[ci].lessons[li].id)) {
          chapter = chapters[ci];
          lesson = chapters[ci].lessons[li];
          chapterIndex = ci;
          lessonIndex = li;
          break outer;
        }
      }
    }

    const items = lesson.items.filter(
      (i) => i.text.trim() && i.translation.trim(),
    );

    // Такрори дарс → «ба ёд оред», вагарна калимаи нав / машқи душвор.
    const repeat = doneIds.has(lesson.id);

    const exercises = items.map((item) => {
      const text = item.text.trim();
      const translation = item.translation.trim();
      const words = text.split(/\s+/).filter(Boolean);

      const shared = {
        translit: item.literal?.trim() ?? '',
        meaning: translation,
        grammar: item.note?.trim() ?? '',
        audioUrl: item.audioUrl ?? '',
      };

      // Калима → «бигӯед» (матн намоён). Ҷумла → «тарҷума кунед» (слотҳо).
      if (item.kind === 'word') {
        return {
          kind: 'say',
          badge: repeat ? 'remember' : 'newWord',
          target: text,
          ...shared,
        };
      }

      // Ҷумлаи дароз ба слотҳо намеғунҷад — ҳамчун «бигӯед» нишон дода мешавад.
      if (words.length > MAX_SLOT_WORDS) {
        return {
          kind: 'say',
          badge: repeat ? 'remember' : 'none',
          target: text,
          ...shared,
        };
      }

      return {
        kind: 'translate',
        badge: repeat ? 'remember' : 'none',
        prompt: translation,
        targetWords: words,
        ...shared,
      };
    });

    const chapterLessons = chapter.lessons.length;
    const chapterDone = chapter.lessons.filter((l) => doneIds.has(l.id)).length;

    // Калимаҳои нави ин дарс — барои экрани оғоз («You have N words»).
    const newWords = items
      .filter((i) => i.kind === 'word')
      .map((i) => ({
        text: i.text.trim(),
        translation: i.translation.trim(),
        audioUrl: i.audioUrl ?? '',
      }));

    return NextResponse.json({
      lessonId: lesson.id,
      lessonTitle: lesson.title ?? '',
      lessonNumber: lessonIndex + 1,
      newWords,
      chapter: {
        number: chapterIndex + 1,
        title: chapter.titleTranslated,
        emoji: chapter.emoji,
        // Чанд дарс то анҷоми ҳамин боб — ҳамон «N lessons for next chapter».
        lessonsToNext: Math.max(0, chapterLessons - chapterDone),
        progress: chapterLessons ? chapterDone / chapterLessons : 0,
      },
      exercises,
    });
  } catch (err) {
    console.error('[ai/speaking/lesson] GET failed:', err);
    return apiError('Failed to build the speaking lesson.');
  }
}
