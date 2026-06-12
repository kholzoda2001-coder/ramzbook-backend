/**
 * lib/geo.ts
 * Lightweight IP → country-code lookup using the free ip-api.com service.
 * No API key required for non-commercial use (≤45 req/min).
 *
 * Returns an ISO 3166-1 alpha-2 country code (e.g. "TJ", "UZ", "RU")
 * or null when the lookup fails or the IP is private/loopback.
 */

const PRIVATE_IP_PATTERNS = [
  /^127\./,           // loopback
  /^10\./,            // private class A
  /^192\.168\./,      // private class C
  /^172\.(1[6-9]|2\d|3[01])\./,  // private class B
  /^::1$/,            // IPv6 loopback
  /^fc|^fd/,          // IPv6 unique local
];

function isPrivateIp(ip: string): boolean {
  return PRIVATE_IP_PATTERNS.some((re) => re.test(ip));
}

/**
 * Extract the real client IP from Next.js request headers.
 * Handles proxies (Vercel, Cloudflare, Nginx) via x-forwarded-for.
 */
export function getClientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    // x-forwarded-for can be a comma-separated list; take the first (original client)
    const first = xff.split(',')[0].trim();
    if (first) return first;
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return null;
}

/**
 * Look up the country code for a given IP address.
 * Returns null on private IPs, localhost, or any network error.
 */
export async function getCountryFromIp(ip: string | null): Promise<string | null> {
  if (!ip) return null;
  if (isPrivateIp(ip)) return null;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode,status`, {
      signal: AbortSignal.timeout(3000), // 3-second timeout — never block the login flow
    });

    if (!res.ok) return null;

    const data = (await res.json()) as { status: string; countryCode?: string };

    if (data.status === 'success' && data.countryCode) {
      return data.countryCode; // e.g. "TJ"
    }

    return null;
  } catch {
    // Network error, timeout, parse error — silently ignore
    return null;
  }
}
