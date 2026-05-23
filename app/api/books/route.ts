import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/books
 * Returns all active courses mapped to the Book format expected by the Flutter app.
 * Optional query: ?category=English  → filter by language name
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        ...(category ? { language: { name: category } } : {}),
      },
      orderBy: [
        { language: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
      ],
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

    // Map Course → Book JSON shape expected by Flutter
    const books = courses.map((course) => ({
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
    }));

    return NextResponse.json(books);
  } catch (error: any) {
    console.error('[api/books] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Server Error' },
      { status: 500 }
    );
  }
}
