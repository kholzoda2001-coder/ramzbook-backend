import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/comprehensions/:exerciseId
 * Full comprehension: the passage (or listening transcript) + audio + every
 * ordered question with its options, correct index and explanation + language
 * metadata for TTS.
 */
export async function GET(_req: NextRequest, { params }: { params: { exerciseId: string } }) {
  try {
    const ex = await prisma.comprehensionExercise.findUnique({
      where: { id: params.exerciseId },
      include: {
        questions: { orderBy: { order: 'asc' } },
        course: {
          select: {
            level: true,
            targetLanguage: { select: { code: true, name: true } },
            nativeLanguage: { select: { code: true } },
          },
        },
      },
    });

    if (!ex || !ex.isActive) {
      return NextResponse.json({ error: 'Comprehension not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: ex.id,
      title: ex.title,
      titleTranslated: ex.titleTranslated,
      kind: ex.kind,
      passage: ex.passage,
      passageTranslated: ex.passageTranslated ?? '',
      audioUrl: ex.audioUrl ?? '',
      emoji: ex.emoji,
      cefrLevel: ex.cefrLevel ?? ex.course.level,
      isPremium: ex.isPremium,
      targetLanguageCode: ex.course.targetLanguage.code,
      targetLanguageName: ex.course.targetLanguage.name,
      nativeLanguageCode: ex.course.nativeLanguage.code,
      questions: ex.questions.map((q) => ({
        id: q.id,
        question: q.question,
        questionTranslated: q.questionTranslated ?? '',
        options: Array.isArray(q.options) ? q.options : [],
        correctIndex: q.correctIndex,
        explanation: q.explanation ?? '',
      })),
    });
  } catch (err: any) {
    console.error('[mobile/comprehensions/[exerciseId]]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
