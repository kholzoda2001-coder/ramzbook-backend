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
  exampleTrans?: string;
  exampleTj?: string;
  exampleEn?: string;
  audioUrl?: string;
}

/**
 * POST /api/admin/words/bulk
 * Body: { lessonId: string, words: BulkWord[], mode?: 'append' | 'replace' }
 *
 * Words attach directly to the lesson (1:N). Atomic via a single transaction.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, words, mode = 'append' } = body as {
      lessonId: string;
      words: BulkWord[];
      mode?: 'append' | 'replace';
    };

    if (!lessonId || typeof lessonId !== 'string') {
      return NextResponse.json({ error: 'lessonId is required' }, { status: 400 });
    }
    if (!Array.isArray(words) || words.length === 0) {
      return NextResponse.json({ error: 'words array is required and must not be empty' }, { status: 400 });
    }
    if (words.length > 2000) {
      return NextResponse.json({ error: 'Too many words. Split into batches of ≤ 2 000.' }, { status: 400 });
    }

    const clean = words.filter(w => (w.word ?? '').trim() || (w.translation ?? '').trim());
    if (clean.length === 0) {
      return NextResponse.json({ error: 'All rows are empty (no word or translation).' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const lesson = await tx.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
      if (!lesson) throw new Error(`Lesson "${lessonId}" not found`);

      if (mode === 'replace') {
        await tx.word.deleteMany({ where: { lessonId } });
      }

      let maxOrder = 0;
      if (mode === 'append') {
        const last = await tx.word.findFirst({ where: { lessonId }, orderBy: { order: 'desc' } });
        maxOrder = last?.order ?? 0;
      }

      const data = clean.map((w, i) => {
        const wordText = (w.word ?? '').trim();
        const translation = (w.translation ?? '').trim();
        return {
          lessonId,
          word: wordText || translation,
          translation: translation || wordText,
          ipa: (w.ipa ?? w.transcriptionEn ?? '').trim() || null,
          emoji: (w.emoji ?? '').trim() || null,
          example: (w.example ?? w.exampleEn ?? '').trim() || null,
          exampleTrans: (w.exampleTrans ?? w.exampleTj ?? '').trim() || null,
          audioUrl: (w.audioUrl ?? '').trim() || null,
          difficulty: 1,
          order: maxOrder + i + 1,
        };
      });

      await tx.word.createMany({ data });

      const total = await tx.word.count({ where: { lessonId } });
      return { inserted: data.length, total };
    });

    return NextResponse.json({ success: true, inserted: result.inserted, total: result.total });
  } catch (err: any) {
    console.error('[bulk-import]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error during bulk import' }, { status: 500 });
  }
}
