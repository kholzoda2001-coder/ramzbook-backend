import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Admin CRUD for alphabet rules — the short pronunciation/spelling notes shown
// above the letter grid in the app. Mirrors app/api/admin/alphabet/route.ts.
// `category` is one of: "vowel" | "consonant" | "general".

function apiError(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetId = searchParams.get('targetLanguageId');
    const nativeId = searchParams.get('nativeLanguageId');

    if (!targetId || !nativeId) return apiError('Missing language IDs', 400);

    const rules = await prisma.alphabetRule.findMany({
      where: { targetLanguageId: targetId, nativeLanguageId: nativeId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ rules });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { targetLanguageId, nativeLanguageId, category, title, body: ruleBody, order } = body;

    if (!targetLanguageId || !nativeLanguageId || !category || !title || !ruleBody) {
      return apiError('Missing required fields', 400);
    }

    const rule = await prisma.alphabetRule.create({
      data: {
        targetLanguageId,
        nativeLanguageId,
        category,
        title,
        body: ruleBody,
        order: order ?? 0,
      },
    });

    return NextResponse.json({ rule });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, category, title, body: ruleBody, order } = body;

    if (!id) return apiError('Missing id', 400);

    // Partial update — only touch fields actually present in the body.
    const data: Record<string, unknown> = {};
    if (category !== undefined) data.category = category;
    if (title !== undefined) data.title = title;
    if (ruleBody !== undefined) data.body = ruleBody;
    if (order !== undefined) data.order = order ?? 0;

    const updated = await prisma.alphabetRule.update({ where: { id }, data });

    return NextResponse.json({ rule: updated });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const id = searchParams.get('id');
    if (!id) return apiError('Missing id', 400);

    await prisma.alphabetRule.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return apiError(error.message, 500);
  }
}
