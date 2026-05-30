import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/lessons/:lessonId
 * Full lesson payload. A lesson is one step in the learning path; besides its
 * own words it may LINK to a single component (grammar topic / phrase
 * collection / dialogue / comprehension). When linked, that component is
 * hydrated inline under `component` so the player can render the step without
 * an extra round-trip. Each component payload mirrors its standalone
 * /api/mobile/* endpoint so the app can reuse the same models.
 */
export async function GET(_req: NextRequest, { params }: { params: { lessonId: string } }) {
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: params.lessonId },
      include: {
        words: { orderBy: { order: 'asc' } },
        grammarTopic: {
          include: {
            examples: { orderBy: { order: 'asc' } },
            rules: { orderBy: { order: 'asc' } },
            exercises: { orderBy: { order: 'asc' } },
          },
        },
        phraseCollection: { include: { phrases: { orderBy: { order: 'asc' } } } },
        dialogue: { include: { lines: { orderBy: { order: 'asc' } } } },
        comprehension: { include: { questions: { orderBy: { order: 'asc' } } } },
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

    const course = lesson.module.course;
    const targetCode = course.targetLanguage.code;
    const targetName = course.targetLanguage.name;
    const nativeCode = course.nativeLanguage.code;
    const fallbackLevel = course.level;

    // Build the linked-component payload (at most one is set). Detection is by
    // which FK is populated, so it is independent of the loose `skillType` tag.
    let component:
      | { type: string; [k: string]: unknown }
      | null = null;

    const g = lesson.grammarTopic;
    const p = lesson.phraseCollection;
    const d = lesson.dialogue;
    const cx = lesson.comprehension;

    if (g && g.isActive) {
      component = {
        type: 'grammar',
        id: g.id,
        title: g.title,
        titleTranslated: g.titleTranslated,
        explanation: g.explanation,
        emoji: g.emoji,
        cefrLevel: g.cefrLevel ?? fallbackLevel,
        isPremium: g.isPremium,
        targetLanguageCode: targetCode,
        targetLanguageName: targetName,
        nativeLanguageCode: nativeCode,
        examples: g.examples.map((e) => ({
          id: e.id,
          sentence: e.sentence,
          translation: e.translation,
          audioUrl: e.audioUrl ?? '',
          highlight: e.highlight ?? '',
        })),
        rules: g.rules.map((r) => ({ id: r.id, pattern: r.pattern, note: r.note ?? '' })),
        exercises: g.exercises.map((ex) => ({
          id: ex.id,
          type: ex.type,
          prompt: ex.prompt,
          promptTranslated: ex.promptTranslated ?? '',
          answer: ex.answer,
          options: Array.isArray(ex.options) ? ex.options : (typeof ex.options === 'string' ? (() => { try { return JSON.parse(ex.options as string); } catch { return []; } })() : []),
          explanation: ex.explanation ?? '',
        })),
      };
    } else if (p && p.isActive) {
      component = {
        type: 'phrases',
        id: p.id,
        title: p.title,
        titleTranslated: p.titleTranslated,
        category: p.category ?? '',
        emoji: p.emoji,
        cefrLevel: p.cefrLevel ?? fallbackLevel,
        isPremium: p.isPremium,
        targetLanguageCode: targetCode,
        targetLanguageName: targetName,
        nativeLanguageCode: nativeCode,
        phrases: p.phrases.map((ph) => ({
          id: ph.id,
          text: ph.text,
          translation: ph.translation,
          literal: ph.literal ?? '',
          note: ph.note ?? '',
          audioUrl: ph.audioUrl ?? '',
        })),
      };
    } else if (d && d.isActive) {
      component = {
        type: 'dialogue',
        id: d.id,
        title: d.title,
        titleTranslated: d.titleTranslated,
        scenario: d.scenario ?? '',
        emoji: d.emoji,
        cefrLevel: d.cefrLevel ?? fallbackLevel,
        isPremium: d.isPremium,
        targetLanguageCode: targetCode,
        targetLanguageName: targetName,
        nativeLanguageCode: nativeCode,
        lines: d.lines.map((l) => ({
          id: l.id,
          speaker: l.speaker,
          text: l.text,
          translation: l.translation,
          audioUrl: l.audioUrl ?? '',
          isUser: l.isUser,
        })),
      };
    } else if (cx && cx.isActive) {
      component = {
        type: 'comprehension',
        id: cx.id,
        title: cx.title,
        titleTranslated: cx.titleTranslated,
        kind: cx.kind,
        passage: cx.passage,
        passageTranslated: cx.passageTranslated ?? '',
        audioUrl: cx.audioUrl ?? '',
        emoji: cx.emoji,
        cefrLevel: cx.cefrLevel ?? fallbackLevel,
        isPremium: cx.isPremium,
        targetLanguageCode: targetCode,
        targetLanguageName: targetName,
        nativeLanguageCode: nativeCode,
        questions: cx.questions.map((q) => ({
          id: q.id,
          question: q.question,
          questionTranslated: q.questionTranslated ?? '',
          options: Array.isArray(q.options) ? q.options : [],
          correctIndex: q.correctIndex,
          explanation: q.explanation ?? '',
        })),
      };
    }

    return NextResponse.json({
      id: lesson.id,
      title: lesson.title,
      titleTranslated: lesson.titleTranslated,
      type: lesson.type,
      // CEFR framework: lesson level falls back to the course level when unset.
      cefrLevel: lesson.cefrLevel ?? fallbackLevel,
      skillType: lesson.skillType,
      emoji: lesson.emoji,
      xpReward: lesson.xpReward,
      duration: lesson.duration,
      moduleId: lesson.moduleId,
      moduleTitle: lesson.module.title,
      targetLanguageCode: targetCode,
      targetLanguageName: targetName,
      nativeLanguageCode: nativeCode,
      // The linked step content, or null for a plain vocabulary lesson.
      component,
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
        partOfSpeech: w.partOfSpeech ?? '',
        frequencyRank: w.frequencyRank ?? null,
      })),
    });
  } catch (err: any) {
    console.error('[mobile/lessons/[lessonId]]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
