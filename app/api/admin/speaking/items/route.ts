import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** Танҳо ду навъ: калима ё ҷумла — ҳарду дар як категория зиста метавонанд. */
const KINDS = ['word', 'sentence'] as const;

/**
 * POST /api/admin/speaking/items — воҳиди нав ба категория.
 * Body: { categoryId, text, translation, kind?, literal?, note?, audioUrl?, order? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      categoryId?: string;
      text?: string;
      translation?: string;
      kind?: string;
      literal?: string;
      note?: string;
      audioUrl?: string;
      order?: number;
    };

    const text = (body.text ?? '').trim();
    const translation = (body.translation ?? '').trim();
    if (!body.categoryId || !text || !translation) {
      return NextResponse.json(
        { error: 'categoryId, text and translation are required' },
        { status: 400 },
      );
    }

    const kind = KINDS.includes(body.kind as any) ? body.kind! : 'sentence';

    const order =
      body.order ??
      (await prisma.speakingItem.count({
        where: { categoryId: body.categoryId },
      }));

    const item = await prisma.speakingItem.create({
      data: {
        categoryId: body.categoryId,
        kind,
        text,
        translation,
        literal: body.literal?.trim() || null,
        note: body.note?.trim() || null,
        audioUrl: body.audioUrl?.trim() || null,
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
