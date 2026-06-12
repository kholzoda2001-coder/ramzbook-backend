import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/users/leaderboard?scope=league|global
 * Real users ranked by totalXp. Returns the top 50, the current user's row
 * (with true rank even if outside the top 50), and the total player count.
 * The client shows an "alone in league" empty state when totalPlayers <= 1.
 *
 * scope="league"  → only users learning the SAME target language as the caller
 *                   (filtered by User.targetLang). Falls back to global if the
 *                   caller has no target language set yet.
 * scope="global"  → every active user (default).
 */
export async function GET(req: Request) {
  try {
    const me = await authenticate(req);
    if (!me) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const scope = new URL(req.url).searchParams.get('scope') ?? 'global';

    // For the "league" scope, restrict to same-language learners. Need the
    // caller's current target language for that.
    const meFull = await prisma.user.findUnique({
      where: { id: me.id },
      select: { targetLang: true },
    });
    const sameLangFilter =
      scope === 'league' && meFull?.targetLang
        ? { targetLang: meFull.targetLang }
        : {};

    const baseWhere = {
      isActive: true,
      NOT: { name: { startsWith: 'Test User' } },
      ...sameLangFilter,
    };

    const select = {
      id: true,
      name: true,
      avatarUrl: true,
      totalXp: true,
      streak: true,
      level: true,
      isPremium: true,
      country: true,
      nativeLang: true,
    } as const;

    /** Map UI language code → ISO country code (best-effort fallback). */
    const langToCountry: Record<string, string> = {
      tg: 'TJ', // Тоҷикӣ → Tajikistan
      ru: 'RU', // Русский → Russia
      uz: 'UZ', // Oʻzbek → Uzbekistan
      en: 'US', // English → USA
      kk: 'KZ', // Қазақ → Kazakhstan
      ky: 'KG', // Кыргыз → Kyrgyzstan
      fa: 'AF', // دری → Afghanistan
      tr: 'TR', // Türkçe → Turkey
      de: 'DE', ar: 'SA', fr: 'FR', es: 'ES', zh: 'CN', ja: 'JP',
    };

    const top = await prisma.user.findMany({
      where: baseWhere,
      orderBy: [{ totalXp: 'desc' }, { createdAt: 'asc' }],
      take: 50,
      select,
    });

    const toRow = (u: typeof top[number], rank: number) => ({
      rank,
      id: u.id,
      name: u.name,
      avatarUrl: u.avatarUrl,
      xp: u.totalXp,
      streak: u.streak,
      level: u.level,
      isPro: u.isPremium,
      isYou: u.id === me.id,
      // Use geo-detected country first, fall back to nativeLang-derived country.
      country: u.country ?? langToCountry[u.nativeLang] ?? null,
    });

    const users = top.map((u, i) => toRow(u, i + 1));

    // Current user's row — compute true rank if they fell outside the top 50.
    // Rank is computed within the same scope (same-language for "league").
    let you = users.find((u) => u.isYou) ?? null;
    if (!you) {
      const meRow = await prisma.user.findUnique({ where: { id: me.id }, select });
      if (meRow) {
        const ahead = await prisma.user.count({
          where: { ...baseWhere, totalXp: { gt: meRow.totalXp } },
        });
        you = toRow(meRow, ahead + 1);
      }
    }

    const totalPlayers = await prisma.user.count({ where: baseWhere });

    return NextResponse.json({ users, you, totalPlayers });
  } catch (error) {
    console.error('[leaderboard]', error);
    return NextResponse.json({ error: 'Failed to load leaderboard' }, { status: 500 });
  }
}
