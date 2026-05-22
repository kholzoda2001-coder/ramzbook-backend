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
      name?: string;
      identifier?: string;
      email?: string;
      password?: string;
    };

    const name = body.name?.trim() ?? '';
    const rawIdentifier = (body.identifier ?? body.email ?? '').trim().toLowerCase();
    const password = body.password ?? '';

    if (name.length < 2) {
      return Response.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
    }
    if (rawIdentifier.length < 5) {
      return Response.json({ error: 'Valid email or phone number is required.' }, { status: 400 });
    }
    if (password.length < 8) {
      return Response.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    let email = '';
    let phone: string | null = null;

    if (rawIdentifier.includes('@')) {
      email = rawIdentifier;
    } else {
      phone = rawIdentifier.replace(/[\s\-()]/g, '');
      if (!phone.startsWith('+')) phone = '+' + phone;
      email = `${phone.replace('+', '')}@ramzbook.tj`;
    }

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true }
    });
    
    if (existing) {
      return Response.json({ error: 'This email or phone number is already registered.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true },
    });

    const accessToken = signAccessTokenForUser(user.id);
    const refreshToken = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashRefreshToken(refreshToken),
        expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
      },
    });

    return Response.json({ user, accessToken, refreshToken }, { status: 201 });
  } catch (err) {
    console.error('[auth/register]', err);
    return apiError('Failed to register user');
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
