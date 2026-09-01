import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { blockingIssues, countWords } from '@/lib/speaking/validateDb';

export const dynamic = 'force-dynamic';

const KINDS = ['word', 'sentence'] as const;

function toList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((v) => String(v).trim()).filter(Boolean).slice(0, 20);
}

/** PUT /api/admin/speaking/items/:id */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await req.json();

    // Валидатсия ПЕШ аз навсозӣ — ҳамон қоидаҳои сабти нав (M3).
    const current = await prisma.speakingItem.findUnique({
      where: { id: params.id },
      select: {
        lessonId: true, kind: true, text: true, translation: true,
        literal: true, note: true, audioUrl: true, cue: true, cueTranslation: true,
      },
    });
    if (!current) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const nextText = body.text !== undefined ? String(body.text).trim() : current.text;
    const issues = await blockingIssues(current.lessonId, {
      id: params.id,
      kind: KINDS.includes(body.kind) ? body.kind : current.kind,
      text: nextText,
      translation:
        body.translation !== undefined ? String(body.translation).trim() : current.translation,
      literal: body.literal !== undefined ? body.literal : current.literal,
      note: body.note !== undefined ? body.note : current.note,
      audioUrl: body.audioUrl !== undefined ? body.audioUrl : current.audioUrl,
      cue: body.cue !== undefined ? body.cue : current.cue,
      cueTranslation:
        body.cueTranslation !== undefined ? body.cueTranslation : current.cueTranslation,
    });
    if (issues.length > 0) {
      return NextResponse.json({ error: issues[0].message, issues }, { status: 400 });
    }

    const updated = await prisma.speakingItem.update({
      where: { id: params.id },
      data: {
        ...(body.text !== undefined && {
          text: body.text.trim(),
          wordCount: countWords(body.text),
        }),
        ...(body.translation !== undefined && {
          translation: body.translation.trim(),
        }),
        ...(KINDS.includes(body.kind) && { kind: body.kind }),
        ...(body.literal !== undefined && {
          literal: body.literal?.trim() || null,
        }),
        ...(body.note !== undefined && { note: body.note?.trim() || null }),
        ...(body.audioUrl !== undefined && {
          audioUrl: body.audioUrl?.trim() || null,
        }),
        ...(body.cue !== undefined && { cue: body.cue?.trim() || null }),
        ...(body.cueTranslation !== undefined && {
          cueTranslation: body.cueTranslation?.trim() || null,
        }),
        ...(body.order !== undefined && { order: body.order }),
        ...(body.chainOverride !== undefined && { chainOverride: toList(body.chainOverride) }),
        ...(body.swaps !== undefined && { swaps: toList(body.swaps) }),
      },
    });
    return NextResponse.json({ success: true, item: updated });
  } catch (err: any) {
    console.error('[admin/speaking/items PUT]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}

/** DELETE /api/admin/speaking/items/:id */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await prisma.speakingItem.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/speaking/items DELETE]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
