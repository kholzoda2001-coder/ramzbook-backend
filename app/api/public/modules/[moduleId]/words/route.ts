/**
 * GET /api/public/modules/[moduleId]/words
 *
 * Legacy endpoint consumed by the existing Flutter wordsProvider.
 * Returns { words: [...], quizzes: [...] } — shape matches Word.fromJson()
 * and Quiz.fromJson().
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

export async function GET(
  _req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    const pages = await prisma.page.findMany({
      where: { moduleId: params.moduleId },
      orderBy: { orderIndex: 'asc' },
    });

    const vocabPage = pages.find((p) => p.pageType === 'VOCAB');
    const quizPage  = pages.find((p) => p.pageType === 'QUIZ');

    const parse = (raw: string | null | undefined) => {
      if (!raw) return {};
      try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
    };

    const vocabContent = parse(vocabPage?.content as string | null);
    const quizContent  = parse(quizPage?.content  as string | null);

    return Response.json({
      words:   (vocabContent.words    as unknown[]) ?? [],
      quizzes: (quizContent.questions as unknown[]) ?? [],
    });
  } catch (err) {
    console.error('[public/modules/[moduleId]/words]', err);
    return apiError('Failed to fetch words');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
