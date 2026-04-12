import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const DEFAULT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_purposes_only';
const SECRET_KEY = new TextEncoder().encode(DEFAULT_SECRET);

export async function signAdminToken(username: string): Promise<string> {
  const token = await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h') // 24-hour session
    .sign(SECRET_KEY);
  
  return token;
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'admin' ? payload : null;
  } catch (error) {
    return null; /* Invalid or expired */
  }
}

export async function setAdminCookie(token: string) {
  cookies().set('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export function clearAdminCookie() {
  cookies().delete('admin_token');
}
