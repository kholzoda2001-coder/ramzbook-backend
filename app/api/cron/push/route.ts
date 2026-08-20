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
 * ⚠️ Vercel Hobby cron-ро танҳо ҲАРРӮЗА иҷро мекунад. Барои ҷадвали дақиқ
 * ё Vercel Pro лозим аст (`*​/15 * * * *`), ё як пингер аз берун
 * (cron-job.org / GitHub Actions) ҳамин URL-ро ҳар 15 дақиқа занад.
 *
 * Ҳимоя: `Authorization: Bearer <CRON_SECRET>`.
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization') ?? '';
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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
