import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/** GET /api/admin/ui-translations?languageId=X — all key/value rows for a language */
export async function GET(req: NextRequest) {
  try {
    const languageId = req.nextUrl.searchParams.get('languageId');
    if (!languageId) {
      return NextResponse.json({ error: 'languageId is required' }, { status: 400 });
    }
    const rows = await prisma.uiTranslation.findMany({
      where: { languageId },
      orderBy: { key: 'asc' },
    });
    return NextResponse.json({ translations: rows });
  } catch (err: any) {
    console.error('[admin/ui-translations GET]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** POST /api/admin/ui-translations — upsert one key. Body: { languageId, key, value } */
export async function POST(req: NextRequest) {
  try {
    const { languageId, key, value } = await req.json() as {
      languageId?: string; key?: string; value?: string;
    };
    if (!languageId || !key) {
      return NextResponse.json({ error: 'languageId and key are required' }, { status: 400 });
    }
    const row = await prisma.uiTranslation.upsert({
      where: { languageId_key: { languageId, key } },
      create: { languageId, key, value: value ?? '' },
      update: { value: value ?? '' },
    });
    return NextResponse.json({ success: true, translation: row });
  } catch (err: any) {
    console.error('[admin/ui-translations POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}

/** DELETE /api/admin/ui-translations?languageId=X&key=Y */
export async function DELETE(req: NextRequest) {
  try {
    const languageId = req.nextUrl.searchParams.get('languageId');
    const key = req.nextUrl.searchParams.get('key');
    if (!languageId || !key) {
      return NextResponse.json({ error: 'languageId and key are required' }, { status: 400 });
    }
    await prisma.uiTranslation.delete({ where: { languageId_key: { languageId, key } } });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[admin/ui-translations DELETE]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
