/**
 * Verifies Apple Sign-In `identityToken` (JWT) against Apple’s JWKS.
 *
 * Configure `APPLE_CLIENT_ID` to match the JWT `aud` claim:
 * - Native iOS/macOS: usually the app **Bundle ID**
 * - Web / other: often the **Services ID**
 * Comma-separate multiple values if you use more than one client (e.g. iOS + web).
 */

import * as jose from 'jose';

const APPLE_ISSUER = 'https://appleid.apple.com';

const jwks = jose.createRemoteJWKSet(new URL(`${APPLE_ISSUER}/auth/keys`));

export type AppleJwtPayload = { sub: string; email?: string };

export async function verifyAppleIdentityToken(
  idToken: string,
  audiences: string[],
): Promise<AppleJwtPayload> {
  if (audiences.length === 0) {
    throw new Error('APPLE_CLIENT_ID (audience) is required');
  }

  const { payload } = await jose.jwtVerify(idToken, jwks, {
    issuer: APPLE_ISSUER,
    audience: audiences.length === 1 ? audiences[0]! : audiences,
  });

  const sub = typeof payload.sub === 'string' ? payload.sub : '';
  if (!sub) {
    throw new Error('Apple JWT missing sub');
  }

  const email =
    typeof payload.email === 'string' ? payload.email.toLowerCase() : undefined;

  return { sub, email };
}
