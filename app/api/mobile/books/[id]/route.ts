import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAccessToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/books/:id
 * A single course mapped to the legacy "Book" shape, with ownership/premium flags.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      try {
        userId = verifyAccessToken(authHeader.slice(7)).userId;
      } catch (_) {}
    }

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

    let isPremiumUser = false;
    if (userId) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { isPremium: true } });
      isPremiumUser = user?.isPremium ?? false;
    }
    const isOwned = isPremiumUser;

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
    console.error('[api/mobile/books/[id]] Error:', error);
    return NextResponse.json({ error: error?.message || 'Server Error' }, { status: 500 });
  }
}
