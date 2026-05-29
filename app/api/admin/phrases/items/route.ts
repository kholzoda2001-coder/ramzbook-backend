import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** POST /api/admin/phrases/items — add a phrase to a collection.
 *  Body: { collectionId, text, translation, literal?, note?, audioUrl?, order? } */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      collectionId?: string; text?: string; translation?: string;
      literal?: string; note?: string; audioUrl?: string; order?: number;
    };
    const text = (body.text ?? '').trim();
    const translation = (body.translation ?? '').trim();
    if (!body.collectionId || !text || !translation) {
      return NextResponse.json({ error: 'collectionId, text and translation are required' }, { status: 400 });
    }
    const order = body.order ?? (await prisma.phrase.count({ where: { collectionId: body.collectionId } }));
    const phrase = await prisma.phrase.create({
      data: {
        collectionId: body.collectionId,
        text,
        translation,
        literal: body.literal?.trim() || null,
        note: body.note?.trim() || null,
        audioUrl: body.audioUrl?.trim() || null,
        order,
      },
    });
    return NextResponse.json({ success: true, phrase });
  } catch (err: any) {
    console.error('[admin/phrases/items POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
