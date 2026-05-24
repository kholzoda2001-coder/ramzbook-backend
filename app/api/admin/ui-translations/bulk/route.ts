import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/ui-translations/bulk
 * Body: { languageId: string, translations: { [key]: value } }
 * Upserts every key/value pair for the language (used by CSV import).
 */
export async function POST(req: NextRequest) {
  try {
    const { languageId, translations } = await req.json() as {
      languageId?: string;
      translations?: Record<string, string>;
    };

    if (!languageId || !translations || typeof translations !== 'object') {
      return NextResponse.json({ error: 'languageId and translations object are required' }, { status: 400 });
    }

    const entries = Object.entries(translations).filter(([k]) => k.trim());
    if (entries.length === 0) {
      return NextResponse.json({ error: 'No translation keys provided' }, { status: 400 });
    }

    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.uiTranslation.upsert({
          where: { languageId_key: { languageId, key: key.trim() } },
          create: { languageId, key: key.trim(), value: String(value ?? '') },
          update: { value: String(value ?? '') },
        })
      )
    );

    return NextResponse.json({ success: true, count: entries.length });
  } catch (err: any) {
    console.error('[admin/ui-translations/bulk POST]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
