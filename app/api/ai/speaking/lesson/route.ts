import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ai/speaking/lesson?langId=<targetLanguageId>
 *
 * Категорияи навбатии «Устоди AI · Speaking» → `{ categoryId, chapter, exercises[] }`.
 *
 * ⚠️ Ин бахш ба РОҲНАМОИ курс (Course/Module/Lesson/Word/UserProgress) ТАМОМАН
 * даст намезанад. Мазмун аз `SpeakingCategory` + `SpeakingItem` меояд, ки ба
 * ҶУФТИ ЗАБОН бастаанд, на ба курс ва на ба сатҳ. Прогресс дар
 * `SpeakingProgress` алоҳида нигоҳ дошта мешавад.
 *
 * `level` дигар хонда намешавад: тартиби категорияҳо (`order`) душвориро
 * муайян мекунад, айнан мисли бобҳои Falou.
 */

const MAX_EXERCISES = 10;

/** Аз кадом ҷои категория машқи «худат бисоз» сар мешавад (0..1). */
const TRANSLATE_FROM = 0.6;

/** Ҷумлаи дарозро ба слотҳо тақсим кардан хонданашаванда мешавад. */
const MAX_SLOT_WORDS = 6;

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

    // Ҳамаи категорияҳои ин ҷуфти забон, бо тартиби худашон.
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
        items: {
          orderBy: { order: 'asc' },
          select: {
            text: true,
            translation: true,
            literal: true,
            note: true,
          },
        },
      },
    });

    // Категорияи бе воҳид машқ дода наметавонад — партофта мешавад.
    const usable = categories.filter((c) =>
      c.items.some((i) => i.text.trim() && i.translation.trim()),
    );

    if (usable.length === 0) {
      return NextResponse.json(
        { error: 'No speaking categories for this language pair yet.' },
        { status: 404 },
      );
    }

    // Прогресси СПИКИНГ — на прогресси курс.
    const done = await prisma.speakingProgress.findMany({
      where: { userId, categoryId: { in: usable.map((c) => c.id) } },
      select: { categoryId: true },
    });
    const doneIds = new Set(done.map((d) => d.categoryId));

    // Аввалин категорияи нагузашта; агар ҳама гузашта бошанд — охиринаш такрор.
    const pending = usable.findIndex((c) => !doneIds.has(c.id));
    const index = pending < 0 ? usable.length - 1 : pending;
    const category = usable[index];

    const items = category.items
      .filter((i) => i.text.trim() && i.translation.trim())
      .slice(0, MAX_EXERCISES);

    // Категорияи нав → ҳама воҳидҳо нав; такрор → «ба ёд оред».
    const badge = doneIds.has(category.id) ? 'remember' : 'newWord';
    const translateFrom = Math.ceil(items.length * TRANSLATE_FROM);

    const exercises = items.map((item, i) => {
      const text = item.text.trim();
      const translation = item.translation.trim();
      const words = text.split(/\s+/).filter(Boolean);

      // Нишеб: аввал «такрор кунед», баъд «худатон бисозед».
      const produce = i >= translateFrom && words.length <= MAX_SLOT_WORDS;

      const shared = {
        badge,
        translit: item.literal?.trim() ?? '',
        meaning: translation,
        grammar: item.note?.trim() ?? '',
      };

      return produce
        ? { kind: 'translate', ...shared, prompt: translation, targetWords: words }
        : { kind: 'say', ...shared, target: text };
    });

    return NextResponse.json({
      categoryId: category.id,
      chapter: {
        number: index + 1,
        title: category.titleTranslated,
        lessonsToNext: Math.max(0, usable.length - doneIds.size),
        progress: doneIds.size / usable.length,
      },
      exercises,
    });
  } catch (err) {
    console.error('[ai/speaking/lesson] GET failed:', err);
    return apiError('Failed to build the speaking lesson.');
  }
}
