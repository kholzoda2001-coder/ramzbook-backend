import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, getUserId } from '@/lib/auth';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(
  req: NextRequest,
  { params }: { params: { bookId: string } }
) {
  try {
    const bookId = params.bookId;
    const userId = getUserId(req);

    if (!bookId) {
      return NextResponse.json({ error: 'Book ID is required' }, { status: 400, headers: corsHeaders });
    }

    const product = await prisma.product.findUnique({
      where: { id: bookId, isActive: true },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            pages: {
              select: { pageType: true, content: true },
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        // Legacy data fallback: if modules are empty, use BookChapter data
        bookChapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            vocabularyItems: { orderBy: { orderIndex: 'asc' } },
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Book not found' }, { status: 404, headers: corsHeaders });
    }

    let progress = null;
    if (userId !== 'guest') {
      progress = await prisma.userProgress.findUnique({
        where: { userId_productId: { userId, productId: bookId } },
      });
    }

    // ── Ownership check: supports both purchased and manually granted access ──
    const isBookAccessible = !!(progress?.isPurchased || progress?.isManualGrant);
    const isNotExpired = !progress?.expiresAt || new Date(progress.expiresAt).getTime() > Date.now();
    const userOwns = isBookAccessible && isNotExpired;

    const parseJsonArray = (raw: string | null | undefined): unknown[] => {
      if (!raw) return [];
      try { return JSON.parse(raw) as unknown[]; }
      catch { return []; }
    };
    
    const parseJsonObject = (raw: string | null | undefined) => {
      if (!raw) return null;
      try { return JSON.parse(raw); }
      catch { return null; }
    };

    const parsePageContent = (raw: string | null | undefined): Record<string, unknown> => {
      if (!raw) return {};
      try { return JSON.parse(raw) as Record<string, unknown>; }
      catch { return {}; }
    };

    // Compute realistic total pages based on what the book actually has
    const introPageCount =
      (product.preface   ? 1 : 0) +
      (product.alphabet  ? 1 : 0) +
      (product.guide     ? 1 : 0);
    const totalPages = introPageCount + product.modules.length * 2;
    const lastReadPageIndex = progress?.lastReadPageIndex ?? 0;
    const progressRatio = totalPages > 0 ? Math.min(lastReadPageIndex / totalPages, 1.0) : 0;

    // ── Map new-style Module/Page data ──────────────────────────────────────
    let modules = product.modules.map((m) => {
      const vocabPage    = m.pages.find((p) => p.pageType === 'VOCAB');
      const quizPage     = m.pages.find((p) => p.pageType === 'QUIZ');
      const vocabContent = parsePageContent(vocabPage?.content);
      const quizContent  = parsePageContent(quizPage?.content);

      const words = Array.isArray(vocabContent.words)
        ? (vocabContent.words as Record<string, unknown>[]).map((w, i) => ({
            id: w['id'] ?? `${m.id}_w${i}`,
            originalWord: w['originalWord'] ?? w['word'] ?? '',
            transcription: w['transcription'] ?? w['transcriptionEn'] ?? '',
            pronunciation: w['pronunciation'] ?? w['transcriptionTj'] ?? '',
            translation: w['translation'] ?? '',
            audioUrl: w['audioUrl'] ?? null,
            exampleSentence: w['exampleSentence'] ?? w['exampleEn'] ?? '',
            exampleTranslation: w['exampleTranslation'] ?? w['exampleTj'] ?? '',
          }))
        : [];

      const rawQuestions = Array.isArray(quizContent.questions)
        ? (quizContent.questions as Record<string, unknown>[])
        : Array.isArray(quizContent.quizzes)
          ? (quizContent.quizzes as Record<string, unknown>[])
          : [];

      const quizzes = rawQuestions.map((q, i) => ({
        id: q['id'] ?? `${m.id}_q${i}`,
        question: q['question'] ?? '',
        options: Array.isArray(q['options']) ? q['options'] : [],
        correctAnswerIndex: (q['correctAnswerIndex'] as number) ?? 0,
      }));

      return {
        id: m.id,
        title: m.title,
        orderIndex: m.orderIndex,
        isFreePreview: m.isFreePreview,
        words,
        quizzes,
        _count: { words: words.length, quizzes: quizzes.length },
      };
    });

    // ── FALLBACK: if all modules are empty, load legacy BookChapter data ──
    const hasContent = modules.some(m => m.words.length > 0 || m.quizzes.length > 0);
    if (!hasContent && product.bookChapters && product.bookChapters.length > 0) {
      modules = product.bookChapters.map((chapter) => ({
        id: chapter.id,
        title: chapter.title,
        orderIndex: chapter.orderIndex,
        isFreePreview: false,
        words: chapter.vocabularyItems.map((vi) => ({
          id: vi.id,
          originalWord: vi.originalWord,
          transcription: vi.transcription ?? '',
          pronunciation: vi.pronunciationTajik ?? '',
          translation: vi.translationTajik ?? '',
          audioUrl: vi.audioUrl ?? null,
          exampleSentence: '',
          exampleTranslation: '',
        })),
        quizzes: [],
        _count: { words: chapter.vocabularyItems.length, quizzes: 0 },
      }));
    }

    const response = {
      id: product.id,
      title: product.title,
      author: product.author,
      coverUrl: product.coverUrl ?? '',
      rating: product.rating,
      category: product.category ?? '',
      description: product.description ?? '',
      languageCode: product.languageCode ?? 'en-US',
      preface: product.preface ?? '',
      alphabet: parseJsonArray(product.alphabet as string | null),
      guide: product.guide ?? '',
      readingSteps: parseJsonArray(product.readingSteps as string | null),
      proTip: parseJsonObject(product.proTip as string | null),
      isOwned: userOwns || product.isFree,
      isLocked: !(userOwns || product.isFree),
      isFree: product.isFree,
      priceSixMonths: product.priceSixMonths,
      priceLifetime: product.priceLifetime,
      pdfUrl: product.pdfUrl ?? null,
      previewPdfUrl: product.previewPdfUrl ?? null,
      progress: progressRatio,
      lastReadPageIndex,
      modules,
    };

    return NextResponse.json(response, { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error('[GET /api/books/[bookId]]', err);
    return apiError('Failed to fetch book details');
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}
