import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import {
  generateRefreshToken,
  hashRefreshToken,
  signAccessTokenForUser,
} from '@/lib/auth';
import { getClientIp, getCountryFromIp } from '@/lib/geo';

const REFRESH_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      identifier?: string;
      email?: string;
      password?: string;
    };

    const rawIdentifier = (body.identifier ?? body.email ?? '').trim();
    const password = body.password ?? '';

    if (!rawIdentifier || !password) {
      return Response.json({ error: 'Email/Phone and password are required.' }, { status: 400 });
    }

    const isEmail = rawIdentifier.includes('@');
    let phone: string | null = null;

    if (!isEmail) {
      // Normalize phone number
      phone = rawIdentifier.replace(/[\s\-()]/g, '');
      if (!phone.startsWith('+')) phone = '+' + phone;
    }

    // Build search conditions - support both old (synthetic email) and new (real phone field) formats
    type UserRow = { id: string; name: string; email: string | null; phone: string | null; passwordHash: string };
    let user: UserRow | null = null;

    if (isEmail) {
      // Direct email lookup
      user = await prisma.user.findUnique({
        where: { email: rawIdentifier.toLowerCase() },
        select: { id: true, name: true, email: true, phone: true, passwordHash: true },
      });
    } else if (phone) {
      // 1) Try real phone field (new registrations)
      user = await prisma.user.findUnique({
        where: { phone },
        select: { id: true, name: true, email: true, phone: true, passwordHash: true },
      });

      if (!user) {
        // 2) Fallback: old registrations stored phone as synthetic email {digits}@ramzbook.tj
        const digits = phone.replace('+', '');
        user = await prisma.user.findUnique({
          where: { email: `${digits}@ramzbook.tj` },
          select: { id: true, name: true, email: true, phone: true, passwordHash: true },
        });
      }
    }

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

    // ── IP Geolocation (fire-and-forget, never blocks the response) ──────────
    // Only update when the country is not yet stored, to avoid hammering the
    // free ip-api.com service on every login.
    const clientIp = getClientIp(req);
    getCountryFromIp(clientIp).then((countryCode) => {
      if (countryCode) {
        prisma.user
          .update({
            where: { id: user!.id },
            data: { country: countryCode },
          })
          .catch(() => { /* ignore — not critical */ });
      }
    }).catch(() => { /* ignore */ });
    // ─────────────────────────────────────────────────────────────────────────

    return Response.json({
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone },
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
