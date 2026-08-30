import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { freeBookCount } from '@/lib/libraryAccess';
import { MAX_HEARTS_FREE } from '@/lib/hearts';
import { loadAiSettingsConfig } from '@/lib/ai/ai-settings';

export const dynamic = 'force-dynamic';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * GET /api/mobile/paywall-facts
 *
 * Every FACTUAL claim the Pro paywall makes, except the prices — those come
 * from Google Play on the device and never touch this server.
 *
 * ── Why an endpoint and not constants in the app ───────────────────────────
 * The paywall states things as fact: "24 books, 9 courses, 60+ audio",
 * "Free: 3 books", "Free: 3 AI messages a day", "Free: 5 lives". Every one of
 * those is either admin-editable (the AI limit lives in AppSetting and can be
 * changed from the admin panel without a release) or grows on its own as
 * content is added.
 *
 * A number baked into the app becomes a false advertisement the moment the
 * thing it describes changes — and unlike a stale price, nothing crashes and
 * nobody notices. Counting live makes the claim true by construction.
 *
 * `freeBooks` in particular is read from the same module that ENFORCES access
 * (lib/libraryAccess.ts), so the comparison row cannot promise something the
 * shelf will not honour.
 *
 * A "course" is a video course; books and templates both count as books,
 * matching how the shelf groups them.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const items = await prisma.libraryItem.findMany({
      where: { isActive: true },
      select: { id: true, type: true, isPremium: true, order: true, createdAt: true },
    });

    const count = (...types: string[]) =>
      items.filter((i) => types.includes(i.type)).length;

    // The AI limit is admin-editable at runtime; read it rather than assume it.
    let freeAiPerDay = 0;
    try {
      freeAiPerDay = (await loadAiSettingsConfig(prisma)).freeLimit;
    } catch {
      // Settings unreadable — the app hides the AI comparison row rather than
      // print a number we are not sure about.
      freeAiPerDay = -1;
    }

    return NextResponse.json(
      {
        library: {
          books: count('book', 'template'),
          courses: count('video'),
          audio: count('audio'),
          freeBooks: freeBookCount(items),
        },
        freeHearts: MAX_HEARTS_FREE,
        freeAiPerDay,
      },
      { headers: CORS },
    );
  } catch (error) {
    console.error('[mobile/paywall-facts]', error);
    // The paywall hides the affected blocks when facts are missing — a shorter
    // screen beats invented numbers.
    return NextResponse.json({ error: 'Failed to load paywall facts' }, { status: 500, headers: CORS });
  }
}
