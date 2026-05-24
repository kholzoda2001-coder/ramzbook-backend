import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { moduleId: string } }) {
  try {
    if (!params.moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400, headers: corsHeaders });
    }

    // A "module" id may be a Module (aggregate its lessons' words) or a Lesson.
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
      return NextResponse.json(
        { title: module.title, description: module.titleTranslated, words, quizzes: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: params.moduleId },
      include: { words: { orderBy: { order: 'asc' } } },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Module/Lesson not found' }, { status: 404, headers: corsHeaders });
    }

    const words = lesson.words.map((w) => ({
      id: w.id,
      originalWord: w.word,
      transcription: w.ipa || '',
      pronunciation: w.ipa || '',
      translation: w.translation || '',
      audioUrl: w.audioUrl || '',
      emoji: w.emoji || '',
    }));
    return NextResponse.json({ words, quizzes: [] }, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[GET /api/modules/[moduleId]]', err);
    return apiError('Failed to fetch module details');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
