import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';
import { checkAndUpdatePremium } from '@/lib/premium';
import { ownedItemIds } from '@/lib/entitlements';
import { buildEntitlementsSnapshot } from '@/lib/libraryEntitlements';

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
 * GET /api/mobile/library/entitlements
 *
 * Тасвири ЯКҶОЯИ ҳуқуқҳои хонанда: PRO (нақша, мӯҳлат, озмоиш) ва ID-и
 * воҳидҳои ХАРИДАШУДА. Барои нишони PRO, «Харидҳои ман» ва КЭШИ офлайн.
 *
 *   {
 *     serverTime, isPremium, proPlan, proExpiresAt,
 *     inTrial, trialEndsAt, trialUsed, ownedItemIds
 *   }
 *
 * ⚠️ Ин танҳо ҳолатро ХОНДА медиҳад. Кушодани мазмун ҳамоно аз
 * `/library` ва `/library/[id]` (lib/libraryAccess.ts) мегузарад; барнома
 * набояд аз рӯи ин тасвир мазмун кушояд. Нарх ва хариди воҳид дар ин ҷо НЕСТ
 * (танҳо версияи веб).
 *
 * Хато → 500, на «холӣ»: тасвири холӣ мебуд, ки барнома онро ҳамчун «ҳеҷ
 * чиз харида нашудааст» хонда, кэши дурустро нест мекард.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = requireUserId(req);
    if (!userId) return unauthorized('Missing or invalid Bearer token.');

    // Мӯҳлати гузашта дар ин ҷо ба «не» мегардад (ва ҳисоб паст мешавад).
    const isPremiumNow = await checkAndUpdatePremium(userId);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isPremium: true,
        premiumPlan: true,
        premiumExpiresAt: true,
        subscriptionEndsAt: true,
        trialEndsAt: true,
        trialUsed: true,
      },
    });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404, headers: CORS });
    }

    const owned = await ownedItemIds(userId);

    return NextResponse.json(
      buildEntitlementsSnapshot({
        user,
        isPremiumNow,
        ownedItemIds: owned,
        now: new Date(),
      }),
      // Ҳолати ҳисоб кэш намешавад: ҳамон лаҳза рост бояд бошад.
      { headers: { ...CORS, 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[mobile/library/entitlements]', error);
    return NextResponse.json(
      { error: 'Failed to load entitlements' },
      { status: 500, headers: CORS },
    );
  }
}
