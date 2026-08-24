import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isPushConfigured, sendPushToUser } from '@/lib/push';
import { buildMessage, loadLearnerContext, type BuiltinCampaign } from '@/lib/pushMessages';
import { renderCampaignText, type CampaignTexts } from '@/lib/pushTemplate';

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

    // Ду манбаи матн:
    //  • `campaignId` дода шуд → матни ВОҚЕИИ кампанияи панел. Маҳз ҳамин
    //    чизеро, ки хонандагон мегиранд, аввал ба ХУДИ админ мефиристад —
    //    бе ин «санҷиш» матни дигарро месанҷид ва хатои имло ё ҷойгузори
    //    холӣ танҳо баъди рафтан ба садҳо нафар маълум мешуд;
    //  • вагарна → кампанияи дохилии код (санҷиши худи қубур).
    let msg: { title: string; body: string; data: Record<string, string> };
    let source = `builtin:${campaign}`;

    if (body?.campaignId) {
      const c = await prisma.pushCampaign.findUnique({ where: { id: String(body.campaignId) } });
      if (!c) return NextResponse.json({ error: 'Кампания ёфт нашуд' }, { status: 404 });
      const rendered = renderCampaignText((c.texts ?? {}) as CampaignTexts, ctx, {
        // Ҳамон минтақаи вақте, ки иҷрои воқеӣ истифода мебарад — вагарна
        // {countdown} дар санҷиш ва дар фиристодани воқеӣ фарқ мекунад.
        tzOffsetMin: ctx.tzOffsetMin ?? c.tzOffsetMin,
        countdownToHour: c.countdownToHour,
      });
      if (!rendered || !rendered.title) {
        return NextResponse.json(
          { error: `Кампанияи «${c.name}» барои забони «${ctx.lang}» матн надорад` },
          { status: 400 },
        );
      }
      msg = {
        title: rendered.title,
        body: rendered.body,
        data: { type: 'campaign', campaign: c.id, campaignName: c.name, route: c.route, lang: ctx.lang },
      };
      source = `campaign:${c.name}`;
    } else {
      msg = buildMessage(campaign, ctx);
    }

    if (preview) {
      return NextResponse.json({
        ok: true,
        preview: true,
        source,
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
      source,
      user: { id: user.id, name: user.name, email: user.email, devices: user._count.deviceTokens },
      result,
      message: msg,
    });
  } catch (error: any) {
    console.error('Admin push test error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 500 });
  }
}
