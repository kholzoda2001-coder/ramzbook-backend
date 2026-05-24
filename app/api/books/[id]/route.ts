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
        targetLanguage: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
              include: { words: { orderBy: { order: 'asc' } } },
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
      category: course.targetLanguage.name,
      languageCode: course.targetLanguage.code,
      description: course.description || `${course.title} — ${course.level}`,
      modules: course.modules.map((module) => ({
        id: module.id,
        title: module.title,
        orderIndex: module.order,
        isFreePreview: !module.isPremium,
        words: module.lessons.flatMap((lesson) =>
          lesson.words.map((w) => ({
            id: w.id,
            originalWord: w.word,
            transcription: w.ipa || '',
            pronunciation: w.audioUrl || '',
            translation: w.translation,
            audioUrl: w.audioUrl || '',
            exampleSentence: w.example || '',
            exampleTranslation: w.exampleTrans || '',
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
