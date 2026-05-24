import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Accepted word shape from the client */
export interface BulkWord {
  emoji?: string;
  word: string;
  translation?: string;
  ipa?: string;
  transcriptionEn?: string;
  example?: string;
  exampleTranslation?: string;
  exampleTj?: string;
  exampleEn?: string;
  audioUrl?: string;
}

/**
 * POST /api/admin/words/bulk
 * Body: { lessonId: string, words: BulkWord[], mode?: 'append' | 'replace' }
 *
 * Creates Word records in the database and links them to the specified lesson.
 * Uses a single Prisma transaction so the write is atomic.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, words, mode = 'append' } = body as {
      lessonId: string;
      words: BulkWord[];
      mode?: 'append' | 'replace';
    };

    // ── Validation ────────────────────────────────────────────────────────────
    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }
    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'words array is required and must not be empty' }, { status: 400 });
    }
    if (words.length > 2000) {
      return NextResponse.json(
        { error: 'Too many words. Split into batches of ≤ 2 000.' },
        { status: 400 }
      );
    }

    // Filter out blank rows
    const clean = words.filter(w => (w.word ?? '').trim() || (w.translation ?? '').trim());
    if (clean.length === 0) {
      return NextResponse.json({ error: 'All rows are empty (no word or translation).' }, { status: 400 });
    }

    // ── Database transaction ────────────────────────────────────────────────
    const result = await prisma.$transaction(async (tx) => {
      // Verify the lesson exists
      const lesson = await tx.lesson.findUnique({
        where: { id: lessonId },
        include: { unit: { include: { course: { include: { language: true } } } } }
      });
      if (!lesson) throw new Error(`Lesson "${lessonId}" not found`);

      const langFrom = lesson.unit.course.language.code ?? 'en';
      const langTo = 'tg'; // default target language

      // If replace mode, remove all existing words from this lesson
      if (mode === 'replace') {
        await tx.lessonWord.deleteMany({ where: { lessonId } });
      }

      // Get current max sortOrder for append mode
      let maxOrder = 0;
      if (mode === 'append') {
        const last = await tx.lessonWord.findFirst({
          where: { lessonId },
          orderBy: { sortOrder: 'desc' },
        });
        maxOrder = last?.sortOrder ?? 0;
      }

      let insertedCount = 0;
      for (let i = 0; i < clean.length; i++) {
        const w = clean[i];
        const wordText = (w.word ?? '').trim();
        const translation = (w.translation ?? '').trim();
        if (!wordText && !translation) continue;

        // Create or reuse the word
        const word = await tx.word.create({
          data: {
            langFrom,
            langTo,
            word: wordText || translation,
            translation: translation || wordText,
            ipa: (w.ipa ?? w.transcriptionEn ?? '').trim() || null,
            emoji: (w.emoji ?? '').trim() || null,
            example: (w.example ?? w.exampleEn ?? '').trim() || null,
            exampleTranslation: (w.exampleTranslation ?? w.exampleTj ?? '').trim() || null,
            audioUrl: (w.audioUrl ?? '').trim() || null,
            difficulty: 1,
          },
        });

        await tx.lessonWord.create({
          data: {
            lessonId,
            wordId: word.id,
            sortOrder: maxOrder + i + 1,
          },
        });
        insertedCount++;
      }

      const total = await tx.lessonWord.count({ where: { lessonId } });
      return { inserted: insertedCount, total };
    });

    return NextResponse.json({
      success: true,
      inserted: result.inserted,
      total: result.total,
    });
  } catch (err: any) {
    console.error('[bulk-import]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error during bulk import' },
      { status: 500 }
    );
  }
}
