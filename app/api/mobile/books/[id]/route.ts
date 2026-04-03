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
      },
    });

    if (!product) {
      return Response.json({ error: 'Book not found' }, { status: 404 });
    }

    // ── Fetch user-specific progress (may not exist yet) ─────────────────
    const progress = await prisma.userProgress.findUnique({
      where: { userId_productId: { userId, productId: bookId } },
    });

    // ── Shape modules — content is stored as a JSON string in SQLite ─────
    const modules = product.modules.map((mod) => {
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

    // ── alphabet is also stored as a JSON string in SQLite ────────────────
    const parseAlphabet = (raw: string | null | undefined) => {
      if (!raw) return [];
      try { return JSON.parse(raw) as unknown[]; }
      catch { return []; }
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
      alphabet: parseAlphabet(product.alphabet as string | null),
      guide: product.guide ?? '',
      isOwned: progress?.isPurchased ?? product.isFree,
      isLocked: !(progress?.isPurchased ?? product.isFree),
      progress: progressRatio,
      lastReadPageIndex,
      modules,
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
