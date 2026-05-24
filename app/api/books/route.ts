import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/books
 * Active courses mapped to the legacy "Book" shape the Flutter catalog/library
 * screens still consume. Optional ?category=English filters by target-language name.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const courses = await prisma.course.findMany({
      where: {
        isActive: true,
        ...(category ? { targetLanguage: { name: category } } : {}),
      },
      orderBy: { order: 'asc' },
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
    }));

    return NextResponse.json(books);
  } catch (error: any) {
    console.error('[api/books] Error:', error);
    return NextResponse.json({ error: error?.message || 'Server Error' }, { status: 500 });
  }
}
