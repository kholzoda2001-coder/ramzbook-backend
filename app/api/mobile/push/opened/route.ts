import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/mobile/push/opened
 * Body: { sendId: string }
 *
 * Барнома инро ҳангоми ТАПи корбар ба огоҳӣ мезанад. `sendId` худи ID-и сатри
 * `PushSend` аст, ки сервер ҳангоми фиристодан ба payload гузошта буд.
 *
 * ЧАРО лозим: бе ин мо танҳо «фиристодем»-ро медонем. Firebase Analytics
 * рӯйдоди `push_open` дорад, вале он ба сатри мушаххаси таърих баста нест —
 * яъне «кадом матн кор кард» маълум намешавад. Акнун CTR-и ҳар КАМПАНИЯ
 * бевосита аз базаи худамон ҳисоб мешавад.
 *
 * Бе authenticate қасдан: `sendId` як cuid-и тасодуфист, ки танҳо ба ҳамон
 * дастгоҳ фиристода шудааст, ва тап метавонад пеш аз тайёр шудани сессия ояд
 * (барнома аз ҳолати пӯшида кушода шуд). Бадтарин зарари сӯиистифода — як
 * сатри таърих «кушодашуда» қайд мешавад.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const sendId = (body?.sendId ?? '').toString().trim();
    if (!sendId) return NextResponse.json({ error: 'sendId required' }, { status: 400 });

    // `updateMany` — то ID-и нодуруст хато напартояд, ва то тапи такрорӣ
    // вақти АВВАЛИНИ кушоданро аз нав нанависад.
    const r = await prisma.pushSend.updateMany({
      where: { id: sendId, openedAt: null },
      data: { openedAt: new Date() },
    });

    return NextResponse.json({ success: true, updated: r.count });
  } catch (error: any) {
    console.error('Push opened error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 400 });
  }
}
