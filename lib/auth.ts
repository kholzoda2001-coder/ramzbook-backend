import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import crypto from 'crypto';

type MobileJwtPayload = JwtPayload & {
  sub?: string;
  userId?: string;
  tokenType?: 'access';
};

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }
  return secret;
}

function getBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token?.trim()) return null;
  return token.trim();
}

function verifyAccessUserIdFromBearer(req: NextRequest): string | null {
  const token = getBearerToken(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, getJwtSecret(), {
      issuer: 'ramz-api',
      audience: 'ramz-mobile',
    }) as MobileJwtPayload;
    if (payload.tokenType !== 'access') return null;
    const userId = payload.sub ?? payload.userId;
    return userId?.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Strict auth helper for protected routes.
 * Returns null when token is missing/invalid.
 */
export function requireUserId(req: NextRequest): string | null {
  return verifyAccessUserIdFromBearer(req);
}

/**
 * Backward-compatible user identity helper for non-protected endpoints.
 */
export function getUserId(req: NextRequest): string {
  const tokenUserId = verifyAccessUserIdFromBearer(req);
  if (tokenUserId) return tokenUserId;

  const headerUserId = req.headers.get('x-user-id');
  if (headerUserId?.trim()) return headerUserId.trim();

  const queryUserId = req.nextUrl.searchParams.get('userId');
  if (queryUserId?.trim()) return queryUserId.trim();

  return 'guest';
}

/**
 * Issues short-lived access token.
 */
export function signAccessTokenForUser(userId: string): string {
  return jwt.sign(
    { userId, tokenType: 'access' },
    getJwtSecret(),
    {
      subject: userId,
      expiresIn: '15m',
      issuer: 'ramz-api',
      audience: 'ramz-mobile',
    }
  );
}

/**
 * Backward-compat alias used by older endpoint code.
 */
export const signTokenForUser = signAccessTokenForUser;

export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function unauthorized(message = 'Unauthorized') {
  return Response.json({ error: message }, { status: 401 });
}

/**
 * Standard JSON error response for unhandled exceptions.
 */
export function apiError(message: string, status = 500) {
  return Response.json({ error: message }, { status });
}
