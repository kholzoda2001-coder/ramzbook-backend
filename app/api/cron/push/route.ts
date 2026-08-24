import { NextResponse } from 'next/server';
import { runDueCampaigns } from '@/lib/pushRunner';
import { isPushConfigured } from '@/lib/push';
import { ensureDefaultCampaigns } from '@/lib/pushDefaults';

/**
 * GET /api/cron/push — ЯГОНА кори ҷадвалии push.
 *
 * Ҳар 15 дақиқа даъват мешавад ва он кампанияҳоеро иҷро мекунад, ки вақташон
 * расидааст (вақти маҳаллии ҳар кампания, мас. 19:00 ва 21:30 бо соати Душанбе).
 *
 * ЧАРО ҳар 15 дақиқа, на ҳаррӯза: админ дар панел ҳар вақтро интихоб карда
 * метавонад, пас cron бояд зуд-зуд «пурсад». Кампанияи бевақт хомӯшона мегузарад
 * — ҳар кадом танҳо ЯК бор дар як рӯзи маҳаллии худаш иҷро мешавад (`lastRunAt`).
 *
 * ⚠️ ҲОЛАТИ ВОҚЕИИ ҶАДВАЛ (24.08.2026):
 *  • GitHub Actions (`.github/workflows/push-cron.yml`) — муҳаррики пешбинишуда,
 *    вале дар ин аккаунт ҚУЛФ аст: «your account is locked due to a billing
 *    issue». Ҳамаи 186 иҷро дар 2 сония афтодааст. То ҳалли пардохт кор намекунад.
 *  • Пас ҳоло ду cron-и Vercel Hobby боқӣ мемонанд (`vercel.json`): 14:00 UTC
 *    (≈19:00 Душанбе) ва 15:00 UTC (≈20:00). Hobby cron-ро дар дохили ҲАМОН
 *    СОАТ мепаронад, на дақиқа ба дақиқа — барои ҳамин `DUE_WINDOW_MIN` васеъ
 *    аст ва кампанияи 19:00 то 20:30 «вақташ расида» ҳисоб мешавад.
 *  • Ин ду tick огоҳии нарми 19:00 ва win-back-и 20:00-ро мегиранд. Огоҳии
 *    ҚАВИИ 21:30 ва кампанияҳои дӯст/гарав то барқарор шудани пингери
 *    15-дақиқаӣ НАМЕДАВАНД (GitHub Actions ё cron-job.org ё Vercel Pro).
 *
 * Ҳимоя: `Authorization: Bearer <CRON_SECRET>`.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  // ҚУЛФИ ҲАТМӢ. Пештар «агар секрет бошад» буд — яъне бе секрет endpoint
  // барои ҲАМА кушода буд ва ҳар кас метавонист кампанияҳоро дар вақти дилхоҳ
  // ба кор андозад ва лимити рӯзонаи корбаронро сӯзонад. Ҳоло: набудани секрет
  // = қулф, на кушод.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'CRON_SECRET нест — endpoint қулф аст' },
      { status: 503 },
    );
  }
  const auth = req.headers.get('authorization') ?? '';
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!isPushConfigured()) {
    return NextResponse.json({ ok: false, reason: 'FIREBASE_SERVICE_ACCOUNT нест' });
  }

  try {
    // Агар ҳанӯз ягон кампания набошад (аввалин deploy), оғозиҳоро месозад.
    await ensureDefaultCampaigns();

    const now = new Date();
    const results = await runDueCampaigns(now);
    const totalSent = results.reduce((a, r) => a + r.sent, 0);

    return NextResponse.json({
      ok: true,
      at: now.toISOString(),
      ran: results.length,
      totalSent,
      results: results.map((r) => ({
        name: r.name,
        matched: r.matched,
        sent: r.sent,
        skipped: r.skipped,
        failed: r.failed,
      })),
    });
  } catch (e: any) {
    console.error('[cron/push]', e);
    return NextResponse.json({ ok: false, error: e.message || 'Failed' }, { status: 500 });
  }
}
