/**
 * GET /api/mobile/books/[id]
 *
 * Returns the FULL nested book payload that the Flutter BookReaderScreen needs:
 *
 *   Book {
 *     id, title, author, coverUrl, rating, category, description,
 *     preface, alphabet, guide,          ← book-level reader pages
 *     isOwned, isLocked, progress, lastReadPageIndex,   ← user-specific
 *     modules: [
 *       {
 *         id, title, orderIndex, isFreePreview,
 *         words:   [ { id, originalWord, transcription, pronunciation, translation, audioUrl } ],
 *         quizzes: [ { id, question, options, correctAnswerIndex } ],
 *       }
 *     ]
 *   }
 *
 * User identity: extracted from the `x-user-id` header (or `?userId=` param).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');
    const bookId = params.id;

    // ── Fetch the product with all modules and their pages ──────────────
    const product = await prisma.product.findUnique({
      where: { id: bookId },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            pages: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        bookChapters: {
          orderBy: { orderIndex: 'asc' },
          include: {
            vocabularyItems: { orderBy: { orderIndex: 'asc' } },
            dialogueLines: { orderBy: { orderIndex: 'asc' } }
          }
        }
      },
    });

    if (!product) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    // ── Fetch user-specific progress and VIP status ─────────────────────
    const [progress, user] = await Promise.all([
      prisma.userProgress.findUnique({
        where: { userId_productId: { userId, productId: bookId } },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { vipExpiresAt: true }
      })
    ]);

    const isVip = !!(user?.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now());

    let bookIsPurchased = false;
    let effectiveExpiresAt: string | null = null;

    if (progress?.isPurchased || progress?.isManualGrant) {
      if (!progress.expiresAt || new Date(progress.expiresAt).getTime() > Date.now()) {
        bookIsPurchased = true;
      }
    }

    if (isVip) {
      effectiveExpiresAt = user!.vipExpiresAt!.toISOString();
    } else if (bookIsPurchased && progress?.expiresAt) {
      effectiveExpiresAt = progress.expiresAt.toISOString();
    }

    const actuallyOwned = isVip || bookIsPurchased || product.isFree;

    // ── Shape modules — content is stored as a JSON string in SQLite ─────
    let modules = product.modules.map((mod) => {
      const vocabPage = mod.pages.find((p) => p.pageType === 'VOCAB');
      const quizPage  = mod.pages.find((p) => p.pageType === 'QUIZ');

      const parseContent = (raw: string | null | undefined) => {
        if (!raw) return {};
        try { return JSON.parse(raw) as Record<string, unknown>; }
        catch { return {}; }
      };

      const vocabContent = parseContent(vocabPage?.content as string | null);
      const quizContent  = parseContent(quizPage?.content  as string | null);

      return {
        id: mod.id,
        title: mod.title,
        orderIndex: mod.orderIndex,
        isFreePreview: mod.isFreePreview,
        words:   (vocabContent.words   as unknown[]) ?? [],
        quizzes: (quizContent.questions as unknown[]) ?? [],
      };
    });

    // ── FALLBACK FOR LEGACY DATA (If Product only has old BookChapters or empty modules) ──
    const hasAnyContent = modules.some(m => (m.words && m.words.length > 0) || (m.quizzes && m.quizzes.length > 0));
    if (!hasAnyContent && product.bookChapters && product.bookChapters.length > 0) {
      modules = product.bookChapters.map((chapter) => {
        const words = chapter.vocabularyItems.map(vi => ({
          id: vi.id,
          originalWord: vi.originalWord,
          transcription: vi.transcription ?? '',
          pronunciation: vi.pronunciationTajik ?? '',
          translation: vi.translationTajik ?? '',
          audioUrl: vi.audioUrl ?? ''
        }));
        return {
          id: chapter.id,
          title: chapter.title,
          orderIndex: chapter.orderIndex,
          isFreePreview: false,
          words: words,
          quizzes: [],
        };
      });
    }

    // ── JSON column parsers ────────────────────────────────────────────────
    const parseJsonArray = (raw: string | null | undefined) => {
      if (!raw) return [];
      try { return JSON.parse(raw) as unknown[]; }
      catch { return []; }
    };

    const parseJsonObject = (raw: string | null | undefined) => {
      if (!raw) return null;
      try { return JSON.parse(raw); }
      catch { return null; }
    };

    // ── Calculate rough progress ratio ────────────────────────────────────
    const totalPages = 4 + product.modules.length * 2;
    const lastReadPageIndex = progress?.lastReadPageIndex ?? 0;
    const progressRatio = totalPages > 0 ? Math.min(lastReadPageIndex / totalPages, 1.0) : 0;

    const response = {
      id: product.id,
      title: product.title,
      author: product.author,
      coverUrl: product.coverUrl ?? '',
      rating: product.rating,
      category: product.category ?? '',
      description: product.description ?? '',
      preface: product.preface ?? '',
      alphabet: parseJsonArray(product.alphabet as string | null),
      guide: product.guide ?? '',
      readingSteps: parseJsonArray(product.readingSteps as string | null),
      proTip: parseJsonObject(product.proTip as string | null),
      isOwned: actuallyOwned,
      isLocked: !actuallyOwned,
      expiresAt: effectiveExpiresAt, // For Flutter to potentially display
      progress: progressRatio,
      lastReadPageIndex,
      modules,
      pdfUrl: product.pdfUrl ?? null,
      previewPdfUrl: product.previewPdfUrl ?? null,
    };

    return Response.json(response);
  } catch (err) {
    console.error('[books/[id]]', err);
    return apiError('Failed to fetch book details');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
