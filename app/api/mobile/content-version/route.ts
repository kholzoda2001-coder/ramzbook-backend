import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * GET /api/mobile/content-version
 *
 * Part of the hybrid cache system: the app caches admin-driven content
 * (courses/lessons/words/grammar/…) on-device for hours, to cut server load.
 * This endpoint is the cheap "has anything changed?" check the app polls on
 * every open — a single AppSetting row, not the actual content. `lib/prisma.ts`
 * bumps this row's `updatedAt` on every write to a content model. If the
 * returned version differs from what the app has stored locally, it
 * invalidates its cache and refetches; otherwise its existing TTL cache keeps
 * serving with zero extra load on this endpoint or the content tables.
 */
export async function GET() {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: 'content_version' } });
    // No content write has happened since this system was deployed yet — 0 is
    // a safe "always considered stale" sentinel so a first-ever check on the
    // client still forces a real fetch rather than trusting an empty cache.
    const version = row ? row.updatedAt.getTime() : 0;
    return NextResponse.json({ version });
  } catch (err: any) {
    console.error('[mobile/content-version]', err);
    return NextResponse.json({ error: err?.message ?? 'Server error' }, { status: 500 });
  }
}
