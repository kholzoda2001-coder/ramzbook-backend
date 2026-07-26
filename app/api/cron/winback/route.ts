import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPushToUser, isPushConfigured } from '@/lib/push';

/**
 * GET /api/cron/winback
 *
 * Вақти ҷадвалӣ (Vercel Cron, ҳаррӯза) — корбарони ғайрифаъолро баргардонад.
 * Барои ҳар ҳадди рӯз (3/7/14/30) корбароне, ки маҳз он қадар рӯз ғайрифаъоланд
 * (lastActiveAt дар тирезаи 1-рӯза), як push-и мувофиқ мегиранд — то ба ҳар кас
 * дар як ҳад танҳо ЯК бор паём равад (на ҳаррӯза спам).
 *
 * Ҳимоя: Vercel cron сарлавҳаи `Authorization: Bearer <CRON_SECRET>` мефиристад.
 */
export const dynamic = 'force-dynamic';

const MS_DAY = 86_400_000;

// Матнҳо (ҳоло тоҷикӣ — бозори асосӣ; тарҷумаи ru/en баъдтар илова мешавад).
const MESSAGES: Record<number, { title: string; body: string }> = {
  3: { title: 'Дилтанг шудем! 🔥', body: 'Стрикатро гум накун — имрӯз ҳамагӣ 5 дақиқа дарс хон.' },
  7: { title: 'Як ҳафта нашуд 📚', body: 'Забонатро фаромӯш накун — биё, аз ҷои монда давом кунем!' },
  14: { title: 'Пазмонат шудем 😔', body: 'Ду ҳафта гузашт. Биё баргард — ҳатто 2 дақиқа кофист.' },
  30: { title: 'Биё баргард! 🎁', body: 'Як моҳ шуд. Дарси имрӯзаатро хон ва аз нав оғоз кун.' },
};

function windowFor(days: number) {
  const now = Date.now();
  return { gte: new Date(now - (days + 1) * MS_DAY), lt: new Date(now - days * MS_DAY) };
}

export async function GET(req: Request) {
  // Ҳимояи cron.
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

  const results: Record<string, number> = {};
  let totalSent = 0;

  for (const days of [3, 7, 14, 30]) {
    const msg = MESSAGES[days];
    const win = windowFor(days);
    // Танҳо корбарони дорои token — бе он push маъно надорад.
    const users = await prisma.user.findMany({
      where: { lastActiveAt: win, deviceTokens: { some: {} } },
      select: { id: true },
      take: 2000,
    });

    let sent = 0;
    for (const u of users) {
      try {
        const r = await sendPushToUser(u.id, msg.title, msg.body, { type: 'winback', days: String(days) });
        sent += r.sent;
      } catch (_) {/* як корбар набояд тамоми job-ро вайрон кунад */}
    }
    results[`day${days}`] = sent;
    totalSent += sent;
  }

  return NextResponse.json({ ok: true, totalSent, ...results });
}
