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

    // ── SRS pool for component steps ────────────────────────────────────────
    // A step that links to a component (grammar / phrases / dialogue /
    // comprehension) carries no Word rows of its own, so `words` came back
    // empty. The app reads exactly this array as its SRS pool
    // (course_roadmap_screen._enrollLessonWords) and bails on an empty one —
    // so grammar and dialogue steps never fed the review queue at all.
    //
    // Fall back to a small slice of the MODULE's vocabulary: words the learner
    // has already met earlier in this same module, so finishing the step
    // REFRESHES them rather than introducing anything new. Deliberately capped
    // — enrolment grades every word in the pool as "good", and letting one
    // grammar step push a whole 60-word module's SM-2 intervals out would
    // inflate schedules the learner never actually earned.
    //
    // Ordering is deterministic (most frequent first; Postgres sorts NULL
    // frequencyRank last on ASC), and duplicate surface forms are collapsed —
    // several modules teach the same word in two lessons, and enrolling both
    // rows would put one word into the queue twice.
    const SRS_FALLBACK_LIMIT = 5;
    let wordRows = lesson.words;
    if (component && wordRows.length === 0) {
      const moduleWords = await prisma.word.findMany({
        where: { lesson: { moduleId: lesson.moduleId } },
        orderBy: [{ frequencyRank: 'asc' }, { order: 'asc' }, { id: 'asc' }],
      });
      const seen = new Set<string>();
      const deduped = moduleWords.filter((w) => {
        const key = w.word.trim().toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      // Each component step gets a DIFFERENT window of the module's words.
      // Taking the same first five everywhere would hand a module's 3-4
      // component steps one identical set, grading those five "good" four
      // times over while the module's other ~38 words got one pass each —
      // a handful of words racing out to long intervals for no reason.
      // Rotating by the lesson's own order keeps the pick deterministic
      // (same lesson → same pool on every fetch) while spreading the load.
      const start = deduped.length
        ? (lesson.order * SRS_FALLBACK_LIMIT) % deduped.length
        : 0;
      wordRows = [...deduped.slice(start), ...deduped.slice(0, start)]
        .slice(0, SRS_FALLBACK_LIMIT);
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
      words: wordRows.map((w) => ({
        id: w.id,
        word: w.word,
        translation: w.translation,
        emoji: w.emoji ?? '',
        ipa: w.ipa ?? '',
        ipaTajik: w.ipaTajik ?? '',
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
