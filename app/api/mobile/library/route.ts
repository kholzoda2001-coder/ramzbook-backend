/**
 * GET /api/mobile/library
 *
 * Returns the books purchased / owned by the current user, enriched with
 * their reading progress.  Powers the "My Books" and "Continue Reading"
 * sections on the HomeScreen.
 *
 * User identity: extracted from the `x-user-id` header (or `?userId=` param).
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized, apiError } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { vipExpiresAt: true }
    });

    const isVip = !!(user?.vipExpiresAt && new Date(user.vipExpiresAt).getTime() > Date.now());

    let library = [];

    if (isVip) {
      // User is VIP: return all active books
      const [products, allProgress] = await Promise.all([
        prisma.product.findMany({
          where: { isActive: true },
          select: {
            id: true, title: true, author: true, coverUrl: true, description: true, category: true, rating: true, isFree: true, languageCode: true, pdfUrl: true, previewPdfUrl: true,
            modules: {
              orderBy: { orderIndex: 'asc' },
              include: { pages: { orderBy: { orderIndex: 'asc' } } }
            },
            bookChapters: {
              orderBy: { orderIndex: 'asc' },
              include: { vocabularyItems: { orderBy: { orderIndex: 'asc' } }, dialogueLines: { orderBy: { orderIndex: 'asc' } } }
            }
          }
        }),
        prisma.userProgress.findMany({ where: { userId } })
      ]);
      const progMap = new Map(allProgress.map(p => [p.productId, p.lastReadPageIndex]));

      library = products.map((p) => {
        const lastRead = progMap.get(p.id) ?? 0;
        return {
          ...p,
          isOwned: true,
          isLocked: false,
          expiresAt: user!.vipExpiresAt!.toISOString(),
          progress: calculateProgress(lastRead, p.modules.length > 0 ? p.modules.length : p.bookChapters.length),
          lastReadPageIndex: lastRead,
          modules: formatModules(p as any),
        };
      });
    } else {
      // Not VIP: return organically/manually purchased books that haven't expired
      const progressRecords = await prisma.userProgress.findMany({
        where: { 
          userId, 
          OR: [
            { isPurchased: true },
            { isManualGrant: true }
          ],
          AND: [
            {
              OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
              ]
            }
          ]
        },
        include: {
          product: {
            select: {
              id: true,
              title: true,
              author: true,
              coverUrl: true,
              description: true,
              category: true,
              languageCode: true,
              rating: true,
              isFree: true,
              pdfUrl: true,
              previewPdfUrl: true,
              modules: {
                orderBy: { orderIndex: 'asc' },
                include: { pages: { orderBy: { orderIndex: 'asc' } } }
              },
              bookChapters: {
                orderBy: { orderIndex: 'asc' },
                include: { vocabularyItems: { orderBy: { orderIndex: 'asc' } }, dialogueLines: { orderBy: { orderIndex: 'asc' } } }
              }
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      library = progressRecords.map((p) => ({
        ...p.product,
        isOwned: true,
        isLocked: false,
        expiresAt: p.expiresAt?.toISOString() ?? null,
        progress: calculateProgress(p.lastReadPageIndex, p.product.modules.length > 0 ? p.product.modules.length : p.product.bookChapters.length),
        lastReadPageIndex: p.lastReadPageIndex,
        modules: formatModules(p.product as any),
      }));
    }

    return Response.json(library);
  } catch (err) {
    console.error('[library]', err);
    return apiError('Failed to fetch library');
  }
}

/**
 * Rough progress ratio: 4 fixed pages (TOC/Preface/Alphabet/Guide) +
 * 2 pages per module (VOCAB + QUIZ).
 */
function calculateProgress(lastPageIndex: number, moduleCount: number): number {
  const totalPages = 4 + moduleCount * 2;
  if (totalPages === 0) return 0;
  return Math.min(lastPageIndex / totalPages, 1.0);
}

function formatModules(product: any) {
  let modules = (product.modules || []).map((mod: any) => {
    const vocabPage = mod.pages.find((p: any) => p.pageType === 'VOCAB');
    const quizPage  = mod.pages.find((p: any) => p.pageType === 'QUIZ');

    const parseContent = (raw: string | null | undefined) => {
      if (!raw) return {};
      try { return JSON.parse(raw); } catch { return {}; }
    };

    const vocabContent = parseContent(vocabPage?.content);
    const quizContent  = parseContent(quizPage?.content);

    return {
      id: mod.id,
      title: mod.title,
      orderIndex: mod.orderIndex,
      isFreePreview: mod.isFreePreview,
      words:   vocabContent.words ?? [],
      quizzes: quizContent.questions ?? [],
    };
  });

  const hasAnyContent = modules.some((m: any) => (m.words && m.words.length > 0) || (m.quizzes && m.quizzes.length > 0));
  if (!hasAnyContent && product.bookChapters && product.bookChapters.length > 0) {
    modules = product.bookChapters.map((chapter: any) => {
      const words = chapter.vocabularyItems.map((vi: any) => ({
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

  return modules;
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
