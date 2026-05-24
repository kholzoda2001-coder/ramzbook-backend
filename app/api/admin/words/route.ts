import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/words?lessonId=X  — get words for a lesson
 * GET /api/admin/words              — get all words (paginated)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lessonId = searchParams.get('lessonId');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);
    const skip = (page - 1) * limit;

    if (lessonId) {
      // Words for specific lesson
      const lessonWords = await prisma.lessonWord.findMany({
        where: { lessonId },
        orderBy: { sortOrder: 'asc' },
        include: { word: true },
      });
      return NextResponse.json({
        words: lessonWords.map(lw => ({ ...lw.word, sortOrder: lw.sortOrder })),
        total: lessonWords.length,
      });
    }

    // All words paginated
    const [words, total] = await Promise.all([
      prisma.word.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: {
          lessons: {
            select: { lesson: { select: { id: true, title: true } } },
          },
        },
      }),
      prisma.word.count(),
    ]);

    return NextResponse.json({ words, total, page, limit });
  } catch (err: any) {
    console.error('[admin/words GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/words
 * Body: { lessonId, word, translation, ipa, emoji, example, exampleTranslation, audioUrl, difficulty }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      lessonId?: string;
      word?: string;
      translation?: string;
      ipa?: string;
      emoji?: string;
      example?: string;
      exampleTranslation?: string;
      audioUrl?: string;
      difficulty?: number;
      langFrom?: string;
      langTo?: string;
    };

    const wordText = (body.word ?? '').trim();
    const translation = (body.translation ?? '').trim();

    if (!wordText) {
      return NextResponse.json({ error: 'word field is required' }, { status: 400 });
    }

    const word = await prisma.word.create({
      data: {
        langFrom: body.langFrom ?? 'en',
        langTo: body.langTo ?? 'tg',
        word: wordText,
        translation,
        ipa: body.ipa?.trim() || null,
        emoji: body.emoji?.trim() || null,
        example: body.example?.trim() || null,
        exampleTranslation: body.exampleTranslation?.trim() || null,
        audioUrl: body.audioUrl?.trim() || null,
        difficulty: body.difficulty ?? 1,
      },
    });

    // If lessonId provided, link word to lesson
    if (body.lessonId) {
      const maxOrder = await prisma.lessonWord.count({ where: { lessonId: body.lessonId } });
      await prisma.lessonWord.create({
        data: { lessonId: body.lessonId, wordId: word.id, sortOrder: maxOrder + 1 },
      });
    }

    return NextResponse.json({ success: true, word });
  } catch (err: any) {
    console.error('[admin/words POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
