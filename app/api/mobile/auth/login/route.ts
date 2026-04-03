import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
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
    const body = await req.json() as {
      email?: string;
      password?: string;
    };

    const email = body.email?.trim().toLowerCase() ?? '';
    const password = body.password ?? '';

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, passwordHash: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    const accessToken = signAccessTokenForUser(user.id);
    const refreshToken = generateRefreshToken();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email },
      accessToken,
      refreshToken,
    });
  } catch (err) {
    console.error('[auth/login]', err);
    return apiError('Failed to login');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
