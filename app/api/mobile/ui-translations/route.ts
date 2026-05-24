import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/ui-translations?languageId=XXX  (or ?code=tg)
 * Returns a flat { key: value } map of all UI strings for the language.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const languageId = searchParams.get('languageId');
    const code = searchParams.get('code');

    if (!languageId && !code) {
      return NextResponse.json({ error: 'languageId or code is required' }, { status: 400 });
    }

    const language = languageId
      ? { id: languageId }
      : await prisma.language.findUnique({ where: { code: code!.toLowerCase() }, select: { id: true } });

    if (!language) {
      return NextResponse.json({ error: 'Language not found' }, { status: 404 });
    }

    const rows = await prisma.uiTranslation.findMany({
      where: { languageId: language.id },
      select: { key: true, value: true },
    });

    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;

    return NextResponse.json(map);
  } catch (err: any) {
    console.error('[mobile/ui-translations]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
