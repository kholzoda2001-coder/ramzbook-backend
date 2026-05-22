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

    // Fetch all active courses with their full tree: Unit -> Lesson -> Word
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        language: true,
        units: {
          orderBy: { sortOrder: 'asc' },
          include: {
            lessons: {
              orderBy: { sortOrder: 'asc' },
              include: {
                words: {
                  orderBy: { sortOrder: 'asc' },
                  include: { word: true }
                }
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
        category: c.language.name,
        rating: 5.0,
        isFree: c.level === 'A1',
        languageCode: c.language.code,
        isOwned: isPremium || c.level === 'A1',
        isLocked: !isPremium && c.level !== 'A1',
        expiresAt: user?.premiumExpiresAt?.toISOString() ?? null,
        progress: 0, // Simplified for now, can map from userProgress if needed
        lastReadPageIndex: 0,
        modules: c.units.map((u) => {
          // Flatten all words in all lessons of this unit into the module's vocabulary
          const words = u.lessons.flatMap(l => 
            l.words.map(lw => ({
              id: lw.word.id,
              originalWord: lw.word.word,
              transcription: lw.word.ipa || '',
              pronunciation: lw.word.ipa || '',
              translation: lw.word.translation || '',
              audioUrl: lw.word.audioUrl || '',
              emoji: lw.word.emoji || ''
            }))
          );

          return {
            id: u.id,
            title: u.title,
            orderIndex: u.sortOrder,
            isFreePreview: !u.isPremium,
            words: words,
            quizzes: [] // We'll leave this empty or populate it later
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
