/**
 * POST /api/admin/users/[id]/status   { isActive: boolean }
 *
 * Манъ кардан / баргардонидани дастрасии як хонанда.
 *
 * ⚠️ Манъ ВОҚЕӢ аст, на байрақи ороишӣ: `lib/accountBlock.ts` ҳамон майдонро
 * дар ҳар чор нуқтаи додани токен месанҷад (парол, Google/Telegram, OTP,
 * refresh). Ҳангоми манъ ҳамаи `RefreshToken`-ҳои корбар бекор карда
 * мешаванд, то ҷаласаи кушода ҳам зуд бимирад.
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  try {
    const body = await req.json().catch(() => ({}));
    const isActive = (body as { isActive?: unknown }).isActive;
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: '`isActive` (boolean) лозим аст' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
    if (!user) return NextResponse.json({ error: 'Корбар ёфт нашуд' }, { status: 404 });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive },
      select: { id: true, isActive: true },
    });

    let revoked = 0;
    if (!isActive) {
      const res = await prisma.refreshToken.updateMany({
        where: { userId: id, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      revoked = res.count;
    }

    return NextResponse.json({ ok: true, isActive: updated.isActive, revokedSessions: revoked });
  } catch (err: any) {
    console.error('[admin/users/[id]/status]', err?.message);
    return NextResponse.json({ error: err?.message ?? 'Хатои сервер' }, { status: 500 });
  }
}
