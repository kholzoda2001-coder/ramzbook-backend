import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, apiError } from '@/lib/auth';
import { CEFR_LEVELS } from '@/lib/cefr';
import { computePlacement, isCorrectAnswer, PlacementAnswer } from '@/lib/placement';

export const dynamic = 'force-dynamic';

/** Canonical CEFR order index, used to sort questions easy → hard. */
function levelIndex(level: string): number {
  const i = (CEFR_LEVELS as readonly string[]).indexOf(level);
  return i < 0 ? CEFR_LEVELS.length : i;
}

/**
 * GET /api/mobile/placement?targetLanguageId=X&nativeLanguageId=Y
 * Returns the active placement questions for a (target, native) language pair,
 * ordered easy → hard. The correct answer + explanation are intentionally
 * OMITTED — grading happens server-side on submit so the test can't be gamed.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetLanguageId = searchParams.get('targetLanguageId');
    const nativeLanguageId = searchParams.get('nativeLanguageId');

    if (!targetLanguageId || !nativeLanguageId) {
      return NextResponse.json(
        { error: 'targetLanguageId and nativeLanguageId are required' },
        { status: 400 },
      );
    }

    const rows = await prisma.placementQuestion.findMany({
      where: { targetLanguageId, nativeLanguageId, isActive: true },
      select: {
        id: true,
        cefrLevel: true,
        skill: true,
        prompt: true,
        promptTranslated: true,
        options: true,
        audioUrl: true,
        order: true,
      },
    });

    // Sort by canonical CEFR level, then by the admin-defined order.
    rows.sort((a, b) => {
      const d = levelIndex(a.cefrLevel) - levelIndex(b.cefrLevel);
      return d !== 0 ? d : a.order - b.order;
    });

    return NextResponse.json({ questions: rows, total: rows.length });
  } catch (err: any) {
    console.error('[mobile/placement GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/mobile/placement
 * Body: { targetLanguageId, nativeLanguageId, answers: [{ questionId, selected }] }
 * Grades the submitted answers, infers the CEFR level, and — if the request is
 * authenticated — writes the result to the learner's UserLanguage.currentLevel
 * for that target language. Auth is OPTIONAL so the test also works during
 * onboarding before the account context is established (client stores locally).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      targetLanguageId?: string;
      nativeLanguageId?: string;
      answers?: Array<{ questionId?: string; selected?: string }>;
    };

    const targetLanguageId = (body.targetLanguageId ?? '').trim();
    const nativeLanguageId = (body.nativeLanguageId ?? '').trim();
    const answers = Array.isArray(body.answers) ? body.answers : [];

    if (!targetLanguageId || !nativeLanguageId) {
      return NextResponse.json(
        { error: 'targetLanguageId and nativeLanguageId are required' },
        { status: 400 },
      );
    }
    if (answers.length === 0) {
      return NextResponse.json({ error: 'answers must be a non-empty array' }, { status: 400 });
    }

    // Load the referenced questions for this pair (with their correct answers).
    const ids = answers
      .map((a) => (a.questionId ?? '').trim())
      .filter((s) => s.length > 0);
    const questions = await prisma.placementQuestion.findMany({
      where: { id: { in: ids }, targetLanguageId, nativeLanguageId, isActive: true },
      select: { id: true, cefrLevel: true, answer: true, explanation: true, skill: true },
    });
    const byId = new Map(questions.map((q) => [q.id, q]));

    // Grade each answer server-side.
    const graded: PlacementAnswer[] = [];
    const perQuestion: Array<{ questionId: string; correct: boolean; cefrLevel: string; explanation: string | null }> = [];
    for (const a of answers) {
      const q = byId.get((a.questionId ?? '').trim());
      if (!q) continue; // ignore unknown / mismatched questions
      const correct = isCorrectAnswer(q.answer, a.selected ?? '');
      graded.push({ cefrLevel: q.cefrLevel, correct });
      perQuestion.push({ questionId: q.id, correct, cefrLevel: q.cefrLevel, explanation: q.explanation });
    }

    if (graded.length === 0) {
      return NextResponse.json(
        { error: 'No submitted answers matched questions for this language pair' },
        { status: 400 },
      );
    }

    const result = computePlacement(graded);

    // Persist to the learner's UserLanguage row if authenticated and enrolled.
    let saved = false;
    const userId = requireUserId(req);
    if (userId) {
      const upd = await prisma.userLanguage.updateMany({
        where: { userId, languageId: targetLanguageId },
        data: { currentLevel: result.level },
      });
      saved = upd.count > 0;
    }

    return NextResponse.json({
      ok: true,
      level: result.level,
      totalQuestions: result.totalQuestions,
      totalCorrect: result.totalCorrect,
      overallAccuracy: result.overallAccuracy,
      passThreshold: result.passThreshold,
      breakdown: result.breakdown,
      results: perQuestion,
      saved,
    });
  } catch (err) {
    console.error('[mobile/placement POST]', err);
    return apiError('Failed to score placement test');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}
