import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  apiError,
  generateRefreshToken,
  hashRefreshToken,
  signAccessTokenForUser,
} from '@/lib/auth';

const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

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

    const nextRefreshToken = generateRefreshToken();
    const accessToken = signAccessTokenForUser(row.user.id);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { id: row.id },
        data: { revokedAt: new Date() },
      }),
      prisma.refreshToken.create({
        data: {
          userId: row.user.id,
          tokenHash: hashRefreshToken(nextRefreshToken),
          expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
        },
      }),
    ]);

    return Response.json({
      user: { id: row.user.id, name: row.user.name, email: row.user.email },
      accessToken,
      refreshToken: nextRefreshToken,
    });
  } catch (err) {
    console.error('[auth/refresh]', err);
    return apiError('Failed to refresh token');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
