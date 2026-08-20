import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET/POST /api/mobile/push/settings
 *
 * Тугмаи «Огоҳномаҳо» дар профил. Пеш он ТАНҲО дар телефон нигоҳ дошта мешуд
 * (SharedPreferences), бинобар ин сервер онро намедонист ва win-back push ба
 * корбари хомӯшкарда ҳам мерафт. Акнун ҳолат серверист.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const user = await authenticate(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const u = await prisma.user.findUnique({
    where: { id: user.id },
    select: { pushEnabled: true },
  });
  return NextResponse.json({ enabled: u?.pushEnabled ?? true });
}

export async function POST(req: Request) {
  try {
    const user = await authenticate(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    if (typeof body?.enabled !== 'boolean') {
      return NextResponse.json({ error: 'enabled (boolean) required' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { pushEnabled: body.enabled },
    });

    return NextResponse.json({ success: true, enabled: body.enabled });
  } catch (error: any) {
    console.error('Push settings error:', error);
    return NextResponse.json({ error: error.message || 'Failed' }, { status: 400 });
  }
}
