import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { checkAndUpdatePremium } from '@/lib/premium';
import { unlockedIds } from '@/lib/libraryAccess';

export const dynamic = 'force-dynamic';

/**
 * How long an item wears the «НАВ» pill.
 *
 * Derived from `createdAt` rather than stored as a flag: a flag someone has to
 * clear is a flag nobody clears, and a shelf where everything is "new" says
 * nothing. Three weeks is long enough that a learner who opens the app
 * fortnightly still sees what arrived since their last visit.
 */
const NEW_FOR_DAYS = 21;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/**
 * GET /api/mobile/library[?type=book&lang=en]
 *
 * Every active library item, newest-ordered within its type. Books/templates
 * carry a page count so the app can show "12 саҳифа" without loading content.
 *
 * Items with no `targetLang` are shown to everyone; a `lang` filter keeps those
 * plus the ones for that language — a learner should never lose general
 * material by picking a language.
 *
 * ── Забони МОДАРӢ (2026-09-02) ─────────────────────────────────────────────
 * Раф аз рӯи `nativeLang`-и хонанда БУРИДА мешавад: китобе, ки админ бо
 * тавзеҳи русӣ илова кардааст, ба тоҷикзабон ҳеҷ гоҳ намерасад ва баръакс.
 * Ин филтр дар СЕРВЕР аст, на дар барнома: забони модарӣ дар ҳисоб нигоҳ
 * дошта мешавад (`User.nativeLang`, коди забон) ва барнома набояд қарор
 * қабул кунад, ки чиро дидан мумкин аст.
 *
 * Ду муҳофиз, то раф ногаҳон холӣ нашавад:
 *   • `nativeLang = null` дар воҳид = «барои ҳама» (ҳамон қоидаи `targetLang`);
 *     ҳамаи мазмуни то имрӯз маҳз ҳамин аст.
 *   • агар дар ҳисоб забони модарӣ набошад, филтр УМУМАН татбиқ намешавад.
 *
 * ── Access ─────────────────────────────────────────────────────────────────
 * This endpoint used to answer 403 to every non-premium user, which made the
 * whole shelf invisible to exactly the people we want to sell to: they could
 * not see what they were missing, and the per-item `isPremium` flag was dead
 * code. Now the LIST is open to any signed-in learner and each item carries a
 * `locked` flag; the content endpoint (`[id]`) is what actually withholds the
 * pages. See lib/libraryAccess.ts for the rule.
 *
 * Still auth-gated: reading progress, bookmarks and entitlement all hang off an
 * account, and an anonymous shelf would have nowhere to record them.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    const isPremium = await checkAndUpdatePremium(userId);

    const sp = req.nextUrl.searchParams;
    const type = sp.get('type');
    const lang = sp.get('lang');

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: { nativeLang: true },
    });
    const native = (me?.nativeLang ?? '').trim().toLowerCase();

    const items = await prisma.libraryItem.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
        ...(lang ? { OR: [{ targetLang: lang }, { targetLang: null }] } : {}),
        // ⚠️ Дар `AND`-и ҷудо: ду калиди `OR` дар ЯК объект ҳамдигарро
        // мепӯшонанд — дуюмаш аввалро хомӯшона нест мекунад.
        ...(native
          ? { AND: [{ OR: [{ nativeLang: native }, { nativeLang: null }] }] }
          : {}),
      },
      orderBy: [{ type: 'asc' }, { order: 'asc' }, { createdAt: 'desc' }],
      select: {
        id: true, type: true, title: true, author: true, description: true,
        coverUrl: true, coverWord: true, coverSubtitle: true,
        level: true, targetLang: true, nativeLang: true, mediaUrl: true,
        durationMin: true, rating: true, isPremium: true,
        order: true, createdAt: true,
        _count: { select: { pages: true } },
      },
    });

    const open = unlockedIds(items, isPremium);
    const newCutoff = Date.now() - NEW_FOR_DAYS * 24 * 60 * 60 * 1000;

    return NextResponse.json(
      {
        isPremium,
        items: items.map(({ _count, order, createdAt, ...it }) => ({
          ...it,
          pageCount: _count.pages,
          isNew: createdAt.getTime() >= newCutoff,
          // The ONE field the app gates on. Derived server-side so the client
          // cannot decide for itself that a book is open.
          locked: !open.has(it.id),
        })),
      },
      { headers: CORS },
    );
  } catch (error) {
    console.error('[mobile/library]', error);
    // An empty shelf is a better failure than a broken screen.
    return NextResponse.json({ items: [] }, { headers: CORS });
  }
}
