import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { blockingIssues, countWords } from '@/lib/speaking/validateDb';

export const dynamic = 'force-dynamic';

/** Танҳо ду навъ: калима ё ҷумла — ҳарду дар як дарс зиста метавонанд. */
const KINDS = ['word', 'sentence'] as const;

/** Массиви сатр аз вуруди номаълум — сатрҳои холӣ партофта мешаванд. */
function toList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((v) => String(v).trim()).filter(Boolean).slice(0, 20);
}

/**
 * POST /api/admin/speaking/items — воҳиди нав ба дарс.
 * Body: { lessonId, text, translation, kind?, literal?, note?, audioUrl?,
 *          cue?, cueTranslation?, order? }
 *
 * `cue` = ҷумлаи ҳамсӯҳбат пеш аз навбати хонанда (қадами муколама).
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      lessonId?: string;
      text?: string;
      translation?: string;
      kind?: string;
      literal?: string;
      note?: string;
      audioUrl?: string;
      cue?: string;
      cueTranslation?: string;
      order?: number;
      chainOverride?: unknown;
      swaps?: unknown;
    };

    const text = (body.text ?? '').trim();
    const translation = (body.translation ?? '').trim();
    if (!body.lessonId || !text || !translation) {
      return NextResponse.json(
        { error: 'lessonId, text and translation are required' },
        { status: 400 },
      );
    }

    const kind = KINDS.includes(body.kind as any) ? body.kind! : 'sentence';

    // ── Валидатсия ПЕШ аз сабт (M3) ──────────────────────────────────────
    // Дарс ҳамчун ЯКБУТА санҷида мешавад: такрор, алифбо ва занҷир танҳо
    // дар заминаи ҳамсоягони худ маъно доранд.
    const issues = await blockingIssues(body.lessonId, {
      kind,
      text,
      translation,
      literal: body.literal ?? null,
      note: body.note ?? null,
      audioUrl: body.audioUrl ?? null,
      cue: body.cue ?? null,
      cueTranslation: body.cueTranslation ?? null,
    });
    if (issues.length > 0) {
      return NextResponse.json(
        { error: issues[0].message, issues },
        { status: 400 },
      );
    }

    const order =
      body.order ??
      (await prisma.speakingItem.count({
        where: { lessonId: body.lessonId },
      }));

    const item = await prisma.speakingItem.create({
      data: {
        lessonId: body.lessonId,
        kind,
        text,
        translation,
        wordCount: countWords(text),
        literal: body.literal?.trim() || null,
        note: body.note?.trim() || null,
        audioUrl: body.audioUrl?.trim() || null,
        cue: body.cue?.trim() || null,
        cueTranslation: body.cueTranslation?.trim() || null,
        chainOverride: toList(body.chainOverride),
        swaps: toList(body.swaps),
        order,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    console.error('[admin/speaking/items POST]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
