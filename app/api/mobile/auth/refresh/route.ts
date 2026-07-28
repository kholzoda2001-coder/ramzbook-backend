import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  apiError,
  hashRefreshToken,
  signAccessTokenForUser,
  REFRESH_TTL_MS,
} from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { refreshToken?: string };
    const incoming = body.refreshToken?.trim();

    if (!incoming) {
      return Response.json({ error: 'refreshToken is required.' }, { status: 400 });
    }

    const tokenHash = hashRefreshToken(incoming);
    const row = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!row || row.revokedAt || row.expiresAt <= new Date()) {
      return Response.json({ error: 'Invalid refresh token.' }, { status: 401 });
    }

    // ⚠️ БЕ-ROTATION (қасдан): пештар ҳар refresh токени навро месохт ва
    // кӯҳнаро бекор мекард. Дар мобил ин хатари ҷиддӣ дошт — агар барнома
    // байни «сервер чарх зад» ва «клиент нигоҳ дошт» кушта шавад (ё ду дархост
    // ҳамзамон refresh кунанд), клиент бо токени бекоршуда мемонад → logout-и
    // ногаҳонӣ. Ҳамон токенро бармегардонем ва танҳо мӯҳлаташро ба пеш
    // мекашем (sliding) — пас ин мусобиқа умуман вуҷуд надорад ва корбари
    // фаъол ҳеҷ гоҳ logout намешавад.
    const accessToken = signAccessTokenForUser(row.user.id);
    await prisma.refreshToken.update({
      where: { id: row.id },
      data: { expiresAt: new Date(Date.now() + REFRESH_TTL_MS) },
    });

    return Response.json({
      user: { id: row.user.id, name: row.user.name, email: row.user.email },
      accessToken,
      refreshToken: incoming,
    });
  } catch (err) {
    console.error('[auth/refresh]', err);
    return apiError('Failed to refresh token');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
