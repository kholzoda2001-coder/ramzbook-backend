import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPushConfigured, sendPushToUser } from '@/lib/push';
import { buildMessage, loadLearnerContext, type BuiltinCampaign } from '@/lib/pushMessages';

/**
 * /api/admin/push/test — санҷиши push (ҳимоя: middleware-и админ).
 *
 * GET  — вазъи система: калид ҳаст ё не, чанд дастгоҳ сабт шудааст.
 * POST — ба ЯК корбари мушаххас паёми ШАХСӢ мефиристад ва натиҷаи АСЛИИ
 *        FCM-ро бармегардонад. Бе ин endpoint ҳар нокомии push хомӯшона
 *        нобуд мешавад ва мо намедонем push зинда аст ё не.
 *
 * Body: { email? | userId?, campaign?, preview?: boolean, force?: boolean }
 *   campaign — winback_3 | winback_7 | winback_14 | winback_30 | streak_risk |
 *              hearts_full | test  (пешфарз: test)
 *   preview  — танҳо матнро бармегардонад, ҳеҷ чиз намефиристад
 *   force    — маҳдудияти «1 push дар 20 соат» ва тугмаи профилро сарфи назар
 *              мекунад (пешфарз: true, чун ин санҷиш аст)
 */
export const dynamic = 'force-dynamic';

const CAMPAIGNS: BuiltinCampaign[] = [
  'winback_3', 'winback_7', 'winback_14', 'winback_30',
  'streak_risk', 'hearts_full', 'test',
];

export async function GET() {
  const [tokens, users] = await Promise.all([
    prisma.deviceToken.count(),
    prisma.user.count({ where: { deviceTokens: { some: {} } } }),
  ]);
  const enabled = await prisma.user.count({
    where: { deviceTokens: { some: {} }, pushEnabled: true },
  });

  return NextResponse.json({
    configured: isPushConfigured(),
    cronSecretSet: !!process.env.CRON_SECRET,
    deviceTokens: tokens,
    usersWithToken: users,
    usersReachable: enabled,
    campaigns: CAMPAIGNS,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const campaign: BuiltinCampaign = CAMPAIGNS.includes(body?.campaign)
      ? body.campaign
      : 'test';
    const preview = body?.preview === true;
    const force = body?.force !== false; // пешфарз: true

    // Корбарро аз рӯи userId ё email меёбем.
    const where = body?.userId
      ? { id: String(body.userId) }
      : body?.email
        ? { email: String(body.email).trim().toLowerCase() }
        : null;
    if (!where) {
      return NextResponse.json({ error: 'userId ё email лозим' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where,
      select: { id: true, name: true, email: true, pushEnabled: true, _count: { select: { deviceTokens: true } } },
    });
    if (!user) return NextResponse.json({ error: 'Корбар ёфт нашуд' }, { status: 404 });

    const ctx = await loadLearnerContext(user.id);
    if (!ctx) return NextResponse.json({ error: 'Контекст сохта нашуд' }, { status: 500 });
    const msg = buildMessage(campaign, ctx);

    if (preview) {
      return NextResponse.json({
        ok: true,
        preview: true,
        user: { id: user.id, name: user.name, email: user.email, pushEnabled: user.pushEnabled, devices: user._count.deviceTokens },
        context: ctx,
        message: msg,
      });
    }

    if (!isPushConfigured()) {
      return NextResponse.json({
        ok: false,
        reason: 'FIREBASE_SERVICE_ACCOUNT дар Vercel гузошта нашудааст',
        message: msg,
      });
    }

    const result = await sendPushToUser(user.id, msg.title, msg.body, msg.data, {
      ignorePreference: force,
      ignoreFrequencyCap: force,
    });

    return NextResponse.json({
      ok: result.sent > 0,
      user: { id: user.id, name: user.name, email: user.email, devices: user._count.deviceTokens },
      result,
      message: msg,
    });
  } catch (error: any) {
    console.error('Admin push test error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
