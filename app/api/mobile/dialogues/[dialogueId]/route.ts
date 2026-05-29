import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/dialogues/:dialogueId
 * Full dialogue: the scenario + every ordered line (speaker, target text,
 * native translation, audio, isUser flag) + language metadata for TTS.
 */
export async function GET(_req: NextRequest, { params }: { params: { dialogueId: string } }) {
  try {
    const dialogue = await prisma.dialogue.findUnique({
      where: { id: params.dialogueId },
      include: {
        lines: { orderBy: { order: 'asc' } },
        course: {
          select: {
            level: true,
            targetLanguage: { select: { code: true, name: true } },
            nativeLanguage: { select: { code: true } },
          },
        },
      },
    });

    if (!dialogue || !dialogue.isActive) {
      return NextResponse.json({ error: 'Dialogue not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: dialogue.id,
      title: dialogue.title,
      titleTranslated: dialogue.titleTranslated,
      scenario: dialogue.scenario ?? '',
      emoji: dialogue.emoji,
      cefrLevel: dialogue.cefrLevel ?? dialogue.course.level,
      isPremium: dialogue.isPremium,
      targetLanguageCode: dialogue.course.targetLanguage.code,
      targetLanguageName: dialogue.course.targetLanguage.name,
      nativeLanguageCode: dialogue.course.nativeLanguage.code,
      lines: dialogue.lines.map((l) => ({
        id: l.id,
        speaker: l.speaker,
        text: l.text,
        translation: l.translation,
        audioUrl: l.audioUrl ?? '',
        isUser: l.isUser,
      })),
    });
  } catch (err: any) {
    console.error('[mobile/dialogues/[dialogueId]]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
