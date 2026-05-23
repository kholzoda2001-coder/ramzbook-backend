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
      identifier?: string;
      email?: string;
      password?: string;
    };

    const rawIdentifier = (body.identifier ?? body.email ?? '').trim().toLowerCase();
    const password = body.password ?? '';

    if (!rawIdentifier || !password) {
      return Response.json({ error: 'Email/Phone and password are required.' }, { status: 400 });
    }

    let email = '';
    let phone: string | null = null;

    if (rawIdentifier.includes('@')) {
      email = rawIdentifier;
    } else {
      phone = rawIdentifier.replace(/[\s\-()]/g, '');
      if (!phone.startsWith('+')) phone = '+' + phone;
    }

    // Build OR conditions - phone users are stored with synthetic email: {phone_digits}@ramzbook.tj
    const orConditions: object[] = [];
    if (email) {
      orConditions.push({ email });
    } else if (phone) {
      // Phone was stored as synthetic email during registration
      const digits = phone.replace('+', '');
      orConditions.push({ email: `${digits}@ramzbook.tj` });
      // Also try without leading country code variation
      orConditions.push({ email: `${rawIdentifier.replace(/[^0-9]/g, '')}@ramzbook.tj` });
    }
    // Fallback: try rawIdentifier as-is (covers edge cases)
    if (orConditions.length === 0) orConditions.push({ email: rawIdentifier });

    const user = await prisma.user.findFirst({
      where: { OR: orConditions },
      select: { id: true, name: true, email: true, passwordHash: true },
    });

    if (!user) {
      return Response.json({ error: 'Invalid credentials.' }, { status: 401 });
    }

    // Guard: social-only accounts have no password
    if (!user.passwordHash) {
      return Response.json({ error: 'This account uses social login. Please use Google or Telegram.' }, { status: 401 });
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
  } catch (err: any) {
    console.error('[auth/login]', err);
    return Response.json({ error: 'Failed to login', details: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204 });
}
