import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireUserId, unauthorized } from '@/lib/auth';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const userId = requireUserId(req);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, phone: true, vipExpiresAt: true },
    });

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404, headers: CORS });
    }

    return Response.json({ user }, { status: 200, headers: CORS });
  } catch (err) {
    console.error('[auth/profile GET]', err);
    return Response.json(
      { error: 'Failed to fetch profile' },
      { status: 500, headers: CORS },
    );
  }
}

/**
 * PATCH /api/mobile/auth/profile
 * Authorization: Bearer <accessToken>
 * Body: { name: string }
 */
export async function PATCH(req: NextRequest) {
  const userId = requireUserId(req);
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: CORS });
  }

  try {
    const body = (await req.json()) as { name?: string };
    const name = (body?.name ?? '').trim();
    if (name.length < 2) {
      return Response.json({ error: 'Name must be at least 2 characters.' }, { status: 400, headers: CORS });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { name },
      select: { id: true, name: true, email: true, phone: true, vipExpiresAt: true },
    });

    return Response.json({ user }, { status: 200, headers: CORS });
  } catch (err) {
    console.error('[auth/profile]', err);
    return Response.json(
      { error: 'Failed to update profile' },
      { status: 500, headers: CORS },
    );
  }
}
