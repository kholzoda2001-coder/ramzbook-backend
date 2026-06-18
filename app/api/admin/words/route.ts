import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/words?lessonId=X  — words for a lesson (ordered)
 * GET /api/admin/words              — all words (paginated)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const lessonId = searchParams.get('lessonId');
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10), 500);
    const skip = (page - 1) * limit;

    if (lessonId) {
      const words = await prisma.word.findMany({
        where: { lessonId },
        orderBy: { order: 'asc' },
      });
      return NextResponse.json({ words, total: words.length });
    }

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
        include: { lesson: { select: { id: true, title: true } } },
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
 * Body: { lessonId, word, translation, ipa, emoji, example, exampleTrans, audioUrl, difficulty }
 * 'word' is in the lesson's target language; 'translation' is in the native language.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      lessonId?: string;
      word?: string;
      translation?: string;
      ipa?: string;
      ipaTajik?: string;
      emoji?: string;
      example?: string;
      exampleTrans?: string;
      audioUrl?: string;
      difficulty?: number;
      partOfSpeech?: string;
      frequencyRank?: number;
      order?: number;
    };

    const wordText = (body.word ?? '').trim();
    const translation = (body.translation ?? '').trim();

    if (!body.lessonId) {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }
    if (!wordText) {
      return NextResponse.json({ error: 'word field is required' }, { status: 400 });
    }

    const order = body.order ?? (await prisma.word.count({ where: { lessonId: body.lessonId } }));

    const word = await prisma.word.create({
      data: {
        lessonId: body.lessonId,
        word: wordText,
        translation,
        ipa: body.ipa?.trim() || null,
        ipaTajik: body.ipaTajik?.trim() || null,
        emoji: body.emoji?.trim() || null,
        example: body.example?.trim() || null,
        exampleTrans: body.exampleTrans?.trim() || null,
        audioUrl: body.audioUrl?.trim() || null,
        difficulty: body.difficulty ?? 1,
        partOfSpeech: body.partOfSpeech?.trim() || null,
        frequencyRank: typeof body.frequencyRank === 'number' ? body.frequencyRank : null,
        order,
      },
    });

    return NextResponse.json({ success: true, word });
  } catch (err: any) {
    console.error('[admin/words POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
