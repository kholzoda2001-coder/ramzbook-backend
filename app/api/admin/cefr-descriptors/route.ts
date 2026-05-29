import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { normalizeCefrLevel, isDescriptorSkill } from '@/lib/cefr';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/cefr-descriptors?targetLanguageId=X&nativeLanguageId=Y
 * Lists the "can-do" descriptors for a language pair (or all if no filter).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetLanguageId = searchParams.get('targetLanguageId') || undefined;
    const nativeLanguageId = searchParams.get('nativeLanguageId') || undefined;

    const descriptors = await prisma.cefrDescriptor.findMany({
      where: { targetLanguageId, nativeLanguageId },
      orderBy: [{ cefrLevel: 'asc' }, { order: 'asc' }],
      include: {
        targetLanguage: { select: { flag: true, name: true } },
        nativeLanguage: { select: { flag: true, nativeName: true } },
      },
    });
    return NextResponse.json({ descriptors });
  } catch (err: any) {
    console.error('[admin/cefr-descriptors GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/cefr-descriptors
 * Body: { targetLanguageId, nativeLanguageId, cefrLevel, skill, canDo, order }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      targetLanguageId?: string;
      nativeLanguageId?: string;
      cefrLevel?: string;
      skill?: string;
      canDo?: string;
      order?: number;
    };

    const level = normalizeCefrLevel(body.cefrLevel);
    const canDo = (body.canDo ?? '').trim();
    if (!body.targetLanguageId || !body.nativeLanguageId || !level || !canDo) {
      return NextResponse.json(
        { error: 'targetLanguageId, nativeLanguageId, valid cefrLevel and canDo are required' },
        { status: 400 }
      );
    }

    const descriptor = await prisma.cefrDescriptor.create({
      data: {
        targetLanguageId: body.targetLanguageId,
        nativeLanguageId: body.nativeLanguageId,
        cefrLevel: level,
        skill: isDescriptorSkill(body.skill) ? body.skill : 'overall',
        canDo,
        order: body.order ?? 0,
      },
    });
    return NextResponse.json({ success: true, descriptor });
  } catch (err: any) {
    console.error('[admin/cefr-descriptors POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
