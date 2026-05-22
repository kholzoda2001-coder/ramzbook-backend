import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    if (!params.moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    // Try finding by Unit first
    let unit = await prisma.unit.findUnique({
      where: { id: params.moduleId },
      include: {
        lessons: {
          include: {
            words: {
              include: { word: true },
              orderBy: { sortOrder: 'asc' }
            }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (unit) {
      const words = unit.lessons.flatMap(l => 
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
      return NextResponse.json({ words });
    }

    // Try finding by Lesson
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.moduleId },
      include: {
        words: {
          include: { word: true },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (lesson) {
      const words = lesson.words.map(lw => ({
        id: lw.word.id,
        originalWord: lw.word.word,
        transcription: lw.word.ipa || '',
        pronunciation: lw.word.ipa || '',
        translation: lw.word.translation || '',
        audioUrl: lw.word.audioUrl || '',
        emoji: lw.word.emoji || ''
      }));
      return NextResponse.json({ words });
    }

    return NextResponse.json({ error: 'Module not found' }, { status: 404 });
  } catch (err) {
    console.error('[GET /api/public/modules/[moduleId]/words]', err);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}
