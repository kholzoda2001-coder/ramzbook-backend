import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isPushConfigured } from '@/lib/push';

/**
 * POST /api/mobile/push/register
 * Body: { token: string, platform?: 'android' | 'ios', enabled?: boolean }
 *
 * Барномаи мобилӣ баъди гирифтани FCM token инро даъват мекунад. Token-ро
 * ба корбари ҷорӣ пайваст мекунем (upsert — агар token аллакай бошад, соҳибашро
 * нав мекунем: як дастгоҳ метавонад аз аккаунт ба аккаунт гузарад).
 *
 * `enabled` — ҳолати тугмаи «Огоҳномаҳо» дар профил. Онро ҳамин ҷо синхрон
 * мекунем, то сервер ҳеҷ гоҳ ба корбари хомӯшкарда push нафиристад.
 */
export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const token = (body?.token ?? '').toString().trim();
    const platform = body?.platform === 'ios' ? 'ios' : 'android';
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    await prisma.deviceToken.upsert({
      where: { token },
      create: { token, platform, userId: user.id },
      update: { userId: user.id, platform },
    });

    // Ҳолати тугма + минтақаи вақти дастгоҳ.
    const patch: Record<string, unknown> = {};
    if (typeof body?.enabled === 'boolean') patch.pushEnabled = body.enabled;
    const tz = Number(body?.tzOffsetMin);
    if (Number.isFinite(tz) && tz >= -840 && tz <= 840) patch.tzOffsetMin = Math.round(tz);
    if (Object.keys(patch).length > 0) {
      await prisma.user.update({ where: { id: user.id }, data: patch });
    }

    // ⚠️ ҚАЛБИ МАСЪАЛА: барнома аз рӯи ҳамин ҷавоб қарор мекунад, ки
    // ёдрасонҳои МАҲАЛЛӢ-ро хомӯш кунад ё не. Пеш он танҳо «token сабт шуд»-ро
    // медид ва локалиҳоро мекушт — вале агар сервер калиди Firebase надошта
    // бошад, ҳеҷ push намерафт ва корбар МУТЛАҚО хомӯш мемонд. Ҳоло сервер рост
    // мегӯяд: «ман воқеан фиристода метавонам ё не».
    return NextResponse.json({ success: true, pushLive: isPushConfigured() });
  } catch (error: any) {
    console.error('Push register error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 400 });
  }
}

/**
 * DELETE /api/mobile/push/register
 * Body: { token: string }
 *
 * Ҳангоми logout даъват мешавад — вагарна push-и шахсии корбари пешина ба
 * дастгоҳе меравад, ки ӯ аллакай аз он баромадааст.
 */
export async function DELETE(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = (body?.token ?? '').toString().trim();
    if (!token) return NextResponse.json({ error: 'token required' }, { status: 400 });

    // Бе тафтиши соҳибӣ: token худаш сирри дастгоҳ аст ва танҳо худи ҳамон
    // дастгоҳ онро медонад; logout метавонад баъди беэътибор шудани сессия ояд.
    await prisma.deviceToken.deleteMany({ where: { token } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Push unregister error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 400 });
  }
}
