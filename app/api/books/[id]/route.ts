import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/books/:id
 * Returns a single course (mapped as Book) with full modules/words data.
 * Used by BookReaderScreen for guest (unauthenticated) access.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    const book = {
      id: course.id,
      title: course.title,
      author: 'RAMZ Academy',
      coverUrl: '',
      rating: 4.8,
      progress: 0,
      isOwned: false,
      isLocked: false,
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
    console.error('[api/books/[id]] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server Error' },
      { status: 500 }
    );
  }
}
