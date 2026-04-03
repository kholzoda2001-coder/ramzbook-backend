/**
 * GET /api/mobile/books/[id]/dictionary
 *
 * Returns ALL VocabularyItem records for every 'vocabulary' chapter
 * belonging to the given book (productId), flattened into a single array.
 *
 * Optional query parameter:
 *   ?search=<query>  — case-insensitive filter on originalWord OR translationTajik
 *
 * Response:
 * {
 *   "total": 42,
 *   "words": [
 *     {
 *       "id": "…",
 *       "chapterId": "…",
 *       "chapterTitle": "1. Салом ва Муошират",
 *       "originalWord": "Hallo",
 *       "transcription": "[ˈhalo]",
 *       "pronunciationTajik": "Халло",
 *       "translationTajik": "Салом",
 *       "audioUrl": null,
 *       "orderIndex": 0
 *     },
 *     …
 *   ]
 * }
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const bookId  = params.id;
    const search  = req.nextUrl.searchParams.get('search')?.trim() ?? '';

    // Fetch all vocabulary chapters for this book, with their items
    const chapters = await prisma.bookChapter.findMany({
      where: {
        productId: bookId,
        type: 'vocabulary',
      },
      orderBy: { orderIndex: 'asc' },
      include: {
        vocabularyItems: {
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    // Flatten all items into one list, attaching the parent chapter title
    let words = chapters.flatMap((ch) =>
      ch.vocabularyItems.map((item) => ({
        id:                item.id,
        chapterId:         item.chapterId,
        chapterTitle:      ch.title,
        originalWord:      item.originalWord,
        transcription:     item.transcription,
        pronunciationTajik: item.pronunciationTajik,
        translationTajik:  item.translationTajik,
        audioUrl:          item.audioUrl,
        orderIndex:        item.orderIndex,
      }))
    );

    // Optional server-side search filter
    if (search.length > 0) {
      const q = search.toLowerCase();
      words = words.filter(
        (w) =>
          w.originalWord.toLowerCase().includes(q) ||
          w.translationTajik.toLowerCase().includes(q)
      );
    }

    return Response.json({ total: words.length, words });
  } catch (err) {
    console.error('[books/[id]/dictionary]', err);
    return apiError('Failed to fetch dictionary.');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
