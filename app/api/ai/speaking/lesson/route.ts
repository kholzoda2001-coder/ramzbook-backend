import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';
import {
  generateSteps,
  toWire,
  toEngineItem,
  configForEv,
} from '@/lib/speaking/engine';

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

// ⚠️ `MAX_SLOT_WORDS` аз ин ҷо ба `lib/speaking/engine.ts` кӯчид
// (`DEFAULT_CONFIG.maxSlotWords`). Ду нусхаи ҳамон рақам маҳз ҳамон
// дуқабатагӣест, ки M0 барҳам медиҳад.

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const langId = req.nextUrl.searchParams.get('langId')?.trim();

    // Ихтиёрӣ: хонанда худаш бобро аз рӯйхат интихоб кард
    // (ниг. `/api/ai/speaking/categories`). Холӣ бошад — занҷири одатӣ:
    // аввалин дарси нагузашта дар ҳамаи бобҳо.
    const categoryId = req.nextUrl.searchParams.get('categoryId')?.trim();

    // ── Гейти версияи клиент (§10.2) ─────────────────────────────────────
    //
    // Клиенти кӯҳна `ev` намефиристад → `1` → навъҳои нав (`chunk`,
    // `swap`) ва майдонҳои нав ба он ҲЕҶ ГОҲ намераванд. Ин ягона роҳест,
    // ки APK-и насбшуда пас аз навсозии сервер вайрон нашавад — интизори
    // паҳншавии нашр лозим нест.
    const ev = Number(req.nextUrl.searchParams.get('ev') ?? '1') || 1;
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
                // Барои `chunk` ва `swap` (ev ≥ 2).
                chainOverride: true,
                swaps: true,
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

    // ── Тавлиди машқҳо ───────────────────────────────────────────────────
    //
    // Мантиқ ба `lib/speaking/engine.ts` кӯчид (M0). Он ҷо функсияи ТОЗА
    // аст — бе Prisma, бе I/O, бе `Date`/`random` — пас 100% санҷида ва дар
    // админ пешнамоиш карда мешавад. Рафтор БЕТАҒЙИР: ҳамон навъҳо, ҳамон
    // тартиб, ҳамон думи `recall`.
    //
    // `ev = 1` формати симро мехкӯб мекунад: ҳеҷ майдони нав ба клиентҳои
    // мавҷуда намеравад. Гейти версия аз параметри дархост — M5 (§10.2).
    const cfg = configForEv(ev);
    const steps = generateSteps(
      items.map((i) => ({
        ...toEngineItem(i),
        chainOverride: i.chainOverride,
        swaps: i.swaps,
      })),
      cfg,
      { repeat },
    );
    const exercises = steps.map((s) => toWire(s, ev));

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
