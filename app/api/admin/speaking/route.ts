import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Категорияҳои «Устоди AI · Speaking».
 *
 * Категорияҳо ба ҶУФТИ ЗАБОН (омӯзиш ← модарӣ) бастаанд, НА ба курс ва НА ба
 * сатҳ — бинобар ин ин ҷо `courseId`/`cefrLevel` нест. Тартиб (`order`)
 * душвориро муайян мекунад, айнан мисли бобҳои Falou.
 */

/**
 * GET /api/admin/speaking?targetLanguageId=&nativeLanguageId=
 * → категорияҳо бо шумораи воҳидҳо.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const targetLanguageId = searchParams.get('targetLanguageId') || undefined;
    const nativeLanguageId = searchParams.get('nativeLanguageId') || undefined;

    const categories = await prisma.speakingCategory.findMany({
      where: { targetLanguageId, nativeLanguageId },
      orderBy: [
        { targetLanguageId: 'asc' },
        { nativeLanguageId: 'asc' },
        { order: 'asc' },
      ],
      include: {
        _count: { select: { items: true } },
        targetLanguage: { select: { id: true, flag: true, name: true } },
        nativeLanguage: { select: { id: true, flag: true, nativeName: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (err: any) {
    console.error('[admin/speaking GET]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/speaking — категорияи нав.
 * Body: { targetLanguageId, nativeLanguageId, title, titleTranslated?,
 *         scenario?, emoji?, order?, isPremium? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      targetLanguageId?: string;
      nativeLanguageId?: string;
      title?: string;
      titleTranslated?: string;
      scenario?: string;
      emoji?: string;
      order?: number;
      isPremium?: boolean;
    };

    const title = (body.title ?? '').trim();
    if (!body.targetLanguageId || !body.nativeLanguageId || !title) {
      return NextResponse.json(
        {
          error:
            'targetLanguageId, nativeLanguageId and title are required',
        },
        { status: 400 },
      );
    }

    // Тартиби нав = дар охири ҳамин ҷуфти забон.
    const order =
      body.order ??
      (await prisma.speakingCategory.count({
        where: {
          targetLanguageId: body.targetLanguageId,
          nativeLanguageId: body.nativeLanguageId,
        },
      }));

    const category = await prisma.speakingCategory.create({
      data: {
        targetLanguageId: body.targetLanguageId,
        nativeLanguageId: body.nativeLanguageId,
        title,
        titleTranslated: (body.titleTranslated ?? title).trim(),
        scenario: body.scenario?.trim() || null,
        emoji: body.emoji?.trim() || '🎙️',
        order,
        isPremium: body.isPremium ?? false,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    console.error('[admin/speaking POST]', err);
    return NextResponse.json(
      { error: err?.message ?? 'Server error' },
      { status: 500 },
    );
  }
}
