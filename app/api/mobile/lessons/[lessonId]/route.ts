import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/lessons/:lessonId
 * Full lesson payload with ordered words (target word + native translation).
 */
export async function GET(_req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        words: { orderBy: { order: 'asc' } },
        module: {
          select: {
            id: true, title: true, titleTranslated: true,
            course: {
              select: {
                id: true, level: true,
                targetLanguage: { select: { code: true, name: true } },
                nativeLanguage: { select: { code: true, name: true } },
              },
            },
          },
        },
      },
    });

    if (!lesson) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      titleTranslated: lesson.titleTranslated,
      type: lesson.type,
      emoji: lesson.emoji,
      xpReward: lesson.xpReward,
      duration: lesson.duration,
      moduleId: lesson.moduleId,
      moduleTitle: lesson.module.title,
      targetLanguageCode: lesson.module.course.targetLanguage.code,
      targetLanguageName: lesson.module.course.targetLanguage.name,
      nativeLanguageCode: lesson.module.course.nativeLanguage.code,
      words: lesson.words.map((w) => ({
        id: w.id,
        word: w.word,
        translation: w.translation,
        emoji: w.emoji ?? '',
        ipa: w.ipa ?? '',
        example: w.example ?? '',
        exampleTrans: w.exampleTrans ?? '',
        audioUrl: w.audioUrl ?? '',
        difficulty: w.difficulty,
      })),
    });
  } catch (err: any) {
    console.error('[mobile/lessons/[lessonId]]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
