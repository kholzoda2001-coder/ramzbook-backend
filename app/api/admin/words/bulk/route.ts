import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Accepted word shape from the client */
export interface BulkWord {
  emoji?: string;
  word: string;
  translation?: string;
  trans_TJ?: string;
  trans_EN?: string;
  transcriptionEn?: string;
  transcriptionTj?: string;
  exampleEn?: string;
  exampleTj?: string;
  example?: string;
  exampleTranslation?: string;
  audioUrl?: string;
}

/**
 * POST /api/admin/words/bulk
 * Body: { moduleId: string, words: BulkWord[], mode?: 'append' | 'replace' }
 *
 * Merges incoming words into the module's VOCAB Page content JSON.
 * Uses a single Prisma transaction so the write is atomic.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { moduleId, words, mode = 'append' } = body as {
      moduleId: string;
      words: BulkWord[];
      mode?: 'append' | 'replace';
    };

    // ── Validation ────────────────────────────────────────────────────────────
    if (!moduleId || typeof moduleId !== 'string') {
      return NextResponse.json({ error: 'moduleId is required' }, { status: 400 });
    }
    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'words array is required and must not be empty' }, { status: 400 });
    }
    // At most 2 000 words per request to avoid timeout
    if (words.length > 2000) {
      return NextResponse.json(
        { error: 'Too many words. Split into batches of ≤ 2 000.' },
        { status: 400 }
      );
    }

    // ── Normalise incoming rows ───────────────────────────────────────────────
    const normalised = words.map((w, i) => ({
      id: `bulk-${Date.now()}-${i}`,
      emoji:              w.emoji?.trim()              || '💬',
      word:               (w.word ?? '').trim(),
      translation:        (w.translation ?? '').trim(),
      trans_TJ:           (w.trans_TJ ?? '').trim(),
      trans_EN:           (w.trans_EN ?? '').trim(),
      transcriptionEn:    (w.transcriptionEn ?? '').trim(),
      transcriptionTj:    (w.transcriptionTj ?? '').trim(),
      exampleEn:          (w.exampleEn ?? '').trim(),
      exampleTj:          (w.exampleTj ?? '').trim(),
      example:            (w.example ?? '').trim(),
      exampleTranslation: (w.exampleTranslation ?? '').trim(),
      audio:              null,          // files are not sent over JSON
    }));

    // Filter out blank rows (no word and no translation)
    const clean = normalised.filter(w => w.word || w.translation);

    if (clean.length === 0) {
      return NextResponse.json({ error: 'All rows are empty (no word or translation).' }, { status: 400 });
    }

    // ── Database transaction ────────────────────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // Verify the module exists
      const mod = await tx.module.findUnique({ where: { id: moduleId } });
      if (!mod) throw new Error(`Module "${moduleId}" not found`);

      // Find existing VOCAB page for this module
      let vocabPage = await tx.page.findFirst({
        where: { moduleId, pageType: 'VOCAB' },
      });

      let existingWords: object[] = [];

      if (vocabPage) {
        // Parse existing content
        try {
          const parsed = JSON.parse(vocabPage.content);
          existingWords = Array.isArray(parsed?.words) ? parsed.words : [];
        } catch {
          existingWords = [];
        }
      }

      const merged = mode === 'replace' ? clean : [...existingWords, ...clean];
      const newContent = JSON.stringify({ words: merged });

      if (vocabPage) {
        vocabPage = await tx.page.update({
          where: { id: vocabPage.id },
          data: { content: newContent, updatedAt: new Date() },
        });
      } else {
        // Create brand-new VOCAB page
        vocabPage = await tx.page.create({
          data: {
            moduleId,
            pageType: 'VOCAB',
            orderIndex: 0,
            content: newContent,
          },
        });
      }

      return { pageId: vocabPage.id, inserted: clean.length, total: merged.length };
    });

    return NextResponse.json({
      success: true,
      inserted: result.inserted,
      total: result.total,
      pageId: result.pageId,
    });
  } catch (err: any) {
    console.error('[bulk-import]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error during bulk import' },
      { status: 500 }
    );
  }
}
