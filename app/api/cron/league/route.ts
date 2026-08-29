import { NextResponse } from 'next/server';
import { catchUpClosedWeeks } from '@/lib/league';

/**
 * GET /api/cron/league — бастани ҳафтаи лига.
 *
 * ⚠️ ҲОЛАТИ ВОҚЕИИ ҶАДВАЛ: ин route ҳоло ба ҲЕҶ ҷадвал пайваст НЕСТ.
 *  • Vercel Hobby танҳо ДУ cron медиҳад ва ҳарду дар `vercel.json` аллакай ба
 *    `/api/cron/push` банданд (14:00 ва 15:00 UTC).
 *  • GitHub Actions дар ин аккаунт бо сабаби пардохт қулф аст (ниг. шарҳи
 *    `/api/cron/push`).
 *
 * Пас бастани ҳафта ТАНБАЛ кор мекунад — ҳамон намунаи `StreakWager` ва
 * `FriendStreak`: `catchUpClosedWeeks()` аз `awardXp` ва аз
 * `GET /users/league/{me,result}` даъват мешавад.
 *
 * Ин route барои он ҳаст, ки ҳар лаҳза ҷадвал пайдо шавад (Vercel Pro,
 * GitHub Actions, cron-job.org), танҳо як сатр дар `vercel.json` илова
 * мешавад ва дигар ҳеҷ чиз тағйир намехоҳад. Функсия идемпотентӣ аст, пас
 * ҷадвал ва роҳи танбал бехатар ПАҲЛӮИ ҲАМ кор мекунанд.
 *
 * Ҷадвали пешниҳодшуда: `0 0 * * 6` (шанбе 00:00 UTC).
 */
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req: Request) {
  // Ҳамон қулфи `/api/cron/push`: набудани секрет = ҚУЛФ, на кушод. Вагарна
  // ҳар кас метавонист ҳафтаро пеш аз вақт бандад.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 });
  }
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const closed = await catchUpClosedWeeks();
    return NextResponse.json({ ok: true, cohortsClosed: closed });
  } catch (error) {
    console.error('[cron/league]', error);
    return NextResponse.json({ error: 'Rollover failed' }, { status: 500 });
  }
}
