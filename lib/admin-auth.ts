import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const DEFAULT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_purposes_only';
const SECRET_KEY = new TextEncoder().encode(DEFAULT_SECRET);

export async function signAdminToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);
  return token;
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

export function setAdminTokenOnResponse(res: NextResponse, token: string) {
  res.cookies.set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });
}

export function clearAdminTokenOnResponse(res: NextResponse) {
  res.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

// Legacy helpers that use the next/headers cookies store (server components / middleware)
export function setAdminCookie(token: string) {
  try {
    cookies().set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });
  } catch {
    // cookies() may throw outside a request context – safe to ignore
  }
}

export function clearAdminCookie() {
  try {
    cookies().delete('admin_token');
  } catch {
    // safe to ignore
  }
}

