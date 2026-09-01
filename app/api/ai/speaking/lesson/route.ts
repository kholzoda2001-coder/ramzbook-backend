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

    // Ихтиёрӣ: хонанда худаш бобро аз рӯйхат интихоб кард
    // (ниг. `/api/ai/speaking/categories`). Холӣ бошад — занҷири одатӣ:
    // аввалин дарси нагузашта дар ҳамаи бобҳо.
    const categoryId = req.nextUrl.searchParams.get('categoryId')?.trim();
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
        ...(categoryId ? { id: categoryId } : {}),
      },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        titleTranslated: true,
        // Тавсифи вазъият — Falou ҳар дарсро маҳз бо ин сар мекунад:
        // «шумо дар кафе ҳастед…». Бе он машқ рӯйхати ҷумлаҳои беконтекст аст.
        scenario: true,
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
                // Бе `id` клиент хатои худро ба воҳиди мушаххас баста
                // наметавонад — «такрори аз хатоҳо» аз ҳамин сар мешавад.
                id: true,
                kind: true,
                text: true,
                translation: true,
                literal: true,
                note: true,
                audioUrl: true,
                // Қадами муколама: ҷумлаи ҳамсӯҳбат пеш аз навбати хонанда.
                cue: true,
                cueTranslation: true,
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
        {
          error: categoryId
            ? 'This speaking chapter has no usable lessons.'
            : 'No speaking lessons for this language pair yet.',
        },
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

    const exercises: Record<string, unknown>[] = items.flatMap((item) => {
      const text = item.text.trim();
      const translation = item.translation.trim();
      const words = text.split(/\s+/).filter(Boolean);

      const shared = {
        // Клиент бе ин намедонад, ки дар КАДОМ воҳид ғалат кард — ва
        // «такрори аз хатоҳо» бе он умуман сохта намешавад.
        itemId: item.id,
        translit: item.literal?.trim() ?? '',
        meaning: translation,
        grammar: item.note?.trim() ?? '',
        audioUrl: item.audioUrl ?? '',
        cue: item.cue?.trim() ?? '',
        cueTranslation: item.cueTranslation?.trim() ?? '',
      };

      // ── КАЛИМА: зинаи сеқадама (ёрӣ кам-кам бардошта мешавад) ──────────
      //
      // Ҳамон зинае, ки корбар дар Falou дид:
      //
      //  | қадам | матн | талаффуз + маънӣ | барнома мехонад? |
      //  |---|---|---|---|
      //  | 1 `say`      | намоён | **намоён**            | ✅ |
      //  | 2 `wordEcho` | намоён | пинҳон → баъди ҷавоб  | ✅ |
      //  | 3 `wordSolo` | намоён | пинҳон → баъди ҷавоб  | ❌ |
      //
      // ЧАРО се, на як: як бор такрор кардани садои шунида «донистан» нест.
      // Қадами сеюм ягона ҷоест, ки хонанда калимаро аз ХУДАШ мебарорад —
      // бе овози намуна ва бе тарҷумаи пеши чашм.
      //
      // ⚠️ Ҳар се ҲАМОН `itemId`-ро доранд: барои навбати «такрори аз
      // хатоҳо» ин ЯК воҳид аст, на се (ниг. `lib/speakingMistakes.ts`).
      if (item.kind === 'word') {
        return [
          // 1. Шиносоӣ: калима, талаффуз ва маънӣ — ҳама пеши чашм.
          {
            kind: 'say',
            badge: repeat ? 'remember' : 'newWord',
            target: text,
            ...shared,
          },
          // 2. Талаффуз: калима ҳанӯз намоён, вале маънӣ пинҳон.
          { kind: 'wordEcho', badge: 'none', target: text, ...shared },
          // 3. Санҷиш: акнун ТОҶИКӢ нишон дода мешавад ва ҷои англисӣ ХОЛӢ.
          //
          //    Ҳамон `translate`-и ҷумла, вале барои ЯК калима: матни ҳадаф
          //    ба слоти холӣ табдил меёбад ва барнома ҳеҷ чиз намехонад.
          //    Хонанда бояд калимаро аз тарҷума ба ёд орад ва ГӮЯД —
          //    ин ягона қадамест, ки донистани воқеиро месанҷад.
          {
            kind: 'translate',
            badge: 'none',
            prompt: translation,
            targetWords: words,
            ...shared,
          },
        ];
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

    // ── Санҷиши хотира дар охири дарс ──────────────────────────────────────
    //
    // Айнан мисли Falou: дарс бо машқе тамом мешавад, ки матни ҳадафро НИШОН
    // НАМЕДИҲАД — хонанда танҳо тарҷумаи забони модариро мебинад ва ҷумларо
    // аз ХОТИРА мегӯяд. Маҳз ҳамин қадам такрори кӯр-кӯронаро ба ёдгирии
    // воқеӣ табдил медиҳад.
    //
    // Танҳо ҷумлаҳо гирифта мешаванд (калимаи ҷудогона санҷиши хотира нест)
    // ва танҳо онҳое, ки ба слотҳо мегунҷанд.
    const recallPool = items.filter(
      (i) =>
        i.kind !== 'word' &&
        i.text.trim().split(/\s+/).filter(Boolean).length <= MAX_SLOT_WORDS,
    );

    // Дарси хеле хурд санҷиши хотира намегирад — он ҷо ҳама чиз ҳанӯз тоза
    // дар хотир аст ва такрор танҳо дилгиркунанда мешавад.
    const recall = recallPool.length >= 3 ? recallPool.slice(-2) : [];

    for (const item of recall) {
      const text = item.text.trim();
      exercises.push({
        kind: 'recall',
        badge: 'remember',
        itemId: item.id,
        prompt: item.translation.trim(),
        target: text,
        targetWords: text.split(/\s+/).filter(Boolean),
        translit: item.literal?.trim() ?? '',
        meaning: item.translation.trim(),
        grammar: item.note?.trim() ?? '',
        audioUrl: item.audioUrl ?? '',
      });
    }

    const chapterLessons = chapter.lessons.length;
    const chapterDone = chapter.lessons.filter((l) => doneIds.has(l.id)).length;

    return NextResponse.json({
      lessonId: lesson.id,
      lessonTitle: lesson.title ?? '',
      lessonNumber: lessonIndex + 1,
      // Ҳанӯз ягон дарси гуфтор нагузаштааст → тугма «Оғози дарс» мешавад,
      // на «Дарси навбатӣ».
      firstEver: doneIds.size === 0,
      chapter: {
        number: chapterIndex + 1,
        title: chapter.titleTranslated,
        emoji: chapter.emoji,
        scenario: chapter.scenario ?? '',
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
