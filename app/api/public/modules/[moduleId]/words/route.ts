import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    if (!params.moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400 });
    }

    const module = await prisma.module.findUnique({
      where: { id: params.moduleId },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { words: { orderBy: { order: 'asc' } } },
        },
      },
    });

    if (module) {
      const words = module.lessons.flatMap((l) =>
        l.words.map((w) => ({
          id: w.id,
          originalWord: w.word,
          transcription: w.ipa || '',
          pronunciation: w.ipa || '',
          translation: w.translation || '',
          audioUrl: w.audioUrl || '',
          emoji: w.emoji || '',
        }))
      );
      return NextResponse.json({ words });
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.moduleId },
      include: { words: { orderBy: { order: 'asc' } } },
    });

    if (lesson) {
      const words = lesson.words.map((w) => ({
        id: w.id,
        originalWord: w.word,
        transcription: w.ipa || '',
        pronunciation: w.ipa || '',
        translation: w.translation || '',
        audioUrl: w.audioUrl || '',
        emoji: w.emoji || '',
      }));
      return NextResponse.json({ words });
    }

    return NextResponse.json({ error: 'Module not found' }, { status: 404 });
  } catch (err) {
    console.error('[GET /api/public/modules/[moduleId]/words]', err);
    return NextResponse.json({ error: 'Failed to fetch words' }, { status: 500 });
  }
}
