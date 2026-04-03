import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { moduleId: string } }
) {
  try {
    if (!params.moduleId) {
      return NextResponse.json({ error: 'Module ID is required' }, { status: 400, headers: corsHeaders });
    }

    const pages = await prisma.page.findMany({
      where: { moduleId: params.moduleId },
      orderBy: { orderIndex: 'asc' },
    });

    const vocabPage = pages.find((p) => p.pageType === 'VOCAB');
    const quizPage  = pages.find((p) => p.pageType === 'QUIZ');

    const parseContent = (raw: string | null | undefined) => {
      if (!raw) return {};
      try { return JSON.parse(raw) as Record<string, unknown>; } catch { return {}; }
    };

    const vocabContent = parseContent(vocabPage?.content);
    const quizContent  = parseContent(quizPage?.content);

    return NextResponse.json({
      words:   (vocabContent.words    as unknown[]) ?? [],
      quizzes: (quizContent.questions as unknown[]) ?? [],
    }, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[GET /api/modules/[moduleId]]', err);
    return apiError('Failed to fetch module details');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
