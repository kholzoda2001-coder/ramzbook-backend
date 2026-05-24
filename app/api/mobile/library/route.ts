import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, premiumExpiresAt: true }
    });

    const isPremium = !!user?.isPremium;

    // Fetch all active courses with their full tree: Module -> Lesson -> Word
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
      include: {
        targetLanguage: true,
        modules: {
          orderBy: { order: 'asc' },
          include: {
            lessons: {
              orderBy: { order: 'asc' },
              include: {
                words: { orderBy: { order: 'asc' } }
              }
            }
          }
        }
      }
    });

    // Map the new RAMZ schema (Course) into the old Mobile App schema (Product)
    // so the Flutter app doesn't crash
    const library = courses.map((c) => {
      return {
        id: c.id,
        title: c.title,
        author: 'RAMZ',
        coverUrl: '', // Can be replaced with actual image later
        description: c.description || '',
        category: c.targetLanguage.name,
        rating: 5.0,
        isFree: c.level === 'A1',
        languageCode: c.targetLanguage.code,
        isOwned: isPremium || c.level === 'A1',
        isLocked: !isPremium && c.level !== 'A1',
        expiresAt: user?.premiumExpiresAt?.toISOString() ?? null,
        progress: 0, // Simplified for now, can map from userProgress if needed
        lastReadPageIndex: 0,
        modules: c.modules.map((m) => {
          // Flatten all words in all lessons of this module.
          const words = m.lessons.flatMap(l =>
            l.words.map(w => ({
              id: w.id,
              originalWord: w.word,
              transcription: w.ipa || '',
              pronunciation: w.ipa || '',
              translation: w.translation || '',
              audioUrl: w.audioUrl || '',
              emoji: w.emoji || ''
            }))
          );

          return {
            id: m.id,
            title: m.title,
            orderIndex: m.order,
            isFreePreview: !m.isPremium,
            words: words,
            quizzes: []
          };
        })
      };
    });

    return NextResponse.json(library);
  } catch (err) {
    console.error('[library]', err);
    return apiError('Failed to fetch library');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
