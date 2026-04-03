import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiError, hashRefreshToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { refreshToken?: string };
    const refreshToken = body.refreshToken?.trim();

    if (!refreshToken) {
      return Response.json({ ok: true });
    }

    const tokenHash = hashRefreshToken(refreshToken);
    await prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error('[auth/logout]', err);
    return apiError('Failed to logout');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
