import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    if (!params.moduleId) {
      return NextResponse.json({ error: 'Module ID (Unit ID) is required' }, { status: 400, headers: corsHeaders });
    }

    // In the new schema, "module" maps to "Unit", and it contains "Lessons" with "Words"
    const unit = await prisma.unit.findUnique({
      where: { id: params.moduleId },
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
    });

    if (!unit) {
      // Fallback: If mobile app sends a Lesson ID instead of Unit ID
      const lesson = await prisma.lesson.findUnique({
         where: { id: params.moduleId },
         include: {
            words: {
              orderBy: { sortOrder: 'asc' },
              include: { word: true }
            }
         }
      });
      
      if (!lesson) {
         return NextResponse.json({ error: 'Unit/Lesson not found' }, { status: 404, headers: corsHeaders });
      }
      
      const words = lesson.words.map(lw => ({
        id: lw.word.id,
        originalWord: lw.word.word,
        transcription: lw.word.ipa || '',
        pronunciation: lw.word.ipa || '',
        translation: lw.word.translation || '',
        audioUrl: lw.word.audioUrl || '',
        emoji: lw.word.emoji || ''
      }));

      return NextResponse.json({ words, quizzes: [] }, { status: 200, headers: corsHeaders });
    }

    // If it's a Unit, aggregate all words from its lessons
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

    return NextResponse.json({
      title: unit.title,
      description: unit.description,
      words: words || [],
      quizzes: [],
    }, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[GET /api/modules/[moduleId]]', err);
    return apiError('Failed to fetch module details');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
