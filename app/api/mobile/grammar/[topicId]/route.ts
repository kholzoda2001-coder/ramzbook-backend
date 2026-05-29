import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/grammar/:topicId
 * Full grammar topic: Markdown explanation + audio examples + rules + practice
 * exercises. The app grades exercises locally, so the answer is included.
 */
export async function GET(_req: NextRequest, { params }: { params: { topicId: string } }) {
  try {
    const topic = await prisma.grammarTopic.findUnique({
      where: { id: params.topicId },
      include: {
        examples: { orderBy: { order: 'asc' } },
        rules: { orderBy: { order: 'asc' } },
        exercises: { orderBy: { order: 'asc' } },
        course: {
          select: {
            level: true,
            targetLanguage: { select: { code: true, name: true } },
            nativeLanguage: { select: { code: true } },
          },
        },
      },
    });

    if (!topic || !topic.isActive) {
      return NextResponse.json({ error: 'Grammar topic not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: topic.id,
      title: topic.title,
      titleTranslated: topic.titleTranslated,
      explanation: topic.explanation,
      emoji: topic.emoji,
      cefrLevel: topic.cefrLevel ?? topic.course.level,
      isPremium: topic.isPremium,
      targetLanguageCode: topic.course.targetLanguage.code,
      targetLanguageName: topic.course.targetLanguage.name,
      nativeLanguageCode: topic.course.nativeLanguage.code,
      examples: topic.examples.map((e) => ({
        id: e.id,
        sentence: e.sentence,
        translation: e.translation,
        audioUrl: e.audioUrl ?? '',
        highlight: e.highlight ?? '',
      })),
      rules: topic.rules.map((r) => ({
        id: r.id,
        pattern: r.pattern,
        note: r.note ?? '',
      })),
      exercises: topic.exercises.map((ex) => ({
        id: ex.id,
        type: ex.type,
        prompt: ex.prompt,
        promptTranslated: ex.promptTranslated ?? '',
        answer: ex.answer,
        options: Array.isArray(ex.options) ? ex.options : [],
        explanation: ex.explanation ?? '',
      })),
    });
  } catch (err: any) {
    console.error('[mobile/grammar/[topicId]]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
