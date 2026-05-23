import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/books/:id
 * Returns a single course (mapped as Book) with full modules/words data.
 * Authenticated version: checks user ownership and premium status.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract user ID from token if present
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const payload = verifyAccessToken(authHeader.slice(7));
        userId = payload.userId;
      } catch (_) {}
    }

    const course = await prisma.course.findUnique({
      where: { id: params.id },
      include: {
        language: true,
        units: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
              include: {
                words: {
                  orderBy: { sortOrder: 'asc' },
                  include: { word: true },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404 });
    }

    // Check user premium/ownership
    let isOwned = false;
    let isPremiumUser = false;
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { isPremium: true },
      });
      isPremiumUser = user?.isPremium ?? false;
      isOwned = isPremiumUser; // Premium users own all courses
    }

    const book = {
      id: course.id,
      title: course.title,
      author: 'RAMZ Academy',
      coverUrl: '',
      rating: 4.8,
      progress: 0,
      isOwned,
      isLocked: !isOwned && !isPremiumUser,
      isFree: true,
      lastReadPageIndex: 0,
      category: course.language.name,
      languageCode: course.language.code,
      description: course.description || `${course.title} — ${course.level}`,
      modules: course.units.map((unit) => ({
        id: unit.id,
        title: unit.title,
        orderIndex: unit.sortOrder,
        isFreePreview: !unit.isPremium,
        words: unit.lessons.flatMap((lesson) =>
          lesson.words.map((lw) => ({
            id: lw.word.id,
            originalWord: lw.word.word,
            transcription: lw.word.ipa || '',
            pronunciation: lw.word.audioUrl || '',
            translation: lw.word.translation,
            audioUrl: lw.word.audioUrl || '',
            exampleSentence: lw.word.example || '',
            exampleTranslation: lw.word.exampleTranslation || '',
          }))
        ),
        quizzes: [],
      })),
    };

    return NextResponse.json(book);
  } catch (error: any) {
    console.error('[api/mobile/books/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server Error' },
      { status: 500 }
    );
  }
}
